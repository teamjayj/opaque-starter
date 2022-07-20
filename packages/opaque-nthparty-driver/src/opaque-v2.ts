import { Pepper, UserRecord } from './types';
import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';

export class OpaqueNthPartyProtocolV2 {
    constructor(
        private sodium: typeof Sodium,
        private util: OpaqueNthPartyUtilV2
    ) {}

    async clientRegister(
        password: string,
        userId: string,
        opId?: string | undefined
    ): Promise<{ userId: string; hashedPassword: string }> {
        const hashedPassword = this.util.oprfKdf(password);

        // send userid and hashedpassword
        return {
            userId,
            hashedPassword: new TextDecoder().decode(hashedPassword),
        };
    }

    async serverRegister(
        userId: string,
        hashedPassword: Uint8Array,
        iterations?: number | undefined,
        opId?: string | undefined
    ): Promise<UserRecord> {
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

        const asymmetricKeys = {
            encryptedClientPrivateKey: this.util.sodiumAeadEncrypt(
                passwordOPRF,
                clientPrivateKey
            ),
            encryptedClientPublicKey: this.util.sodiumAeadEncrypt(
                passwordOPRF,
                clientPublicKey
            ),
            encryptedServerPublicKey: this.util.sodiumAeadEncrypt(
                passwordOPRF,
                serverPublicKey
            ),
        };

        const pepper: Pepper = {
            ks: serverOPRFKey,
            ps: serverPrivateKey,
            Ps: serverPublicKey,
            Pu: clientPublicKey,
            c: {
                pu: asymmetricKeys.encryptedClientPrivateKey,
                Pu: asymmetricKeys.encryptedClientPublicKey,
                Ps: asymmetricKeys.encryptedServerPublicKey,
            },
        };

        return {
            id: userId,
            pepper,
        };
    }

    async clientAuthenticate(
        password: string,
        userId: string,
        iterations?: number | undefined,
        opId?: string | undefined
    ): Promise<string> {
        return 'stub';
    }

    async serverAuthenticate(
        userId: string,
        pepper: Pepper,
        opId?: string | undefined
    ): Promise<string> {
        return 'stub';
    }
}
