type Opaque<K, T> = T & { __TYPE__: K };

/**
 * Hexadecimal string representation.
 */
export type HexString = Opaque<'HexString', string>;

/**
 * Types for serial data. Currently only supports hex strings.
 */
export type SerialData = HexString;

export type ClientAuthFinishResponse = {
    clientRequest: SerialData;
    sessionKey: SerialData;
};

export type ServerAuthInitResponse = {
    serverResponse: SerialData;
    expectedAuthResult: SerialData;
};
