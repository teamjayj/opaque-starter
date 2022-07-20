import * as opaque from '@nthparty/opaque';
import { PakeClientDriver, PakeServerDriver } from '@jayj/pake';
import { OpaqueNthPartyProtocol } from './types';
import { DummySocket } from './dummy-socket';

export class OpaqueNthPartyDriver
    implements PakeClientDriver, PakeServerDriver
{
    private protocol: OpaqueNthPartyProtocol;

    constructor(private socket: DummySocket) {}

    async initialize(): Promise<void> {
        this.protocol = await opaque(this.socket);
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
