import { OpaqueID } from '@cloudflare/opaque-ts';
import { OpaqueCloudflareClientDriver } from './client-driver';

describe.each([
    OpaqueID.OPAQUE_P256,
    OpaqueID.OPAQUE_P384,
    OpaqueID.OPAQUE_P521,
])('Client driver', (opaqueID: OpaqueID) => {
    it('should initialize', () => {
        const driver = new OpaqueCloudflareClientDriver(opaqueID);
        expect(driver).toBeTruthy();
    });
});
