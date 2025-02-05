export interface Unsuccessful {
    success: false;
    payload: { error: string; code?: string };
}

export interface Success<T> {
    success: true;
    id: number;
    payload: T;
}

export type Response<T> = Promise<Success<T> | Unsuccessful>;
export type BundledResponse<T> = Promise<Success<T[]> | Unsuccessful>;

export interface DefaultMessage {
    message: string;
}

export interface Manifest {
    appUrl: string;
    email: string;
}

export interface ConnectSettings {
    manifest?: Manifest;
    connectSrc?: string;
    debug?: boolean;
    hostLabel?: string;
    hostIcon?: string;
    popup?: boolean;
    transportReconnect?: boolean;
    webusb?: boolean;
    pendingTransportEvent?: boolean;
    lazyLoad?: boolean;
    interactionTimeout?: number;
    // internal part, not to be accepted from .init()
    origin?: string;
    configSrc: string;
    iframeSrc: string;
    popupSrc: string;
    webusbSrc: string;
    version: string;
    priority: number;
    trustedHost: boolean;
    supportedBrowser?: boolean;
    extension?: string;
    env: 'node' | 'web' | 'webextension' | 'electron' | 'react-native';
    timestamp: number;
    proxy?: string;
    useOnionLinks?: boolean;
}

export interface CommonParams {
    device?: {
        path: string;
        state?: string;
        instance?: number;
    };
    useEmptyPassphrase?: boolean;
    allowSeedlessDevice?: boolean;
    keepSession?: boolean;
    skipFinalReload?: boolean;
    useCardanoDerivation?: boolean;
}

export interface Bundle<T> {
    bundle: T[];
}
