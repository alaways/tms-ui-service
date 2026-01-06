import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'

import { Shop } from '../../../types/index'
import { url_api } from '../../../services/endpoints'

import { PAGE_SIZES } from '../../../helpers/config'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { formatIDNumber, formatPhoneNumber } from '../../../helpers/formatNumeric'

import { DataTable } from 'mantine-datatable'

import IconSearch from '../../../components/Icon/IconSearch'
import Breadcrumbs from '../../../helpers/breadcrumbs'

import 'tippy.js/dist/tippy.css'

const mode = process.env.MODE || 'admin'

const ListBu = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { buid, id } = useParams()

  const storedUser = localStorage.getItem(mode)
  const user = storedUser ? JSON.parse(storedUser) : null

  const role = user ? user?.role : null

  const id_business_unit = user ? user?.id_business_unit : null
  const dataStoredShopGroupBu = useSelector((state: IRootState) => state.dataStore.shopGroupBuConfig)

  const [page, setPage] = useState(1)

  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [search, setSearch] = useState('')
  const [shopGroupLists, setShopGroupLists] = useState<Shop[]>([])

  const { mutate: fetchShopGroupBuData } = useGlobalMutation(url_api.shopGroupShopGetFind, {
    onSuccess: (res: any) => {
      setShopGroupLists(res.data.list)
      setTotalItems(res.data.pages.total)
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  }, {
    page: page,
    pageSize: pageSize,
    order: 'id_shop',
  })

  const breadcrumbItems = [
    { to: '/apps/shop-group/list', label: 'กลุ่มร้าน' },
    { label: 'รายการ', isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle('รายการร้านค้า'))
    dispatch(setSidebarActive(['bu', '/apps/shop-group/list']))
  }, [dispatch])

  useEffect(() => {
    if (role !== 'admin' && role !== 'business_unit') {
      navigate('/')
    }
    if (role === 'business_unit' && id_business_unit != buid) {
      navigate('/')
    }
  }, [role, navigate])

  useEffect(() => {
    fetchShopGroupBuData({
      data: {
        id_business_unit: parseInt(buid || dataStoredShopGroupBu.business_unit.id),
        id_shop_group: parseInt(id || dataStoredShopGroupBu.id)
      },
    })
  }, [page, pageSize, dataStoredShopGroupBu.business_unit.id, dataStoredShopGroupBu.id])

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-5">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
          <h2 className="text-xl">
            ชื่อธุรกิจ | ชื่อกลุ่มร้าน : {dataStoredShopGroupBu?.name}
          </h2>
          <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
            <div className="relative">
              <input type="text" placeholder="ค้นหา" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                <IconSearch className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="datatables pagination-padding">
        <DataTable
          className="whitespace-nowrap table-hover invoice-table"
          records={shopGroupLists}
          columns={[
            {
              accessor: 'id',
              title: 'ลำดับ',
              sortable: false,
              render: (row, index) => (
                <div>{index + 1}</div>
              ),
            },
            {
              accessor: 'tax_id',
              title: 'เลขผู้เสียภาษี',
              sortable: false,
              render: (item: any) => (
                <div className="flex items-center font-normal">
                  <div>{formatIDNumber(item?.tax_id ?? '')}</div>
                </div>
              ),
            },
            {
              accessor: 'name',
              title: 'ชื่อร้าน',
              sortable: false,
              render: (item: any) => (
                <div className="flex items-center font-normal">
                  <div>{item?.name ?? ''}</div>
                </div>
              ),
            },
            {
              accessor: 'phone_number',
              title: 'เบอร์โทรศัพท์',
              sortable: false,
              render: (item: any) => (
                <div className="flex items-center font-normal">
                  <div>{formatPhoneNumber(item?.phone_number ?? '')}</div>
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
      </div>
    </div>
  )

}

export default ListBu