import {
    ClientCredentialRequest,
    ClientKeyExchangeRequest,
    ClientRegistrationRequest,
    Envelope,
    OpaqueNthPartyProtocol,
    OpaqueNthPartyUtil,
    OperationId,
    UserId,
} from '../common';
import Sodium from 'libsodium-wrappers-sumo';

export class OpaqueNthPartyProtocolClient extends OpaqueNthPartyProtocol {
    constructor(sodium: typeof Sodium, util: OpaqueNthPartyUtil) {
        super(sodium, util);
    }

    /**
     * Creates client registration request
     *s
     * @param password - plaintext password
     * @param userId - user identifier such as username
     * @param opId - operation ID
     * @returns
     */
    public async createRegistrationRequest(
        password: string,
        userId: UserId,
        opId?: OperationId
    ): Promise<ClientRegistrationRequest> {
        const hashedPassword = this.util.oprfKdfHashToPoint(password);

        return {
            userId,
            hashedPassword: this.sodium.to_hex(hashedPassword),
        };
    }

    public async clientBeginAuthenticate(
        password: string
    ): Promise<ClientCredentialRequest> {
        const hashedPassword = this.util.oprfKdfHashToPoint(password);
        const { point, mask } =
            this.util.oprfH1MaskPointWithRandom(hashedPassword);

        const r = this.util.generateRandomPoint();
        const alpha = this.util.oprfRaiseScalarMult(point, r);

        const {
            privateKey: clientSessionPrivateKey,
            publicKey: clientSessionPublicKey,
        } = this.util.generateKeyPair();

        this.set('r', r);
        this.set('xu', clientSessionPrivateKey);
        this.set('mask', mask);
        this.set('Xu', clientSessionPublicKey);

        return {
            alpha: this.sodium.to_hex(alpha),
            Xu: this.sodium.to_hex(clientSessionPublicKey),
        };
    }

    public async clientKeyExchangeAuthenticate(
        beta: Uint8Array,
        serverSessionPublicKey: Uint8Array,
        serverAuthPublicKey: Uint8Array,
        envelope: Envelope,
        iterations?: number | undefined
    ): Promise<ClientKeyExchangeRequest> {
        if (!this.util.isValidPoint(beta)) {
            throw new Error('Authentication failed @ C1');
        }

        const r = this.get('r');
        const mask = this.get('mask');

        const rInverse = this.sodium.crypto_core_ristretto255_scalar_invert(r);
        const rw = this.util.iteratedHash(
            this.util.oprfHUnmaskPoint(
                this.util.oprfRaiseScalarMult(beta, rInverse),
                mask
            ),
            iterations
        );

        const { encryptedClientPrivateKey, encryptedServerPublicKey } =
            envelope;

        const clientPrivateKey = this.util.sodiumAeadDecrypt(
            rw,
            encryptedClientPrivateKey
        );

        if (!this.util.isValidPoint(clientPrivateKey)) {
            throw new Error('Authentication failed @ C2');
        }

        const serverPublicKey = this.util.sodiumAeadDecrypt(
            rw,
            encryptedServerPublicKey
        );

        const clientSessionPrivateKey = this.get('xu');
        const sessionOPRFKey = this.util.keyExchange(
            clientPrivateKey,
            clientSessionPrivateKey,
            serverPublicKey,
            serverSessionPublicKey
        );

        const sessionOPRF = this.util.oprfFUnmaskPointWithRandom(
            sessionOPRFKey,
            this.util.sodiumFromByte(0)
        );
        const localServerAuthPublicKey = this.util.oprfFUnmaskPointWithRandom(
            sessionOPRFKey,
            this.util.sodiumFromByte(1)
        );
        const clientAuthPublicKey = this.util.oprfFUnmaskPointWithRandom(
            sessionOPRFKey,
            this.util.sodiumFromByte(2)
        );

        if (
            this.sodium.compare(
                localServerAuthPublicKey,
                serverAuthPublicKey
            ) !== 0
        ) {
            throw new Error('Authentication failed @C3');
        }

        return {
            Au: this.sodium.to_hex(clientAuthPublicKey),
        };
    }
}
