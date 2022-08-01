type Opaque<K, T> = T & { __TYPE__: K };

/**
 * Hexadecimal string representation.
 */
export type HexString = Opaque<'HexString', string>;

/**
 * Types for serial data. Currently only supports hex strings.
 */
export type SerialData = HexString;
