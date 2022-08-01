import {
    Config,
    CredentialFile,
    getOpaqueConfig,
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
} from '@jayj/pake';
import { OpaqueCloudflareUtil } from '../common';

export class OpaqueCloudflareServerDriver {
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
}
