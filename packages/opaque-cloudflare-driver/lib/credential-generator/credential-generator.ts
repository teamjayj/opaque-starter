import {
    OpaqueCipherSuite,
    uint8ArrayToHexString,
} from '@teamjayj/opaque-core';
import {
    OpaqueCloudflareClientDriver,
    OpaqueCloudflareServerDriver,
} from '../../src';

export type CredentialConfig = {
    userId: string;
    plaintextPassword: string;
    serverId: string;
    cipherSuite: OpaqueCipherSuite;
};

export class CredentialGenerator {
    private client: OpaqueCloudflareClientDriver;
    private server: OpaqueCloudflareServerDriver;

    private userId: string;
    private plaintextPassword: string;
    private serverId: string;

    private credentialFile: Uint8Array | undefined;

    constructor({
        userId,
        plaintextPassword,
        cipherSuite,
        serverId,
    }: CredentialConfig) {
        this.userId = userId;
        this.plaintextPassword = plaintextPassword;
        this.serverId = serverId;
        this.client = new OpaqueCloudflareClientDriver(cipherSuite);
        this.server = new OpaqueCloudflareServerDriver(serverId, cipherSuite);
    }

    public async initialize(): Promise<void> {
        await this.client.initialize();
        await this.server.initialize();
    }

    public async generate(): Promise<void> {
        const registerResult = await this.register(
            this.userId,
            this.plaintextPassword,
            this.serverId,
            this.client,
            this.server
        );

        console.log({ register: registerResult });

        if (this.credentialFile == null) {
            return;
        }

        const authResult = await this.login(
            this.userId,
            this.plaintextPassword,
            this.serverId,
            this.client,
            this.server,
            this.credentialFile
        );

        console.log({ auth: authResult });
    }

    private async register(
        userId: string,
        plaintextPassword: string,
        serverId: string,
        client: OpaqueCloudflareClientDriver,
        server: OpaqueCloudflareServerDriver
    ): Promise<any> {
        const registrationRequest = await client.registerInit(
            plaintextPassword
        );

        const credentialId = userId;

        const registrationResponse = await server.registerInit(
            registrationRequest,
            credentialId
        );

        const registrationRecord = await client.registerFinish(
            registrationResponse,
            userId,
            serverId
        );

        this.credentialFile = await server.registerFinish(
            registrationRecord,
            credentialId,
            userId
        );

        return {
            client: {
                init: uint8ArrayToHexString(registrationRequest),
                finish: uint8ArrayToHexString(registrationRecord),
            },
            server: {
                credentialFile: uint8ArrayToHexString(this.credentialFile),
            },
        };
    }

    private async login(
        userId: string,
        plaintextPassword: string,
        serverId: string,
        client: OpaqueCloudflareClientDriver,
        server: OpaqueCloudflareServerDriver,
        credentialFile: Uint8Array
    ): Promise<any> {
        const authRequest = await client.authInit(plaintextPassword);

        const { expectedAuthResult, serverResponse: authResponse } =
            await server.authInit(authRequest, credentialFile);

        const {
            sessionKey: clientSessionKey,
            clientRequest: authFinishRequest,
        } = await client.authFinish(authResponse, userId, serverId);

        await server.authFinish(authFinishRequest, expectedAuthResult);

        return {
            client: {
                init: uint8ArrayToHexString(authRequest),
                finish: uint8ArrayToHexString(authFinishRequest),
                clientSessionKey: uint8ArrayToHexString(clientSessionKey),
            },
            server: {
                expectedAuthResult: uint8ArrayToHexString(expectedAuthResult),
            },
        };
    }
}
