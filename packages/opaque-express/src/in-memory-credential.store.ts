import { OpaqueCredentialStore } from '@jayj/pake';
import NodeCache from 'node-cache';

export class InMemoryOpaqueCredentialStore implements OpaqueCredentialStore {
    protected cache: NodeCache;

    constructor() {
        this.cache = new NodeCache();
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
        const value = this.cache.get<Uint8Array>(credentialId);

        if (value == null) {
            throw new Error(`${credentialId} is undefined in store`);
        }

        return value;
    }
}
