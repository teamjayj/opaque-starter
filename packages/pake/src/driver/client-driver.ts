export interface PakeClientDriver {
    /**
     * Initializes the driver.
     */
    initialize(): Promise<void>;

    /**
     * Invokes the password registration step as a client.
     *
     * @param plaintextPassword - plaintext password
     * @param userId - user identification such as username
     */
    registerAsClient(plaintextPassword: string, userId: string): Promise<void>;

    /**
     * Invokes the password authentication step (log in) as a client.
     *
     * @param password - plaintext password
     * @param userId - user identification such as username
     */
    authenticateAsClient(password: string, userId: string): Promise<void>;
}
