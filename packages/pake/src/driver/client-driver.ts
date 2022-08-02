import { ClientAuthFinishResponse, SerialData } from '../common';

export interface PakeClientDriver {
    /**
     * Initializes the driver.
     */
    initialize(): Promise<void>;

    /**
     * Initializes the password registration step and creates a request
     * for the server to process.
     *
     * @param password - plaintext password
     * @param userId - user identifier such as username
     *
     * @returns serialized registration request
     */
    registerInit(password: string, userId: string): Promise<SerialData>;

    /**
     * Creates a registration record for the server after initializing password
     * registration.
     *
     * @param serverResponseData - serialized response from the server's `registerInit` step
     * @param userId - user identifier such as username
     * @param serverId - server identifier such as hostname
     *
     * @returns serialized registration record
     */
    registerFinish(
        serverResponseData: SerialData,
        userId: string,
        serverId: string
    ): Promise<SerialData>;

    /**
     * Initializes the authentication step and creates a request for the first
     * key exchange (`KE1`) with server.
     *
     * @param password - plaintext password
     *
     * @returns serialized authentication request containing data for `KE1`
     */
    authInit(password: string): Promise<SerialData>;

    /**
     * Performs the second key exchange (`KE2`) and creates a request for the
     * last key exchange (`KE3`) with server.
     *
     * @param serverResponseData - serialized response from the server's `authInit` step
     * @param userId - user identifier such as username
     * @param serverId - server identifier such as hostname
     *
     * @returns serialized authentication request containing data for `KE3`
     * and client session key
     */
    authFinish(
        serverResponseData: SerialData,
        userId: string,
        serverId: string
    ): Promise<ClientAuthFinishResponse>;
}
