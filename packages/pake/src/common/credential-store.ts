export interface CredentialStore {
    store(credentialFile: Uint8Array): Promise<void>;

    get(credentialId: string): Promise<Uint8Array>;
}
