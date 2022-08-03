import {
    Config,
    CredentialFile,
    ExpectedAuthResult,
    getOpaqueConfig,
    KE1,
    KE3,
    OpaqueID,
    OpaqueServer,
    RegistrationRecord,
    RegistrationRequest,
} from '@cloudflare/opaque-ts';
import { PakeServerDriver, ServerAuthInitResponse } from '@jayj/pake';
import { OpaqueCloudflareUtil } from '../common';

export class OpaqueCloudflareServerDriver {
    private config: Readonly<Config>;
    private util: OpaqueCloudflareUtil;
    private server: OpaqueServer | undefined;

    constructor(private serverId: string, opaqueId: OpaqueID) {
        this.config = getOpaqueConfig(opaqueId);
        this.util = new OpaqueCloudflareUtil(this.config);
    }

    async initialize(): Promise<void> {
        const oprfSeed = this.util.getRandomOprfSeed();
        const keyPair = await this.util.generateKeyPair();
        this.server = new OpaqueServer(
            this.config,
            oprfSeed,
            keyPair,
            this.serverId
        );
    }

    public async registerInit(
        requestData: Uint8Array,
        credentialId: string
    ): Promise<Uint8Array> {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const request = RegistrationRequest.deserialize(
            this.config,
            Array.from(requestData)
        );

        const response = await this.server.registerInit(request, credentialId);

        if (response instanceof Error) {
            throw new Error(`Server failed to registerInit: ${response}`);
        }

        return Uint8Array.from(response.serialize());
    }

    public async registerFinish(
        recordData: Uint8Array,
        credentialId: string,
        userId: string
    ): Promise<Uint8Array> {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const record = RegistrationRecord.deserialize(
            this.config,
            Array.from(recordData)
        );

        const credentialFile = new CredentialFile(credentialId, record, userId);
        return Uint8Array.from(credentialFile.serialize());
    }

    public async authInit(
        clientAuthRequestData: Uint8Array,
        clientCredentialFileData: Uint8Array
    ): Promise<ServerAuthInitResponse> {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const ke1 = KE1.deserialize(
            this.config,
            Array.from(clientAuthRequestData)
        );

        const credentialFile = CredentialFile.deserialize(
            this.config,
            Array.from(clientCredentialFileData)
        );

        const response = await this.server.authInit(
            ke1,
            credentialFile.record,
            credentialFile.credential_identifier,
            credentialFile.client_identity
        );

        if (response instanceof Error) {
            throw new Error(`Server failed to authInit: ${response}`);
        }

        const { ke2, expected } = response;

        return {
            serverResponse: Uint8Array.from(ke2.serialize()),
            expectedAuthResult: Uint8Array.from(expected.serialize()),
        };
    }

    public async authFinish(
        clientRequestData: Uint8Array,
        expectedAuthResultData: Uint8Array
    ): Promise<Uint8Array> {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const ke3 = KE3.deserialize(this.config, Array.from(clientRequestData));

        const expectedAuthResult = ExpectedAuthResult.deserialize(
            this.config,
            Array.from(expectedAuthResultData)
        );

        const authResult = await this.server.authFinish(
            ke3,
            expectedAuthResult
        );

        if (authResult instanceof Error) {
            throw new Error(
                `Server failed to authenticate user: ${authResult}`
            );
        }

        const { session_key } = authResult;

        return Uint8Array.from(session_key);
    }
}
