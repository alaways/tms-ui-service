import { useState, useEffect, useMemo, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useDispatch } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../../store/themeConfigSlice'
import { url_api } from '../../../../services/endpoints'
import { useGlobalMutation } from '../../../../helpers/globalApi'
import { payment_bu_csv, paymentMethod, toastAlert } from '../../../../helpers/constant'
import { PAGE_SIZES } from '../../../../helpers/config'
import { numberWithCommas } from '../../../../helpers/formatNumeric'
import { convertDateClientToDb, convertDateTimeDbToClient } from '../../../../helpers/formatDate'
import { Formik, Form } from 'formik'
import { DataTable } from 'mantine-datatable'
import Swal from 'sweetalert2'
import DatePicker from '../../../../components/HOC/DatePicker'
import SelectField from '../../../../components/HOC/SelectField'
import PreLoading from '../../../../helpers/preLoading';
import 'tippy.js/dist/tippy.css'
import { statusPaymentType } from '../../../../helpers/constant'
import InputField from '../../../../components/HOC/InputField'
import IconChecks from '../../../../components/Icon/IconChecks'
import Tippy from '@tippyjs/react'
import IconCashBanknotes from '../../../../components/Icon/IconCashBanknotes'
import { Dialog, Transition } from '@headlessui/react'
import IconX from '../../../../components/Icon/IconX'

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const searchFilterInitial: any = {
  start_at: '',
  end_at: '',
  id_business_unit: '',
}

const PaymentHistory = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const storedUser = localStorage.getItem(mode)
  const user = storedUser ? JSON.parse(storedUser) : null
  const apiUrl = process.env.BACKEND_URL
  const token = user ? user?.access_token : null
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [page, setPage] = useState(1)
  const [prevPageSize, setPrevPageSize] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [selectedPayment, setSelectedPayment] = useState<any>([])
  const [actionModal, setActionModal] = useState(false)

  const initFilter = {
    start_at: null,
    end_at: null,
    id_business_unit: user.id_business_unit,
    status: ''
  }
  const [statusData, setStatusData] = useState<any>()
  const [filterParams, setFilterParams] = useState<any>(initFilter)

  const businessUnit = [
    {
      value: user.id_business_unit,
      label: user.buName
    }
  ]

  const [paymentLists, setPaymentLists] = useState<any[]>([
  ])

  const { mutate: fetchPaymentData, isLoading } = useGlobalMutation(url_api.paymentFindAll, {
    onSuccess: (res: any) => {
      setPaymentLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch payment bu data')
    },
  })

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
    return fetch(apiUrl + url_api.paymentFindAll, requestOptions)
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
      const data: any = await fetchExportCsv(values)
      const worksheet = XLSX.utils.json_to_sheet(
        data.list.map((item: any, index: number) => {
          return {
            ...item,
            no: index + 1,
            contract_id: item.contract_reference,
            business_unit_name: item.business_unit_name,
            customer_name: item.customer_name,
            ins_no: item.ins_no,
            amount: item.amount,
            status: item.status === 'complete' ? 'สำเร็จ' : 'ค้างชำระ',
            channel: item.channel,
            payed_at: item.payed_at,
            payment_method: item.payment_method,
            reference: item.reference,
            tracking_fee: item.tracking_fee,
            unlock_fee: item.unlock_fee,
            penalty_fee: item.penalty_fee, 
            discount: item.discount,
            total: item.total
          }
        }),
        {
          header: payment_bu_csv.map((col: any) => col.id),
        }
      )

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      const headerDisplayNames = payment_bu_csv.map((col: any) => col.displayName)
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

  const onSubmit = (values: any) => {
    // if (values.start_at !== null || values.end_at !== null) {
    setPage(1)
    setFilterParams({
      ...values
    })
    fetchPaymentData({
      data: {
        ...values,
        page: 1,
        page_size: pageSize,
      },
    });
    // } else {
    //   toast.fire({
    //     icon: 'warning',
    //     title: 'กรุณาเลือกข้อมูลวันที่ให้ครบเพื่อค้นหา',
    //     padding: '10px 20px',
    //   })
    // }
  }

  useEffect(() => {
    const isPageSizeChanged = prevPageSize !== pageSize;
    // if (filterParams.start_at !== null || filterParams.end_at !== null) {
    fetchPaymentData({
      data: {
        ...filterParams,
        page: isPageSizeChanged ? 1 : page,
        page_size: pageSize,
      },
    })
    // }
    setPrevPageSize(pageSize);
  }, [page, pageSize])

  useEffect(() => {
    if (mode !== 'business_unit') {
      navigate('/')
    }
    dispatch(setPageTitle('การชำระเงิน'))
    dispatch(setSidebarActive(['finance', '/apps/finance/payment/business-unit']))
  }, [])

  const { mutate: fetchInquiryPaymentData } = useGlobalMutation(url_api.inquiryPayment, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        setStatusData(res.data)
      } else {
      }
    },
    onError: () => {
    },
  })



  const goPreview = (item: any) => {
    open('/apps/contract/' + item.contract_id + '/' + item.contract_uuid, '_blank')
  }

  const checkPayment = (item: any = null) => {
    fetchInquiryPaymentData({
      data: {
        refno: item.reference,
      },
    })
    setSelectedPayment(item)
    setActionModal(true)
  }

  const goPayment = (item: any = null) => {
    open('/apps/contract/payment/' + item.contract_id + '/' + item.contract_uuid + '/' + item.id_installment, '_blank')
  }

  const { mutate: resubmitPayment } = useGlobalMutation(url_api.paymentResubmit, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'ปรับปรุงข้อมูลสำเร็จ',
          padding: '10px 20px',
        })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
    onError: (err: any) => {
      toast.fire({
        icon: 'error',
        title: err.massage,
        padding: '10px 20px',
      })
    },
  })



  const totalAmount = useMemo(() => {
    return paymentLists.reduce((sum, item) => sum + item.amount, 0)
  }, [paymentLists])

  const totalToltal = useMemo(() => {
    return paymentLists.reduce((sum, item) => sum + item.total, 0)
  }, [paymentLists])

  const totalPenaltyFee = useMemo(() => {
    return paymentLists.reduce((sum, item) => sum + item.penalty_fee, 0)
  }, [paymentLists])


  const totalTrackingFee = useMemo(() => {
    return paymentLists.reduce((sum, item) => sum + item.tracking_fee, 0)
  }, [paymentLists])


  const totalUnlockFee = useMemo(() => {
    return paymentLists.reduce((sum, item) => sum + item.unlock_fee, 0)
  }, [paymentLists])

  const totalDiscount = useMemo(() => {
    return paymentLists.reduce((sum, item) => sum + item.discount, 0)
  }, [paymentLists])

  return (
    <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
      {(isLoading || isDownloading) && <PreLoading />}
      <div className="invoice-table">
        <div className="ml-7 my-5 text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">
          การชำระเงิน
        </div>
        <div className="mb-4.5 px-5 md:items-center md:flex-row flex-col gap-5">
          <Formik initialValues={filterParams}
            onSubmit={onSubmit}
            onReset={() => {
              setFilterParams(initFilter)
              setPage(1)
              setPaymentLists([])
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
                      placeholder='เลือกหน่วยธุรกิจ'
                      options={businessUnit}
                      disabled={true}
                    />

                  </div>
                  <div className="flex-1 z-10">
                    <SelectField
                      id='status'
                      label='สถานะการชำระเงิน'
                      name='status'
                      placeholder='กรุณาเลือก'
                      options={statusPaymentType}
                    />
                  </div>

                  <div className="flex-1 z-10">
                      <SelectField
                        id='payment_method'
                        label='ช่องทางชำระเงิน'
                        name='payment_method'
                        placeholder='กรุณาเลือก'
                        options={paymentMethod}
                      />
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
                  <InputField label="ค้นหา" placeholder="ค้นหา" name="query" type="text" />
                  <button type="submit" className="btn btn-primary gap-2 mt-5">
                    ค้นหา
                  </button>
                  <button type="reset" className="btn btn-info gap-2 mt-5" onClick={handleReset}>
                    ล้างค่า
                  </button>
                  <div className="flex flex-col pt-5">
                    <button type="button" className="btn btn-success gap-2 w-full h-[40px]" onClick={() => handleExport(`payment_history_${new Date().toLocaleString()}`, values)}>
                      Export
                    </button>
                  </div>
                </div>

              </Form>
            )}
          </Formik>
        </div>
        <div className="datatables pagination-padding">
          {paymentLists.length === 0 ? (
            <div className="text-center text-gray-500">ไม่พบข้อมูล</div>
          ) : (
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={[...paymentLists.map((item: any, index: number) => ({ ...item, key: index })), { id: 'total', amount: totalAmount, total: totalToltal, penalty_fee: totalPenaltyFee, tracking_fee: totalTrackingFee, unlock_fee: totalUnlockFee, discount: totalDiscount, isTotalRow: true, ins_no: 'ผลรวม' }]}
              columns={[
                {
                  accessor: 'id',
                  title: 'ลำดับ',
                  textAlignment: 'center',
                  sortable: false,
                  render: (row, index) => {
                    const isSummaryRow = row.isTotalRow;
                    return !isSummaryRow ? <div>{index + 1 + (page - 1) * pageSize}</div> : null;
                  },
                },
                {
                  accessor: 'contract_reference',
                  title: 'เลขที่สัญญา',
                  textAlignment: 'center',
                  sortable: true,
                  render: (item: any) =>
                    item.isTotalRow ? null : (
                      <div className="pointer active" onClick={() => goPreview(item)}>
                        {item.contract_reference}
                      </div>
                    ),
                },
                {
                  accessor: 'business_unit_name',
                  title: 'หน่วยธุรกิจ',
                  textAlignment: 'left',
                  sortable: false,
                  render: (item) => <div className="pointer">{item?.business_unit_name}</div>,
                },
                {
                  accessor: 'customer_name',
                  title: 'ชื่อลูกค้า',
                  textAlignment: 'left',
                  sortable: false,
                },
                {
                  accessor: 'payment_method',
                  title: 'ช่องทางชำระเงิน',
                  textAlignment: 'center',
                  sortable: false,
                },
                {
                  accessor: 'ins_no',
                  title: 'ชำระงวดที่',
                  textAlignment: 'center',
                  sortable: false,
                },
                {
                  accessor: 'amount',
                  title: 'ค่างวด',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ amount, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(amount)} {isTotalRow && 'บาท'}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'penalty_fee',
                  title: 'ค่าดำเนินการล่าช้า',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ penalty_fee, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(penalty_fee)} {isTotalRow && 'บาท'}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'tracking_fee',
                  title: 'ค่าติดตาม',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ tracking_fee, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(tracking_fee)} {isTotalRow && 'บาท'}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'unlock_fee',
                  title: 'ค่าปลดล็อค',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ unlock_fee, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(unlock_fee)} {isTotalRow && 'บาท'}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'discount',
                  title: 'ส่วนลด',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ discount, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(discount)} {isTotalRow && 'บาท'}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'total',
                  title: 'ยอดชำระ',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ total, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(total)} {isTotalRow && 'บาท'}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'status',
                  title: 'สถานะการชำระเงิน',
                  textAlignment: 'center',
                  sortable: false,
                  render: ({ status, isTotalRow }) =>
                    isTotalRow ? null : (
                      <div className="flex text-center justify-center font-normal">
                        <div
                          className={`badge ${status === 'complete' ? 'badge-outline-success' : status === 'pending' ? 'badge-outline-warning' : 'badge-outline-danger'}`}
                        >
                          {status === 'complete' ? 'สำเร็จ' : status === 'pending' ? 'รอชำระ' : 'ไม่สำเร็จ'}
                        </div>
                      </div>
                    ),
                },
                {
                  accessor: 'channel',
                  title: 'ช่องทาง',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <p>{item?.channel ?? '-'}</p>
                  ),
                },
                {
                  accessor: 'payed_at',
                  title: 'วันที่ชำระ',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ payed_at, isTotalRow }) =>
                    isTotalRow ? null : (
                      <div className="flex items-center justify-end font-normal">
                        <div>{payed_at !== '-' && payed_at !== null && payed_at !== '' ? convertDateTimeDbToClient(payed_at) : '-'}</div>
                      </div>
                    ),
                },
                {
                  accessor: 'reference',
                  title: 'เลขที่อ้างอิง',
                  textAlignment: 'left',
                  sortable: false,
                },
                {
                  accessor: 'action',
                  title: 'Actions',
                  sortable: false,
                  textAlignment: 'center',
                  render: (item) =>
                    item.isTotalRow ? null : (
                      <div className="flex gap-4 items-center w-max mx-auto">
                        <>
                          {
                            item?.payment_method === 'promptpay' && (<Tippy content="ตรวจสอบ promptpay" theme="Primary">
                              <div className="bg-[#E5E4E2] w-8 h-8 rounded-full flex items-center justify-center text-white">
                                <a className="flex cursor-pointer active" onClick={() => checkPayment(item)}>
                                  <IconChecks className="w-4.5 h-4.5" />
                                </a>
                              </div>
                            </Tippy>)
                          }
                          {item?.status === 'complete' && (
                            <Tippy content="ตรวจสอบยอดชำระเงิน" theme="Primary">
                              <div className="bg-[#E5E4E2] w-8 h-8 rounded-full flex items-center justify-center text-white">
                                <a className="flex cursor-pointer active" onClick={() => goPayment(item)}>
                                  <IconCashBanknotes className="w-4.5 h-4.5" />
                                </a>
                              </div>
                            </Tippy>
                          )}
                        </>
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
        <Transition appear show={actionModal} as={Fragment}>
          <Dialog as="div" open={actionModal} onClose={() => {
            setActionModal(false)
            setSelectedPayment([])
          }} className="relative z-[51]">
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
                      onClick={() => {
                        setStatusData({})
                        setActionModal(false)
                        setSelectedPayment([])
                      }}
                      className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                    >
                      <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">สถานะการชำระเงิน Paysolution</div>
                    <div className="p-5">
                      <div className="flex items-center justify-center">
                        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#d9f2e6] dark:bg-white/10">
                          <IconChecks className="w-10 h-10 " />
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="mb-5 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[#515365] font-semibold">จำนวนเงิน </p>
                            <span className="font-semibold ">{statusData?.Total !== null && statusData?.Total !== undefined ? `${statusData?.Total} บาท` : '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[#515365] font-semibold">สถานะ</p>
                            <p className="text-base">
                              <span className="font-semibold">
                                {statusData?.StatusName !== null && statusData?.StatusName !== undefined
                                  ? statusData?.StatusName === 'Paid'
                                    ? 'ชำระแล้ว'
                                    : 'ค้างชำระ'
                                  : '-'}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[#515365] font-semibold">วันที่ชำระเงิน</p>
                            <p className="text-base">
                              <span className="font-semibold ">
                                {statusData?.OrderDateTime !== null && statusData?.OrderDateTime !== undefined
                                  ? `${convertDateTimeDbToClient(statusData?.OrderDateTime)}`
                                  : '-'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-center px-2 flex justify-around">
                          <button type="button" className="btn btn-success" onClick={() => {
                            resubmitPayment({
                              data: {
                                id_contract: selectedPayment?.contract_uuid,
                                ins_no: selectedPayment?.ins_no,
                                refno: selectedPayment?.reference
                              }
                            })
                          }}>
                            ปรับปรุงข้อมูล
                          </button>
                        </div>
                      </div>
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

export default PaymentHistory