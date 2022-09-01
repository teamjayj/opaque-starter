import { beforeAll, describe, expect, it } from 'vitest';
import express, { Application, NextFunction, Request, Response } from 'express';
import request from 'supertest';

import { OpaqueCloudflareServerDriver } from '@teamjayj/opaque-cloudflare-driver';
import {
    hexStringToUint8Array,
    InMemoryOpaqueCredentialStore,
    InMemoryOpaqueSessionStore,
    OpaqueCipherSuite,
} from '@teamjayj/opaque-core';
import { createServer } from '.';

describe('Authentication protocol express server test', () => {
    let app: Application;

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
        app = express();
        app.use(express.json());

        const serverId = 'server';

        const credentialStore = new InMemoryOpaqueCredentialStore();

        credentialStore.store(
            'bob',
            hexStringToUint8Array(serverPrecomputations.credentialFile)
        );

        const sessionStore = new InMemoryOpaqueSessionStore();
        sessionStore.store(
            'my-session-id',
            hexStringToUint8Array(serverPrecomputations.expectedAuthResult)
        );

        const server = await createServer({
            driver: new OpaqueCloudflareServerDriver(
                serverId,
                OpaqueCipherSuite.P256_SHA256
            ),
            stores: {
                credentialStore,
                sessionStore,
            },
        });

        server.createRoutes(app);

        app.use(
            (err: Error, req: Request, res: Response, next: NextFunction) => {
                res.status(500).send({
                    message: err.message,
                });
            }
        );
    });

    it('POST request successfully to authInit', async () => {
        const response = await request(app)
            .post('/login-init')
            .send({ data: clientPrecomputations.authInit, userId: 'bob' });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('sessionId');
    });

    it('POST request to authInit should verify if a user does not exist', async () => {
        const response = await request(app)
            .post('/login-init')
            .send({ data: clientPrecomputations.authInit, userId: 'alex' });

        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual({
            message: `Cannot find user 'alex'`,
        });
    });

    it('POST request successfully to authFinish', async () => {
        const response = await request(app).post('/login-finish').send({
            data: clientPrecomputations.authFinish,
            sessionId: 'my-session-id',
        });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('sessionKey');
        expect(response.body.sessionKey).toEqual(
            clientPrecomputations.clientSessionKey
        );
    });

    it('POST request to authFinish should verify if a session does not exist', async () => {
        const response = await request(app).post('/login-finish').send({
            data: clientPrecomputations.authFinish,
            sessionId: 'not-my-session-id',
        });

        expect(response.statusCode).toEqual(500);
        expect(response.body).toEqual({
            message: `Cannot find session 'not-my-session-id'`,
        });
    });
});
