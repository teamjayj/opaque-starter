import {
    Config,
    getOpaqueConfig,
    OpaqueClient,
    OpaqueID,
} from '@cloudflare/opaque-ts';

export class Driver {
    private config: Readonly<Config>;
    private client: OpaqueClient;

    constructor(opaqueId: OpaqueID) {
        this.config = getOpaqueConfig(opaqueId);
        this.client = new OpaqueClient(this.config);
    }
}
