import { PakeClientDriver, PakeServerDriver } from '@jayj/pake';
import { OpaqueNthPartyProtocolV2 } from './opaque-v2';
import Sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';
import OPRF from 'oprf';

export class OpaqueNthPartyDriver
    implements PakeClientDriver, PakeServerDriver
{
    private protocol: OpaqueNthPartyProtocolV2 | undefined;

    constructor(private sodium: typeof Sodium) {}

    async initialize(): Promise<void> {
        const oprf = new OPRF();
        await oprf.ready;

        const utilV2 = new OpaqueNthPartyUtilV2(this.sodium, oprf);
        this.protocol = new OpaqueNthPartyProtocolV2(this.sodium, utilV2);
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
