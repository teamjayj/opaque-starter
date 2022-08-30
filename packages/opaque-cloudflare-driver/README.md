# @teamjayj/opaque-cloudflare-driver

An `opaque-starter` driver for the [`@cloudflare/opaque-ts`](https://github.com/cloudflare/opaque-ts/) implementation.

[![NPM](https://nodei.co/npm/@teamjayj/opaque-cloudflare-driver.png)](https://www.npmjs.com/package/@teamjayj/opaque-cloudflare-driver)

## Warning

This package is currently at an unstable release and only suited for experimentation. Use at your own risk.

## Details

The `@cloudflare/opaque-ts` implementation adheres to the [`draft-irtf-cfrg-opaque-07`](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-opaque-07) specification.

## Usage

This driver is meant to used by an `opaque-starter` client or server such as `@teamjayj/opaque-express-server`.

### Server driver

Instantiate the server driver with a specified server ID and cipher suite used for OPAQUE authentication.

```typescript
const serverDriver = new OpaqueCloudflareServerDriver(
    'server-id',
    OpaqueCipherSuite.P256_SHA256
);
```

### Client driver

Instantiate the client driver with a specified cipher suite used for OPAQUE authentication.

```typescript
const clientDriver = new OpaqueCloudflareClientDriver(
    OpaqueCipherSuite.P256_SHA256
);
```
