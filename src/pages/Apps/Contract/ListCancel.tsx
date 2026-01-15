import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import * as XLSX from 'xlsx'
import moment from 'moment'

import { DataTable, DataTableSortStatus } from 'mantine-datatable'

import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'

import { Formik, Form } from 'formik'

import Select from 'react-select'
import DatePicker from '../../../components/HOC/DatePicker'

import { Contract } from '../../../types/index'

import { url_api } from '../../../services/endpoints'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { columns_csv } from '../../../helpers/constant'
import { convertDateClientToDb, convertDateDbToClient } from '../../../helpers/formatDate'

import IconOpenBook from '../../../components/Icon/IconOpenBook'
import PreLoading from '../../../helpers/preLoading'
import DateRangeAntd from '../../../components/HOC/DateRangeAntd'
import IconChecks from '../../../components/Icon/IconChecks'
import { useTranslation } from 'react-i18next'

const filterInitial: any = {
  start_at: '',
  end_at: '',
  query: '',
  status_code: '',
  stats_type: '',
  id_business_unit: '',
  contract_date: '',
  approved_at: ''
}

const mode = process.env.MODE || 'admin'

const ListCancel = () => {

  const dispatch = useDispatch()
  const { t } = useTranslation()

  useEffect(() => {
    dispatch(setPageTitle(t('cancelled_contract_list')))
  }, [dispatch, t])

  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<any>([])
  const [businessUnit, setBusinessUnit] = useState<any>([])

  const [contractList, setContractList] = useState<Contract[]>([])

  const PAGE_SIZES = [10, 20, 30, 50, 100]

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])

  const apiUrl = process.env.BACKEND_URL
  const storedUser = localStorage.getItem(mode)

  const role = storedUser ? JSON.parse(storedUser).role : null
  const token = storedUser ? JSON.parse(storedUser).access_token : null

  const [totalItems, setTotalItems] = useState<number>(0)

  const [isDownloading, setIsDownloading] = useState<any>(false)
  const [filterValues, setFilterValues] = useState(filterInitial)

  const { mutate: fetchContractData,isLoading:isLoadingContract } = useGlobalMutation(url_api.contractCancelFindAll, {
    onSuccess: (res: any) => {
      setContractList(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: (err: any) => {
      console.error(err)
    },
  })

  const updateFilterValues = (newData: any, field: string) => {
    setFilterValues((prevState: any) => ({
      ...prevState,
      [field]: newData,
    }))
  }

  const goEdit = (item: any) => {
    open('/apps/contract/' + item.id + '/' + item.uuid, '_blank');
  }

  const { mutate: fetchContractGetStatus } = useGlobalMutation(url_api.contractFilter, {
    onSuccess: (res: any) => {
      setBusinessUnit(res.data.business_unit.map((item: any) => ({
        value: item,
        label: item.name,
      })))
      
      setStatus(
        res.data.status.slice(5, 8).map((item: any) => {
          return {
            value: item,
            label: item.name,
            status_code: item.status_code,
            status_type: item.status_type,
          }
        })
      )
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  useEffect(() => {
    fetchContractGetStatus({})
  }, [])

  const fetchExportCsv = async () => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${token}`)
    const raw = JSON.stringify({...filterValues,page:1,page_size:999999,format:'excel'});
    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    }
    return fetch(apiUrl + url_api.contractCancelFindAll, requestOptions)
      .then((response) => response.json())
      .then((result) => result.data)
      .catch((error) => {
        // console.error(error)
        return []
      })
  }

  const handleExport = async (filename: any) => {
    if (!isDownloading) {
      setIsDownloading(true)
      const data: any = await fetchExportCsv()
      const worksheet = XLSX.utils.json_to_sheet(data, { header: columns_csv.map((col) => col.id) })
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      const headerDisplayNames = columns_csv.map((col) => col.displayName)
      XLSX.utils.sheet_add_aoa(worksheet, [headerDisplayNames], { origin: 'A1' })
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename + '.xlsx')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setIsDownloading(false)
    }
  }

  const fetchData = (filters: any, currentPage: number, currentPageSize: number) => {
    setIsLoading(true)
    // filters.status_code = filters.status_code !== '' ? filters.status_code.value.status_code : ''
    const params = {
      page: currentPage,
      page_size: currentPageSize,
      start_at: convertDateClientToDb(filters.start_at),
      end_at: convertDateClientToDb(filters.end_at),
      contract_date: filters?.contract_date[0],
      contract_end_date: filters?.contract_date[1],
      approved_at: filters?.approved_at[0],
      approved_end_at: filters?.approved_at[1],
      query: filters.query,
      status_type: filters?.status_code?.value?.status_type ? filters?.status_code?.value?.status_type : 'contract',
      status_code: filters?.status_code?.value?.status_code ? filters?.status_code?.value?.status_code : '',
      id_business_unit: filters?.id_business_unit?.value?.id || ''
    }
    fetchContractData({
      data: params,
    })
    setFilterValues(params)
  }

  useEffect(() => {
    fetchContractData({data:{...filterValues,page:page,page_size:pageSize}})
  }, [page, pageSize])

  return (
    <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
      {(isLoadingContract || isDownloading) && <PreLoading />}
      <div className="invoice-table">
        <div className="flex w-full mb-4.5 px-5 md:items-center md:flex-row flex-col gap-5">
          <Formik initialValues={filterInitial} onSubmit={(values) => {
            setIsLoading(true);
            setPage(1);
            fetchData(values, 1, pageSize);
          }} enableReinitialize >
            {({ values, setFieldValue, resetForm }) => (
              <Form className="flex flex-col flex-auto gap-2">
                <div className="flex flex-col sm:flex-row md:flex-row gap-5">
                  <div className="flex-1">
                    <label>{t('business_unit')}</label>
                    {role === "business_unit" ? (<Select
                      defaultValue={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value.id }}
                      value={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value.id }}
                      placeholder={t('select_business_unit')}
                      className="z-10 w-auto"
                      options={businessUnit.map((item: any) => ({ label: item.label, value: item.value.id }))}
                      isDisabled={true}
                    />) : (<Select
                      value={values.id_business_unit}
                      placeholder={t('select_business_unit')}
                      className="z-10 w-auto"
                      options={businessUnit}
                      isSearchable={true}
                      onChange={(e: any) => {
                        setFieldValue('id_business_unit', e)
                        updateFilterValues(e.value.id, 'id_business_unit')
                      }}
                    />)}

                  </div>
                  <div className="flex-1">
                    <label>{t('cancellation_status')}</label>
                    <Select
                      value={values.status_code}
                      placeholder={t('select_status')}
                      className="z-10 w-auto"
                      options={status}
                      isSearchable={true}
                      onChange={(e) => {
                        setFieldValue('status_code', e)
                        updateFilterValues(e.value.status_code, 'status_code')
                        updateFilterValues(e.value.status_type, 'status_type')
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-row gap-5 pt-3">
                  {/* <DatePicker
                    label={t('contract_date')}
                    name="contract_date"
                    isRange={true}
                    onChange={(value: any) => {
                      setFieldValue('contract_date', value)
                      updateFilterValues(convertDateClientToDb(value[0]?[value[0]]:null), 'contract_date')
                      updateFilterValues(convertDateClientToDb(value[1]?[value[1]]:null), 'contract_end_date')
                    }}
                  />
                  <DatePicker
                    label={t('contract_approval_date')}
                    name="approved_at"
                    isRange={true}
                    onChange={(value: any) => {
                      setFieldValue('approved_at', value)
                      updateFilterValues(convertDateClientToDb(value[0]?[value[0]]:null), 'approved_at')
                      updateFilterValues(convertDateClientToDb(value[1]?[value[1]]:null), 'approved_end_at')
                    }}
                  /> */}
                  <DateRangeAntd label={t('contract_date')} name="contract_date" />
                  <DateRangeAntd label={t('contract_approval_date')} name="approved_at" />

                </div>
                <div className='flex flex-col sm:flex-row md:flex-row gap-5'>
                  <div className="flex-1">
                    <label>{t('search_text')}</label>
                    <input
                      type="text"
                      name="query"
                      className="form-input"
                      placeholder={t('search_text') + '...'}
                      onChange={(e: any) => {
                        setFieldValue('query', e.target.value)
                        updateFilterValues(e.target.value, 'query')
                      }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row md:flex-row gap-5 justify-center items-end">
                    <button type="submit" className="btn btn-primary gap-2 w-[100px] h-[40px]">
                      {t('search_text')}
                    </button>
                    <button
                      type="reset"
                      className="btn btn-info gap-2 w-[100px]"
                      onClick={() => {
                        const resetValues = {
                          start_at: '',
                          end_at: '',
                          query: '',
                          status_code: '',
                          stats_type: '',
                          id_business_unit: '',
                          contract_date: '',
                          approved_at: ''
                        }
                        setPage(1)
                        fetchData(resetValues, 1, pageSize)
                        // setFilterValues(resetValues)
                      }}
                    >
                      {t('clear')}
                    </button>
                    {(role === 'admin' || role === 'business_unit') && (
                      <button type="button" className="btn btn-success gap-2 w-[100px] h-[40px]" onClick={() => { handleExport(`contract_${new Date().toLocaleString()}`) }}>
                        Export
                      </button>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div className="datatables pagination-padding">
          {contractList.length === 0 ? (
            <div className="my-10 text-center text-gray-500">{t('not_found_data')}</div>
          ) : (
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={contractList}
              columns={[
                {
                  accessor: 'index',
                  title: t('order'),
                  textAlignment: 'center',
                  render: (row, index) => (
                    index + 1 + (page - 1) * pageSize
                  )
                },
                {
                  accessor: 'id',
                  title: t('contract_number'),
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any) => {
                      return ((role == 'shop' && item?.is_view == 1 || role != 'shop')) ? (
                          <>
                              <div className="pointer flex items-center space-x-2 active" onClick={() => goEdit(item)}>
                                
                                  <span>{item.reference}</span>
                              </div>
                          </>
                      ) : (
                          <>
                              <div className="flex items-center space-x-2">
                                  <span>{item.reference}</span>
                              </div>
                          </>
                      )
                  },
                },
                {
                  accessor: 'business_unit',
                  title: t('business_unit'),
                  textAlignment: 'left',
                  sortable: false,
                  render: (item: any) => (
                    <div className="pointer">
                      {item?.business_unit?.name}
                    </div>
                  ),
                },
                {
                  accessor: 'shop',
                  title: t('shop'),
                  textAlignment: 'left',
                  sortable: false,
                  render: (item) => (
                    <div>
                      {item.shop.name}
                    </div>
                  ),
                },
                {
                    accessor: 'contract_type',
                    title: t('contract_type'),
                    textAlignment: 'left',
                    sortable: false,
                    render: (item: any) => <p>{item?.contract_type?.name}</p>,
                },
                {
                    accessor: 'contract_date',
                    title: t('contract_date'),
                    textAlignment: 'left',
                    sortable: false,
                    render: (item: any) => {
                        return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ? <p className="pointer">{convertDateDbToClient(item?.contract_date) ?? '-'}</p> :  '-'
                      
                    }
                },
                {
                    accessor: 'approved_at',
                    title: t('contract_approval_date'),
                    textAlignment: 'left',
                    sortable: false,
                    render: (item: any) => {
                      return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ? <p className="pointer">{convertDateDbToClient(item?.approved_at) ?? '-'}</p> :  '-'
                    }
                 },
                 {
                    accessor: 'customer',
                    title: t('customer_name'),
                    textAlignment: 'left',
                    sortable: false,
                    render: (item: any) => {
                        return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.customer.name}</p>:  '-'
                    }
                },
                {
                    accessor: 'price',
                    title: t('price'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item: any) =>{
                        return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.price ? item.price.toLocaleString('en-US') : '-'}</p>:  '-'
                    }
                },
                {
                    accessor: 'down_payment',
                    title: t('down_payment'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item: any) =>{
                        return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.down_payment ? item.down_payment.toLocaleString('en-US') : '-'}</p>:  '-'
                    }
                },
                {
                    accessor: 'principle',
                    title: t('lease_principal'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item: any) =>{
                        return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.principle ? item.principle.toLocaleString('en-US') : '-'}</p>:  '-'
                    }
                },
                {
                    accessor: 'ins_period',
                    title: t('installment_period'),
                    textAlignment: 'center',
                    sortable: false,
                    render: (item: any) =>{
                        return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item?.ins_period ?? '-'}</p>:  '-'
                    }
                },
                {
                    accessor: 'customer_signature_at',
                    title: t('online_signature'),
                    textAlignment: 'center',
                    sortable: false,
                    render: (item: any) =>{
                        return ((role == 'shop' && item?.is_view == 1)  || role != 'shop')  ? 
                          <span className={`${item?.customer_signature_at ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                              {item?.customer_signature_at ? <IconChecks className="w-6 h-6" /> : ''}
                          </span>
                        :  <></>
                    }
                },
                {
                  accessor: 'e_contract_status',
                  title: t('ekyc_signature'),
                  textAlignment: 'center',
                  sortable: false,
                  render: (item:any) => (
                      <span className={`${item?.e_contract_status ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                          {item?.e_contract_status ? <IconChecks className="w-6 h-6" /> : ''}
                      </span>
                  ),
                },
                {
                    accessor: 'action',
                    title: 'Actions',
                    sortable: false,
                    textAlignment: 'center',
                    render: (item: any) => {
                      return ((role == 'shop' && item?.is_view == 1) || role != 'shop') && (
                            <div className="flex gap-4 items-center w-max mx-auto">
                            <a
                                className="flex cursor-pointer active"
                                onClick={() => goEdit(item)}
                            >
                                <IconOpenBook />
                            </a>
                            </div>
                        )
                    }
                },
              ]}
              page={page}
              totalRecords={totalItems}
              recordsPerPage={pageSize}
              onPageChange={(e) => setPage(e)}
              recordsPerPageOptions={PAGE_SIZES}
              onRecordsPerPageChange={(p) => {
                setPage(1)
                setPageSize(p)
              }}
              highlightOnHover
              paginationText={({ from, to, totalRecords }) => (
                `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total_pages')}`
              )}
            />
          )}
        </div>
      </div>
    </div>
  )

}

export default ListCancel
