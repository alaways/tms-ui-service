import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExamPeople from '../../../../../public/assets/images/exam_people.jpg'
import IconUser from '../../../../components/Icon/IconUser';
import IconCheckCircle from '../../../../components/Icon/IconCheck';
import IconCamera from '../../../../components/Icon/IconCamera';

interface PropPolicy {
    onAccept: (data: any) => void;
    data: any;
}

const ReceivePolicy = ({ onAccept, data }: PropPolicy) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [check, setCheck] = useState<boolean>(false);

    const onSubmitPolicy = () => {
        onAccept(true);
    };

    return (
        <div className="static flex flex-col justify-center items-center min-h-screen px-4 sm:px-14">
            <div className="flex flex-col items-center mt-20 gap-6 h-full ">
                <div className="flex flex-col gap-2 border rounded-lg p-6 max-w-[650px] w-full bg-white">
                    <div className='flex gap-4'>
                        <div className='bg-blue-100 w-8 h-8 rounded-[50%] flex justify-center items-center'>
                            <IconUser className='text-blue-700'/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <h5>ผู้เช่าซื้อ / ผู้รับมอบ</h5>
                            <h2 className='font-semibold'>{data?.customer?.name}</h2>
                            <h5>ID: {data?.customer?.citizen_id}</h5>
                        </div>
                    </div>
                    <div className='flex justify-between pt-4 border-t'>
                        <p>เลขที่สัญญาเช่าซื้อ</p>
                        <p>{data?.reference}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 border rounded-lg p-6 max-w-[650px] w-full bg-white">
                    <h1>ตรวจสอบรายการ</h1>
                    <div className="flex gap-3">
                        <IconCheckCircle className='text-green-600 h-5'/>
                        <p>รับมอบสินค้าเรียบร้อยแล้ว</p>
                    </div>
                    <div className="flex gap-3">
                        <IconCheckCircle className='text-green-600 h-5'/>
                        <p>ตรวจสอบสินค้าแล้วว่าอยู่ในสภาพสมบูรณ์</p>
                    </div>
                    <div className="flex gap-3">
                        <IconCheckCircle className='text-green-600 h-5'/>
                        <p>ยอมรับสินค้าในสภาพที่ปรากฏ ณ วันที่รับมอบ (As-Is Condition)</p>
                    </div>
                    <div className="bg-gray-100 flex justify-center items-center py-2 text-sm">
                        โดยลักษณะภายนอก/การใช้งานทั่วไปเป็นไปตามที่ได้ตกลงไว้
                    </div>
                </div>
                <div className="flex flex-col gap-2 border rounded-lg p-6 max-w-[650px] w-full bg-white">
                    <h1 className='font-bold'>ข้อตกลงและเงื่อนไข</h1>
                    <p>1. หลังจากยืนยันการรับสินค้าแล้ว สินค้าถือว่า ส่งมอบสมบูรณ์ ตามสัญญาเช่าซื้อ</p>
                    <p>2. ความเสียหายที่เกิดขึ้นภายหลังจากการรับมอบ ซึ่งมิใช่เกิดจากการติดตั้งระบบควบคุมอุปกรณ์ (MDM) หรือการปฏิบัติของบริษัทฯ ถือเป็นความรับผิดของผู้เช่าซื้อ</p>
                    <p>3. ข้าพเจ้าได้ถ่ายรูป/อัปโหลดภาพประกอบการรับสินค้าแล้วเพื่อเป็นหลักฐาน</p>
                </div>
                <div className="flex flex-col gap-2 mb-[200px] max-w-[650px] w-full">
                    <h1 className='font-semibold'>ตัวอย่างการถ่ายภาพ</h1>
                    <img src={ExamPeople} className='w-full border shadow-md rounded-xl' alt="" />
                </div>
                {/* <div className="flex flex-col gap-6 border rounded-lg p-6 mb-[200px] max-w-[650px] bg-white">
                    <h2 className='text-lg text-center font-semibold'>ยืนยันการรับสินค้า</h2>
                    <div className="text-left text-base">
                        <h5>{data?.business_unit?.name}</h5>
                        <h5>คำยืนยันการรับสินค้า</h5>
                        ข้าพเจ้า {data?.customer?.name}
                        <br />
                         หมายเลขบัตรประชาชน/หนังสือเดินทาง: {data?.customer?.citizen_id}
                        <br />
                        หมายเลขสัญญาเช่าซื้อ: {data?.reference}
                        <br />
                        ขอยืนยันว่าในวันนี้ ข้าพเจ้าได้
                        <br />
                        ✔️ รับมอบสินค้าเรียบร้อยแล้ว
                        <br />
                        ✔️ ตรวจสอบสินค้าแล้วว่าอยู่ในสภาพตามที่บริษัทฯจัดส่งมา
                        <br />
                        ✔️ ยอมรับสินค้าในสภาพที่ปรากฏ ณ วันที่รับมอบ (As-Is Condition)
                        <br />
                        โดยลักษณะภายนอก/การใช้งานทั่วไปเป็นไปตามที่ได้ตกลงไว้
                        <br />
                        ข้าพเจ้าเข้าใจและยินยอมว่า:
                        <br />
                        1. หลังจากยืนยันการรับสินค้าแล้ว สินค้าถือว่า ส่งมอบสมบูรณ์ ตามสัญญาเช่าซื้อ
                        <br />
                        2. ความเสียหายที่เกิดขึ้นภายหลังจากการรับมอบ ซึ่งมิใช่เกิดจากการติดตั้งระบบควบคุมอุปกรณ์ (MDM) หรือการปฏิบัติของบริษัทฯ ถือเป็นความรับผิดของผู้เช่าซื้อ
                        <br />
                        3. ข้าพเจ้าได้ถ่ายรูป/อัปโหลดภาพประกอบการรับสินค้าแล้วเพื่อเป็นหลักฐาน
                        <br />
                        <br />
                        กรุณาถ่ายภาพตัวท่านคู่กับสินค้า หรือถ่ายภาพสินค้า ณ จุดรับมอบ เพื่อเป็นหลักฐานการรับมอบ
                        <div className='py-6'>
                            <h2 className='font-semibold'>ตัวอย่างการถ่ายรูปยืนยันรับสินค้า</h2>
                            <img src={ExamPeople} className='w-full' alt="" />
                        </div>
                    </div>
                    
                </div> */}
                <div className="flex flex-col gap-2 justify-center sm:justify-end border-t w-full fixed bottom-0 left-0 py-4 sm:py-6 px-4 sm:px-14 bg-white">
                    <div className="flex gap-3 items-center">
                        <input type="checkbox" name="accept" id="aceept" className="w-6 h-6 cursor-pointer" onChange={(e) => setCheck(e.target.checked)} />
                        <label htmlFor="accept">ข้าพเจ้ายอมรับเงื่อนไขและยืนยันข้อมูลถูกต้อง</label>
                    </div>
                    <p className={`${check ? 'text-red-500' : 'text-gray-300'} text-red-500 text-base`}>
                        เมื่อกดปุ่มนี้ ถือว่าผู้เช่าซื้อได้ยืนยันการรับมอบสินค้าโดยสมบูรณ์ และบริษัทฯ มีสิทธิเก็บบันทึกข้อมูล รูปภาพ เวลา และตำแหน่งที่ตั้ง ณ เวลารับมอบตามที่ได้รับความยินยอมด้าน PDPA
                    </p>
                    <button
                        type="button"
                        onClick={onSubmitPolicy}
                        disabled={!check}
                        className={`${
                            check ? 'bg-green-700 active:scale-[98%] cursor-pointer' : 'bg-gray-300'
                        } text-white rounded-md py-2 flex gap-2 justify-center w-full outline-none border-none  focus:outline-none focus:ring-0`}
                    >
                        <IconCamera /> ถ่ายรูปยืนยันรับสินค้า
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceivePolicy;
