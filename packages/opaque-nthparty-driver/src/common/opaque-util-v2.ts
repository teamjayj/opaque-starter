import OPRF from 'oprf';
import Sodium, { CryptoBox, StringCryptoBox } from 'libsodium-wrappers-sumo';
import { IMaskedData } from 'oprf/build/oprf.slim';
import { Envelope, StringEnvelope } from './types';

export class OpaqueNthPartyUtilV2 {
    constructor(private sodium: typeof Sodium, private oprf: OPRF) {}

    public sodiumAeadEncrypt(
        key: Uint8Array,
        plaintext: string | Uint8Array
    ): CryptoBox {
        const rawCiphertext = this.sodium.crypto_aead_chacha20poly1305_encrypt(
            plaintext,
            null,
            null,
            new Uint8Array(8),
            key
        );

        const macTag = this.sodium.crypto_auth_hmacsha512(rawCiphertext, key);

        return {
            mac: macTag,
            ciphertext: rawCiphertext,
        };
    }

    public sodiumAeadDecrypt(
        key: Uint8Array,
        cryptoBox: CryptoBox
    ): Uint8Array {
        const isValidHash = this.sodium.crypto_auth_hmacsha512_verify(
            cryptoBox.mac,
            cryptoBox.ciphertext,
            key
        );

        if (isValidHash) {
            try {
                return this.sodium.crypto_aead_chacha20poly1305_decrypt(
                    null,
                    cryptoBox.ciphertext,
                    null,
                    new Uint8Array(8),
                    key
                );
            } catch (error) {
                return this.sodiumFromByte(255);
            }
        }

        throw new Error(
            'Invalid Message Authentication Code. Someone may have tampered with the ciphertext.'
        );
    }

    public oprfKdf(pwd: string): Uint8Array {
        return this.oprf.hashToPoint(pwd);
    }

    public oprfH(x: Uint8Array, mask: Uint8Array): Uint8Array {
        return this.oprf.unmaskPoint(x, mask);
    }

    public oprfH1(x: Uint8Array): IMaskedData {
        return this.oprf.maskPoint(x);
    }

    public oprfRaise(x: Uint8Array, y: Uint8Array): Uint8Array {
        return this.oprf.scalarMult(x, y);
    }

    public genericHash(x: Uint8Array): Uint8Array {
        return this.sodium.crypto_core_ristretto255_from_hash(x);
    }

    public iteratedHash(x: Uint8Array, t = 1000): Uint8Array {
        return this.sodium.crypto_generichash(
            x.length,
            t === 1 ? x : this.iteratedHash(x, t - 1)
        );
    }

    public oprfF(k: Uint8Array, x: Uint8Array): Uint8Array {
        if (!this.isValidPoint(x) || this.sodium.is_zero(x)) {
            x = this.oprf.hashToPoint(new TextDecoder().decode(x));
        }

        const _H1_x_ = this.oprfH1(x);
        const H1_x = _H1_x_.point;
        const mask = _H1_x_.mask;

        const H1_x_k = this.oprfRaise(H1_x, k);

        const unmasked = this.oprfH(H1_x_k, mask);
        return unmasked;
    }

    public sodiumFromByte(n: number): Uint8Array {
        return new Uint8Array(32).fill(n);
    }

    public KE(
        p: Uint8Array,
        x: Uint8Array,
        P: Uint8Array,
        X: Uint8Array,
        X1: Uint8Array
    ): Uint8Array {
        const kx = this.oprf.scalarMult(X, x);
        const kp = this.oprf.scalarMult(P, p);
        const k = this.genericHash(
            this.sodium.crypto_core_ristretto255_add(kx, kp)
        );
        return k;
    }

    public isValidPoint(point: Uint8Array): boolean {
        return this.sodium.crypto_core_ristretto255_is_valid_point(point);
    }

    public toStringEnvelope({
        encryptedClientPrivateKey,
        encryptedClientPublicKey,
        encryptedServerPublicKey,
    }: Envelope): StringEnvelope {
        return {
            encryptedClientPrivateKey: this.toStringCryptoBox(
                encryptedClientPrivateKey
            ),
            encryptedClientPublicKey: this.toStringCryptoBox(
                encryptedClientPublicKey
            ),
            encryptedServerPublicKey: this.toStringCryptoBox(
                encryptedServerPublicKey
            ),
        };
    }

    public toStringCryptoBox({ ciphertext, mac }: CryptoBox): StringCryptoBox {
        return {
            ciphertext: this.sodium.to_hex(ciphertext),
            mac: this.sodium.to_hex(mac),
        };
    }
}
