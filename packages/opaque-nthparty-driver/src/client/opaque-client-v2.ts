import {
    ClientCredentialRequest,
    ClientRegistrationRequest,
    Envelope,
    OperationId,
    UserId,
} from '../common/types';
import { OpaqueNthPartyUtilV2 } from '../common/opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyProtocolV2 } from '../common/opaque-v2';

export class OpaqueNthPartyProtocolClientV2 extends OpaqueNthPartyProtocolV2 {
    constructor(sodium: typeof Sodium, util: OpaqueNthPartyUtilV2) {
        super(sodium, util);
    }

    /**
     * Creates client registration request
     *
     * @param password - plaintext password
     * @param userId - user identifier such as username
     * @param opId - operation ID
     * @returns
     */
    public async createRegistrationRequest(
        password: string,
        userId: UserId,
        opId?: OperationId
    ): Promise<ClientRegistrationRequest> {
        const hashedPassword = this.util.oprfKdfHashToPoint(password);

        return {
            userId,
            hashedPassword: this.sodium.to_hex(hashedPassword),
        };
    }

    public async clientBeginAuthenticate(
        password: string
    ): Promise<ClientCredentialRequest> {
        const hashedPassword = this.util.oprfKdfHashToPoint(password);
        const { point, mask } =
            this.util.oprfH1MaskPointWithRandom(hashedPassword);

        const r = this.sodium.crypto_core_ristretto255_scalar_random();
        const alpha = this.util.oprfRaiseScalarMult(point, r);

        const clientSessionPrivateKey =
            this.sodium.crypto_core_ristretto255_scalar_random();

        const clientSessionPublicKey =
            this.sodium.crypto_scalarmult_ristretto255_base(
                clientSessionPrivateKey
            );

        this.set('r', r);
        this.set('xu', clientSessionPrivateKey);
        this.set('mask', mask);
        this.set('Xu', clientSessionPublicKey);

        return {
            alpha: this.sodium.to_hex(alpha),
            Xu: this.sodium.to_hex(clientSessionPublicKey),
        };
    }

    public async clientKeyExchangeAuthenticate(
        beta: Uint8Array,
        serverSessionPublicKey: Uint8Array,
        serverAuthPublicKey: Uint8Array,
        envelope: Envelope,
        iterations?: number | undefined
    ) {
        if (!this.util.isValidPoint(beta)) {
            throw new Error('Authentication failed @ C1');
        }

        const r = this.get('r');
        const mask = this.get('mask');

        const rInverse = this.sodium.crypto_core_ristretto255_scalar_invert(r);
        const rw = this.util.iteratedHash(
            this.util.oprfHUnmaskPoint(
                this.util.oprfRaiseScalarMult(beta, rInverse),
                mask
            ),
            iterations
        );

        const {
            encryptedClientPrivateKey,
            encryptedClientPublicKey,
            encryptedServerPublicKey,
        } = envelope;

        const clientPrivateKey = this.util.sodiumAeadDecrypt(
            rw,
            encryptedClientPrivateKey
        );

        const clientPublicKey = this.util.sodiumAeadDecrypt(
            rw,
            encryptedClientPublicKey
        );

        // potential fix: assert decrypted public key
        if (!this.util.isValidPoint(clientPrivateKey)) {
            throw new Error('Authentication failed @ C2');
        }

        const serverPublicKey = this.util.sodiumAeadDecrypt(
            rw,
            encryptedServerPublicKey
        );

        const K = this.util.keyExchange(
            clientPrivateKey,
            this.get('xu'),
            serverPublicKey,
            serverSessionPublicKey
        );

        const sessionKey = this.util.oprfFUnmaskPointWithRandom(
            K,
            this.util.sodiumFromByte(0)
        );
        const As = this.util.oprfFUnmaskPointWithRandom(
            K,
            this.util.sodiumFromByte(1)
        );
        const Au = this.util.oprfFUnmaskPointWithRandom(
            K,
            this.util.sodiumFromByte(2)
        );

        if (this.sodium.compare(As, serverAuthPublicKey) !== 0) {
            throw new Error('Authentication failed @C3');
        }

        // send Au to server
        return {
            Au,
        };
    }

    public clientFinalizeAuthenticate(
        serverSuccess: boolean,
        sessionKey: Uint8Array
    ) {
        // if server finalizes auth successfully
        if (serverSuccess) {
            const token = this.sodium.to_hex(sessionKey);
            return token;
        } else {
            throw new Error('Authentication failed @C4');
        }
    }
}
