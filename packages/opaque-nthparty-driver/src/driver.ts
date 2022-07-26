import { PakeClientDriver, PakeServerDriver } from '@jayj/pake';
import { OpaqueNthPartyUtil } from './common/opaque-util';
import Sodium from 'libsodium-wrappers-sumo';
import OPRF from 'oprf';
import { OpaqueNthPartyProtocolClient } from './client/opaque-client';

export class OpaqueNthPartyDriver
    implements PakeClientDriver, PakeServerDriver
{
    private protocol: OpaqueNthPartyProtocolClient | undefined;

    constructor(private sodium: typeof Sodium) {}

    async initialize(): Promise<void> {
        const oprf = new OPRF();
        await oprf.ready;

        const utilV2 = new OpaqueNthPartyUtil(this.sodium, oprf);
        this.protocol = new OpaqueNthPartyProtocolClient(this.sodium, utilV2);
    }

    async registerAsClient(password: string, userId: string): Promise<void> {
        this.protocol?.createRegistrationRequest(password, userId);
    }

    async authenticateAsClient(
        password: string,
        userId: string
    ): Promise<void> {
        const token = await this.protocol?.createRegistrationRequest(
            password,
            userId
        );
    }

    async registerAsServer(): Promise<void> {}
    async authenticateAsServer(): Promise<void> {}
}
