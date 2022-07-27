import {
    Config,
    CredentialFile,
    getOpaqueConfig,
    OpaqueClient,
    OpaqueID,
    OpaqueServer,
    RegistrationRecord,
    RegistrationRequest,
} from '@cloudflare/opaque-ts';
import { PakeServerDriver } from '@jayj/pake';
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

    public async registerInit(data: number[], credentialId: string) {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const request = RegistrationRequest.deserialize(this.config, data);

        const response = await this.server.registerInit(request, credentialId);

        if (response instanceof Error) {
            throw new Error(`Server failed to registerInit: ${response}`);
        }
    }

    public async registerFinish(
        data: number[],
        credentialId: string,
        userId: string
    ) {
        if (this.server == null) {
            throw new Error('Server undefined');
        }

        const record = RegistrationRecord.deserialize(this.config, data);

        const credentialFile = new CredentialFile(credentialId, record, userId);

        return credentialFile;
    }
}
