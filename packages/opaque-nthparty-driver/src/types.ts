import { CryptoBox } from 'libsodium-wrappers-sumo';

export type Envelope = {
    encryptedClientPrivateKey: CryptoBox;
    encryptedClientPublicKey: CryptoBox;
    encryptedServerPublicKey: CryptoBox;
};

export type Pepper = {
    clientOPRFKey: Uint8Array;
    clientPublicKey: Uint8Array;
    serverPrivateKey: Uint8Array;
    serverPublicKey: Uint8Array;
    envelope: Envelope;
};

export type UserRecord = {
    userId: any;
    pepper: Pepper;
};
