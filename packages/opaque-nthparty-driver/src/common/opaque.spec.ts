import { describe, beforeAll, afterEach, it, expect } from 'vitest';
import sodium from 'libsodium-wrappers-sumo';
import OPRF from 'oprf';
import { OpaqueNthPartyProtocol, OpaqueNthPartyUtil } from '.';

describe('Opaque common', () => {
    let opaqueCommon: OpaqueNthPartyProtocol;

    beforeAll(async () => {
        await sodium.ready;

        const oprf = new OPRF();
        await oprf.ready;

        const util = new OpaqueNthPartyUtil(sodium, oprf);
        opaqueCommon = new OpaqueNthPartyProtocol(sodium, util);
    });

    afterEach(() => {
        opaqueCommon.clearStore();
    });

    it('should get and set values from the store', () => {
        opaqueCommon.set('a', new Uint8Array([1, 2, 3]));
        opaqueCommon.set('A', new Uint8Array([4, 5, 6]));

        expect(opaqueCommon.get('a')).toEqual(sodium.from_hex('010203'));
        expect(opaqueCommon.get('A')).toEqual(sodium.from_hex('040506'));
    });

    it('should clear the store', () => {
        opaqueCommon.set('a', new Uint8Array([1, 2, 3]));
        opaqueCommon.set('A', new Uint8Array([4, 5, 6]));

        opaqueCommon.clearStore();

        expect(() => opaqueCommon.get('a')).toThrowError();
        expect(() => opaqueCommon.get('A')).toThrowError();
    });
});
