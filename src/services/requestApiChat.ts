import { Method } from 'axios'

const METHOD_GET = 'GET'
const METHOD_POST = 'POST'
const METHOD_PUT = 'PUT'
const METHOD_DELETE = 'DELETE'
const METHOD_PATCH = 'PATCH'

type responseType = 'json' | 'text' | 'blob' | 'json'

const mode = process.env.MODE || 'admin'

async function requestAPIChat(method: Method, url: string, headers = {}, dataBody: any, responseType: XMLHttpRequestResponseType) {

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
    const response: any = await fetch(process.env.CHAT_URL + url, requestOptions).catch((error) => console.error(error))
    if (!response.ok) {
      if (response.status !== 400) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
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
      // localStorage.clear()
      console.error('Unauthorized access')
    } else if (message.includes('404')) {
      console.error('Resource not found.')
    } else if (message.includes('500')) {
      console.error('Server error - try again later.')
    } else if (message.includes('503')) {
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
    return requestAPIChat(METHOD_GET, url, headers, dataBody, responseType)
  },
  post(url: string, dataBody: any, headers = {}, responseType = 'json' as responseType) {
    return requestAPIChat(METHOD_POST, url, headers, dataBody, responseType)
  },
  patch(url: string, dataBody: any, headers = {}) {
    return requestAPIChat(METHOD_PATCH, url, headers, dataBody, 'json')
  },
  put(url: string, dataBody: any, headers = {}) {
    return requestAPIChat(METHOD_PUT, url, headers, dataBody, 'json')
  },
  delete(url: string, dataBody = {}, headers = {}) {
    return requestAPIChat(METHOD_DELETE, url, headers, dataBody, 'json')
  },
}