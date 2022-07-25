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
        const hashedPassword = this.util.oprfKdf(password);

        return {
            userId,
            hashedPassword: this.sodium.to_hex(hashedPassword),
        };
    }

    public async clientBeginAuthenticate(
        password: string
    ): Promise<ClientCredentialRequest> {
        const r = this.sodium.crypto_core_ristretto255_scalar_random();
        const xu = this.sodium.crypto_core_ristretto255_scalar_random();

        this.set('r', r);
        this.set('xu', xu);

        const hashedPassword = this.util.oprfKdf(password);
        const { point, mask } = this.util.oprfH1(hashedPassword);

        const alpha = this.util.oprfRaise(point, r);
        const Xu = this.sodium.crypto_scalarmult_ristretto255_base(xu);

        this.set('mask', mask);
        this.set('Xu', Xu);

        return {
            alpha: this.sodium.to_hex(alpha),
            Xu: this.sodium.to_hex(Xu),
        };
    }

    public async clientKeyExchangeAuthenticate(
        beta: Uint8Array,
        Xs: Uint8Array,
        envelope: Envelope,
        iterations?: number | undefined
    ) {
        // get beta from server
        if (!this.util.isValidPoint(beta)) {
            throw new Error('Authentication failed @ C1');
        }

        const rInverse = this.sodium.crypto_core_ristretto255_scalar_invert(
            this.get('r')
        );
        const rw = this.util.iteratedHash(
            this.util.oprfH(
                this.util.oprfRaise(beta, rInverse),
                this.get('mask')
            ),
            iterations
        );

        const clientPrivateKey = this.util.sodiumAeadDecrypt(
            rw,
            envelope.encryptedClientPrivateKey
        );

        if (
            !this.sodium.crypto_core_ristretto255_is_valid_point(
                clientPrivateKey
            )
        ) {
            throw new Error('Authentication failed @ C2');
        }

        const clientPublicKey = this.util.sodiumAeadDecrypt(
            rw,
            envelope.encryptedClientPublicKey
        );

        const serverPublicKey = this.util.sodiumAeadDecrypt(
            rw,
            envelope.encryptedServerPublicKey
        );

        const K = this.util.KE(
            clientPrivateKey,
            this.get('xu'),
            serverPublicKey,
            Xs,
            this.get('Xu')
        );

        const sessionKey = this.util.oprfF(K, this.util.sodiumFromByte(0));
        const As = this.util.oprfF(K, this.util.sodiumFromByte(1));
        const Au = this.util.oprfF(K, this.util.sodiumFromByte(2));

        // get As from server
        const __As = new Uint8Array();
        if (this.sodium.compare(As, __As) !== 0) {
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
