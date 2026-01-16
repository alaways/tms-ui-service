import { useState, useEffect, useCallback, Fragment, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import * as Yup from 'yup'
import debounce from 'lodash/debounce'

import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'

import { Dialog, Transition } from '@headlessui/react'

import { url_api } from '../../../services/endpoints'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { DEBOUNCE_TIME, PAGE_SIZES } from '../../../helpers/config'

import { Formik, Form } from 'formik'

import Tippy from '@tippyjs/react'

import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'

import { DataTable } from 'mantine-datatable'

import { ContractTypes } from '../../../types/index'
import { showNotification } from '../../../helpers/showNotification'

import IconX from '../../../components/Icon/IconX'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEdit from '../../../components/Icon/IconEdit'
import IconSearch from '../../../components/Icon/IconSearch'

import { useTranslation } from 'react-i18next'

import 'tippy.js/dist/tippy.css'

const defaultsForm = {
  id: '',
  name: '',
  is_active: true,
}

const mode = process.env.MODE || 'admin'

const List = () => {
  const { t } = useTranslation()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(setPageTitle(t('contract_type_list')))
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
  const [formData, setFormData] = useState<ContractTypes>(defaultsForm)
  const [contractTypesLists, setContractTypesLists] = useState<ContractTypes[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [search, setSearch] = useState('')

  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required(t('please_fill_all_fields')),
  })

  const { mutate: fetchContractTypesData } = useGlobalMutation(url_api.contractTypeFindAll, {
    onSuccess: (res: any) => {
      setContractTypesLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  useEffect(() => {
    if (!firstLoading) return
    fetchContractTypesData({
      data: {
        page: page,
        page_size: pageSize,
        query: search,
      },
    })
  }, [page])

  useEffect(() => {
    if (!firstLoading) return
    fetchContractTypesData({
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
        fetchContractTypesData({
          data: {
            page: 1,
            page_size: pageSize,
            query: searchValue,
          },
        })
      }, DEBOUNCE_TIME.FAST),
    [fetchContractTypesData, pageSize]
  )

  useEffect(() => {
    debouncedFetchAssetData(search)
    return () => {
      debouncedFetchAssetData.cancel()
    }
  }, [search, debouncedFetchAssetData])

  const { mutate: contractTypeCreate } = useGlobalMutation(url_api.contractTypeCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification(t('add_success'), 'success')
        setActionModal(false)
        fetchContractTypesData({ data: { page, page_size: pageSize, query: search } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const { mutate: contractTypeUpdate } = useGlobalMutation(url_api.contractTypeUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification(t('edit_success'), 'success')
        setActionModal(false)
        fetchContractTypesData({ data: { page, page_size: pageSize, query: search } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const submitForm = useCallback(
    (values: ContractTypes) => {
      const data = { ...values, active: values.is_active }
      if (values.id) {
        contractTypeUpdate({ data, id: values.id })
      } else {
        contractTypeCreate({ data })
      }
    },
    [contractTypeCreate, contractTypeUpdate]
  )

  const addEditContractType = (item: any = null) => {
    setFormData(item ? JSON.parse(JSON.stringify(item)) : defaultsForm)
    setActionModal(true)
  }

  return (
    <div>
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
          <h2 className="text-xl">
            {t('contract_type')}
          </h2>
          <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
            <div className="flex gap-3">
              <button type="button" className="btn btn-primary" onClick={() => addEditContractType()}>
                <IconPlus className="ltr:mr-2 rtl:ml-2" />
                {t('add_contract_type')}
              </button>
            </div>
            <div className="relative">
              <input type="text" placeholder={t('search_text')} className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                <IconSearch className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
        <div className="datatables pagination-padding">
          <DataTable
            className="whitespace-nowrap table-hover invoice-table"
            records={contractTypesLists}
            columns={[
              {
                accessor: 'id',
                title: t('sequence'),
                textAlignment: 'center',
                sortable: false,
                render: (row, index) => (
                  <div>{index + 1}</div>
                ),
              },
              {
                accessor: 'name',
                title: t('contract_name'),
                textAlignment: 'left',
                sortable: false,
                render: ({ name }) => (
                  <div className="flex items-center font-normal">
                    <div>{name}</div>
                  </div>
                ),
              },
              {
                accessor: 'is_active',
                title: t('active_inactive_status'),
                textAlignment: 'center',
                sortable: false,
                render: ({ is_active }) => (
                  <span className={`badge ${is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {is_active ? t('open') : t('close')}
                  </span>
                ),
              },
              {
                accessor: 'action',
                title: t('actions'),
                textAlignment: 'center',
                sortable: false,
                render: (item) => (
                  <div className="flex gap-4 items-center w-max mx-auto">
                    <Tippy content={t('edit')} theme="Primary">
                      <a className="flex cursor-pointer active" onClick={() => { addEditContractType(item) }}>
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
              `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total_pages')}`
            )}
          />
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
                      {formData.id ? t('edit') : t('add')}
                    </div>
                    <div className="p-5">
                      <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                        {(props) => (
                          <Form className="space-y-5 mb-7 dark:text-white custom-select">
                            <InputField
                              label={t('contract_name')}
                              name="name"
                              type="text"
                              placeholder={t('please_enter_info')}
                            />
                            <SelectField
                              label={t('status') + '*'}
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