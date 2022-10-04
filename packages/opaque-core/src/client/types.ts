import { OpaqueClientDriver } from '.';
import { OpaqueRouteConfig } from '../common';

export type OpaqueClientConfig = {
    driver: OpaqueClientDriver;
    server: {
        id: string;
        hostname: string;
        routes?: OpaqueRouteConfig;
    };
};
