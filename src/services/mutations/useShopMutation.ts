import { useMutation, UseMutationOptions } from 'react-query';
import { url_api } from '../endpoints';
import requestApi from '../requestApi';
interface UseShopMutationOptions extends UseMutationOptions<any, any, any> {}


export function useShopFindMutation(options?: UseShopMutationOptions) {
    return useMutation<any, any, any>(
        (values: any) =>
            requestApi.post(url_api.shopFind + values.data.id, values.data, {}, 'json').then((res: any) => {
                return res;
            }),
        options
    );
}

