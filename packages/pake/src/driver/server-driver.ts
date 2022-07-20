export interface PakeServerDriver {
    /**
     * Initializes the driver.
     */
    initialize(): Promise<void>;

    /**
     * Invokes the password registration step as a server.
     */
    registerAsServer(): Promise<void>;

    /**
     * Invokes the password authentication step as a server.
     */
    authenticateAsServer(): Promise<void>;
}
