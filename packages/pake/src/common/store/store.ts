export interface OpaqueCredentialStore {
    store(credentialId: string, credentialFile: Uint8Array): Promise<void>;

    get(credentialId: string): Promise<Uint8Array>;
}

export interface OpaqueSessionStore {
    store(
        sessionId: string,
        expectedAuthResult: Uint8Array,
        ttl?: number
    ): Promise<void>;

    get(sessionId: string): Promise<Uint8Array>;
}
