import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { formatIDNumber, formatPhoneNumber, numberWithCommas } from '../../../helpers/formatNumeric'
import './Invoice.css'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import PreLoading from '../../../helpers/preLoading'
import { useTranslation } from 'react-i18next'
const mode = process.env.MODE || 'admin'
const Invoice = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [paymentPreview, setPaymentPreview] = useState<any>()
  const { installmentLast, contractID, ins_no } = location.state || {}

    const { mutate: fetchData,isLoading } = useGlobalMutation(url_api.customerPaymentPreviewFind, {
      onSuccess: (res: any) => {
        setPaymentPreview(res.data)
      },
      onError: () => {
        showErrorMessage('Failed to fetch business units')
      },
    })

  const goPayment = () => {
    navigate('/apps/customer-payment/payment', {
      state: {
        contractID,
        ins_no: ins_no,
        payment_preview: paymentPreview,
      },
    })
  }

  useEffect(() => {
    dispatch(setPageTitle(t('invoice_title')))
  }, [dispatch])

  useEffect(() => {
    fetchData({
      data: {
        id_installment: installmentLast,
        id_contract: contractID
      }
    })
  }, [fetchData])

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
      {(isLoading) && <PreLoading />}
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link to="/apps/customer-payment/list" className="text-primary hover:underline">
            {t('home_page')}
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>
             {t('contract_number_label')} {paymentPreview?.reference}
          </span>
        </li>
      </ul>
      <div className="py-5 animate__animated">
        <div className="panel !px-0">
          <div className="flex justify-between flex-wrap gap-4 px-4">
            <div className="text-2xl font-semibold uppercase">
              {t('invoice_title')}
            </div>
            <div className="shrink-0 py-10 invoice-logo">
              <img src={paymentPreview?.business_unit?.logo_image_url} alt="img" className="w-36 ltr:ml-auto rtl:mr-auto" />
            </div>
          </div>
          <div className="ltr:text-left rtl:text-left px-4">
            <div className="space-y-1 mt-6 text-white-dark">
              <div> {t('contract_number_label')}: {paymentPreview?.reference}</div>
            </div>
          </div>
          <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
          <div className="ltr:text-left rtl:text-left px-6">
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('business_name')} :
              </div>
              <div>
                {paymentPreview?.business_unit?.name}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('address')} :
              </div>
              <div>
                {paymentPreview?.business_unit?.address}
                {` ${paymentPreview?.business_unit?.subdistrict?.name_th ?? ''}`}
                {` ${paymentPreview?.business_unit?.district?.name_th ?? ''}`}
                {` ${paymentPreview?.business_unit?.province?.name_th ?? ''}`}
                {` ${paymentPreview?.business_unit?.zip_code ?? '' }`}
              </div>
            </div>
            <div className="flex items-center w-full justify-between data-responsive">
              <div className="text-white-dark">
                {t('phone_number')} :
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
                {t('name')} :
              </div>
              <div>
                {paymentPreview?.customer?.name ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('citizen_id_label')} :
              </div>
              <div>
                {formatIDNumber(paymentPreview?.customer?.citizen_id ?? '')}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('main_phone')} :
              </div>
              <div>
                {formatPhoneNumber(paymentPreview?.customer?.phone_number ?? '')}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('reference_phone')} :
              </div>
              <div>
                {formatPhoneNumber(paymentPreview?.customer?.phone_number_ref ?? '')}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('current_address')} :
              </div>
              <div>
                {paymentPreview?.customer?.full_current_address ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('work_address')} :
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
                {t('asset_name')} :
              </div>
              <div>
                {paymentPreview?.asset?.name ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('imei_sn')} :
              </div>
              <div>
                {paymentPreview?.asset?.imei ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('model_code')} :
              </div>
              <div>
                {paymentPreview?.asset?.serial_number ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('color')} :
              </div>
              <div>
                {paymentPreview?.asset?.color ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('capacity')} :
              </div>
              <div>
                {paymentPreview?.asset?.capacity ?? ''}
              </div>
            </div>
            <div className="flex items-center w-full justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('note')} :
              </div>
              <div>
                {paymentPreview?.asset?.note ?? ''}
              </div>
            </div>
          </div>
          <div className="my-4"></div>
          <div className="border-b border-white-light p-6 text-[22px] font-bold dark:border-dark dark:text-white">
            {t('items')}
          </div>
          <div className="p-6">
            <div className="flex justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('installment_amount')}
              </div>
              <div>
                {numberWithCommas(paymentPreview?.amount ?? 0) + ' ' + t('baht')}
              </div>
            </div>
            <div className="flex justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('late_fee_per_day')}
              </div>
              <div>
                {numberWithCommas(paymentPreview?.penalty_fee ?? 0) + ' ' + t('baht')}
              </div>
            </div>
            <div className="flex justify-between mb-2 data-responsive">
              <div className="text-white-dark">
                {t('tracking_fee')}
              </div>
              <div>
                {numberWithCommas(paymentPreview?.tracking_fee ?? 0) + ' ' + t('baht')}
              </div>
            </div>
            {paymentPreview?.unlock_fee ? (
              <div className="flex justify-between mb-2 data-responsive">
                <div className="text-white-dark">
                  {t('unlock_fee')}
                </div>
                <div>
                  {numberWithCommas(paymentPreview?.unlock_fee) + ' ' + t('baht')}
                </div>
              </div>
            ) : null}
            {/* <div className="flex justify-between mb-2">
              <div className="text-white-dark">Fee</div>
              <div>{numberWithCommas(paymentPreview?.fee)} Baht</div>
            </div> */}
            <div className="flex justify-between font-bold text-[22px] mt-4 data-responsive">
              <div className="text-white-dark">
                {t('total')}
              </div>
              <div className="total">
                {numberWithCommas(paymentPreview?.total) + ' ' + t('baht')}
              </div>
            </div>
          </div>
          <div className="p-6">
            <button className="bg-black text-white w-full py-3 font-bold" onClick={() => goPayment() }>
              {t('pay_now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoice
