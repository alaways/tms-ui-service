import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CustomerErrorPage = () => {
    const { t } = useTranslation();
    // ตั้งชื่อ Title ของหน้าเว็บ
    document.title = t('link_expired');

    return (
        // Container หลัก จัดให้อยู่กลางหน้าจอ
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">

            {/* Card หรือ Panel หลัก */}
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl text-center transform transition-all p-8 sm:p-12">

                {/* ไอคอนแจ้งเตือน (รูปสามเหลี่ยมมีเครื่องหมายตกใจ) */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 text-red-500 mx-auto mb-6" // ใช้สีแดงของ Tailwind สำหรับ Error
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>

                {/* ส่วนของข้อความ */}
                <div className="space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {t('link_expired')}
                    </h1>
                    <p className="text-base text-gray-600 leading-relaxed">
                        {t('link_expired_message')}
                        <br />
                        {t('contact_staff_for_new_link')}
                    </p>
                </div>

            

            </div>
        </div>
    );
};

export default CustomerErrorPage;
