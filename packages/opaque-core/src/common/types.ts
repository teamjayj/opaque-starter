export type ClientAuthFinishResponse = {
    clientRequest: Uint8Array;
    sessionKey: Uint8Array;
};

export type ServerAuthInitResponse = {
    serverResponse: Uint8Array;
    expectedAuthResult: Uint8Array;
};

export enum OpaqueCipherSuite {
    P256_SHA256,
    P384_SHA384,
    P521_SHA521,
}
