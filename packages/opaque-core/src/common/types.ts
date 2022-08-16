export type ClientAuthFinishResponse = {
    clientRequest: Uint8Array;
    sessionKey: Uint8Array;
};

export type ServerAuthInitResponse = {
    serverResponse: Uint8Array;
    expectedAuthResult: Uint8Array;
};
