import { CryptoBox } from 'libsodium-wrappers-sumo';

export type Pepper = {
    ks: Uint8Array;
    ps: Uint8Array;
    Ps: Uint8Array;
    Pu: Uint8Array;
    c: {
        pu: CryptoBox;
        Pu: CryptoBox;
        Ps: CryptoBox;
    };
};

export type UserRecord = {
    id: any;
    pepper: Pepper;
};
