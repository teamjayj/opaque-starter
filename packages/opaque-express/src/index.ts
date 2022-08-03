import { Application, Request, Response } from 'express';
import {
    hexStringToUint8Array,
    PakeServerDriver,
    uint8ArrayToHexString,
} from '@jayj/pake';

export type RouteParams = {
    registerInitEndpoint: string;
    registerFinishEndpoint: string;
    credentialIdGenerator: () => string;
};

export class OpaqueExpress {
    constructor(private app: Application, private driver: PakeServerDriver) {
        this.createRoutes({
            registerInitEndpoint: '/registerInit',
            registerFinishEndpoint: '/registerFinish',
            credentialIdGenerator: () => 'credentialId',
        });
    }

    private createRoutes(params: RouteParams) {
        this.app.post(
            params.registerInitEndpoint,
            async (req: Request, res: Response) => {
                const clientRequestData = hexStringToUint8Array(req.body.data);
                const credentialId = params.credentialIdGenerator();

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
            params.registerFinishEndpoint,
            async (req: Request, res: Response) => {
                const registrationRecord = hexStringToUint8Array(req.body.data);
                const credentialId = req.body.credentialId;
                const userId = req.body.userId;

                const credentialFile = await this.driver.registerFinish(
                    registrationRecord,
                    credentialId,
                    userId
                );

                return res.json({
                    success: true,
                });
            }
        );
    }
}
