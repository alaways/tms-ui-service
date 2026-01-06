import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';

import Swal from 'sweetalert2';
import { url_api } from '../../services/endpoints';
import { Form, Formik } from 'formik';

import InputField from '../../components/HOC/InputField';
import SelectField from '../../components/HOC/SelectField';
import { toastAlert } from '../../helpers/constant';
import { useGlobalMutation } from '../../helpers/globalApi';
import moment from 'moment'
import DatePicker from '../../components/HOC/DatePicker'
import { convertDateTimeToApiByBangkok, convertDateTimeOnUTC, convertToISO } from '../../helpers/formatDate'
import { showNotification } from '../../helpers/showNotification';

const mode = process.env.MODE || 'admin'

const TestPaymentCallBack = () => {
    const navigate = useNavigate()
    const storedUser = localStorage.getItem(mode)
    const toast = Swal.mixin(toastAlert)

    const role = storedUser ? JSON.parse(storedUser).role : null
    if (role !== 'admin') {
        navigate('/')
    }

    const [formData, setFormData] = useState<any>({
        refno: ''
    })

    const { mutate: postCallBack, isLoading } = useGlobalMutation(url_api.paymentCallbackTest, {
       onSuccess: (res: any) => {
        if (res.statusCode === 200 || res.code === 200) {
          showNotification('Success', 'success')
      
        } else {
          showNotification(res.message, 'error')
        }
        },
        onError: (err: any) => {
            showNotification(err.message, 'error')
        },
    })

    const submitForm = useCallback(
        (values: any) => {
            const data = {...values}
            postCallBack({data: data})
        },
        [postCallBack]
    )
    const SubmittedForm = Yup.object().shape({
       // message: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    });

    return (
        <div className="flex xl:flex-col flex-col gap-2.5">
            <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                    {({ setFieldValue }) => (
                        <Form className="space-y-5 dark:text-white ">
                            <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                                ทดสอบการชำระเงิน
                            </div>
                            <div>
                                
                                 <InputField
                                        required={false}
                                        label="Ref No"
                                        name="refno"
                                        disabled={mode === 'business_unit'}
                                  />

                                <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                                ทดสอบ
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )

}

export default TestPaymentCallBack