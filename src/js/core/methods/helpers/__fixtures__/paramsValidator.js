export const validateParams = [
    {
        description: 'array',
        type: 'array',
        value: [],
        success: true,
        allowEmpty: true,
    },
    {
        description: 'array invalid (empty)',
        type: 'array',
        value: [],
    },
    {
        description: 'array-buffer',
        type: 'array-buffer',
        value: new ArrayBuffer(0),
        success: true,
    },
    {
        description: 'array-buffer invalid',
        type: 'array-buffer',
        value: Buffer.from('foo'),
    },
    {
        description: 'array-buffer invalid',
        type: 'array-buffer',
        value: [],
    },
    {
        description: 'array-buffer invalid',
        type: 'array-buffer',
        value: 'foo',
    },
    {
        description: 'array-buffer invalid',
        type: 'array-buffer',
        value: 0,
    },
    {
        description: 'uint valid (zero string)',
        type: 'uint',
        value: '0',
        success: true,
    },
    {
        description: 'uint valid (zero number)',
        type: 'uint',
        value: 0,
        success: true,
    },
    {
        description: 'uint valid (positive string)',
        type: 'uint',
        value: '10',
        success: true,
    },
    {
        description: 'uint valid (positive number)',
        type: 'uint',
        value: 10,
        success: true,
    },
    {
        description: 'negative string uint valid (allowNegative)',
        type: 'uint',
        allowNegative: true,
        value: '-1',
        success: true,
    },
    {
        description: 'negative number uint valid (allowNegative)',
        type: 'uint',
        allowNegative: true,
        value: -1,
        success: true,
    },
    {
        description: 'uint invalid (decimal number)',
        type: 'uint',
        value: 10.1,
    },
    {
        description: 'uint invalid (decimal string)',
        type: 'uint',
        value: '10.1',
    },
    {
        description: 'uint invalid (negative number)',
        type: 'uint',
        value: -1,
    },
    {
        description: 'uint invalid (negative string)',
        type: 'uint',
        value: '-1',
    },
    {
        description: 'uint invalid not safe integer',
        type: 'uint',
        value: Number.MAX_SAFE_INTEGER + 2,
    },
    {
        description: 'uint invalid leading zeros',
        type: 'uint',
        value: '01',
    },
    {
        description: 'uint invalid digits',
        type: 'uint',
        value: '123f',
    },
    {
        description: 'uint invalid type',
        type: 'uint',
        value: true,
    },
    {
        description: 'not required param without value (null)',
        type: 'number',
        value: null,
        success: true,
    },
    {
        description: 'not required param without value (undefined)',
        type: 'string',
        value: null,
        success: true,
    },
    {
        description: 'required param without type and false negative value (0)',
        required: true,
        value: 0,
        success: true,
    },
    {
        description: 'required param without type and false negative value (false)',
        required: true,
        value: false,
        success: true,
    },
    {
        description: 'required param without value (null)',
        required: true,
        value: null,
    },
    {
        description: 'required param without value (undefined)',
        required: true,
        value: undefined,
    },
    {
        description: 'param with union of types (string)',
        type: ['string', 'boolean', 'number'],
        value: 'true',
        success: true,
    },
    {
        description: 'param with union of types (boolean)',
        type: ['string', 'boolean', 'number'],
        value: true,
        success: true,
    },
    {
        description: 'param with union of types (invalid value)',
        type: ['string', 'boolean', 'number', 'array', 'array-buffer'],
        value: Buffer.from('00'),
    },
];

const DEFAULT_RANGE = {
    '1': { min: '1.0.0', max: '0' },
    '2': { min: '2.0.0', max: '0' },
};

const DEFAULT_COIN_INFO = {
    support: { trezor1: '1.6.2', trezor2: '2.1.0' },
    shortcut: 'btc',
    type: 'bitcoin',
};

const EMPTY_CONFIG = {
    supportedFirmware: [],
};

export const getFirmwareRange = [
    {
        description: 'default range. coinInfo and config.json data not found',
        config: EMPTY_CONFIG,
        params: ['signTransaction', null, DEFAULT_RANGE],
        result: DEFAULT_RANGE,
    },
    {
        description: 'range from coinInfo',
        config: EMPTY_CONFIG,
        params: ['signTransaction', DEFAULT_COIN_INFO, DEFAULT_RANGE],
        result: { '1': { min: '1.6.2', max: '0' }, '2': { min: '2.1.0', max: '0' } },
    },
    {
        description: 'coinInfo without support',
        config: EMPTY_CONFIG,
        params: ['signTransaction', { shortcut: 'btc', type: 'bitcoin' }, DEFAULT_RANGE],
        result: { '1': { min: '0', max: '0' }, '2': { min: '0', max: '0' } },
    },
    {
        description: 'coinInfo without T1 support',
        config: EMPTY_CONFIG,
        params: [
            'signTransaction',
            { support: { trezor1: null, trezor2: '2.1.0' }, shortcut: 'btc', type: 'bitcoin' },
            DEFAULT_RANGE,
        ],
        result: { '1': { min: '0', max: '0' }, '2': { min: '2.1.0', max: '0' } },
    },
    {
        description: 'coinInfo without T2 support',
        config: EMPTY_CONFIG,
        params: [
            'signTransaction',
            { support: { trezor1: '1.6.2', trezor2: null }, shortcut: 'btc', type: 'bitcoin' },
            DEFAULT_RANGE,
        ],
        result: { '1': { min: '1.6.2', max: '0' }, '2': { min: '0', max: '0' } },
    },
    {
        description: 'coinInfo support is lower than default',
        config: EMPTY_CONFIG,
        params: [
            'signTransaction',
            DEFAULT_COIN_INFO,
            { '1': { min: '1.10.0', max: '0' }, '2': { min: '2.4.0', max: '0' } },
        ],
        result: { '1': { min: '1.10.0', max: '0' }, '2': { min: '2.4.0', max: '0' } },
    },
    {
        description: 'range from config.json (by coinType)',
        config: {
            supportedFirmware: [
                // this one is ignored, different excludedMethod
                { coinType: 'bitcoin', methods: ['showAddress'], min: ['1.11.0', '2.5.0'] },
                { coinType: 'bitcoin', min: ['1.10.0', '2.4.0'] },
                { coin: 'btc', min: ['1.11.0', '2.5.0'] },
            ],
        },
        params: ['signTransaction', DEFAULT_COIN_INFO, DEFAULT_RANGE],
        result: { '1': { min: '1.10.0', max: '0' }, '2': { min: '2.4.0', max: '0' } },
    },
    {
        description: 'range from config.json (by coin as string)',
        config: {
            supportedFirmware: [
                // this one is ignored, different excludedMethod
                { coin: 'btc', methods: ['showAddress'], min: ['1.11.0', '2.5.0'] },
                { coin: 'btc', min: ['1.10.0', '2.4.0'] },
            ],
        },
        params: ['signTransaction', DEFAULT_COIN_INFO, DEFAULT_RANGE],
        result: { '1': { min: '1.10.0', max: '0' }, '2': { min: '2.4.0', max: '0' } },
    },
    {
        description: 'range from config.json (by coin as array)',
        config: {
            supportedFirmware: [
                // this one is ignored, different excludedMethod
                { coin: ['btc'], methods: ['showAddress'], min: ['1.11.0', '2.5.0'] },
                { coin: ['btc'], min: ['1.10.0', '2.4.0'] },
            ],
        },
        params: ['signTransaction', DEFAULT_COIN_INFO, DEFAULT_RANGE],
        result: { '1': { min: '1.10.0', max: '0' }, '2': { min: '2.4.0', max: '0' } },
    },
    {
        description: 'range from config.json (by methods)',
        config: {
            supportedFirmware: [
                // this one is ignored, no data
                { min: ['1.11.0', '2.5.0'] },
                // this one is ignored, different excludedMethod
                { coin: ['btc'], methods: ['showAddress'], min: ['1.11.0', '2.5.0'] },
                // this one is ignored because of coin (not btc)
                { coin: ['ltc'], methods: ['signTransaction'], min: ['1.11.0', '2.5.0'] },
                // this one is ignored, different excludedMethod
                { coinType: 'bitcoin', methods: ['showAddress'], min: ['1.11.0', '2.5.0'] },
                { methods: ['signTransaction'], min: ['1.10.0', '2.4.0'] },
            ],
        },
        params: ['signTransaction', DEFAULT_COIN_INFO, DEFAULT_RANGE],
        result: { '1': { min: '1.10.0', max: '0' }, '2': { min: '2.4.0', max: '0' } },
    },
    {
        description: 'range from config.json (by capabilities)',
        config: {
            supportedFirmware: [
                // this one is ignored, no data
                { min: ['1.11.0', '2.5.0'] },
                // this one is ignored, different excludedMethod
                { coin: ['btc'], methods: ['showAddress'], min: ['1.11.0', '2.5.0'] },
                // this one is ignored because of coin (not btc)
                { coin: ['ltc'], methods: ['signTransaction'], min: ['1.11.0', '2.5.0'] },
                // this one is ignored, different excludedMethod
                { coinType: 'bitcoin', methods: ['showAddress'], min: ['1.11.0', '2.5.0'] },
                { capabilities: ['decreaseOutput'], min: ['1.10.0', '2.4.0'] },
            ],
        },
        params: ['decreaseOutput', DEFAULT_COIN_INFO, DEFAULT_RANGE],
        result: { '1': { min: '1.10.0', max: '0' }, '2': { min: '2.4.0', max: '0' } },
    },
    {
        description: 'range from config.json is lower than coinInfo',
        config: {
            supportedFirmware: [{ methods: ['signTransaction'], min: ['1.6.2', '2.1.0'] }],
        },
        params: [
            'signTransaction',
            { support: { trezor1: '1.10.0', trezor2: '2.4.0' }, shortcut: 'btc', type: 'bitcoin' },
            DEFAULT_RANGE,
        ],
        result: { '1': { min: '1.10.0', max: '0' }, '2': { min: '2.4.0', max: '0' } },
    },
    {
        description: 'range from config.json using max',
        config: {
            supportedFirmware: [{ methods: ['signTransaction'], max: ['1.10.0', '2.4.0'] }],
        },
        params: ['signTransaction', DEFAULT_COIN_INFO, DEFAULT_RANGE],
        result: { '1': { min: '1.6.2', max: '1.10.0' }, '2': { min: '2.1.0', max: '2.4.0' } },
    },
    {
        description: 'range from config.json using max (values lower than default)',
        config: {
            supportedFirmware: [{ methods: ['signTransaction'], max: ['1.0.1', '2.0.1'] }],
        },
        params: [
            'signTransaction',
            DEFAULT_COIN_INFO,
            {
                '1': { min: '1.0.0', max: '1.10.0' },
                '2': { min: '1.0.0', max: '2.10.0' },
            },
        ],
        result: { '1': { min: '1.6.2', max: '1.10.0' }, '2': { min: '2.1.0', max: '2.10.0' } },
    },
    // real config.json data
    {
        description: 'xrp + getAccountInfo: coinInfo range IS replaced by config.json range',
        params: [
            'getAccountInfo',
            { support: { trezor1: '1.0.1', trezor2: '2.0.1' }, shortcut: 'xrp', type: 'ripple' },
            DEFAULT_RANGE,
        ],
        result: { '1': { min: '0', max: '0' }, '2': { min: '2.1.0', max: '0' } },
    },
    {
        description: 'btc + getAccountInfo: coinInfo range IS NOT replaced by config.json range',
        params: ['getAccountInfo', null, DEFAULT_RANGE],
        result: DEFAULT_RANGE,
    },
    {
        description: 'eip1559: coinInfo range is replaced by config.json range',
        params: [
            'eip1559',
            { support: { trezor1: '1.6.2', trezor2: '2.1.0' }, shortcut: 'eth', type: 'ethereum' },
            DEFAULT_RANGE,
        ],
        result: { '1': { min: '1.8.0', max: '0' }, '2': { min: '2.1.0', max: '0' } },
    },
];
