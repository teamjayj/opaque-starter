import { OpaqueCredentialStore } from '..';

export class InMemoryOpaqueCredentialStore implements OpaqueCredentialStore {
    protected cache: Map<string, Uint8Array>;

    constructor() {
        this.cache = new Map();
    }

    public async store(
        credentialId: string,
        credentialFile: Uint8Array
    ): Promise<void> {
        if (this.cache.has(credentialId)) {
            throw new Error(`${credentialId} is already set in store`);
        }

        this.cache.set(credentialId, credentialFile);
    }

    public async get(credentialId: string): Promise<Uint8Array> {
        const value = this.cache.get(credentialId);

        if (value == null) {
            throw new Error(`${credentialId} is undefined in store`);
        }

        return value;
    }
}
