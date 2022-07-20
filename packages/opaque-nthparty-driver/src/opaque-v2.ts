import { OpaqueNthPartyProtocol, Pepper, UserRecord } from './types';
import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';

export class OpaqueNthPartyProtocolV2 implements OpaqueNthPartyProtocol {
    constructor(
        private sodium: typeof Sodium,
        private util: OpaqueNthPartyUtilV2
    ) {}

    async clientRegister(
        password: string,
        userId: string,
        opId?: string | undefined
    ): Promise<void> {
        const hashedPassword = this.util.oprfKdf(password);

        // send userid and hashedpassword
    }

    async serverRegister(
        iterations?: number | undefined,
        opId?: string | undefined
    ): Promise<UserRecord> {}

    async clientAuthenticate(
        password: string,
        userId: string,
        iterations?: number | undefined,
        opId?: string | undefined
    ): Promise<string> {}

    async serverAuthenticate(
        userId: string,
        pepper: Pepper,
        opId?: string | undefined
    ): Promise<string> {}
}
