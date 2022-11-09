# opaque-starter

[![Node CI](https://github.com/teamjayj/opaque-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/teamjayj/opaque-starter/actions/workflows/ci.yml)

It is a monorepository containing packages relevant for the implementation of the [OPAQUE asymmetric PAKE (aPAKE) protocol](https://eprint.iacr.org/2018/163.pdf) in JavaScript/TypeScript.

This monorepo aims to create an abstraction layer on top of existing OPAQUE libraries, server frameworks, and front-end web frameworks/libraries.

## Packages

Each package has [TypeScript](https://www.typescriptlang.org/) support and targets ECMAScript 2015 (ES6) as its minimum version. Rollup was used to build each package.

The UML diagram below shows the abstraction and relationship among packages. The [bridge structural design pattern](https://en.wikipedia.org/wiki/Bridge_pattern) was used. Specific implementations of OPAQUE can be provided as pluggable and interchangeable drivers that OPAQUE clients and servers could use.

<img src="https://user-images.githubusercontent.com/27613092/200846404-62e43ce7-9e18-4f75-a629-2ad987042892.png" style="width: 400px; text-align: center; display: block;">

### Core

`@teamjayj/opaque-core` is the common package that provides an API needed by drivers, clients, and servers of `opaque-starter`.

### Drivers

`opaque-starter` has drivers for the existing JavaScript OPAQUE authentication libraries.

| Package                                    | Implementation                                                      |
| ------------------------------------------ | ------------------------------------------------------------------- |
| [`@teamjayj/opaque-cloudflare-driver`](https://github.com/teamjayj/opaque-starter/tree/main/packages/opaque-cloudflare-driver)       | [`@cloudflare/opaque-ts`](https://github.com/cloudflare/opaque-ts/) |
| [`@teamjayj/opaque-nthparty-driver`](https://github.com/teamjayj/opaque-starter/tree/main/packages/opaque-nthparty-driver) (Draft) | [`@nthparty/opaque`](https://github.com/nthparty/opaque)            |

### Servers

`opaque-starter` has available implementations of OPAQUE authentication in popular JavaScript server frameworks.

| Package                           | Server Framework                    |
| --------------------------------- | ----------------------------------- |
| [`@teamjayj/opaque-express-server`](https://github.com/teamjayj/opaque-starter/tree/main/packages/opaque-express-server) | [`express`](https://expressjs.com/) |

### Clients

`opaque-starter` has available implementations of OPAQUE authentication in popular JavaScript client or browser frameworks.

| Package                           | Server Framework                    |
| --------------------------------- | ----------------------------------- |
| [`@teamjayj/opaque-axios-client`](https://github.com/teamjayj/opaque-starter/tree/main/packages/opaque-axios-client) | [`axios`](https://axios-http.com/) |

## Utilities

This turborepo uses [Yarn v1](https://classic.yarnpkg.com/lang/en/) as a package manager. It includes the following tools:

-   [TypeScript](https://www.typescriptlang.org/) for static type checking
    -   `tsconfig` - `tsconfig.json`s used throughout the monorepo
-   [ESLint](https://eslint.org/) for code linting

    -   `eslint-config-custom` - `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)

-   [Prettier](https://prettier.io) for code formatting
-   [Vitest](https://vitest.dev/) for unit testing

## Setup

This repository is used in the `npx create-turbo` command, and selected when choosing which package manager you wish to use with your monorepo (Yarn).

### Build

To build all packages, run the following command:

```
cd opaque-starter
yarn build
```

### Test

To run the tests of all packages, run the following command:

```
cd opaque-starter
yarn test
```
