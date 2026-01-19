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

const toast = Swal.mixin(toastAlert)
const mode = process.env.MODE || 'admin'

const Report = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  const { id } = useParams()
  const id_business_unit = searchParams.get('id_business_unit') || ''

  const breadcrumbItems = [
    { to: '/apps/shop/list', label: 'ร้านค้า' },
    { label: 'รายงานค่าตอบแทน', isCurrent: true },
  ]

  const apiUrl = process.env.BACKEND_URL
  const storedUser = localStorage.getItem(mode)

  const role = storedUser ? JSON.parse(storedUser).role : null
  const token = storedUser ? JSON.parse(storedUser).access_token : null
  const id_bu = storedUser ? JSON.parse(storedUser)?.id_business_unit : null

  const dataStoredShop: any = useSelector((state: IRootState) => state.dataStore.shop)

  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const [shopData, setShopData] = useState<any>(null)
  const [businessUnit, setBusinessUnit] = useState<any>([])
  const [statusList, setStatusList] = useState<any>([
    {
      value : "all",
      label : "ทั้งหมด"
    },
    {
      value : "approved",
      label : "อนุมัติ"
    },
    {
      value : "cancel",
      label : "ยกเลิก"
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
      // if(role == 'business_unit'){
      //   setDefaultFormData((prev:any) => ({...prev,id_business_unit:res.data[0].id}))
      // }
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
            credit_code: item?.contract?.credit?.code,
            contract_date: convertDateDbToClient(item?.contract_date),
            approved_at: convertDateDbToClient(item?.contract_approved_date),
            asset_name: item?.asset?.name || '0',
            asset_price: numberWithCommas(item?.price || '0'),
            down_payment: numberWithCommas(item?.down_payment || '0'),
            principle: numberWithCommas(item?.principle || '0'),
            commission: numberWithCommas(item?.commission || '0'),
            benefit: numberWithCommas(item?.benefit || '0'),
            amount: numberWithCommas(item?.amount || '0'),
            fee: numberWithCommas(item?.fee || '0'),
            total: numberWithCommas(item?.total || '-'),
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
    dispatch(setPageTitle('รายการร้านค้า'))
  }, [dispatch])

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

  useEffect(() => {
    if(id_bu){
      setDefaultFormData((prev:any) => ({
        ...prev,
        id_business_unit: id_bu
      }))
    }
  },[id_bu])

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3">
        <div className="invoice-table">
          <div className="ml-10 mt-3 text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">
            ร้านค้า {shopData?.name || '-'}
          </div>
          <div className="p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6 mb-6 text-white">
              <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">
                    ทุนเช่าซื้อ
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
                    ค่านายหน้า
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
                    รวมเป็นเงิน
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
                    ค่าทำสัญญา
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
                    คงเหลือให้ร้านค้า
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
                      <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">ราคารวมผ่อน</div>
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
                    title: 'กรุณาเลือกข้อมูลวันที่ให้ครบเพื่อค้นหา',
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
                  console.log(values)
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
              {({values, setFieldValue, handleReset }) => (
                <Form className="flex items-center gap-2">
                  <DatePicker
                    label="วันที่เริ่ม"
                    name="start_at"
                    onChange={(value: any) => {
                      setFieldValue('start_at', convertDateClientToDb(value))
                    }}
                  />
                  <DatePicker
                    label="วันที่สิ้นสุด"
                    name="end_at"
                    onChange={(value: any) => {
                      setFieldValue('end_at', convertDateClientToDb(value))
                    }}
                  />
                  {role === "business_unit" ? (<div>
                    <label>หน่วยธุรกิจ</label>
                    <Select
                      // defaultValue={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value }}
                      // value={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value }}
                      placeholder="เลือก หน่วยธุรกิจ"
                      className="pr-1 z-10 w-[200px]"
                      options={businessUnit.map((item: any) => ({ label: item.label, value: item.value }))}
                      onChange={(e:any) => setFieldValue('id_business_unit',e.value)}
                      isDisabled={true}
                      name='id_business_unit'
                      id='id_business_unit'
                      value={
                        values.id_business_unit
                          ? businessUnit
                              .map((item: any) => ({
                                label: item.label,
                                value: item.value,
                              }))
                              .find((opt:any) => opt.value === values.id_business_unit)
                          : null
                      }
                    />
                  </div>) : (
                    <SelectField
                      id="id_business_unit"
                      name="id_business_unit"
                      label="หน่วยธุรกิจ"
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
                    label="สถานะสัญญา"
                    className="pr-1 z-10 w-[200px]"
                    options={statusList}
                    isSearchable={false}
                    onChange={(e: any) => {
                      setFieldValue('status', e.value)
                    }}
                  />
                  <button type="submit" className="btn btn-primary gap-2 mt-5" disabled={isLoading}>
                    {isLoading ? <Spinner size="sm" /> : <IconSearch />}
                    ค้นหา
                  </button>
                  <button type="reset" className="btn btn-info gap-2 mt-5" disabled={isLoading} onClick={handleReset}>
                    {isLoading ? <Spinner size="sm" /> : <IconRefresh />}
                    ล้างค่า
                  </button>
                  <div className="flex flex-col pt-5">
                    <button type="button" className="btn btn-success gap-2 w-full h-[40px]" onClick={() => handleExport(`shop_report_${new Date().toLocaleString()}`)}>
                      Export
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <div className="datatables pagination-padding">
            {commissionLists.length === 0 ? (
              <div className="text-center text-gray-500">ไม่พบข้อมูล</div>
            ) : (
              <DataTable
                className="whitespace-nowrap table-hover invoice-table"
                records={commissionLists}
                columns={[
                  {
                    accessor: 'id',
                    title: 'เลขที่สัญญา',
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
                    accessor: 'credit_id',
                    title: 'สถานะสัญญา',
                    textAlignment: 'center',
                    sortable: false,
                    render: (item) => (
                      <div className="flex justify-center text-center font-normal">
                        {item.contract.credit.code}
                      </div>
                    ),
                  },
                  {
                    accessor: 'contract_date',
                    title: 'วันที่ทำสัญญา',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return convertDateDbToClient(item?.contract_date)
                    },
                  },
                  {
                    accessor: 'approved_at',
                    title: 'วันที่อนุมัติสัญญา',
                    textAlignment: 'left',
                    sortable: false,
                    render: (item) => {
                      return convertDateDbToClient(item?.contract_approved_date)
                    },
                  },
                  {
                    accessor: 'contract_status',
                    title: 'สถานะสัญญา',
                    textAlignment: 'left',
                    sortable: false,
                    render: (item) => {
                      return item?.contract_status || '-'
                    },
                  },
                  {
                    accessor: 'asset.name',
                    title: 'ชื่อทรัพย์สิน',
                    textAlignment: 'left',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return item?.asset?.name || '0'
                    },
                  },
                  {
                    accessor: 'price',
                    title: 'ราคาขาย',
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.price || '0')
                    },
                  },
                  {
                    accessor: 'down_payment',
                    title: 'เงินดาวน์',
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.down_payment || '0')
                    },
                  },
                  {
                    accessor: 'principle',
                    title: 'ทุนเช่าซื้อ',
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.principle || '0')
                    },
                  },
                  {
                    accessor: 'commission',
                    title: 'ค่านายหน้า',
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.commission || '0')
                    },
                  },
                  {
                    accessor: 'benefit',
                    title: 'ผลตอบแทนพิเศษ',
                    textAlignment: 'right',
                    sortable: false,
                    render: (item) => {
                      return numberWithCommas(item?.benefit || '0')
                    },
                  },
                  {
                    accessor: 'amount',
                    title: 'รวมเป็นเงิน',
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.amount || '0')
                    },
                  },
                  {
                    accessor: 'fee',
                    title: 'ค่าทำสัญญา',
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.fee || '0')
                    },
                  },
                  {
                    accessor: 'total',
                    title: 'คงเหลือให้ร้านค้า',
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.total || '-')
                    },
                  },
                  {
                    accessor: 'total',
                    title: 'ราคารวมผ่อน',
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
                  `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`
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