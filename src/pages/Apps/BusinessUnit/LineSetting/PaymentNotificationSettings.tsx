import { Fragment, useState, useEffect, useCallback } from 'react'
import { Form, Formik } from 'formik'
import { Dialog, Transition } from '@headlessui/react'
import Tippy from '@tippyjs/react'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import { DataTable } from 'mantine-datatable'
import InputField from '../../../../components/HOC/InputField'
import SelectField from '../../../../components/HOC/SelectField'
import IconEdit from '../../../../components/Icon/IconEdit'
import IconRefresh from '../../../../components/Icon/IconRefresh'
import IconX from '../../../../components/Icon/IconX'
import { toastAlert } from '../../../../helpers/constant'
import { useGlobalMutation } from '../../../../helpers/globalApi'
import { url_api } from '../../../../services/endpoints'
import themeInit from '../../../../theme.init'
import PreLoading from '../../../../helpers/preLoading'

interface PaymentNotificationSettingsProps {
  id_bu: number
}

const defaultLineSettingForm = {
  id: null,
  day: '',
  message: '',
  title: '',
  is_active: true
}

const SubmittedTableLine = Yup.object().shape({
  day: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
  message: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
  title: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
})

const toast = Swal.mixin(toastAlert)

const PaymentNotificationSettings = ({ id_bu }: PaymentNotificationSettingsProps) => {
  const [lineSettingList, setLineSettingList] = useState<any>([])
  const [lineSettingForm, setLineSettingForm] = useState(defaultLineSettingForm)
  const [actionModal, setActionModal] = useState<boolean>(false)

  const { mutate: lineBoardCastOne, isLoading: boardcastLoading } = useGlobalMutation(url_api.lineBoardCastOne, {
    onSuccess(res: any) {
      if (res.statusCode !== 400) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        })
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

  const { mutate: buNofiyFindAll } = useGlobalMutation(url_api.buNofiyFindAll, {
    onSuccess: (res: any) => {
      if (res.code == 200 && res.statusCode == 200) {
        setLineSettingList(res.data)
      }
    },
  })

  const { mutate: buNotifyCreate } = useGlobalMutation(url_api.buNotifyCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'เพิ่มสำเร็จ',
          padding: '10px 20px',
        })
        buNofiyFindAll({
          data: {
            id_business_unit: id_bu,
          },
        })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: buNotifyUpdate } = useGlobalMutation(url_api.buNotifyUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ',
          padding: '10px 20px',
        })
        buNofiyFindAll({
          data: {
            id_business_unit: id_bu,
          },
        })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  useEffect(() => {
    buNofiyFindAll({ data: { id_business_unit: id_bu } })
  }, [id_bu])

  const submitTableLine = useCallback(
    async (values: any) => {
      const params = { ...values, id_business_unit: id_bu, day: +values.day }
      if (lineSettingForm.id) {
        await buNotifyUpdate({ data: params })
      } else {
        await buNotifyCreate({ data: params })
      }
      setActionModal(false)
    }, [buNotifyCreate, buNotifyUpdate, lineSettingForm, id_bu]
  )

  const editLineNotify = (values: any) => {
    setActionModal(true)
    setLineSettingForm(values)
  }

  const handleAdd = () => {
    setLineSettingForm(defaultLineSettingForm)
    setActionModal(true)
  }

  const handleBroadcast = (id_notify: string) => {
    lineBoardCastOne({
      data: {
        id_business_unit: id_bu,
        id_notify
      }
    })
  }

  return (
    <>
      {boardcastLoading && <PreLoading />}
      <div className="pt-4">
        <button
          type='button'
          onClick={handleAdd}
          className='btn text-white bg-green-600'
        >
          เพิ่มข้อมูล
        </button>
        <div className="datatables pagination-padding">
          <DataTable
            className="whitespace-nowrap table-hover invoice-table"
            records={lineSettingList}
            columns={[
              {
                accessor: 'id',
                title: 'ลำดับ',
                textAlignment: 'center',
                sortable: false,
                render: (_row, index) => (
                  <div>{index + 1}</div>
                ),
              },
              {
                accessor: 'day',
                title: 'วันที่แจ้งเตือนครบกำหนด',
                textAlignment: 'left',
                sortable: false,
              },
              {
                accessor: 'message',
                title: 'ข้อความแจ้งเตือน',
                textAlignment: 'left',
                sortable: false,
              },
              {
                accessor: 'is_active',
                title: 'สถานะ',
                textAlignment: 'center',
                sortable: false,
                render: (item: any) => (
                  <span className={`badge ${item.is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                ),
              },
              {
                accessor: 'action',
                title: 'Actions',
                textAlignment: 'center',
                sortable: false,
                render: (item) => (
                  <div className="flex gap-4 items-center w-max mx-auto">
         
                      {/* <div className="bg-[#E5E4E2] w-8 h-8 rounded-full flex items-center justify-center text-white">
                        <a
                          className="flex cursor-pointer active"
                          onClick={() => handleBroadcast(item?.id)}
                        >
                          <IconRefresh className="w-4.5 h-4.5" />
                        </a>
                      </div> */}
           
                    <Tippy content="แก้ไข" theme="Primary">
                      <a className="flex cursor-pointer active" onClick={() => editLineNotify(item)}>
                        <IconEdit className="w-4.5 h-4.5" />
                      </a>
                    </Tippy>
                  </div>
                ),
              },
            ]}
            minHeight={150}
            highlightOnHover
          />
        </div>
      </div>

      <Transition appear show={actionModal} as={Fragment}>
        <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-[black]/60" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-16 py-8">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-2xl text-black dark:text-white-dark">
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {lineSettingForm.id ? 'แก้ไข' : 'เพิ่ม'}
                  </div>
                  <div className="p-5">
                    <Formik initialValues={lineSettingForm} onSubmit={submitTableLine} enableReinitialize autoComplete="off" validationSchema={SubmittedTableLine}>
                      {(props) => (
                        <Form className="space-y-5 mb-7 dark:text-white custom-select">
                          <InputField label='หัวเรื่อง' type='text' name='title' placeholder='กรุณาใส่ข้อมูล' require={true} />
                          <InputField label='ข้อความแจ้งเตือน' type='text' name='message' placeholder='กรุณาใส่ข้อมูล' require={true} />
                          <InputField label='กำหนดวันแจ้งเตือน' type='text' name='day' placeholder='กรุณาใส่ข้อมูล' require={true} onKeyPress={(e: any) => {
                            if (!/[0-9]/.test(e.key) && !(e.key === "-" && e.target.value === "")) {
                              e.preventDefault()
                            }
                          }} />
                          <SelectField
                            label="สถานะ*"
                            id="is_active"
                            name="is_active"
                            options={[
                              {
                                value: true,
                                label: 'เปิด',
                              },
                              {
                                value: false,
                                label: 'ปิด',
                              },
                            ]}
                            placeholder="กรุณาเลือก"
                            onChange={(e: any) => {
                              props.setFieldValue('is_active', e.value)
                            }}
                            isSearchable={false}
                          />
                          <div className="flex justify-end items-center mt-8">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setActionModal(false)}>
                              ยกเลิก
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                              {lineSettingForm.id ? 'บันทึก' : 'เพิ่ม'}
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
    </>
  )
}

export default PaymentNotificationSettings
