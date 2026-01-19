import { ImageListType } from 'react-images-uploading'

import Swal from 'sweetalert2'
import imageCompression from 'browser-image-compression'

import { toastAlert } from './constant'

export const checkFileSize = (imageList: ImageListType) => {
  const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
  const validImages = imageList.filter((image) => {
    if (image.file && image.file.size > MAX_SIZE) {
      const toast = Swal.mixin(toastAlert)
      toast.fire({
        icon: 'error',
        title: 'อัพโหลดไฟล์ที่มีขนาดต่ำกว่า 2 MBเท่านั้น',
        padding: '10px 20px',
      })
      return false
    }
    return true
  })
  return validImages
}

export const resizeImage = async (imageList: ImageListType) => {
  const MAX_SIZE_MB = 2 // 2 MB
  const options = {
    maxWidthOrHeight: 1920,
    maxSizeMB: MAX_SIZE_MB,
    useWebWorker: true,
  }
  const compressedImages = await Promise.all(
    imageList.map(async (image) => {
      if (image.file && image.file.size / 1024 / 1024 > MAX_SIZE_MB) {
        try {
          const compressedBlob = await imageCompression(image.file, options)
          const compressedFile = new File([ compressedBlob ], image.file.name, { type: image.file.type })
          return {
            ...image,
            file: compressedFile,
            dataURL: await imageCompression.getDataUrlFromFile(compressedFile),
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดในการบีบอัดรูปภาพ',
            padding: '10px 20px',
          })
          return image
        }
      }
      return image
    })
  )
  return compressedImages
}

export const resizeImageByMaxHeight = async ( imageList: ImageListType, maxHeight: number ) => {
  const compressedImages = await Promise.all(
    imageList.map(async (image) => {
      if (image.file) {
        try {
          const fileType = image.file.type
          const fileName = image.file.name
          const img = new Image()
          img.src = URL.createObjectURL(image.file)
          return new Promise((resolve) => {
            img.onload = async function (event) {
              URL.revokeObjectURL(img.src)
              const canvas = document.createElement('canvas')
              if (maxHeight !== 0 && img.height > maxHeight) {
                canvas.width = img.width * (maxHeight / img.height)
                canvas.height = maxHeight
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, canvas.width, maxHeight)
                const base64String = canvas.toDataURL(fileType)
                return new Promise((resolve2) => {
                  canvas.toBlob((blob: any) => {
                    image.dataURL = base64String
                    image.file = new File([ blob ], fileName, {
                      type: fileType,
                      lastModified: new Date().getTime()
                    })
                    resolve(image)
                  }, fileType)
                })
              }
              resolve(image)
            }
          })
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดในการปรับขนาดรูปภาพ',
            padding: '10px 20px',
          })
          return image
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาดในการปรับขนาดรูปภาพ',
          padding: '10px 20px',
        })
        return image
      }
    })
  )
  return compressedImages
}

const getMenuAction = () => {
  const selectorButton = window.location.pathname.split('/').filter((path: any) => path !== '' && path !== 'pawn'  )
  return selectorButton
}

const getAction = () => {
  const selectorButton = window.location.pathname.split('/').filter((path: any) => path !== '' && path !== 'pawn' )

  return ''
}

export const setMenuActive = () => {
  setTimeout(() => {
    const selectorActive: NodeList = document.querySelectorAll('a[class="group active"],a[class="active"],button[class="active nav-link group w-full"],button[class="nav-link group w-full active"]')
    if (selectorActive !== undefined && selectorActive.length > 0) {
      Array.from(selectorActive).map((item: any, index: number) => {
        if (item.pathname !== window.location.pathname) {
          item.classList.remove('active')
        }
      })
    }
    const selector: any = document.querySelector('a[href="' + window.location.pathname + '"]')
    if (selector !== null) { selector.classList.add('active') }
    const selectorButton = getMenuAction()
   
  //   if (selectorButton && selectorButton.length === 6 && selectorButton[4] === 'edit') {
  //     const selector: any = document.querySelector('[data-menu="' + selectorButton[3] + '"]')
  //     if (selector) { selector.classList.add('active') }
  //     const selectorSub = document.querySelector('a[href="/' + selectorButton[1] + '/' + selectorButton[2] + '/' + selectorButton[3] + '"]')
  //     if (selectorSub) { selectorSub.classList.add('active') }
  //     return
  //   }
  //   if (selectorButton && selectorButton.length === 5 && selectorButton[4].length >= 20) {
  //     const selector: any = document.querySelector('[data-menu="' + selectorButton[3] + '"]')
  //     if (selector) { selector.classList.add('active') }
  //     const selectorSub = document.querySelector('a[href="/' + selectorButton[1] + '/' + selectorButton[2] +  '/' + selectorButton[3] + '"]')
  //     if (selectorSub) { selectorSub.classList.add('active') }
  //     return
  //   }
  //   if (selectorButton && selectorButton.length === 5 && selectorButton[3] === 'edit') {
  //     const selector: any = document.querySelector('[data-menu="' + selectorButton[2] + '"]')
  //     if (selector) { selector.classList.add('active') }
  //     const selectorSub = document.querySelector('a[href="/' + selectorButton[1] + '/' + selectorButton[2] + '"]')
  //     if (selectorSub) { selectorSub.classList.add('active') }
  //     return
  //   }
  //   if (selectorButton && selectorButton.length === 4 && selectorButton[3].length >= 20) {
  //     const selector: any = document.querySelector('[data-menu="' + selectorButton[2] + '"]')
  //     if (selector) { selector.classList.add('active') }
  //     return
  //   }
  //   if (selectorButton && selectorButton.length === 4) {
  //     const selector: any = document.querySelector('[data-menu="' + selectorButton[3] + '"]')
  //     if (selector) { selector.classList.add('active') }
  //     return
  //   }
  //   if (selectorButton && selectorButton.length === 3) {
  //     const selector: any = document.querySelector('[data-menu="' + selectorButton[2] + '"]')
  //     if (selector) { selector.classList.add('active') }
  //     return
  //   }
  }, 100)
}

export const setSubMenuActive = () => {
  setTimeout(() => {
    let selector: any = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]')
    if (selector === null) {
      const selectorButton = window.location.pathname.split('/')
  //     if (selectorButton && selectorButton.length === 6 && selectorButton[4] === 'edit') {
  //       selector = document.querySelector('.sidebar ul a[href="/' + selectorButton[1] + '/' + selectorButton[2] + '/' + selectorButton[3] + '"]')
  //     }
  //     if (selectorButton && selectorButton.length === 5 && selectorButton[3] === 'edit') {
  //       selector = document.querySelector('.sidebar ul a[href="/' + selectorButton[1] + '/' + selectorButton[2] + '"]')
  //     }
  //     if (selectorButton && selectorButton.length === 5 && selectorButton[4].length >= 20) {
  //       selector = document.querySelector('.sidebar ul a[href="/' + selectorButton[1] + '/' + selectorButton[2] + '/' + selectorButton[3] + '"]')
  //     }
  //     if (selectorButton && selectorButton.length === 4 && selectorButton[3].length >= 20) {
  //       selector = document.querySelector('.sidebar ul a[href="/' + selectorButton[1] + '/' + selectorButton[2] + '"]')
  //     }
    }
    if (selector) {
      selector.classList.add('active')
      const ul: any = selector.closest('ul.sub-menu')
      if (ul !== null) {
        let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || []
        if (ele.length) { ele = ele[0]; setTimeout(() => { ele.click() }) }
      }
    }
  }, 100)
}

export const validateEmail = (email: any) => { 
  const re = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i
  return re.test(email.toLowerCase())
}