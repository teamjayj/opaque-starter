import { OpaqueServerConfig } from '@teamjayj/opaque-core';
import { OpaqueExpressServer } from './express-server';

export const createServer = async (
    config: OpaqueServerConfig
): Promise<OpaqueExpressServer> => {
    const server = new OpaqueExpressServer(config);
    await server.initialize();
    return server;
};
