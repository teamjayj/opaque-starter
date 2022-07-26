import sodium from 'libsodium-wrappers-sumo';
import OPRF from 'oprf';
import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';

describe('Crypto', () => {
    const plaintextPassword = 'password';

    let util: OpaqueNthPartyUtilV2;

    beforeAll(async () => {
        await sodium.ready;

        const oprf = new OPRF();
        await oprf.ready;

        util = new OpaqueNthPartyUtilV2(sodium, oprf);
    });

    describe('Client', () => {
        it('should perform consistent kdf from hex to uint8 array', () => {
            const hashedPasswordRaw =
                util.oprfKdfHashToPoint(plaintextPassword);
            const hashedPasswordHex = sodium.to_hex(hashedPasswordRaw);

            expect(hashedPasswordRaw).toEqual(
                sodium.from_hex(hashedPasswordHex)
            );
        });

        it('should generate valid oprf points consecutively', () => {
            const a = util.oprfKdfHashToPoint(plaintextPassword);
            const b = util.oprfKdfHashToPoint(plaintextPassword);
            expect(a).toEqual(b);
            expect(util.isValidPoint(a)).toEqual(true);
        });
    });

    describe('Server', () => {
        it('should create valid random point', () => {
            const point = sodium.crypto_core_ristretto255_random();
            expect(util.isValidPoint(point)).toEqual(true);
        });

        it('should iterate hash uniquely', () => {
            const hashedPassword = util.oprfKdfHashToPoint(plaintextPassword);

            const clientOPRFKey =
                sodium.crypto_core_ristretto255_scalar_random();

            const passwordOPRFA = util.iteratedHash(
                util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
                1000
            );

            const passwordOPRFB = util.iteratedHash(
                util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
                1001
            );

            expect(passwordOPRFA).not.toEqual(passwordOPRFB);
        });

        it('should create random key pairs consecutively', () => {
            const ps = sodium.crypto_core_ristretto255_scalar_random();
            const Ps = sodium.crypto_scalarmult_ristretto255_base(ps);

            const pu = sodium.crypto_core_ristretto255_scalar_random();
            const Pu = sodium.crypto_scalarmult_ristretto255_base(pu);

            expect(ps).not.toEqual(pu);
            expect(Ps).not.toEqual(Pu);
        });
    });
});
