import sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyUtilV2 } from '../common/opaque-util-v2';
import OPRF from 'oprf';
import { OpaqueNthPartyProtocolClientV2 } from './opaque-client-v2';
import { OpaqueNthPartyProtocolServerV2 } from '../server';
import { hexStringToUint8Array } from '../common/hex-util';

describe('OPAQUE Client V2', () => {
    let client: OpaqueNthPartyProtocolClientV2;
    let server: OpaqueNthPartyProtocolServerV2;
    let util: OpaqueNthPartyUtilV2;

    const userId = 'bob';
    const plaintextPassword = 'password';

    beforeEach(async () => {
        const oprf = new OPRF();
        await oprf.ready;

        util = new OpaqueNthPartyUtilV2(sodium, oprf);
        client = new OpaqueNthPartyProtocolClientV2(sodium, util);
        server = new OpaqueNthPartyProtocolServerV2(sodium, util);
    });

    afterEach(() => {
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
        const userRecord = await server.serverRegister(userId, hashedPassword);

        expect(userRecord).toBeTruthy();
        expect(userRecord.userId).toEqual(userId);
        expect(userRecord.pepper).toBeDefined();
        expect(userRecord.pepper.envelope).toBeDefined();
    });

    it('should create credential request', async () => {
        const request = await client.clientBeginAuthenticate(plaintextPassword);

        expect(client.get('r')).toBeDefined();
        expect(client.get('xu')).toBeDefined();
        expect(client.get('mask')).toBeDefined();
        expect(client.get('Xu')).toBeDefined();

        expect(request).toBeTruthy();
        expect(request.alpha).toBeDefined();
        expect(request.Xu).toBeDefined();
    });

    it('should successfully initialize auth with server', async () => {
        const registrationRequest = await client.createRegistrationRequest(
            plaintextPassword,
            userId
        );
        const hashedPassword = hexStringToUint8Array(
            registrationRequest.hashedPassword
        );

        // 1: Client -> Server

        const userRecord = await server.serverRegister(userId, hashedPassword);

        // 1: Client <- Server (registration success or fail)

        const credentialRequest = await client.clientBeginAuthenticate(
            plaintextPassword
        );

        // 2: Client -> Server

        const credentialResponse = await server.serverBeginAuthenticate(
            hexStringToUint8Array(credentialRequest.alpha),
            hexStringToUint8Array(credentialRequest.Xu),
            userRecord.pepper
        );

        // 2: Client <- Server (credential response or fail)

        expect(server.get('SK')).toBeDefined();
        expect(server.get('Au')).toBeDefined();

        expect(credentialResponse).toBeTruthy();
        expect(credentialResponse.beta).toBeDefined();
        expect(credentialResponse.Xs).toBeDefined();
        expect(credentialResponse.envelope).toBeDefined();
        expect(credentialResponse.As).toBeDefined();
    });

    it('should successfully perform key exchange with server', async () => {
        const registrationRequest = await client.createRegistrationRequest(
            plaintextPassword,
            userId
        );
        const hashedPassword = hexStringToUint8Array(
            registrationRequest.hashedPassword
        );

        // 1: Client -> Server

        const userRecord = await server.serverRegister(userId, hashedPassword);

        // 1: Client <- Server (registration success or fail)

        const credentialRequest = await client.clientBeginAuthenticate(
            plaintextPassword
        );

        // 2: Client -> Server

        const credentialResponse = await server.serverBeginAuthenticate(
            hexStringToUint8Array(credentialRequest.alpha),
            hexStringToUint8Array(credentialRequest.Xu),
            userRecord.pepper
        );

        // 2: Client <- Server (credential response or fail)

        const request = await client.clientKeyExchangeAuthenticate(
            hexStringToUint8Array(credentialResponse.beta),
            hexStringToUint8Array(credentialResponse.Xs),
            hexStringToUint8Array(credentialResponse.As),
            util.stringEnvelopeToEnvelope(credentialResponse.envelope)
        );

        expect(request).toBeTruthy();
    });
});
