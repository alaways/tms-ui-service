import { useMutation, UseMutationOptions } from 'react-query';
import { url_api } from '../endpoints';
import requestApi from '../requestApi';

interface UseCustomerMutationOptions extends UseMutationOptions<any, any, any> { }

export function useCustomerFindMutation(options?: UseCustomerMutationOptions) {
  return useMutation<any, any, any>(
    (values: any) =>
      requestApi.post(url_api.customerFind + values.data.id, values.data, {}, 'json').then((res: any) => {
        return res;
      }),
    options
  );
}

export function useCustomerUpdateMutation(options?: UseCustomerMutationOptions) {
  return useMutation<any, any, any>(
    (values: any) =>
      requestApi.post(url_api.customerUpdate + values.data.id, values.data, {}, 'json').then((res: any) => {
        return res;
      }),
    options
  );
}


