import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useDispatch } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { url_api } from '../../../services/endpoints'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { invoice_csv, toastAlert } from '../../../helpers/constant'
import { PAGE_SIZES } from '../../../helpers/config'
import { numberWithCommas } from '../../../helpers/formatNumeric'
import { convertDateTimeDbToClient, convertDateDbToClient, convertDateClientToDb } from '../../../helpers/formatDate'
import { Formik, Form } from 'formik'
import { DataTable } from 'mantine-datatable'
import Swal from 'sweetalert2'
import DatePicker from '../../../components/HOC/DatePicker'
import SelectField from '../../../components/HOC/SelectField'
import 'tippy.js/dist/tippy.css'
import PreLoading from '../../../helpers/preLoading';
import { statusPaymentType } from '../../../helpers/constant'
import InputField from '../../../components/HOC/InputField'

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const PaymentInvoice = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const apiUrl = process.env.BACKEND_URL

  const storedUser = localStorage.getItem(mode)
  const user = storedUser ? JSON.parse(storedUser) : null

  const role = user ? user?.role : null
  const token = user ? user?.access_token : null

  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const [page, setPage] = useState(1)
  const [prevPageSize, setPrevPageSize] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [businessUnit, setBusinessUnit] = useState<any>(mode === 'admin' ? [] : [
    {
      value: user.id_business_unit,
      label: user.buName
    }
  ])

  const [invoiceLists, setInvoiceLists] = useState<any[]>([])

  const initFilter = {
    start_at: null,
    end_at: null,
    id_business_unit: user?.id_business_unit || null,
    query: '',
    status: ''
  }
  const [filterParams, setFilterParams] = useState<any>(initFilter)


  const fetchExportCsv = async (values: any) => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${token}`)

    const raw = JSON.stringify({ ...values, page: 1, page_size: 50000, })
    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    }
    return fetch(apiUrl + url_api.invoiceFindAll, requestOptions)
      .then((response) => response.json())
      .then((result) => result.data)
      .catch((error) => {
        return []
      })
  }

  const handleExport = async (filename: any, values: any) => {
    if (!isDownloading) {
      setIsDownloading(true)
      if (values.start_at === null || values.end_at === null) {
        setIsDownloading(false)
        toast.fire({
          icon: 'warning',
          title: 'กรุณาเลือกข้อมูลวันที่ให้ครบเพื่อดาวน์โหลด',
          padding: '10px 20px',
        })
      }
      if (values.start_at === null || values.end_at === null) {
        setIsDownloading(false)
        toast.fire({
          icon: 'warning',
          title: 'กรุณาเลือกข้อมูลวันที่ให้ครบเพื่อดาวน์โหลด',
          padding: '10px 20px',
        })
      }
      const data: any = await fetchExportCsv(values)
      const worksheet = XLSX.utils.json_to_sheet(
        data.list.map((item: any, index: number) => {
          return {
            ...item,
            index: index + 1,
            date: convertDateDbToClient(item?.date),
            amount: numberWithCommas(item?.amount),
            payed_at: convertDateTimeDbToClient(item?.payed_at),
            status: item.status === 'complete' ? 'สำเร็จ' : item.status === 'pending' ? 'รอชำระ' : 'ยกเลิก',
          }
        }),
        {
          header: invoice_csv.map((col: any) => col.id),
        }
      )
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      const headerDisplayNames = invoice_csv.map((col: any) => col.displayName)
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

  const { mutate: fetchBusinessUnitData } = useGlobalMutation(url_api.businessUnitFindAll, {
    onSuccess: (res: any) => {
      setBusinessUnit(
        res.data.list.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      )
    },
    onError: () => {
      console.error('Failed to fetch bu data')
    },
  })


  const { mutate: fetchInvoiceData, isLoading } = useGlobalMutation(url_api.invoiceFindAll, {
    onSuccess: (res: any) => {
      setInvoiceLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch payment bu data')
    },
  })

  const onSubmit = (values: any) => {
    // if (values.start_at !== null || values.end_at !== null) {
    if (values.id_business_unit === null) {
      toast.fire({
        icon: 'warning',
        title: 'กรุณาเลือกหน่วยธุรกิจเพื่อค้นหา',
        padding: '10px 20px',
      })
    } else {
      setPage(1)
      setFilterParams({
        ...values
      })
      fetchInvoiceData({
        data: {
          ...values,
          page: 1,
          page_size: pageSize,
        },
      });
    }
    // } else {
    //   toast.fire({
    //     icon: 'warning',
    //     title: 'กรุณาเลือกข้อมูลวันที่ให้ครบเพื่อค้นหา',
    //     padding: '10px 20px',
    //   })
    // }
  }

  useEffect(() => {
    // if (filterParams.start_at !== null || filterParams.end_at !== null) {
    const isPageSizeChanged = prevPageSize !== pageSize;
    fetchInvoiceData({
      data: {
        ...filterParams,
        page: isPageSizeChanged ? 1 : page,
        page_size: pageSize,
      },
    });
    setPrevPageSize(pageSize);
    // }
  }, [page, pageSize]);

  useEffect(() => {
    if (mode !== 'admin' && mode !== 'business_unit') {
      navigate('/')
    }

    if (mode === 'admin') {
      fetchBusinessUnitData({
        data: {
          page: 1,
          page_size: -1,
        },
      })
    }
    dispatch(setPageTitle('ใบแจ้งหนี้'))
    dispatch(setSidebarActive(['finance', '/apps/finance/invoice']))

  }, [dispatch, mode, navigate])

  return (
    <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
      {(isLoading || isDownloading) && <PreLoading />}

      <div className="invoice-table">
        <div className="ml-7 my-5 text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">
          ใบแจ้งหนี้
        </div>
        <div className="mb-4.5 px-5 md:items-center md:flex-row flex-col gap-5">
          <Formik initialValues={filterParams}
            onSubmit={onSubmit}
            onReset={() => {
              setFilterParams(initFilter)
              setPage(1)
              setInvoiceLists([])
            }}
          >
            {({setFieldValue, handleReset, values }) => (
              <Form className="flex flex-col flex-auto gap-2">
                <div className='flex flex-col sm:flex-row md:flex-row gap-5'>
                  <div className="flex-1 z-10">
                    <SelectField
                      id='id_business_unit'
                      label='หน่วยธุรกิจ'
                      name='id_business_unit'
                      placeholder='เลือก หน่วยธุรกิจ'
                      options={businessUnit}
                      disabled={mode !== 'admin'}
                    />
                  </div>
                  <div className='flex-1 z-10'>
                    <SelectField
                      id='status'
                      label='สถานะการชำระเงิน'
                      name='status'
                      options={statusPaymentType}
                    />
                  </div>
                  <div className="flex-1">
                    <InputField label="ค้นหา" placeholder="ค้นหา" name="query" type="text" />
                  </div>
                </div>
                <div className='flex flex-col sm:flex-row md:flex-row gap-5'>

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
                  <button type="submit" className="btn btn-primary gap-2 mt-5">
                    ค้นหา
                  </button>
                  <button type="reset" className="btn btn-info gap-2 mt-5" onClick={handleReset}>
                    ล้างค่า
                  </button>
                  <div className="flex flex-col pt-5">
                    <button type="button" className="btn btn-success gap-2 w-full h-[40px]" onClick={() => handleExport(`invoice_history_${new Date().toLocaleString()}`, values)}>
                      Export
                    </button>
                  </div>
                </div>

              </Form>
            )}
          </Formik>
        </div>
        <div className="datatables pagination-padding">
          {invoiceLists.length === 0 ? (
            <div className="text-center text-gray-500">ไม่พบข้อมูล</div>
          ) : (
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={invoiceLists.map((item: any, index: number) => ({ ...item, key: index }))}
              columns={[
                {
                  accessor: 'index',
                  title: 'ลำดับ',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <p>{index + 1 + (page - 1) * pageSize}</p>
                  ),
                },
                {
                  accessor: 'id',
                  title: 'เลขที่',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <p>{item?.id ?? '-'}</p>
                  ),
                },
                {
                  accessor: 'invoice_date',
                  title: 'วันที่',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <p>{convertDateDbToClient(item?.invoice_date)}</p>
                  ),
                },
                {
                  accessor: 'invoice_type',
                  title: 'ประเภทใบแจ้งหนี้',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <p>{item?.invoice_type ?? '-'}</p>
                  ),
                },
                {
                  accessor: 'contract_reference',
                  title: 'สัญญาเลขที่',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <p>{item?.contract_reference ?? '-'}</p>
                  ),
                },
                {
                  accessor: 'ins_no',
                  title: 'งวดที่',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any) => (
                    <p>{item?.ins_no ?? ''}</p>
                  ),
                },
                {
                  accessor: 'amount',
                  title: 'จำนวนเงิน',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any) => (
                    <p>{numberWithCommas(item?.amount)}</p>
                  ),
                },
                {
                  accessor: 'payment_method',
                  title: 'ช่องทางชำระเงิน',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <p>{item?.payment_method ?? '-'}</p>
                  ),
                },
                {
                  accessor: 'payed_at',
                  title: 'วันที่ชำระเงิน',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <p>{convertDateTimeDbToClient(item?.payed_at)}</p>
                  ),
                },
                {
                  accessor: 'payment_reference',
                  title: 'เลขที่อ้างอิง',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any) => (
                    <p>{item?.payment_reference ?? '-'}</p>
                  ),
                },
                {
                  accessor: 'status',
                  title: 'สถานะชำระเงิน',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <div className="flex text-center justify-center font-normal">
                      <div className={`badge ${item.payment_status === 'complete' ? 'badge-outline-success' : item.payment_status === 'pending' ? 'badge-outline-warning' : 'badge-outline-danger'}`}>
                        {item.payment_status === 'complete' ? 'สำเร็จ' : item.payment_status === 'pending' ? 'รอชำระ' : 'ไม่สำเร็จ'}
                      </div>
                    </div>
                  ),
                },
              ]}
              highlightOnHover
              page={page}
              totalRecords={totalItems}
              recordsPerPage={pageSize}
              recordsPerPageOptions={PAGE_SIZES}
              onPageChange={(p) => setPage(p)}
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
  )

}

export default PaymentInvoice