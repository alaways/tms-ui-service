import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { debounce } from 'lodash'
import { useDispatch } from 'react-redux'
import { setAsset } from '../../../store/dataStore'
import { setPageAction } from '../../../store/pageStore'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { DataTable } from 'mantine-datatable'
import { Assets, AssetsTypes, InsuranceTypes, Shop } from '../../../types/index'
import Tippy from '@tippyjs/react'
import Select from 'react-select'
import IconEye from '../../../components/Icon/IconEye'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEdit from '../../../components/Icon/IconEdit'
import 'tippy.js/dist/tippy.css'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { useTranslation } from 'react-i18next'   // 新增

const mode = process.env.MODE || 'admin'

const List = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null

  useEffect(() => {
    dispatch(setPageTitle(t('asset_list')))
  })

  const [items, setItems] = useState<Assets[]>([])
  const [page, setPage] = useState(1)

  const PAGE_SIZES = [10, 20, 30, 50, 100]

  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])

  const [shopLists, setShopLists] = useState<Shop[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [firstLoading, setFirstLoading] = useState(false)
  useEffect(() => {
    setFirstLoading(true)
  }, [])
  const [search, setSearch] = useState<string>('')
  const [searchShop, setSearchShop] = useState<string>('')
  const [selectShop, setSelectShop] = useState<any>(null)

  const { mutate: fetchAssetData } = useGlobalMutation(url_api.assetFindAll, {
    onSuccess: (res: any) => {
      setItems(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
        console.error('Failed to fetch asset type data');
    },
  });

  const { mutate: fetchShopData } = useGlobalMutation(url_api.shopFindAll, {
    onSuccess: (res: any) => {
      setShopLists(
        res.data.list.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      )
    },
    onError: () => {
        console.error('Failed to fetch asset type data');
    },
  });

  const goPreview = (item: any) => {
    dispatch(setAsset(item))
    navigate('/apps/asset/view/' + item.id)
  }

  const goEdit = (item: any) => {
    dispatch(setAsset(item))
    navigate('/apps/asset/edit/' + item.id)
  }

  useEffect(() => {
    if (!firstLoading) return
    let param: any = {
      data: {
        page: page,
        page_size: pageSize,
        query: search,
      },
    }
    if (selectShop) {
      param.data.id_shop = selectShop.value
    }
    fetchAssetData(param)
  }, [page])

  useEffect(() => {
    if (!firstLoading) return
    let param: any = {
      data: {
        page: 1,
        page_size: pageSize,
        query: search,
      },
    }
    if (selectShop) {
      param.data.id_shop = selectShop.value
    }
    fetchAssetData(param)
  }, [pageSize])

  const debouncedFetchAssetData = useMemo(
    () =>
      debounce((searchValue) => {
        let param: any = {
          data: {
            page: 1,
            page_size: pageSize,
            query: searchValue,
          },
        }
        if (selectShop) {
          param.data.id_shop = selectShop.value
        }
        fetchAssetData(param)
      }, 500),
    [fetchAssetData, pageSize, selectShop]
  )

  useEffect(() => {
    debouncedFetchAssetData(search)
    return () => {
      debouncedFetchAssetData.cancel()
    }
  }, [search, debouncedFetchAssetData])

  const debouncedFetchShopData = useMemo(
    () =>
      debounce((searchValue) => {
        if (!id_shop) {
          fetchShopData({
            data: {
              page: 1,
              page_size: 10,
              query: searchValue,
            },
          })
        }
      }, 500),
    [fetchShopData]
  )

  useEffect(() => {
    debouncedFetchShopData(searchShop)
    return () => {
      debouncedFetchShopData.cancel()
    }
  }, [searchShop, debouncedFetchShopData])

  const handleInputChange = (inputValue: string) => {
    setSearchShop(inputValue)
  }

  return (
    <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
      <div className="invoice-table ">
        <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
          <div className="flex items-center gap-2">
            <Link to="/apps/asset/add" className="btn btn-primary gap-2">
              <IconPlus />
              {t('add_asset')}
            </Link>

          </div>
          <div className="flex flex-column ltr:ml-auto rtl:mr-auto">
            {!id_shop && (
              <div className="flex-1">
                <Select
                  placeholder={t('shop')}
                  className="pr-6 z-10 w-[200px]"
                  options={[{ value: null, label: t('all') },...shopLists]}
                  isSearchable={true}
                  onInputChange={handleInputChange}
                  onChange={(e) => {
                    setSelectShop(e)
                  }}
                />
              </div>

            )}
            <input type="text" className="form-input w-auto" placeholder={t('search_text')}  value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="datatables pagination-padding">
          <DataTable
            className="whitespace-nowrap table-hover invoice-table"
            records={items}
            columns={[
              {
                accessor: 'index',
                title: t('order'),               // 已有 key：序号
                textAlignment: 'center',
                render: (row, index) => index + 1 + (page - 1) * pageSize,
              },
              {
                accessor: 'shopo',
                title: t('shop'),                // 已有 key：店铺
                textAlignment: 'left',
                sortable: true,
                hidden: role !== 'admin' && role !== 'business_unit',
                render: (item) => <div>{item.shop?.name || '-'}</div>,
              },
              {
                accessor: 'asset_type',
                title: t('asset_type'),          // 新 key：资产类型
                textAlignment: 'left',
                sortable: false,
                render: ({ asset_type }) => <div>{asset_type?.name || '-'}</div>,
              },
              {
                accessor: 'name',
                title: t('asset_model_name'),    // 新 key：资产型号名称
                textAlignment: 'left',
                sortable: true,
                render: (item) => (
                  <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                    <div>{item.name || '-'}</div>
                  </a>
                ),
              },
              {
                accessor: 'capacity',
                title: t('asset_capacity'),      // 新 key：资产容量
                textAlignment: 'left',
                sortable: false,
              },
              {
                accessor: 'serial_number',
                title: t('asset_serial_number'), // 新 key：序列号
                textAlignment: 'left',
                sortable: false,
              },
              {
                accessor: 'imei',
                title: t('asset_imei'),          // 新 key：IMEI号
                textAlignment: 'left',
                sortable: false,
              },
              {
                accessor: 'price',
                title: t('price'),               // 新 key：价格
                textAlignment: 'right',
                sortable: true,
                render: ({ price }) => <div>{price ? price.toLocaleString('en-US') : '-'}</div>,
              },
              {
                accessor: 'is_active',
                title: t('active_status'),       // 已有 key：启用状态
                textAlignment: 'center',
                sortable: true,
                render: ({ is_active }) => (
                  <span className={`badge ${is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {is_active ? t('open') : t('close')}  // 已有 key
                  </span>
                ),
              },
              {
                accessor: 'action',
                title: t('actions'),             // 已有 key
                textAlignment: 'center',
                sortable: false,
                render: (item) => (
                  <div className="flex gap-4 items-center w-max mx-auto">
                    <Tippy content={t('view_data')} theme="Primary">
                      <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                        <IconEye />
                      </a>
                    </Tippy>
                    {!id_shop && (
                      <Tippy content={t('edit')} theme="Primary">
                        <a className="flex cursor-pointer active" onClick={() => goEdit(item)}>
                          <IconEdit className="w-4.5 h-4.5" />
                        </a>
                      </Tippy>
                    )}
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
            onRecordsPerPageChange={setPageSize}
            // sortStatus={sortStatus}
            // onSortStatusChange={setSortStatus}
            paginationText={({ from, to, totalRecords }) => (
              `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total_pages')}`
            )}
          />
        </div>
      </div>
    </div>
  )

}

export default List
