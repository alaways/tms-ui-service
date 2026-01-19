import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';

const mode = process.env.MODE || 'admin';

interface TocItem {
  id: number;
  id_business_unit: number;
  is_active: boolean;
  toc_file: string;
  version: string;
  updated_at: string;
}

const TocPopup: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem(mode);
  const role = storedUser ? JSON.parse(storedUser ?? '{}').role : null;

  const [tocList, setTocList] = useState<TocItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  if (role !== 'shop') {
    return null;
  }

  const { mutate: onLogout } = useGlobalMutation(url_api.logout, {
    onSuccess: () => {
      localStorage.removeItem(mode);
      navigate('/apps/login');
    },
  });

  const { mutate: fetchTocData } = useGlobalMutation(url_api.shopGetToc, {
    onSuccess: (res: any) => {
      const data = res?.data || [];
      if (data.length > 0) {
        setTocList(data);
        setShowModal(true);
      }
    },
    onError: (err: any) => {
      console.error('Error fetching TOC:', err);
    },
  });

  const { mutate: saveAcceptToc } = useGlobalMutation(url_api.shopAcceptToc, {
    onSuccess: () => {
      // บันทึกสำเร็จ ไปยัง PDF ถัดไป หรือปิด modal
      if (currentIndex < tocList.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsAccepted(false); // รีเซ็ต checkbox สำหรับเอกสารถัดไป
      } else {
        setShowModal(false);
      }
    },
    onError: (err: any) => {
      console.error('Error saving TOC acceptance:', err);
    },
  });

  useEffect(() => {
    fetchTocData({});
  }, []);

  const handleAccept = () => {
    const currentToc = tocList[currentIndex];
    // บันทึกข้อมูลการยอมรับ
    saveAcceptToc({
      data : {
         id_bu_toc_partner: currentToc.id,
         id_business_unit:currentToc?.id_business_unit,
         version: currentToc.version,
      }
    });
  };

  const handleClose = () => {
    // ปิด modal โดยไม่กดตกลง -> logout
    onLogout({});
  };

  if (!showModal || tocList.length === 0) {
    return null;
  }

  const currentToc = tocList[currentIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
      <div className="relative w-[90%] h-[90%] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-xl font-semibold">ข้อกำหนดและเงื่อนไข</h3>
            <p className="text-sm text-gray-500">
              เอกสารที่ {currentIndex + 1} จาก {tocList.length} - Version: {currentToc.version}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-4 overflow-hidden">
          <iframe
            src={currentToc.toc_file}
            className="w-full h-full border-0 rounded"
            title={`TOC Document ${currentIndex + 1}`}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 p-4 border-t">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="acceptToc"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
            />
            <label htmlFor="acceptToc" className="text-sm text-gray-700 cursor-pointer flex items-center" style={{marginBottom:0}}>
              ข้าพเจ้ายอมรับข้อกำหนดและเงื่อนไข
            </label>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              กรุณาอ่านและยอมรับข้อกำหนดและเงื่อนไขเพื่อดำเนินการต่อ
            </p>
            <button
              type="button"
              onClick={handleAccept}
              disabled={!isAccepted}
              className="btn btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ตกลง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TocPopup;
