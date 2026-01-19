import { useNavigate, useParams } from 'react-router-dom';
import themeInit from '../../../theme.init';
import { useEffect, useState } from 'react';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';
import { ref } from 'yup';

const CustomerPrescreen = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [checked,setChecked] = useState<boolean>(false)

    const { mutate: getPreeScreenInfo, isLoading: isLoading } = useGlobalMutation(url_api.customerPreScreenInfo, {
        onSuccess: (res: any) => {
          if (res.statusCode === 400 || res.code === 400) {
            navigate('/customer/timeout?openExternalBrowser=1')
          }
        },
        onError: (error: any) => {
          console.log("error", error)
        }
    })
    useEffect(() => {
        getPreeScreenInfo({data:{ref:id}})
    },[])
    const onClickSubmit = () => {
        navigate(`/apps/customer/pre-screen/${id}/step-2?openExternalBrowser=1`);
    };
    return (
        <div className="static flex flex-col justify-center items-center h-screen px-4 sm:px-14 bg-white">
            {/* <div className="border-b w-full flex justify-center absolute top-0 py-5">
                <img className="w-14 ml-[35px] flex-none" src={`/assets/images/TPlus.png`} alt="logo" />
            </div> */}
            <div className="border rounded-lg max-w-[600px] w-full h-[80%] sm:h-[70%] text-sm sm:text-base">
                <div className="overflow-y-scroll h-5/6 px-3 sm:px-4 py-3">
                    <h1 className="text-center font-semibold text-sm sm:text-base">ข้อตกลงการให้ความยินยอมเก็บรวบรวม ใช้และเปิดเผยข้อมูลส่วนบุคคล</h1>
                    <p className="mt-2">
                        ข้าพเจ้าขอยินยอมให้ ผู้ควบคุมข้อมูลส่วนบุคคล เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า ("ข้อมูลส่วนบุคคล") เพื่อวัตถุประสงค์ในการตรวจสอบและยืนยันตัวตน การปฏิบัติตามสัญญา
                        และการพิจารณาให้บริการหรือผลิตภัณฑ์ใด ๆ รวมถึงแต่ไม่จำกัดเพียง การพิจารณาอนุมัติวงเงิน การยกเลิกบริการ หรือการดำเนินการเกี่ยวกับการชำระค่าบริการต่างๆ
                        <br />
                        <br />
                        ข้าพเจ้าขอยืนยันว่าได้อ่าน ทำความเข้าใจ และรับทราบรายละเอียดเกี่ยวกับการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล ("การประมวลผลข้อมูลส่วนบุคคล") โดยครบถ้วนแล้ว
                        พร้อมทั้งให้ความยินยอมดังกล่าวโดยสมัครใจ ปราศจากการขู่เข็ญ บังคับ หรือหลอกลวง และตระหนักดีว่าข้าพเจ้ามีสิทธิเพิกถอนความยินยอมได้ทุกเมื่อ
                        เว้นแต่กรณีที่มีกฎหมายกำหนดเป็นอย่างอื่น หรือยังคงมีภาระผูกพันตามสัญญากับบริษัท
                        <br />
                        <br />
                        ข้าพเจ้าเข้าใจดีว่าการเพิกถอนความยินยอมอาจส่งผลกระทบต่อสิทธิในการได้รับบริการหรือสิทธิประโยชน์อื่นใดที่เกี่ยวข้อง และการเพิกถอนดังกล่าวจะไม่มีผลกระทบย้อนหลังต่อการประมวลผลข้อมูลส่วนบุคคลที่บริษัทได้ดำเนินการไปโดยชอบด้วยกฎหมายก่อนหน้านั้น
                        <br />
                        <br />
                        โดยการคลิกปุ่ม "ยินยอม" ด้านล่างนี้ ถือว่าข้าพเจ้าได้ให้ความยินยอมตามที่ระบุไว้ข้างต้น
                    </p>
                </div>
                <div className="h-1/6 border-t flex items-center gap-2 w-full px-3 sm:px-4 text-gray-600 text-sm sm:text-base">
                    <input onChange={(e:any) => setChecked(e.target.checked)} type="checkbox" name="accept" id="accept" className="w-5 h-5 sm:w-6 sm:h-6 border border-gray-400 rounded-[50%] checked:bg-primary flex-shrink-0" />
                    ยินยอม <span className="text-red-500">*</span>
                </div>
            </div>
            <div className="flex justify-center sm:justify-end border-t w-full absolute bottom-0 left-0 py-4 sm:py-6 px-4 sm:px-14">
                <button disabled={!checked} onClick={onClickSubmit} className={`${checked ? 'btn btn-primary' : 'btn bg-gray-100 text-white cursor-default'} py-3 px-6 sm:py-4 sm:px-8 w-full sm:w-auto`}>
                    ถัดไป
                </button>
            </div>
        </div>
    );
};

export default CustomerPrescreen;
