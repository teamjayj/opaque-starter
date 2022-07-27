import {
    Config,
    getOpaqueConfig,
    OpaqueClient,
    OpaqueID,
    OpaqueServer,
} from '@cloudflare/opaque-ts';
import { PakeServerDriver } from '@jayj/pake';
import { OpaqueCloudflareUtil } from '../common';

export class OpaqueCloudflareServerDriver implements PakeServerDriver {
    private config: Readonly<Config>;
    private util: OpaqueCloudflareUtil;
    private server: OpaqueServer | undefined;

    constructor(opaqueId: OpaqueID) {
        this.config = getOpaqueConfig(opaqueId);
        this.util = new OpaqueCloudflareUtil(this.config);
    }

    async initialize(): Promise<void> {
        const oprfSeed = this.util.getRandomOprfSeed();
        const keyPair = await this.util.generateKeyPair();
        this.server = new OpaqueServer(this.config, oprfSeed, keyPair);
    }

    async registerAsServer(): Promise<void> {
        // await this.server?.registerInit(request);
    }

    async authenticateAsServer(): Promise<void> {}
}
