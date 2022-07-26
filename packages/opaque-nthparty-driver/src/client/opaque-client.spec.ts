import Sodium from 'libsodium-wrappers-sumo';
import OPRF from 'oprf';
import { OpaqueNthPartyProtocolClient } from '.';
import { OpaqueNthPartyProtocolServer } from '../server';
import { OpaqueNthPartyUtil } from '../common';

describe('OPAQUE Client', () => {
    let sodium: typeof Sodium;

    let client: OpaqueNthPartyProtocolClient;
    let server: OpaqueNthPartyProtocolServer;
    let clientUtil: OpaqueNthPartyUtil;
    let serverUtil: OpaqueNthPartyUtil;

    const userId = 'bob';
    const plaintextPassword = 'password';

    beforeAll(async () => {
        await Sodium.ready;
        sodium = Sodium;

        const oprf = new OPRF();
        await oprf.ready;

        clientUtil = new OpaqueNthPartyUtil(sodium, oprf);
        client = new OpaqueNthPartyProtocolClient(sodium, clientUtil);

        serverUtil = new OpaqueNthPartyUtil(sodium, oprf);
        server = new OpaqueNthPartyProtocolServer(sodium, serverUtil);
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
        const hashedPassword = sodium.from_hex(request.hashedPassword);
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
        const hashedPassword = sodium.from_hex(
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
            sodium.from_hex(credentialRequest.alpha),
            sodium.from_hex(credentialRequest.Xu),
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
        const hashedPassword = sodium.from_hex(
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
            sodium.from_hex(credentialRequest.alpha),
            sodium.from_hex(credentialRequest.Xu),
            userRecord.pepper
        );

        // 2: Client <- Server (credential response or fail)

        const request = await client.clientKeyExchangeAuthenticate(
            sodium.from_hex(credentialResponse.beta),
            sodium.from_hex(credentialResponse.Xs),
            sodium.from_hex(credentialResponse.As),
            clientUtil.stringEnvelopeToEnvelope(credentialResponse.envelope)
        );

        expect(request).toBeTruthy();
        expect(request.Au).toBeDefined();

        // 3: Client -> Server (key exchange request)

        const response = await server.serverFinalizeAuthenticate(
            sodium.from_hex(request.Au)
        );

        // 3: Client <- Server (token)

        expect(response).toBeTruthy();
    });
});
