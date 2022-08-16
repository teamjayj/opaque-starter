import { describe, beforeEach, it, expect, beforeAll } from 'vitest';
import { Config, getOpaqueConfig } from '@cloudflare/opaque-ts';
import { OpaqueCloudflareServerDriver } from '../server';
import { OpaqueCloudflareClientDriver } from '../client';
import { OpaqueCipherSuite } from '@teamjayj/opaque-core';
import { getOpaqueIDFromSuite } from './id-util';

describe.each([OpaqueCipherSuite.P256_SHA256])(
    'Authentication end-to-end driver test',
    (cipherSuite: OpaqueCipherSuite) => {
        describe(OpaqueCipherSuite[cipherSuite], () => {
            let config: Readonly<Config>;
            let client: OpaqueCloudflareClientDriver;
            let server: OpaqueCloudflareServerDriver;
            let credentialFile: Uint8Array;

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
