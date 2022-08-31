# @teamjayj/opaque-express-server

An `opaque-starter` server for [`express`](https://expressjs.com/). It simplifies the creation of an OPAQUE registration and authentication server.

[![NPM](https://nodei.co/npm/@teamjayj/opaque-express-server.png)](https://www.npmjs.com/package/@teamjayj/opaque-express-server)

## Warning

This package is currently at an unstable release and only suited for experimentation. Use at your own risk.

## Usage

Instantiate an OPAQUE server by specifying a driver. In this example, the `@teamjayj/opaque-cloudflare-driver` is used.

The server will initialize the driver for you. After getting a server instance, create its routes.

```typescript
import { createServer } from '@teamjayj/opaque-express-server';

const opaqueServer = await createServer({
    driver: new OpaqueCloudflareServerDriver(
        'server-id',
        OpaqueCipherSuite.P256_SHA256
    ),
});

opaqueServer.createRoutes(app);
```

### Configuration

You may configure the following optional properties of the server:

-   `stores` - specify implementations used for the server's credential and session store. It defaults to in-memory stores.
-   `routes` - specify the endpoint names used for registration and authentication.
-   `generators` - specify the functions used to generate credential and session IDs. It defaults to just using user IDs for credential IDs and `uuidv4` for session IDs.

### Routes

The OPAQUE server will provide the following routes by default:

-   `POST /register-init` - expects serialized `data` from `clientRegisterInit` step and `userId` from the request body.
-   `POST /register-finish` - expects serialized `data` from `clientRegisterFinish` step and `userId` from the request body.
-   `POST /auth-init` - expects serialized `data` from `clientAuthInit` step and `userId` from the request body.
-   `POST /auth-finish` - expects serialized `data` from `clientAuthFinish` step and `sessionId` from the request body.
