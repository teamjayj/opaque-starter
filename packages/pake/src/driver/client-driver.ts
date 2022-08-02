import { ClientAuthFinishResponse, SerialData } from '../common';

export interface PakeClientDriver {
    /**
     * Initializes the driver.
     */
    initialize(): Promise<void>;

    /**
     * Invokes the password registration step as a client.
     *
     * @param password - plaintext password
     * @param userId - user identification such as username
     */
    registerInit(password: string, userId: string): Promise<SerialData>;

    registerFinish(
        serverResponseData: SerialData,
        userId: string,
        serverId: string
    ): Promise<SerialData>;

    /**
     * Invokes the password authentication step (log in) as a client.
     *
     * @param password - plaintext password
     */
    authInit(password: string): Promise<SerialData>;

    authFinish(
        serverResponseData: SerialData,
        userId: string,
        serverId: string
    ): Promise<ClientAuthFinishResponse>;
}
