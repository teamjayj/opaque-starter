export type Pepper = {
    ks: any;
    ps: any;
    Ps: any;
    Pu: any;
    c: {
        pu: {
            mac_tag: any;
            body: any;
        };
        Pu: {
            mac_tag: any;
            body: any;
        };
        Ps: {
            mac_tag: any;
            body: any;
        };
    };
};

export type UserRecord = {
    id: any;
    pepper: Pepper;
};

export interface OpaqueNthPartyProtocol {
    clientRegister(
        password: string,
        userId: string,
        opId?: string
    ): Promise<void>;

    serverRegister(iterations?: number, opId?: string): Promise<UserRecord>;

    /**
     *
     * @param password - plaintext password
     * @param userId - user identification
     * @param iterations - number of salting iterations
     * @param opId - operation id
     *
     * @returns token on successful authentication
     */
    clientAuthenticate(
        password: string,
        userId: string,
        iterations?: number,
        opId?: string
    ): Promise<string>;

    serverAuthenticate(
        userId: string,
        pepper: Pepper,
        opId?: string
    ): Promise<string>;
}
