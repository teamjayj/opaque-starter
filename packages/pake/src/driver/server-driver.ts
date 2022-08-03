import { ServerAuthInitResponse } from '../common';

export interface PakeServerDriver {
    /**
     * Initializes the driver.
     */
    initialize(): Promise<void>;

    /**
     * Accommodates an initial registration request of a client.
     *
     * @param credentialId - credential identifier
     *
     * @returns serialized registration response
     */
    registerInit(
        clientRequestData: Uint8Array,
        credentialId: string
    ): Promise<Uint8Array>;

    /**
     * Finishes the password registration step, processes a client registration
     * record, and creates a credential file for storing.
     *
     * @param registrationRecordData
     * @param credentialId - credential identifier
     * @param userId - user identifier such as username
     *
     * @returns serialized credential file
     */
    registerFinish(
        registrationRecordData: Uint8Array,
        credentialId: string,
        userId: string
    ): Promise<Uint8Array>;

    /**
     * Recovers the credential file of a client by performing the first key exchange
     * (`KE1`).
     *
     * @param clientRequestData - serialized request from client's `authInit` step
     * @param clientCredentialFileData - serialized credential file of client recovered from a persistent store
     *
     * @returns serialized authentication response containing data for `KE2`
     */
    authInit(
        clientRequestData: Uint8Array,
        clientCredentialFileData: Uint8Array
    ): Promise<ServerAuthInitResponse>;

    /**
     * Finishes the password authentication step and performs the last key exchange
     * (`KE3`).
     * @param clientRequestData - serialized request from client's `authFinish` step
     * @param expectedAuthResultData - serialized expected auth data recovered from server's `authInit` step
     *
     * @returns serialized authentication response containing server session key
     */
    authFinish(
        clientRequestData: Uint8Array,
        expectedAuthResultData: Uint8Array
    ): Promise<Uint8Array>;
}
