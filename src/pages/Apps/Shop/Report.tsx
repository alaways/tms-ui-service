import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import * as XLSX from 'xlsx'

import _ from 'lodash'
import Swal from 'sweetalert2'

import moment from 'moment-timezone'

import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageTitle } from '../../../store/themeConfigSlice'

import { url_api } from '../../../services/endpoints'
import { shop_report_csv, toastAlert } from '../../../helpers/constant'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { numberWithCommas } from '../../../helpers/formatNumeric'

import { convertDateClientToDb, convertDateDbToClient } from '../../../helpers/formatDate'
import { useShopFindMutation } from '../../../services/mutations/useShopMutation'

import Select from 'react-select'

import { Spinner } from 'reactstrap'
import { Formik, Form } from 'formik'

import { DataTable } from 'mantine-datatable'

import DatePicker from '../../../components/HOC/DatePicker'
import SelectField from '../../../components/HOC/SelectField'

import IconSearch from '../../../components/Icon/IconSearch'
import IconRefresh from '../../../components/Icon/IconRefresh'

import Breadcrumbs from '../../../helpers/breadcrumbs'
import { useTranslation } from 'react-i18next'   // 新增

const toast = Swal.mixin(toastAlert)
const mode = process.env.MODE || 'admin'

const Report = () => {
  const { t } = useTranslation();              // 新增

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  const { id } = useParams()
  const id_business_unit = searchParams.get('id_business_unit') || ''

  const breadcrumbItems = [
    { to: '/apps/shop/list', label: t('shop') }, // 已有 key：店铺
    { label: t('reward_report'), isCurrent: true }, // 已有 key：回报报告
  ]

  const apiUrl = process.env.BACKEND_URL
  const storedUser = localStorage.getItem(mode)

  const role = storedUser ? JSON.parse(storedUser).role : null
  const token = storedUser ? JSON.parse(storedUser).access_token : null

  const dataStoredShop: any = useSelector((state: IRootState) => state.dataStore.shop)

  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const [shopData, setShopData] = useState<any>(null)
  const [businessUnit, setBusinessUnit] = useState<any>([])
  const [statusList, setStatusList] = useState<any>([
    {
      value : "all",
      label : t('all')                          // 已有 key：全部
    },
    {
      value : "approved",
      label : t('approved')                     // 新 key：已批准
    },
    {
      value : "cancel",
      label : t('cancelled')                    // 新 key：已取消
    }
  ])

  const [defaultForm, setDefaultFormData] = useState<any>({
    start_at: searchParams.get('startDate') || `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
    end_at: searchParams.get('endDate') || `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
    id_business_unit: id_business_unit || '',
    id_shop: id || '',
    search: '',
    status: ''
  })

  const [commissionTotalLists, setCommissionTotalLists] = useState({
    count_item: 0,
    total_commission: 0,
    total_down_payment: 0,
    total_price: 0,
    total_amount: 0,
    total_principle: 0,
    total_benefit: 0,
    total_amount_shop: 0,
    total_fee: 0,
    total_ins_amount:0,
  })
  const [commissionLists, setCommissionLists] = useState<any[]>([])

  const PAGE_SIZES = [10, 20, 30, 50, 100]

  const [page, setPage] = useState(1)
  const [prevPageSize, setPrevPageSize] = useState(1)

  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const { mutate: fetchShopData, isLoading: isShopLoading, isError } = useShopFindMutation({
    onSuccess: (res: any) => {
      const setFormValue = res.data
      setShopData({
        ...setFormValue,
        id: (id || dataStoredShop.id)
      })
      fetchBU({data:{
        id_shop:(id || dataStoredShop.id)
      }})
     
    },
    onError: (err) => {
      setShopData(dataStoredShop)
    },
  })

  const { mutate: fetchBU } = useGlobalMutation(url_api.shopGetBU, {
    onSuccess: (res: any) => {
      setBusinessUnit(
        res.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      );

    },
    onError: () => {
      console.error('Failed to fetch status data')
    },
  })

  const { mutate: fetchCommissionData } = useGlobalMutation(url_api.getCommissionPV, {
    onSuccess: (res: any) => {
      if (res.data !== undefined) {
        setCommissionLists(res.data.list)
        setCommissionTotalLists(res.data.summary)
        setTotalItems(res.data.total)
      }
      setIsLoading(false)
    },
    onError: () => {
      console.error('Failed to fetch status data')
    },
  })

  const fetchExportCsv = async () => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${token}`)
    const raw = JSON.stringify({
      id_shop: defaultForm.id_shop,
      id_business_unit: defaultForm.id_business_unit,
      status:defaultForm.status,
      start_at: defaultForm.start_at,
      end_at: defaultForm.end_at,
      page_size: 50000,
      page: page,
    })
    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    }
    return fetch(apiUrl + url_api.getCommissionPV, requestOptions)
      .then((response) => response.json())
      .then((result) => result.data)
      .catch((error) => {
        return []
      })
  }

  const handleExport = async (filename: any) => {
    if (!isDownloading) {
      setIsDownloading(true)
      const data: any = await fetchExportCsv()
      const worksheet = XLSX.utils.json_to_sheet(
        data.list.map((item: any, index: number) => {
          const commission = commissionLists.find((value) => value.id === item.id)
          return {
            reference: item.reference,
            contract_date: convertDateDbToClient(commission?.contract_date),
            approved_at: convertDateDbToClient(item?.contract_approved_date),
            asset_name: commission?.asset?.name || '0',
            asset_price: numberWithCommas(commission?.price || '0'),
            down_payment: numberWithCommas(commission?.down_payment || '0'),
            principle: numberWithCommas(commission?.principle || '0'),
            commission: numberWithCommas(commission?.commission || '0'),
            benefit: numberWithCommas(item?.benefit || '0'),
            amount: numberWithCommas(commission?.amount || '0'),
            fee: numberWithCommas(commission?.fee || '0'),
            total: numberWithCommas(commission?.total || '-'),
          }
        }),
        { header: shop_report_csv.map((col: any) => col.id) }
      )
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      const headerDisplayNames = shop_report_csv.map((col: any) => col.displayName)
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

  const goPreview = (item: any) => {
    navigate('/apps/contract/' + item.id + '/' + item.uuid)
  }

  useEffect(() => {
    if (role !== 'admin' && role !== 'business_unit') {
      navigate('/')
    }
  }, [role, navigate])

  useEffect(() => {
    dispatch(setPageTitle(t('shop_list')))       // 已有 key：店铺列表
  }, [dispatch, t])

  useEffect(() => {
    fetchShopData({
      data: {
        id: (id || dataStoredShop.id),
      }
    })
    if (id_business_unit) {
      setDefaultFormData((prev: any) => ({
        ...prev,
        id_business_unit: id_business_unit !== '' ? parseInt(id_business_unit) : '',
      }))
    }
  }, [id_business_unit])

  useEffect(() => {
    const isPageSizeChanged = prevPageSize !== pageSize;
    const currentPage = isPageSizeChanged ? 1 : page;
  
    if (!shopData) return;
  
    const idBusinessUnit = defaultForm.id_business_unit !== ''
      ? parseInt(defaultForm.id_business_unit)
      : +id_business_unit;
    

    const shopId = id?.trim() !== '' ? id : 0;
    if(idBusinessUnit == 0) {
      return;
    }
    fetchCommissionData({
      data: {
        id_shop: shopId,
        id_business_unit: idBusinessUnit,
        page: currentPage,
        page_size: pageSize,
        start_at: defaultForm.start_at,
        end_at: defaultForm.end_at,
        status: defaultForm.status
      }
    });
  
    setPrevPageSize(pageSize);
  }, [shopData, page, pageSize]);
  

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3">
        <div className="invoice-table">
          <div className="ml-10 mt-3 text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">
          {t('shop')} {shopData?.name || '-'}
          </div>
          <div className="p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6 mb-6 text-white">
              <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">
                  {t('lease_principal')}   
                  </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">
                    {commissionTotalLists.total_principle?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              <div className="panel bg-gradient-to-r from-violet-500 to-violet-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">
                  {t('brokerage_fee')}   
                  </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">
                    {commissionTotalLists.total_commission?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">
                  {t('total_amount')}  
                  </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">
                    {commissionTotalLists.total_amount?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">
                  {t('contract_fee')}    
                  </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">
                    {commissionTotalLists.total_fee?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              <div className="panel bg-gradient-to-r from-yellow-500 to-yellow-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">
                  {t('remaining_for_shop')}       
                  </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">
                    {commissionTotalLists.total_amount_shop?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>

              <div className="panel bg-gradient-to-r from-red-500 to-orange-500">
                  <div className="flex justify-between">
                      <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">
                      {t('total_installment_price')}
                      </div>
                  </div>
                  <div className="flex items-center mt-5">
                      <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> {commissionTotalLists.total_ins_amount?.toLocaleString() || '0'}</div>
                  </div>
              </div>

            </div>
          </div>
          <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
            <Formik
              initialValues={defaultForm}
              onSubmit={(values, { resetForm }) => {
                if (_.isEmpty(values.start_at) || _.isEmpty(values.end_at) || values.start_at === '' || values.end_at === '') {
                  toast.fire({
                    icon: 'warning',
                    title: t('select_date_complete'),           // 新 key：请选择完整的日期信息
                    padding: '10px 20px',
                  })
                } else {
                  setIsLoading(true)
                  const isRangeArray = Array.isArray(values.start_at) && Array.isArray(values.end_at);

                  const startAt = isRangeArray
                    ? moment.tz(values.start_at[0], 'Asia/Bangkok').format('YYYY-MM-DD')
                    : moment.tz(values.start_at, 'Asia/Bangkok').format('YYYY-MM-DD');

                  const endAt = isRangeArray
                    ? moment.tz(values.end_at[0], 'Asia/Bangkok').format('YYYY-MM-DD')
                    : moment.tz(values.end_at, 'Asia/Bangkok').format('YYYY-MM-DD');

                  setDefaultFormData({
                    id_shop: shopData.uuid,
                    id_business_unit: values.id_business_unit,
                    start_at: values.start_at,
                    end_at: values.end_at,
                    page_size: pageSize,
                    page: page,
                    status: values.status
                  });

                  fetchCommissionData({
                    data: {
                      id_shop: shopData.id,
                      id_business_unit: parseInt(values.id_business_unit),
                      start_at: `${startAt}T00:00:00.000Z`,
                      end_at: `${endAt}T23:59:59.000Z`,
                      page_size: pageSize,
                      page: page,
                      status: values.status
                    }
                  });

                }
              }}
              onReset={() => {
                // setSearch('')
                // setSelectShop(null)
                setCommissionLists([])
                setCommissionTotalLists((old) => ({
                  ...old,
                  count_item: 0,
                  total_commission: 0,
                  total_down_payment: 0,
                  total_price: 0,
                  total_amount: 0,
                  total_principle: 0,
                  total_benefit: 0,
                  total_amount_shop: 0,
                }))
              }}
              enableReinitialize
            >
              {({ setFieldValue, handleReset }) => (
                <Form className="flex items-center gap-2">
                  <DatePicker
                    label={t('start_date')} 
                    name="start_at"
                    onChange={(value: any) => {
                      setFieldValue('start_at', convertDateClientToDb(value))
                    }}
                  />
                  <DatePicker
                    label={t('end_date')}     
                    name="end_at"
                    onChange={(value: any) => {
                      setFieldValue('end_at', convertDateClientToDb(value))
                    }}
                  />
                  {role === "business_unit" ? (<div>
                    <label>{t('business_unit')}</label>
                    <Select
                      defaultValue={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value.id }}
                      value={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value.id }}
                      placeholder={t('select_business_unit')} 
                      className="pr-1 z-10 w-[200px]"
                      options={businessUnit.map((item: any) => ({ label: item.label, value: item.value.id }))}
                      isDisabled={true}
                    />
                  </div>) : (
                    <SelectField
                      id="id_business_unit"
                      name="id_business_unit"
                      label={t('business_unit')}      
                      className="pr-1 z-10 w-[200px]"
                      options={businessUnit}
                      isSearchable={true}
                      onChange={(e: any) => {
                        setFieldValue('id_business_unit', e.value)
                      }}
                    />
                  )}
                  <SelectField
                    id="status"
                    name="status"
                    label={t('contract_status')} 
                    className="pr-1 z-10 w-[200px]"
                    options={statusList}
                    isSearchable={false}
                    onChange={(e: any) => {
                      setFieldValue('status', e.value)
                    }}
                  />
                  <button type="submit" className="btn btn-primary gap-2 mt-5" disabled={isLoading}>
                    {isLoading ? <Spinner size="sm" /> : <IconSearch />}
                    {t('search')}      
                  </button>
                  <button type="reset" className="btn btn-info gap-2 mt-5" disabled={isLoading} onClick={handleReset}>
                    {isLoading ? <Spinner size="sm" /> : <IconRefresh />}
                    {t('clear')}   
                  </button>
                  <div className="flex flex-col pt-5">
                    <button type="button" className="btn btn-success gap-2 w-full h-[40px]" onClick={() => handleExport(`shop_report_${new Date().toLocaleString()}`)}>
                    {t('export')}        
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <div className="datatables pagination-padding">
            {commissionLists.length === 0 ? (
              <div className="text-center text-gray-500">{t('no_data_found')}</div>
            ) : (
              <DataTable
                className="whitespace-nowrap table-hover invoice-table"
                records={commissionLists}
                columns={[
                  {
                    accessor: 'id',
                    title: t('contract_number'),  
                    textAlignment: 'center',
                    sortable: false,
                    render: (item) => (
                      <div className="flex justify-center text-center font-normal">
                        <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                          {item.reference}
                        </a>
                      </div>
                    ),
                  },
                  {
                    accessor: 'contract_date',
                    title: t('contract_date'), 
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return convertDateDbToClient(item?.contract_date)
                    },
                  },
                  {
                    accessor: 'approved_at',
                    title: t('contract_approval_date'),
                    textAlignment: 'left',
                    sortable: false,
                    render: (item) => {
                      return convertDateDbToClient(item?.contract_approved_date)
                    },
                  },
                  {
                    accessor: 'contract_status',
                    title: t('contract_status'),   
                    textAlignment: 'left',
                    sortable: false,
                    render: (item) => {
                      return item?.contract_status || '-'
                    },
                  },
                  {
                    accessor: 'asset.name',
                    title: t('asset_name'),     
                    textAlignment: 'left',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return item?.asset?.name || '0'
                    },
                  },
                  {
                    accessor: 'price',
                    title: t('selling_price'),      
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.price || '0')
                    },
                  },
                  {
                    accessor: 'down_payment',
                    title: t('down_payment'),    
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.down_payment || '0')
                    },
                  },
                  {
                    accessor: 'principle',
                    title: t('lease_principal'),  
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.principle || '0')
                    },
                  },
                  {
                    accessor: 'commission',
                    title: t('brokerage_fee'),   
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.commission || '0')
                    },
                  },
                  {
                    accessor: 'benefit',
                    title: t('special_benefit'),     
                    textAlignment: 'right',
                    sortable: false,
                    render: (item) => {
                      return numberWithCommas(item?.benefit || '0')
                    },
                  },
                  {
                    accessor: 'amount',
                    title: t('total_amount'),     
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.amount || '0')
                    },
                  },
                  {
                    accessor: 'fee',
                    title: t('contract_fee'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.fee || '0')
                    },
                  },
                  {
                    accessor: 'total',
                    title: t('remaining_for_shop'), 
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.total || '-')
                    },
                  },
                  {
                    accessor: 'total',
                    title: t('total_installment_price'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.total_ins_amount || '-')
                    },
                  },
                ]}
                page={page}
                highlightOnHover
                totalRecords={totalItems}
                recordsPerPage={pageSize}
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
            )}
          </div>
        </div>
      </div>
    </>
  )

}

export default Report