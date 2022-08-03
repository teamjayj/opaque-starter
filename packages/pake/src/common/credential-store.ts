export interface CredentialStore {
    store(credentialId: string, credentialFile: Uint8Array): Promise<void>;

    get(credentialId: string): Promise<Uint8Array>;
}
