import { useEffect, useState, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import Swal from 'sweetalert2'

import moment from 'moment-timezone'
import { useDispatch } from 'react-redux'

import { setPageTitle } from '../../../store/themeConfigSlice'
import { useGlobalBlobMutation, useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'

import { PDFDocument } from 'pdf-lib'

import PreLoading from '../../../helpers/preLoading'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import Carousel from '../../../components/HOC/Carousel'

import Lightbox from 'react-18-image-lightbox'

import IconDownload from '../../../components/Icon/IconDownload'
import IconShare from '../../../components/Icon/IconShare'
import IconCopy from '../../../components/Icon/IconCopy'

import 'react-18-image-lightbox/style.css'

const ContractSignPreview = () => {

  const { uuid } = useParams()
  const dispatch = useDispatch()

  const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    padding: '10px 20px',
  })

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const type = queryParams.get('type')
  const deployMode = process.env.DEPLOY || 'local'
  const webUrl = deployMode == 'local' ? '' : process.env.WEB_CUSTOMER_URL

  const [contractData,setContractData] = useState<any>()
  const [pdfObjectUrl, setPdfObjectUrl] = useState(null)
  const [pdfObjectUrl2, setPdfObjectUrl2] = useState(null)
  const [pdfObjectUrl3, setPdfObjectUrl3] = useState(null)
  const [pdfObjectUrl4, setPdfObjectUrl4] = useState(null)

  const [isOpenPic, setIsOpenPic] = useState(false)
  const [pictureURL, setPictureURL] = useState('')
  const [reference, setReference] = useState('')

  const [showBottomButton, setBottomTopButton] = useState(true)

  // const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [generateDataLink, setGenerateDataLink] = useState<string>('')

  const breadcrumbItems = [
    { to: '/apps/contract/list', label: 'สัญญา' },
    { label: 'PDF สัญญา', isCurrent: true },
  ]

  const { mutate: fetchContract} = useGlobalMutation(url_api.contractFindData + `${uuid}/?tab=contract`, {
    onSuccess: (res:any) => {
      if(res.statusCode == 200){
        setContractData(res.data)
      }
    },
    onError: (error: any) => {
      toast.fire({ icon: 'error', title: 'ไม่พบสัญญา' })
    },
  })

  const { mutate: fetchPDF, isLoading: isFetchingPdf } = useGlobalBlobMutation(url_api.contractPDF + uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const objectUrl: any = window.URL.createObjectURL(blob)
      setPdfObjectUrl(objectUrl)
    },
    onError: (error: any) => {
      toast.fire({ icon: 'error', title: 'ไม่สามารถโหลดไฟล์ PDF ได้' })
    },
  })

  const { mutate: fetchPDFPdPa, isLoading: isFetchingPdfPDA } = useGlobalBlobMutation(url_api.contractPDPA + uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const objectUrl: any = window.URL.createObjectURL(blob)
      setPdfObjectUrl2(objectUrl)
    },
    onError: (error: any) => {
      toast.fire({ icon: 'error', title: 'ไม่สามารถโหลดไฟล์ PDF ได้' })
    },
  })

  const { mutate: fetchCardID, isLoading: isFetchingCardID } = useGlobalBlobMutation(url_api.contractCardID + uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const objectUrl: any = window.URL.createObjectURL(blob)
      setPdfObjectUrl3(objectUrl)
    },
    onError: (error: any) => {
      toast.fire({ icon: 'error', title: 'ไม่สามารถโหลดไฟล์ PDF ได้' })
    },
  })

  const { mutate: fetchPdfReceipt, isLoading: isFetchingReceipt } = useGlobalBlobMutation(url_api.contractRC + uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const objectUrl: any = window.URL.createObjectURL(blob)
      setPdfObjectUrl4(objectUrl)
    },
    onError: (error: any) => {
      toast.fire({ icon: 'error', title: 'ไม่สามารถโหลดไฟล์ PDF ได้' })
    },
  })

  const { mutateAsync: generateLink, isLoading: isGeneratingLink } = useGlobalMutation(url_api.createLinkSignature, {
    onSuccess: (res: any) => {
      if (res.data?.token) {
        let typeUrl = ''
        if (type == 'refinance') {
          typeUrl = '&type=refinance'
        }
        let signatureUrl
        if (webUrl) {
          signatureUrl = `${webUrl}/contract/signature/${res.data.token}?openExternalBrowser=1${typeUrl}&business_unit=${contractData?.reference?.slice(0,3)}`
        } else {
          signatureUrl = `${window.location.origin}/contract/signature/${res.data.token}?openExternalBrowser=1${typeUrl}&business_unit==${contractData?.reference?.slice(0,3)}`
        }
        setGenerateDataLink(signatureUrl)
        toast.fire({ icon: 'success', title: 'สร้างลิงก์สำหรับลูกค้าแล้ว!' })
        // navigator.clipboard
        //     .writeText(signatureUrl)
        //     .then(() => toast.fire({ icon: 'success', title: 'คัดลอกลิงก์สำหรับลูกค้าแล้ว!' }))
        //     .catch((err) => {
        //         const success = copyFallback(signatureUrl)
        //         if (success) {
        //             toast.fire({ icon: 'success', title: 'คัดลอกลิงก์สำหรับลูกค้าแล้ว!' })
        //         } else {
        //             toast.fire({ icon: 'error', title: 'ไม่สามารถคัดลอกลิงก์' })
        //         }
        //     })
        // setIsGeneratingLink(false)
      } else {
        toast.fire({ icon: 'error', title: res.data?.message || 'ไม่สามารถสร้างลิงก์ได้' })
        // setIsGeneratingLink(false)
      }
    },
    onError: (error: any) => toast.fire({ icon: 'error', title: 'เกิดข้อผิดพลาดในการสร้างลิงก์' }),
  })

  const copyFallback = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '') // สำคัญสำหรับ iOS
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length) // สำคัญสำหรับ iOS
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  }

  const onScrollHandler = () => {
    if (document.documentElement.scrollTop > 50 && (document.documentElement.scrollTop + window.innerHeight) - document.documentElement.scrollHeight >= -50) {
      setBottomTopButton(false)
    } else {
      setBottomTopButton(true)
    }
  } 

  useEffect(() => {
    dispatch(setPageTitle('PDF สัญญา'))
    if (uuid) {
      fetchContract({})
      fetchPDF({})
      fetchPDFPdPa({})
      fetchCardID({})
      if (type == 'refinance') {
        fetchPdfReceipt({})
      }
    }
  }, [uuid, dispatch])

  useEffect(() => {
    return () => {
      if (pdfObjectUrl) {
        window.URL.revokeObjectURL(pdfObjectUrl)
      }
    }
  }, [pdfObjectUrl])

  useEffect(() => {
    return () => {
      if (pdfObjectUrl2) {
        window.URL.revokeObjectURL(pdfObjectUrl2)
      }
    }
  }, [pdfObjectUrl2])

  useEffect(() => {
    return () => {
      if (pdfObjectUrl3) {
        window.URL.revokeObjectURL(pdfObjectUrl3)
      }
    }
  }, [pdfObjectUrl3])

  useEffect(() => {
    return () => {
      if (pdfObjectUrl4) {
        window.URL.revokeObjectURL(pdfObjectUrl4)
      }
    }
  }, [pdfObjectUrl4])

  useEffect(() => {
    window.addEventListener('scroll', onScrollHandler)
    return () => {
      window.removeEventListener('onscroll', onScrollHandler)
    }
  }, [])

  const handleDownload = async () => {
    if (!pdfObjectUrl || !pdfObjectUrl2 || !pdfObjectUrl3 || (type == 'refinance' && !pdfObjectUrl4)) {
      alert('ยังไม่มี PDF ทั้งสองไฟล์')
      return
    }
    try {
      // สร้าง PDF ใหม่
      const mergedPdf = await PDFDocument.create()
      // ฟังก์ชันโหลด PDF จาก URL และ copy pages ไป PDF ใหม่
      const fetchAndCopyPages = async (url: string) => {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`โหลด PDF จาก ${url} ไม่สำเร็จ`)
        const arrayBuffer = await response.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }
      // รวมไฟล์ทั้งสอง
      await fetchAndCopyPages(pdfObjectUrl)
      await fetchAndCopyPages(pdfObjectUrl2)
      await fetchAndCopyPages(pdfObjectUrl3)
      if (type == 'refinance' && pdfObjectUrl4) {
        await fetchAndCopyPages(pdfObjectUrl4)
      }
      // แปลง PDF เป็น bytes
      const mergedPdfBytes = await mergedPdf.save()
      // แปลงเป็น Uint8Array เพื่อให้ TypeScript รับรอง
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' })
      const mergedUrl = URL.createObjectURL(blob)
      // ดาวน์โหลดไฟล์
      const link = document.createElement('a')
      link.href = mergedUrl
      link.download = `${reference || 'contract'}_${moment().utc().format('DD-MM-yyyy')}.pdf`
      link.click()
      // Cleanup
      URL.revokeObjectURL(mergedUrl)
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการรวม PDF:', error)
      alert('เกิดข้อผิดพลาดในการรวม PDF')
    }
  }

  const handleCreateLink = async () => {
    // หน้าที่ของฟังก์ชันนี้คือการสร้าง "ลิงก์" หรือ "กุญแจ" เท่านั้น
    // ไม่จำเป็นต้องส่งข้อมูล PDF ไปจากตรงนี้
    // เพราะหน้า CustomerSignaturePage จะใช้กุญแจที่ได้ไปดึงข้อมูล PDF เอง
    if (isGeneratingLink) return
    // setIsGeneratingLink(true)
    await generateLink({ data: { id_contract: uuid } }) // API จริง
    // setTimeout(() => {
    //     const mockResponse = { data: { signature_uuid: crypto.randomUUID() } }
    //     const signatureUrl = `${window.location.origin}/contract/signature/${uuid}`
    //     navigator.clipboard.writeText(signatureUrl)
    //         .then(() => toast.fire({ icon: 'success', title: 'คัดลอกลิงก์ แล้ว!' }))
    //         .catch(err => toast.fire({ icon: 'error', title: 'ไม่สามารถคัดลอกลิงก์' }))
    //     setIsGeneratingLink(false)
    // }, 1000)
  }

  const onCopyLinkHandler = () => {
    if (generateDataLink) {
      navigator.clipboard.writeText(generateDataLink)
      toast.fire({ icon: 'success', title: 'คัดลอกลิงก์สำหรับลูกค้าแล้ว!' })
    }
  }

  const previewContent = () => {
    return (
      <div className="upload-container mb-10">
        {isFetchingPdf || isFetchingPdfPDA || isFetchingCardID || isFetchingReceipt ? (
          <p className="text-center text-gray-600">กำลังโหลด PDF...</p>
        ) : pdfObjectUrl ? (
          <div className="pdf-viewer-container space-y-10">
            {/* Section 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-left text-xl font-bold mb-4 text-gray-800">1. รายละเอียดสัญญา</h2>
              <iframe src={`${pdfObjectUrl}#toolbar=0`} width="100%" height="600px" className="border rounded-xl shadow-md w-full" title="PDF Preview - Contract"></iframe>
            </div>
            {/* Section 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-left text-xl font-bold mb-4 text-gray-800">2. PDPA</h2>
              <iframe src={`${pdfObjectUrl2}#toolbar=0`} width="100%" height="600px" className="border rounded-xl shadow-md w-full" title="PDF Preview - PDPA"></iframe>
            </div>
            {/* Section 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-left text-xl font-bold mb-4 text-gray-800">3. สำเนาบัตรประชาชน</h2>
              <iframe src={`${pdfObjectUrl3}#toolbar=0`} width="100%" height="600px" className="border rounded-xl shadow-md w-full" title="PDF Preview - PDPA"></iframe>
            </div>
            {/* Section 4 */}
            {type == 'refinance' &&
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-left text-xl font-bold mb-4 text-gray-800">4. ใบเสร็จรับเงิน</h2>
                <iframe src={`${pdfObjectUrl4}#toolbar=0`} width="100%" height="600px" className="border rounded-xl shadow-md w-full" title="PDF Preview - PDPA"></iframe>
              </div>
            }
          </div>
        ) : (
          <p className="text-center text-gray-500">ไม่พบไฟล์สัญญา</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {(isFetchingPdf || isGeneratingLink) && <PreLoading />}
        {isOpenPic && <Lightbox mainSrc={pictureURL} onCloseRequest={() => setIsOpenPic(false)} />}
        <Breadcrumbs items={breadcrumbItems} />
        <div className="panel">
          {showBottomButton && (
            <div className="fixed bottom-10 ltr:right-6 rtl:left-6 z-50" style={{ bottom: '1.5rem', right: '1.5rem' }}>
              <a href="#buttom" className="btn btn-outline-primary rounded-full p-2 animate-pulse bg-[#fafafa] dark:bg-[#060818] dark:hover:bg-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: '2rem', height: '2rem', transform: 'rotate(180deg)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18"></path>
                </svg>
              </a>
          </div>
          )}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-themePrimary">PDF สัญญา</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-outline-primary" onClick={handleDownload} disabled={isGeneratingLink || !pdfObjectUrl}>
                <IconDownload className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> Download
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleCreateLink} disabled={isGeneratingLink}>
                {isGeneratingLink ? (
                  'กำลังสร้าง...'
                ) : (
                  <>
                    <IconShare className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> สร้าง Link ให้ลูกค้า
                  </>
                )}
              </button>
              {generateDataLink && <button className='btn btn-outline-danger' onClick={onCopyLinkHandler}><IconCopy className="w-5 h-5 ltr:mr-2 rtl:ml-2" />Copy Link</button>}
            </div>
          </div>
          <div className="text-center">
            {previewContent()}
          </div>
        </div>
      </div>
    </>
  )

}

export default ContractSignPreview