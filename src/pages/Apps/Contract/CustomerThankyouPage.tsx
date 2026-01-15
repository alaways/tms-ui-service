import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ThankYouPage = () => {
    const { t } = useTranslation();
    document.title = t('thank_you_for_service');

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl text-center transform transition-all p-8 sm:p-12">

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 text-green-500 mx-auto mb-6"
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
                        {t('signature_completed')}
                    </h1>
                    <p className="text-base text-gray-600 leading-relaxed">
                        {t('signature_saved_successfully')}
                        <br />
                        {t('thank_you_for_trust')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;
