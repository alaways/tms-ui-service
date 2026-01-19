import { Fragment, useState, useEffect, useCallback } from 'react'
import { Form, Formik } from 'formik'
import { Dialog, Transition } from '@headlessui/react'
import { DataTable } from 'mantine-datatable'
import Tippy from '@tippyjs/react'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import InputField from '../../../../components/HOC/InputField'
import SelectField from '../../../../components/HOC/SelectField'
import IconX from '../../../../components/Icon/IconX'
import IconEdit from '../../../../components/Icon/IconEdit'
import IconPlus from '../../../../components/Icon/IconPlus'
import { PAGE_SIZES } from '../../../../helpers/config'
import { convertDateDbToClient } from '../../../../helpers/formatDate'
import { toastAlert } from '../../../../helpers/constant'
import { useGlobalMutation } from '../../../../helpers/globalApi'
import { url_api } from '../../../../services/endpoints'
import PreLoading from '../../../../helpers/preLoading'

interface LockDeviceSettingsProps {
  id_bu: number
}

const toast = Swal.mixin(toastAlert)

const LockDeviceSettings = ({ id_bu }: LockDeviceSettingsProps) => {
  const defaultProviderForm = {
    id: null,
    id_business_unit: id_bu,
    title: '',
    id_asset_type: '',
    service_provider: "",
    username: "",
    password: "",
    role: "",
    token: "",
    lock_content: "",
    lock_footer: "",
    lock_phone: "",
    unlock_content_noti: "",
    is_active: true,
    is_login: true
  }

  const [providerList, setProviderList] = useState([])
  const [providerForm, setProviderForm] = useState(defaultProviderForm)
  const [prevPageSize, setPrevPageSize] = useState(1)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [assetType, setAssetType] = useState<any>([])
  const [serviceProvider, setServiceProvider] = useState<any>([])
  const [actionModal, setActionModal] = useState(false)

  const { mutate: fetchProviderList } = useGlobalMutation(url_api.providerList, {
    onSuccess: (res: any) => {
      setProviderList(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch provider data')
    },
  })

  const fetchProviderData = useCallback(() => {
    const isPageSizeChanged = prevPageSize !== pageSize
    fetchProviderList({
      data: {
        page: isPageSizeChanged ? 1 : page,
        page_size: pageSize,
        id_business_unit: id_bu,
      },
    })
    setPrevPageSize(pageSize)
  }, [fetchProviderList, page, pageSize, prevPageSize, id_bu])

  const { mutateAsync: providerCreate, isLoading: CreateProviderLoading } = useGlobalMutation(url_api.providerCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'เพิ่มสำเร็จ',
          padding: '10px 20px',
        })
        fetchProviderData()
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutateAsync: providerUpdate, isLoading: UpdateProviderLoading } = useGlobalMutation(url_api.providerUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        })
        fetchProviderData()
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: providerPayload } = useGlobalMutation(url_api.providerPayload, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        const sp_list = res.data.sp_list.map((item: any) => ({ ...item, value: item.value, label: item.name }))
        const asset_type = res.data.asset_type.map((item: any) => ({ ...item, value: item.id, label: item.name }))
        setServiceProvider(sp_list)
        setAssetType(asset_type)
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
    providerPayload({})
    fetchProviderData()
  }, [])

  useEffect(() => {
    fetchProviderData()
  }, [page, pageSize])

  const addEdit = (item: any = null) => {
    setProviderForm(item ? JSON.parse(JSON.stringify(item)) : defaultProviderForm)
    setActionModal(true)
  }

  const submitProviderForm = useCallback(
    async (values: any) => {
      let data = { ...values }
      if (values.id !== null) {
        await providerUpdate({ data })
      } else {
        delete data.id
        if (data.service_provider == 'Nebula') {
          data = {
            id_asset_type: values.id_asset_type,
            id_business_unit: values.id_business_unit,
            is_active: values.is_active,
            lock_content: values.lock_content,
            lock_footer: values.lock_footer,
            lock_phone: values.lock_phone,
            password: values.password,
            role: values.role,
            service_provider: values.service_provider,
            title: values.title,
            unlock_content_noti: values.unlock_content_noti,
            username: values.username,
          }
          await providerCreate({ data })
        } else {
          data = {
            id_asset_type: values.id_asset_type,
            id_business_unit: values.id_business_unit,
            is_active: values.is_active,
            lock_content: values.lock_content,
            lock_footer: values.lock_footer,
            lock_phone: values.lock_phone,
            service_provider: values.service_provider,
            title: values.title,
            unlock_content_noti: values.unlock_content_noti,
            token: values.token
          }
          await providerCreate({ data })
        }
      }
      setActionModal(false)
    },
    [providerCreate, providerUpdate]
  )

  const SubmittedForm = Yup.object().shape({
    title: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_asset_type: Yup.string().nullable().required('กรุณาเลือกข้อมูล'),
    service_provider: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    username: Yup.string().nullable().when("service_provider", {
      is: (value: any) => value == 'Nebula',
      then: (schema) => schema.required("กรุณาใส่ข้อมูลให้ครบ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: Yup.string().nullable().when("service_provider", {
      is: "Nebula",
      then: (schema) => schema.required("กรุณาใส่ข้อมูลให้ครบ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    role: Yup.string().nullable().when("service_provider", {
      is: "Nebula",
      then: (schema) => schema.required("กรุณาใส่ข้อมูลให้ครบ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    token: Yup.string().nullable().when("service_provider", {
      is: "Nuovo",
      then: (schema) => schema.required("กรุณาใส่ข้อมูลให้ครบ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    lock_content: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    lock_phone: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    unlock_content_noti: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  return (
    <>
      {(UpdateProviderLoading || CreateProviderLoading) && <PreLoading />}
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
          <h2 className="text-xl">
            ตั้งค่าล็อคเครื่อง
          </h2>
          <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
            <div className="flex gap-3">
              <button type="button" className="btn btn-primary" onClick={() => addEdit()}>
                <IconPlus className="ltr:mr-2 rtl:ml-2" />
                เพิ่มผู้ให้บริการ
              </button>
            </div>
          </div>
        </div>
        <div className="datatables pagination-padding">
          <DataTable
            className="whitespace-nowrap table-hover invoice-table"
            records={providerList}
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
                accessor: 'title',
                title: 'ชื่อผู้ให้บริการ',
                textAlignment: 'left',
                sortable: false,
                render: ({ title }) => (
                  <div className="flex items-center font-normal">
                    <div>{title}</div>
                  </div>
                ),
              },
              {
                accessor: 'service_provider',
                title: 'บริการ',
                textAlignment: 'left',
                sortable: false,
                render: ({ service_provider }) => (
                  <div className="flex items-center font-normal">
                    <div>{service_provider}</div>
                  </div>
                ),
              },
              {
                accessor: 'username',
                title: 'ผู้ใช้งาน',
                textAlignment: 'left',
                sortable: false,
                render: ({ username }) => (
                  <div className="flex items-center font-normal">
                    <div>{username || '-'}</div>
                  </div>
                ),
              },
              {
                accessor: 'role',
                title: 'ระดับ',
                textAlignment: 'left',
                sortable: false,
                render: ({ role }) => (
                  <div className="flex items-center font-normal">
                    <div>{role || '-'}</div>
                  </div>
                ),
              },
              {
                accessor: 'lock_phone',
                title: 'เบอร์โทร',
                textAlignment: 'left',
                sortable: false,
                render: ({ lock_phone }) => (
                  <div className="flex items-center font-normal">
                    <div>{lock_phone}</div>
                  </div>
                ),
              },
              {
                accessor: 'created_at',
                title: 'วันที่สร้าง',
                textAlignment: 'left',
                sortable: false,
                render: ({ created_at }) => (
                  <div className="flex items-center font-normal">
                    <div> {convertDateDbToClient(created_at) ?? '-'}</div>
                  </div>
                ),
              },
              {
                accessor: 'is_active',
                title: 'สถานะ',
                textAlignment: 'center',
                sortable: false,
                render: ({ is_active }) => (
                  <span className={`badge ${is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
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
                    <Tippy content="แก้ไข" theme="Primary">
                      <a className="flex cursor-pointer active" onClick={() => { addEdit(item) }}>
                        <IconEdit className="w-4.5 h-4.5" />
                      </a>
                    </Tippy>
                  </div>
                ),
              },
            ]}
            page={page}
            totalRecords={totalItems}
            recordsPerPage={pageSize}
            minHeight={150}
            highlightOnHover
            onPageChange={(p) => setPage(p)}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={(p) => {
              setPage(1)
              setPageSize(p)
            }}
            paginationText={({ from, to, totalRecords }) => (
              `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`
            )}
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
                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-4xl text-black dark:text-white-dark">
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {providerForm.id ? 'แก้ไข' : 'เพิ่ม'}
                  </div>
                  <div className="p-5">
                    <Formik initialValues={providerForm} onSubmit={submitProviderForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                      {(props) => (
                        <Form className="space-y-5 mb-7 dark:text-white custom-select">
                          <InputField label='ชื่อผู้ให้บริการ' type='text' name='title' placeholder='กรุณาใส่ข้อมูล' require={true} />
                          <SelectField label='ประเภทสินทรัพย์' id='id_asset_type' name='id_asset_type' options={assetType} require={true} placeholder='กรุณาเลือก' onChange={(e) => {
                            if (e.value == '1' || e.value == '2') {
                              props.setFieldValue('service_provider', "Nebula")
                            } else if (e.value == '3') {
                              props.setFieldValue('service_provider', "Nuovo")
                            } else {
                              props.setFieldValue('service_provider', null)
                            }
                          }} />
                          {(props.getFieldProps('service_provider').value == 'Nebula' || props.getFieldProps('service_provider').value == '') && <>
                            <div className="flex gap-4">
                              <SelectField label='บริการ' id='service_provider' name='service_provider' options={serviceProvider} require={true} placeholder='กรุณาเลือก' onChange={(e) => {
                                if (e.value == 'Nebula') {
                                  props.setFieldValue('id_asset_type', 1)
                                } else if (e.value == 'Nuovo') {
                                  props.setFieldValue('id_asset_type', 3)
                                }
                              }} />
                              <InputField
                                label="ระดับ"
                                name="role"
                                type="text"
                                placeholder="กรุณาใส่ข้อมูล"
                                require={true}
                              />
                            </div>
                            <div className="flex gap-4">
                              <InputField
                                label="ผู้ใช้งาน"
                                name="username"
                                type="text"
                                placeholder="กรุณาใส่ข้อมูล"
                                require={true}
                              />
                              <InputField
                                label="รหัสผ่าน"
                                name="password"
                                type="text"
                                placeholder="กรุณาใส่ข้อมูล"
                                require={true}
                              />
                            </div>
                          </>}
                          {(props.getFieldProps('service_provider').value == 'Nuovo' || props.getFieldProps('service_provider').value == '') &&
                            <>
                              <SelectField label='บริการ' id='service_provider' name='service_provider' options={serviceProvider} require={true} placeholder='กรุณาเลือก' onChange={(e) => {
                                if (e.value == 'Nebula') {
                                  props.setFieldValue('id_asset_type', 1)
                                } else if (e.value == 'Nuovo') {
                                  props.setFieldValue('id_asset_type', 3)
                                }
                              }} />
                              <InputField
                                label="Token"
                                name="token"
                                type="text"
                                placeholder="กรุณาใส่ข้อมูล"
                                require={true}
                              />
                            </>
                          }
                          <InputField
                            label="ข้อความแจ้งเตือนล็อคเครื่อง"
                            name="lock_content"
                            as="textarea"
                            rows="3"
                            placeholder="กรุณาใส่ข้อมูล"
                            require={true}
                          />
                          <InputField
                            label="ข้อความแจ้งเตือนล็อคเครื่อง(ด้านล่าง)"
                            name="lock_footer"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
                          <InputField
                            label="เบอร์โทร"
                            name="lock_phone"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
                          <InputField
                            label="ข้อความแจ้งเตือนปลดล็อคเครื่อง"
                            name="unlock_content_noti"
                            as="textarea"
                            rows="3"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
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
                              {providerForm.id ? 'บันทึก' : 'เพิ่ม'}
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

export default LockDeviceSettings
