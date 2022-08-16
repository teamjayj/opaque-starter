export interface OpaqueSessionStore {
    store(
        sessionId: string,
        expectedAuthResult: Uint8Array,
        ttl?: number
    ): Promise<void>;

    get(sessionId: string): Promise<Uint8Array>;
}
