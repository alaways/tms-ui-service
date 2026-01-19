import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import themeInit from '../../theme.init';
const CookiePolicy = () => {
    const [accepCookie, setAcceptCookie] = useState<boolean>(true);
    const [cookies,setCookies] = useCookies(['cwc_consent'])
    const { t } = useTranslation();

    const onSubmitCookie = () => {
        setAcceptCookie(false);
        setCookies('cwc_consent', 'test', { path: '/', expires: new Date('9999-12-31') });
    };

    useEffect(() => {
        if(cookies.cwc_consent){
            setAcceptCookie(false)
        }
    },[])
    return (
        <>
            {accepCookie && (
                <div className="fixed bottom-5 left-1/2 translate-x-[-50%] z-[100] border rounded-xl p-8 bg-white w-[80%]">
                    <h5 className="text-lg font-semibold">{t('cookie_policy_title')}</h5>
                    <p>
                        {t('cookie_policy_description')}
                    </p>
                    <div className="flex justify-end gap-4 mt-2 items-center">
                        <a href={`${themeInit.link.privacy_url}`} target='blank' className="text-blue-500 font-semibold">
                            {t('cookie_policy_link')}
                        </a>
                        <button type="submit" onClick={onSubmitCookie} className="text-white font-semibold rounded-lg bg-blue-500 p-3">
                            {t('cookie_policy_accept_all')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CookiePolicy;
