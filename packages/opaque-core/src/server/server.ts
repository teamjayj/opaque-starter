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
        this.stores = config.stores;
        this.routes = this.getRouteConfig(config);
        this.generators = this.getGeneratorConfig(config);
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
