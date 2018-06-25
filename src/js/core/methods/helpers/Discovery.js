/* @flow */
'use strict';
import EventEmitter from 'events';
import Account, { create as createAccount } from '../../../account';
import BlockBook from '../../../backend';
import { cloneCoinInfo, getAccountCoinInfo } from '../../../data/CoinInfo';
import {
    isSegwitPath,
    getPathFromIndex
} from '../../../utils/pathUtils';
import type { CoinInfo } from 'flowtype';
import type { HDNodeResponse } from 'flowtype/trezor';
import type {
    AccountInfo
} from 'hd-wallet';

export type DiscoveryOptions = {
    +getHDNode: (path: Array<number>, coinInfo: ?CoinInfo) => Promise<HDNodeResponse>;
    +backend: BlockBook,
    +coinInfo: CoinInfo,
    +loadInfo?: boolean;
    +limit?: number;

    discoverLegacyAccounts?: boolean,
    legacyAddressOnSegwit?: boolean,
    accounts?: Array<Account>,
    discoveryLimit?: number,
    onStart?: (newAccount: Account, allAccounts: Array<Account>) => void,
    onError?: (error: Error) => void,
}

export default class Discovery extends EventEmitter {

    accounts: Array<Account> = [];
    interrupted: boolean = false;
    completed: boolean = false;
    options: DiscoveryOptions;
    loadInfo: boolean = true;
    limit: number = 10;
    disposer: () => void;

    constructor(options: DiscoveryOptions) {
        super();
        if (typeof options.loadInfo === 'boolean') {
            this.loadInfo = options.loadInfo;
        }
        if (typeof options.limit === 'number') {
            this.limit = 10;
        }
        this.options = options;
    }

    async start(): Promise<void> {
        while (!this.completed) {
            const prevAccount: ?Account = this.accounts[ this.accounts.length - 1];
            let index = prevAccount ? prevAccount.id + 1 : 0;
            const coinInfo = cloneCoinInfo(prevAccount ? prevAccount.coinInfo : this.options.coinInfo);

            if (index >= this.limit || (this.loadInfo && prevAccount && !prevAccount.isUsed())) {
                if (!coinInfo.segwit) {
                    this.completed = true;
                    this.emit('complete', this.accounts);
                    return;
                } else {
                    coinInfo.network = this.options.coinInfo.network;
                    coinInfo.segwit = false;
                    index = 0;
                }
            }

            const path: Array<number> = getPathFromIndex(coinInfo.segwit ? 49 : 44, coinInfo.slip44, index);
            const account = await this.discoverAccount(path, getAccountCoinInfo(coinInfo, path));
        }
    }

    stop() {
        this.interrupted = !this.completed;
        if (this.disposer)
            this.disposer();
        // this.dispose();
    }

    dispose() {
        // TODO: clear up references
        delete this.accounts;
        delete this.options;
    }

    restore() {
        // check if last account was loaded
    }

    async discoverAccount(path: Array<number>, coinInfo: CoinInfo): Promise<?Account> {
        if (this.interrupted) return null;

        const node: HDNodeResponse = await this.options.getHDNode(path, coinInfo);
        if (this.interrupted) return null;

        const account = createAccount(path, node.xpub, coinInfo);
        this.accounts.push(account);
        this.emit('update', this.accounts);

        if (!this.loadInfo)
            return account;

        const info = await this.getAccountInfo(account);
        if (this.interrupted) return null;

        this.emit('update', this.accounts);

        return account;
    }

    async getAccountInfo(account: Account): Promise<AccountInfo> {
        const info = await this.options.backend.loadAccountInfo(
            account.xpub,
            // account.id > 0 && !account.coinInfo.segwit ? "xpub6CjVMW1nZaGASd9NSoQv1WXHKUAdsHqYv8hb9B8zMGz1M5eVsQmcbtBnfhsejQT3Fc43gnjU141E2JrHxwqt5QT5qTyavxBkyK1iAGHxwyN" : account.xpub,
            account.info,
            account.coinInfo,
            (progress) => {
                account.transactions = progress.transactions;
                this.emit('update', this.accounts);
            },
            (disposer) => {
                this.disposer = disposer;
            }
        )

        account.info = info;
        return info;
    }
}