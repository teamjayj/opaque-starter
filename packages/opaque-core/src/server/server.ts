import {
    InMemoryOpaqueCredentialStore,
    InMemoryOpaqueSessionStore,
    OpaqueRouteConfig,
} from '../common';
import { OpaqueServerDriver } from './server-driver';
import {
    OpaqueServerStoreConfig,
    OpaqueServerGeneratorConfig,
    OpaqueServerConfig,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class OpaqueServer {
    protected driver: OpaqueServerDriver;
    protected stores: OpaqueServerStoreConfig;
    protected routes: OpaqueRouteConfig;
    protected generators: OpaqueServerGeneratorConfig;

    constructor(config: OpaqueServerConfig) {
        this.driver = config.driver;
        this.stores = this.getStoreConfig(config);
        this.routes = this.getRouteConfig(config);
        this.generators = this.getGeneratorConfig(config);
    }

    public async initialize(): Promise<void> {
        await this.driver.initialize();
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

    private getRouteConfig(config: OpaqueServerConfig): OpaqueRouteConfig {
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
                credentialIdGenerator: (userId: string) => userId,
                sessionIdGenerator: () => uuidv4(),
            };
        } else {
            return config.generators;
        }
    }
}
