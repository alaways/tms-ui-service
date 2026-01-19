import { useState, useEffect, useCallback } from 'react'
import { Form, Formik } from 'formik'
import Swal from 'sweetalert2'
import InputField from '../../../../components/HOC/InputField'
import { toastAlert } from '../../../../helpers/constant'
import { useGlobalMutation } from '../../../../helpers/globalApi'
import { url_api } from '../../../../services/endpoints'
import { useBusinessUnitFindMutation } from '../../../../services/mutations/useBusinessUnitMutation'
import themeInit from '../../../../theme.init'

interface PaymentGatewaySettingsProps {
  id_bu: number
}

const defaultPaymentForm = {
  paysolution_mercantid: '',
  paysolution_key: '',
  paysolution_secret_key: '',
  paysolution_token: '',
  tqr_biller_id: '',
  tqr_merchant_name: '',
  tqr_company_name: '',
  tqr_company_name_en: '',
  tqr_user: '',
  tqr_password: '',
  tqr_customer_key: '',
  tqr_customer_secret: '',
}

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const PaymentGatewaySettings = ({ id_bu }: PaymentGatewaySettingsProps) => {
  const [paymentFormData, setPaymentFormData] = useState<any>(defaultPaymentForm)

  const { mutate: fetchBusinessUnitFindData } = useBusinessUnitFindMutation({
    onSuccess: (res) => {
      const setFormValue = res.data
      setPaymentFormData({
        paysolution_mercantid: setFormValue?.paysolution_mercantid || '',
        paysolution_key: setFormValue?.paysolution_key || '',
        paysolution_secret_key: setFormValue?.paysolution_secret_key || '',
        paysolution_token: setFormValue?.paysolution_token || '',
        tqr_biller_id: setFormValue?.tqr_biller_id || '',
        tqr_merchant_name: setFormValue?.tqr_merchant_name || '',
        tqr_company_name: setFormValue?.tqr_company_name || '',
        tqr_company_name_en: setFormValue?.tqr_company_name_en || '',
        tqr_user: setFormValue?.tqr_user || '',
        tqr_password: setFormValue?.tqr_password || '',
        tqr_customer_key: setFormValue?.tqr_customer_key || '',
        tqr_customer_secret: setFormValue?.tqr_customer_secret || '',
      })
    },
    onError: () => { },
  })

  const { mutate: buUpdateConfig } = useGlobalMutation(url_api.buUpdateConfig, {
    onSuccess: (res: any) => {
      if (res.statusCode !== 400) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        })
        location.reload()
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
    onError: (err: any) => {
      toast.fire({
        icon: 'error',
        title: err.message,
        padding: '10px 20px',
      })
    },
  })

  useEffect(() => {
    fetchBusinessUnitFindData({ data: { id: id_bu } })
  }, [id_bu])

  const submitForm = useCallback(
    (values: any) => {
      const data = {
        ...values,
        is_active: true
      }
      buUpdateConfig({ data: { ...data }, id: id_bu })
    },
    [buUpdateConfig, id_bu]
  )

  return (
    <Formik
      initialValues={paymentFormData}
      onSubmit={submitForm}
      enableReinitialize
      autoComplete="off"
    >
      {() => (
        <Form className="space-y-5 dark:text-white">
          <div className="panel flex flex-col gap-4">
            <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
              ตั้งค่าการชำระเงิน (Paysolution)
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                required={false}
                label="MercantID Paysolution"
                name="paysolution_mercantid"
                disabled={mode === 'business_unit'}
              />
              <InputField
                required={false}
                label="Api Key Paysolution"
                name="paysolution_key"
                disabled={mode === 'business_unit'}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                required={false}
                label="SecretKey Paysolution"
                name="paysolution_secret_key"
                disabled={mode === 'business_unit'}
              />
              <InputField
                required={false}
                label="Token Paysolution"
                name="paysolution_token"
                disabled={mode === 'business_unit'}
              />
            </div>

            {themeInit?.paymentGateway.tqr && (
              <>
                <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-2">
                  ตั้งค่าการชำระเงิน (TQR)
                </div>

                <div className="flex flex-col sm:flex-row gap-4 ">
                  <InputField
                    required={false}
                    label="billerID"
                    name="tqr_biller_id"
                    disabled={mode === 'business_unit'}
                  />
                  <InputField
                    required={false}
                    label="Merchant Name"
                    name="tqr_merchant_name"
                    disabled={mode === 'business_unit'}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 ">
                  <InputField
                    required={false}
                    label="ชื่อบริษัท"
                    name="tqr_company_name"
                    disabled={mode === 'business_unit'}
                  />
                  <InputField
                    required={false}
                    label="ชื่อบริษัท (ภาษาอังกฤษ)"
                    name="tqr_company_name_en"
                    disabled={mode === 'business_unit'}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <InputField
                    required={false}
                    label="User"
                    name="tqr_user"
                    disabled={mode === 'business_unit'}
                  />
                  <InputField
                    required={false}
                    label="Password"
                    name="tqr_password"
                    disabled={mode === 'business_unit'}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 ">
                  <InputField
                    required={false}
                    label="Customer Key"
                    name="tqr_customer_key"
                    disabled={mode === 'business_unit'}
                  />
                  <InputField
                    required={false}
                    label="Customer Secret"
                    name="tqr_customer_secret"
                    disabled={mode === 'business_unit'}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
              บันทึก
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default PaymentGatewaySettings
