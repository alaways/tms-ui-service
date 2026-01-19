import { useState, useEffect, useCallback, Fragment } from 'react';
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
import { Dialog, Transition } from '@headlessui/react'
import IconX from '../../components/Icon/IconX';
const mode = process.env.MODE || 'admin'

const SettingPaymentSystem = () => {
    const navigate = useNavigate()
    const storedUser = localStorage.getItem(mode)
    const toast = Swal.mixin(toastAlert)
    const [actionModal, setActionModal] = useState(false)
    const role = storedUser ? JSON.parse(storedUser).role : null
    if (role !== 'admin') {
        navigate('/')
    }
    const [businessUnit, setBusinessUnit] = useState<any>([])

    const { mutate: fetchPayload } = useGlobalMutation(url_api.contractFilter, {
        onSuccess: (res: any) => {
          setBusinessUnit(
            res.data.business_unit.map((item: any) => ({
              value: item,
              label: item.name,
            }))
          )
        },
        onError: () => {
          console.error('Failed to fetch status data')
        },
    })
    
    const [formData, setFormData] = useState<any>({
        start_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
        end_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
        is_active: true,
        message: ""
    })

    const [formClearToken, setFormClearToken] = useState<any>({
        type: '',
        id_business_unit:null
    })
    const { mutate: getConfigTMS } = useGlobalMutation(url_api.getConfigTMS, {
        onSuccess: (res: any) => {
            setFormData({ 
                start_at: convertToISO(res.data.date_start),
                end_at: convertToISO(res.data.date_end),
                message: res.data.message,
                is_active: res.data.status,
                type: res.data.type
            })
        }
    })

    const { mutate: updateConfigTMS, isLoading } = useGlobalMutation(url_api.updateConfigTMS, {
        onSuccess: (res: any) => {
            if (res.statusCode === 200 || res.code === 200) {
                toast.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    padding: '10px 20px',
                })
                window.location.reload()
            } else {
                toast.fire({
                    icon: 'error',
                    title: res.message,
                    padding: '10px 20px',
                })
            }
        },
        onError: () => {

        },
    })


    const { mutate: clearAllCache } = useGlobalMutation(url_api.clearAllCache, {
        onSuccess: (res: any) => {
            if (res.statusCode === 200 || res.code === 200) {
                toast.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    padding: '10px 20px',
                })
            
            } else {
                toast.fire({
                    icon: 'error',
                    title: res.message,
                    padding: '10px 20px',
                })
            }
        }
    })


    const { mutate: reminderLine } = useGlobalMutation(url_api.reminderLine, {
        onSuccess: (res: any) => {
            if (res.statusCode === 200 || res.code === 200) {
                toast.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    padding: '10px 20px',
                })
            
            } else {
                toast.fire({
                    icon: 'error',
                    title: res.message,
                    padding: '10px 20px',
                })
            }
        }
    })


     const { mutate: clearToken } = useGlobalMutation(url_api.clearToken, {
        onSuccess: (res: any) => {
            if (res.statusCode === 200 || res.code === 200) {
                toast.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    padding: '10px 20px',
                })
            
            } else {
                toast.fire({
                    icon: 'error',
                    title: res.message,
                    padding: '10px 20px',
                })
            }
        }
    })


    useEffect(() => {
        getConfigTMS({})
        fetchPayload({})
    }, [getConfigTMS])

    const submitForm = useCallback(
        (values: any) => {
            const data = {
                ...values,
                start_at: convertDateTimeToApiByBangkok(values.start_at),
                end_at: convertDateTimeToApiByBangkok(values.end_at)
            }
            updateConfigTMS({
                data: data
            })
        },
        [updateConfigTMS]
    )


    const submitFormClearToken = useCallback(
        (values: any) => {
            clearToken({
                data: {
                    type:values?.type,
                    id_business_unit:values?.business_unit?.id ?? null
                    
                }
            })
        },
        [clearToken]
    )

    const SubmittedForm = Yup.object().shape({
        message: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    });

    const SubmittedFormToken = Yup.object().shape({
        type: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    });
    return (
        <div className="flex xl:flex-col flex-col gap-2.5">
            <div className="flex justify-end" style={{marginRight:25}}>

                <button type="submit" className="btn !mt-6 mr-2 border-0 btn-info" onClick={()=> {
                   reminderLine({})
                }}>
                    ส่งแจ้งเตือนชำระเงิน
                </button>

                <button type="submit" className="btn !mt-6 mr-2 border-0 btn-danger" onClick={()=> {
                   setActionModal(true)
                }}>
                Clear Token
                </button>

                <button type="submit" className="btn !mt-6 border-0 btn-warning" onClick={()=> {
                    clearAllCache({})
                }}>
                Clear Cache
                </button>
            </div>
            
            <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                    {({ setFieldValue }) => (
                        <Form className="space-y-5 dark:text-white ">
                            <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                                ระบบ ปิดใช้งานระบบชั่วคราว
                            </div>
                            <div>
                                <DatePicker
                                    label="วันที่เริ่ม"
                                    name="start_at"
                                    enableTime={true}
                                    onChange={(value: any) => {
                                        setFieldValue('start_at', convertDateTimeOnUTC(value));
                                    }}
                                />
                                <DatePicker
                                    label="วันที่สิ้นสุด"
                                    name="end_at"
                                    enableTime={true}
                                    onChange={(value: any) => {
                                        setFieldValue('end_at', convertDateTimeOnUTC(value));
                                    }}
                                />
                                <InputField
                                    require={true}
                                    label="คำอธิบาย"
                                    name="message"
                                    as="textarea"
                                    rows="10"
                                />
                                <SelectField
                                    label="หน้าที่แจ้งเปิด"
                                    id="type"
                                    name="type"
                                    isMulti={true}
                                    options={[
                                        { value: 'web', label: 'เว็บ' },
                                        { value: 'line', label: 'ไลน์' },
                                    ]}
                                />
                                <SelectField
                                    label="สถานะการปิดใช้งาน"
                                    id="is_active"
                                    name="is_active"
                                    options={[
                                        { value: false, label: 'ปิด' },
                                        { value: true, label: 'เปิด' },
                                    ]}
                                />
                                <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                                    {isLoading && (<span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>)}
                                    บันทึก
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            


            <Transition appear show={actionModal} as={Fragment}>
                <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
                    <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    >
                    <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                        >
                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark" style={{height:500}}>
                            <button
                            type="button"
                            onClick={() => setActionModal(false)}
                            className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                            >
                            <IconX />
                            </button>
                            <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Clear Token</div>
                            <div className="p-5">
                            <Formik
                                initialValues={formClearToken}
                                onSubmit={submitFormClearToken}
                                enableReinitialize
                                autoComplete="off"
                                validationSchema={SubmittedFormToken}
                                >
                                {(props) => (
                                    <Form className="space-y-5 mb-7 dark:text-white custom-select">
                                    <SelectField
                                        label="ประเภท*"
                                        id="type"
                                        name="type"
                                        options={[
                                            { value: 'admin', label: 'Admin' },
                                            { value: 'business_unit', label: 'BU' },
                                            { value: 'shop', label: 'Shop' },
                                            { value: 'customer', label: 'Customer' },
                                        ]}
                                        placeholder="กรุณาเลือก"
                                        onChange={(e: any) => {
                                        props.setFieldValue('type', e.value);
                                        }}
                                        isSearchable={false}
                                    />

                                    {props.values.type === 'business_unit' && (
                                        <SelectField
                                            label="Business Unit*"
                                            id="business_unit"
                                            name="business_unit"
                                            options={[{ value: null, label: 'ทั้งหมด' },...businessUnit]}
                                            placeholder="กรุณาเลือก BU"
                                            onChange={(e: any) => {
                                                props.setFieldValue('business_unit', e.value);
                                            }}
                                            isSearchable={true}
                                        />
                                    )}

                                    <div className="flex justify-center items-center mt-8">
                                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                        ตกลง
                                        </button>
                                    </div>
                                    </Form>
                                )}
                                </Formik>

                            </div>
                        </Dialog.Panel>
                        </Transition.Child>
                    </div>
                    </div>
                </Dialog>
                </Transition>
        </div>
    )

}

export default SettingPaymentSystem