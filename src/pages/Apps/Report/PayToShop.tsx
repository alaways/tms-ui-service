
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { Formik, Form } from 'formik'
import { DataTable, DataTableSortStatus } from 'mantine-datatable'
import { url_api } from '../../../services/endpoints'
import { useGlobalMutation } from '../../../helpers/globalApi'
import Select from 'react-select'
import DatePicker from '../../../components/HOC/DatePicker'
import PreLoading from '../../../helpers/preLoading';
import { useDispatch } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { report_csv, toastAlert } from '../../../helpers/constant'
import { convertDateClientToDb } from '../../../helpers/formatDate'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import Swal from 'sweetalert2'
import { useTranslation } from 'react-i18next'

const toast = Swal.mixin(toastAlert)
const searchFilterInitial: any = {
  id_business_unit: '',
  start_at: '',
  end_at: '',
}

const mode = process.env.MODE || 'admin'

const PayToShop = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const apiUrl = process.env.BACKEND_URL
  const storedUser = localStorage.getItem(mode)

  const role = storedUser ? JSON.parse(storedUser).role : null
  const token = storedUser ? JSON.parse(storedUser).access_token : null
  const id_business_unit = storedUser ? JSON.parse(storedUser).id_business_unit : null

  if (role != 'admin' && role != 'business_unit') { navigate('/') }

  const breadcrumbItems = [
    { to: '/', label: t('report') },
    { label: t('pay_to_shop'), isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle(t('pay_to_shop_report')))
    dispatch(setSidebarActive(['report', '/apps/report/pay-to-shop']))
  })

  const { mutate: fetchReportData, isLoading: isReportLoading } = useGlobalMutation(url_api.leasingReportFindAll, {
    onSuccess: (res: any) => {
      setReportLists(res?.data?.list)
      setTotalItems(res?.data?.total)
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const PAGE_SIZES = [10, 20, 30, 50, 100]

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [businessUnit, setBusinessUnit] = useState<any>([])
  const [reportLists, setReportLists] = useState<any[]>([])


  const [searchFilterValues, setSearchFilterValues] = useState({
    id_business_unit: role == 'business_unit'? +id_business_unit:'',
    start_at: '',
    end_at: '',
  })
  
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: '',
    direction: 'asc',
  })

  const fetchData = (filters: any, currentPage: number, currentPageSize: number) => {
    setIsLoading(true)
    const buId = role === "business_unit" ? businessUnit[0].value.id : searchFilterValues.id_business_unit;
    fetchReportData({
      data: {
        page: currentPage,
        page_size: currentPageSize,
        start_at: convertDateClientToDb(searchFilterValues.start_at),
        end_at: convertDateClientToDb(searchFilterValues.end_at),
        id_business_unit: buId,
        query: filters.query,
      },
    })
  }

  const { mutate: fetchBusinessUnit } = useGlobalMutation(url_api.contractFilter, {
    onSuccess: (res: any) => {
      setBusinessUnit(res.data.business_unit.map((item: any) => ({
        value: item,
        label: item.name,
      })))
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  const updateFilterValues = (newData: any, field: string) => {
    setSearchFilterValues((prevState: any) => ({
      ...prevState,
      [field]: newData,
    }))
  }

  const fetchExportCsv = async () => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${token}`)
    const raw = JSON.stringify({
      id_business_unit: searchFilterValues.id_business_unit,
      page: 1,
      page_size: 50000,
      start_at: convertDateClientToDb(searchFilterValues.start_at),
      end_at: convertDateClientToDb(searchFilterValues.end_at),
    })
    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    }
    return fetch(apiUrl + '/admin/leasing-report', requestOptions)
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
      const sumContract: any = data.list.reduce((currentCount: number, item: any) => (currentCount + item.count_contract), 0)
      data.list = [
        { "no": 0, "business_unit_name": "", "shop_name": "", "count_contract": 0, "price": 0, "down_payment": 0, "principle": 0, "commission": 0, "benefit": 0, "amount": 0, "fee": 0, "total": 0, "bank_name": "", "bank_account_name": "", "bank_account_number": "" },
        ...data.list
      ]
      const worksheet = XLSX.utils.json_to_sheet(
        data.list.map((item: any, index: number) => {
          return {
            no: index,
            business_unit_name: item.business_unit_name,
            shop_name: item.shop_name,
            count_contract: item.count_contract.toLocaleString('en-US'),
            price: item.price.toLocaleString('en-US'),
            down_payment: item.down_payment.toLocaleString('en-US'),
            principle: item.principle.toLocaleString('en-US'),
            commission: item.commission.toLocaleString('en-US'),
            benefit: item.benefit.toLocaleString('en-US'),
            amount: item.amount.toLocaleString('en-US'),
            fee: item.fee.toLocaleString('en-US'),
            total: item.total.toLocaleString('en-US'),
            bank_name: item?.bank_name || '-',
            bank_account_name: item?.bank_account_name || '-',
            bank_account_number: item?.bank_account_number || '-',
          }
        }), {
        header: report_csv.map((col: any) => col.id)
      })
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      const headerDisplayNames = report_csv.map((col: any) => col.displayName)
      XLSX.utils.sheet_add_aoa(worksheet, [['ระหว่างวันที่', `${convertDateClientToDb(searchFilterValues.start_at)} - ${convertDateClientToDb(searchFilterValues.end_at)}`, '', '', '', '', '', '', '', '', '', '', '', 'จำนวนสัญญา', sumContract]], { origin: 'A1' })
      XLSX.utils.sheet_add_aoa(worksheet, [headerDisplayNames], { origin: 'A2' })
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

  useEffect(() => {
    if (searchFilterValues.id_business_unit === ''|| searchFilterValues.start_at == '' || searchFilterValues.end_at == '') {
      fetchBusinessUnit({})
      return
    }
    fetchReportData({
      data: {
        page: page,
        page_size: pageSize,
        id_business_unit: searchFilterValues.id_business_unit,
        start_at: convertDateClientToDb(searchFilterValues.start_at),
        end_at: convertDateClientToDb(searchFilterValues.end_at),
      },
    })
  }, [page, pageSize])
  
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      {(isReportLoading || isDownloading) && <PreLoading />}
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-5">
        <div>
          <Formik initialValues={searchFilterValues} onSubmit={(values) => {
            const isBusiness = role === 'business_unit' ? false : values.id_business_unit === "";
            if (searchFilterValues.start_at === "" || searchFilterValues.end_at === "" || isBusiness) {
              toast.fire({
                icon: 'warning',
                title: t('please_select_date_and_business_unit'),
                padding: '10px 20px',
              })
            } else {
              setIsLoading(true)
              setPage(1)
              fetchData({
                ...values,
                start_at: convertDateClientToDb(searchFilterValues.start_at),
                end_at: convertDateClientToDb(searchFilterValues.end_at),
              }, 1, pageSize)
            }
          }}>
            {({ values, setFieldValue, resetForm }) => (
              <Form className="flex flex-col flex-auto gap-2">
                <div className="flex flex-col sm:flex-row md:flex-row gap-5 mb-5 px-5">
                  <div className='flex-1'>
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
                  <DatePicker
                    label={t('contract_approval_date')} // วันที่เริ่ม
                    name="start_at"
                    onChange={(date: any) => {
                      updateFilterValues(date, 'start_at')
                    }}
                  />
                  <DatePicker
                    label={t('to_date')} // วันที่อนุมัติสัญญา
                    name="end_at"
                    onChange={(date: any) => {
                      updateFilterValues(date, 'end_at')
                    }}
                  />
                  <div className='flex flex-col mt-1 pt-5'>
                    <button type="submit" className="btn btn-primary gap-2 w-full h-[40px]">
                      {t('search')}
                    </button>
                  </div>
                  <div className='flex flex-col mt-1 pt-5'>
                    <button type="button" className="btn btn-success gap-2 w-full h-[40px]" onClick={() => { handleExport(`report_${new Date().toLocaleString()}`) }}>
                      {t('export')}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div className="invoice-table px-5">
          <div className="datatables pagination-padding">
            {mode === 'business_unit' && (
              <DataTable
                className="whitespace-nowrap table-hover invoice-table"
                records={reportLists}
                columns={[
                  {
                    accessor: 'id',
                    title: t('sequence'),
                    textAlignment: 'center',
                    sortable: false,
                    render: (row, index) => (
                      index + 1 + (page - 1) * pageSize
                    ),
                  },
                  {
                    accessor: 'shop_name',
                    title: t('shop'),
                    textAlignment: 'left',
                    sortable: false,
                    render: (item) => (
                      <div className="flex items-center font-normal">
                        <a
                          className="flex cursor-pointer active"
                          href={`/apps/shop/report/${item.id_shop}?startDate=${convertDateClientToDb(searchFilterValues.start_at)}&endDate=${convertDateClientToDb(searchFilterValues.end_at)}&id_business_unit=${searchFilterValues.id_business_unit}`}
                          target="_blank"
                        >
                          <div>{item.shop_name}</div>
                        </a>
                      </div>
                    ),
                  },
                  {
                    accessor: 'count_contract',
                    title: t('contract_count'),
                    textAlignment: 'center',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.count_contract}</p>
                    ),
                  },
                  {
                    accessor: 'price',
                    title: t('total_selling_price'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.price.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'down_payment',
                    title: t('total_down_payment'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <div>{item.down_payment.toLocaleString('en-US')}</div>
                    ),
                  },
                  {
                    accessor: 'principle',
                    title: t('total_lease_principal'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.principle.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'commission',
                    title: t('total_commission'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.commission.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'benefit',
                    title: t('special_benefit'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.benefit.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'amount',
                    title: t('total_amount'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.amount.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'fee',
                    title: t('contract_fee'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item?.fee?.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'total',
                    title: t('remaining_for_shop'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.total.toLocaleString('en-US')}</p>
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
                  `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total')}`
                )}
              />
            )}
            {mode !== 'business_unit' && (
              <DataTable
                className="whitespace-nowrap table-hover invoice-table"
                records={reportLists}
                columns={[
                  {
                    accessor: 'id',
                    title: t('sequence'),
                    textAlignment: 'center',
                    sortable: false,
                    render: (row, index) => (
                      index + 1 + (page - 1) * pageSize
                    ),
                  },
                  {
                    accessor: 'business_unit_name',
                    title: t('business_unit'),
                    textAlignment: 'left',
                    sortable: false,
                    render: (item) => (
                      <p>{item.business_unit_name}</p>
                    ),
                  },
                  {
                    accessor: 'shop_name',
                    title: t('shop'),
                    textAlignment: 'left',
                    sortable: false,
                    render: (item) => (
                      <div className="flex items-center font-normal">
                        <a
                          className="flex cursor-pointer active"
                          href={`/apps/shop/report/${item.id_shop}?startDate=${convertDateClientToDb(searchFilterValues.start_at)}&endDate=${convertDateClientToDb(searchFilterValues.end_at)}&id_business_unit=${searchFilterValues.id_business_unit}`}
                          target="_blank"
                        >
                          <div>{item.shop_name}</div>
                        </a>
                      </div>
                    ),
                  },
                  {
                    accessor: 'count_contract',
                    title: t('contract_count'),
                    textAlignment: 'center',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.count_contract}</p>
                    ),
                  },
                  {
                    accessor: 'price',
                    title: t('total_selling_price'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.price.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'down_payment',
                    title: t('total_down_payment'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <div>{item.down_payment.toLocaleString('en-US')}</div>
                    ),
                  },
                  {
                    accessor: 'principle',
                    title: t('total_lease_principal'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.principle.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'commission',
                    title: t('total_commission'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.commission.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'benefit',
                    title: t('special_benefit'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.benefit.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'amount',
                    title: t('total_amount'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.amount.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'fee',
                    title: t('contract_fee'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.fee ? item.fee.toLocaleString('en-US') : ""}</p>
                    ),
                  },
                  {
                    accessor: 'total',
                    title: t('remaining_for_shop'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.total.toLocaleString('en-US')}</p>
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
                  `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total')}`
                )}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )

}

export default PayToShop