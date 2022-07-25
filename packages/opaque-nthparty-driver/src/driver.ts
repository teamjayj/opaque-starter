import { PakeClientDriver, PakeServerDriver } from '@jayj/pake';
import { OpaqueNthPartyUtilV2 } from './common/opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';
import OPRF from 'oprf';
import { OpaqueNthPartyProtocolClientV2 } from './client/opaque-client-v2';

export class OpaqueNthPartyDriver
    implements PakeClientDriver, PakeServerDriver
{
    private protocol: OpaqueNthPartyProtocolClientV2 | undefined;

    constructor(private sodium: typeof Sodium) {}

    async initialize(): Promise<void> {
        const oprf = new OPRF();
        await oprf.ready;

        const utilV2 = new OpaqueNthPartyUtilV2(this.sodium, oprf);
        this.protocol = new OpaqueNthPartyProtocolClientV2(this.sodium, utilV2);
    }

    async registerAsClient(password: string, userId: string): Promise<void> {
        this.protocol?.clientRegister(password, userId);
    }

    async authenticateAsClient(
        password: string,
        userId: string
    ): Promise<void> {
        const token = await this.protocol?.clientAuthenticate(password, userId);
    }

    async registerAsServer(): Promise<void> {}
    async authenticateAsServer(): Promise<void> {}
}
