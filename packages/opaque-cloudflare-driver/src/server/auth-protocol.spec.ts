import { describe, it, expect, beforeAll } from 'vitest';
import { Config, getOpaqueConfig } from '@cloudflare/opaque-ts';
import { OpaqueCloudflareServerDriver } from '../server';

import {
    hexStringToUint8Array,
    OpaqueCipherSuite,
} from '@teamjayj/opaque-core';
import { getOpaqueIDFromSuite } from '../common';

describe.each([OpaqueCipherSuite.P256_SHA256])(
    'Authentication protocol driver test',
    (cipherSuite: OpaqueCipherSuite) => {
        describe(OpaqueCipherSuite[cipherSuite], () => {
            let config: Readonly<Config>;
            let server: OpaqueCloudflareServerDriver;

            const serverId = 'server';

            const clientPrecomputations = {
                authInit:
                    '02627898a44a393892120e693bdfe68c7dbb3d0b7fdbddae1f63c66dadfde28dcd631986f3892001eecb8f62b9540e6721fb3c55127658759072d3fac5aef0b96703a8d2a50753bb5f3e33265e25c84f518144a4ee9d4695c09fdc67f65cc2e0c07d',
                authFinish:
                    '0dbf15c60645d1af3c8f4c53e3a7cd3f22baa3c46145fa2c7dd0bc7557f085a3',
                clientSessionKey:
                    'd137b72052a2c125b470a65d13220a05f6049f391d6b0d46b04c835e970ab7d1',
            };

            const serverPrecomputations = {
                credentialFile:
                    '0003626f62024eeb301de8d8ff03b42a8026d84ce294a8d80eca2da76f8a475b7889c0f455be7d8765521147dc361a0a04cab124e8557b0fd850585da97bb52fda5c3663c507ef564346b181ab1e8ed7e5a45c77a7580ac59c662ad4390dc0fc94f6a5dc01fd74a5614150980d28741b20ee9445a26f7bf2c0bc724aa9cbd1a8cb25b77eaa750003626f62',
                expectedAuthResult:
                    '0dbf15c60645d1af3c8f4c53e3a7cd3f22baa3c46145fa2c7dd0bc7557f085a3d137b72052a2c125b470a65d13220a05f6049f391d6b0d46b04c835e970ab7d1',
            };

            beforeAll(async () => {
                config = getOpaqueConfig(getOpaqueIDFromSuite(cipherSuite));

                server = new OpaqueCloudflareServerDriver(
                    serverId,
                    cipherSuite
                );

                await server.initialize();
            });

            it('should accept auth request from client', async () => {
                const authRequest = hexStringToUint8Array(
                    clientPrecomputations.authInit
                );

                // C1: Client --> Server

                const credentialFile = hexStringToUint8Array(
                    serverPrecomputations.credentialFile
                );

                const { expectedAuthResult, serverResponse } =
                    await server.authInit(authRequest, credentialFile);

                expect(expectedAuthResult).toBeTruthy();
                expect(serverResponse).toBeTruthy();
            });

            it('should finish auth on server-side', async () => {
                const authFinishRequest = hexStringToUint8Array(
                    clientPrecomputations.authFinish
                );

                const expectedAuthResult = hexStringToUint8Array(
                    serverPrecomputations.expectedAuthResult
                );

                const serverSessionKey = await server.authFinish(
                    authFinishRequest,
                    expectedAuthResult
                );

                // C2: Client <-- Server: Auth Success

                const clientSessionKey = hexStringToUint8Array(
                    clientPrecomputations.clientSessionKey
                );

                expect(serverSessionKey).toEqual(clientSessionKey);
            });
        });
    }
);
