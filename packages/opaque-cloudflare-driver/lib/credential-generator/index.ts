import { Crypto } from '@peculiar/webcrypto';

if (typeof crypto === 'undefined') {
    global.crypto = new Crypto();
}

import { OpaqueCipherSuite } from '@teamjayj/opaque-core';
import { CredentialGenerator } from './credential-generator';

const credentialGenerator = new CredentialGenerator({
    userId: 'bob',
    plaintextPassword: 'password',
    serverId: 'hi',
    cipherSuite: OpaqueCipherSuite.P256_SHA256,
});

(async () => {
    await credentialGenerator.initialize();
    await credentialGenerator.generate();
})();
