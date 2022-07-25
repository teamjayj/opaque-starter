import sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyUtilV2 } from '../common/opaque-util-v2';
import OPRF from 'oprf';
import { OpaqueNthPartyProtocolClientV2 } from './opaque-client-v2';
import { OpaqueNthPartyProtocolServerV2 } from '../server';
import { hexStringToUint8Array } from '../common/util';

describe('OPAQUE Client V2', () => {
    let client: OpaqueNthPartyProtocolClientV2;
    let server: OpaqueNthPartyProtocolServerV2;

    const userId = 'bob';
    const plaintextPassword = 'password';

    beforeAll(async () => {
        const oprf = new OPRF();
        await oprf.ready;

        const util = new OpaqueNthPartyUtilV2(sodium, oprf);
        client = new OpaqueNthPartyProtocolClientV2(sodium, util);
        server = new OpaqueNthPartyProtocolServerV2(sodium, util);
    });

    beforeEach(() => {
        client.clearStore();
        server.clearStore();
    });

    it('should create an instance', () => {
        expect(client).toBeTruthy();
    });

    it('should create registration request', async () => {
        const request = await client.createRegistrationRequest(
            plaintextPassword,
            userId
        );

        expect(request).toBeTruthy();
        expect(request.userId).toEqual('bob');
        expect(request.hashedPassword).toBeDefined();
    });

    it('should successfully register with server', async () => {
        const request = await client.createRegistrationRequest(
            plaintextPassword,
            userId
        );

        const hashedPassword = hexStringToUint8Array(request.hashedPassword);

        const record = await server.serverRegister(userId, hashedPassword);
        expect(record).toBeTruthy();
        expect(record.userId).toEqual(userId);
        expect(record.pepper).toBeDefined();
        expect(record.pepper.envelope).toBeDefined();
    });

    it('should create credential request', async () => {
        const request = await client.clientBeginAuthenticate('password');

        expect(client.get('r')).toBeDefined();
        expect(client.get('xu')).toBeDefined();
        expect(client.get('mask')).toBeDefined();
        expect(client.get('Xu')).toBeDefined();

        expect(request).toBeTruthy();
        expect(request.alpha).toBeDefined();
        expect(request.Xu).toBeDefined();
    });
});
