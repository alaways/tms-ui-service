import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import * as XLSX from 'xlsx';

import _ from 'lodash';
import Swal from 'sweetalert2';

import moment from 'moment-timezone';

import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice';

import { url_api } from '../../../services/endpoints';
import { shop_report_csv, toastAlert } from '../../../helpers/constant';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { numberWithCommas } from '../../../helpers/formatNumeric';

import { convertDateClientToDb, convertDateDbToClient } from '../../../helpers/formatDate';
import { useShopFindMutation } from '../../../services/mutations/useShopMutation';

import Select from 'react-select';

import { Spinner } from 'reactstrap';
import { Formik, Form } from 'formik';

import { DataTable } from 'mantine-datatable';

import DatePicker from '../../../components/HOC/DatePicker';
import SelectField from '../../../components/HOC/SelectField';

import IconSearch from '../../../components/Icon/IconSearch';
import IconRefresh from '../../../components/Icon/IconRefresh';

import Breadcrumbs from '../../../helpers/breadcrumbs';
import Tippy from '@tippyjs/react';
import IconEdit from '../../../components/Icon/IconEdit';
import { useTranslation } from 'react-i18next';

const toast = Swal.mixin(toastAlert);
const mode = process.env.MODE || 'admin';

const ShopReportPV = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [searchParams, setSearchParams] = useSearchParams();

    const { id } = useParams();
    const id_business_unit = searchParams.get('id_business_unit') || '';

    const breadcrumbItems = [
        { to: '/apps/report/pay-to-shop-pv', label: t('pay_to_shop') },
        { label: t('compensation_report'), isCurrent: true },
    ];

    const apiUrl = process.env.BACKEND_URL;
    const storedUser = localStorage.getItem(mode);

    const role = storedUser ? JSON.parse(storedUser).role : null;
    const token = storedUser ? JSON.parse(storedUser).access_token : null;

    const dataStoredShop: any = useSelector((state: IRootState) => state.dataStore.shop);

    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const [shopData, setShopData] = useState<any>(null);
    const [businessUnit, setBusinessUnit] = useState<any>([]);
    const [statusList, setStatusList] = useState<any>([]);

    const [defaultForm, setDefaultFormData] = useState<any>({
        start_at: searchParams.get('startDate') || `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
        end_at: searchParams.get('endDate') || `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
        id_business_unit: id_business_unit || '',
        id_shop: id || '',
        search: '',
        status: '',
    });

    const [commissionTotalLists, setCommissionTotalLists] = useState({
        count_item: 0,
        total_commission: 0,
        total_down_payment: 0,
        total_price: 0,
        total_amount: 0,
        total_principle: 0,
        total_benefit: 0,
        total_amount_shop: 0,
        total_fee: 0,
        total_ins_amount: 0,
    });
    const [commissionLists, setCommissionLists] = useState<any[]>([]);

    const PAGE_SIZES = [10, 20, 30, 50, 100];

    const [page, setPage] = useState(1);
    const [prevPageSize, setPrevPageSize] = useState(1);

    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [typeDateSearch, setTypeDateSearch] = useState<string>('');
    const [dateSearch, setDateSearch] = useState<any>({ start_at: null, end_at: null });

    const convertText = (text: string) => {
        if (text == 'approved') {
            return t('approved');
        } else if (text == 'cancel') {
            return t('cancelled');
        }
    };

    const column: any = [
        {
            accessor: 'id',
            title: t('contract_number'),
            textAlignment: 'center',
            sortable: false,
            render: (item: any) => (
                <div className="flex justify-center text-center font-normal">
                    <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                        {item.reference}
                    </a>
                </div>
            ),
        },
        {
            accessor: 'no_pv',
            title: t('pv_number'),
            textAlignment: 'center',
            sortable: false,
            render: (item: any) => <p>{item?.pv_no}</p>,
        },
        {
            accessor: 'date_pv',
            title: t('pv_created_date'),
            textAlignment: 'center',
            sortable: false,
            render: (item: any) => convertDateDbToClient(item.pv_create),
        },
        {
            accessor: 'contract_date',
            title: t('contract_date'),
            sortable: false,
            render: (record: any) => {
                const item = commissionLists.find((item) => item.id === record.id);
                return convertDateDbToClient(item?.contract_date);
            },
        },
        {
            accessor: 'approved_at',
            title: t('contract_approval_date'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
                return convertDateDbToClient(item?.contract_approved_date);
            },
        },
        {
            accessor: 'contract_status',
            title: t('pv_status'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
                return <p className={`${item.contract_status == 'cancel' ? 'text-red-500' : 'text-green-600'} !font-semibold`}>{convertText(item?.contract_status) || ''}</p>;
            },
        },
        {
            accessor: 'asset.name',
            title: t('asset_name'),
            textAlignment: 'left',
            sortable: false,
            render: (record: any) => {
                const item = commissionLists.find((item) => item.id === record.id);
                return record.isTotal ? t('total_sum') : (item?.asset?.name || '');
            },
        },
        {
            accessor: 'price',
            title: t('selling_price'),
            textAlignment: 'right',
            sortable: false,
            render: (record: any) => {
                const item = commissionLists.find((item) => item.id === record.id);
                return record.isTotal ? `${numberWithCommas(item?.price || '0')} ${t('baht')}` : numberWithCommas(item?.price || '0');
            },
        },
        {
            accessor: 'down_payment',
            title: t('down_payment'),
            textAlignment: 'right',
            sortable: false,
            render: (record: any) => {
                const item = commissionLists.find((item) => item.id === record.id);
                return record.isTotal ? `${numberWithCommas(item?.down_payment || '0')} ${t('baht')}` : numberWithCommas(item?.down_payment || '0');
            },
        },
        {
            accessor: 'principle',
            title: t('lease_principal'),
            textAlignment: 'right',
            sortable: false,
            render: (record: any) => {
                const item = commissionLists.find((item) => item.id === record.id);
                return record.isTotal ? `${numberWithCommas(item?.principle || '0')} ${t('baht')}` : numberWithCommas(item?.principle || '0');
            },
        },
        {
            accessor: 'commission',
            title: t('commission'),
            textAlignment: 'right',
            sortable: false,
            render: (record: any) => {
                const item = commissionLists.find((item) => item.id === record.id);
                return record.isTotal ? `${numberWithCommas(item?.commission || '0')} ${t('baht')}` : numberWithCommas(item?.commission || '0');
            },
        },
        {
            accessor: 'benefit',
            title: t('special_benefit'),
            textAlignment: 'right',
            sortable: false,
            render: (item: any) => {
                return item.isTotal ? `${numberWithCommas(item?.benefit || '0')} ${t('baht')}` : numberWithCommas(item?.benefit || '0');
            },
        },
        {
            accessor: 'amount',
            title: t('total_amount'),
            textAlignment: 'right',
            sortable: false,
            render: (record: any) => {
                const item = commissionLists.find((item) => item.id === record.id);
                return record.isTotal ? `${numberWithCommas(item?.amount || '0')} ${t('baht')}` : numberWithCommas(item?.amount || '0');
            },
        },
        {
            accessor: 'fee',
            title: t('contract_fee'),
            textAlignment: 'right',
            sortable: false,
            render: (record: any) => {
                const item = commissionLists.find((item) => item.id === record.id);
                return record.isTotal ? `${numberWithCommas(item?.fee || '0')} ${t('baht')}` : numberWithCommas(item?.fee || '0');
            },
        },
        {
            accessor: 'total',
            title: t('remaining_for_shop'),
            textAlignment: 'right',
            sortable: false,
            render: (record: any) => {
                const item = commissionLists.find((item) => item.id === record.id);
                return record.isTotal ? `${numberWithCommas(item?.total || '-')} ${t('baht')}` : numberWithCommas(item?.total || '-') ;
            },
        },
        {
            accessor: 'total_ins_amount',
            title: t('total_installment_price'),
            textAlignment: 'right',
            sortable: false,
            render: (item: any) => {
                return item.isTotal ? `${numberWithCommas(item?.total_ins_amount || '-')} ${t('baht')}` : numberWithCommas(item?.total_ins_amount || '-');
            },
        },
        // {
        //     accessor: 'total_ins_amount',
        //     title: 'ราคารวมผ่อน',
        //     textAlignment: 'right',
        //     sortable: false,
        //     render: (item: any) => {
        //         return numberWithCommas('-');
        //     },
        // },
        ...(role !== 'shop'
            ? [
                  {
                      accessor: 'action',
                      title: t('actions'),
                      textAlignment: 'center',
                      sortable: false,
                      render: (item: any) => (
                        <>
                         {!item.isTotal && <div className="flex gap-4 items-center w-max mx-auto">
                              <a href={`/apps/report/pay-to-shop-pv/edit/${item.uuid}?id_business_unit=${id_business_unit}&id_shop=${id}`} className="flex cursor-pointer items-center relative group">
                                  <IconEdit className="w-4.5 h-4.5 flex items-center transition-opacity duration-200 group-hover:opacity-0" />
                                  <p className="absolute left-[-5px] text-center text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">{t('edit')}</p>
                              </a>
                          </div>}
                        </>
                      ),
                  },
              ]
            : []),
    ];

    const {
        mutate: fetchShopData,
        isLoading: isShopLoading,
        isError,
    } = useShopFindMutation({
        onSuccess: (res: any) => {
            const setFormValue = res?.data;
            setShopData({
                ...setFormValue,
                id: id || dataStoredShop.id,
            });
            if (role !== 'business_unit' && id_business_unit !== '') {
                setBusinessUnit(
                    setFormValue.shop_group_relations.map((item: any) => ({
                        value: item.business_unit.id.toString(),
                        label: item.business_unit.name,
                    }))
                );
            } else {
                fetchContractGetBuList({});
            }
        },
        onError: (err) => {
            setShopData(dataStoredShop);
        },
    });

    const { mutate: fetchContractGetBuList } = useGlobalMutation(url_api.contractFilter, {
        onSuccess: (res: any) => {
            setBusinessUnit(
                res?.data?.business_unit?.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );
        },
        onError: () => {
            console.error('Failed to fetch status data');
        },
    });
    
    const { mutate: fetchCommissionData } = useGlobalMutation(url_api.getCommissionPV, {
         onSuccess: (res:any) => {
            if (res?.data !== undefined) {
                const totalInclude = res?.data?.list?.reduce((acc:any,cur:any) => {
                    acc.amount += cur.amount || 0
                    acc.commission += cur.commission || 0
                    acc.down_payment += cur.down_payment || 0
                    acc.fee += cur.fee || 0
                    acc.price += cur.price || 0
                    acc.principle += cur.principle || 0
                    acc.total += cur.total || 0
                    acc.total_ins_amount += cur.total_ins_amount || 0
                    acc.benefit += cur.benefit || 0
                    return acc
                },{amount:0,commission:0,down_payment:0,fee:0,price:0,principle:0,total:0,total_ins_amount:0,benefit:0})
                const newList = res?.data?.list?.concat({...totalInclude,isTotal:true})
                setCommissionLists(newList);
                setCommissionTotalLists(res?.data?.summary);
                setTotalItems(res?.data?.total);
            }
            setIsLoading(false);
        },
        onError: (err:any) => {
            setIsLoading(false);
        },
    });
    

    const fetchExportCsv = async () => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', `Bearer ${token}`);
        const raw = JSON.stringify({
            id_shop: defaultForm.id_shop,
            id_business_unit: +defaultForm.id_business_unit,
            start_at: defaultForm.start_at,
            end_at: defaultForm.end_at,
            page_size: 50000,
            page: page,
            ...(defaultForm.status && { status: defaultForm.status }),
        });
        const requestOptions: any = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };
        return fetch(apiUrl + '/shop/pv/get-commission', requestOptions)
            .then((response) => response.json())
            .then((result) => result.data)
            .catch((error) => {
                return [];
            });
    };

    const handleExport = async (filename: any) => {
        if (!isDownloading) {
            setIsDownloading(true);
            const data: any = await fetchExportCsv();
            const worksheet = XLSX.utils.json_to_sheet(
                data.list.map((item: any, index: number) => {
                    return {
                        reference: item.reference,
                        contract_date: convertDateDbToClient(item?.contract_date),
                        approved_at: convertDateDbToClient(item?.contract_approved_date),
                        asset_name: item?.asset?.name || '0',
                        asset_price: numberWithCommas(item?.price || '0'),
                        down_payment: numberWithCommas(item?.down_payment || '0'),
                        principle: numberWithCommas(item?.principle || '0'),
                        commission: numberWithCommas(item?.commission || '0'),
                        benefit: numberWithCommas(item?.benefit || '0'),
                        amount: numberWithCommas(item?.amount || '0'),
                        fee: numberWithCommas(item?.fee || '0'),
                        total: numberWithCommas(item?.total || '-'),
                    };
                }),
                { header: shop_report_csv.map((col: any) => col.id) }
            );
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const headerDisplayNames = shop_report_csv.map((col: any) => col.displayName);
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
            setIsDownloading(false);
        }
    };

    const goPreview = (item: any) => {
        navigate('/apps/contract/' + item?.contract_id + '/' + item?.contract_uuid);
    };

    const onClickDate = (type: any, setFieldValue: any) => {
        if (type == 'all') {
            setTypeDateSearch('all');
        } else if (type == 'today') {
            setTypeDateSearch('today');
            setFieldValue('start_at', convertDateClientToDb(new Date().toISOString()));
            setFieldValue('end_at', convertDateClientToDb(new Date().toISOString()));
        } else if (type == 'month') {
            setTypeDateSearch('month');
            const now = new Date();
            const firstDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
            const lastDay = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
            setFieldValue('start_at', convertDateClientToDb(firstDay.toISOString()));
            setFieldValue('end_at', convertDateClientToDb(lastDay.toISOString()));
        } else {
            setTypeDateSearch('custom');
        }
    };

    useEffect(() => {
        if (role !== 'admin' && role !== 'business_unit') {
            navigate('/');
        }
    }, [role, navigate]);

    useEffect(() => {
        dispatch(setPageTitle(t('compensation_report')));
    }, [dispatch]);

    useEffect(() => {
        fetchShopData({
            data: {
                id: id || dataStoredShop.id,
            },
        });
        if (id_business_unit) {
            setDefaultFormData((prev: any) => ({
                ...prev,
                id_business_unit: id_business_unit !== '' ? id_business_unit : '',
            }));
        }
    }, [id_business_unit]);

    useEffect(() => {
        const isPageSizeChanged = prevPageSize !== pageSize;
        fetchCommissionData({
            data: {
                id_shop: id !== undefined && id !== '' ? id : 0,
                id_business_unit: +defaultForm.id_business_unit,
                page: isPageSizeChanged ? 1 : page,
                page_size: pageSize,
                start_at: defaultForm.start_at,
                end_at: defaultForm.end_at,
                status: defaultForm.status,
            },
        });
        setPrevPageSize(pageSize);
    }, [page, pageSize]);

    return (
        <>
            <Breadcrumbs items={breadcrumbItems} />
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3">
                <div className="invoice-table">
                    <div className="ml-10 mt-3 text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">{t('shop')} {shopData?.name || '-'}</div>
                    <div className="p-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6 text-white">
                            <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                                <div className="flex justify-between">
                                    <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">{t('lease_principal')}</div>
                                </div>
                                <div className="flex items-center mt-5">
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{commissionTotalLists.total_principle?.toLocaleString() || '0'}</div>
                                </div>
                            </div>
                            <div className="panel bg-gradient-to-r from-violet-500 to-violet-400">
                                <div className="flex justify-between">
                                    <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">{t('commission')}</div>
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
                                    <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">{t('contract_fee')}</div>
                                </div>
                                <div className="flex items-center mt-5">
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{commissionTotalLists.total_fee?.toLocaleString() || '0'}</div>
                                </div>
                            </div>
                            <div className="panel bg-gradient-to-r from-yellow-500 to-yellow-400">
                                <div className="flex justify-between">
                                    <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">{t('remaining_for_shop')}</div>
                                </div>
                                <div className="flex items-center mt-5">
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{commissionTotalLists.total_amount_shop?.toLocaleString() || '0'}</div>
                                </div>
                            </div>
                            <div className="panel bg-gradient-to-r from-red-500 to-orange-500">
                                <div className="flex justify-between">
                                    <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold text-xl">{t('total_installment_price')}</div>
                                </div>
                                <div className="flex items-center mt-5">
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">{commissionTotalLists.total_ins_amount?.toLocaleString() || '0'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5 custom-select">
                        <Formik
                            initialValues={defaultForm}
                            onSubmit={(values, { resetForm }) => {
                                if (_.isEmpty(values.start_at) || _.isEmpty(values.end_at) || values.start_at === '' || values.end_at === '') {
                                    toast.fire({
                                        icon: 'warning',
                                        title: t('please_select_date_search'),
                                        padding: '10px 20px',
                                    });
                                } else {
                                    setIsLoading(true);
                                    if (typeof values.start_at !== 'string' && typeof values.end_at !== 'string') {
                                        setDefaultFormData({
                                            id_shop: shopData.uuid,
                                            id_business_unit: values.id_business_unit,
                                            start_at: values.start_at,
                                            end_at: values.end_at,
                                            page_size: pageSize,
                                            page: page,
                                            status: values.status,
                                        });
                                        fetchCommissionData({
                                            data: {
                                                id_shop: shopData.id,
                                                id_business_unit: parseInt(values.id_business_unit),
                                                start_at: `${moment.tz(values.start_at[0], 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
                                                end_at: `${moment.tz(values.end_at[0], 'Asia/Bangkok').format('YYYY-MM-DD')}T23:59:59.000Z`,
                                                page_size: pageSize,
                                                page: page,
                                                status: values.status,
                                            },
                                        });
                                    } else {
                                        setDefaultFormData({
                                            id_shop: shopData.uuid,
                                            id_business_unit: values.id_business_unit,
                                            start_at: values.start_at,
                                            end_at: values.end_at,
                                            page_size: pageSize,
                                            page: page,
                                            status: values.status,
                                        });
                                        fetchCommissionData({
                                            data: {
                                                id_shop: shopData.id,
                                                id_business_unit: parseInt(values.id_business_unit),
                                                start_at: `${moment.tz(values.start_at, 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
                                                end_at: `${moment.tz(values.end_at, 'Asia/Bangkok').format('YYYY-MM-DD')}T23:59:59.000Z`,
                                                page_size: pageSize,
                                                page: page,
                                                status: values.status,
                                            },
                                        });
                                    }
                                }
                            }}
                            onReset={() => {
                                // setSearch('')
                                // setSelectShop(null)
                                setCommissionLists([]);
                                setCommissionTotalLists((old) => ({
                                    ...old,
                                    count_item: 0,
                                    total_commission: 0,
                                    total_down_payment: 0,
                                    total_price: 0,
                                    total_amount: 0,
                                    total_principle: 0,
                                    total_benefit: 0,
                                    total_amount_shop: 0,
                                    total_ins_amount: 0,
                                }));
                            }}
                            enableReinitialize
                        >
                            {({ setFieldValue, handleReset }) => (
                                <Form className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        {role === 'business_unit' ? (
                                            <div>
                                                <label>{t('business_unit')}</label>
                                                <Select
                                                    defaultValue={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value.id }}
                                                    value={businessUnit.length === 0 ? null : { label: businessUnit[0].label, value: businessUnit[0].value.id }}
                                                    placeholder={t('select_business_unit')}
                                                    className="pr-1 z-10 w-[200px]"
                                                    options={businessUnit.map((item: any) => ({ label: item.label, value: item.value.id }))}
                                                    isDisabled={true}
                                                />
                                            </div>
                                        ) : (
                                            <SelectField
                                                id="id_business_unit"
                                                name="id_business_unit"
                                                label={t('business_unit')}
                                                className="pr-1 z-10 w-[200px]"
                                                options={businessUnit}
                                                isSearchable={true}
                                                onChange={(e: any) => {
                                                    setFieldValue('id_business_unit', e.value);
                                                }}
                                            />
                                        )}
                                        <SelectField
                                            id="status"
                                            name="status"
                                            label={t('pv_status')}
                                            className="pr-1 w-[200px]"
                                            options={[
                                                { value: '', label: t('all') },
                                                { value: 'approved', label: t('approved') },
                                                { value: 'cancel', label: t('cancelled') },
                                            ]}
                                            isSearchable={false}
                                            onChange={(e: any) => {
                                                setFieldValue('status', e.value);
                                            }}
                                        />
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <label htmlFor="">{t('contract_approval_date')}</label>
                                        {/* <button type='button' onClick={() => onClickDate('all',setFieldValue)} className={`${typeDateSearch == 'all' ? 'bg-blue-500 text-white font-semibold' : null} border rounded-[5px] px-4 py-2`}>ทั้งหมด</button> */}
                                        <button
                                            type="button"
                                            onClick={() => onClickDate('today', setFieldValue)}
                                            className={`${typeDateSearch == 'today' ? 'bg-blue-500 text-white font-semibold' : null} border rounded-[5px] px-4 py-2`}
                                        >
                                            {t('today')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onClickDate('month', setFieldValue)}
                                            className={`${typeDateSearch == 'month' ? 'bg-blue-500 text-white font-semibold' : null} border rounded-[5px] px-4 py-2`}
                                        >
                                            {t('this_month')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onClickDate('custom', setFieldValue)}
                                            className={`${typeDateSearch == 'custom' ? 'bg-blue-500 text-white font-semibold' : null} border rounded-[5px] px-4 py-2`}
                                        >
                                            {t('custom')}
                                        </button>
                                        {typeDateSearch != 'custom' && (
                                            <>
                                                <DatePicker
                                                    name="start_at"
                                                    onChange={(value: any) => {
                                                        setFieldValue('start_at', convertDateClientToDb(value));
                                                    }}
                                                    disabled={true}
                                                />
                                                <DatePicker
                                                    name="end_at"
                                                    onChange={(value: any) => {
                                                        setFieldValue('end_at', convertDateClientToDb(value));
                                                    }}
                                                    disabled={true}
                                                />
                                            </>
                                        )}
                                        {typeDateSearch == 'custom' && (
                                            <>
                                                <DatePicker
                                                    name="start_at"
                                                    onChange={(value: any) => {
                                                        setFieldValue('start_at', convertDateClientToDb(value));
                                                    }}
                                                />
                                                <DatePicker
                                                    name="end_at"
                                                    onChange={(value: any) => {
                                                        setFieldValue('end_at', convertDateClientToDb(value));
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {/* <SelectField
                      id="status_id"
                      name="status_id"
                      label="สถานะสัญญา"
                      className="pr-1 w-[200px]"
                      options={statusList}
                      isSearchable={false}
                      onChange={(e: any) => {
                        setFieldValue('status_id', e.value)
                      }}
                    /> */}
                                        <button type="submit" className="btn btn-primary gap-2 mt-5" disabled={isLoading}>
                                            {isLoading ? <Spinner size="sm" /> : <IconSearch />}
                                            {t('search')}
                                        </button>
                                        <button type="reset" className="btn btn-info gap-2 mt-5" disabled={isLoading} onClick={handleReset}>
                                            {isLoading ? <Spinner size="sm" /> : <IconRefresh />}
                                            {t('clear_values')}
                                        </button>
                                        <div className="flex flex-col pt-5">
                                            <button type="button" className="btn btn-success gap-2 w-full h-[40px]" onClick={() => handleExport(`shop_report_${new Date().toLocaleString()}`)}>
                                                {t('export')}
                                            </button>
                                        </div>
                                        <NavLink
                                            to={`/apps/report/account-creditor?id_business_unit=${id_business_unit}&id_shop=${id}&start_at=${defaultForm.start_at}&end_at=${defaultForm.end_at}`}
                                            className="btn bg-yellow-500 text-white shadow-lg gap-2 mt-5"
                                        >
                                            {t('shop_transactions')}
                                        </NavLink>
                                    </div>
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
                                columns={column}
                                page={page}
                                totalRecords={totalItems}
                                recordsPerPage={pageSize}
                                onPageChange={(p) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={(p) => {
                                    setPage(1);
                                    setPageSize(p);
                                }}
                                rowClassName={(item:any) =>
                                    item.isTotal ? '!bg-white font-bold text-black' : ''
                                }
                                paginationText={({ from, to, totalRecords }) => `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total')}`}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShopReportPV;
