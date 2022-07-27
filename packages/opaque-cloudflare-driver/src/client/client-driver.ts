import {
    Config,
    getOpaqueConfig,
    OpaqueClient,
    OpaqueID,
    RegistrationResponse,
    RegistrationRecord,
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

    public async initialize(): Promise<void> {}

    public async registerInit(
        password: string,
        userId: string
    ): Promise<Serializable> {
        const request = await this.client.registerInit(password);

        if (request instanceof Error) {
            throw new Error(`Client failed to registerInit: ${request}`);
        }

        return request;
    }

    public async registerFinish(
        data: Uint8Array,
        serverPublicKey: Uint8Array,
        serverId: string,
        userId: string
    ) {
        const response = new RegistrationResponse(
            this.config,
            data,
            serverPublicKey
        );

        const record = await this.client.registerFinish(
            response,
            serverId,
            userId
        );

        if (record instanceof Error) {
            throw new Error(`Client failed to registerFinish: ${record}`);
        }
    }

    public async authenticateAsClient(
        password: string,
        userId: string
    ): Promise<void> {}

    public getConfig(): Readonly<Config> {
        return this.config;
    }
}
