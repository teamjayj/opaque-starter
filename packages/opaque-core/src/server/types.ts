import { OpaqueServerDriver } from '.';
import { OpaqueCredentialStore, OpaqueSessionStore } from '../common';

export type OpaqueServerRouteConfig = {
    registerInitEndpoint: string;
    registerFinishEndpoint: string;
    authInitEndpoint: string;
    authFinishEndpoint: string;
};

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
    routes?: OpaqueServerRouteConfig;
    generators?: OpaqueServerGeneratorConfig;
};
