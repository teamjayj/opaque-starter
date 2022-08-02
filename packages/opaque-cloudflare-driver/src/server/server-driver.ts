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
import {
    bufferToHexString,
    hexStringToArray,
    PakeServerDriver,
    SerialData,
    ServerAuthInitResponse,
} from '@jayj/pake';
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
        requestData: SerialData,
        credentialId: string
    ): Promise<SerialData> {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const request = RegistrationRequest.deserialize(
            this.config,
            hexStringToArray(requestData)
        );

        const response = await this.server.registerInit(request, credentialId);

        if (response instanceof Error) {
            throw new Error(`Server failed to registerInit: ${response}`);
        }

        return bufferToHexString(response.serialize());
    }

    public async registerFinish(
        recordData: SerialData,
        credentialId: string,
        userId: string
    ): Promise<SerialData> {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const record = RegistrationRecord.deserialize(
            this.config,
            hexStringToArray(recordData)
        );

        const credentialFile = new CredentialFile(credentialId, record, userId);
        return bufferToHexString(credentialFile.serialize());
    }

    public async authInit(
        clientAuthRequestData: SerialData,
        clientCredentialFileData: SerialData
    ): Promise<ServerAuthInitResponse> {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const ke1 = KE1.deserialize(
            this.config,
            hexStringToArray(clientAuthRequestData)
        );

        const credentialFile = CredentialFile.deserialize(
            this.config,
            hexStringToArray(clientCredentialFileData)
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
            serverResponse: bufferToHexString(ke2.serialize()),
            expectedAuthResult: bufferToHexString(expected.serialize()),
        };
    }

    public async authFinish(
        clientRequestData: SerialData,
        expectedAuthResultData: SerialData
    ): Promise<SerialData> {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const ke3 = KE3.deserialize(
            this.config,
            hexStringToArray(clientRequestData)
        );

        const expectedAuthResult = ExpectedAuthResult.deserialize(
            this.config,
            hexStringToArray(expectedAuthResultData)
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

        return bufferToHexString(session_key);
    }
}
