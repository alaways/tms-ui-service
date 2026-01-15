import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'

import { useUploadMutation, useOCRMutation } from '../../../services/mutations/useUploadMutation'

const mode = process.env.MODE || 'admin'

const Camera = () => {

  const { returnUrl } = useParams()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  const [cameraVisible, setCameraVisible] = useState(true)

  const [viewImage, setViewImage] = useState(null)
  const [fileImage, setFileImage] = useState<File | null>(null)

  const [image, setImage] = useState<any>(null)

  const [facingMode, setFacingMode] = useState("environment")
  const [aspectRatio, setAspectRatio] = useState(16 / 9)

  const videoRef: any = useRef<HTMLVideoElement | null>(null)
  const canvasRef: any = useRef<HTMLCanvasElement | null>(null)
  const streamRef: any = useRef<MediaStream | null>(null)

  const containerRef: any = useRef<HTMLDivElement | null>(null)
  const borderRef: any = useRef<HTMLDivElement | null>(null)
  const cropRef: any = useRef<HTMLImageElement | null>(null)

  const takeRef: any = useRef<HTMLDivElement | null>(null)
  const ratio = 1010 / 638 // ขนาดบัตรประชาชนไทย: 1010 x 638

  const [xy, setXY] = useState({
    left: 0, top: 0,
    videoWidth: 0, videoHeight: 0,
    cropWidth: 0, cropHeight: 0,
  })

  const startCamera = useCallback(() => {
    const constraints = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 25, max: 60 },
        facingMode,
      },
      audio: false,
    }
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        let videoData = ''
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
            setAspectRatio(ratio)
            videoData += `Container: ${Math.ceil(window.innerWidth)} x ${Math.ceil(window.innerHeight)}, `
            const widthVideo: any = videoRef.current.clientWidth
            const heightVideo: any = videoRef.current.clientHeight
            videoData += `Video: ${Math.ceil(widthVideo)} x ${Math.ceil(heightVideo)}, `
            const leftCrop = window.innerWidth > 600 ? ((window.innerWidth - 600) / 2) : 30
            const widthCrop: any = cropRef.current.clientWidth - (leftCrop * 2)
            const heightCrop: any = (widthCrop / ratio)
            cropRef.current.style.width = `${widthCrop}px`
            videoData += `Crop: ${Math.ceil(widthCrop)} x ${Math.ceil(heightCrop)}, `
            containerRef.current.style.borderTop = `${window.innerWidth > 600 ? 60 : leftCrop}px solid #fff`
            containerRef.current.style.height = `${videoRef.current.clientHeight - (window.innerWidth > 600 ? 60 : leftCrop)}px`
            borderRef.current.style.borderLeft = `${leftCrop}px solid #fff`
            borderRef.current.style.borderRight = `${leftCrop + 2}px solid #fff`
            borderRef.current.style.borderBottom = `${window.innerHeight - cropRef.current.clientHeight - (window.innerWidth > 600 ? 60 : leftCrop)}px solid #fff`
            // takeRef.current.style.top = `${cropRef.current.clientHeight + leftCrop}px`
            takeRef.current.style.height = `${window.innerHeight - cropRef.current.clientHeight}px`
            takeRef.current.style.display = 'none' 
            canvasRef.current.style.marginTop = `20px`
            canvasRef.current.style.marginLeft = `${leftCrop}px`
            canvasRef.current.style.marginBottom = `30px`
            console.log(videoData)
            setXY({
              left: leftCrop,
              top: 0,
              videoWidth: videoRef.current.clientWidth,
              videoHeight: videoRef.current.clientHeight,
              cropWidth: cropRef.current.clientWidth,
              cropHeight: cropRef.current.clientHeight,
            })
            setCameraVisible(true)
            return
          }
        }
      }
    }).catch((err) => {
      console.error("Camera error:", err)
      setCameraVisible(false)
    })
  }, [ facingMode ])

  const { mutateAsync: uploadOCR, isLoading: isOCRLoading } = useOCRMutation({
    onSuccess: (res: any) => {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('returnUrl')) {
        navigate(`${urlParams.get('returnUrl')}?citizen_id=${res.data.citizen_id}&name=${res.data.name}&address=${res.data.address}&subdistrict=${res.data.subdistrict}&district=${res.data.district}&province=${res.data.province}&id_district=${res.data.id_district}&id_subdistrict=${res.data.id_subdistrict}&id_province=${res.data.id_province}&zip_code=${res.data.zip_code}&filename=${image?.file_name ?? ''}`)
      } else {
        history.back()
      }
    },
    onError: (error: any) => {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('returnUrl')) {
        navigate(`${urlParams.get('returnUrl')}?citizen_id=&name=&address=&subdistrict=&district=&province=&id_district=&id_subdistrict=&id_province=&zip_code=&filename=${image?.file_name ?? ''}`)
      } else {
        history.back()
      }
    }
  })

  const { mutateAsync: uploadFile, isLoading: isUpload } = useUploadMutation({
    onSuccess: (res: any) => {
      setImage(res?.data ?? null)
    },
    onError: (err: any) => {
      setImage(null)
    },
  })

  const capture = async () => {

    if (!videoRef.current || !canvasRef.current) return

    const video: any = videoRef.current
    const canvas: any = canvasRef.current

    canvas.width = xy.cropWidth
    canvas.height = xy.cropHeight

    const context: any = canvas.getContext("2d")
    const scale = (video.videoWidth / xy.videoWidth)
 
    context.drawImage(
      video, 
      xy.left * scale, 
      xy.top * scale, 
      xy.cropWidth * scale,
      xy.cropHeight * scale,
      0, 
      0, 
      xy.cropWidth,
      xy.cropHeight,
    )

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"

    const imageData = canvas.toDataURL("image/jpeg", 1.0)

    const base64Data = imageData.split(",")[1]
    const contentType = imageData.split(",")[0].split(":")[1].split(";")[0]

    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: contentType })

    const fileName = `${(new Date()).getTime()}.jpeg`
    const file: File = new File([blob], fileName, { type: contentType })

    takeRef.current.style.display = 'block' 

    uploadFile({ data: { file: file ?? null, type: 'customer' }})

    setFileImage(file ?? null)
    setViewImage(imageData)
    // closeCamera()

  }

  const checkData = async () => {
    if (!fileImage) return
    // await uploadOCR({ data: { image: fileImage } })
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('returnUrl')) {
      navigate(`${urlParams.get('returnUrl')}?citizen_id=${urlParams.get('citizen_id') ?? ''}&filename=${encodeURIComponent(image?.file_name ?? '')}&image_url=${encodeURIComponent(image?.image_url ?? '')}`)
    } else {
      history.back()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop())
      streamRef.current = null
    }
  }

  const closeCamera = () => {
    stopCamera()
    setCameraVisible(false)
  }

  useEffect(() => {
    dispatch(setPageTitle('ถ่ายภาพ'))
    dispatch(setSidebarActive(['services', '/apps/services/camera']))
  })

  useEffect(() => {
    if (cameraVisible) {
      startCamera()
    } else {
      closeCamera()
    }
    return () => stopCamera()
  }, [cameraVisible, startCamera])

  return (
    <div>
      { cameraVisible && (
        <>
          <div className="d-flex justify-content-center align-items-center bg-dark" style={{ zIndex: 100, height: '100vh', backgroundColor: '#FFF' }}>
            <div ref={containerRef} className="position-relative" style={{ position: 'relative', width: '100%', backgroundColor: '#FFF' }}>
              <video ref={videoRef} style={{ zIndex: 1, position: "absolute", top: 0, left: 0, right: 0, width: '100%', objectFit: 'contain' }} playsInline muted />
              <div ref={borderRef} style={{ zIndex: 2, position: "absolute", top: 0, left: 0, right: 0, width: '100%' }}>
                <img ref={cropRef} src="/assets/images/frame-crop.png" style={{ width: '100%' }} />
                <button className="btn btn-primary" style={{ zIndex: 3, position: "absolute", bottom: 10, left: viewImage ? 'calc(50% - 80px)' : 'calc(50% - 40px)', right: 0, display: 'block', width: '70px', height: '70px', borderRadius: '999px', fontSize: '14px', border: 'none', backgroundColor: 'rgba(0,0,0, 0.7)' }} onClick={capture}>
                  ถ่าย
                </button>
              </div>
            </div>
          </div>
          <div ref={takeRef} style={{ zIndex: 200, display: 'none', position: "absolute", top: 0, left: 0, right: 0, width: '100%', height: '100vh',  backgroundColor: '#FFF', textAlign: 'center' }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: '20px' }}></canvas>
            <button className="btn btn-primary" style={{ zIndex: 3, position: "absolute", bottom: 50, left: viewImage ? 'calc(50% - 80px)' : 'calc(50% - 40px)', right: 0, display: 'block', width: '70px', height: '70px', borderRadius: '999px', fontSize: '14px', border: 'none', backgroundColor: 'rgba(0,0,0, 0.7)' }} onClick={() => {
              takeRef.current.style.display = 'none' 
              setViewImage(null)
            }}>
              ถ่ายใหม่
            </button>
            <button className="btn btn-primary" style={{ zIndex: 3, position: "absolute", bottom: 50, left: 'calc(50% + 10px)', right: 0, display: 'block', width: '70px', height: '70px', borderRadius: '999px', fontSize: '12px' }} onClick={checkData}>
              ยืนยัน
            </button>
          </div>
        </>
      )}
    </div>
  )

}

export default Camera