import opaque from '@nthparty/opaque';
import { PakeClientDriver, PakeServerDriver } from '@jayj/pake';
import { OpaqueNthPartyProtocol } from './types';

export class OpaqueNthPartyDriver
    implements PakeClientDriver, PakeServerDriver
{
    private protocol: OpaqueNthPartyProtocol;

    constructor() {}

    async initialize(): Promise<void> {
        this.protocol = await opaque();
    }

    async registerAsClient(password: string, userId: string): Promise<void> {
        this.protocol.clientRegister(password, userId);
    }

    async authenticateAsClient(
        password: string,
        userId: string
    ): Promise<void> {
        const token = await this.protocol.clientAuthenticate(password, userId);
    }

    async registerAsServer(): Promise<void> {}
    async authenticateAsServer(): Promise<void> {}
}
