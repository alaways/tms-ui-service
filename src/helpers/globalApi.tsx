import { useMutation } from 'react-query'

import requestApi from '../services/requestApi'
import requestApiChat from '../services/requestApiChat'
import requestApiPayment from '../services/requestApiPayment'
import requestApiLine from '../services/requestApiLine'
import requestApiError from '../services/requestApiError'

export function useGlobalMutation(url: string, options?: any, params?: any) {
  return useMutation<any, any, any>(async (values: any) => {
    const apiUrl = values.id ? url + values.id : url
    const res = await requestApi.post(apiUrl, values.data, {}, 'json')
    return res
  }, options)
}

export function useGlobalErrorMutation(url: string, options?: any, params?: any) {
  return useMutation<any, any, any>(async (values: any) => {
    const apiUrl = values.id ? url + values.id : url
    const res = await requestApiError.post(apiUrl, values.data, {}, 'json')
    return res
  }, options)
}

export function useGlobalBlobMutation(url: string, options?: any, params?: any) {
  return useMutation<any, any, any>(async (values: any) => {
    const apiUrl = values.id ? url + values.id : url
    const res = await requestApi.post(apiUrl, values.data, {}, 'blob')
    return res
  }, options)
}

export function useGlobalChatMutation(url: string, options?: any, params?: any) {
  return useMutation<any, any, any>(async (values: any) => {
    const apiUrl = values.id ? url + values.id : url
    return requestApiChat.post(apiUrl, values.data, {}, 'json').then((res: any) => {
      return res
    })
  }, options)
}

export function useGlobalPaymentMutation(url: string, options?: any, params?: any) {
  return useMutation<any, any, any>(async (values: any) => {
    const apiUrl = values.id ? url + values.id : url
    return requestApiPayment.post(apiUrl, values.data, {}, 'json').then((res: any) => {
      return res
    })
  }, options)
}

export function useGlobalLineMutation(url: string, options?: any, params?: any) {
  return useMutation<any, any, any>(async (values: any) => {
    const apiUrl = values.id ? url + values.id : url
    if(options?.method == 'get') {
      return requestApiLine.get(apiUrl, values.data, {}, 'json').then((res: any) => {
        return res
      })
    } else {
      return requestApiLine.post(apiUrl, values.data, {}, 'json').then((res: any) => {
        return res
      })
    }
  }, options)
}