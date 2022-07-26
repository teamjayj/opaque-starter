# opaque-nthparty-driver

A rewritten implementation of [`@nthparty/opaque`](https://github.com/nthparty/opaque) (version `0.3.0`) in TypeScript with updated types and dependencies.

## Details

This implementation references the [`draft-krawczyk-cfrg-opaque-06`](https://datatracker.ietf.org/doc/html/draft-krawczyk-cfrg-opaque-06) specification. In the JavaScript implementation, the following are observed:

-   It uses [`ristretto255`](https://ristretto.group/), provided by `libsodium-wrappers-sumo`, for constructing prime-order groups.
-   It uses `SHA512-HMAC` on top of `ChaCha20Poly1305` for encryption and decryption.
-   The password registration protocol is [not completely oblivious](https://github.com/nthparty/opaque/issues/1).

## Dependencies

| Purpose | Library                                                                            | Version   |
| ------- | ---------------------------------------------------------------------------------- | --------- |
| Crypto  | [`libsodium-wrappers-sumo`](https://www.npmjs.com/package/libsodium-wrappers-sumo) | `^0.7.10` |
| OPRF    | [`oprf`](https://www.npmjs.com/package/oprf)                                       | `^2.0.0`  |
