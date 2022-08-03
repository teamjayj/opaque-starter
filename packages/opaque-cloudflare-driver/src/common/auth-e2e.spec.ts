import { Config, getOpaqueConfig, OpaqueID } from '@cloudflare/opaque-ts';
import { OpaqueCloudflareServerDriver } from '../server';
import { OpaqueCloudflareClientDriver } from '../client';

describe.each([OpaqueID.OPAQUE_P256])(
    'Authentication end-to-end driver test',
    (opaqueID: OpaqueID) => {
        describe(OpaqueID[opaqueID], () => {
            let config: Readonly<Config>;
            let client: OpaqueCloudflareClientDriver;
            let server: OpaqueCloudflareServerDriver;
            let credentialFile: Uint8Array;

            const plaintextPassword = 'password';
            const userId = 'bob';
            const serverId = 'server';
            const credentialId = 'credential-id';

            beforeEach(async () => {
                config = getOpaqueConfig(opaqueID);
                client = new OpaqueCloudflareClientDriver(opaqueID);
                server = new OpaqueCloudflareServerDriver(serverId, opaqueID);

                await client.initialize();
                await server.initialize();

                const registrationRequest = await client.registerInit(
                    plaintextPassword
                );

                // C1: Client --> Server: Registration Request

                const registrationResponse = await server.registerInit(
                    registrationRequest,
                    credentialId
                );

                // C1: Client <-- Server

                const registrationRecord = await client.registerFinish(
                    registrationResponse,
                    userId,
                    serverId
                );

                // C2: Client --> Server: Registration Record

                credentialFile = await server.registerFinish(
                    registrationRecord,
                    credentialId,
                    userId
                );
            });

            it('should initialize client auth', async () => {
                const authRequest = await client.authInit(plaintextPassword);
                expect(authRequest).toBeTruthy();
            });

            it('should accept auth request from client', async () => {
                const authRequest = await client.authInit(plaintextPassword);

                // C1: Client --> Server

                const { expectedAuthResult, serverResponse } =
                    await server.authInit(authRequest, credentialFile);

                expect(expectedAuthResult).toBeTruthy();
                expect(serverResponse).toBeTruthy();
            });

            it('should finish auth on client-side', async () => {
                const authRequest = await client.authInit(plaintextPassword);

                // C1: Client --> Server

                const { expectedAuthResult, serverResponse: authResponse } =
                    await server.authInit(authRequest, credentialFile);

                // C1: Client <-- Server

                const authFinish = await client.authFinish(
                    authResponse,
                    userId,
                    serverId
                );

                expect(authFinish).toBeTruthy();
            });

            it('should finish auth on server-side', async () => {
                const authRequest = await client.authInit(plaintextPassword);

                // C1: Client --> Server

                const { expectedAuthResult, serverResponse: authResponse } =
                    await server.authInit(authRequest, credentialFile);

                // C1: Client <-- Server

                const {
                    sessionKey: clientSessionKey,
                    clientRequest: authFinishRequest,
                } = await client.authFinish(authResponse, userId, serverId);

                // C2: Client --> Server

                const serverSessionKey = await server.authFinish(
                    authFinishRequest,
                    expectedAuthResult
                );

                // C2: Client <-- Server: Auth Success

                expect(serverSessionKey).toStrictEqual(clientSessionKey);
            });
        });
    }
);
