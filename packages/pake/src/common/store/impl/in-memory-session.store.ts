import { OpaqueSessionStore } from '..';
import NodeCache from 'node-cache';

export class InMemoryOpaqueSessionStore implements OpaqueSessionStore {
    protected cache: NodeCache;

    constructor() {
        this.cache = new NodeCache();
    }

    public async store(
        sessionId: string,
        expectedAuthResult: Uint8Array,
        ttl: number
    ): Promise<void> {
        if (this.cache.has(sessionId)) {
            throw new Error(`${sessionId} is already set in store`);
        }

        this.cache.set(sessionId, expectedAuthResult, ttl);
    }

    public async get(sessionId: string): Promise<Uint8Array> {
        const value = this.cache.get<Uint8Array>(sessionId);

        if (value == null) {
            throw new Error(`${sessionId} is undefined in store`);
        }

        return value;
    }
}
