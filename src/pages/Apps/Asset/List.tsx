import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAsset } from '../../../store/dataStore'
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
import { Field, Form, Formik, FormikProps } from 'formik';
import { IRootState } from '../../../store'
import { PAGE_SIZES } from '../../../helpers/config'

const mode = process.env.MODE || 'admin'

const List = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null
  const dataStoredAssetStatus = useSelector((state: IRootState) => state.dataStore.asset_status)
  useEffect(() => {
    dispatch(setPageTitle('รายการสินทรัพย์'))
  })

  const [items, setItems] = useState<Assets[]>([])
  const [page, setPage] = useState(1)
  type filterParams = {
    status_id?: any;
    query?: string;
  };
  const [filter, setFilter] = useState<filterParams>({})

  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])

  const [shopLists, setShopLists] = useState<Shop[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [firstLoading, setFirstLoading] = useState(true)
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
    fetchShopData({})
    let param: any = {
      data: {
        ...filter,
        page: page,
        page_size: pageSize,
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
        ...filter,
        page: 1,
        page_size: pageSize,
      },
    }
    if (selectShop) {
      param.data.id_shop = selectShop.value
    }
    fetchAssetData(param)
  }, [pageSize])

  return (
    <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
      <div className="invoice-table ">
        <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
          <div className="flex items-center gap-2">
            <Link to="/apps/asset/add" className="btn btn-primary gap-2">
              <IconPlus />
              เพิ่มสินทรัพย์
            </Link>

          </div>

          <div className="flex flex-column ltr:ml-auto rtl:mr-auto">
           <Formik initialValues={{ id_province: '', query: ''}}
              onSubmit={(values: any) => {
                setPage(1)
                const filterData = {
                  page:1,
                  page_size: pageSize,
                  id_shop:values?.id_shop?.value || null,
                  status_id:+values?.status_id?.value || null,
                  query:values.query
                }
                fetchAssetData({data:filterData })
                setFilter(filterData)
              }}>
              {({ setFieldValue, handleReset, values }) => (
                <Form>
                  <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex flex-row gap-3" style={{}}>

                   

                      {role != 'shop' && (
                        <div className="flex-1">
                            <Select
                              placeholder="ร้านค้า"
                              className="pr-6 z-10 w-[200px]"
                              options={[{ value: null, label: 'ทั้งหมด' },...shopLists]}
                              isSearchable={true}
                              onChange={(e) => {
                                  setFieldValue('id_shop', e)
                              }}
                            />
                          </div>
                      )}

                      <div className="flex-1">
                          <Select
                            placeholder="สถานะ"
                            className="pr-6 z-10 w-[200px]"
                            options={[{ value: null, label: 'ทั้งหมด' },...dataStoredAssetStatus]}
                            isSearchable={true}
                            onChange={(e) => {
                                setFieldValue('status_id', e)
                            }}
                          />
                      </div>

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
                            location.reload();
                          }}
                        >
                          ล้างค่า
                        </button>
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
            records={items}
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
                accessor: 'shopo',
                title: 'ร้านค้า',
                textAlignment: 'left',
                sortable: true,
                hidden: role !== 'admin' && role !== 'business_unit',
                render: (item) => (
                  <div>{item.shop?.name || '-'}</div>
                ),
              },
              {
                accessor: 'asset_type',
                title: 'ประเภท',
                textAlignment: 'left',
                sortable: false,
                render: ({ asset_type }) => (
                  <div>{asset_type?.name || '-'}</div>
                ),
              },
              {
                accessor: 'name',
                title: 'ชื่อรุ่น',
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
                title: 'หน่วยความจำ',
                textAlignment: 'left',
                sortable: false,
              },
              {
                accessor: 'serial_number',
                title: 'เลขซีเรียล',
                textAlignment: 'left',
                sortable: false,
              },
              {
                accessor: 'imei',
                title: 'เลข imei',
                textAlignment: 'left',
                sortable: false,
              },
              {
                accessor: 'price',
                title: 'ราคา',
                textAlignment: 'right',
                sortable: true,
                render: ({ price }) => (
                  <div>{price ? price.toLocaleString('en-US') : '-'}</div>
                ),
              },
              {
                accessor: 'is_active',
                title: 'เปิดปิดการใช้งาน',
                textAlignment: 'center',
                sortable: true,
                render: ({ is_active }) => (
                  <span className={`badge ${is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                ),
              },
              {
                accessor: 'status',
                title: 'สถานะ',
                textAlignment: 'left',
                sortable: true,
              },

              {
                accessor: 'action',
                title: 'Actions',
                textAlignment: 'center',
                sortable: false,
                render: (item) => (
                  <div className="flex gap-4 items-center w-max mx-auto">
                    <Tippy content="ดูข้อมูล" theme="Primary">
                      <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                        <IconEye />
                      </a>
                    </Tippy>
                    {!id_shop && (<Tippy content="แก้ไข" theme="Primary">
                      <a className="flex cursor-pointer active" onClick={() => goEdit(item)}>
                        <IconEdit className="w-4.5 h-4.5" />
                      </a>
                    </Tippy>)}

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
              `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`
            )}
          />
        </div>
      </div>
    </div>
  )

}

export default List
