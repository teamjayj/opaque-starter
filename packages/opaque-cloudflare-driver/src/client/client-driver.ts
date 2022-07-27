import {
    Config,
    getOpaqueConfig,
    OpaqueClient,
    OpaqueID,
} from '@cloudflare/opaque-ts';
import { Serializable } from '@cloudflare/opaque-ts/lib/src/messages';
import { PakeClientDriver } from '@jayj/pake';

export class OpaqueCloudflareClientDriver {
    private config: Readonly<Config>;
    private client: OpaqueClient;

    constructor(opaqueId: OpaqueID) {
        this.config = getOpaqueConfig(opaqueId);
        this.client = new OpaqueClient(this.config);
    }

    async initialize(): Promise<void> {}

    async registerAsClient(
        password: string,
        userId: string
    ): Promise<Serializable> {
        const request = await this.client.registerInit(password);

        if (request instanceof Error) {
            throw new Error(`Client failed to registerInit: ${request}`);
        }

        return request;
    }

    async authenticateAsClient(
        password: string,
        userId: string
    ): Promise<void> {}
}
