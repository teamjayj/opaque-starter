import sodium from 'libsodium-wrappers-sumo';
import { hexStringToUint8Array } from './hex-util';

describe('Hex util', () => {
    beforeAll(async () => {
        await sodium.ready;
    });

    it('should convert hex string to uint8array', async () => {
        const password = sodium.to_hex('password');

        expect(hexStringToUint8Array(password)).toEqual(
            sodium.from_hex(password)
        );
    });
});
