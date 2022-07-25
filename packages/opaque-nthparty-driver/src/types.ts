import { CryptoBox } from 'libsodium-wrappers-sumo';

export type Envelope = {
    encryptedClientPrivateKey: CryptoBox;
    encryptedClientPublicKey: CryptoBox;
    encryptedServerPublicKey: CryptoBox;
};

export type Pepper = {
    ks: Uint8Array;
    ps: Uint8Array;
    Ps: Uint8Array;
    Pu: Uint8Array;
    envelope: Envelope;
};

export type UserRecord = {
    id: any;
    pepper: Pepper;
};
