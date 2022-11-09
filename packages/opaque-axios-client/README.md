# @teamjayj/opaque-axios-client

An `opaque-starter` client for [`axios`](https://axios-http.com/). It simplifies the creation of an OPAQUE registration and authentication client.

[![NPM](https://nodei.co/npm/@teamjayj/opaque-axios-client.png)](https://www.npmjs.com/package/@teamjayj/opaque-axios-client)

## Warning

This package is currently at an unstable release and only suited for experimentation. Use at your own risk.

## Usage

Instantiate an OPAQUE client by specifying a driver. In this example, the `@teamjayj/opaque-cloudflare-driver` is used and there is an OPAQUE server running on `http://localhost:3101` with an ID of `server-id`.

The client will initialize the driver for you. After getting a client instance, you can invoke the `register` and `login` operations. It will handle the sending and exchanging of OPAQUE requests.

```typescript
import axios from 'axios';
import { createClient } from '@teamjayj/opaque-axios-client';

const axiosInstance = axios.create();

const opaqueClient = await createClient(axiosInstance, {
    driver: new OpaqueCloudflareClientDriver(OpaqueCipherSuite.P256_SHA256),
    server: {
        id: 'server-id',
        hostname: 'http://localhost:3101',
    },
});

opaqueClient.register('bob', 'password');
opaqueClient.login('bob', 'password');
```

### Configuration

You need to configure the following properties of the client:

-   `server` - specify the details of the OPAQUE server to connect with.
    -   `id` - the server id of the OPAQUE server.
    -   `hostname` - the hostname of the server in URL form (expects the `http` or `https` prefix).
    -   `routes` - _(optional)_. the route configuration of the OPAQUE server endpoints.

### Routes

The OPAQUE client will assume the existence of the following routes in the OPAQUE server by default:

-   `POST /register-init`
-   `POST /register-finish`
-   `POST /auth-init`
-   `POST /auth-finish`

The routes above are the default routes generated by `@teamjayj/opaque-express-server`.