import {
    Envelope,
    Pepper,
    ServerCredentialResponse,
    StringEnvelope,
    UserRecord,
} from '../common/types';
import { OpaqueNthPartyUtilV2 } from '../common/opaque-util-v2';
import Sodium from 'libsodium-wrappers-sumo';
import { OpaqueNthPartyProtocolV2 } from '../common/opaque-v2';

export class OpaqueNthPartyProtocolServerV2 extends OpaqueNthPartyProtocolV2 {
    constructor(sodium: typeof Sodium, util: OpaqueNthPartyUtilV2) {
        super(sodium, util);
    }

    /**
     * Accomodates a user registration request.
     *
     * @param userId
     * @param hashedPassword
     * @param iterations
     * @param opId
     *
     * @returns a user record to be persisted in a database
     */
    public async serverRegister(
        userId: string,
        hashedPassword: Uint8Array,
        iterations?: number | undefined,
        opId?: string | undefined
    ): Promise<UserRecord> {
        const clientOPRFKey = this.util.generateRandomPoint();
        const passwordOPRF = this.util.iteratedHash(
            this.util.oprfFUnmaskPointWithRandom(clientOPRFKey, hashedPassword),
            iterations
        );

        const { privateKey: serverPrivateKey, publicKey: serverPublicKey } =
            this.util.generateKeyPair();

        const { privateKey: clientPrivateKey, publicKey: clientPublicKey } =
            this.util.generateKeyPair();

        const pepper: Pepper = {
            clientOPRFKey,
            clientPublicKey,
            serverPrivateKey,
            serverPublicKey,
            envelope: {
                encryptedClientPrivateKey: this.util.sodiumAeadEncrypt(
                    passwordOPRF,
                    clientPrivateKey
                ),
                encryptedClientPublicKey: this.util.sodiumAeadEncrypt(
                    passwordOPRF,
                    clientPublicKey
                ),
                encryptedServerPublicKey: this.util.sodiumAeadEncrypt(
                    passwordOPRF,
                    serverPublicKey
                ),
            },
        };

        return {
            userId,
            pepper,
        };
    }

    public async serverBeginAuthenticate(
        alpha: Uint8Array,
        clientSessionPublicKey: Uint8Array,
        pepper: Pepper,
        opId?: string
    ): Promise<ServerCredentialResponse> {
        if (!this.util.isValidPoint(alpha)) {
            throw new Error(
                'Authentication failed @ C0. Alpha is not a group element.'
            );
        }
        const { clientOPRFKey, serverPrivateKey, clientPublicKey, envelope } =
            pepper;
        const beta = this.util.oprfRaiseScalarMult(alpha, clientOPRFKey);

        const {
            privateKey: serverSessionPrivateKey,
            publicKey: serverSessionPublicKey,
        } = this.util.generateKeyPair();

        const sessionOPRFKey = this.util.keyExchange(
            serverPrivateKey,
            serverSessionPrivateKey,
            clientPublicKey,
            clientSessionPublicKey
        );

        // SK = session key
        const sessionOPRF = this.util.oprfFUnmaskPointWithRandom(
            sessionOPRFKey,
            this.util.sodiumFromByte(0)
        );
        const serverAuthPublicKey = this.util.oprfFUnmaskPointWithRandom(
            sessionOPRFKey,
            this.util.sodiumFromByte(1)
        );
        const clientAuthPublicKey = this.util.oprfFUnmaskPointWithRandom(
            sessionOPRFKey,
            this.util.sodiumFromByte(2)
        );

        this.set('SK', sessionOPRF);
        this.set('Au', clientAuthPublicKey);

        return {
            beta: this.sodium.to_hex(beta),
            Xs: this.sodium.to_hex(serverSessionPublicKey),
            As: this.sodium.to_hex(serverAuthPublicKey),
            envelope: this.util.envelopeToStringEnvelope(envelope),
        };
    }

    public async serverFinalizeAuthenticate(
        clientAu: Uint8Array
    ): Promise<string> {
        // The comparable value of 0 means equality
        if (this.sodium.compare(this.get('Au'), clientAu) === 0) {
            const token = this.sodium.to_hex(this.get('SK'));
            return token;
        } else {
            throw new Error('Authentication failed');
        }
    }
}
