import { useState, useEffect, useCallback } from 'react'
import { Form, Formik } from 'formik'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import InputField from '../../../../components/HOC/InputField'
import { toastAlert } from '../../../../helpers/constant'
import { useGlobalMutation } from '../../../../helpers/globalApi'
import { url_api } from '../../../../services/endpoints'
import { useBusinessUnitFindMutation } from '../../../../services/mutations/useBusinessUnitMutation'

interface LineSystemSettingsProps {
  id_bu: number
}

const defaultLineForm = {
  line_qa_id: '',
  line_token: '',
  line_secret: '',
  ln_pre_due_day: 0,
  ln_after_due_day: 0,
}

const SubmittedFormLine = Yup.object().shape({
  line_qa_id: Yup.string().required('กรุณากรอก Line QA ID'),
  line_token: Yup.string().required('กรุณากรอก Line Token'),
  line_secret: Yup.string().required('กรุณากรอก Line Secret'),
})

const toast = Swal.mixin(toastAlert)

const LineSystemSettings = ({ id_bu }: LineSystemSettingsProps) => {
  const [lineFormData, setLineFormData] = useState<any>(defaultLineForm)

  const { mutate: fetchBusinessUnitFindData } = useBusinessUnitFindMutation({
    onSuccess: (res) => {
      const setFormValue = res.data
      setLineFormData({
        line_qa_id: setFormValue.line_qa_id || '',
        line_token: setFormValue?.line_token || '',
        line_secret: setFormValue?.line_secret || '',
        ln_pre_due_day: setFormValue.ln_pre_due_day || 0,
        ln_after_due_day: setFormValue.ln_after_due_day || 0,
      })
    },
    onError: () => { },
  })

  const { mutate: buUpdateLineConfig } = useGlobalMutation(url_api.buUpdateLineConfig, {
    onSuccess(res: any) {
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

  const submitLineForm = useCallback(
    (values: any) => {
      const data = {
        ...values,
        ln_pre_due_day: +values.ln_pre_due_day,
        ln_after_due_day: +values.ln_after_due_day,
        is_active: true
      }
      buUpdateLineConfig({ data: { ...data }, id: id_bu })
    }, [buUpdateLineConfig, id_bu]
  )

  return (
    <Formik
      initialValues={lineFormData}
      onSubmit={submitLineForm}
      enableReinitialize
      autoComplete="off"
      validationSchema={SubmittedFormLine}
    >
      {() => (
        <Form className="space-y-5 dark:text-white pt-4">
          <div className="flex flex-col gap-4">
            <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
              ตั้งค่าไลน์
            </div>
            <div className="grid grid-cols-2 gap-4 w-full items-end">
              <div>
                <InputField
                  label="Line QA ID"
                  name="line_qa_id"
                  type="text"
                  require={true}
                />
              </div>
              <div>
                <InputField
                  label="Line Token"
                  name="line_token"
                  type="text"
                  require={true}
                />
              </div>
              <div>
                <InputField
                  label="Line Secret"
                  name="line_secret"
                  type="text"
                  require={true}
                />
              </div>
              <div className="flex justify-end items-end">
                <button type="submit" className="btn border-0 btn-primary h-[40px]">
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default LineSystemSettings
