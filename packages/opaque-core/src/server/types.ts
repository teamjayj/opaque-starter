import { OpaqueServerDriver } from '.';
import {
    OpaqueCredentialStore,
    OpaqueRouteConfig,
    OpaqueSessionStore,
} from '../common';

export type OpaqueServerStoreConfig = {
    credentialStore: OpaqueCredentialStore;
    sessionStore: OpaqueSessionStore;
};

export type OpaqueServerGeneratorConfig = {
    credentialIdGenerator: (userId: string) => string;
    sessionIdGenerator: () => string;
};

export type OpaqueServerConfig = {
    driver: OpaqueServerDriver;
    stores?: OpaqueServerStoreConfig;
    routes?: OpaqueRouteConfig;
    generators?: OpaqueServerGeneratorConfig;
};
