import sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyUtilV2 } from '../common/opaque-util-v2';
import OPRF from 'oprf';
import { OpaqueNthPartyProtocolClientV2 } from './opaque-client-v2';

describe('OPAQUE Client V2', () => {
    it('should create an instance', () => {
        const oprf = new OPRF();
        const utilV2 = new OpaqueNthPartyUtilV2(sodium, oprf);
        const protocolV2 = new OpaqueNthPartyProtocolClientV2(sodium, utilV2);

        expect(protocolV2).toBeTruthy();
    });

    it('should register client', async () => {
        const oprf = new OPRF();
        await oprf.ready;

        const utilV2 = new OpaqueNthPartyUtilV2(sodium, oprf);
        const protocolV2 = new OpaqueNthPartyProtocolClientV2(sodium, utilV2);

        expect(
            await protocolV2.createRegistrationRequest('supersecret', 'bob')
        ).toBe(1);
    });
});
