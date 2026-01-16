
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
import Breadcrumbs from '../../../helpers/breadcrumbs'
import Swal from 'sweetalert2'
import DateRangeAntd from '../../../components/HOC/DateRangeAntd'
import SelectField from '../../../components/HOC/SelectField'
import { useTranslation } from 'react-i18next'

const toast = Swal.mixin(toastAlert)

const searchFilterInitial: any = {
  id_business_unit: '',
  start_at: '',
  end_at: '',
  contract_date:["",""]
}

const mode = process.env.MODE || 'admin'

const PayToShopPv = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const apiUrl = process.env.BACKEND_URL
  const storedUser = localStorage.getItem(mode)

  const role = storedUser ? JSON.parse(storedUser).role : null
  const token = storedUser ? JSON.parse(storedUser).access_token : null
  const userBuID = storedUser ? JSON.parse(storedUser).id_business_unit : null  

  // if (role != 'admin' && role != 'business_unit') { navigate('/') }

  const breadcrumbItems = [
    { to: '/', label: t('report') },
    { label: t('pay_to_shop_pv'), isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle(t('pay_to_shop_pv_report')))
    dispatch(setSidebarActive(['report', '/apps/report/pay-to-shop-pv']))
  })
  //

  const { mutate: fetchReportData,isLoading: isReportLoading } = useGlobalMutation(url_api.leasingReportPVFindAll, {
    onSuccess: (res: any) => {
        if(res.statusCode == 200){
          const totalInclude = res?.data?.list?.reduce((acc:any,cur:any) => {
            acc.amount += cur.amount || 0
            acc.commission += cur.commission || 0
            acc.down_payment += cur.down_payment || 0
            acc.fee += cur.fee || 0
            acc.price += cur.price || 0
            acc.principle += cur.principle || 0
            acc.total += cur.total || 0
            acc.benefit += cur.benefit || 0
            return acc
          },{amount:0,commission:0,down_payment:0,fee:0,price:0,principle:0,total:0,benefit:0})
          const newList = res?.data?.list?.concat({...totalInclude,isTotal:true})
          res?.data?.list?.length > 0 ? setReportLists(newList) : setReportLists([])
          setTotalItems(res?.data?.total)
        }
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const PAGE_SIZES = [10, 20, 30, 50, 100]
  const [shopList, setShopList] = useState<any>([]);
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [businessUnit, setBusinessUnit] = useState<any>([])
  const [reportLists, setReportLists] = useState<any[]>([])

  const [searchFilterValues, setSearchFilterValues] = useState(searchFilterInitial)
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: '',
    direction: 'asc',
  })

  const fetchData = (filters: any, currentPage: number, currentPageSize: number) => {
    setIsLoading(true)
    const buId = role === "business_unit" ?  userBuID : searchFilterValues.id_business_unit;
    fetchReportData({
      data: {
        page: currentPage,
        page_size: currentPageSize,
        start_at: filters.start_at,
        end_at: filters.end_at,
        id_business_unit: buId,
        id_shop:filters.id_shop,
        query: filters.query,
      },
    })
  }

  const { mutate: fetchBusinessUnit } = useGlobalMutation(url_api.contractFilter, {
    onSuccess: (res: any) => {
      setBusinessUnit(res?.data?.business_unit?.map((item: any) => ({
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

  const fetchExportCsv = async (values:any) => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${token}`)
    //  setIsDownloading(false)
    // return false

    const raw = JSON.stringify({
      id_business_unit: role === 'business_unit' ? userBuID : values.id_business_unit?.value.id ,
      page: 1,
      page_size: 50000,
      start_at: values.contract_date[0],
      end_at: values.contract_date[1],
      id_shop:values.id_shop,
    })
    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    }
    return fetch(apiUrl + '/admin/pv/leasing-report', requestOptions)
      .then((response) => response.json())
      .then((result) => result.data)
      .catch((error) => {
        // console.error(error)
        return []
      })
  }

  const handleExport = async (filename: any,values:any) => {
    if (!isDownloading) {
      setIsDownloading(true)
      const data: any = await fetchExportCsv(values)
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
      XLSX.utils.sheet_add_aoa(worksheet, [['ระหว่างวันที่', `${values.contract_date[0]} - ${values.contract_date[1]}`, '', '', '', '', '', '', '', '', '', '', '', 'จำนวนสัญญา', sumContract ]], { origin: 'A1' })
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

   const { mutate: fetchShopData } = useGlobalMutation(url_api.shopFindAll, {
        onSuccess: (res: any) => {
            setShopList(
                res?.data?.list?.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });

  useEffect(() => {
    if(role != 'admin') {
      fetchShopData({})
    }
    
  },[])
  useEffect(() => {
    
    if (searchFilterValues.id_business_unit === '') {
      fetchBusinessUnit({})
      return
    }

      fetchReportData({
        data: {
          page: page,
          page_size: pageSize,
          id_business_unit: searchFilterValues.id_business_unit,
          start_at: searchFilterValues.start_at,
          end_at: searchFilterValues.end_at,
          id_shop:searchFilterValues.id_shop,
        },
      })
  }, [page, pageSize])

      
   //   shop โดยดึง id_business มา
    const { mutate: buGetShop } = useGlobalMutation(url_api.buGetShop, {
        onSuccess: (res: any) => {
            const convert = res?.data?.map((item: any) => ({ value: item.uuid, label: item.name }));
            setShopList(convert);
        },
        onError: () => {},
    });


  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      {(isReportLoading || isDownloading) && <PreLoading />}
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-5">
        <div>
          <Formik initialValues={searchFilterValues} onSubmit={(values) => {
            const isBusiness =  role === 'business_unit' ? false : values.id_business_unit === "";

            if (values.contract_date[0] === "" || values.contract_date[1] === "" || isBusiness) {
              toast.fire({
                icon: 'warning',
                title: t('please_select_date_and_business_unit'),
                padding: '10px 20px',
              })
            } else {
              setIsLoading(true)
              setPage(1)
              updateFilterValues(values.contract_date[0], 'start_at')
              updateFilterValues(values.contract_date[1], 'end_at')
              updateFilterValues(values.id_shop, 'id_shop')
              fetchData({
                ...values,
                id_shop:values.id_shop,
                start_at: values.contract_date[0],
                end_at: values.contract_date[1],
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
                        buGetShop({ data: { id_business_unit: e.value.id } });
                      }}
                    />)}
                  </div>
                
                  <SelectField isSearchable={true} label={t('shop')} id="id_shop" name="id_shop" placeholder={t('select_shop')} options={shopList} zIndex='z-4'/>
                
                  <DateRangeAntd label={t('contract_date')} name="contract_date" />
                  {/* <DatePicker
                    label="วันอนุมัติสัญญา" // วันที่เริ่ม
                    name="start_at"
                    onChange={(date: any) => {
                      updateFilterValues(date, 'start_at')
                    }}
                  />
                  <DatePicker
                    label="ถึงวันที่" // วันที่อนุมัติสัญญา
                    name="end_at"
                    onChange={(date: any) => {
                      updateFilterValues(date, 'end_at')
                    }}
                  /> */}  
                                       
                  <div className='flex flex-col mt-1 pt-5'>
                    <button type="submit" className="btn btn-primary gap-2 w-full h-[40px]">
                      {t('search')}
                    </button>
                  </div>

                   <div className='flex flex-col mt-1 pt-5'>
                    <button type="reset" className="btn btn-info gap-2 w-full h-[40px]" onClick={() => {location.reload()}}>
                      {t('clear_values')}
                    </button>
                  </div>
                  <div className='flex flex-col mt-1 pt-5'>
                    
                    <button type="button" className="btn btn-success gap-2 w-full h-[40px]" onClick={() => { handleExport(`report_${new Date().toLocaleString()}`,values) }}>
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
            { mode === 'business_unit' && (
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
                      row.isTotal ? null : index + 1 + (page - 1) * pageSize
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
                          href={`/apps/report/pay-to-shop-pv/shop/${item.id_shop}?startDate=${searchFilterValues.start_at}&endDate=${searchFilterValues.end_at}&id_business_unit=${userBuID}`}
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
                      <p>{item.isTotal ? t('total_sum') :item.count_contract}</p>
                    ),
                  },
                  {
                    accessor: 'price',
                    title: t('total_selling_price'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.price.toLocaleString('en-US')} ${t('baht')}` : item.price.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'down_payment',
                    title: t('total_down_payment'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <div>{item.isTotal ? `${item.down_payment.toLocaleString('en-US')} ${t('baht')}` : item.down_payment.toLocaleString('en-US')}</div>
                    ),
                  },
                  {
                    accessor: 'principle',
                    title: t('total_lease_principal'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.principle.toLocaleString('en-US')} ${t('baht')}` : item.principle.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'commission',
                    title: t('total_commission'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.commission.toLocaleString('en-US')} ${t('baht')}` : item.commission.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'benefit',
                    title: t('special_benefit'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.benefit.toLocaleString('en-US')} ${t('baht')}` : item.benefit.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'amount',
                    title: t('total_amount'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.amount.toLocaleString('en-US')} ${t('baht')}` : item.amount.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'fee',
                    title: t('contract_fee'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.fee.toLocaleString('en-US')} ${t('baht')}`: (item.fee.toLocaleString('en-US') || "")}</p>
                    ),
                  },
                  {
                    accessor: 'total',
                    title: t('remaining_for_shop'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.total.toLocaleString('en-US')} ${t('baht')}`: item.total.toLocaleString('en-US')}</p>
                    ),
                  },
                ]}
                page={page}
                totalRecords={totalItems}
                recordsPerPage={pageSize}
                onPageChange={(p) => setPage(p)}
                recordsPerPageOptions={PAGE_SIZES}
                rowClassName={(item:any) =>
                    item.isTotal ? '!bg-black font-bold text-white' : ''
                }
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
            { mode !== 'business_unit' && (
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
                      row.isTotal ? null : index + 1 + (page - 1) * pageSize
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
                          href={`/apps/report/pay-to-shop-pv/shop/${item.id_shop}?startDate=${searchFilterValues.start_at}&endDate=${searchFilterValues.end_at}&id_business_unit=${searchFilterValues.id_business_unit}`}
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
                      <p>{item.isTotal ? t('total_sum') :item.count_contract}</p>
                    ),
                  },
                  {
                    accessor: 'price',
                    title: t('total_selling_price'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.price.toLocaleString('en-US')} ${t('baht')}` : item.price.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'down_payment',
                    title: t('total_down_payment'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <div>{item.isTotal ? `${item.down_payment.toLocaleString('en-US')} ${t('baht')}` : item.down_payment.toLocaleString('en-US')}</div>
                    ),
                  },
                  {
                    accessor: 'principle',
                    title: t('total_lease_principal'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.principle.toLocaleString('en-US')} ${t('baht')}` : item.principle.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'commission',
                    title: t('total_commission'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.commission.toLocaleString('en-US')} ${t('baht')}` : item.commission.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'benefit',
                    title: t('special_benefit'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.benefit.toLocaleString('en-US')} ${t('baht')}` : item.benefit.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'amount',
                    title: t('total_amount'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.amount.toLocaleString('en-US')} ${t('baht')}` : item.amount.toLocaleString('en-US')}</p>
                    ),
                  },
                  {
                    accessor: 'fee',
                    title: t('contract_fee'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.fee.toLocaleString('en-US')} ${t('baht')}`: (item.fee.toLocaleString('en-US') || "")}</p>
                    ),
                  },
                  {
                    accessor: 'total',
                    title: t('remaining_for_shop'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (item, index) => (
                      <p>{item.isTotal ? `${item.total.toLocaleString('en-US')} ${t('baht')}`: item.total.toLocaleString('en-US')}</p>
                    ),
                  },
                ]}
                page={page}
                totalRecords={totalItems}
                recordsPerPage={pageSize}
                onPageChange={(p) => setPage(p)}
                recordsPerPageOptions={PAGE_SIZES}
                onRecordsPerPageChange={(p) => {
                  setPage(1)
                  setPageSize(p)
                }}
                rowClassName={(item:any) =>
                    item.isTotal ? '!bg-white font-bold text-black' : ''
                }
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

export default PayToShopPv