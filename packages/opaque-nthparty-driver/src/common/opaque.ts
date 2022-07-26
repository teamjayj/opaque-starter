import { OpaqueNthPartyUtil } from './opaque-util';
import Sodium from 'libsodium-wrappers-sumo';

export class OpaqueNthPartyProtocol {
    protected store: Map<string, Uint8Array>;

    constructor(
        protected sodium: typeof Sodium,
        protected util: OpaqueNthPartyUtil
    ) {
        this.store = new Map();
    }

    public set(key: string, value: Uint8Array): void {
        if (this.store.has(key)) {
            throw new Error(`${key} is already set in store`);
        }

        this.store.set(key, value);
    }

    public get(key: string): Uint8Array {
        const value = this.store.get(key);

        if (value == null) {
            throw new Error(`${key} is undefined in store`);
        }

        return value;
    }

    public clearStore(): void {
        this.store.clear();
    }
}
