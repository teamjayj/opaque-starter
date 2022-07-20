import {
    Config,
    getOpaqueConfig,
    OpaqueClient,
    OpaqueID,
} from '@cloudflare/opaque-ts';
import { PakeClientDriver, PakeServerDriver } from '@jayj/pake';

export class OpaqueCloudflareDriver
    implements PakeClientDriver, PakeServerDriver
{
    private config: Readonly<Config>;
    private client: OpaqueClient;

    constructor(opaqueId: OpaqueID) {
        this.config = getOpaqueConfig(opaqueId);
        this.client = new OpaqueClient(this.config);
    }

    async initialize(): Promise<void> {}

    async registerAsClient(password: string, userId: string): Promise<void> {}

    async authenticateAsClient(
        password: string,
        userId: string
    ): Promise<void> {}

    async registerAsServer(): Promise<void> {}

    async authenticateAsServer(): Promise<void> {}
}
