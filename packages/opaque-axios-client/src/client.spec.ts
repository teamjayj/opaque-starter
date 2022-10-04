import { beforeAll, describe, expect, it } from 'vitest';
import express, { Application } from 'express';
import { OpaqueAxiosClient } from './axios-client';
import { createClient } from '.';
import axios from 'axios';
import {
    OpaqueCloudflareClientDriver,
    OpaqueCloudflareServerDriver,
} from '@teamjayj/opaque-cloudflare-driver';
import { OpaqueCipherSuite } from '@teamjayj/opaque-core';
import { createServer } from '@teamjayj/opaque-express-server';

describe('Axios client test', () => {
    let app: Application;

    let client: OpaqueAxiosClient;

    beforeAll(async () => {
        app = express();
        app.use(express.json());

        const serverId = 'server';

        const server = await createServer({
            driver: new OpaqueCloudflareServerDriver(
                serverId,
                OpaqueCipherSuite.P256_SHA256
            ),
        });

        server.createRoutes(app);

        app.listen(3101, () => {
            console.log('Server listening to port');
        });

        const axiosInstance = axios.create();

        client = await createClient(axiosInstance, {
            driver: new OpaqueCloudflareClientDriver(
                OpaqueCipherSuite.P256_SHA256
            ),
            server: {
                id: serverId,
                hostname: 'http://127.0.0.1:3101',
            },
        });
    });

    it('POST request successfully register', async () => {
        const success = await client.register('bob', 'password');

        expect(success).toEqual(true);
    });

    it('POST request successfully login', async () => {
        const success = await client.login('bob', 'password');

        expect(success).toEqual(true);
    });
});
