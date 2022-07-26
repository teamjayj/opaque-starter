import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';

export class OpaqueNthPartyProtocolV2 {
    protected store: Map<string, Uint8Array>;

    constructor(
        protected sodium: typeof Sodium,
        protected util: OpaqueNthPartyUtilV2
    ) {
        this.store = new Map();
    }

    protected set(key: string, value: Uint8Array): void {
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
