import { useState, useEffect, useCallback, Fragment, useMemo } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useBusinessUnitFindAllMutation } from '../../../services/mutations/useBusinessUnitMutation'
import IconSearch from '../../../components/Icon/IconSearch'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { BusinessUnits } from '../../../types/index'
import IconEdit from '../../../components/Icon/IconEdit'
import { setBusinessUnits, setShopGroupBuConfig } from '../../../store/dataStore'
import 'tippy.js/dist/tippy.css'
import Tippy from '@tippyjs/react'
import IconPlus from '../../../components/Icon/IconPlus'
import IconSettings from '../../../components/Icon/IconSettings'
import IconEye from '../../../components/Icon/IconEye'
import { showNotification } from '../../../helpers/showNotification'
import { DataTable, DataTableSortStatus } from 'mantine-datatable'
import { PAGE_SIZES } from '../../../helpers/config'
import { formatIDNumber, formatPhoneNumber } from '../../../helpers/formatNumeric'

const mode = process.env.MODE || 'admin'

const List = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  if (role !== 'admin' && role !== 'business_unit') {
    navigate('/')
  }

  if(role === 'business_unit') {
    const id_business_unit = storedUser ? JSON.parse(storedUser ?? '{}').id_business_unit : null
    navigate('/apps/business-unit/preview/' + id_business_unit)
  }

  const [search, setSearch] = useState('')
  const [filteredItems, setFilteredItems] = useState<BusinessUnits[]>([])

  const PAGE_SIZES = [10, 20, 30, 50, 100]

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: '',
    direction: 'asc',
  })

  const [loadedRows, setLoadedRows] = useState(9999)
  const [totalItems, setTotalItems] = useState<number>(0)

  const [itemList, setitemList] = useState<BusinessUnits[]>([])

  useEffect(() => {
    dispatch(setPageTitle('รายการหน่วยธุรกิจ'))
    dispatch(setSidebarActive(['bu', '/apps/business-unit/list']))
  }, [])

  const { mutate: fetchBusinessUnitData, isLoading: isBusinessUnitLoading } = useBusinessUnitFindAllMutation({
    onSuccess: (res: any) => {
      setitemList(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      showErrorMessage('Failed to fetch business units')
    },
  })

  useEffect(() => {
    setitemList([])
    fetchBusinessUnitData({
      data: {
        page: page,
        page_size: pageSize,
        query: search,
      },
    })
  }, [page])

  useEffect(() => {
    setPage(1)
    fetchBusinessUnitData({
      data: {
        page: 1,
        page_size: pageSize,
        query: search,
      },
    })
  }, [pageSize])

  const debouncedFetchData = useMemo(
    () =>
      debounce((searchValue) => {
        fetchBusinessUnitData({
          data: {
            page: 1,
            page_size: pageSize,
            query: searchValue,
          },
        })
      }, 500),
    [fetchBusinessUnitData, pageSize]
  )
  useEffect(() => {
    debouncedFetchData(search)
    return () => {
      debouncedFetchData.cancel()
    }
  }, [search, debouncedFetchData])

  const showErrorMessage = (message: string) => {
    showNotification(message, 'error')
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1)
    setSearch(e.target.value)
  }

  const goPreview = (item: any) => {
    dispatch(setBusinessUnits(item))
    navigate('/apps/business-unit/preview/' + item.id)
  }
  // const goShopInterestRate = (item: any) => {
  //   dispatch(setShopGroupBuConfig(item))
  //   navigate('/apps/shop-group/shop-bu-interestrate/' + item.id)
  // }

  // const goEditPreview = (item: any) => {
  //   dispatch(setBusinessUnits(item))
  //   navigate('/apps/business-unit/edit/' + item.id)
  // }

  return (
      <div>
          <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
                  <h2 className="text-xl">หน่วยธุรกิจ</h2>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
                  <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                      <div className="flex gap-3">
                          <Link to="/apps/business-unit/add" className="btn btn-primary gap-2">
                              <IconPlus />
                              เพิ่มหน่วยธุรกิจ
                          </Link>
                      </div>
                  </div>
                  <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                      <div className="relative">
                          <input type="text" placeholder="ค้นหา" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={handleSearch} />
                          <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                              <IconSearch className="mx-auto" />
                          </button>
                      </div>
                  </div>
              </div>

              <div className="datatables pagination-padding">
                  <DataTable
                      className="whitespace-nowrap table-hover invoice-table"
                      records={itemList}
                      columns={[
                          {
                              accessor: 'index',
                              title: 'ลำดับ',
                              textAlignment: 'center',
                              render: (row, index) => index + 1 + (page - 1) * pageSize,
                          },
                          {
                              accessor: 'name',
                              title: 'ชื่อธุรกิจ',
                              textAlignment: 'left',
                              sortable: false,
                              render: (item) => (
                                  <div className="flex items-center font-normal">
                                      <a className="active" onClick={() => goPreview(item)}>
                                          {item?.name}
                                      </a>
                                  </div>
                              ),
                          },
                          {
                              accessor: 'tax_id',
                              title: 'เลขประจำตัวผู้เสียภาษี',
                              textAlignment: 'left',
                              sortable: false,
                              render: ({ tax_id }) => (
                                  <div className="flex items-center font-normal">
                                      <div>{formatIDNumber(tax_id ?? '-')}</div>
                                  </div>
                              ),
                          },
                          {
                              accessor: 'phone',
                              title: 'เบอร์โทรศัพท์ลูกค้า',
                              textAlignment: 'left',
                              sortable: false,
                              render: ({ phone }) => (
                                  <div className="flex items-center font-normal">
                                      <div>{formatPhoneNumber(phone ?? '-')}</div>
                                  </div>
                              ),
                          },
                          {
                              accessor: 'province',
                              title: 'ที่อยู่',
                              textAlignment: 'left',
                              sortable: false,
                              render: ({ province }) => (
                                  <div className="flex items-center font-normal">
                                      <div>{province?.name_th}</div>
                                  </div>
                              ),
                          },
                          {
                              accessor: 'verify',
                              title: 'ตั้งค่า',
                              textAlignment: 'center',
                              sortable: false,
                              render: (verify) => <span className={`badge ${verify ? 'badge-outline-success' : 'badge-outline-danger'}`}>{verify ? 'เสร็จสิ้น' : 'ข้อมูลไม่ครบ'}</span>,
                          },

                          {
                              accessor: 'action',
                              title: 'Actions',
                              textAlignment: 'center',
                              sortable: false,
                              render: (item) => (
                                  <div className="flex gap-4 items-center w-max mx-auto">
                                      <Tippy content="ดูข้อมูล" theme="Primary">
                                          <a className="flex hover:text-info cursor-pointer active" onClick={() => goPreview(item)}>
                                              <IconEye className="w-4.5 h-4.5" />
                                          </a>
                                      </Tippy>
                                  </div>
                              ),
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
                      sortStatus={sortStatus}
                      onSortStatusChange={setSortStatus}
                      paginationText={({ from, to, totalRecords }) => `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`}
                      onCellClick={(item) => {
                          if (item.column.accessor === 'name') {
                              goPreview(item.record);
                          }
                      }}
                  />
              </div>
          </div>
      </div>
  );

}

export default List
