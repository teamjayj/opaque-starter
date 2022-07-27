import { AKEExportKeyPair, Config } from '@cloudflare/opaque-ts';

export class OpaqueCloudflareUtil {
    public constructor(private config: Config) {}

    public getRandomOprfSeed(): number[] {
        return this.config.prng.random(this.config.hash.Nh);
    }

    public async generateKeyPair(): Promise<AKEExportKeyPair> {
        return this.config.ake.generateAuthKeyPair();
    }
}
