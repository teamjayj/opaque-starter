import {
    Config,
    getOpaqueConfig,
    KE2,
    OpaqueClient,
    OpaqueID,
    RegistrationResponse,
} from '@cloudflare/opaque-ts';
import { ClientAuthFinishResponse, PakeClientDriver } from '@jayj/pake';

export class OpaqueCloudflareClientDriver implements PakeClientDriver {
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
    ): Promise<Uint8Array> {
        const request = await this.client.registerInit(password);

        if (request instanceof Error) {
            throw new Error(`Client failed to registerInit: ${request}`);
        }

        return Uint8Array.from(request.serialize());
    }

    public async registerFinish(
        serverResponseData: Uint8Array,
        userId: string,
        serverId: string
    ): Promise<Uint8Array> {
        const response = RegistrationResponse.deserialize(
            this.config,
            Array.from(serverResponseData)
        );

        const registrationResult = await this.client.registerFinish(
            response,
            serverId,
            userId
        );

        if (registrationResult instanceof Error) {
            throw new Error(
                `Client failed to registerFinish: ${registrationResult}`
            );
        }

        const { record } = registrationResult;

        return Uint8Array.from(record.serialize());
    }

    public async authInit(password: string): Promise<Uint8Array> {
        const request = await this.client.authInit(password);

        if (request instanceof Error) {
            throw new Error(`Client failed to authInit: ${request}`);
        }

        return Uint8Array.from(request.serialize());
    }

    public async authFinish(
        serverResponseData: Uint8Array,
        userId: string,
        serverId: string
    ): Promise<ClientAuthFinishResponse> {
        const ke2 = KE2.deserialize(
            this.config,
            Array.from(serverResponseData)
        );

        const authResult = await this.client.authFinish(ke2, serverId, userId);

        if (authResult instanceof Error) {
            throw new Error(`Client failed to authFinish: ${authResult}`);
        }

        const { ke3, session_key } = authResult;

        return {
            clientRequest: Uint8Array.from(ke3.serialize()),
            sessionKey: Uint8Array.from(session_key),
        };
    }

    public getConfig(): Readonly<Config> {
        return this.config;
    }
}
