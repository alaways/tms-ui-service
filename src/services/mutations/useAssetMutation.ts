import { useMutation, UseMutationOptions } from 'react-query';
import { url_api } from '../endpoints';
import requestApi from '../requestApi';

interface UseAssetMutationOptions extends UseMutationOptions<any, any, any> {}

export function useAssetFindMutation(options?: UseAssetMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.assetFind + values.data.id, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}

export function useAssetUpdateMutation(options?: UseAssetMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.assetUpdate + values.data.id, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}

export function useAssetImgDeleteMutation(options?: UseAssetMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.assetImgDetele + values.data.id, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}


export function useAssetAddtoShopMutation(options?: UseAssetMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.assetAddtoShop, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}
