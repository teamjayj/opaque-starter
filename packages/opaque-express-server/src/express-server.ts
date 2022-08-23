import { Application, NextFunction, Request, Response } from 'express';
import {
    hexStringToUint8Array,
    uint8ArrayToHexString,
    OpaqueServerConfig,
    OpaqueServer,
} from '@teamjayj/opaque-core';

export class OpaqueExpressServer extends OpaqueServer {
    constructor(config: OpaqueServerConfig) {
        super(config);
    }

    public createRoutes(app: Application): OpaqueExpressServer {
        this.createRegisterRoutes(app);
        this.createLoginRoutes(app);
        return this;
    }

    private createRegisterRoutes(app: Application): void {
        const driver = this.driver;
        const { registerInitEndpoint, registerFinishEndpoint } = this.routes;
        const { credentialIdGenerator } = this.generators;
        const { credentialStore } = this.stores;

        app.post(
            registerInitEndpoint,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const { data, userId } = req.body;

                    this.validateData(data);
                    this.validateUserId(userId);

                    const clientRequestData = hexStringToUint8Array(data);
                    const credentialId = credentialIdGenerator(userId);

                    const registrationResponse = await driver.registerInit(
                        clientRequestData,
                        credentialId
                    );

                    return res.json({
                        data: uint8ArrayToHexString(registrationResponse),
                    });
                } catch (error) {
                    next(error);
                }
            }
        );

        app.post(
            registerFinishEndpoint,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const { data, userId } = req.body;

                    this.validateData(data);
                    this.validateUserId(userId);

                    const registrationRecord = hexStringToUint8Array(data);
                    const credentialId = credentialIdGenerator(userId);

                    const credentialFile = await driver.registerFinish(
                        registrationRecord,
                        credentialId,
                        userId
                    );

                    await credentialStore.store(credentialId, credentialFile);

                    return res.json({
                        success: true,
                    });
                } catch (error) {
                    next(error);
                }
            }
        );
    }

    private createLoginRoutes(app: Application): void {
        const driver = this.driver;
        const { authInitEndpoint, authFinishEndpoint } = this.routes;
        const { credentialIdGenerator, sessionIdGenerator } = this.generators;
        const { credentialStore, sessionStore } = this.stores;

        app.post(
            authInitEndpoint,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const { data, userId } = req.body;

                    this.validateData(data);
                    this.validateUserId(userId);

                    const clientRequestData = hexStringToUint8Array(data);
                    const credentialId = credentialIdGenerator(userId);

                    const credentialFile = await credentialStore.get(
                        credentialId
                    );

                    const { serverResponse, expectedAuthResult } =
                        await driver.authInit(
                            clientRequestData,
                            credentialFile
                        );

                    const sessionId = sessionIdGenerator();

                    await sessionStore.store(sessionId, expectedAuthResult);

                    return res.json({
                        sessionId,
                        data: uint8ArrayToHexString(serverResponse),
                    });
                } catch (error) {
                    next(error);
                }
            }
        );

        app.post(
            authFinishEndpoint,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const { data, sessionId } = req.body;

                    this.validateData(data);
                    this.validateSessionId(sessionId);

                    const clientRequestData = hexStringToUint8Array(data);

                    const expectedAuthResultData = await sessionStore.get(
                        sessionId
                    );

                    const sessionKey = await driver.authFinish(
                        clientRequestData,
                        expectedAuthResultData
                    );

                    return res.json({
                        sessionKey: uint8ArrayToHexString(sessionKey),
                    });
                } catch (error) {
                    next(error);
                }
            }
        );
    }

    private validateData(data: string): void {
        if (data == null) {
            throw new Error('Cannot have null data');
        }
    }

    private validateUserId(userId: string): void {
        if (userId == null) {
            throw new Error('User id cannot be null');
        }
    }

    private validateSessionId(sessionId: string): void {
        if (sessionId == null) {
            throw new Error('Session id cannot be null');
        }
    }
}
