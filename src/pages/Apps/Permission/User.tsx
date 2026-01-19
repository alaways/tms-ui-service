import { useState, useEffect, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'

import * as Yup from 'yup'
import Swal from 'sweetalert2'

import { toastAlert } from '../../../helpers/constant'
import { PAGE_SIZES } from '../../../helpers/config'

import { useDispatch } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'

import { Dialog, Transition } from '@headlessui/react'
import { Form, Formik } from 'formik'

import { DataTable, DataTableSortStatus } from 'mantine-datatable'

import Breadcrumbs from '../../../helpers/breadcrumbs'
import InputField from '../../../components/HOC/InputField'

import IconX from '../../../components/Icon/IconX'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEye from '../../../components/Icon/IconEye'

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const PermissionUser = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);

  const storedUser = localStorage.getItem(mode)

  const role = storedUser ? JSON.parse(storedUser).role : null
  const access_level = storedUser ? JSON.parse(storedUser ?? '{}').access_level : null
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [actionModal, setActionModal] = useState(false)

  const breadcrumbItems = [
    { to: '/apps/employee/list', label: 'พนักงาน' },
    { to: '/apps/permission/check', label: 'จัดการสิทธิ์ผู้ใช้งาน' },
    { label: 'ผู้ใช้งาน', isCurrent: true }
  ]

  if (role != 'admin' && role != 'business_unit') {
    navigate('/')
  }

  const [defaultForm, setDefaultFormData] = useState({
    action: 'add',
    name: '',
    price: '',
  })

  const [userLists, setUserLists] = useState<any[]>([
    {
      name: 'Super Admin',
      price: 30000,
    },
    {
      name: 'Admin',
      price: 45000,
    },
    {
      name: 'IT Support',
      price: 69000,
    },
    {
      name: 'Standard User',
      price: 15000,
    }
  ])

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: '',
    direction: 'asc',
  })

  const [formData, setFormData] = useState<any>(defaultForm)

  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    price: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const submitForm = useCallback((event: any) => {
    console.log(event)
  }, [ defaultForm ])

  const goEdit = (item: any) => {
    setActionModal(true)
    setDefaultFormData({
      action: 'edit',
      name: item.name,
      price: item.price,
    })
  }

  useEffect(() => {
    dispatch(setPageTitle('เพิ่มผู้ใช้งาน'))
    dispatch(setSidebarActive(['employee', '/apps/permission/check']))
  }, [])

  useEffect(() => {
    setTotalItems(userLists.length)
  }, [ defaultForm, actionModal ])

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="panel px-0 mt-5 border-white-light dark:border-[#1b2e4b]">
        <div className="invoice-table ">
          <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
            <div className="flex items-center gap-2">
              <a className="btn btn-primary gap-2" onClick={() => setActionModal(true)}>
                <IconPlus />
                เพิ่มสิทธิ์ผู้ใช้งาน
              </a>
            </div>
          </div>
          <div className="datatables pagination-padding">
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={userLists}
              columns={[
                {
                  accessor: 'id',
                  title: 'ลำดับ',
                  sortable: false,
                  textAlignment: 'center',
                  render: (row, index) => (
                    <div>{index + 1}</div>
                  ),
                },
                {
                  accessor: 'name',
                  title: 'ผู้ใช้งาน',
                  sortable: false,
                  render: (item) => (
                    <div className="flex items-center justify-start font-normal">
                      <a className="flex cursor-pointer active" onClick={() => goEdit(item)} >
                        <div>{item.name}</div>
                      </a>
                    </div>
                  ),
                },
                {
                  accessor: 'action',
                  title: 'Actions',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item) => (
                    <div className="flex gap-4 items-center w-max mx-auto">
                      <a className="flex cursor-pointer active" onClick={() => goEdit(item)} >
                        <IconEye />
                      </a>
                    </div>
                  ),
                },
              ]}
              page={page}
              totalRecords={totalItems}
              recordsPerPage={pageSize}
              highlightOnHover
              onPageChange={(p) => setPage(p)}
              recordsPerPageOptions={PAGE_SIZES}
              onRecordsPerPageChange={(p) => {
                setPage(1)
                setPageSize(p)
              }}
              sortStatus={sortStatus}
              onSortStatusChange={setSortStatus}
              paginationText={({ from, to, totalRecords }) => (
                `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`
              )}
            />
          </div>
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
                  <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark" >
                    <button
                      type="button"
                      onClick={() => setActionModal(false)}
                      className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                    >
                      <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                      {defaultForm.action == 'add' ? 'เพิ่ม' : 'แก้ไข'}ผู้ใช้งาน
                    </div>
                    <div className="p-5">
                      <Formik
                        initialValues={formData}
                        onSubmit={submitForm}
                        enableReinitialize={true}
                        autoComplete="off"
                        validationSchema={SubmittedForm}
                      >
                        {(props) => (
                          <Form className="space-y-5 mb-2 dark:text-white custom-select">
                            <InputField
                              label="ชื่อผู้ใช้งาน"
                              name="name"
                              placeholder="กรุณาใส่ข้อมูล"
                              value={defaultForm.name}
                              onChange={(e: any) => {
                                props.setFieldValue("name", e.target.value)
                                setDefaultFormData((prev) => ({ ...prev, name: e.target.value }))
                              }}
                            />
                            <InputField
                              label="ราคา"
                              name="price"
                              placeholder="กรุณาใส่ข้อมูล"
                              value={defaultForm.price}
                              onChange={(e: any) => {
                                let cleanedValue = e.target.value.replace(/\D/g, "");
                                props.setFieldValue("price", cleanedValue)
                                setDefaultFormData((prev) => ({ ...prev, price: cleanedValue }))
                              }}
                              onKeyPress={(e: any) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  return
                                }
                                if (!/[0-9]/.test(e.key)) {
                                  e.preventDefault()
                                }
                              }}
                            />
                            <div className="flex justify-center items-center mt-5">
                              <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                {defaultForm.action == 'add' ? 'บันทึก' : 'อัพเดท'}
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
    </>
  )

}

export default PermissionUser