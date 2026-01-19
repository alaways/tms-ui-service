import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { DataTable } from 'mantine-datatable'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { Formik, Form } from 'formik'
import Select from 'react-select'
import DateRangeAntd from '../../../components/HOC/DateRangeAntd'
import { Contract } from '../../../types/index'
import { PAGE_SIZES } from '../../../helpers/config'
import { url_api } from '../../../services/endpoints'
import { columns_csv } from '../../../helpers/constant'
import { useGlobalMutation } from '../../../helpers/globalApi'
import {convertDateDbToClient } from '../../../helpers/formatDate'
import IconPlus from '../../../components/Icon/IconPlus'
import InputField from '../../../components/HOC/InputField'
import IconOpenBook from '../../../components/Icon/IconOpenBook'
import { useGlobalChatMutation } from '../../../helpers/globalApi'
import PreLoading from '../../../helpers/preLoading'
import IconChecks from '../../../components/Icon/IconChecks'

const mode = process.env.MODE || 'admin'

const List = () => {

  const dispatch = useDispatch()
  const [firstLoading, setFirstLoading] = useState(false)
  useEffect(() => {
    setFirstLoading(true)
  }, [])
  useEffect(() => {
    dispatch(setPageTitle('รายการสัญญา'))
  }, [dispatch])

  const apiUrl = process.env.BACKEND_URL
  const storedUser = localStorage.getItem(mode)

  const role = storedUser ? JSON.parse(storedUser).role : null
  const token = storedUser ? JSON.parse(storedUser).access_token : null

  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [contractList, setContractList] = useState<Contract[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [status, setStatus] = useState<any>([])
  const [contractType, setContractType] = useState<any>([])

  const [businessUnit, setBusinessUnit] = useState<any>([])
  const [businessDashboard, setBusinessDashboard] = useState<any>({
    ct_status_1: 0, ct_status_2: 0, ct_status_3: 0, ct_status_4: 0,
  })

  const [filterParams, setFilterParams] = useState<any>({})
  const [contractUnread, setContractUnread] = useState<any>([])
  const { mutate: fetchContractData,isLoading:isLoadingContract } = useGlobalMutation(url_api.contractFindAll, {
    onSuccess: (res: any) => {
      setContractList(res.data.list)
      setTotalItems(res.data.total)
      getUnread({
        data: {
          contract_list: res.data?.ids,
        },
      })

      setBusinessDashboard({
        ct_status_1: res.data?.bu_dashboard?.ct_status_1 || 0,
        ct_status_2: res.data?.bu_dashboard?.ct_status_2 || 0,
        ct_status_3: res.data?.bu_dashboard?.ct_status_3 || 0,
        ct_status_4: res.data?.bu_dashboard?.ct_status_4 || 0,
      })
    },
    onError: () => {
      console.error('Failed to fetch contract data')
    },
  })

  const { mutate: getUnread } = useGlobalChatMutation('/chat/check-unread', {
    onSuccess: (res: any) => {
      setContractUnread(res?.data)
    },
  });


  const { mutate: fetchContractGetStatus } = useGlobalMutation(url_api.contractFilter, {
    onSuccess: (res: any) => {
      setBusinessUnit(
        res.data.business_unit.map((item: any) => ({
          value: item,
          label: item.name,
        }))
      )
      setStatus(
        res.data.status.map((item: any) => ({
          value: item,
          label: item.name,
        }))
      )
    },
    onError: () => {
      console.error('Failed to fetch status data')
    },
  })

  const { mutate: fetchContractType } = useGlobalMutation(url_api.contractTypeFindAll, {
    onSuccess: (res: any) => {
      setContractType(res.data.list.map((item: any) => ({
        value: item.id,
        label: item.name,
      })))
    },
    onError: () => {
      console.error('Failed to fetch contractType data')
    },
  })


  useEffect(() => {
    fetchContractData({
      data: {
        page: 1,
        page_size: pageSize,
        contract_hire_type_id: 2
      },
    })
  }, [pageSize])

  useEffect(() => {
    fetchContractGetStatus({})
    fetchContractType({})
  }, [])

  const goAdd = () => {
    open('/apps/contract-lease', '_blank');
  }

  const goEdit = (item: any) => {
    open('/apps/contract-lease/' + item.id + '/' + item.uuid, '_blank');
  }

  const fetchExportCsv = async () => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('Authorization', `Bearer ${token}`)
    const raw = JSON.stringify({...filterParams,page:1,page_size:999999,format:'excel',contract_hire_type_id: 2});
    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    }
    return fetch(apiUrl + url_api.contractFindAll, requestOptions)
      .then((response) => response.json())
      .then((result) => result.data)
      .catch((error) => {
        // console.error(error)
        return []
      })
  }

  const handleExport = async (filename: string, values: any) => {
    //
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
      link.setAttribute('download', `${filename}.xlsx`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    if (!firstLoading) return
    fetchContractData({
      data: {
        ...filterParams,
        page: page,
        page_size: pageSize,
        contract_hire_type_id: 2
      },
    })
  }, [page])

  const test = [
    { value: 'bu1', label: 'Business Unit 1' },
    { value: 'bu2', label: 'Business Unit 2' },
    { value: 'bu3', label: 'Business Unit 3' },
  ];


  return (
    <div className="panel !pt-2 px-0 border-white-light dark:border-[#1b2e4b]">
       {(isLoadingContract || isDownloading) && <PreLoading />}
      <div className="invoice-table">

        {role === "business_unit" ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[#ffffff] text-center px-5 pt-5">
          <div className="rounded col-span-1 md:col-span-1 p-4 bg-[#ff5f00]">
            <div className='text-base'>ร่างสัญญา</div>
            <div className='text-5xl'>{businessDashboard.ct_status_1}</div>
          </div>
          <div className="rounded col-span-1 md:col-span-1 p-4 bg-[#ff5f00]">
            <div className='text-base'>อยู่ระหว่างพิจารณา</div>
            <div className='text-5xl'>{businessDashboard.ct_status_2}</div>
          </div>
          <div className="rounded col-span-1 md:col-span-1 p-4 bg-[#ff5f00]">
            <div className='text-base'>อนุมัติร่างสัญญา</div>
            <div className='text-5xl'>{businessDashboard.ct_status_3}</div>

          </div>
          <div className="rounded col-span-1 md:col-span-1 p-4 bg-[#ff5f00]">
            <div className='text-base'>รออนุมัติ</div>
            <div className='text-5xl'>{businessDashboard.ct_status_4}</div>

          </div>
        </div> : ""}


        <div className="mb-4.5 mt-4 px-5 flex md:items-center md:flex-row flex-col gap-5">
          <div className="flex items-center gap-2">
            <button className="btn btn-primary gap-2" onClick={goAdd}>
              <IconPlus />
              เพิ่มสัญญาเช่าทรัพย์
            </button>
          </div>
        </div>
        <div className="flex w-full mb-4.5 px-5 md:items-center md:flex-row flex-col gap-5">
          <Formik
            initialValues={{
              start_at: '',
              end_at: '',
              contract_date: '',
              contract_end_date: '',
              // approved_at: '',
              search: '',
              query: '',
              status_code: '',
              status_type: '',
              id_business_unit: '',
              contract_type_id: '',
              is_locked: 'all'
            }}
            onSubmit={(values: any, { resetForm }) => {
              fetchContractData({
                data: {
                  start_at: '',
                  end_at: '',
                  query: values.search || '',
                  page: 1,
                  page_size: pageSize,
                  contract_date: values.contract_date[0],
                  contract_end_date: values.contract_date[1],
                  // contract_date: convertDateClientToDb(values?.contract_date[0] ? [values.contract_date[0]] : null),
                  // contract_end_date: convertDateClientToDb(values?.contract_date[1] ? [values.contract_date[1]] : null),
                  status_code: values.status_code?.value?.status_code || '',
                  status_type: values.status_type?.value?.status_type || 'contract',
                  id_business_unit: values.id_business_unit.value?.id || '',
                  contract_type_id: values.contract_type_id?.value,
                  is_locked: values.is_locked.value,
                  contract_hire_type_id: 2
                },
              })
              setFilterParams({
                start_at: '',
                end_at: '',
                query: values.search || '',
                page: 1,
                page_size: pageSize,
                contract_date: values.contract_date[0],
                contract_end_date: values.contract_date[1],
                // contract_date: convertDateClientToDb(values?.contract_date[0] ? [values.contract_date[0]] : null),
                // contract_end_date: convertDateClientToDb(values?.contract_date[1] ? [values.contract_date[1]] : null),
                status_code: values.status_code?.value?.status_code || '',
                status_type: values.status_type?.value?.status_type || 'contract',
                id_business_unit: values.id_business_unit.value?.id || '',
                contract_type_id: values.contract_type_id?.value,
                is_locked: values.is_locked.value
              })
              setPage(1)
            }}
            onReset={() => {
              fetchContractData({
                data: {
                  start_at: '',
                  end_at: '',
                  query: '',
                  page: 1,
                  page_size: pageSize,
                  contract_date: '',
                  contract_end_date: '',
                  is_locked: 'all',
                  contract_hire_type_id: 2
                  // approved_at: '',
                },
              })
              setFilterParams({
                start_at: '',
                end_at: '',
                query: '',
                page: 1,
                page_size: pageSize,
                contract_date: '',
                contract_end_date: '',
                approved_at: '',
                contract_type_id: '',
                is_locked: 'all'
              })
              setPage(1)
            }}
          >
            {({ setFieldValue, handleReset, values }) => (
              <Form className="flex flex-col flex-auto gap-2">
                <div className="flex flex-col sm:flex-row md:flex-row gap-5">
                  <div className="flex-1">
                    <label>หน่วยธุรกิจ</label>
                    {role === "business_unit" ? (<Select
                      defaultValue={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value.id }}
                      value={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value.id }}
                      placeholder="เลือก หน่วยธุรกิจ"
                      className="z-10 w-auto"
                      options={businessUnit.map((item: any) => ({ label: item.label, value: item.value.id }))}
                      isDisabled={true}
                    />) : (<Select
                      value={values.id_business_unit}
                      placeholder="เลือก หน่วยธุรกิจ"
                      className="z-10 w-auto"
                      options={businessUnit}
                      isSearchable={true}
                      onChange={(e: any) => {
                        setFieldValue('id_business_unit', e)
                      }}
                    />)}

                  </div>
                  <div className="z-10 flex-1">
                    <label>สถานะสัญญา</label>
                    <Select
                      value={values.status_code}
                      placeholder="เลือก สถานะสัญญา"
                      className="z-10 w-auto"
                      options={status}
                      isSearchable={true}
                      onChange={(e: any) => {
                        setFieldValue('status_code', e)
                        setFieldValue('status_type', e)
                      }}
                    />
                  </div>

                  <div className="z-10 flex-1">
                    <label>สถานะการล็อคเครื่อง</label>
                    <Select
                      value={values.is_locked}
                      placeholder="เลือก สถานะการล็อคเครื่อง"
                      className="z-10 w-auto"
                      options={[
                        {
                          value: 'all',
                          label: 'ทั้งหมด'
                        },
                        {
                          value: 'locked',
                          label: 'ล๊อคเครื่อง'
                        },
                        {
                          value: 'unlocked',
                          label: 'ปลดล๊อค'
                        }
                      ]}
                      isSearchable={true}
                      onChange={(e: any) => {
                        setFieldValue('is_locked', e)
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-row gap-5 pt-3">
                  <div className="flex-1">
                    <InputField label="ค้นหา" placeholder="ค้นหา" name="search" type="text" />
                  </div>
                  {/* <div className='flex-1'>
                    <DatePicker
                      label="วันที่ทำสัญญา"
                      isRange={true}
                      name="contract_date"
                      onChange={(value: any) => {
                        setFieldValue('contract_date', value)
                      }}
                    />
                  </div> */}
                  {/* <DatePicker
                    label="ถึงวันที่"
                    isRange={true}
                    name="contract_end_date"
                    // onChange={(value: any) => {
                    //   setFieldValue('contract_end_date', value)
                    // }}
                  /> */}
                  {/* <DatePicker
                    label="วันที่ทำสัญญา เริ่ม - ถึง"
                    isRange={true}
                    name="contract_date"
                  /> */}
                  {/* <SingleInputDateRangePicker label="วันที่ทำสัญญา" /> */}
                  <DateRangeAntd label="วันที่ทำสัญญา" name="contract_date"/>
                  <div className='flex-1'>
                    <label>ประเภทสัญญา</label>
                    <Select
                      value={values.contract_type_id}
                      placeholder="เลือกประเภทสัญญา"
                      className="z-9 w-auto"
                      options={contractType}
                      onChange={(e: any) => {
                        setFieldValue('contract_type_id', e)
                      }}
                    />
                  </div>
                  {/* <DatePicker
                    label="วันที่อนุมัติ"
                    name="approved_at"
                    onChange={(value: any) => {
                      setFieldValue('approved_at', value)
                    }}
                  /> */}
                  <div className="flex flex-col sm:flex-row md:flex-row gap-4 flex-1 justify-end items-end">
                    <button type="submit" className="btn btn-primary w-[100px] gap-2">
                      ค้นหา
                    </button>
                    <button type="reset" className="btn btn-info gap-2 w-[100px]" onClick={handleReset}>
                      ล้างค่า
                    </button>
                    {(role === 'admin' || role === 'business_unit') && (
                      <button type="button" className="btn btn-success gap-2 w-[100px]" onClick={() => { handleExport(`contract_${new Date().toLocaleString()}`, values) }}>
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
            <div className="my-10 text-center text-gray-500">ไม่พบข้อมูล</div>
          ) : (
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={contractList}
              columns={[
                {
                  accessor: 'index',
                  title: 'ลำดับ',
                  textAlignment: 'center',
                  render: (row, index) => (
                    index + 1 + (page - 1) * pageSize
                  ),
                },
                {
                  accessor: 'business_unit',
                  title: 'หน่วยธุรกิจ',
                  textAlignment: 'left',
                  sortable: false,
                  render: (item) => (
                    <div>
                      {item.business_unit.name}
                    </div>
                  ),
                },
                {
                  accessor: 'shop',
                  title: 'ร้านค้า',
                  textAlignment: 'left',
                  sortable: false,
                  render: (item) => (
                    <div>
                      {item.shop.name}
                    </div>
                  ),
                },
                {
                  accessor: 'id',
                  title: 'เลขสัญญา',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item) => {
                    type ContractUnread = {
                      id_contract: number;
                      unread: number;
                    };

                    const unreadStatus = contractUnread?.find((c: ContractUnread) => c.id_contract === item.id)?.unread;

                    return (
                      <div className="pointer flex items-center space-x-2 active" onClick={() => goEdit(item)}>
                        {/* Display read/unread circle */}
                        <span
                          className={`w-3 h-3 rounded-full ${unreadStatus > 0 ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                        ></span>
                        <span>{item.reference}</span>
                      </div>
                    );
                  },
                },
                {
                  accessor: 'contract_type',
                  title: 'ประเภทสัญญา',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item) => (
                    <div>
                      {item?.contract_type?.name}
                    </div>
                  ),
                },
                {
                  accessor: 'contract_date',
                  title: 'วันที่ทำสัญญา',
                  textAlignment: 'left',
                  sortable: false,
                  render: (item) => (
                    <div className="pointer">
                      {convertDateDbToClient(item?.contract_date) ?? '-'}
                    </div>
                  ),
                },
                {
                  accessor: 'customer',
                  title: 'ชื่อลูกค้า',
                  sortable: false,
                  render: (item) => (
                    <div>{item.customer.name}</div>
                  ),
                },
                {
                  accessor: 'price',
                  title: 'ราคาสินค้า',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ price }) => (
                    <div>
                      {price ? price.toLocaleString('en-US') : '-'}
                    </div>
                  ),
                },
                {
                  accessor: 'down_payment',
                  title: 'ชำระเงินดาวน์',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ down_payment }) => (
                    <div>
                      {down_payment ? down_payment.toLocaleString('en-US') : '-'}
                    </div>
                  ),
                },
                {
                  accessor: 'principle',
                  title: 'ทุนเช่าซื้อ',
                  textAlignment: 'right',
                  sortable: false,
                  render: ({ principle }) => (
                    <div>
                      {principle ? principle.toLocaleString('en-US') : '-'}
                    </div>
                  ),
                },
                {
                  accessor: 'ins_period',
                  title: 'จำนวนงวด',
                  textAlignment: 'center',
                  sortable: false,
                },
                {
                  accessor: 'status_id',
                  title: 'สถานะสัญญา',
                  sortable: false,
                  render: ({ status }: any) => (
                    <div>
                      {status.name}
                    </div>
                  ),
                },
                {
                    accessor: 'customer_signature_at',
                    title: 'ลงนามออนไลน์',
                    textAlignment: 'center',
                    sortable: false,
                    render: (item:any) => (
                        <span className={`${item?.customer_signature_at ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                            {item?.customer_signature_at ? <IconChecks className="w-6 h-6" /> : ''}
                        </span>
                    ),
                },
                {
                    accessor: 'e_contract_status',
                    title: 'ลงนาม Ekyc',
                    textAlignment: 'center',
                    sortable: false,
                    render: (item:any) => (
                        <span className={`${item?.e_contract_status ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                            {item?.e_contract_status ? <IconChecks className="w-6 h-6" /> : ''}
                        </span>
                    ),
                },
                {
                    accessor: 'recive_product_status',
                    title: 'ยืนยันรับสินค้า',
                    textAlignment: 'center',
                    sortable: false,
                    render: (item:any) => (
                        <span className={`${item?.recive_product_status ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                            {item?.recive_product_status ? <IconChecks className="w-6 h-6" /> : ''}
                        </span>
                    ),
                },
                {
                  accessor: 'action',
                  title: 'Actions',
                  sortable: false,
                  textAlignment: 'center',
                  render: (item) => (
                    <div className="flex gap-4 items-center w-max mx-auto">
                      <button className="flex cursor-pointer" onClick={() => goEdit(item)}>
                        <IconOpenBook className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ),
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
                `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`
              )}
            />
          )}
        </div>
      </div>
    </div>
  )

}

export default List