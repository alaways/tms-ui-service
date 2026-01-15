import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DataTable } from 'mantine-datatable'
import { useDispatch, useSelector } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import {  useShopFindMutation } from '../../../services/mutations/useShopMutation'
import { Formik, Form, Field } from 'formik'
import DatePicker from '../../../components/HOC/DatePicker'
import IconSearch from '../../../components/Icon/IconSearch'
import IconRefresh from '../../../components/Icon/IconRefresh'
import Select from 'react-select'
import { Spinner } from 'reactstrap'
import { convertDateClientToDb, convertDateDbToClient, convertTimeDateDbToClient } from '../../../helpers/formatDate'
import moment from 'moment'
import { numberWithCommas } from '../../../helpers/formatNumeric';
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { useTranslation } from 'react-i18next' 
const mode = process.env.MODE || 'admin'

const Report = () => {
  const { t } = useTranslation();              // 新增
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const storedUser = localStorage.getItem(mode)
  const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null

  const [selectBusinessUnit, setSelectBusinessUnit] = useState<any>(null)
  const [businessUnit, setBusinessUnit] = useState<any>([])

  useEffect(() => {
    dispatch(setPageTitle(t('shop_info')))       // 已有 key：店铺信息
  }, [dispatch])

  const [shopDetail, setShopDetail] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [commissionTotalLists, setCommissionTotalLists] = useState<any>({
    count_item: 0,
    total_commission: 0,
    total_down_payment: 0,
    total_price: 0,
    total_amount: 0,
    total_fee: 0
  })

  const [commissionLists, setCommissionLists] = useState<any[]>([])

  const PAGE_SIZES = [10, 20, 30, 50, 100]
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])

  const [totalItems, setTotalItems] = useState<number>(0)

  const { mutate: fetchShopDetail, isLoading: isShopDetailLoading } = useShopFindMutation({
    onSuccess: (res: any) => {
      setShopDetail(res.data)
    },
    onError: (err: any) => { },
  })

  const [shopGetDatailList, setShopGetDatailList] = useState<any>([])

  const { mutate: fetchShopGetDatail } = useGlobalMutation(url_api.announceShopGetData, {
    onSuccess: (res: any) => {
      setShopGetDatailList(res.data)
    },
    onError: (err: any) => { },
  })


  useEffect(() => {
    fetchShopDetail({ data: { id: id_shop } })
  }, [fetchShopDetail])

    const { mutate: fetchCommissionData } = useGlobalMutation(url_api.getCommissionPV, {
      onSuccess: (res: any) => {
        if (res.data !== undefined) {
          setCommissionLists(res.data.list)
          setCommissionTotalLists(res.data.summary)
          setTotalItems(res.data.total)
        }
      },
      onError: () => {
        console.error('Failed to fetch status data')
      },
    })
  

  useEffect(() => {
    if (shopDetail) {
      fetchShopGetDatail({})
      setBusinessUnit(
        shopDetail.shop_group_relations.map((item: any) => ({
          value: item.business_unit.id,
          label: item.business_unit.name,
        }))
      )
    }
  }, [shopDetail])

  useEffect(() => {
    if (shopDetail) {
      const businessUnitId = shopDetail.shop_group_relations?.[0]?.business_unit?.id || null
      fetchCommissionData({
        data: {
          id_shop: id_shop,
          id_business_unit: businessUnitId,
          page,
          page_size: pageSize,
          start_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
          end_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
        },
      })
    }
  }, [shopDetail, fetchCommissionData, page, pageSize])

  const goPreview = (item: any) => {
    navigate('/apps/contract/' + item.id + '/' + item.uuid)
  }

  if (isShopDetailLoading) return '...loading...'

  return (
    <>
      {shopGetDatailList.length > 0 && shopGetDatailList.map((item: any, number: any) => {
        return (
          <div className="bg-red-200 text-red-500 p-4 mb-3 rounded-lg" key={number}>
            <p className='font-semibold'>{item?.subject}</p>
            <p>{item?.message}</p>
          </div>
        )
      })}
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
        <div className="invoice-table">
          <div className="ml-10 mt-3 text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">{t('shop')}  {shopDetail?.name}</div>
          <div className="p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6 mb-6 text-white">
              <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">{t('lease_principal')}   </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{commissionTotalLists.total_principle?.toLocaleString() || '0'}</div>
                </div>
              </div>
              <div className="panel bg-gradient-to-r from-violet-500 to-violet-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">{t('brokerage_fee')} </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{commissionTotalLists.total_commission?.toLocaleString() || '0'}</div>
                </div>
              </div>
              <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">{t('total_amount')}</div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{commissionTotalLists.total_amount?.toLocaleString() || '0'}</div>
                </div>
              </div>
              <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl"> {t('contract_fee')}   </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{commissionTotalLists.total_fee?.toLocaleString() || '0'}</div>
                </div>
              </div>
              <div className="panel bg-gradient-to-r from-yellow-500 to-yellow-400">
                <div className="flex justify-between">
                  <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl"> {t('remaining_for_shop')} </div>
                </div>
                <div className="flex items-center mt-5">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{commissionTotalLists.total_amount_shop?.toLocaleString() || '0'}</div>
                </div>
              </div>


              <div className="panel bg-gradient-to-r from-red-500 to-orange-500">
                  <div className="flex justify-between">
                      <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl"> {t('total_installment_price')}  </div>
                  </div>
                  <div className="flex items-center mt-5">
                      <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> {commissionTotalLists.total_ins_amount?.toLocaleString() || '0'}</div>
                  </div>
              </div>

            </div>
          </div>
          <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
            <Formik
              initialValues={{
                start_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
                end_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
              }}
              onSubmit={(values, { resetForm }) => {
                const isEmptySearch = !values.start_at && !values.end_at
                if (isEmptySearch) {
                  fetchCommissionData({
                    data: {
                      id_shop: id_shop,
                      id_business_unit: selectBusinessUnit,
                      page,
                      page_size: pageSize,
                      start_at: `${moment.tz(values.start_at, 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
                      end_at: `${moment.tz(values.end_at, 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
                      status_id: ''
                    },
                  });
                } else {
                  fetchCommissionData({
                    data: {
                      id_shop: id_shop,
                      id_business_unit: selectBusinessUnit,
                      page,
                      page_size: pageSize,
                      start_at: `${moment.tz(values.start_at, 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
                      end_at: `${moment.tz(values.end_at, 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,

                    },
                  });
                }
              }}
              onReset={() => {
                setSelectBusinessUnit(null);
                const businessUnitId = shopDetail.shop_group_relations?.[0]?.business_unit?.id || null;
                fetchCommissionData({
                  data: {
                    id_shop: id_shop,
                    id_business_unit: businessUnitId,
                    page,
                    page_size: pageSize,
                    start_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
                    end_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,

                  },
                });
              }}
            >
              {({ values, setFieldValue, handleReset }) => (
                <Form className="flex items-center gap-2">
                  <DatePicker
                    label={t('start_date')}
                    name="start_at"
                    onChange={(value: any) => {
                      setFieldValue('start_at', convertDateClientToDb(value));
                    }}
                  />
                  <DatePicker
                    label={t('end_date')}
                    name="end_at"
                    onChange={(value: any) => {
                      setFieldValue('end_at', convertDateClientToDb(value));
                    }}
                  />
                  <Select
                    placeholder={t('business_unit')} 
                    className="mt-6 pr-6 z-10 w-[200px]"
                    options={businessUnit}
                    isSearchable={true}
                    value={selectBusinessUnit ? businessUnit.find((option: any) => option.value === selectBusinessUnit) : null}
                    onChange={(e: any) => {
                      setSelectBusinessUnit(e.value);
                    }}
                  />
                  <button type="submit" className="btn btn-primary gap-2 mt-5" disabled={isLoading || !selectBusinessUnit}>
                    {isLoading ? <Spinner size="sm" /> : <IconSearch />}
                    {t('search')} 
                  </button>
                  <button
                    type="reset"
                    className="btn btn-info gap-2 mt-5"
                    onClick={() => {
                      handleReset();
                      setFieldValue('start_at', '');
                      setFieldValue('end_at', '');
                      setSelectBusinessUnit(null);
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner size="sm" /> : <IconRefresh />}
                    ล้างค่า
                  </button>
                </Form>
              )}
            </Formik>
          </div>
          <div className="datatables pagination-padding">
            {commissionLists.length === 0 ? (
              <div className="text-center text-gray-500">{t('no_data_found')}</div>
            ) : (
              <DataTable
                className="whitespace-nowrap table-hover invoice-table"
                records={commissionLists}
                columns={[
                  {
                    accessor: 'id',
                    title: t('contract_number'),   
                    textAlignment: 'center',
                    sortable: false,
                    render: (item) => (
                      <div className="flex justify-center text-center font-normal">
                        <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                          {item.reference}
                        </a>
                      </div>
                    ),
                  },
                  {
                    accessor: 'contract_date',
                    title: t('contract_date'),      
                    textAlignment: 'left',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return convertDateDbToClient(item?.contract_date);
                    },
                  },
                  {
                    accessor: 'approved_at',
                    title: t('contract_approval_date'),  
                    textAlignment: 'left',
                    sortable: false,
                    render: (item:any) => {
                      // const item = commissionLists.find((item) => item.id === record.id);
                      return convertDateDbToClient(item?.contract_approved_date);
                    },
                  },
                  {
                    accessor: 'contract_status',
                    title: t('contract_status'), 
                    textAlignment: 'left',
                    sortable: false,
                    render: (item) => {
                      return item?.contract_status || '-'
                    },
                  },
                  {
                    accessor: 'business_unit.name',
                    title: t('business_name'),  
                    textAlignment: 'left',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return item?.business_unit?.name || '0';
                    },
                  },
                  {
                    accessor: 'asset.name',
                    title: t('asset_name'),
                    textAlignment: 'left',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return item?.asset?.name || '0';
                    },
                  },
                  {
                    accessor: 'price',
                    title: t('selling_price'), 
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return numberWithCommas(item?.price || '0');
                    },
                  },
                  {
                    accessor: 'down_payment',
                    title: t('down_payment'), 
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return numberWithCommas(item?.down_payment || '0');
                    },
                  },
                  {
                    accessor: 'principle',
                    title: t('lease_principal'),     
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return numberWithCommas(item?.principle || '0');
                    },
                  },
                  {
                    accessor: 'commission',
                    title: t('brokerage_fee'),    
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return numberWithCommas(item?.commission || '0');
                    },
                  },
                  {
                    accessor: 'benefit',
                    title: t('special_benefit'),   
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return numberWithCommas(item?.benefit || '0');
                    },
                  },
                  {
                    accessor: 'amount',
                    title: t('special_benefit'),   
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return numberWithCommas(item?.amount || '0');

                    },
                  },
                  {
                    accessor: 'fee',
                    title: t('contract_fee'),    
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return numberWithCommas(item?.fee || '0');
                    },
                  },
                  {
                    accessor: 'total',
                    title: t('remaining_for_shop'),  
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id);
                      return numberWithCommas(item?.total || '-');
                    },
                  },
                  {
                    accessor: 'total',
                    title: t('total_installment_price'),
                    textAlignment: 'right',
                    sortable: false,
                    render: (record) => {
                      const item = commissionLists.find((item) => item.id === record.id)
                      return numberWithCommas(item?.total_ins_amount || '-')
                    },
                  },
                ]}
                highlightOnHover
                totalRecords={totalItems}
                recordsPerPage={pageSize}
                page={page}
                onPageChange={(p) => setPage(p)}
                recordsPerPageOptions={PAGE_SIZES}
                onRecordsPerPageChange={(p) => {
                  setPage(1)
                  setPageSize(p)
                }}
                paginationText={({ from, to, totalRecords }) => `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total_pages')}`}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );

}

export default Report
