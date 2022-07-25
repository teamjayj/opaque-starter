/**
 * Converts hex string to Uint8Array. Works only in Node because it uses Buffer.
 *
 * @param str - hex string
 * @returns - Uint8Array representation
 */
export const hexStringToUint8Array = (str: string): Uint8Array =>
    Uint8Array.from(Buffer.from(str, 'hex'));
