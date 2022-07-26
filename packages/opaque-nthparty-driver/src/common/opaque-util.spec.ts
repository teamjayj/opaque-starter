import sodium from 'libsodium-wrappers-sumo';
import OPRF from 'oprf';
import { OpaqueNthPartyUtil } from './opaque-util';
import { Envelope } from './types';

describe('Opaque util', () => {
    const plaintextPassword = 'password';

    let util: OpaqueNthPartyUtil;

    const compareHexes = (a: Uint8Array, b: string) =>
        expect(a).toEqual(sodium.from_hex(b));

    beforeAll(async () => {
        await sodium.ready;

        const oprf = new OPRF();
        await oprf.ready;

        util = new OpaqueNthPartyUtil(sodium, oprf);
    });

    it('should convert cryptobox to string cryptobox', () => {
        const hashedPassword = util.oprfKdfHashToPoint(plaintextPassword);

        const clientOPRFKey = util.generateRandomPoint();

        const passwordOPRF = util.iteratedHash(
            util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
            1000
        );

        const clientPrivateKey = util.generateRandomPoint();

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

        const clientOPRFKey = util.generateRandomPoint();

        const passwordOPRF = util.iteratedHash(
            util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
            1000
        );

        const clientPrivateKey = util.generateRandomPoint();

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

        const clientOPRFKey = util.generateRandomPoint();

        const passwordOPRF = util.iteratedHash(
            util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
            1000
        );

        const { publicKey: serverPublicKey } = util.generateKeyPair();

        const { privateKey: clientPrivateKey, publicKey: clientPublicKey } =
            util.generateKeyPair();

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

        const clientOPRFKey = util.generateRandomPoint();

        const passwordOPRF = util.iteratedHash(
            util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
            1000
        );

        const { publicKey: serverPublicKey } = util.generateKeyPair();

        const { privateKey: clientPrivateKey, publicKey: clientPublicKey } =
            util.generateKeyPair();

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
