import { Envelope } from './types';
import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyProtocolV2 } from './opaque-v2';

export class OpaqueNthPartyProtocolClientV2 extends OpaqueNthPartyProtocolV2 {
    constructor(sodium: typeof Sodium, util: OpaqueNthPartyUtilV2) {
        super(sodium, util);
    }

    async clientRegister(
        password: string,
        userId: string,
        opId?: string | undefined
    ): Promise<{ userId: string; hashedPassword: string }> {
        const hashedPassword = this.util.oprfKdf(password);

        // send userid and hashedpassword
        return {
            userId,
            hashedPassword: this.sodium.to_hex(hashedPassword),
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

    private async clientBeginAuthenticate(password: string) {
        const r = this.sodium.crypto_core_ristretto255_scalar_random();
        const xu = this.sodium.crypto_core_ristretto255_scalar_random();

        const hashedPassword = this.util.oprfKdf(password);
        const { point, mask } = this.util.oprfH1(hashedPassword);
        const alpha = this.util.oprfRaise(point, r);

        const Xu = this.sodium.crypto_scalarmult_ristretto255_base(xu);

        // give alpha, Xu
        return { alpha, Xu, mask };
    }

    private async clientKeyExchangeAuthenticate(
        beta: Uint8Array,
        mask: Uint8Array,
        r: Uint8Array,
        xu: Uint8Array,
        Xu: Uint8Array,
        Xs: Uint8Array,
        envelope: Envelope,
        iterations?: number | undefined
    ) {
        // get beta from server

        if (!this.util.isValidPoint(beta)) {
            throw new Error('Authentication failed @ C1');
        }

        const r_inv = this.sodium.crypto_core_ristretto255_scalar_invert(r);
        const rw = this.util.iteratedHash(
            this.util.oprfH(this.util.oprfRaise(beta, r_inv), mask),
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

        const K = this.util.KE(clientPrivateKey, xu, serverPublicKey, Xs, Xu);

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

    async clientFinalizeAuthenticate(
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
