import axios, { Method } from 'axios'

const METHOD_GET = 'GET'
const METHOD_POST = 'POST'
const METHOD_PUT = 'PUT'
const METHOD_DELETE = 'DELETE'
const METHOD_PATCH = 'PATCH'

type responseType = 'json' | 'text' | 'blob' | 'json'

const instance = axios.create()
const mode = process.env.MODE || 'admin'

async function requestAPIError(method: Method, url: string, headers = {}, dataBody: any, responseType: XMLHttpRequestResponseType) {

  const raw = JSON.stringify(dataBody)
  const myHeaders = new Headers(headers)

  myHeaders.append('Content-Type', 'application/json')

  if (localStorage.getItem(mode) !== null) {
    const userStore = localStorage.getItem(mode)
    const parsedUserStore = userStore ? JSON.parse(userStore) : null
    if (userStore !== '') {
      myHeaders.append('Authorization', `Bearer ${parsedUserStore.access_token}`)
    }
  }

  const requestOptions: any = {
    method: method,
    body: raw,
    headers: myHeaders,
    redirect: 'follow',
  }

  try {
    const response: any = await fetch(process.env.BACKEND_URL + url, requestOptions)
    if (!response.ok) {
      const errorData = await response.json()
      if (response.status !== 400) {
        if (response.status == 401) {
          localStorage.clear()
          const domain = `${window.location.protocol}//${window.location.host}`;
          const fullPath = `${domain}/apps/login`;
          window.location.href = fullPath;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }else {
        throw new Error(`HTTP error! status: ${errorData.message || response.status}`)
      }
    }

    if (response.status == 503 || response.statusCode == 503) {
      localStorage.clear()
      const domain = `${window.location.protocol}//${window.location.host}`;
      const fullPath = `${domain}/apps/maintenence`;
      window.location.href = fullPath;
    }
    switch (responseType) {
      case 'json':
        return await response.json()
      case 'text':
        return await response.text()
      case 'blob':
        return await response.blob()
      default:
        return response
    }
  } catch (error: any) {
    const message = error.message || 'An error occurred'
    if (message.includes('401')) {
      console.error('Unauthorized access')
    } else if (message.includes('404')) {
      console.error('Resource not found.')
    } else if (message.includes('500')) {
      console.error('Server error - try again later.')
    } else if (message.includes('503')) {
      localStorage.clear()
      const domain = `${window.location.protocol}//${window.location.host}`;
      const fullPath = `${domain}/apps/maintenence`;
      window.location.href = fullPath;
    } else {
      console.error('An unexpected error occurred.')
    }
    throw error
  }

}

export default {
  get(url: string, dataBody = {}, headers = {}, responseType = 'json' as responseType) {
    return requestAPIError(METHOD_GET, url, headers, dataBody, responseType)
  },
  post(url: string, dataBody: any, headers = {}, responseType = 'json' as responseType) {
    return requestAPIError(METHOD_POST, url, headers, dataBody, responseType)
  },
  patch(url: string, dataBody: any, headers = {}) {
    return requestAPIError(METHOD_PATCH, url, headers, dataBody, 'json')
  },
  put(url: string, dataBody: any, headers = {}) {
    return requestAPIError(METHOD_PUT, url, headers, dataBody, 'json')
  },
  delete(url: string, dataBody = {}, headers = {}) {
    return requestAPIError(METHOD_DELETE, url, headers, dataBody, 'json')
  },
}