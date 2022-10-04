import { OpaqueClientDriver } from '.';
import { OpaqueRouteConfig } from '../common';

export type OpaqueClientConfig = {
    driver: OpaqueClientDriver;
    routes?: OpaqueRouteConfig;
};
