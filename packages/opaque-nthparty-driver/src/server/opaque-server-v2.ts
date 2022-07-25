import {
    Envelope,
    Pepper,
    ServerCredentialResponse,
    StringEnvelope,
    UserRecord,
} from '../common/types';
import { OpaqueNthPartyUtilV2 } from '../common/opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyProtocolV2 } from '../common/opaque-v2';

export class OpaqueNthPartyProtocolServerV2 extends OpaqueNthPartyProtocolV2 {
    constructor(sodium: typeof Sodium, util: OpaqueNthPartyUtilV2) {
        super(sodium, util);
    }

    /**
     * Accomodates a user registration request.
     *
     * @param userId
     * @param hashedPassword
     * @param iterations
     * @param opId
     *
     * @returns a user record to be persisted in a database
     */
    public async serverRegister(
        userId: string,
        hashedPassword: Uint8Array,
        iterations?: number | undefined,
        opId?: string | undefined
    ): Promise<UserRecord> {
        const clientOPRFKey =
            this.sodium.crypto_core_ristretto255_scalar_random();

        const passwordOPRF = this.util.iteratedHash(
            this.util.oprfF(clientOPRFKey, hashedPassword),
            iterations
        );

        const serverPrivateKey =
            this.sodium.crypto_core_ristretto255_scalar_random();
        const serverPublicKey =
            this.sodium.crypto_scalarmult_ristretto255_base(serverPrivateKey);

        const clientPrivateKey =
            this.sodium.crypto_core_ristretto255_scalar_random();
        const clientPublicKey =
            this.sodium.crypto_scalarmult_ristretto255_base(clientPrivateKey);

        const pepper: Pepper = {
            clientOPRFKey,
            clientPublicKey,
            serverPrivateKey,
            serverPublicKey,
            envelope: {
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
            },
        };

        return {
            userId,
            pepper,
        };
    }

    public async serverBeginAuthenticate(
        alpha: Uint8Array,
        Xu: Uint8Array,
        pepper: Pepper,
        opId?: string
    ): Promise<ServerCredentialResponse> {
        if (!this.util.isValidPoint(alpha)) {
            throw new Error(
                'Authentication failed. Alpha is not a group element.'
            );
        }

        const beta = this.util.oprfRaise(alpha, pepper.clientOPRFKey);
        const xs = this.sodium.crypto_core_ristretto255_scalar_random();
        const Xs = this.sodium.crypto_scalarmult_ristretto255_base(xs);

        const K = this.util.KE(
            pepper.serverPrivateKey,
            xs,
            pepper.clientPublicKey,
            Xu,
            Xs
        );

        // SK = session key
        const SK = this.util.oprfF(K, this.util.sodiumFromByte(0));
        const As = this.util.oprfF(K, this.util.sodiumFromByte(1));
        const Au = this.util.oprfF(K, this.util.sodiumFromByte(2));

        this.set('SK', SK);
        this.set('Au', Au);

        // give beta, Xs, c, As
        return {
            beta: this.sodium.to_hex(beta),
            Xs: this.sodium.to_hex(Xs),
            envelope: this.util.toStringEnvelope(pepper.envelope),
            As: this.sodium.to_hex(As),
        };
    }

    public async serverFinalizeAuthenticate(
        clientAu: Uint8Array
    ): Promise<string> {
        // The comparable value of 0 means equality
        if (this.sodium.compare(this.get('Au'), clientAu) === 0) {
            const token = this.sodium.to_hex(this.get('SK'));
            return token;
        } else {
            throw new Error('Authentication failed');
        }
    }
}
