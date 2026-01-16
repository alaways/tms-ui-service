import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useDispatch, useSelector } from 'react-redux'
import { setCustomer } from '../../../store/dataStore'
import { setPageAction } from '../../../store/pageStore'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { formatIDNumber, formatPhoneNumber } from '../../../helpers/formatNumeric'
import { convertDateDbToClient } from '../../../helpers/formatDate'
import { DataTable, DataTableSortStatus } from 'mantine-datatable'
import Select from 'react-select'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEye from '../../../components/Icon/IconEye'
import { IRootState } from '../../../store'
import PreLoading from '../../../helpers/preLoading'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { Field, Form, Formik, FormikProps } from 'formik';
import { columns_csv, customer_csv } from '../../../helpers/constant'
import DateRangeAntd from '../../../components/HOC/DateRangeAntd'
import { useTranslation } from 'react-i18next'

const List = () => {
  const { t } = useTranslation()
  const mode = process.env.MODE || 'admin'
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [customerLists, setCustomerLists] = useState<any[]>([])
    const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const acc = JSON.parse(localStorage.getItem(mode) ?? '{}')?.acc

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null

  const PAGE_SIZES = [10, 20, 30, 50, 100]
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [shopList, setShopLists] = useState<any>([])
  const [firstLoading, setFirstLoading] = useState(false)
  useEffect(() => {
    setFirstLoading(true)
  }, [])
  const creditLevelTypes = useSelector((state: IRootState) => state.dataStore.credit_level)

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
        },
  })

  type filterParams = {
      query?: string;
      credit_level?:  string;
      shop_credit_level?: string;
      id_shop?: string;
      line_regis?: string;
      created_at?: any;
      updated_at?: any
  };

  const [filter, setFilter] = useState<filterParams>({})
  const lineRegis = [
    {
      label : t('all_label'),
      value :"all"
    },
    {
      label : t('registered'),
      value :"regis"
    },
    {
      label : t('not_registered'),
      value :"unregis"
    }
  ]

  const { mutateAsync: fetchCustomerData,isLoading } = useGlobalMutation(url_api.customerFindAll, {
    onSuccess: (res: any) => {
      setCustomerLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
    },
  })

  const handleExport = async (filename: string, values: any) => {
      if (!isDownloading) {
        setIsDownloading(true)
        const query = {
          query: values.search,
          page: page,
          page_size: pageSize,
          ...(values.id_shop.value && {id_shop:values.id_shop.value}),
          ...(values.credit_level.value && {credit_level:values.credit_level.value}),
          ...(values.shop_credit_level.value && {shop_credit_level:values.shop_credit_level.value}),
          ...(values.line_regis.value && {line_regis:values.line_regis.value}),
        }
        const data: any = await fetchCustomerData({data: query})
        const convertData = data.data.list.map((item:any) => ({
          created_at: item.created_at ? convertDateDbToClient(item?.created_at) : t('customer_approved_dash'),
          shop_name: item.shop_name,
          name: item.name,
          phone_number: item.phone_number,
          line_id: item.line_id,
          citizen_id: item.citizen_id,
          credit_level: item.credit_level,
          shop_credit_level: item.shop_credit_level,
          approval_status: item.approval_status,
          line_uuid: item.line_uuid
        }))
        const worksheet = XLSX.utils.json_to_sheet(convertData, { header: customer_csv.map((col) => col.id) })
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
        const headerDisplayNames = customer_csv.map((col) => col.displayName)
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

  const goPreview = (item: any) => {
    dispatch(setCustomer(item))
    dispatch(setPageAction('preview'))
    navigate('/apps/customer/edit/' + item.id)
  }

  useEffect(() => {
    dispatch(setPageTitle(t('customer_list_title')))
    fetchShopData({})
    fetchCustomerData({data: {page:1, page_size: pageSize}})
  }, [])

  useEffect(() => {
    if (!firstLoading) return
    fetchCustomerData({data: {page:1, page_size: pageSize,...filter}})
  }, [pageSize])

  useEffect(() => {
    if (!firstLoading) return
    fetchCustomerData({data: {page:page, page_size: pageSize,...filter}})
  }, [page])

  return (
    <div>
      {isLoading && <PreLoading />}
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
          <h2 className="text-xl">
            {t('customer_label')}
          </h2>
        </div>


        <div className="flex flex-col items-start flex-wrap gap-4 mb-4.5 px-5 ">
        {acc && (
          <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
              <div className="flex gap-3">
                <Link to="/apps/customer/add" className="btn btn-primary gap-2">
                  <IconPlus />
                  {t('add_customer')}
                </Link>
              </div>
        </div>)}
          <Formik initialValues={{ credit_level: '', shop_credit_level: '', id_shop: '', query: '', line_regis: '',created_at:null,updated_at:null }}
            onSubmit={(values: any) => {
              console.log(values)
              setPage(1)
              fetchCustomerData({
                data: {
                  page: 1, page_size: pageSize,
                  credit_level: values.credit_level?.value,
                  shop_credit_level: values.shop_credit_level?.value,
                  id_shop: values.id_shop?.value,
                  line_regis: values.line_regis?.value,
                  query: values.query,
                  ...(values.created_at && { created_at: values.created_at[0], created_at_end: values.created_at[1] }),
                  ...(values.updated_at && { updated_at: values.updated_at[0], updated_at_end: values.updated_at[1] }),

                }
              })
              setFilter({
                ...values, ...(values.created_at && { created_at: values.created_at[0], created_at_end: values.created_at[1] }),
                ...(values.updated_at && { updated_at: values.updated_at[0], updated_at_end: values.updated_at[1] }),
              })
            }}>
            {({ setFieldValue, handleReset, values }) => (
              <Form className='w-full'>
                <div className='flex flex-col gap-3 w-full'>
                  <div className='flex flex-col sm:flex-row gap-4'>
                    <Select
                      id="credit_level"
                      name="credit_level"
                      value={values.credit_level}
                      placeholder={t('credit_bu')}
                      className="z-10 flex-1 dropdown-custom"
                      options={creditLevelTypes}
                      isSearchable={true}
                      onChange={(e: any) => {
                        setFieldValue('credit_level', e)
                      }}
                    />
                    <Select
                      id="shop_credit_level"
                      name="shop_credit_level"
                      value={values.shop_credit_level}
                      placeholder={t('credit_shop')}
                      className="z-10 flex-1 dropdown-custom"
                      options={creditLevelTypes}
                      isSearchable={true}
                      onChange={(e: any) => {
                        setFieldValue('shop_credit_level', e)
                      }}
                    />
                    {!id_shop && <Select
                      id="id_shop"
                      name="id_shop"
                      value={values.id_shop}
                      placeholder={t('shop_label')}
                      className="z-10 flex-1 dropdown-custom"
                      options={shopList}
                      isSearchable={true}
                      onChange={(e: any) => {
                        setFieldValue('id_shop', e)
                      }}
                    />}
                    <Select
                      id="line_regis"
                      name="line_regis"
                      value={values.line_regis}
                      placeholder={t('register_notification')}
                      className="z-10 flex-1 dropdown-custom"
                      options={lineRegis}
                      isSearchable={true}
                      onChange={(e: any) => {
                        setFieldValue('line_regis', e)
                      }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                    <DateRangeAntd name="created_at" placeholder={[t('start_created_date'), t('to_date_label')]} />
                    <DateRangeAntd name="updated_at" placeholder={[t('start_edit_date'), t('to_date_label')]} />
                    <div className="relative">
                        <input type="text"
                          id="query"
                          name="query"
                          placeholder={t('search')}
                          className="form-input py-2 ltr:pr-11 rtl:pl-11 peer"
                          value={values.query}
                          onChange={(e) => {
                            setFieldValue('query', e.target.value);
                          }}
                        />
                      </div>
                    <div className="flex gap-4">
                      <button type="submit" className="btn btn-primary w-[100px] gap-2">{t('search')}</button>
                      <button
                        type="reset"
                        className="btn btn-info gap-2 w-[100px]"
                        onClick={() => {
                          const resetValues: filterParams = {
                            credit_level: '',
                            shop_credit_level: '',
                            id_shop: '',
                            query: '',
                            line_regis: '',
                            created_at:null,
                            updated_at: null
                          }
                          setPage(1)
                          setFilter({ ...resetValues })
                          fetchCustomerData({ data: { page: 1, page_size: pageSize, ...resetValues } })
                        }}
                      >
                        {t('clear_values')}
                      </button>
                      {(role === 'admin' || role === 'business_unit') && (
                        <button type="button" className="btn btn-success gap-2 w-[100px]" onClick={() => { handleExport(`customer_${new Date().toLocaleString()}`, values) }}>
                          Export
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </Form>
            )}
          </Formik>


        </div>
        <div className="datatables pagination-padding">
          {customerLists.length === 0 ? (
            <div className="my-10 text-center text-gray-500">{t('no_data')}</div>
          ) : (
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={customerLists}
              columns={[
                {
                  accessor: 'index',
                  title: t('order_number'),
                  textAlignment: 'center',
                  render: (row, index) => {
                    const i = index + 1 + (page - 1) * pageSize
                    return (<div>{i}</div>)
                  },
                },
                {
                  accessor: 'created_at',
                  title: t('created_date'),
                  textAlignment: 'left',
                  sortable: false,
                  render: ({ created_at }) => (
                    <div className="flex items-center font-normal">
                      <div>{convertDateDbToClient(created_at)}</div>
                    </div>
                  ),
                },

                 ...(role !== 'shop'
                  ? [
                    {
                      accessor: 'updated_at',
                      title: t('edited_date'),
                      //textAlignment: 'left',
                      sortable: false,
                      render: (item:any) => (
                        <div className="flex items-center font-normal">
                          <div>{convertDateDbToClient(item?.updated_at)}</div>
                        </div>
                      ),
                    },
                    {
                      accessor: 'shop_name',
                      title: t('customer_list_shop_label'),
                      //textAlignment: 'left',
                      sortable: false,
                      render: (item:any) => (
                        <div className="flex items-center font-normal">
                          <div> {item?.shop_name || '-'}</div>
                        </div>
                      ),
                    },

                  ] :[]
                ),

                {
                  accessor: 'name',
                  title: t('customer_name_label'),
                  textAlignment: 'left',
                  sortable: false,
                  render: (item) =>
                    {
                      return (role == 'shop')  ?
                      <div className="flex items-center font-normal">
                        <a className="flex">
                          <div>{item.title + ' ' + item.name}</div>
                        </a>
                      </div>
                    :
                    <div className="flex items-center font-normal">
                      <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                        <div>{item.title + ' ' + item.name}</div>
                      </a>
                    </div>
                    }
                },


                 ...(role !== 'shop'
                  ? [
                    {
                        accessor: 'phone_number',
                        title: t('customer_phone'),
                        //textAlignment: 'left',
                        sortable: false,
                        render: (item:any) => (
                           <div className="flex items-center font-normal">
                              <div>{formatPhoneNumber(item.phone_number ?? '-')}</div>
                            </div>
                        ),
                      },
                     {
                        accessor: 'line_id',
                        title: 'Line ID',
                        //textAlignment: 'left',
                        sortable: false,
                      },
                       {
                        accessor: 'citizen_id',
                        title: t('citizen_id'),
                        //textAlignment: 'left',
                        sortable: false,
                        render: (item:any) => (
                          formatIDNumber(item.citizen_id) ?? '-'
                        ),
                      },
                      {
                        accessor: 'credit_level',
                        title: t('credit_level_bu'),
                        //textAlignment: 'left',
                        sortable: false,
                        render: (item:any) => (
                          <div className="flex items-center font-normal">
                            <div>{`${creditLevelTypes.find(i => i.value === item?.credit_level)?.label || '-'}`}</div>
                          </div>
                        ),
                      },
                      {
                        accessor: 'shop_credit_level',
                        title: t('credit_level_shop'),
                        //textAlignment: 'left',
                        sortable: false,
                        render: (item:any) => (
                          <div className="flex items-center font-normal">
                            <div>{`${creditLevelTypes.find(i => i.value === item?.shop_credit_level)?.label || '-'}`}</div>
                          </div>
                        ),
                      },
                      {
                        accessor: 'approval_status',
                        title: t('approval'),
                        //textAlignment: 'center',
                        sortable: false,
                        render: (item:any) => (
                          <span className={`badge ${item?.approval_status ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                            {item?.approval_status ? t('approved') : t('not_approved')}
                          </span>
                        ),
                      },
                      {
                        accessor: 'action',
                        title: 'Actions',
                        sortable: false,
                      // textAlignment: 'center',
                        render: (item:any) => (
                          <div className="flex gap-4 items-center w-max mx-auto">
                            <a className="flex cursor-pointe active" onClick={() => goPreview(item)}>
                              <IconEye />
                            </a>
                          </div>
                        ),
                      },


                    ]
                : []),

              ]}
              minHeight={200}
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
                t('pagination_text', { from, to, totalRecords })
              )}
            />
          )}
        </div>
      </div>
    </div>
  )

}

export default List
