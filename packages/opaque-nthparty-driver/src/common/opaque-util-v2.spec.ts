import sodium from 'libsodium-wrappers-sumo';
import OPRF from 'oprf';
import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';
import { Envelope } from './types';

describe('Opaque util', () => {
    const plaintextPassword = 'password';

    let util: OpaqueNthPartyUtilV2;

    const compareHexes = (a: Uint8Array, b: string) =>
        expect(a).toEqual(sodium.from_hex(b));

    beforeAll(async () => {
        await sodium.ready;

        const oprf = new OPRF();
        await oprf.ready;

        util = new OpaqueNthPartyUtilV2(sodium, oprf);
    });

    it('should convert cryptobox to string cryptobox', () => {
        const hashedPassword = util.oprfKdfHashToPoint(plaintextPassword);

        const clientOPRFKey = sodium.crypto_core_ristretto255_scalar_random();

        const passwordOPRF = util.iteratedHash(
            util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
            1000
        );

        const clientPrivateKey =
            sodium.crypto_core_ristretto255_scalar_random();

        const encryptedClientPrivateKey = util.sodiumAeadEncrypt(
            passwordOPRF,
            clientPrivateKey
        );

        const encryptedStringClientPrivateKey = util.cryptoBoxtoStringCryptoBox(
            encryptedClientPrivateKey
        );

        compareHexes(
            encryptedClientPrivateKey.ciphertext,
            encryptedStringClientPrivateKey.ciphertext
        );

        compareHexes(
            encryptedClientPrivateKey.mac,
            encryptedStringClientPrivateKey.mac
        );
    });

    it('should convert string cryptobox to cryptobox', () => {
        const hashedPassword = util.oprfKdfHashToPoint(plaintextPassword);

        const clientOPRFKey = sodium.crypto_core_ristretto255_scalar_random();

        const passwordOPRF = util.iteratedHash(
            util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
            1000
        );

        const clientPrivateKey =
            sodium.crypto_core_ristretto255_scalar_random();

        const encryptedStringClientPrivateKey = util.cryptoBoxtoStringCryptoBox(
            util.sodiumAeadEncrypt(passwordOPRF, clientPrivateKey)
        );

        const encryptedClientPrivateKey = util.stringCryptoBoxtoCryptoBox(
            encryptedStringClientPrivateKey
        );

        compareHexes(
            encryptedClientPrivateKey.ciphertext,
            encryptedStringClientPrivateKey.ciphertext
        );

        compareHexes(
            encryptedClientPrivateKey.mac,
            encryptedStringClientPrivateKey.mac
        );
    });

    it('should convert string envelope to envelope', () => {
        const hashedPassword = util.oprfKdfHashToPoint(plaintextPassword);

        const clientOPRFKey = sodium.crypto_core_ristretto255_scalar_random();

        const passwordOPRF = util.iteratedHash(
            util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
            1000
        );

        const clientPrivateKey =
            sodium.crypto_core_ristretto255_scalar_random();
        const clientPublicKey =
            sodium.crypto_scalarmult_ristretto255_base(clientPrivateKey);

        const serverPrivateKey =
            sodium.crypto_core_ristretto255_scalar_random();
        const serverPublicKey =
            sodium.crypto_scalarmult_ristretto255_base(serverPrivateKey);

        const stringEnvelope = util.envelopeToStringEnvelope({
            encryptedClientPrivateKey: util.sodiumAeadEncrypt(
                passwordOPRF,
                clientPrivateKey
            ),
            encryptedClientPublicKey: util.sodiumAeadEncrypt(
                passwordOPRF,
                clientPublicKey
            ),
            encryptedServerPublicKey: util.sodiumAeadEncrypt(
                passwordOPRF,
                serverPublicKey
            ),
        });

        const {
            encryptedClientPrivateKey,
            encryptedClientPublicKey,
            encryptedServerPublicKey,
        } = util.stringEnvelopeToEnvelope(stringEnvelope);

        const {
            encryptedClientPrivateKey: encryptedStringClientPrivateKey,
            encryptedClientPublicKey: encryptedStringClientPublicKey,
            encryptedServerPublicKey: encryptedStringServerPublicKey,
        } = stringEnvelope;

        compareHexes(
            encryptedClientPrivateKey.ciphertext,
            encryptedStringClientPrivateKey.ciphertext
        );

        compareHexes(
            encryptedClientPrivateKey.mac,
            encryptedStringClientPrivateKey.mac
        );

        compareHexes(
            encryptedClientPublicKey.ciphertext,
            encryptedStringClientPublicKey.ciphertext
        );

        compareHexes(
            encryptedClientPublicKey.mac,
            encryptedStringClientPublicKey.mac
        );

        compareHexes(
            encryptedServerPublicKey.ciphertext,
            encryptedStringServerPublicKey.ciphertext
        );

        compareHexes(
            encryptedServerPublicKey.mac,
            encryptedStringServerPublicKey.mac
        );
    });

    it('should convert envelope to string envelope', () => {
        const hashedPassword = util.oprfKdfHashToPoint(plaintextPassword);

        const clientOPRFKey = sodium.crypto_core_ristretto255_scalar_random();

        const passwordOPRF = util.iteratedHash(
            util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
            1000
        );

        const clientPrivateKey =
            sodium.crypto_core_ristretto255_scalar_random();
        const clientPublicKey =
            sodium.crypto_scalarmult_ristretto255_base(clientPrivateKey);

        const serverPrivateKey =
            sodium.crypto_core_ristretto255_scalar_random();
        const serverPublicKey =
            sodium.crypto_scalarmult_ristretto255_base(serverPrivateKey);

        const encryptedClientPrivateKey = util.sodiumAeadEncrypt(
            passwordOPRF,
            clientPrivateKey
        );

        const encryptedClientPublicKey = util.sodiumAeadEncrypt(
            passwordOPRF,
            clientPublicKey
        );

        const encryptedServerPublicKey = util.sodiumAeadEncrypt(
            passwordOPRF,
            serverPublicKey
        );

        const envelope: Envelope = {
            encryptedClientPrivateKey,
            encryptedClientPublicKey,
            encryptedServerPublicKey,
        };

        const {
            encryptedClientPrivateKey: encryptedStringClientPrivateKey,
            encryptedClientPublicKey: encryptedStringClientPublicKey,
            encryptedServerPublicKey: encryptedStringServerPublicKey,
        } = util.envelopeToStringEnvelope(envelope);

        compareHexes(
            encryptedClientPrivateKey.ciphertext,
            encryptedStringClientPrivateKey.ciphertext
        );

        compareHexes(
            encryptedClientPrivateKey.mac,
            encryptedStringClientPrivateKey.mac
        );

        compareHexes(
            encryptedClientPublicKey.ciphertext,
            encryptedStringClientPublicKey.ciphertext
        );

        compareHexes(
            encryptedClientPublicKey.mac,
            encryptedStringClientPublicKey.mac
        );

        compareHexes(
            encryptedServerPublicKey.ciphertext,
            encryptedStringServerPublicKey.ciphertext
        );

        compareHexes(
            encryptedServerPublicKey.mac,
            encryptedStringServerPublicKey.mac
        );
    });
});
