import {
    hexStringToUint8Array,
    OpaqueClient,
    OpaqueClientConfig,
    uint8ArrayToHexString,
} from '@teamjayj/opaque-core';
import { Axios } from 'axios';

export class OpaqueAxiosClient extends OpaqueClient {
    protected axiosInstance: Axios;

    constructor(axiosInstance: Axios, config: OpaqueClientConfig) {
        super(config);
        this.axiosInstance = axiosInstance;
    }

    public async register(
        userId: string,
        plaintextPassword: string
    ): Promise<boolean> {
        const axios = this.axiosInstance;
        const driver = this.driver;
        const serverId = this.serverId;

        const { registerInitEndpoint, registerFinishEndpoint } = this.routes;

        const registerInitRequestRaw = await driver.registerInit(
            plaintextPassword
        );

        const registerInitResponseSer = await axios.post(
            this.getWithHostNameUrl(registerInitEndpoint),
            {
                data: uint8ArrayToHexString(registerInitRequestRaw),
                userId,
            }
        );

        const registerInitResponseRaw = hexStringToUint8Array(
            registerInitResponseSer.data.data
        );

        const registerFinishRequestRaw = await driver.registerFinish(
            registerInitResponseRaw,
            userId,
            serverId
        );

        const registerFinishResponse = await axios.post(
            this.getWithHostNameUrl(registerFinishEndpoint),
            {
                data: uint8ArrayToHexString(registerFinishRequestRaw),
                userId,
            }
        );

        return registerFinishResponse.data.success;
    }

    private getWithHostNameUrl(route: string): string {
        return this.serverHostname.concat(route);
    }
}
