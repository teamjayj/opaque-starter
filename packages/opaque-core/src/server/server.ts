import {
    InMemoryOpaqueCredentialStore,
    InMemoryOpaqueSessionStore,
} from '../common';
import { OpaqueServerDriver } from './server-driver';
import {
    OpaqueServerStoreConfig,
    OpaqueServerRouteConfig,
    OpaqueServerGeneratorConfig,
    OpaqueServerConfig,
} from './types';

export class OpaqueServer {
    protected driver: OpaqueServerDriver;
    protected stores: OpaqueServerStoreConfig;
    protected routes: OpaqueServerRouteConfig;
    protected generators: OpaqueServerGeneratorConfig;

    constructor(config: OpaqueServerConfig) {
        this.driver = config.driver;
        this.stores = this.getStoreConfig(config);
        this.routes = this.getRouteConfig(config);
        this.generators = this.getGeneratorConfig(config);
    }

    private getStoreConfig(
        config: OpaqueServerConfig
    ): OpaqueServerStoreConfig {
        if (config.stores == null) {
            return {
                credentialStore: new InMemoryOpaqueCredentialStore(),
                sessionStore: new InMemoryOpaqueSessionStore(),
            };
        } else {
            return config.stores;
        }
    }

    private getRouteConfig(
        config: OpaqueServerConfig
    ): OpaqueServerRouteConfig {
        if (config.routes == null) {
            return {
                registerInitEndpoint: '/register-init',
                registerFinishEndpoint: '/register-finish',
                authInitEndpoint: '/login-init',
                authFinishEndpoint: '/login-finish',
            };
        } else {
            return config.routes;
        }
    }

    private getGeneratorConfig(
        config: OpaqueServerConfig
    ): OpaqueServerGeneratorConfig {
        if (config.generators == null) {
            return {
                credentialIdGenerator: () => 'credentialId',
                sessionIdGenerator: () => 'sessionId',
            };
        } else {
            return config.generators;
        }
    }
}
