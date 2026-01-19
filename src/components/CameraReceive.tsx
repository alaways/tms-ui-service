import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 500,
  height: 500,
  facingMode: "user",
};

interface PropCamera {
  onSubmit?: ((data: { file: File; dataURL: string }) => void) | null;
  onCancel?: () => void
}

const CameraReceive = ({ onSubmit,onCancel }: PropCamera) => {
  const navigate = useNavigate();

  const webcamRef = useRef<any>(null);
  const [image, setImage] = useState<{ file: File; dataURL: string } | null>();

  function dataURLtoFile(dataURL: string, filename: string): File {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const file = dataURLtoFile(imageSrc, "photo.jpg");
    setImage({ file: file, dataURL: imageSrc });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border max-w-[500px] max-h-[500px] rounded-2xl overflow-hidden m-auto">
        {image ? (
          <img src={image.dataURL} alt="" />
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            height={500}
            screenshotFormat="image/jpeg"
            width={500}
            videoConstraints={videoConstraints}
          />
        )}
      </div>
      {image && (
        <div className="flex gap-4 justify-center">
          <button
            className="outline-none h-20 w-20 inline-flex items-center justify-center border align-middle select-none font-medium text-center p-2 text-white text-sm font-medium rounded-full bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-all duration-300 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
            style={{
              backgroundColor: "red",
            }}
            onClick={() => setImage(null)}
          >
            ถ่ายใหม่
          </button>
          <button
            className="outline-none h-20 w-20 inline-flex items-center justify-center border align-middle select-none font-medium text-center p-2 text-white text-sm font-medium rounded-full bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-all duration-300 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
            onClick={() => {
              if (onSubmit && image) {
                onSubmit(image);
              }
            }}
          >
            ยืนยัน
          </button>
        </div>
      )}
      {!image && (
        <div className="flex gap-4 justify-center">
          <button
            className="border-none outline-none h-20 w-20 line-flex items-center justify-center align-middle select-none text-center p-2 text-white text-sm font-medium rounded-full bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-all duration-300 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
            style={{
              backgroundColor: "red",
            }}
            onClick={onCancel}
          >
            ย้อนกลับ
          </button>
          <button
            className="border-none outline-none h-20 w-20 line-flex items-center justify-center align-middle select-none text-center p-2 text-white text-sm font-medium rounded-full bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-all duration-300 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
            onClick={capture}
          >
            ถ่าย
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraReceive;
