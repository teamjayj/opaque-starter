import {
    Config,
    getOpaqueConfig,
    OpaqueID,
    RegistrationRecord,
} from '@cloudflare/opaque-ts';
import { OpaqueCloudflareServerDriver } from '../server';
import { OpaqueCloudflareClientDriver } from '../client';

describe.each([OpaqueID.OPAQUE_P256])(
    'Registration end-to-end driver test',
    (opaqueID: OpaqueID) => {
        describe(OpaqueID[opaqueID], () => {
            let config: Readonly<Config>;
            let client: OpaqueCloudflareClientDriver;
            let server: OpaqueCloudflareServerDriver;

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
            });

            it('should initialize client register', async () => {
                const registrationRequest = await client.registerInit(
                    plaintextPassword
                );

                expect(registrationRequest).toBeTruthy();
            });

            it('should accept registration request from client', async () => {
                const registrationRequest = await client.registerInit(
                    plaintextPassword
                );

                // C1: Client --> Server

                const registrationResponse = await server.registerInit(
                    registrationRequest,
                    credentialId
                );

                expect(registrationResponse).toBeTruthy();
            });

            it('should finish registration on client-side and create record', async () => {
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

                expect(registrationRecord).toBeTruthy();

                const record = RegistrationRecord.deserialize(
                    config,
                    Array.from(registrationRecord)
                );

                expect(record).toBeDefined();
                expect(record.client_public_key).toBeDefined();
                expect(record.envelope).toBeDefined();
                expect(record.masking_key).toBeDefined();
            });

            it('should finish registration on server-side', async () => {
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

                const credentialFile = await server.registerFinish(
                    registrationRecord,
                    credentialId,
                    userId
                );

                // C2: Client <-- Server: Registration Success

                expect(credentialFile).toBeTruthy();
            });
        });
    }
);
