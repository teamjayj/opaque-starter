import { OpaqueClientConfig } from '@teamjayj/opaque-core';
import { Axios } from 'axios';
import { OpaqueAxiosClient } from './axios-client';

export const createClient = async (
    axiosInstance: Axios,
    config: OpaqueClientConfig
): Promise<OpaqueAxiosClient> => {
    const client = new OpaqueAxiosClient(axiosInstance, config);
    await client.initialize();
    return client;
};
