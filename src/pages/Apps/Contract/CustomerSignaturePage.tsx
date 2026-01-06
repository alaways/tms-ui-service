import { useEffect, useState, useRef, Fragment } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'

import Swal from 'sweetalert2'
import SignatureCanvas from 'react-signature-canvas'

import { Dialog, Transition } from '@headlessui/react'

import { url_api } from '../../../services/endpoints'
import { useGlobalMutation } from '../../../helpers/globalApi'

import { setPageTitleOnly } from '../../../store/themeConfigSlice'
import { useDispatch } from 'react-redux'
import { useUploadMutation, useUploadSignMutation } from '../../../services/mutations/useUploadMutation'

import PreLoading from '../../../helpers/preLoading'

import IconRefresh from '../../../components/Icon/IconRefresh'
import IconX from '../../../components/Icon/IconX'
import PDFViewer from '../../../components/HOC/PDFViewer'
import { PDFDocument } from 'pdf-lib'
import moment from 'moment'
import IconDownload from '../../../components/Icon/IconDownload'

const CustomerSignaturePage = () => {

  const { signature_uuid } = useParams()
  const sigPad = useRef<SignatureCanvas | any>(null)

  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const type = queryParams.get('type')

  const dispatch = useDispatch()

  const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    padding: '10px 20px',
  })

  // --- STATE MANAGEMENT ---
  const [pageState, setPageState] = useState('loading')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [contractRef, setContractRef] = useState('')
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null)
  const [pdfObjectUrl2, setPdfObjectUrl2] = useState<string | null>(null)
  const [pdfObjectUrl3, setPdfObjectUrl3] = useState<string | null>(null)
  const [pdfObjectUrl4, setPdfObjectUrl4] = useState<string | null>(null)

  const [isLoadingPDF1, setIsLoadingPDF1] = useState(true)
  const [isLoadingPDF2, setIsLoadingPDF2] = useState(true)
  const [isLoadingPDF3, setIsLoadingPDF3] = useState(true)
  const [isLoadingPDF4, setIsLoadingPDF4] = useState( type == 'refinance' ? true : false)
  const [loadingPDF,setLoadingPDF] = useState(false)
  const [showBottomButton, setBottomTopButton] = useState(true)
 
 
  const navigate = useNavigate()

  const { mutate: signPDF, isLoading: isLoadingSign } = useGlobalMutation(url_api.SignPdf, {
    onSuccess: (res: any) => {
      if (res.statusCode === 400 || res.code === 400) {
        Swal.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })

      } else {
        navigate('/customer/thankyou')
      }
    },
    onError: (error: any) => {
      console.log("error", error)
    }
  })

  const { mutateAsync: uploadFile, isLoading: isUpload } = useUploadSignMutation({
    onSuccess: (res: any) => {
      if (res.statusCode === 400 || res.code === 400) {
        toast.fire({
          icon: 'error',
          title: 'อัพโหลดไม่สำเร็จ!!!!!',
          padding: '10px 20px',
        })
      } else {
        signPDF({
          data: {
            ref: signature_uuid,
            signName: res.data.file_name,
          }
        })
        closeModal()
        sigPad.current.clear()
      }
    },
    onError: (err: any) => {
      toast.fire({
        icon: 'error',
        title: 'อัพโหลดไม่สำเร็2',
        padding: '10px 20px',
      })
    },
  })

  // --- CANVAS RESIZE HANDLER ---
  const handleCanvasResize = () => {
    if (sigPad.current) {
      const canvas = sigPad.current.getCanvas()
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext("2d")?.scale(ratio, ratio)
      sigPad.current.clear()
    }
  }

  const { mutate: getContractInfo, isLoading: isLoading } = useGlobalMutation(url_api.getSignInfo, {
    onSuccess: (res: any) => {
      if (res.statusCode === 400 || res.code === 400) {
        navigate('/customer/timeout')
        // Swal.fire({
        //     icon: 'error',
        //     title: res.message,
        //     padding: '10px 20px',
        // })
      } else {
        setContractRef(res?.data?.reference)
        fetchPDF({ data: { ref: signature_uuid } })
        fetchPDFPdPa({ data: { ref: signature_uuid } })
        fetchCardID({ data: { ref: signature_uuid } })
        if (type == 'refinance') {
          fetchPdfReceipt({ data: { ref: signature_uuid } })
        }
      }
    },
    onError: (error: any) => {
      console.log("error", error)
    }
  })

  const { mutate: fetchPDF, isLoading: isLoadingPDF } = useGlobalMutation(url_api.getSignPdf, {
    onSuccess: (res: any) => {
      if (res.statusCode === 400 || res.code === 400) {
        Swal.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      } else {
        setPdfObjectUrl(res?.data?.url_image)
      }
    },
    onError: (error: any) => {
      console.log("error", error)
    }
  })

  const { mutate: fetchPDFPdPa, isLoading: isLoadingPDFPdaPa } = useGlobalMutation(url_api.getSignPdfPdpa, {
    onSuccess: (res: any) => {
      if (res.statusCode === 400 || res.code === 400) {
        Swal.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      } else {
       setPdfObjectUrl2(res?.data?.url_image)
      }
    },
    onError: (error: any) => {
      console.log("error", error)
    }
  })

  const { mutate: fetchCardID, isLoading: isLoadingPDFCardID } = useGlobalMutation(url_api.getSignPdfCardID, {
    onSuccess: (res: any) => {
      if (res.statusCode === 400 || res.code === 400) {
        Swal.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      } else {
        setPdfObjectUrl3(res?.data?.url_image)
      }
    },
    onError: (error: any) => {
      console.log("error", error)
    }
  })

  const { mutate: fetchPdfReceipt, isLoading: isFetchingReceipt } = useGlobalMutation(url_api.getSignPdfReceipt, {
    onSuccess: (res: any) => {
      if (res.statusCode === 400 || res.code === 400) {
        Swal.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      } else {
        setPdfObjectUrl4(res?.data?.url_image)
      }
    },
    onError: (error: any) => {
      console.log("error", error)
    }
  })

  useEffect(() => {
    dispatch(setPageTitleOnly('ลงนามสัญญาออนไลน์'))
    getContractInfo({ data: { ref: signature_uuid } })
  }, [])

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
    if (isModalOpen) {
      window.addEventListener('resize', handleCanvasResize)
    }
    return () => {
      window.removeEventListener('resize', handleCanvasResize)
    }
  }, [isModalOpen])

  // --- HANDLERS ---
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  const clearSignature = () => sigPad.current?.clear()

  const handleSaveSignature = async () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      Swal.fire('คำเตือน', 'กรุณาลงลายเซ็นก่อนบันทึก', 'warning')
      return
    }
    Swal.fire({
      title: 'ยืนยันการบันทึก',
      text: 'คุณต้องการบันทึกลายเซ็นนี้ลงในเครื่องของคุณใช่หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b3f5c',
      cancelButtonColor: '#e7515a',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const dataURL = sigPad.current.getCanvas().toDataURL('image/png')
          // ฟังก์ชันแปลง base64 เป็น File
          function dataURLtoFile(dataurl: string, filename: string): File {
            const arr = dataurl.split(',')
            const mime = arr[0].match(/:(.*?)/)![1]
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n)
            }
            return new File([u8arr], filename, { type: mime })
          }
          const signatureFile = dataURLtoFile(dataURL, 'signature.png')
          uploadFile({ data: { file: signatureFile, type: 'contract', ref: signature_uuid } })
        } catch (error: any) {
          console.error("เกิดข้อผิดพลาด:", error)
          Swal.fire('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถอัปโหลดได้', 'error')
        }
      }
    })
  }

  const handleDownload = async () => {
    setLoadingPDF(true)
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
      link.download = `${'contract'}_${moment().utc().format('DD-MM-yyyy')}.pdf`
      link.click()
      // Cleanup
      URL.revokeObjectURL(mergedUrl)
      setLoadingPDF(false)
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการรวม PDF:', error)
      alert('เกิดข้อผิดพลาดในการรวม PDF')
    }
  }

  const goToTop = () => {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }

  const onScrollHandler = () => {
    if (document.documentElement.scrollTop > 50 && (document.documentElement.scrollTop + window.innerHeight) - document.documentElement.scrollHeight >= -50) {
      setBottomTopButton(false)
    } else {
      setBottomTopButton(true)
    }
  } 

  useEffect(() => {
    window.addEventListener('scroll', onScrollHandler)
    return () => {
      window.removeEventListener('onscroll', onScrollHandler)
    }
  }, [])

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {(isLoadingPDF ||loadingPDF || isLoading || isUpload || isLoadingSign || isLoadingPDFPdaPa || isLoadingPDFCardID || isFetchingReceipt) && <PreLoading />}
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-themePrimary">ลงนามสัญญาเช่าซื้อออนไลน์</h2>
                <p className="text-gray-500 mt-1">สำหรับสัญญาเลขที่: <span className="font-semibold text-black">{contractRef}</span></p>
              </div>
              <button type="button" className="btn btn-outline-primary" onClick={handleDownload}>
                <IconDownload className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> Download
              </button>
              {/* <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link to="/customer/thankyou" target="_blank" rel="noopener noreferrer" className="btn btn-success btn-lg w-full sm:w-auto text-center">Thank you</Link>
                <Link to="/customer/timeout" target="_blank" rel="noopener noreferrer" className="btn btn-danger btn-lg w-full sm:w-auto text-center">Timeout</Link>
              </div> */}
            </div>
            <div className="mb-10">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">1. รายละเอียดสัญญา</h3>
              {isLoading ? (
                <div className="text-center text-gray-500 p-10 bg-gray-100 rounded-lg"><p>กำลังโหลดเอกสารสัญญา...</p></div>
              ) : pdfObjectUrl ? (
                <div className="pdf-viewer-container border rounded-lg overflow-hidden shadow-sm">
                  {/* <iframe
                    src={`${pdfObjectUrl}#toolbar=0`}
                    width="100%"
                    height="800px"
                    style={{ border: 'none' }}
                    title="PDF Viewer"
                  /> */}
                  {/* <iframe onLoad={()=> setIsLoadingPDF1(false)}  src={`https://docs.google.com/gview?url=${pdfObjectUrl}&embedded=true`} width="100%" height="800px" ></iframe> */}
                  {/* <iframe
                    src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfObjectUrl)}#toolbar=0`}
                    width="100%"
                    height="800px"
                    style={{ border: 'none' }}
                    title="PDF Viewer"
                  /> */}
                  <PDFViewer pdfUrl={pdfObjectUrl} />
                </div>
              ) : (
                <div className="text-center text-gray-400 p-10 bg-gray-100 rounded-lg"><p>ไม่สามารถแสดงเอกสารสัญญาได้</p></div>
              )}
            </div>


            <div className="mb-10">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">2. PDPA</h3>
              {isLoading ? (
                <div className="text-center text-gray-500 p-10 bg-gray-100 rounded-lg"><p>กำลังโหลดเอกสารสัญญา...</p></div>
              ) : pdfObjectUrl2 ? (
                <div className="pdf-viewer-container border rounded-lg overflow-hidden shadow-sm">
                  <iframe
                    src={`${pdfObjectUrl2}#toolbar=0`}
                    width="100%"
                    height="800px"
                    style={{ border: 'none' }}
                    title="PDF Viewer"
                  />
                  {/* <iframe onLoad={()=> setIsLoadingPDF2(false)} src={`https://docs.google.com/gview?url=${pdfObjectUrl2}&embedded=true`} width="100%" height="800px" ></iframe> */}
                  {/* <PDFViewer pdfUrl={pdfObjectUrl2} /> */}
                  {/* <iframe
                    src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfObjectUrl2)}`}
                    width="100%"
                    height="900px"
                    style={{ border: "none" }}
                  /> */}
                </div>
              ) : (
                <div className="text-center text-gray-400 p-10 bg-gray-100 rounded-lg"><p>ไม่สามารถแสดงเอกสารสัญญาได้</p></div>
              )}
            </div>


            <div className="mb-10">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">3. สำเนาบัตรประชาชน</h3>
              {isLoading ? (
                <div className="text-center text-gray-500 p-10 bg-gray-100 rounded-lg"><p>กำลังโหลดเอกสารสัญญา...</p></div>
              ) : pdfObjectUrl3 ? (
                <div className="pdf-viewer-container border rounded-lg overflow-hidden shadow-sm">
                  <iframe
                    src={`${pdfObjectUrl3}#toolbar=0`}
                    width="100%"
                    height="800px"
                    style={{ border: 'none' }}
                    title="PDF Viewer"
                  />
                  {/* <iframe onLoad={()=> setIsLoadingPDF3(false)} src={`https://docs.google.com/gview?url=${pdfObjectUrl3}&embedded=true`} width="100%" height="800px" ></iframe> */}
                  {/* <PDFViewer pdfUrl={pdfObjectUrl3} /> */}
                  {/* <iframe
                    src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfObjectUrl3)}`}
                    width="100%"
                    height="900px"
                    style={{ border: "none" }}
                  /> */}
                </div>
              ) : (
                <div className="text-center text-gray-400 p-10 bg-gray-100 rounded-lg"><p>ไม่สามารถแสดงเอกสารสัญญาได้</p></div>
              )}
            </div>

            {type == 'refinance' &&
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">4. ใบเสร็จรับเงิน</h3>
                {isLoading ? (
                  <div className="text-center text-gray-500 p-10 bg-gray-100 rounded-lg"><p>กำลังโหลดเอกสารสัญญา...</p></div>
                ) : pdfObjectUrl4 ? (
                  <div className="pdf-viewer-container border rounded-lg overflow-hidden shadow-sm">
                    <iframe
                      src={`${pdfObjectUrl4}#toolbar=0`}
                      width="100%"
                      height="800px"
                      style={{ border: 'none' }}
                      title="PDF Viewer"
                    />
                    {/* <PDFViewer pdfUrl={pdfObjectUrl4} /> */}
                    {/* <iframe
                      src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfObjectUrl4)}`}
                      width="100%"
                      height="900px"
                      style={{ border: "none" }}
                    /> */}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 p-10 bg-gray-100 rounded-lg"><p>ไม่สามารถแสดงเอกสารสัญญาได้</p></div>
                )}
              </div>
            }

            <button type="button" className="btn btn-primary btn-lg w-full" onClick={openModal} disabled={!pdfObjectUrl || !pdfObjectUrl2 || !pdfObjectUrl3 || isLoading}>คลิกเพื่อลงนาม</button>
          </div>
        </div>
      </div>
      {showBottomButton ? (
        <div className="fixed bottom-10 ltr:right-6 rtl:left-6 z-50" style={{ bottom: '1.5rem', right: '1.5rem' }}>
          <a href="#buttom" className="btn btn-outline-primary rounded-full p-2 animate-pulse bg-[#fafafa] dark:bg-[#060818] dark:hover:bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: '2rem', height: '2rem', transform: 'rotate(180deg)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18"></path>
            </svg>
          </a>
      </div>
      ): (
        <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50">
          <button type="button" className="btn btn-outline-primary rounded-full p-2 animate-pulse bg-[#fafafa] dark:bg-[#060818] dark:hover:bg-primary" onClick={goToTop}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: '2rem', height: '2rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
            </svg>
          </button>
        </div>
      )}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" open={isModalOpen} onClose={closeModal} className="relative z-50">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" afterEnter={handleCanvasResize}>
                <Dialog.Panel className="panel w-full max-w-xl transform text-left transition-all shadow-xl p-6 sm:p-8">
                  <Dialog.Title as="h3" className="text-2xl font-bold mb-2 text-center">ลงลายมือชื่อของคุณ</Dialog.Title>
                  <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><IconX className="w-6 h-6" /></button>
                  <p className="mb-5 text-sm text-gray-500 text-center">กรุณาลงลายมือชื่อในกรอบด้านล่างนี้ให้ชัดเจน</p>
                  <div className="relative border-2 border-dashed rounded-lg bg-white overflow-hidden">
                    <SignatureCanvas ref={sigPad} penColor='#0000DE' canvasProps={{ className: 'w-full h-56 sigCanvas' }} />
                  </div>
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button type="button" className="btn btn-outline-secondary" onClick={clearSignature}><IconRefresh className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> วาดใหม่</button>
                    <button type="button" className="btn btn-primary" onClick={handleSaveSignature}>ยืนยันและส่งลายเซ็น</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <div id="buttom"></div>
    </>
  )

}

export default CustomerSignaturePage
