import { OpaqueID } from '@cloudflare/opaque-ts';
import { OpaqueCipherSuite } from '@teamjayj/opaque-core';

export const getOpaqueIDFromSuite = (
    cipherSuite: OpaqueCipherSuite
): OpaqueID => {
    switch (cipherSuite) {
        case OpaqueCipherSuite.P256_SHA256:
            return OpaqueID.OPAQUE_P256;
        case OpaqueCipherSuite.P384_SHA384:
            return OpaqueID.OPAQUE_P384;
        case OpaqueCipherSuite.P521_SHA521:
            return OpaqueID.OPAQUE_P521;
    }
};
