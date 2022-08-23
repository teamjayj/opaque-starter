import { beforeAll, describe, expect, it } from 'vitest';
import express, { Application, NextFunction, Request, Response } from 'express';
import request from 'supertest';

import { OpaqueCloudflareServerDriver } from '@teamjayj/opaque-cloudflare-driver';
import { OpaqueCipherSuite } from '@teamjayj/opaque-core';
import { createServer } from '.';

describe('Registration protocol express server test', () => {
    let app: Application;

    const userId = 'bob';

    const clientPrecomputations = {
        registerInit:
            '026a1e9dafcec1000f83e6be569fce49b2403bd2632f085148c0084faa000e3bde',
        registerFinish:
            '024eeb301de8d8ff03b42a8026d84ce294a8d80eca2da76f8a475b7889c0f455be7d8765521147dc361a0a04cab124e8557b0fd850585da97bb52fda5c3663c507ef564346b181ab1e8ed7e5a45c77a7580ac59c662ad4390dc0fc94f6a5dc01fd74a5614150980d28741b20ee9445a26f7bf2c0bc724aa9cbd1a8cb25b77eaa75',
    };

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

        app.use(
            (err: Error, req: Request, res: Response, next: NextFunction) => {
                res.status(500).send('error');
            }
        );
    });

    it('POST request successfully to registerInit', async () => {
        const response = await request(app)
            .post('/register-init')
            .send({ data: clientPrecomputations.registerInit, userId });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('data');
    });

    it('POST request to registerInit should be validated', async () => {
        const response = await request(app)
            .post('/register-init')
            .send({ data: clientPrecomputations.registerInit });

        expect(response.statusCode).toEqual(500);
    });

    it('POST request to registration finish endpoint', async () => {
        const response = await request(app).post('/register-finish').send({
            data: clientPrecomputations.registerFinish,
            userId,
        });

        expect(response.statusCode).toEqual(200);
        expect(response.body.success).toEqual(true);
    });
});
