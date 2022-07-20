import { OpaqueNthPartyDriver } from './driver';
import { DummySocket } from './dummy-socket';

describe('Driver', () => {
    it('should create an instance', () => {
        const socket = new DummySocket('test');
        const driver = new OpaqueNthPartyDriver(socket);
        expect(driver).toBeTruthy();
    });

    it('should initialize', () => {
        const socket = new DummySocket('test');
        const driver = new OpaqueNthPartyDriver(socket);

        expect(() => {
            driver.initialize();
        }).not.toThrowError();
    });
});
