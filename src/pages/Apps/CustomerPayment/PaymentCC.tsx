import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { numberWithCommas } from '../../../helpers/formatNumeric'
import themeInit from '../../../theme.init'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
const mode = process.env.MODE || 'admin'
//TODO: update param name


interface TimeLeft {
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
}

const PaymentCC = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const storedUser = localStorage.getItem(mode)
  const [loading, setLoading] = useState(true)
  const [refno, setRefno] = useState<string>('')
  const [expiredate, setExpiredate] = useState<string>('')
  const [qrCodeImage, setQrCodeImage] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({})
  const [lineId, setLineID] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const { id } = useParams()
  const apiUrl = process.env.BACKEND_URL
  const handleError = () => {
    Swal.fire({
      title: 'ขออภัย!',
      text: 'สร้าง QR Code ไม่สำเร็จ กรุณากด สร้าง QRCode ใหม่อีกครั้ง',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: themeInit.color.themePrimary,
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        //window.location.reload();
      }
    });
  };


  const { mutate: fetchData,isLoading } = useGlobalMutation(url_api.customerGetPaymentClose, {
      onSuccess: (res: any) => {
          if (res.data.payment.status === 'complete') {
          navigate('/apps/customer-payment/success', {
            state: {
              id,
            },
          })
        }
        setLineID(res.data.installment?.contract?.business_unit?.line_id)
        setAmount(res.data.payment?.amount)
        if (res?.data?.payment_qr?.image) {
          setQrCodeImage(res.data.payment_qr.image)
          setExpiredate(res.data.payment_qr.expiredate)
          setRefno(res.data.payment_qr.referenceNo)
          setLoading(false)
        }
    
        if(res?.data?.payment_qr?.image == "") {
          handleError()
        }
      },
      onError: () => {
          console.error('Failed to fetch asset type data')
      },
  })

  useEffect(() => {
    dispatch(setPageTitle('ชำระเงิน (Payment)'))
    const fetchPaymentDetails = async () => {

      try {
        fetchData({data:{id_contract: id}})
      } catch (error) {
        handleError()
      }
    }
    fetchPaymentDetails()
  }, [dispatch])

  useEffect(() => {

    if (!expiredate) return
    const calculateTimeLeft = () => {
      const difference = +new Date(expiredate) - +new Date()
      let timeLeft: TimeLeft = {}
      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }
      return timeLeft
    }
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [expiredate])


   const { mutate: fetchPaymentStatus } = useGlobalMutation(url_api.paymentCheckStatus, {
      onSuccess: (res: any) => {

         if (res.statusCode === 400 || res.code === 400) {
            Swal.fire({
                  icon: 'error',
                  title: 'ยกเลิกชำระเงิน',
                  padding: '10px 20px',
              }).then(() => {
                  navigate('/apps/customer-payment/list')
            });
        } else {
          if (res.data?.status == 'cancel') {
              Swal.fire({
                  icon: 'error',
                  title: 'ยกเลิกชำระเงิน',
                  padding: '10px 20px',
              }).then(() => {
                  navigate('/apps/customer-payment/list')
              });
          } else if (res.data?.status == 'complete') {
              Swal.fire({
                  icon: 'success',
                  title: 'ชำระเงินสำเร็จ',
                  padding: '10px 20px',
              }).then(() => {
                  navigate('/apps/customer-payment/list')
              });
          }
        }
      },

      onError: (err: any) => {
          setLoading(false);
      },
  });
  
   useEffect(() => {
    const interval = setInterval(async () => {
      try {
         fetchPaymentStatus({data: { id_contract: id, type: 'close_contract' } });
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [apiUrl, refno, navigate])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = qrCodeImage
    link.download = 'qr_code.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reGenerateQRCode = async () => {
    // Swal.fire({
    //   title: 'กำลังสร้าง QR Code ใหม่...',
    //   onBeforeOpen: () => {
    //     Swal.showLoading()
    //   },
    // })
    try {
      window.location.reload()
      // const response = await fetch(`${apiUrl}/payment/re-generate-qr-payment`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     id_installment: ins_no?.id,
      //     id_contract: contractID,
      //   }),
      // })
      // if (!response.ok) {
      //   throw new Error('Network response was not ok')
      // }
      // const data = await response.json()
      // if (data.data.payment_qr.image) {
      //   setQrCodeImage(data.data.payment_qr.image)
      //   setExpiredate(data.data.payment_qr.expiredate)
      //   setRefno(data.data.payment_qr.referenceNo)
      //   setLoading(false)
      //   Swal.fire({
      //     icon: 'success',
      //     title: 'สร้าง QR Code ใหม่สำเร็จ',
      //     showConfirmButton: false,
      //     timer: 1500,
      //   })
      // }
    } catch (error) {
      // Swal.fire({
      //     icon: 'error',
      //     title: 'เกิดข้อผิดพลาด',
      //     text: 'ไม่สามารถสร้าง QR Code ใหม่ได้',
      // })
      window.location.reload()
      console.error('Error regenerating QR code:', error)
    }
  }

  const timerComponents: JSX.Element[] = []

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof TimeLeft]) {
      return
    }
    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval as keyof TimeLeft]} {interval}{' '}
      </span>
    )
  })

  return (
    <>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link to="/apps/customer-payment/list" className="text-primary hover:underline">
            หน้าหลัก
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>ชำระเงิน (Payment)</span>
        </li>
      </ul>
      <div className="py-10 animate__animated">
        <div className="panel !px-0">
          <div className="flex justify-between flex-wrap gap-4 px-4">
            <div className="text-2xl font-semibold uppercase">ชำระเงิน (Payment)</div>
            <div className="shrink-0">
              <img src={themeInit.logo.CustomerLogo}  alt="img" className="w-36 ltr:ml-auto rtl:mr-auto" />
            </div>
          </div>
          <div className="ltr:text-left rtl:text-left px-4">
            <div className="space-y-1 mt-6 text-white-dark">
              {/* <div>เลขที่สัญญา {payment_preview?.reference}</div>
              <div>งวดที่: {ins_no?.ins_no}</div> */}
            </div>
          </div>
          <div className="my-4"></div>
          <div className="flex justify-between font-bold text-[22px] mt-4">
            <div className="p-6 text-[22px] font-bold dark:border-dark dark:text-white">
              ยอดที่ต้องชำระ
            </div>
             <div className="p-6 text-[22px] font-bold dark:border-dark dark:text-white">
                <div>{numberWithCommas(amount)} บาท</div>
            </div>
        
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <span className="animate-spin border-8 border-[#f1f2f3] border-l-primary border-r-primary rounded-full w-14 h-14 inline-block align-middle"></span>
              </div>
            ) : (
              <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                <div className="my-4">{(qrCodeImage && timerComponents.length) ? <img src={qrCodeImage} alt="QR Code" className="w-full max-w-xs mx-auto" /> : <div>{expiredate}</div>}</div>
              </div>
            )}
            {(qrCodeImage && timerComponents.length) && (
              <div className="text-center">
                <button className="bg-blue-600 text-white py-2 px-4 rounded" onClick={handleDownload}>
                  บันทึกรูป
                </button>
              </div>
            )}

            <br />

            <div className="text-center">
              <div className="py-2">เวลานับถอยหลัง</div>
              <div>
                {timerComponents.length ? (
                  timerComponents
                ) : (
                  <button className="bg-blue-600 text-white py-2 px-4 rounded" onClick={reGenerateQRCode}>
                    สร้าง QR Code ใหม่
                  </button>
                )}
              </div>
            </div>
            <div className="mt-6">
              <div className="text-lg font-bold mb-2">ขั้นตอนดำเนินการ</div>
              <ol className="list-decimal list-inside text-white-dark text-sm">
                <li>บันทึกรูป QR Code โดยกดปุ่ม "บันทึกรูป"</li>
                <li>เปิดแอปธนาคาร และเลือกวิธีสแกน QR Code</li>
                <li>เปิดรูปที่บันทึกไว้ และสแกน ตกลง เพื่อยืนยันการชำระ</li>
                <li>เมื่อชำระผ่านแอปธนาคารแล้ว กลับมาหน้านี้ และอัปเดต</li>
                <li>เมื่อระบบยืนยันการชำระเรียบร้อยแล้ว จะขึ้นว่า ยืนยันการชำระเรียบร้อย</li>
                <li>หากมีปัญหาการชำระเงิน สามารถติดต่อเจ้าหน้าที่ Line: {lineId}</li>

              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  )

}

export default PaymentCC
