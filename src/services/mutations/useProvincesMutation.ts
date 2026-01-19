import { useMutation, UseMutationOptions } from 'react-query';
import { url_api } from '../endpoints';
import requestApi from '../requestApi';

interface UseProvincesMutationOptions extends UseMutationOptions<any, any, any> {}

export function useDistrictMutation(options?: UseProvincesMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.district + values.id, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}


export function useSubDistrictMutation(options?: UseProvincesMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.subDistrict + values.id, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}

