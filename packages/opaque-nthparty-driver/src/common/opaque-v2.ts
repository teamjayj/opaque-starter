import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';

export class OpaqueNthPartyProtocolV2 {
    protected store: Record<string, Uint8Array>;

    constructor(
        protected sodium: typeof Sodium,
        protected util: OpaqueNthPartyUtilV2
    ) {
        this.store = {};
    }

    protected set(key: string, value: Uint8Array): void {
        this.store[key] = value;
    }

    protected get(key: string): Uint8Array {
        return this.store[key];
    }
}
