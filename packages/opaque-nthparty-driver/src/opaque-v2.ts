import { Envelope, Pepper, UserRecord } from './types';
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

    async serverAuthenticate(
        userId: string,
        pepper: Pepper,
        opId?: string | undefined
    ): Promise<string> {
        return 'stub';
    }

    private async serverBeginAuthenticate(
        alpha: Uint8Array,
        Xu: Uint8Array,
        pepper: Pepper,
        opId?: string
    ) {
        if (!this.util.isValidPoint(alpha)) {
            throw new Error(
                'Authentication failed. Alpha is not a group element.'
            );
        }

        const xs = this.sodium.crypto_core_ristretto255_scalar_random();
        const beta = this.util.oprfRaise(alpha, pepper.clientOPRFKey);
        const Xs = this.sodium.crypto_scalarmult_ristretto255_base(xs);

        const K = this.util.KE(
            pepper.serverPrivateKey,
            xs,
            pepper.clientPublicKey,
            Xu,
            Xs
        );

        // SK = session key
        const sessionKey = this.util.oprfF(K, this.util.sodiumFromByte(0));
        const As = this.util.oprfF(K, this.util.sodiumFromByte(1));
        const Au = this.util.oprfF(K, this.util.sodiumFromByte(2));

        // give beta, Xs, c, As
        return {
            beta,
            Xs,
            c: pepper.envelope,
            As,
        };
    }

    private async serverFinalizeAuthenticate(
        serverAu: Uint8Array,
        clientAu: Uint8Array,
        sessionKey: Uint8Array
    ): Promise<string> {
        // The comparable value of 0 means equality
        if (this.sodium.compare(serverAu, clientAu) === 0) {
            const token = this.sodium.to_hex(sessionKey);
            return token;
        } else {
            throw new Error('Authentication failed');
        }
    }
}
