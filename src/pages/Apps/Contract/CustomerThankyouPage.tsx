import { Link } from 'react-router-dom';

const ThankYouPage = () => {
    document.title = "ขอบคุณที่ใช้บริการ";

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl text-center transform transition-all p-8 sm:p-12">

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 text-green-500 mx-auto mb-6" // ใช้สีเขียวของ Tailwind
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>

                <div className="space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        ลงนามเรียบร้อย
                    </h1>
                    <p className="text-base text-gray-600 leading-relaxed">
                        ระบบได้บันทึกลายมือชื่อของท่านเรียบร้อยแล้ว
                        <br />
                        ขอบคุณที่ไว้วางใจใช้บริการกับเรา
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;
