import { beforeAll, describe, expect, it } from 'vitest';
import express, { Application } from 'express';
import request from 'supertest';

describe('End-to-end test', () => {
    let app: Application;

    beforeAll(() => {
        app = express();

        app.get('/', (req, res) => {
            res.status(200).json({ message: 'hi' });
        });
    });

    it('GET / should return hi message', async () => {
        const response = await request(app).get('');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            message: 'hi',
        });
    });
});
