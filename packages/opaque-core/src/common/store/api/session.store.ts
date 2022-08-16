/**
 * Session store should be time-sensitive.
 */
export interface OpaqueSessionStore {
    /**
     * Persists expected auth result to store.
     *
     * @param sessionId - session identifier
     * @param expectedAuthResult - expected auth data result from server's `authInit` step
     * @param ttl - time-to-live in milliseconds of session data
     */
    store(
        sessionId: string,
        expectedAuthResult: Uint8Array,
        ttl?: number
    ): Promise<void>;

    /**
     * Retrieves session data from an ID.
     *
     * @param sessionId - session identifier
     *
     * @returns expected auth data of session
     */
    get(sessionId: string): Promise<Uint8Array>;
}
