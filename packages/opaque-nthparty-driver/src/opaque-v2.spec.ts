import { OpaqueNthPartyProtocolV2 } from './opaque-v2';
import sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyUtilV2 } from './opaque-util-v2';
import OPRF from 'oprf';

describe('Util V2', () => {
    it('should create an instance', () => {
        const oprf = new OPRF();
        const utilV2 = new OpaqueNthPartyUtilV2(sodium, oprf);
        const protocolV2 = new OpaqueNthPartyProtocolV2(sodium, utilV2);

        expect(protocolV2).toBeTruthy();
    });

    it('should register client', async () => {
        const oprf = new OPRF();
        await oprf.ready;

        const utilV2 = new OpaqueNthPartyUtilV2(sodium, oprf);
        const protocolV2 = new OpaqueNthPartyProtocolV2(sodium, utilV2);

        expect(await protocolV2.clientRegister('supersecret', 'bob')).toBe(1);
    });
});
