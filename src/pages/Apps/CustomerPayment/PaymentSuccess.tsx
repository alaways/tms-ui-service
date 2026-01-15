import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import themeConfig from '../../../theme.config'

const mode = process.env.MODE || 'admin'

const PaymentSuccess = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const location = useLocation()

  const { initialRecordsPeriod, ins_no, payment_preview, payment_qr } = location.state || {}

  useEffect(() => {
    dispatch(setPageTitle('ชำระเงินสำเร็จ'))
  }, [dispatch])

  const submitForm = () => {
    navigate('/apps/customer-payment/list')
  }

  const formatNumber = (num: any) => {
    return num ? num.toFixed(2) : '0.00'
  }

  return (
    <div>
      <div className="absolute inset-0">
        <img src="/assets/images/auth/bg-gradient.png" alt="background" className="h-full w-full object-cover" />
      </div>
      <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
        <img src="/assets/images/auth/coming-soon-object3.png" alt="object3" className="absolute right-0 top-0 h-[300px]" />
        <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 text-center dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
          <div className="rounded-md bg-white/60 p-4 backdrop-blur-lg dark:bg-black/50 sm:p-6">
            <div className="mx-auto mt-5 w-full max-w-[550px] md:mt-16">
              <div className="mb-12">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-green-500 md:text-4xl">
                  ชำระเงินสำเร็จ
                </h1>
                <p className="text-base font-bold leading-normal text-black">
                  ขอบคุณค่ะ คุณได้ชำระยอดเงินจำนวน {payment_preview?.total} บาท เรียบร้อยแล้ว
                </p>
                <p className="text-base font-bold leading-normal text-black">
                  Invoice ID: {initialRecordsPeriod?.id} | Transaction ID: {payment_qr}
                </p>
              </div>
              <div className="mb-16 text-left text-xl font-bold leading-none text-black sm:text-2xl md:mb-24 md:gap-4 md:text-[20px]">
                <div className="p-6">
                  <p className="mb-4">รายการ</p>
                  <div className="flex justify-between mb-2">
                    <div className="">ค่างวด ที่ {ins_no?.ins_no}</div>
                    <div>{formatNumber(payment_preview?.amount)} บาท</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="">ค่าดำเนินการล่าช้า/วัน</div>
                    <div>{formatNumber(payment_preview?.penalty_fee)} บาท</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="">ค่าติดตาม</div>
                    <div>{formatNumber(payment_preview?.tracking_fee)} บาท</div>
                  </div>
                  {payment_preview?.unlock_fee ? (
                    <div className="flex justify-between mb-2">
                      <div className="text-white-dark">ค่าปลดล็อค</div>
                      <div>{formatNumber(payment_preview?.unlock_fee)} บาท</div>
                    </div>
                  ) : null}
                  <div className="flex justify-between mb-2">
                    <div className="">ค่าธรรมเนียม</div>
                    <div>{formatNumber(payment_preview?.fee)} บาท</div>
                  </div>
                  <div className="flex justify-between font-bold text-[22px] mt-4">
                    <div className="">รวมเป็นเงิน</div>
                    <div>{formatNumber(payment_preview?.total)} บาท</div>
                  </div>
                </div>
              </div>
              <div className="text-base font-bold leading-normal text-black">
                โปรดบันทึกหน้านี้เป็นหลักฐาน ขอบคุณค่ะ
              </div>
              <button onClick={submitForm} className={`mt-4 px-4 py-2 bg-themePrimary text-white rounded`}>
                กลับไปหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

export default PaymentSuccess