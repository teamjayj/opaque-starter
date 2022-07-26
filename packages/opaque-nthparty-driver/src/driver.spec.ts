import Sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyDriver } from './driver';

describe('Driver', () => {
    let sodium: typeof Sodium;

    beforeAll(async () => {
        await Sodium.ready;
        sodium = Sodium;
    });

    it('should create an instance', () => {
        const driver = new OpaqueNthPartyDriver(sodium);
        expect(driver).toBeTruthy();
    });

    it('should initialize', () => {
        const driver = new OpaqueNthPartyDriver(sodium);

        expect(() => {
            driver.initialize();
        }).not.toThrowError();
    });
});
