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
    ): Promise<UserRecord> {
        // from client
        const hashedPassword = new Uint8Array();

        // server computations
        const serverOPRFKey =
            this.sodium.crypto_core_ristretto255_scalar_random();

        const passwordOPRF = this.util.iteratedHash(
            this.util.oprfF(serverOPRFKey, hashedPassword),
            iterations
        );

        const serverPrivateKey =
            this.sodium.crypto_core_ristretto255_scalar_random();
        const clientPrivateKey =
            this.sodium.crypto_core_ristretto255_scalar_random();
        const serverPublicKey =
            this.sodium.crypto_scalarmult_ristretto255_base(serverPrivateKey);
        const clientPublicKey =
            this.sodium.crypto_scalarmult_ristretto255_base(clientPrivateKey);
    }

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
