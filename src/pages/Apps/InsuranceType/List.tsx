import { useState, useEffect, useCallback, Fragment, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import * as Yup from 'yup'

import Tippy from '@tippyjs/react'
import debounce from 'lodash/debounce'

import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'

import { Formik, Form } from 'formik'
import { Dialog, Transition } from '@headlessui/react'

import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'

import { InsuranceTypes } from '../../../types/index'

import { url_api } from '../../../services/endpoints'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { DEBOUNCE_TIME, PAGE_SIZES } from '../../../helpers/config'
import { showNotification } from '../../../helpers/showNotification'

import { DataTable } from 'mantine-datatable'

import IconX from '../../../components/Icon/IconX'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEdit from '../../../components/Icon/IconEdit'
import IconSearch from '../../../components/Icon/IconSearch'

import 'tippy.js/dist/tippy.css'

const defaultsForm = {
  id: '',
  name: '',
  description: '',
  is_active: true,
}

const mode = process.env.MODE || 'admin'

const List = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(setPageTitle('รายการประกัน'))
  }, [dispatch])

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/')
    }
  }, [role, navigate])
  const [firstLoading, setFirstLoading] = useState(false)
    useEffect(() => {
      setFirstLoading(true)
   }, [])
  const [actionModal, setActionModal] = useState(false)
  const [formData, setFormData] = useState<InsuranceTypes>(defaultsForm)
  const [insuranceTypesLists, setInsuranceTypesLists] = useState<InsuranceTypes[]>([])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [search, setSearch] = useState('')

  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    description: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const { mutate: fetchInsuranceTypesData } = useGlobalMutation(url_api.insuranceTypesFindAll, {
    onSuccess: (res: any) => {
      setInsuranceTypesLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  useEffect(() => {
    if (!firstLoading) return
    fetchInsuranceTypesData({
      data: {
        page: page,
        page_size: pageSize,
        query: search,
      },
    })
  }, [page])

  useEffect(() => {
    if (!firstLoading) return
    fetchInsuranceTypesData({
      data: {
        page: 1,
        page_size: pageSize,
        query: search,
      },
    })
  }, [pageSize])

  const debouncedFetchAssetData = useMemo(
    () =>
      debounce((searchValue) => {
        fetchInsuranceTypesData({
          data: {
            page: 1,
            page_size: pageSize,
            query: searchValue,
          },
        })
      }, DEBOUNCE_TIME.FAST),
    [fetchInsuranceTypesData, pageSize]
  )

  useEffect(() => {
    debouncedFetchAssetData(search)
    return () => {
      debouncedFetchAssetData.cancel()
    }
  }, [search, debouncedFetchAssetData])

  const { mutate: insuranceTypeCreate } = useGlobalMutation(url_api.insuranceTypesCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification('เพิ่มข้อมูลสำเร็จ', 'success')
        setActionModal(false)
        fetchInsuranceTypesData({ data: { page, page_size: pageSize, query: search } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const { mutate: insuranceTypeUpdate } = useGlobalMutation(url_api.insuranceTypesUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification('แก้ไขข้อมูลสำเร็จ', 'success')
        setActionModal(false)
        fetchInsuranceTypesData({ data: { page, page_size: pageSize, query: search } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })
  const submitForm = useCallback(
    (values: InsuranceTypes) => {
      const data = { ...values, active: values.is_active }
      if (values.id) {
        insuranceTypeUpdate({ data, id: values.id })
      } else {
        insuranceTypeCreate({ data })
      }
    },
    [insuranceTypeCreate, insuranceTypeUpdate]
  )
  const addEditInsuranceType = (item: any = null) => {
    setFormData(item ? JSON.parse(JSON.stringify(item)) : defaultsForm)
    setActionModal(true)
  }

  return (
    <div>
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
          <h2 className="text-xl">
            ประเภทประกัน
          </h2>
          <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
            <div className="flex gap-3">
              <button type="button" className="btn btn-primary" onClick={() => addEditInsuranceType()}>
                <IconPlus className="ltr:mr-2 rtl:ml-2" />
                เพิ่มประกัน
              </button>
            </div>
            <div className="relative">
              <input type="text" placeholder="ค้นหา" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                <IconSearch className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
        <div className="datatables pagination-padding">
          <DataTable
            className="whitespace-nowrap table-hover invoice-table"
            records={insuranceTypesLists}
            columns={[
              {
                accessor: 'id',
                title: 'ลำดับ',
                textAlignment: 'center',
                sortable: false,
                render: (row, index) => (
                  <div>{index + 1}</div>
                ),
              },
              {
                accessor: 'name',
                title: 'ชื่อประกัน',
                textAlignment: 'left',
                sortable: false,
                render: ({ name }) => (
                  <div className="flex items-center font-normal">
                    <div>{name}</div>
                  </div>
                ),
              },
              {
                accessor: 'description',
                title: 'คำอธิบาย',
                textAlignment: 'left',
                sortable: false,
                render: ({ description }) => (
                  <div className="flex items-center font-normal">
                    <div>{description}</div>
                  </div>
                ),
              },
              {
                accessor: 'is_active',
                title: 'เปิด/ปิด การใช้งาน',
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
                      <a className="flex cursor-pointer active" onClick={() => addEditInsuranceType(item) }>
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
        <Transition appear show={actionModal} as={Fragment}>
          <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0" >
              <div className="fixed inset-0 bg-[black]/60" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center px-4 py-8">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" >
                  <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                    <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                      <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{formData.id ? 'แก้ไข' : 'เพิ่ม'}</div>
                    <div className="p-5">
                      <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                        {(props) => (
                          <Form className="space-y-5 mb-7 dark:text-white custom-select">
                            <InputField
                              label="ชื่อประกัน"
                              name="name"
                              type="text"
                              placeholder="กรุณาใส่ข้อมูล"
                            />
                            <InputField
                              label="คำอธิบาย"
                              name="description"
                              type="text"
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
                                {formData.id ? 'บันทึก' : 'เพิ่ม'}
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
    </div>
  )

}

export default List