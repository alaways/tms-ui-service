import { useMutation, UseMutationOptions } from 'react-query'
import { url_api } from '../endpoints'

import axios from 'axios'

const mode = process.env.MODE || 'admin'

interface UseShopMutationOptions extends UseMutationOptions<any, any, any> { }

export function useUploadMutation(options?: UseShopMutationOptions) {

  return useMutation<any, any, any>(
    async (values: any) => {
      const userStore = localStorage.getItem(mode)
      const parsedUserStore = userStore ? JSON.parse(userStore) : null
      let data = new FormData()
      data.append('file', values.data.file)
      data.append('type', values.data.type)
      let config: any = {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${parsedUserStore?.access_token}`,
        },
      }
      // TODO 本地数据
      // process.env.BACKEND_URL + url_api.uploadfile
      return await axios.post('/api/v1' + url_api.uploadfile, data, config).then((res: any) => res.data)
    },
    options
  )
}

export function useUploadSignMutation(options?: UseShopMutationOptions) {

  return useMutation<any, any, any>(
    async (values: any) => {
      const userStore = localStorage.getItem(mode)
      const parsedUserStore = userStore ? JSON.parse(userStore) : null
      let data = new FormData()
      data.append('file', values.data.file)
      data.append('type', values.data.type)
      data.append('ref', values.data.ref)
      let config: any = {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${parsedUserStore?.access_token}`,
        },
      }
      return await axios.post(process.env.BACKEND_URL + url_api.uploadSignfile, data, config).then((res: any) => res.data)
    },
    options
  )
}

export function useOCRMutation(options?: any) {
  return useMutation<any, any, any>(
    async (values: any) => {
      const userStore = localStorage.getItem(mode)
      const parsedUserStore = userStore ? JSON.parse(userStore) : null
      let data = new FormData()
      data.append('image', values.data.image)
      let config: any = {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${parsedUserStore?.access_token}`,
        },
      }
      return await axios.post(process.env.BACKEND_URL + url_api.ocr, data, config).then((res: any) => res.data)
    },
    options
  )
}