export interface OpaqueCredentialStore {
    /**
     * Persists credential data to store.
     *
     * @param credentialId - credential identifier
     * @param credentialFile - credential file from server's `registerFinish` step.
     */
    store(credentialId: string, credentialFile: Uint8Array): Promise<void>;

    /**
     * Retrieves credential file from an ID.
     *
     * @param credentialId - credential identifier
     *
     * @returns credential file of client
     */
    get(credentialId: string): Promise<Uint8Array>;
}
