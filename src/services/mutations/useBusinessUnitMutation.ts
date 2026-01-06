import { useMutation, UseMutationOptions } from 'react-query';
import { url_api } from '../endpoints';
import requestApi from '../requestApi';

interface UseBusinessUnitMutationOptions extends UseMutationOptions<any, any, any> {}


export function useBusinessUnitFindAllMutation(options?: UseBusinessUnitMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.businessUnitFindAll, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}

export function useBusinessUnitFindMutation(options?: UseBusinessUnitMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.businessUnitFind + values.data.id, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}

export function useBusinessUnitUpdateMutation(options?: UseBusinessUnitMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.businessUnitUpdate + values.data.id, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}
