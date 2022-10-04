import { OpaqueRouteConfig } from '../common';
import { OpaqueClientDriver } from './client-driver';
import { OpaqueClientConfig } from './types';

export class OpaqueClient {
    protected driver: OpaqueClientDriver;
    protected routes: OpaqueRouteConfig;

    constructor(config: OpaqueClientConfig) {
        this.driver = config.driver;
        this.routes = this.getRouteConfig(config);
    }

    public async initialize(): Promise<void> {
        await this.driver.initialize();
    }

    private getRouteConfig(config: OpaqueClientConfig): OpaqueRouteConfig {
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
}
