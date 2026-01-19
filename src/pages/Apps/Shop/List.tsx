import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { setShop } from '../../../store/dataStore'
import { setPageAction } from '../../../store/pageStore'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { formatIDNumber, formatPhoneNumber } from '../../../helpers/formatNumeric'
import { Shop } from '../../../types/index'
import { DataTable } from 'mantine-datatable'
import Tippy from '@tippyjs/react'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEye from '../../../components/Icon/IconEye'
import IconDollarSignCircle from '../../../components/Icon/IconDollarSignCircle'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import 'tippy.js/dist/tippy.css'
import Swal from 'sweetalert2';
import { toastAlert } from '../../../helpers/constant';
import { Field, Form, Formik, FormikProps } from 'formik';
import Select from 'react-select'
import { IRootState } from '../../../store'
import * as XLSX from 'xlsx'
import PreLoading from '../../../helpers/preLoading'
import themeInit from '../../../theme.init'
import { PAGE_SIZES } from '../../../helpers/config'
const mode = process.env.MODE || 'admin'

const List = () => {
  const toast = Swal.mixin(toastAlert);
  const [selectedRecords, setSelectedRecords] = useState<Shop[]>([]);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const dataStoredProvinces = useSelector((state: IRootState) => state.dataStore.provinces)

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  const token = storedUser ? JSON.parse(storedUser).access_token : null
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [shopLists, setShopLists] = useState<Shop[]>([])
  const [firstLoading, setFirstLoading] = useState(false)
  useEffect(() => {
    setFirstLoading(true)
  }, [])
  type filterParams = {
    id_province?: any;
    query?: string;
  };

  const [filter, setFilter] = useState<filterParams>({})
  const { mutate: fetchShopData } = useGlobalMutation(url_api.shopFindAll, {
    onSuccess: (res: any) => {
      setShopLists(res.data.list)
      setTotalItems(res.data.total)
      setSelectedRecords(res.data.list.filter((a: any) => a.is_create_customer))
    },
    onError: (error: any) => {

    },
  })

  const { mutate: updateShopCreateCustomer } = useGlobalMutation(url_api.updateCreateCustomer, {
    onSuccess: (res: any) => {
      if (res.statusCode !== 400) {
        fetchShopData({
          data: {
            page: 1,
            page_size: pageSize,
          },
        })
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        });
      } else {
        toast.fire({
          icon: 'warning',
          title: res.message,
          padding: '10px 20px',
        });
      }
    },
    onError: (error: any) => {
      toast.fire({
        icon: 'warning',
        title: error.message,
        padding: '10px 20px',
      });
    },
  })

  const goPreview = (item: any) => {
    dispatch(setShop(item))
    dispatch(setPageAction('preview'))
    navigate('/apps/shop/edit/' + item.id)
  }

  const goReport = (item: any) => {
    dispatch(setShop(item))
    navigate('/apps/shop/report/' + item.id)
  }

  useEffect(() => {
    dispatch(setPageTitle('รายการร้านค้า'))
    if (mode !== 'admin' && mode !== 'business_unit') {
      navigate('/')
    }
  }, [])
  useEffect(() => {
    dispatch(setPageTitle('รายการลูกค้า'))
    fetchShopData({data: {page:1, page_size: pageSize}})
   
  }, [])

  useEffect(() => {
    if (!firstLoading) return
    setPage(page)
    setShopLists([])
    fetchShopData({
      data: {
        ...filter,
        page: page,
        page_size: pageSize,
      },
    })
  }, [page])

  useEffect(() => {
    if (!firstLoading) return
    fetchShopData({
      data: {
        ...filter,
        page: 1,
        page_size: pageSize,
      },
    })
  }, [pageSize])
  const handelUpdateCreateCustomer = () => {

    Swal.fire({
      title: 'ยืนยันการอัพเดทสถานะ',
      text: 'คุณต้องการอัพเดทใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: themeInit.color.themePrimary,
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const param = shopLists.map((item) => ({
          id_shop: item.id,
          is_create_customer: selectedRecords.some(item2 => item.id === item2.id)
        }))

        updateShopCreateCustomer({
          data: {
            shops: param
          }
        })

      }
    });
  }


 const columns_csv = [
    {
      id: 'uuid',
      displayName: 'uuid',
    },
  ]
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const apiUrl = process.env.BACKEND_URL
  const fetchExportCsv = async () => {
      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')
      myHeaders.append('Authorization', `Bearer ${token}`)
      const raw = JSON.stringify({ ...filter,id_province:filter?.id_province?.value ?? null })
      const requestOptions: any = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      }
      return fetch(apiUrl + url_api.shopExport, requestOptions)
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
        
        // Filter out uuid from each item
        const cleanedList = data?.list?.map(({ uuid, province, ...rest }: any) => ({
          ...rest,
          province: province?.name_th || '', // fix province
        }));

        // Filter out uuid column from columns_csv
        const filteredColumns = columns_csv.filter((col) => col.id !== 'uuid');

        const worksheet = XLSX.utils.json_to_sheet(cleanedList, {
          header: filteredColumns.map((col) => col.id),
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const headerDisplayNames = filteredColumns.map((col) => col.displayName);
        XLSX.utils.sheet_add_aoa(worksheet, [headerDisplayNames], { origin: 'A1' });

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename + '.xlsx');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false)
     }
    }
  
  return (
    <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
      {(isDownloading) && <PreLoading />}
      <div className="invoice-table ">
        <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
          <div className="flex items-center gap-2">
            <Link to="/apps/shop/add" className="btn btn-primary gap-2">
              <IconPlus />
              เพิ่มร้านค้า
            </Link>
            <button type='button' className="btn btn-success gap-2" onClick={() => { handelUpdateCreateCustomer() }}>
              เปิด/ปิด การสร้างลูกค้าใหม่
            </button>
          </div>
          <div className="ml-auto">
            <Formik initialValues={{ id_province: '', query: ''}}
              onSubmit={(values: any) => {
                setPage(1)
                const filterData = {
                  page:1,
                  page_size: pageSize,
                  id_province:values?.id_province?.value || null,
                  query:values.query
                }
                fetchShopData({data:filterData })
                setFilter({...filterData})
              }}>
              {({ setFieldValue, handleReset, values }) => (
                <Form>
                  <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex flex-row gap-3" style={{zIndex:9999}}>

                    {(role === 'admin' || role === 'business_unit') && (
                     <Select
                        id="id_province"
                        name="id_province"
                        value={values.id_province}
                        placeholder="จังหวัด"
                        className="z-10 w-[200px] dropdown-custom"
                        options={dataStoredProvinces}
                        isSearchable={true}
                        onChange={(e: any) => {
                          setFieldValue('id_province', e)
                        }}
                      />
                    )}
                    
                      <div className="relative">
                        <input type="text"
                          id="query"
                          name="query"
                          placeholder="ค้นหา"
                          className="form-input py-2 ltr:pr-11 rtl:pl-11 peer"
                          value={values.query}
                          onChange={(e) => {
                            setFieldValue('query', e.target.value);
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <button type="submit" className="btn btn-primary w-[100px] gap-2">  ค้นหา  </button>
                      </div>
                     
                      <button
                          type="reset"
                          className="btn btn-info gap-2 w-[100px]"
                          onClick={() => {
                            // const resetValues:filterParams = {
                            //   id_province:'',
                            //   query:'',
                            // }
                            // setPage(1)
                            // setFilter({...resetValues})
                            // fetchShopData({data: {page:1, page_size: pageSize,...resetValues}})
                            location.reload();
                          }}
                        >
                          ล้างค่า
                        </button>
                        {(role === 'admin' || role === 'business_unit') && (
                        <button type="button" className="btn btn-success gap-2 w-[100px]" onClick={() => { handleExport(`contract_${new Date().toLocaleString()}`) }}>
                          Export
                        </button>
                      )}   
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
            records={shopLists}
            columns={[
              {
                accessor: 'index',
                title: 'ลำดับ',
                textAlignment: 'center',
                render: (row, index) => (
                  index + 1 + (page - 1) * pageSize
                )
              },
              {
                accessor: 'name',
                title: 'ชื่อร้านค้า',
                textAlignment: 'left',
                sortable: false,
                render: (item) => (
                  <div className="flex items-center font-normal">
                    <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                      {item.name}
                    </a>
                  </div>
                ),
              },
              {
                accessor: 'phone_number',
                title: 'เบอร์โทรศัพท์ร้านค้า',
                textAlignment: 'left',
                sortable: false,
                render: ({ phone_number }) => (
                  formatPhoneNumber(phone_number) ?? '-'
                ),
              },
              {
                accessor: 'line_id',
                title: 'Line ID',
                textAlignment: 'left',
                sortable: false,
                render: ({ line_id }) => (
                  line_id || '-'
                ),
              },
              {
                accessor: 'tax_id',
                title: 'เลขประจำตัวผู้เสียภาษี',
                textAlignment: 'left',
                sortable: false,
                render: ({ tax_id }) => (
                  formatIDNumber(tax_id) ?? '-'
                ),
              },
              {
                accessor: 'province',
                title: 'ที่อยู่',
                textAlignment: 'left',
                sortable: false,
                render: ({ province }) => province?.name_th || '-',
              },
              {
                accessor: 'is_active',
                title: 'การสร้างลูกค้า',
                textAlignment: 'center',
                sortable: false,
                render: ({ is_create_customer }) => (
                  <span className={`badge ${is_create_customer ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {is_create_customer ? 'เปิดการสร้างลูกค้า' : 'ปิดการสร้างลูกค้า'}
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
                    <Tippy content="ดูข้อมูล" theme="Primary">
                      <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                        <IconEye />
                      </a>
                    </Tippy>
                    <Tippy content="รายงานค่าตอบแทน" theme="Primary">
                      <a className="flex  cursor-pointer active" onClick={() => goReport(item)}>
                        <IconDollarSignCircle />
                      </a>
                    </Tippy>
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
            selectedRecords={selectedRecords}
            onSelectedRecordsChange={setSelectedRecords}
          />
        </div>
      </div>
    </div>
  )

}

export default List