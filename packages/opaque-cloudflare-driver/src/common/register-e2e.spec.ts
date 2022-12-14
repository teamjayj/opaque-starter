import { describe, beforeEach, it, expect, beforeAll } from 'vitest';
import {
    Config,
    getOpaqueConfig,
    RegistrationRecord,
} from '@cloudflare/opaque-ts';
import { OpaqueCloudflareServerDriver } from '../server';
import { OpaqueCloudflareClientDriver } from '../client';
import { OpaqueCipherSuite } from '@teamjayj/opaque-core';
import { getOpaqueIDFromSuite } from './id-util';

describe.each([OpaqueCipherSuite.P256_SHA256])(
    'Registration end-to-end driver test',
    (cipherSuite: OpaqueCipherSuite) => {
        describe(OpaqueCipherSuite[cipherSuite], () => {
            let config: Readonly<Config>;
            let client: OpaqueCloudflareClientDriver;
            let server: OpaqueCloudflareServerDriver;

            const plaintextPassword = 'password';
            const userId = 'bob';
            const serverId = 'server';
            const credentialId = 'credential-id';

            beforeAll(async () => {
                config = getOpaqueConfig(getOpaqueIDFromSuite(cipherSuite));
                server = new OpaqueCloudflareServerDriver(
                    serverId,
                    cipherSuite
                );

                await server.initialize();
            });

            beforeEach(async () => {
                client = new OpaqueCloudflareClientDriver(cipherSuite);
                await client.initialize();
            });

            it('should initialize client register', async () => {
                const registrationRequest = await client.registerInit(
                    plaintextPassword
                );

                expect(registrationRequest).toBeTruthy();
            });

            it('should blind the password uniquely on every client register', async () => {
                const registrationRequest1 = await client.registerInit(
                    plaintextPassword
                );

                client = new OpaqueCloudflareClientDriver(cipherSuite);
                await client.initialize();

                const registrationRequest2 = await client.registerInit(
                    plaintextPassword
                );

                expect(registrationRequest1).not.toEqual(registrationRequest2);
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
