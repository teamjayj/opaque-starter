import {
    Config,
    getOpaqueConfig,
    OpaqueClient,
    OpaqueID,
    RegistrationResponse,
} from '@cloudflare/opaque-ts';
import {
    bufferToHexString,
    hexStringToArray,
    PakeClientDriver,
    SerialData,
} from '@jayj/pake';

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
    ): Promise<SerialData> {
        const request = await this.client.registerInit(password);

        if (request instanceof Error) {
            throw new Error(`Client failed to registerInit: ${request}`);
        }

        return bufferToHexString(request.serialize());
    }

    public async registerFinish(
        responseData: SerialData,
        userId: string,
        serverId: string
    ): Promise<SerialData> {
        const response = RegistrationResponse.deserialize(
            this.config,
            hexStringToArray(responseData)
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

        return bufferToHexString(record.serialize());
    }

    public async authenticateAsClient(
        password: string,
        userId: string
    ): Promise<void> {}

    public getConfig(): Readonly<Config> {
        return this.config;
    }
}
