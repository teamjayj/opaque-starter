import { OpaqueID } from '@cloudflare/opaque-ts';
import { OpaqueCloudflareClientDriver } from './client-driver';

describe.each([
    OpaqueID.OPAQUE_P256,
    OpaqueID.OPAQUE_P384,
    OpaqueID.OPAQUE_P521,
])('Client driver', (opaqueID: OpaqueID) => {
    let driver: OpaqueCloudflareClientDriver;

    const plaintextPassword = 'password';
    const userId = 'bob';

    beforeAll(() => {
        driver = new OpaqueCloudflareClientDriver(opaqueID);
    });

    it('should initialize', () => {
        expect(() => {
            driver.initialize();
        }).not.toThrowError();
    });

    it('should register init', async () => {
        const request = await driver.registerInit(plaintextPassword, userId);
        expect(request).toBeTruthy();
    });
});
