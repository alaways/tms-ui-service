import { Link, useNavigate } from 'react-router-dom'
import { DataTable, DataTableSortStatus } from 'mantine-datatable'
import { useState, useEffect, useCallback, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { setEmployee } from '../../../store/dataStore'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEdit from '../../../components/Icon/IconEdit'
import IconEye from '../../../components/Icon/IconEye'
import { Employees } from '../../../types/index'
import { debounce } from 'lodash'
import { formatPhoneNumber } from '../../../helpers/formatNumeric'
import { accessLevelTypes, roleTypes } from '../../../helpers/constant'
import Select from 'react-select'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { Field, Form, Formik, FormikProps } from 'formik';
import PreLoading from '../../../helpers/preLoading'
import { PAGE_SIZES } from '../../../helpers/config'
import Swal from 'sweetalert2'
import themeInit from '../../../theme.init'
import { toastAlert } from '../../../helpers/constant'
import { Dialog, Transition } from '@headlessui/react'
import IconX from '../../../components/Icon/IconX'
import SelectField from '../../../components/HOC/SelectField'
import { useTranslation } from 'react-i18next'
const mode = process.env.MODE || 'admin'

const List = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  const access_level = storedUser ? JSON.parse(storedUser ?? '{}').access_level : null
  const toast = Swal.mixin(toastAlert)
  if (role != 'admin' && role != 'business_unit') {
    navigate('/')
  }

  useEffect(() => {
    dispatch(setPageTitle(t('employee_list')))
  })

  const [firstLoading, setFirstLoading] = useState(false)
  useEffect(() => {
    setFirstLoading(true)
  }, [])

  const [employeeLists, setEmployeeLists] = useState<Employees[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [search, setSearch] = useState('')
  const [buSearch, setBuSearch] = useState<any>(null)
  const [businessUnit, setBusinessUnit] = useState<any>([])
  const [actionModal, setActionModal] = useState(false)
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: '',
    direction: 'asc',
  })

  const goEdit = (item: any) => {
    dispatch(setEmployee(item))
    navigate('/apps/employee/edit/' + item.id)
  }


  const { mutate: fetchContractGetStatus,isLoading:isLoadingStatus } = useGlobalMutation(url_api.contractFilter, {
    onSuccess: (res: any) => {
      setBusinessUnit([{ value: null, label: t('all') }, ...res.data.business_unit.map((item: any) => ({
        value: item,
        label: item.name,
      }))]

      )
    },
    onError: () => {
      console.error('Failed to fetch bu data')
    },
  })

  useEffect(() => {
    if (role === 'admin') {
      fetchContractGetStatus({})
    }
  }, [])
  const [filterSearch, setFilterSearch] = useState({})
  const { mutate: fetchData,isLoading: isLoading} = useGlobalMutation(url_api.employeeFindAll, {
    onSuccess: (res: any) => {
      setEmployeeLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch bu data')
    },
  })

  useEffect(() => {
    const param = {
      data: {
        ...filterSearch,
        page: 1,
        page_size: pageSize,
      },
    }
    fetchData(param)
  }, [])

  useEffect(() => {
    if (!firstLoading) return
    const param = {
      data: {
        ...filterSearch,
        page: 1,
        page_size: pageSize,
      },
    }
    fetchData(param)
  }, [pageSize])

  useEffect(() => {
    if (!firstLoading) return
    fetchData({
      data: {
         ...filterSearch,
        page: page,
        page_size: pageSize,
      },
    })
  }, [page,])


  const accessLevel = accessLevelTypes.reduce((currentValue: any, nowValue: any) => {
    currentValue[`${nowValue.value}`] = nowValue.label
    return currentValue
  }, {})

  const roleName = roleTypes.reduce((currentValue: any, nowValue: any) => {
    currentValue[`${nowValue.value}`] = nowValue.label
    return currentValue
  }, {})

  const { mutate: employeeUpdateActive,isLoading:isUpdateAcive } = useGlobalMutation(url_api.employeeUpdateActive, {
    onSuccess: (res: any) => {
       if (res.statusCode === 200 || res.code === 200) {
            toast.fire({
                icon: 'success',
                title: t('save_success'),
                padding: '10px 20px',
            })
            setTimeout(() => {
              window.location.reload()
            }, 2000);
        } else {
            toast.fire({
                icon: 'error',
                title: res.message,
                padding: '10px 20px',
            })
        }
    },
    onError: () => {
      toast.fire({
          icon: 'error',
          title: t('error_occurred'),
          padding: '10px 20px',
      })
    },
  })

  const [formUpdate, setFormUpdate] = useState<any>({
        is_active:true
  })

   const submitFormClearToken = useCallback(
        (values: any) => {
          const uuid = selectedRecords.map(item => item?.id);
          employeeUpdateActive({
              data: {
                  uuid:uuid,
                  is_active:values?.is_active
                  
              }
          })
        },
        [selectedRecords,employeeUpdateActive]
  )

  return (
    <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
      {isLoading || isLoadingStatus || isUpdateAcive && <PreLoading />}
      <div className="invoice-table ">
        <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
          <div className="flex items-center gap-2">
            <Link to="/apps/employee/add" className="btn btn-primary gap-2">
              <IconPlus />
              {t('add_employee_btn')}
            </Link>
            {(access_level == 'A' || access_level == 'B') && (
              <button type='button' className="btn btn-success gap-2" onClick={() => { setActionModal(true)}} disabled={selectedRecords?.length > 0 ? false : true}>
                {t('update_status')}
              </button>
            )}
            
          </div>

          <div className="flex flex-row ltr:ml-auto rtl:mr-auto gap-5">

            <Formik initialValues={filterSearch}
              onSubmit={(values: any) => {
                const param = { 
                  query:values?.query ?? '',
                  id_business_unit:values?.id_business_unit?.value?.id ?? null
                }
                setFilterSearch(param)
                fetchData({data:param})
              }}>
              {({ setFieldValue, handleReset, values }) => (
                <Form className='w-full'>
                  <div className='flex flex-col gap-3 w-full'>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                      {role === 'admin' && (

                          <Select
                              id="id_business_unit"
                              name="id_business_unit"
                              value={values.id_business_unit}
                              placeholder={t('select_business_unit')}
                              className="z-10 w-[200px]"
                              options={businessUnit}
                              isSearchable={true}
                              onChange={(e: any) => {
                                setFieldValue('id_business_unit', e)
                              }}
                            />
                      )}

                      <div className="relative">
                          <input type="text"
                            id="query"
                            name="query"
                            placeholder={t('search')}
                            className="form-input py-2 ltr:pr-11 rtl:pl-11 peer"
                            value={values.query}
                            onChange={(e) => {
                              setFieldValue('query', e.target.value);
                            }}
                          />
                        </div>
                      <div className="flex gap-4">
                        <button type="submit" className="btn btn-primary w-[100px] gap-2">{t('search')}</button>
                        <button
                          type="reset"
                          className="btn btn-info gap-2 w-[100px]"
                          onClick={() => {
                            location.reload()
                          }}
                        >
                          {t('clear_values')}
                        </button>
                      </div>
                    </div>
                  </div>

                </Form>
              )}
            </Formik>
          
          </div>
        </div>
        <div className="datatables pagination-padding">
          <DataTable
            className="whitespace-nowrap table-hover invoice-table"
            records={employeeLists}
            columns={[
              {
                accessor: 'id',
                title: t('order_number'),
                sortable: false,
                textAlignment: 'center',
                render: (row, index) => (
                  <div>{index + 1}</div>
                ),
              },
              {
                accessor: 'name',
                title: t('employee_name'),
                sortable: false,
                render: (item) => (
                  <div className="flex items-center justify-start font-normal">
                    <a className="flex cursor-pointer active" onClick={() => goEdit(item)} >
                      <div>{item.title + ' ' + item.name}</div>
                    </a>
                  </div>
                ),
              },
              {
                accessor: 'email',
                title: t('email'),
                sortable: false,
                render: (item: any) => (
                  <div className="flex items-center justify-start font-normal">
                    <div>{item.email}</div>
                  </div>
                ),
              },
              {
                accessor: 'phone_number',
                title: t('phone_number'),
                sortable: false,
                render: ({ phone_number }) => (
                  <div className="flex items-center justify-start font-normal">
                    <div>{formatPhoneNumber(phone_number ?? '-')}</div>
                  </div>
                ),
              },
              {
                accessor: 'line_id',
                title: t('line_id'),
                sortable: false,
                render: (item: any) => (
                  <div className="flex items-center justify-start font-normal">
                    <div>{item.line_id}</div>
                  </div>
                ),
              },
              {
                accessor: 'business_unit',
                title: t('business_unit'),
                sortable: false,
                render: (item: any) => (
                  <div className="flex items-center justify-start font-normal">
                    <div>{item?.business_unit?.name || 'TMS'}</div>
                  </div>
                ),
              },
              {
                accessor: 'role',
                title: t('position'),
                textAlignment: 'center',
                sortable: false,
                render: (item: any) => (
                  <div className="flex items-center justify-center font-normal">
                    <div>{roleName[item.role] || '-'}</div>
                  </div>
                ),
              },
              {
                accessor: 'access_level',
                title: t('access_level'),
                textAlignment: 'center',
                sortable: false,
                render: (item: any) => (
                  <div className="flex items-center justify-center font-normal">
                    <div>{accessLevel[item.access_level] || '-'}</div>
                  </div>
                ),
              },
              {
                accessor: 'is_active',
                title: t('active_status'),
                textAlignment: 'center',
                sortable: false,
                render: ({ is_active }) => (
                  <span className={`badge ${is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {is_active ? t('active') : t('inactive')}
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
            selectedRecords={selectedRecords}
            onSelectedRecordsChange={setSelectedRecords}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            paginationText={({ from, to, totalRecords }) => (
              `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total_pages')}`
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
                      <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{t('update_data')}</div>
                      <div className="p-5">
                      <Formik
                          initialValues={formUpdate}
                          onSubmit={submitFormClearToken}
                          enableReinitialize
                          autoComplete="off"
                          >
                          {(props) => (
                              <Form className="space-y-5 mb-7 dark:text-white custom-select">
                              <SelectField
                                  label={t('usage_status')}
                                  id="is_active"
                                  name="is_active"
                                  options={[
                                      { value: true, label: t('active') },
                                      { value:false, label: t('inactive') },
                                  ]}
                                  placeholder={t('please_select')}
                                  onChange={(e: any) => {
                                  props.setFieldValue('is_active', e.value);
                                  }}
                                  isSearchable={false}
                              />


                              <div className="flex justify-center items-center mt-8">
                                  <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                  {t('ok')}
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

export default List