import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import themeConfig from '../../../theme.config'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'admin'

const PaymentSuccess = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const location = useLocation()

  const { initialRecordsPeriod, ins_no, payment_preview, payment_qr } = location.state || {}

  useEffect(() => {
    dispatch(setPageTitle(t('payment_success_title')))
  }, [dispatch, t])

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
                  {t('payment_success_title')}
                </h1>
                <p className="text-base font-bold leading-normal text-black">
                  {t('thank_you_payment', { amount: payment_preview?.total })}
                </p>
                <p className="text-base font-bold leading-normal text-black">
                  {t('invoice_id')}: {initialRecordsPeriod?.id} | {t('transaction_id')}: {payment_qr}
                </p>
              </div>
              <div className="mb-16 text-left text-xl font-bold leading-none text-black sm:text-2xl md:mb-24 md:gap-4 md:text-[20px]">
                <div className="p-6">
                  <p className="mb-4">{t('items_list')}</p>
                  <div className="flex justify-between mb-2">
                    <div className="">{t('installment_no_label')} {ins_no?.ins_no}</div>
                    <div>{formatNumber(payment_preview?.amount)} {t('baht')}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="">{t('penalty_fee')}</div>
                    <div>{formatNumber(payment_preview?.penalty_fee)} {t('baht')}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="">{t('tracking_fee')}</div>
                    <div>{formatNumber(payment_preview?.tracking_fee)} {t('baht')}</div>
                  </div>
                  {payment_preview?.unlock_fee ? (
                    <div className="flex justify-between mb-2">
                      <div className="text-white-dark">{t('unlock_fee')}</div>
                      <div>{formatNumber(payment_preview?.unlock_fee)} {t('baht')}</div>
                    </div>
                  ) : null}
                  <div className="flex justify-between mb-2">
                    <div className="">{t('service_fee')}</div>
                    <div>{formatNumber(payment_preview?.fee)} {t('baht')}</div>
                  </div>
                  <div className="flex justify-between font-bold text-[22px] mt-4">
                    <div className="">{t('total')}</div>
                    <div>{formatNumber(payment_preview?.total)} {t('baht')}</div>
                  </div>
                </div>
              </div>
              <div className="text-base font-bold leading-normal text-black">
                {t('please_save_page')}
              </div>
              <button onClick={submitForm} className={`mt-4 px-4 py-2 bg-themePrimary text-white rounded`}>
                {t('back_to_home')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

export default PaymentSuccess