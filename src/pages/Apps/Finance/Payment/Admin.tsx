import { useState, useEffect, Fragment, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useDispatch } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../../store/themeConfigSlice'
import { url_api } from '../../../../services/endpoints'
import { useGlobalMutation, useGlobalPaymentMutation } from '../../../../helpers/globalApi'
import { payment_csv, paymentMethod, toastAlert } from '../../../../helpers/constant'
import { numberWithCommas } from '../../../../helpers/formatNumeric'
import { convertDateTimeDbToClient, convertDateClientToDb, toThaiDate } from '../../../../helpers/formatDate'
import { Formik, Form } from 'formik'
import { DataTable } from 'mantine-datatable'
import { Dialog, Transition } from '@headlessui/react'
import Swal from 'sweetalert2'
import Tippy from '@tippyjs/react'
import DatePicker from '../../../../components/HOC/DatePicker'
import InputField from '../../../../components/HOC/InputField'
import IconX from '../../../../components/Icon/IconX'
import IconChecks from '../../../../components/Icon/IconChecks'
import IconCashBanknotes from '../../../../components/Icon/IconCashBanknotes'
import PreLoading from '../../../../helpers/preLoading';
import SelectField from '../../../../components/HOC/SelectField'
import { PAGE_SIZES } from '../../../../helpers/config'
import { statusPaymentType } from '../../../../helpers/constant'
import 'tippy.js/dist/tippy.css'
import DateRangeAntd from '../../../../components/HOC/DateRangeAntd'
import IconEye from '../../../../components/Icon/IconEye'
import IconRefresh from '../../../../components/Icon/IconRefresh'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)
const deployMode = process.env.DEPLOY || 'dev'
interface Payment {
  id: string
  contract_id: string
  customer_name: string
  ins_no: string
  amount: number
  status: boolean
  payed_at: string
  reference: string
  refno: string
}

const PaymentHistory = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const apiUrl = process.env.BACKEND_URL

  const storedUser = localStorage.getItem(mode)
  const user = storedUser ? JSON.parse(storedUser) : null

  const role = user ? user?.role : null
  const token = user ? user?.access_token : null
  interface initFilter {
    start_at?:string | null
    end_at?:string | null
    id_business_unit?: number | null
    query?:string
    status?:string
    payment_method?:string | null
    status_code?:string | null
  }
  const initFilter:initFilter = {
    start_at: "",
    end_at: "",
    id_business_unit: null,
    query: '',
    status: '',
    payment_method:'',
    status_code:''
  }
  const [filterParams, setFilterParams] = useState<initFilter>(initFilter)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [status, setStatus] = useState<any>([]);

  const [actionModal, setActionModal] = useState(false)
  const [paymentLists, setPaymentLists] = useState<any[]>([])

  const [page, setPage] = useState(1)
  const [prevPageSize, setPrevPageSize] = useState(1)

  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [statusData, setStatusData] = useState<any>()
  const [businessUnit, setBusinessUnit] = useState<any>([])

  const [selectedPayment, setSelectedPayment] = useState<any>([])
  const fetchExportCsv = async (values: any) => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${token}`)
    const raw = JSON.stringify({
      ...values,
      page: 1,
      page_size: 50000,
    })
    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    }
    return fetch(apiUrl + url_api.paymentFindAll, requestOptions)
      .then((response) => response.json())
      .then((result) => result.data)
      .catch((error) => { return [] })
   }

   const { mutate: fetchContractGetStatus } = useGlobalMutation(url_api.contractFilter, {
        onSuccess: (res: any) => {
            setBusinessUnit(
                res.data.business_unit.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );
            setStatus(
                res.data.status
                    .map((item: any) => ({
                        value: item.status_code,
                        label: item.name,
                    }))
            );
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
  });

  useEffect(() => {
          fetchContractGetStatus({ data: { is_approved: true } });
  }, []);

  const handleExport = async (filename: any, values: any) => {
    if (!isDownloading) {
      setIsDownloading(true)
      const dataFilter:initFilter = {
        start_at:values.date_at ? values.date_at[0] : null,
        end_at:values.date_at ? values.date_at[1] : null,
        id_business_unit:values.id_business_unit,
        query:values.query,
        status:values.status,
        payment_method:values.payment_method,
        status_code:values.status_code
      }
      if (dataFilter.start_at === null || dataFilter.end_at === null) {
        setIsDownloading(false)
        toast.fire({
          icon: 'warning',
          title: t('please_select_date_download'),
          padding: '10px 20px',
        })
      }
      const data: any = await fetchExportCsv(dataFilter)
      const sumAmount: any = data.list.reduce((currentAmount: number, item: any) => {
        return item.amount + currentAmount
      }, 0)
      const worksheet = XLSX.utils.json_to_sheet(
        data.list.map((item: any, index: number) => {
          return {
            no: index + 1,
            contract_id: item.contract_reference,
            business_unit_name: item.business_unit_name,
            customer_name: item.customer_name,
            ins_no: item.ins_no,
            amount: item.amount,
            status: item.status === 'complete' ? t('finance_payment_status_success') : t('finance_payment_status_pending'),
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
          header: payment_csv.map((col: any) => col.id),
        }
      )
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      const headerDisplayNames = payment_csv.map((col: any) => col.displayName)
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

  const checkPayment = (item: any = null) => {

    if(item?.payment_method == 'tqr') {
      // todo
      const data = {
        "billerId" : item?.billerID,
        "transDate" : convertDateClientToDb(item?.created_at),
        "amount" : item?.total?.toFixed(2),
        "reference1" : item?.reference,
        "reference2" : `${item?.contract_reference}T${item?.ins_no}`
      }
      fetchInquiryTQR({data:data})
    } else {
      fetchInquiryPS({data: {refno: item.reference}})
    }

    setSelectedPayment(item)
    setActionModal(true)
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

  const { mutate: fetchPaymentData, isLoading } = useGlobalMutation(url_api.paymentFindAll, {
    onSuccess: (res: any) => {
      setPaymentLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  const { mutate: fetchInquiryPS } = useGlobalMutation(url_api.inquiryPayment, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        setStatusData({
          Total:res?.data?.Total,
          StatusName:res?.data?.StatusName,
          OrderDateTime:convertDateTimeDbToClient(res?.data?.OrderDateTime)
        })
      } else {
      }
    },
    onError: () => {
    },
  })

  const { mutate: fetchInquiryTQR } = useGlobalPaymentMutation ('/tqr/inquiry', {
    onSuccess: (res: any) => {
      if (res?.data?.amount) {
        setStatusData({
          Total:res?.data?.amount,
          StatusName:'Paid',
          OrderDateTime:`${toThaiDate(res?.data?.transDate)} ${res?.data?.transTime}`
        })
      } else {

      }
    },
    onError: () => {
    },
  })


  const goPayment = (item: any = null) => {
    open('/apps/contract/payment/' + item.contract_id + '/' + item.contract_uuid + '/' + item.id_installment, '_blank')
  }

  const goPreview = (item: any) => {
    open('/apps/contract/' + item.contract_id + '/' + item.contract_uuid, '_blank')
  }

  useEffect(() => {
    if (mode !== 'admin' && mode !== 'business_unit') {
      navigate('/')
    }
    dispatch(setPageTitle(t('payment_history')))
    dispatch(setSidebarActive(['finance', '/apps/finance/payment-history']))
    fetchBusinessUnitData({
      data: {
        page: 1,
        page_size: -1,
      },
    })
  }, [dispatch, role, navigate])


  const onSubmit = (values: any) => {
    if (values.id_business_unit === null) {
      toast.fire({
        icon: 'warning',
        title: t('please_select_business_unit'),
        padding: '10px 20px',
      })
    } else {
      setPage(1)
      const dataFilter:initFilter = {
        start_at:values.date_at ? values.date_at[0] : null,
        end_at:values.date_at ? values.date_at[1] : null,
        id_business_unit:values.id_business_unit,
        query:values.query,
        status:values.status,
        payment_method:values.payment_method,
        status_code:values.status_code
      }
      setFilterParams(dataFilter)
      fetchPaymentData({
        data: {
          ...dataFilter,
          page: 1,
          page_size: pageSize,
        },
      })
    }

  }


  useEffect(() => {
    if(filterParams?.id_business_unit) {
      fetchPaymentData({data:{...filterParams, page:1, page_size: pageSize}})
    }

  }, [pageSize])

  useEffect(() => {
    if(filterParams?.id_business_unit) {
      fetchPaymentData({data:{...filterParams,id_business_unit:filterParams?.id_business_unit, page:page, page_size: pageSize}})
    }
  }, [page])


  const { mutate: resubmitPayment } = useGlobalMutation(url_api.paymentResubmit, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('update_info_success'),
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
          {t('payment_history')}
        </div>
        <div className="mb-4.5 px-5 md:items-center md:flex-row flex-col gap-5">
          <Formik
            initialValues={filterParams}
            onSubmit={onSubmit}
            onReset={() => {
              setFilterParams({
                start_at: "",
                end_at: "",
                id_business_unit: null,
                query: '',
                status: '',
                payment_method:'',
                status_code: '',
              })
              setPage(1)
              setPaymentLists([])
            }}
          >
            {({ setFieldValue, handleReset, values }) => (
              <Form className="flex flex-col flex-auto gap-2">
                <div className='flex flex-col sm:flex-row md:flex-row gap-5'>
                  <div className="flex-1 z-10">
                    <SelectField
                      id='id_business_unit'
                      label={t('business_unit')}
                      name='id_business_unit'
                      placeholder={t('select_business_unit')}
                      options={businessUnit}
                    />
                  </div>
                  <div className="flex-1 z-10">
                    <SelectField
                      id='status'
                      label={t('payment_status')}
                      name='status'
                      placeholder={t('please_select')}
                      options={statusPaymentType}
                    />
                  </div>
                  <div className="flex-1 z-10">
                    <SelectField
                      id='payment_method'
                      label={t('payment_channel')}
                      name='payment_method'
                      placeholder={t('please_select')}
                      options={paymentMethod}
                    />
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row md:flex-row gap-5'>
                <SelectField id="status_code" label={t('operation_status')} name="status_code" placeholder={t('select_status')} options={status} isSearchable={true} />
                <DateRangeAntd label={t('payment_date')} name="date_at" />
                  {/* <DatePicker
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
                  /> */}
                  <InputField label={t('search')} placeholder={t('search')} name="query" type="text" />
                  <button type="submit" className="btn btn-primary gap-2 mt-5">
                    {t('search')}
                  </button>
                  <button
                    type="reset"
                    className="btn btn-info gap-2 mt-5"
                    onClick={() => {
                      handleReset()
                    }}
                  >
                    {t('clear_values')}
                  </button>
                  <div className="flex flex-col pt-5">
                    <button type="button" className="btn btn-success gap-2 w-full h-[40px]" onClick={() => handleExport(`payment_history_${new Date().toLocaleString()}`, values)}>
                      {t('export')}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div className="datatables pagination-padding">
          {paymentLists.length === 0 ? (
            <div className="text-center text-gray-500">{t('no_data')}</div>
          ) : (
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={[...paymentLists.map((item: any, index: number) => ({ ...item, key: index })), { id: 'total', amount: totalAmount, total: totalToltal, penalty_fee: totalPenaltyFee, tracking_fee: totalTrackingFee, unlock_fee: totalUnlockFee, discount: totalDiscount, isTotalRow: true, ins_no: t('total_sum') }]}
              columns={[
                {
                  accessor: 'id',
                  title: t('order_number'),
                  textAlignment: 'center',
                  sortable: false,
                  render: (row, index) => {
                    const isSummaryRow = row.isTotalRow;
                    return !isSummaryRow ? <div>{index + 1 + (page - 1) * pageSize}</div> : null;
                  },
                },
                {
                  accessor: 'credit_code',
                  title: t('operation_status'),
                  textAlignment: 'left',
                  sortable: false,
                },
                {
                  accessor: 'reference',
                  title: t('reference_number'),
                  textAlignment: 'left',
                  sortable: false,
                },
                {
                  accessor: 'contract_reference',
                  title: t('contract_number'),
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
                  title: t('business_unit'),
                  textAlignment: 'left',
                  sortable: false,
                  render: (item) => <div className="pointer">{item?.business_unit_name}</div>,
                },
                {
                  accessor: 'customer_name',
                  title: t('customer_name'),
                  textAlignment: 'left',
                  sortable: false,
                },
                {
                  accessor: 'payment_method',
                  title: t('payment_channel'),
                  textAlignment: 'center',
                  sortable: false,
                },
                {
                  accessor: 'ins_no',
                  title: t('installment_number'),
                  textAlignment: 'center',
                  sortable: false,
                },
                {
                  accessor: 'amount',
                  title: t('installment_fee'),
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ amount, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(amount)} {isTotalRow && t('baht')}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'penalty_fee',
                  title: t('late_fee'),
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ penalty_fee, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(penalty_fee)} {isTotalRow && t('baht')}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'tracking_fee',
                  title: t('tracking_fee'),
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ tracking_fee, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(tracking_fee)} {isTotalRow && t('baht')}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'unlock_fee',
                  title: t('unlock_fee'),
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ unlock_fee, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(unlock_fee)} {isTotalRow && t('baht')}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'discount',
                  title: t('discount'),
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ discount, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(discount)} {isTotalRow && t('baht')}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'total',
                  title: t('payment_amount'),
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ total, isTotalRow }) => (
                    <div className="flex items-center justify-end font-normal">
                      <div className={isTotalRow ? 'font-bold' : ''}>
                        {numberWithCommas(total)} {isTotalRow && t('baht')}
                      </div>
                    </div>
                  ),
                },
                {
                  accessor: 'status',
                  title: t('payment_status'),
                  textAlignment: 'center',
                  sortable: false,
                  render: ({ status, isTotalRow }) =>
                    isTotalRow ? null : (
                      <div className="flex text-center justify-center font-normal">
                        <div
                          className={`badge ${status === 'complete' ? 'badge-outline-success' : status === 'pending' ? 'badge-outline-warning' : 'badge-outline-danger'}`}
                        >
                          {status === 'complete' ? t('success') : status === 'pending' ? t('pending') : t('failed')}
                        </div>
                      </div>
                    ),
                },
                {
                  accessor: 'channel',
                  title: t('channel'),
                  textAlignment: 'center',
                  sortable: false,
                  render: (item: any, index: number) => (
                    <p>{item?.channel ?? '-'}</p>
                  ),
                },
                {
                  accessor: 'payed_at',
                  title: t('payment_date'),
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
                  accessor: 'created_at',
                  title: t('operation_date'),
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ created_at, isTotalRow }) =>
                    isTotalRow ? null : (
                      <div className="flex items-center justify-end font-normal">
                        <div>{created_at !== '-' && created_at !== null && created_at !== '' ? convertDateTimeDbToClient(created_at) : '-'}</div>
                      </div>
                    ),
                },
                {
                  accessor: 'action',
                  title: t('actions'),
                  sortable: false,
                  textAlignment: 'center',
                  render: (item) =>
                    item.isTotalRow ? null : (
                      <div className="flex gap-4 items-center w-max mx-auto">
                        <>
                          {
                            item?.payment_method != 'cash' && (
                              <div className="bg-[#E5E4E2] w-8 h-8 rounded-full flex items-center justify-center text-white">
                                <a className="flex cursor-pointer active" onClick={() => checkPayment(item)}>
                                  <IconRefresh className="w-4.5 h-4.5" />
                                </a>
                              </div>)
                          }
                          {item?.status === 'complete' && (
                              <div className="bg-[#E5E4E2] w-8 h-8 rounded-full flex items-center justify-center text-white">
                                <a className="flex cursor-pointer active" onClick={() => goPayment(item)}>
                                  <IconEye className="w-4.5 h-4.5" />
                                </a>
                              </div>
                          )}
                        </>
                      </div>
                    ),
                },
              ]}
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
                `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total_pages')}`
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
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{t('payment_status_label')}</div>
                    <div className="p-5">
                      <div className="flex items-center justify-center">
                        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#d9f2e6] dark:bg-white/10">
                          <IconChecks className="w-10 h-10 " />
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="mb-5 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[#515365] font-semibold">{t('amount_label')} </p>
                            <span className="font-semibold ">{statusData?.Total !== null && statusData?.Total !== undefined ? `${statusData?.Total} ${t('baht')}` : '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[#515365] font-semibold">{t('status_label')}</p>
                            <p className="text-base">
                              <span className="font-semibold">
                                {statusData?.StatusName !== null && statusData?.StatusName !== undefined
                                  ? statusData?.StatusName === 'Paid'
                                    ? t('paid')
                                    : t('unpaid')
                                  : '-'}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[#515365] font-semibold">{t('payment_date_label')}</p>
                            <p className="text-base">
                              <span className="font-semibold ">
                                {statusData?.OrderDateTime !== null && statusData?.OrderDateTime !== undefined
                                  ? statusData?.OrderDateTime
                                  : '-'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-center px-2 flex justify-around">
                          {statusData?.Total || deployMode == "dev" ?
                             <button type="button" className="btn btn-success" onClick={() => {

                              resubmitPayment({
                                data: {
                                  id_contract: selectedPayment?.contract_uuid,
                                  ins_no: selectedPayment?.ins_no,
                                  refno: selectedPayment?.reference
                                }
                              })
                            }}>
                            {t('update_info')}
                          </button>
                          :(
                            <button type="button" className="btn btn-success" disabled>
                              {t('update_info')}
                            </button>

                          )}

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
