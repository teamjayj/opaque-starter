import { describe, it, expect } from 'vitest';
import { hexStringToUint8Array } from '.';

describe('Hex util', () => {
    it('should convert hex string to uint8array', async () => {
        const hexPassword = Buffer.from('password', 'utf8').toString('hex');

        expect(hexStringToUint8Array(hexPassword)).toEqual(
            Uint8Array.from(Buffer.from(hexPassword, 'hex'))
        );
    });
});
