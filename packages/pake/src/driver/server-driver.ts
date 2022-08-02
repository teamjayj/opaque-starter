import { SerialData, ServerAuthInitResponse } from '../common';

export interface PakeServerDriver {
    /**
     * Initializes the driver.
     */
    initialize(): Promise<void>;

    /**
     * Invokes the password registration step as a server.
     */
    registerInit(
        clientRequestData: SerialData,
        credentialId: string
    ): Promise<SerialData>;

    registerFinish(
        registrationRecordData: SerialData,
        credentialId: string,
        userId: string
    ): Promise<SerialData>;

    authInit(
        clientRequestData: SerialData,
        clientCredentialFileData: SerialData
    ): Promise<ServerAuthInitResponse>;

    authFinish(
        clientRequestData: SerialData,
        expectedAuthResultData: SerialData
    ): Promise<SerialData>;
}
