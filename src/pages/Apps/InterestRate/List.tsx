import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, Fragment, useMemo } from 'react'

import * as Yup from 'yup'

import Tippy from '@tippyjs/react'
import debounce from 'lodash/debounce'

import { useDispatch } from 'react-redux'
import { Dialog, Transition } from '@headlessui/react'
import { Formik, Form } from 'formik'

import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'

import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import IconEdit from '../../../components/Icon/IconEdit'

import { DataTable } from 'mantine-datatable'
import { DEBOUNCE_TIME, PAGE_SIZES } from '../../../helpers/config'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { showNotification } from '../../../helpers/showNotification'

import IconPlus from '../../../components/Icon/IconPlus'
import IconSearch from '../../../components/Icon/IconSearch'
import IconX from '../../../components/Icon/IconX'

import { numberWithCommas } from '../../../helpers/formatNumeric'

import 'tippy.js/dist/tippy.css'

const defaultsForm: any = {
  id: null,
  name: 'Rate',
  id_shop_group: null,
  id_business_unit: '',
  business_unit: {},
  inr_3: 0,
  inr_4: 0,
  inr_5: 0,
  inr_6: 0,
  inr_7: 0,
  inr_8: 0,
  inr_9: 0,
  inr_10: 0,
  inr_11: 0,
  inr_12: 0,
  is_active: true,
}

const mode = process.env.MODE || 'admin'

const List = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(setPageTitle('รายการผลตอบแทน'))
    dispatch(setSidebarActive(['bu', '/apps/shop-group/list']))
  }, [dispatch])

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  useEffect(() => {
    if (role !== 'admin' && role !== 'business_unit') {
      navigate('/')
    }
  }, [role, navigate])

  const [actionModal, setActionModal] = useState(false)
  const [formData, setFormData] = useState<any>(defaultsForm)
  const [interestRateLists, setInterestRateLists] = useState<any[]>([])
  const [shopGroup, setShopGroup] = useState<any[]>([])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [search, setSearch] = useState('')

  const SubmittedForm = Yup.object().shape({
    id_business_unit: Yup.string(),
    id_shop_group: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const { mutate: fetchShopGroupData } = useGlobalMutation(url_api.shopGroupFindAll, {
    onSuccess: (res: any) => {
      setShopGroup(
        res.data.list.map((item: any) => ({
          value: item.id,
          label: item.name,
          business_unit: item.business_unit,
        }))
      )
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  const handleSearch = (props: any, event: any) => {
    fetchShopGroupData({
      data: {
        query: event,
        page: 1,
        pageSize: 10,
      }
    })
  }

  const { mutate: fetchInterestRateData } = useGlobalMutation(url_api.interestRateFindAll, {
    onSuccess: (res: any) => {
      setInterestRateLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: (err: any) => {
      console.error('Failed to fetch interest rate data', err)
    },
  })

  useEffect(() => {
    fetchShopGroupData({
      page: page,
      page_size: -1
    })
    fetchInterestRateData({
      data: {
        page,
        page_size: pageSize,
        query: search,
      },
    })
  }, [page, pageSize, fetchShopGroupData, fetchInterestRateData, search])

  const { mutate: interestRateCreate } = useGlobalMutation(url_api.interestRateCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification('เพิ่มข้อมูลสำเร็จ', 'success')
        setActionModal(false)
        fetchInterestRateData({ data: { page, page_size: pageSize, query: search } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const { mutate: interestRateUpdate } = useGlobalMutation(url_api.interestRateUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification('แก้ไขข้อมูลสำเร็จ', 'success')
        setActionModal(false)
        fetchInterestRateData({ data: { page, page_size: pageSize, query: search } })
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
      const data = { ...values, active: values.is_active }
      if (values.id) {
        interestRateUpdate({ data, id: values.id })
      } else {
        interestRateCreate({ data })
      }
    },
    [interestRateCreate, interestRateUpdate]
  )

  const handleChangeSelect = (props: any, event: any, name: string) => {
    props.setFieldValue(name, event.value)
  }

  const addEditInterestRate = (item: any | null = null) => {
    setFormData(item ? {
      ...item,
      id_shop_group: item.id_shop_group,
      id_business_unit: item?.shop_group?.business_unit?.id,
      business_unit: item?.shop_group?.business_unit
    } : defaultsForm)
    setActionModal(true)
  }

  return (
    <div>
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
          <h2 className="text-xl">
            ผลตอบแทน
          </h2>
          <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
            <div className="relative">
              <input type="text" placeholder="ค้นหา" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                <IconSearch className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
        <div className="datatables pagination-padding">
          { mode === 'business_unit' && (
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={interestRateLists}
              columns={[
                {
                  accessor: 'id',
                  title: 'ลำดับ',
                  sortable: false,
                  render: (row, index) => (
                    <div>{index + 1}</div>
                  ),
                },
                {
                  accessor: 'shop_group.name',
                  title: 'กลุ่มร้าน',
                  sortable: false,
                  render: ({ shop_group }) => (
                    <div className="flex items-center font-normal">
                      <div>{shop_group?.name}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_1',
                  title: '1 เดือน',
                  sortable: false,
                  render: ({ inr_1 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_1)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_2',
                  title: '2 เดือน',
                  sortable: false,
                  render: ({ inr_2 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_2)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_3',
                  title: '3 เดือน',
                  sortable: false,
                  render: ({ inr_3 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_3)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_4',
                  title: '4 เดือน',
                  sortable: false,
                  render: ({ inr_4 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_4)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_5',
                  title: '5 เดือน',
                  sortable: false,
                  render: ({ inr_5 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_5)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_6',
                  title: '6 เดือน',
                  sortable: false,
                  render: ({ inr_6 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_6)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_7',
                  title: '7 เดือน',
                  sortable: false,
                  render: ({ inr_7 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_7)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_8',
                  title: '8 เดือน',
                  sortable: false,
                  render: ({ inr_8 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_8)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_9',
                  title: '9 เดือน',
                  sortable: false,
                  render: ({ inr_9 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_9)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_10',
                  title: '10 เดือน',
                  sortable: false,
                  render: ({ inr_10 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_10)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_11',
                  title: '11 เดือน',
                  sortable: false,
                  render: ({ inr_11 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_11)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_12',
                  title: '12 เดือน',
                  sortable: false,
                  render: ({ inr_12 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_12)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'action',
                  title: 'Actions',
                  sortable: false,
                  textAlignment: 'center',
                  render: (item) => (
                    <div className="flex gap-4 items-center w-max mx-auto">
                      <Tippy content="แก้ไข" theme="Primary">
                        <a className="flex hover:text-info cursor-pointer active" onClick={() => addEditInterestRate(item)}>
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
          )}
          { mode !== 'business_unit' && (
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={interestRateLists}
              columns={[
                {
                  accessor: 'id',
                  title: 'ลำดับ',
                  sortable: false,
                  render: (row, index) => (
                    <div>{index + 1}</div>
                  ),
                },
                {
                  accessor: 'shop_group.name',
                  title: 'กลุ่มร้าน',
                  sortable: false,
                  render: ({ shop_group }) => (
                    <div className="flex items-center font-normal">
                      <div>{shop_group?.name}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'shop_group.business_unit.name',
                  title: 'หน่วยธุรกิจ',
                  sortable: false,
                  render: ({ shop_group }) => (
                    <div className="flex items-center font-normal">
                      <div>{shop_group?.business_unit?.name}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_1',
                  title: '1 เดือน',
                  sortable: false,
                  render: ({ inr_1 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_1)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_2',
                  title: '2 เดือน',
                  sortable: false,
                  render: ({ inr_2 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_2)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_3',
                  title: '3 เดือน',
                  sortable: false,
                  render: ({ inr_3 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_3)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_4',
                  title: '4 เดือน',
                  sortable: false,
                  render: ({ inr_4 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_4)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_5',
                  title: '5 เดือน',
                  sortable: false,
                  render: ({ inr_5 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_5)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_6',
                  title: '6 เดือน',
                  sortable: false,
                  render: ({ inr_6 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_6)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_7',
                  title: '7 เดือน',
                  sortable: false,
                  render: ({ inr_7 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_7)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_8',
                  title: '8 เดือน',
                  sortable: false,
                  render: ({ inr_8 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_8)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_9',
                  title: '9 เดือน',
                  sortable: false,
                  render: ({ inr_9 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_9)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_10',
                  title: '10 เดือน',
                  sortable: false,
                  render: ({ inr_10 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_10)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_11',
                  title: '11 เดือน',
                  sortable: false,
                  render: ({ inr_11 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_11)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'inr_12',
                  title: '12 เดือน',
                  sortable: false,
                  render: ({ inr_12 }) => (
                    <div className="flex items-center font-normal">
                      <div>{numberWithCommas(inr_12)}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'action',
                  title: 'Actions',
                  sortable: false,
                  textAlignment: 'center',
                  render: (item) => (
                    <div className="flex gap-4 items-center w-max mx-auto">
                      <Tippy content="แก้ไข" theme="Primary">
                        <a className="flex hover:text-info cursor-pointer active" onClick={() => addEditInterestRate(item)}>
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
          )}
        </div>
        <Transition appear show={actionModal} as={Fragment}>
          <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-[black]/60" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center px-4 py-8">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                    <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                      <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                      {formData.id ? 'แก้ไข' : 'เพิ่ม'}
                    </div>
                    <div className="p-5">
                      <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                        {(props) => (
                          <Form className="space-y-5 mb-7 dark:text-white custom-select">
                            <SelectField
                              label="หน่่วยธุรกิจ"
                              id="id_business_unit"
                              name="id_business_unit"
                              options={[
                                {
                                  label: props.values.business_unit.name,
                                  value: props.values.business_unit.id,
                                }
                              ]}
                              placeholder="กรุณาเลือก"
                              isSearchable={true}
                              disabled={true}
                            />
                            <SelectField
                              label="กลุ่มร้าน"
                              id="id_shop_group"
                              name="id_shop_group"
                              options={shopGroup}
                              placeholder="กรุณาเลือก"
                              onChange={(e: any) => handleChangeSelect(props, e, 'id_shop_group')}
                              onInputChange={(event: any) => handleSearch(props, event)}
                              isSearchable={true}
                            />
                            <div className="input-flex-row">
                              <InputField label="1 เดือน" name="inr_1" type="number" />
                              <InputField label="2 เดือน" name="inr_2" type="number" />
                            </div>
                            <div className="input-flex-row">
                              <InputField label="3 เดือน" name="inr_3" type="number" />
                              <InputField label="4 เดือน" name="inr_4" type="number" />
                            </div>
                            <div className="input-flex-row">
                              <InputField label="5 เดือน" name="inr_5" type="number" />
                              <InputField label="6 เดือน" name="inr_6" type="number" />
                            </div>
                            <div className="input-flex-row">
                              <InputField label="7 เดือน" name="inr_7" type="number" />
                              <InputField label="8 เดือน" name="inr_8" type="number" />
                            </div>
                            <div className="input-flex-row">
                              <InputField label="9 เดือน" name="inr_9" type="number" />
                              <InputField label="10 เดือน" name="inr_10" type="number" />
                            </div>
                            <div className="input-flex-row">
                              <InputField label="11 เดือน" name="inr_11" type="number" />
                              <InputField label="12 เดือน" name="inr_12" type="number" />
                            </div>
                            <SelectField
                              require={true}
                              label="สถานะ"
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