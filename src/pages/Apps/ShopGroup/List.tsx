import { useState, useEffect, useCallback, Fragment, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import * as Yup from 'yup'
import debounce from 'lodash/debounce'

import { useDispatch } from 'react-redux'
import { setShopGroupBuConfig } from '../../../store/dataStore'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'

import { Shop } from '../../../types/index'
import { url_api } from '../../../services/endpoints'

import { useGlobalMutation } from '../../../helpers/globalApi'
import { DEBOUNCE_TIME, PAGE_SIZES } from '../../../helpers/config'
import { showNotification } from '../../../helpers/showNotification'

import { Formik, Form } from 'formik'
import { DataTable } from 'mantine-datatable'
import { Dialog, Transition } from '@headlessui/react'
import { useTranslation } from 'react-i18next'

import Tippy from '@tippyjs/react'
import SelectField from '../../../components/HOC/SelectField'

import IconX from '../../../components/Icon/IconX'
import IconEye from '../../../components/Icon/IconEye'
import IconEdit from '../../../components/Icon/IconEdit'
import InputField from '../../../components/HOC/InputField'
import IconSearch from '../../../components/Icon/IconSearch'

import 'tippy.js/dist/tippy.css'

const defaultsForm = {
  id: '',
  name: '',
  id_business_unit: null,
  is_active: true,
}

const mode = process.env.MODE || 'admin'

const List = () => {

  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(setPageTitle(t('shop_group_list')))
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
  const [formData, setFormData] = useState<Shop>(defaultsForm)
  const [shopGroupLists, setShopGroupLists] = useState<Shop[]>([])
  const [businessUnit, setBusinessUnit] = useState<any>([])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [search, setSearch] = useState('')

  const { mutate: fetchBusinessData } = useGlobalMutation(url_api.businessUnitActiveFindAll, {
    onSuccess: (res: any) => {
      setBusinessUnit(
        res.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      )
    },
    onError: (err: any) => { },
  })

  const { mutate: fetchShopGroupData } = useGlobalMutation(url_api.shopGroupFindAll, {
    onSuccess: (res: any) => {
      setShopGroupLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  const { mutate: shopGroupCreate } = useGlobalMutation(url_api.shopGroupCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification(t('add_data_success'), 'success')
        setActionModal(false)
        fetchShopGroupData({ data: { page, page_size: pageSize, query: search } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const { mutate: shopGroupUpdate } = useGlobalMutation(url_api.shopGroupUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification(t('edit_data_success'), 'success')
        setActionModal(false)
        fetchShopGroupData({ data: { page, page_size: pageSize, query: search } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const debouncedFetchAssetData = useMemo(
    () =>
      debounce((searchValue) => {
        fetchShopGroupData({
          data: {
            page: 1,
            page_size: pageSize,
            query: searchValue,
          },
        })
      }, DEBOUNCE_TIME.FAST),
    [fetchShopGroupData, pageSize]
  )

  const handleChangeSelect = (props: any, event: any, name: any) => {
    props.setFieldValue(name, event.value)
  }

  const addEditShopGroup = (item: any = null) => {
    setFormData(item ? { ...item, id_business_unit: item.business_unit.id } : defaultsForm)
    setActionModal(true)
  }

  const goShopGroupBu = (item: any) => {
    dispatch(setShopGroupBuConfig(item))
    navigate('/apps/shop-group/list-bu/' + item.business_unit.id + '/' + item.id);
  }

  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required(t('required_field')),
    id_business_unit: Yup.string().nullable().required(t('required_field')),
  })

  const submitForm = useCallback(
    (values: Shop) => {
      const data = { ...values, active: values.is_active }
      if (values.id) {
        shopGroupUpdate({ data, id: values.id })
      } else {
        shopGroupCreate({ data })
      }
    },
    [shopGroupCreate, shopGroupUpdate]
  )

  useEffect(() => {
    fetchBusinessData({ page, page_size: pageSize })
    fetchShopGroupData({
      data: {
        page: page,
        page_size: pageSize,
        query: search,
      },
    })
  }, [page, pageSize])

  useEffect(() => {
    debouncedFetchAssetData(search)
    return () => {
      debouncedFetchAssetData.cancel()
    }
  }, [search, debouncedFetchAssetData])

  return (
    <div>
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
          <h2 className="text-xl">
            {t('shop_group_type')}
          </h2>
          <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
            {/* <div className="flex gap-3">
              <div>
                <button type="button" className="btn btn-primary" onClick={() => addEditShopGroup()}>
                  <IconPlus className="ltr:mr-2 rtl:ml-2" />
                  เพิ่มกลุ่มร้าน
                </button>
              </div>
            </div> */}
            <div className="relative">
              <input
                type="text"
                placeholder={t('search')}
                className="form-input py-2 ltr:pr-11 rtl:pl-11 peer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                <IconSearch className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
        <div className="datatables pagination-padding">
          <DataTable
            className="whitespace-nowrap table-hover invoice-table"
            records={shopGroupLists}
            columns={[
              {
                accessor: 'id',
                title: t('order_number'),
                sortable: false,
                render: (row, index) => (
                  <div>{index + 1}</div>
                ),
              },
              {
                accessor: 'name',
                title: t('shop_group_name'),
                sortable: false,
                render: (item: any) => (
                  <div className="flex items-center font-normal">
                    <a className="flex cursor-pointer active" onClick={() => goShopGroupBu(item)}>
                      {item.name}
                    </a>
                  </div>
                ),
              },
              {
                accessor: 'is_active',
                title: t('active_status'),
                sortable: false,
                render: ({ is_active }) => (
                  <span className={`badge ${is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {is_active ? t('active') : t('inactive')}
                  </span>
                ),
              },
              {
                accessor: 'action',
                title: 'Actions',
                sortable: false,
                textAlignment: 'center',
                render: (item) => (
                  <div className="flex gap-4 items-center w-max mx-auto">
                    {
                      role === 'admin' && (<Tippy content={t('shop_group_list_bu')} theme="Primary">
                        <a className="flex hover:text-primary cursor-pointer active" onClick={() => { goShopGroupBu(item) }}>
                          <IconEye />
                        </a>
                      </Tippy>)
                    }
                    <Tippy content={t('edit')} theme="Primary">
                      <a className="flex hover:text-info cursor-pointer active" onClick={() => { addEditShopGroup(item) }}>
                        <IconEdit className="w-4.5 h-4.5" />
                      </a>
                    </Tippy>
                  </div>
                ),
              },
            ]}
            highlightOnHover
            totalRecords={totalItems}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={(p) => setPage(p)}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={(p) => {
              setPage(1)
              setPageSize(p)
            }}
            paginationText={({ from, to, totalRecords }) => t('pagination_text', { from, to, totalRecords })}
          />
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
                  <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                    <button
                      type="button"
                      onClick={() => setActionModal(false)}
                      className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                    >
                      <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{formData.id ? t('edit') : t('add')}</div>
                    <div className="p-5">
                      <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                        {(props) => (
                          <Form className="space-y-5 mb-7 dark:text-white custom-select">
                            <SelectField
                              label={t('business_unit')}
                              id="id_business_unit"
                              name="id_business_unit"
                              options={businessUnit}
                              placeholder={t('please_select')}
                              onChange={(e: any) => handleChangeSelect(props, e, 'id_business_unit')}
                              isSearchable={true}
                            />
                            <InputField
                              label={t('shop_group_name')}
                              name="name"
                              type="text"
                              placeholder={t('please_enter_data')}
                            />
                            <SelectField
                              require={true}
                              label={t('status')}
                              id="is_active"
                              name="is_active"
                              options={[
                                {
                                  value: true,
                                  label: t('open'),
                                },
                                {
                                  value: false,
                                  label: t('close'),
                                },
                              ]}
                              placeholder={t('please_select')}
                              onChange={(e: any) => {
                                props.setFieldValue('is_active', e.value)
                              }}
                              isSearchable={false}
                            />
                            { /*
                            <SelectField
                              require={true}
                              label="Vat"
                              id="has_vat"
                              name="has_vat"
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
                                props.setFieldValue('has_vat', e.value)
                              }}
                              isSearchable={false}
                            />
                            */ }
                            <div className="flex justify-end items-center mt-8">
                              <button type="button" className="btn btn-outline-danger" onClick={() => setActionModal(false)}>
                                {t('cancel')}
                              </button>
                              <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                {formData.id ? t('save') : t('add')}
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
