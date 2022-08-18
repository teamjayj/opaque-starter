import { describe, it, expect, beforeAll } from 'vitest';
import { Config, getOpaqueConfig } from '@cloudflare/opaque-ts';
import { OpaqueCloudflareServerDriver } from '..';
import {
    hexStringToUint8Array,
    OpaqueCipherSuite,
} from '@teamjayj/opaque-core';
import { getOpaqueIDFromSuite } from '../common';

describe.each([OpaqueCipherSuite.P256_SHA256])(
    'Registration protocol driver test',
    (cipherSuite: OpaqueCipherSuite) => {
        describe(OpaqueCipherSuite[cipherSuite], () => {
            let config: Readonly<Config>;
            let server: OpaqueCloudflareServerDriver;

            const userId = 'bob';
            const serverId = 'server';
            const credentialId = 'bob';

            const clientPrecomputations = {
                registerInit:
                    '028df0cb7cc63a3b00c2a5b211fbdb14a25890308c0ff1835c2500d098b6d3c6d1',
                registerFinish:
                    '024f788e572061d2be4fa3e1f1eff82e7a4ffae6611124d44c0cb4a893ab1f95b600b683c1ca4fca9825f2f5aa32c6898805cc0d4151dcec963ab61fb3e9a304cb37d7b4bda8a79575e16f474804ed8f52f58ae8a77f3196658de40c4d9475c63d7fb622b41dc75648751bf6f4333cb3666567b3d9183d12d71da9c47663afa4d5',
            };

            beforeAll(async () => {
                config = getOpaqueConfig(getOpaqueIDFromSuite(cipherSuite));
                server = new OpaqueCloudflareServerDriver(
                    serverId,
                    cipherSuite
                );

                await server.initialize();
            });

            it('should accept registration request from client', async () => {
                const registrationRequest = hexStringToUint8Array(
                    clientPrecomputations.registerInit
                );

                const registrationResponse = await server.registerInit(
                    registrationRequest,
                    credentialId
                );

                expect(registrationResponse).toBeTruthy();
            });

            it('should finish registration on server-side', async () => {
                const registrationRecord = hexStringToUint8Array(
                    clientPrecomputations.registerFinish
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
