import { Application, Request, Response } from 'express';
import {
    OpaqueCredentialStore,
    hexStringToUint8Array,
    OpaqueServerDriver,
    uint8ArrayToHexString,
    OpaqueSessionStore,
} from '@teamjayj/opaque-core';

export type RouteParams = {
    registerInitEndpoint: string;
    registerFinishEndpoint: string;
    authInitEndpoint: string;
    authFinishEndpoint: string;
    credentialIdGenerator: () => string;
    sessionIdGenerator: () => string;
};

export class OpaqueExpress {
    constructor(
        private app: Application,
        private driver: OpaqueServerDriver,
        private credentialStore: OpaqueCredentialStore,
        private sessionStore: OpaqueSessionStore
    ) {
        this.createRoutes({
            registerInitEndpoint: '/register-0',
            registerFinishEndpoint: '/register-1',
            authInitEndpoint: '/login-0',
            authFinishEndpoint: '/login-1',
            credentialIdGenerator: () => 'credentialId',
            sessionIdGenerator: () => 'sessionId',
        });
    }

    private createRoutes({
        registerInitEndpoint,
        registerFinishEndpoint,
        authInitEndpoint,
        authFinishEndpoint,
        credentialIdGenerator,
        sessionIdGenerator,
    }: RouteParams) {
        this.app.post(
            registerInitEndpoint,
            async (req: Request, res: Response) => {
                const clientRequestData = hexStringToUint8Array(req.body.data);
                const credentialId = credentialIdGenerator();

                const registrationResponse = await this.driver.registerInit(
                    clientRequestData,
                    credentialId
                );

                return res.json({
                    credentialId,
                    registrationResponse:
                        uint8ArrayToHexString(registrationResponse),
                });
            }
        );

        this.app.post(
            registerFinishEndpoint,
            async (req: Request, res: Response) => {
                const registrationRecord = hexStringToUint8Array(req.body.data);
                const credentialId = req.body.credentialId;
                const userId = req.body.userId;

                const credentialFile = await this.driver.registerFinish(
                    registrationRecord,
                    credentialId,
                    userId
                );

                await this.credentialStore.store(credentialId, credentialFile);

                return res.json({
                    success: true,
                });
            }
        );

        this.app.post(authInitEndpoint, async (req: Request, res: Response) => {
            const clientRequestData = hexStringToUint8Array(req.body.data);
            const credentialId = req.body.credentialId;

            const credentialFile = await this.credentialStore.get(credentialId);

            const { serverResponse, expectedAuthResult } =
                await this.driver.authInit(clientRequestData, credentialFile);

            const sessionId = sessionIdGenerator();

            await this.sessionStore.store(sessionId, expectedAuthResult);

            return res.json({
                sessionId,
                serverResponse: uint8ArrayToHexString(serverResponse),
            });
        });

        this.app.post(
            authFinishEndpoint,
            async (req: Request, res: Response) => {
                const clientRequestData = hexStringToUint8Array(req.body.data);
                const sessionId = req.body.sessionId;

                const expectedAuthResultData = await this.sessionStore.get(
                    sessionId
                );

                const sessionKey = await this.driver.authFinish(
                    clientRequestData,
                    expectedAuthResultData
                );

                return res.json({
                    sessionKey: uint8ArrayToHexString(sessionKey),
                });
            }
        );
    }
}
