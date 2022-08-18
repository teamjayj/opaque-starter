import { Crypto } from '@peculiar/webcrypto';

if (typeof crypto === 'undefined') {
    global.crypto = new Crypto();
}
