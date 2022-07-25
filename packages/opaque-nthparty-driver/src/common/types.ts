import { CryptoBox, StringCryptoBox } from 'libsodium-wrappers-sumo';

export type Envelope = {
    encryptedClientPrivateKey: CryptoBox;
    encryptedClientPublicKey: CryptoBox;
    encryptedServerPublicKey: CryptoBox;
};

export type StringEnvelope = {
    encryptedClientPrivateKey: StringCryptoBox;
    encryptedClientPublicKey: StringCryptoBox;
    encryptedServerPublicKey: StringCryptoBox;
};

export type Pepper = {
    clientOPRFKey: Uint8Array;
    clientPublicKey: Uint8Array;
    serverPrivateKey: Uint8Array;
    serverPublicKey: Uint8Array;
    envelope: Envelope;
};

export type UserId = string | number;

export type OperationId = string | undefined;

export type UserRecord = {
    userId: UserId;
    pepper: Pepper;
};

export interface ClientRegistrationRequest {
    userId: UserId;
    hashedPassword: string;
}

export interface ClientCredentialRequest {
    alpha: string;
    Xu: string;
}

export interface ServerCredentialResponse {
    beta: string;
    Xs: string;
    As: string;
    envelope: StringEnvelope;
}
