import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';

export class OpaqueNthPartyProtocolV2 {
    protected store: Record<string, string>;

    constructor(
        protected sodium: typeof Sodium,
        protected util: OpaqueNthPartyUtilV2
    ) {
        this.store = {};
    }

    protected set(key: string, value: string): void {
        this.store[key] = value;
    }

    protected get(key: string): string {
        return this.store[key];
    }
}
