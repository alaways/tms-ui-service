import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import themeInit from '../../theme.init';
const CookiePolicy = () => {
    const [accepCookie, setAcceptCookie] = useState<boolean>(true);
    const [cookies,setCookies] = useCookies(['cwc_consent'])

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
                    <h5 className="text-lg font-semibold">เว็บไซต์นี้มีการใช้คุกกี้</h5>
                    <p>
                        เราใช้คุกกี้เพื่อปรับปรุงประสิทธิภาพการทำงาน, ประสบการณ์การใช้งานเว็บไซต์, การวิเคราะห์ข้อมูล, และการปรับปรุงกิจกรรมการตลาดของเรา เพื่อให้เกิดประโยชน์สูงสุดในการใช้งานเว็บไซต์ของคุณ คลิก "ยอมรับ" เพื่ออนุญาตให้เราใช้คุกกี้ในการเก็บข้อมูลสำหรับงานดังกล่าว
                    </p>
                    <div className="flex justify-end gap-4 mt-2 items-center">
                        <a href={`${themeInit.link.privacy_url}`} target='blank' className="text-blue-500 font-semibold">
                            นโยบายคุกกี้
                        </a>
                        <button type="submit" onClick={onSubmitCookie} className="text-white font-semibold rounded-lg bg-blue-500 p-3">
                            ยอมรับทั้งหมด
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CookiePolicy;
