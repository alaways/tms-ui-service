import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { formatIDNumber, formatPhoneNumber, numberWithCommas } from '../../../helpers/formatNumeric'
import './Invoice.css'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import PreLoading from '../../../helpers/preLoading'
import { toastAlert } from '../../../helpers/constant';
import themeInit from '../../../theme.init'

const InvoiceCC = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const toast = Swal.mixin(toastAlert);
    
  const [paymentPreview, setPaymentPreview] = useState<any>()
  const { installmentLast, contractID, ins_no } = location.state || {}

    const { mutate: fetchData,isLoading } = useGlobalMutation(url_api.customerPaymentPreviewClose, {
      onSuccess: (res: any) => {
        setPaymentPreview(res.data)
      },
      onError: () => {
        showErrorMessage('Failed to fetch business units')
      },
    })

  const goPayment = () => {
    navigate('/apps/customer-payment/payment-cc/'+id, {
      state: {
        contractID,
        ins_no: ins_no,
        payment_preview: paymentPreview,
      },
    })
  }

  useEffect(() => {
    dispatch(setPageTitle('ใบแจ้งหนี้ (Invoice)'))
  }, [dispatch])

  useEffect(() => {
    fetchData({
      data: {
        id_contract: id
      }
    })
  }, [fetchData])

  const { mutate: cancelQrcode,isLoading:cancelLoading } = useGlobalMutation(url_api.customerCancelQrcode, {
      onSuccess: async (res: any) => {
          if (res.statusCode === 400 || res.code === 400) {
              showNotification(res.message, 'error');
          } else {
              
            toast.fire({
                icon: 'success',
                title: 'ยกเลิกการปิดสัญญาเรียบร้อบแล้ว',
                padding: '10px 20px',
            })
            setTimeout(() => {
              navigate('/apps/customer-payment/list')
          }, 500);
            //
          }
      },
      onError: (err: any) => {
          toast.fire({
              icon: 'error',
              title: err.message,
              padding: '10px 20px',
          });
      },
  });

  const handleCancelQrCode = async () => {

    Swal.fire({
          title: 'ยืนยันการยกเลิกการปิดสัญญา',
          text: 'คุณต้องการยกเลิกชำระเงินใช่หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: themeInit.color.themePrimary,
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          reverseButtons: true,
      }).then((result) => {
          if (result.isConfirmed) {
              cancelQrcode({data: { id_payment:paymentPreview.id_payment }})
              
          }
      });
  
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    const toast = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
    })
    toast.fire({
      icon: type,
      title: message,
      padding: '10px 20px',
    })
  }

  const showErrorMessage = (message: string) => {
    showNotification(message, 'error')
  }

  return (
    <div>
      {(isLoading || cancelLoading) && <PreLoading />}
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link to="/apps/customer-payment/list" className="text-primary hover:underline">
            หน้าหลัก
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>
             เลขที่สัญญา {paymentPreview?.reference}
          </span>
        </li>
      </ul>
      <div className="py-5 animate__animated">

          {paymentPreview?.status === "pending" && (
              <div className="w-full h-auto text-center text-warning bg-warning-light dark:bg-warning-dark-light rounded-md mb-5">
                  <div className="flex justify-between items-center p-5">
                  <div
                      className="text-left"
                      style={{ cursor: 'pointer' }}
                  >
                      กำลังดำเนินการปิดสัญญา กรุณาชำระเงิน หรือกดยกเลิกเพื่อกลับไปชำระตามงวดปกติ {">"}
                  </div>

                  <button
                      type="button"
                      className="btn btn-xl btn-outline-danger"
                      onClick={handleCancelQrCode}
                  >
                      ยกเลิก
                  </button>
                  </div>
              </div>
          )}

        <div className="panel !px-0">

         
          <div className="flex justify-between flex-wrap gap-4 px-4">
            <div className="text-2xl font-semibold uppercase">
              ใบแจ้งหนี้ ปิดสัญญา(Invoice)
            </div>
            <div className="shrink-0 py-10 invoice-logo">
              <img src={paymentPreview?.business_unit?.logo_image_url} alt="img" className="w-36 ltr:ml-auto rtl:mr-auto" />
            </div>
          </div>
          <div className="ltr:text-left rtl:text-left px-4">
            <div className="space-y-1 mt-6 text-white-dark">
              <div> เลขที่สัญญา: {paymentPreview?.reference}</div>
            </div>
          </div>
          <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
          <div className="ltr:text-left rtl:text-left px-6">
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ชื่อธุรกิจ :
              </div>
              <div>
                {paymentPreview?.business_unit?.name}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ที่อยู่ :
              </div>
              <div>
                {paymentPreview?.business_unit?.address}
                {` ${paymentPreview?.business_unit?.subdistrict?.name_th ?? ''}`}
                {` ${paymentPreview?.business_unit?.district?.name_th ?? ''}`}
                {` ${paymentPreview?.business_unit?.province?.name_th ?? ''}`}
                {` ${paymentPreview?.business_unit?.zip_code ?? ''}`}
              </div>
            </div>
            <div className="flex items-center w-full justify-between data-responsive">
              <div className="text-white-dark">
                โทรศัพท์ :
              </div>
              <div>
                {paymentPreview?.business_unit?.phone ?? ''}
              </div>
            </div>
          </div>
          <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
          <div className="ltr:text-left rtl:text-left px-6">
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ชื่อ :
              </div>
              <div>
                {paymentPreview?.customer?.name ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                เลขบัตรประจำตัวประชาชน :
              </div>
              <div>
                {formatIDNumber(paymentPreview?.customer?.citizen_id ?? '')}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                เบอร์หลัก :
              </div>
              <div>
                {formatPhoneNumber(paymentPreview?.customer?.phone_number ?? '')}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                เบอร์อ้างอิง :
              </div>
              <div>
                {formatPhoneNumber(paymentPreview?.customer?.phone_number_ref ?? '')}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ที่อยู่ปัจจุบัน :
              </div>
              <div>
                {paymentPreview?.customer?.full_current_address}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ที่อยู่ที่ทำงาน :
              </div>
              <div>
                {paymentPreview?.customer?.full_work_address ?? ''}
              </div>
            </div>
          </div>
          <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
          <div className="ltr:text-left rtl:text-left px-6">
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ชื่อสินทรัพย์ :
              </div>
              <div>
                {paymentPreview?.asset?.name ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                IMEI/SN :
              </div>
              <div>
                {paymentPreview?.asset?.imei ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                รหัสรุ่น :
              </div>
              <div>
                {paymentPreview?.asset?.serial_number ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                สี :
              </div>
              <div>
                {paymentPreview?.asset?.color ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ความจุ :
              </div>
              <div>
                {paymentPreview?.asset?.capacity ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ข้อสังเกตุ :
              </div>
              <div>
                {paymentPreview?.asset?.note ?? ''}
              </div>
            </div>
          </div>
          <div className="my-4"></div>
          <div className="border-b border-white-light p-6 text-[22px] font-bold dark:border-dark dark:text-white">
            รายการ
          </div>
          <div className="p-6">
            <div className="flex justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ค่างวด x {paymentPreview?.preview.remaining_ins}
              </div>
              <div>
                {numberWithCommas(paymentPreview?.preview?.total_amount) + ' บาท'}
              </div>
            </div>
            {paymentPreview?.preview.penalty_fee ? (
            <div className="flex justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ค่าดำเนินการล่าช้า/วัน
              </div>
              <div>
                {numberWithCommas(paymentPreview?.preview.penalty_fee) + ' บาท'}
              </div>
            </div>
            ): null}

            {paymentPreview?.preview.tracking_fee ? (
            <div className="flex justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ค่าติดตาม
              </div>
              <div>
                {numberWithCommas(paymentPreview?.preview.tracking_fee) + ' บาท'}
              </div>
            </div>
            ): null}

            {paymentPreview?.preview.unlock_fee ? (
              <div className="flex justify-between mb-2 data-responsive">
                <div className="text-white-dark">
                  ค่าปลดล็อค
                </div>
                <div>
                  {numberWithCommas(paymentPreview?.unlock_fee) + ' บาท'}
                </div>
              </div>
            ):null}


            {paymentPreview?.preview.discount ? (
            <div className="flex justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                ส่วนลด
              </div>
              <div>
                {numberWithCommas(paymentPreview?.preview.discount) + ' บาท'}
              </div>
            </div>
            ): null}
            {/* <div className="flex justify-between mb-2">
              <div className="text-white-dark">ค่าธรรมเนียม</div>
              <div>{numberWithCommas(paymentPreview?.fee)} บาท</div>
            </div> */}
            <div className="flex justify-between font-bold text-[22px] mt-4 data-responsive">
              <div className="text-white-dark">
                รวมเป็นเงิน
              </div>
              <div className="total">
                {numberWithCommas(paymentPreview?.preview?.total) + ' บาท'}
              </div>
            </div>
          </div>
          <div className="p-6">
            <button className="bg-black text-white w-full py-3 font-bold" onClick={() => goPayment() }>
              ชำระเงิน
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceCC
