import { OpaqueSessionStore } from '..';

export class InMemoryOpaqueSessionStore implements OpaqueSessionStore {
    protected cache: Map<string, Uint8Array>;

    constructor() {
        this.cache = new Map();
    }

    public async store(
        sessionId: string,
        expectedAuthResult: Uint8Array,
        ttl: number
    ): Promise<void> {
        if (this.cache.has(sessionId)) {
            throw new Error(`${sessionId} is already set in store`);
        }

        this.cache.set(sessionId, expectedAuthResult);
    }

    public async get(sessionId: string): Promise<Uint8Array> {
        const value = this.cache.get(sessionId);

        if (value == null) {
            throw new Error(`${sessionId} is undefined in store`);
        }

        return value;
    }
}
