import { beforeAll, describe, expect, it } from 'vitest';
import { OpaqueAxiosClient } from './axios-client';
import { createClient } from '.';
import axios from 'axios';
import { OpaqueCloudflareClientDriver } from '@teamjayj/opaque-cloudflare-driver';
import { OpaqueCipherSuite } from '@teamjayj/opaque-core';

describe('Registration axios client test', () => {
    let client: OpaqueAxiosClient;

    beforeAll(async () => {
        const axiosInstance = axios.create();

        client = await createClient(axiosInstance, {
            driver: new OpaqueCloudflareClientDriver(
                OpaqueCipherSuite.P256_SHA256
            ),
            server: {
                id: 'server',
                hostname: 'http://127.0.0.1:3101',
            },
        });
    });

    it('POST request successfully to registerInit', async () => {
        const success = await client.register('bob', 'password');

        expect(success).toEqual(true);
    });
});
