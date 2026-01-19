import { useEffect, useState, useCallback, useRef } from 'react'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'
import { toastAlert } from '../helpers/constant';
type CameraOCRProps = {
  onSubmit: (data: { file: File; dataURL: string }) => void
  onClose:(data:any) => void
}

const CameraOCR: React.FC<CameraOCRProps> = ({ onSubmit,onClose }) => {
  const toast = Swal.mixin(toastAlert)
  const { t } = useTranslation()
  const [cameraVisible, setCameraVisible] = useState(true)
  const [fileImage, setFileImage] = useState<File | null>(null)
  const [facingMode, setFacingMode] = useState("environment")
  const [isDisplay, setIsDisPlay] = useState(false)
  const videoRef: any = useRef<HTMLVideoElement | null>(null)
  const canvasRef: any = useRef<HTMLCanvasElement | null>(null)
  const streamRef: any = useRef<MediaStream | null>(null)

  const containerRef: any = useRef<HTMLDivElement | null>(null)
  const borderRef: any = useRef<HTMLDivElement | null>(null)
  const cropRef: any = useRef<HTMLImageElement | null>(null)

  const takeRef: any = useRef<HTMLDivElement | null>(null)
  const ratio = 1010 / 638 // 泰国身份证尺寸 1010 x 638

  const [xy, setXY] = useState({
    left: 0, top: 0,
    videoWidth: 0, videoHeight: 0,
    cropWidth: 0, cropHeight: 0,
  })

  const startCamera = useCallback(() => {
    const constraints = {
      video: {
        width: { min: 1280, ideal: 1920 },
        height: { min: 720, ideal: 1080 },
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
            videoData += `Container: ${Math.ceil(window.innerWidth)} x ${Math.ceil(window.innerHeight)}, `
            const widthVideo: any = videoRef.current.clientWidth
            const heightVideo: any = videoRef.current.clientHeight
            videoData += `Video: ${Math.ceil(widthVideo)} x ${Math.ceil(heightVideo)}, `
            const leftCrop = window.innerWidth > 600 ? ((window.innerWidth - 600) / 3) : 30
            const widthCrop: any = cropRef.current.clientWidth - (leftCrop * 2)
            const heightCrop: any = (widthCrop / ratio)
            cropRef.current.style.width = `${widthCrop}px`
            videoData += `Crop: ${Math.ceil(widthCrop)} x ${Math.ceil(heightCrop)}, `
            containerRef.current.style.borderTop = `${window.innerWidth > 600 ? 60 : leftCrop}px solid #fff`
            containerRef.current.style.height = `${videoRef.current.clientHeight - (window.innerWidth > 600 ? 60 : leftCrop)}px`
            borderRef.current.style.borderLeft = `${leftCrop}px solid #fff`
            borderRef.current.style.borderRight = `${leftCrop + 2}px solid #fff`
            borderRef.current.style.borderBottom = `${window.innerHeight - cropRef.current.clientHeight - (window.innerWidth > 600 ? 60 : leftCrop)}px solid #fff`
            // 预留控制条布局（当前未使用）
            // takeRef.current.style.top = `${cropRef.current.clientHeight + leftCrop}px`
            //takeRef.current.style.height = `${window.innerHeight - cropRef.current.clientHeight}px`
            //takeRef.current.style.display = 'none'
            // canvasRef.current.style.marginTop = `20px`
            // canvasRef.current.style.marginLeft = `${leftCrop}px`
            // canvasRef.current.style.marginBottom = `30px`

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
      toast.fire({
        icon: 'error',
        title: t('camera_permission_error'),
        padding: '10px 20px',
      })
      onClose(true)
      setCameraVisible(false)
    })
  }, [ facingMode ])

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current as HTMLVideoElement
    const canvas = canvasRef.current as HTMLCanvasElement
    const context = canvas.getContext("2d")
    if (!context) return

    // 摄像头实际分辨率
    const videoW = video.videoWidth
    const videoH = video.videoHeight

    // 渲染尺寸与实际分辨率的比例
    const scaleX = videoW / xy.videoWidth
    const scaleY = videoH / xy.videoHeight

    // 实际分辨率上的裁剪尺寸
    const cropX = xy.left * scaleX
    const cropY = xy.top * scaleY
    const cropW = xy.cropWidth * scaleX
    const cropH = xy.cropHeight * scaleY

    // 将 canvas 设为实际裁剪尺寸
    canvas.width = cropW
    canvas.height = cropH

    // 只绘制裁剪区域
    context.drawImage(
      video,
      cropX, cropY, cropW, cropH,
      0, 0, cropW, cropH
    )

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"

    // 导出为 base64
    const imageData = canvas.toDataURL("image/jpeg", 1.0)

    // 将 base64 转为文件
    const base64Data = imageData.split(",")[1]
    const contentType = imageData.split(",")[0].split(":")[1].split(";")[0]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: contentType })
    const file = new File([blob], `${Date.now()}.jpeg`, { type: contentType })

    setIsDisPlay(true)
    setFileImage(file ?? null)
  }


  const handleSubmit = async () => {
    if (!fileImage) return
    const reader = new FileReader()
    reader.onload = (e) => {
        const dataURL = e.target?.result as string
        onSubmit({
          file: fileImage,
          dataURL: dataURL,
        })
    }
    reader.readAsDataURL(fileImage)
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
        <div style={{overflow:'hidden'}}>
            <div className="d-flex justify-content-center align-items-center bg-dark" style={{ zIndex: 100, height: '100vh', backgroundColor: '#FFF' , display: !isDisplay ? 'block' : 'none'}}>
                <div ref={containerRef} className="position-relative" style={{ position: 'relative', width: '100%', backgroundColor: '#FFF' }}>
                <video ref={videoRef} style={{ zIndex: 1, position: "absolute", top: 0, left: 0, right: 0, width: '100%', objectFit: 'contain' }} playsInline muted />
                <div ref={borderRef} style={{ zIndex: 2, position: "absolute", top: 0, left: 0, right: 0, width: '100%' }}>
                    <img ref={cropRef} src="/assets/images/frame-crop.png" style={{ width: '100%' }} />
                    <div style={{justifyContent:'center',display:'flex',position:'absolute',width:'100%',marginTop:'30px',gap:16}}>
                        <button className="btn btn-danger" style={{width:'70px',height:'70px',borderRadius:'999px',borderWidth:0 }} onClick={()=>onClose(false)}>
                        {t('camera_back')}
                        </button>
                        <button className="btn btn-primary" style={{ backgroundColor:'rgba(0, 0, 0, 0.7)', width:'70px',height:'70px', borderRadius:'999px',borderWidth:0}} onClick={capture}>
                    {t('camera_take')}
                    </button>
                </div>
            </div>
            </div>
        </div>

          <div ref={takeRef} className="previewImg" style={{
                zIndex: 200, display: isDisplay ? 'flex' : 'none', width: '100%', textAlign: 'center',
                justifyContent:'center',alignItems:'center'
            }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: '20px' }}></canvas>
          </div>

         {isDisplay && (

            <>
                <div style={{justifyContent:'center',display:'flex',width:'100%',marginTop:'30px',gap:16}}>
                  <button className="btn btn-primary" style={{ backgroundColor:'rgba(0, 0, 0, 0.7)',width:'70px', height:'70px', borderRadius:'999px', borderWidth:0}}  onClick={() => { setIsDisPlay(false)}}>
                        {t('camera_retake')}
                  </button>

                  <button className="btn btn-primary" style={{  width:'70px',height:'70px',borderRadius:'999px',borderWidth:0}}  onClick={handleSubmit}>
                        {t('camera_confirm')}
                  </button>
                </div>
            </>
         )}

        </div>
      )}
    </div>
  )

}

export default CameraOCR
