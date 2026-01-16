import { Form, Formik } from 'formik';
import * as XLSX from 'xlsx';
import { numberCommas, numberWithCommas } from '../../../helpers/formatNumeric';
import DatePicker from '../../../components/HOC/DatePicker';
import { convertDateClientToDb, convertDateTimeToApiByBangkok, convertToISO } from '../../../helpers/formatDate';
import moment from 'moment';
import { Fragment, useEffect, useState } from 'react';
import SelectField from '../../../components/HOC/SelectField';
import IconSearch from '../../../components/Icon/IconSearch';
import IconRefresh from '../../../components/Icon/IconRefresh';
import { Spinner } from 'reactstrap';
import { Tab } from '@headlessui/react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { PAGE_SIZES } from '../../../helpers/config';
import { NavLink, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../../../helpers/breadcrumbs';
import { IconMoney, IconMoney2, IconMoneyReturn } from '../../../components/Icon/IconMoney';
import { report_account_csv, report_paid_shop_csv } from '../../../helpers/constant';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';
import IconEye from '../../../components/Icon/IconEye';
import { useShopFindMutation } from '../../../services/mutations/useShopMutation';
import { useTranslation } from 'react-i18next';
const mode = process.env.MODE || 'admin'
const apiUrl = process.env.BACKEND_URL
const AccountCreditor = () => {
    const storedUser = localStorage.getItem(mode)
    const token = storedUser ? JSON.parse(storedUser).access_token : null;
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation();

    const role = storedUser ? JSON.parse(storedUser).role : null;
    const id_shopStored = storedUser ? JSON.parse(storedUser).id_shop : null;

    const id_shop = searchParams.get('id_shop');
    const id_business_unit = searchParams.get('id_business_unit');
    const start_at = searchParams.get('start_at');
    const end_at = searchParams.get('end_at');

    const dataStoredShop: any = useSelector((state: IRootState) => state.dataStore.shop);
    const [businessUnit, setBussinessUnit] = useState<any>([]);
    const [shopLists, setShopLists] = useState<any>([]);
    const [shopBuData, setShopBuData] = useState<any>({
        start_at: start_at ? start_at : `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
        end_at: end_at ? end_at : `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`,
        ...(id_shop && { id_shop: id_shop }),
        ...(id_business_unit && { id_business_unit: +id_business_unit }),
    });

    const breadcrumbItems = [
        { label: t('account_creditor'), isCurrent: true },
    ];

    const [dashboardData, setDashboardData] = useState<any>({ debt_balance: 0, os_balance: 0, total_shop: 0 });

    const [defaultForm, setDefaultFormData] = useState<any>();

    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: '',
        direction: 'asc',
    });
    const [debtShopData, setDebtShopData] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [paymentShopData, setPaymentShopData] = useState<any>([]);
    const [totalPaymentDone, setTotalPaymentDone] = useState<any>(0);
    const [pagePayment, setPagePayment] = useState(1);
    const [pageSizePayment, setPageSizePayment] = useState(PAGE_SIZES[0]);
    const [totalItemsPayment, setTotalItemsPayment] = useState<number>(0);

    const { mutate: fetchShopPayment } = useGlobalMutation(url_api.shopPaymentFindAll, {
        onSuccess: (res: any) => {
            setPaymentShopData(res?.data);
            setTotalItemsPayment(res?.data?.length);
            const total = res?.data?.reduce((prev: any, cur: any) => {
                return cur.amount + prev;
            }, 0);
            setTotalPaymentDone(total);
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });

    const { mutate: fetchDashBoardPayment } = useGlobalMutation(url_api.shopPaymentDashboardFindAll, {
        onSuccess: (res: any) => {
            setDashboardData(res?.data);
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });

    const { mutate: fetchPaymentLog } = useGlobalMutation(url_api.shopPaymentLogFindAll, {
        onSuccess: (res: any) => {
            setDebtShopData(res?.data?.list);
            setTotalItems(res?.data?.total);
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });


    const { mutate: fetchBusinessUnit } = useGlobalMutation(url_api.contractFilter, {
        onSuccess: (res: any) => {
            setBussinessUnit(
                res?.data?.business_unit.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });

    // shop โดยดึง id_business มา
    const { mutate: buGetShop } = useGlobalMutation(url_api.buGetShop, {
        onSuccess: (res: any) => {
            const convert = res?.data?.map((item: any) => ({ value: item.uuid, label: item.name }));
            setShopLists(convert);
        },
        onError: () => {},
    });

    // ดึง bu โดยส่ง id_shop
    const { mutate: fetchShopData } = useShopFindMutation({
        onSuccess: (res) => {
            const convertShop = [{ value: res?.data?.id, label: res?.data?.name }];
            setShopLists(convertShop);
            setBussinessUnit(
                res?.data?.shop_group_relations?.map((item: any) => ({
                    value: item.business_unit.id,
                    label: item.business_unit.name,
                }))
            );

            setShopBuData((prev: any) => ({ ...prev, id_shop: res?.data?.id }));
        },
        onError: (err) => {
   
        },
    });

    const fetchExportCsv = async () => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', `Bearer ${token}`);
        const raw = JSON.stringify({
            ...shopBuData,
            page_size: 50000,
            page: page,
        });
        const requestOptions: any = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };
        return fetch(apiUrl + '/payment/pv/find-all?tab=log', requestOptions)
            .then((response) => response.json())
            .then((result) => result.data)
            .catch((error) => {
                return [];
            });
    };

    const fetchExportCsvPayment = async () => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', `Bearer ${token}`);
        const raw = JSON.stringify({
            ...shopBuData,
            page_size: 50000,
            page: page,
        });
        const requestOptions: any = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };
        return fetch(apiUrl + '/payment/pv/find-all?tab=payment', requestOptions)
            .then((response) => response.json())
            .then((result) => result.data)
            .catch((error) => {
                return [];
            });
    };

    const handleExportAccount = async (filename: any) => {
        if (!isDownloading) {
            setIsDownloading(true);
            const data: any = await fetchExportCsv();
            const worksheet = XLSX.utils.json_to_sheet(
                data.list.map((item: any, index: number) => {
                    return {
                        id: index + 1,
                        created_at: item?.date,
                        amount: item?.count,
                        description: item?.details,
                        price: item?.total_shop,
                    };
                }),
                { header: report_account_csv.map((col: any) => col.id) }
            );
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const headerDisplayNames = report_account_csv.map((col: any) => col.displayName);
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

    const handleExportPaymentShop = async (filename: any) => {
        if (!isDownloading) {
            setIsDownloading(true);
            const data: any = await fetchExportCsvPayment();

            const worksheet = XLSX.utils.json_to_sheet(
                data.map((item: any, index: number) => {
                    return {
                        id: index + 1,
                        created_at: item?.payed_at,
                        description: 'จ่ายเงิน',
                        price: item?.amount,
                        payment_type: item?.bank_name,
                        reference: item?.reference,
                        admin_name: item?.admin_name,
                    };
                }),
                { header: report_paid_shop_csv.map((col: any) => col.id) }
            );
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const headerDisplayNames = report_paid_shop_csv.map((col: any) => col.displayName);
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

    const onSearch = (e: any) => {
        const firstTime = new Date(2022, 0, 1).toISOString();
        const lastTimeOfDay = new Date();
        lastTimeOfDay.setHours(23, 59, 59, 999);

        fetchPaymentLog({ data: { ...e, page: page, page_size: pageSize } });
        fetchShopPayment({ data: { ...e, page: pagePayment, page_size: pageSizePayment } });
        // fetchDashBoardPayment({ data: { ...e } });
        fetchDashBoardPayment({ data: { ...e, start_at: firstTime, end_at: lastTimeOfDay.toISOString() } });
    };

    useEffect(() => {
        const firstTime = new Date(2022, 0, 1).toISOString();
        const lastTimeOfDay = new Date();
        lastTimeOfDay.setHours(23, 59, 59, 999);

        fetchBusinessUnit({});
        if (shopBuData.id_business_unit && shopBuData.id_shop) {
            fetchDashBoardPayment({ data: { ...shopBuData, start_at: firstTime, end_at: lastTimeOfDay.toISOString() } });
            buGetShop({ data: { id_business_unit: shopBuData.id_business_unit } });
        }

        if (role == 'shop') {
            fetchShopData({ data: { id: id_shopStored } });
        }
    }, []);

    useEffect(() => {
        if (shopBuData.id_business_unit && shopBuData.id_shop) {
            fetchPaymentLog({ data: { ...shopBuData, page: page, page_size: pageSize } });
        }
    }, [page, pageSize]);

    useEffect(() => {
        if (shopBuData.id_business_unit && shopBuData.id_shop) {
            fetchShopPayment({ data: { ...shopBuData, page: pagePayment, page_size: pageSizePayment } });
        }
    }, [pagePayment, pageSizePayment]);

    return (
        <>
            <Breadcrumbs items={breadcrumbItems} />
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <h5 className="my-3 text-xl font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">{t('account_creditor')}</h5>
                <div className="invoice-table">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-4">
                        <div className="flex items-center gap-4 w-full bg-gradient-to-r from-emerald-400 to-emerald-300 px-8 py-5 rounded-2xl text-white">
                            <div className="bg-white rounded-[50%] w-16 h-16 flex items-center justify-center">
                                <IconMoney fill="#35d399" className="w-8" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-lg">{t('total_debt')}</p>
                                <h5 className="font-semibold text-2xl">{numberWithCommas(dashboardData?.total_shop)}</h5>
                            </div>
                        </div>
                        <div className=" flex items-center gap-4 w-full bg-gradient-to-r from-red-400 to-red-300 px-8 py-5 rounded-2xl text-white">
                            <div className="bg-white rounded-[50%] w-16 h-16 flex items-center justify-center">
                                <IconMoney2 fill="#f87272" className="w-9" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-lg">{t('total_paid')}</p>
                                <h5 className="font-semibold text-2xl">{numberWithCommas(dashboardData?.debt_balance)}</h5>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full bg-gradient-to-r from-blue-500 to-blue-400 px-8 py-5 rounded-2xl text-white">
                            <div className="bg-white rounded-[50%] w-16 h-16 flex items-center justify-center">
                                <IconMoneyReturn fill="#3b82f6" className="w-9" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-lg">{t('total_outstanding')}</p>
                                <h5 className="font-semibold text-2xl">{numberWithCommas(dashboardData?.os_balance)}</h5>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 custom-select">
                        <h5 className="text-lg font-semibold">{t('past_transactions')}</h5>
                        <Formik initialValues={shopBuData} onSubmit={onSearch} enableReinitialize>
                            {({ setFieldValue, handleReset }) => (
                                <Form className="flex flex-col gap-4 py-4">
                                    <div className="flex gap-3">
                                        <div className="w-[296px]">
                                            <SelectField
                                                label={t('business_unit')}
                                                name="id_business_unit"
                                                id="id_business_unit"
                                                options={businessUnit}
                                                isSearchable={true}
                                                onChange={(e) => {
                                                    if (role !== 'shop') {
                                                        buGetShop({ data: { id_business_unit: e.value } });
                                                    }
                                                    setShopBuData((prev: any) => ({ ...prev, id_business_unit: e.value }));
                                                }}
                                            />
                                        </div>
                                        <div className="w-[296px]">
                                            <SelectField
                                                label={t('shop')}
                                                name="id_shop"
                                                id="id_shop"
                                                isSearchable={true}
                                                disabled={role == 'shop' ? true : shopBuData.id_business_unit ? false : true}
                                                options={shopLists}
                                                onChange={(e) => setShopBuData((prev: any) => ({ ...prev, id_shop: e.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <label>{t('past_transactions')}</label>
                                        <div className="max-w-[200px]">
                                            <DatePicker
                                                name="start_at"
                                                onChange={(value: any) => {
                                                    setFieldValue('start_at', convertDateClientToDb(value));
                                                    setShopBuData((prev: any) => ({ ...prev, start_at: convertDateClientToDb(value) }));
                                                }}
                                            />
                                        </div>
                                        <div className="max-w-[200px]">
                                            <DatePicker
                                                name="end_at"
                                                onChange={(value: any) => {
                                                    setFieldValue('end_at', convertDateClientToDb(value));
                                                    setShopBuData((prev: any) => ({ ...prev, end_at: convertDateClientToDb(value) }));
                                                }}
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <button type="submit" className="btn btn-primary gap-2" disabled={isLoading}>
                                                {isLoading ? <Spinner size="sm" /> : <IconSearch />}
                                                {t('search')}
                                            </button>
                                            <button
                                                type="reset"
                                                className="btn btn-info gap-2"
                                                disabled={isLoading}
                                                onClick={() => {
                                                    // setShopBuData((prev: any) => ({ ...prev, id_business_unit: '', id_shop: '' }));
                                                    // handleReset();
                                                    location.reload();
                                                }}
                                            >
                                                {isLoading ? <Spinner size="sm" /> : <IconRefresh />}
                                                {t('clear_values')}
                                            </button>
                                            {shopBuData?.id_shop && shopBuData?.id_business_unit && role !== 'shop' && (
                                                <div className="flex flex-col">
                                                    <NavLink
                                                        to={'/apps/report/form-payment/' + shopBuData?.id_shop + `?id_business_unit=${shopBuData.id_business_unit}&id_shop=${shopBuData?.id_shop}`}
                                                        className="btn btn-success gap-2 w-full h-[40px]"
                                                    >
                                                        {t('make_payment')}
                                                    </NavLink>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>

                    <div className=" flex-1">
                        <Tab.Group>
                            <Tab.List className=" flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                <Tab as={Fragment}>
                                    {({ selected }) => (
                                        <button
                                            className={`${
                                                selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black` : ''
                                            } dark:hover:border-b-black -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}
                                        >
                                            {t('paid')}
                                        </button>
                                    )}
                                </Tab>
                                <Tab as={Fragment}>
                                    {({ selected }) => (
                                        <button
                                            className={`${
                                                selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black` : ''
                                            } dark:hover:border-b-black -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}
                                        >
                                            {t('shop_creditor')}
                                        </button>
                                    )}
                                </Tab>
                            </Tab.List>
                            <Tab.Panels>
                                <Tab.Panel>
                                    <div className="py-4 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-lg">{t('transaction_list')} {totalItemsPayment} {t('transactions')}</h5>
                                            <div className="flex flex-col">
                                                <button
                                                    type="button"
                                                    className="btn btn-success gap-2 w-full h-[40px]"
                                                    onClick={() => handleExportPaymentShop(`report_payment_shop_${new Date().toLocaleString()}`)}
                                                >
                                                    {t('export')}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="datatables pagination-padding">
                                            <DataTable
                                                className="whitespace-nowrap table-hover invoice-table"
                                                records={paymentShopData}
                                                columns={[
                                                    {
                                                        accessor: 'index',
                                                        title: t('sequence'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any, index: number) => <p>{(pagePayment - 1) * pageSizePayment + (index + 1)}</p>,
                                                    },
                                                    {
                                                        accessor: 'created_at',
                                                        title: t('date'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{convertDateTimeToApiByBangkok(item?.payed_at)}</p>,
                                                    },
                                                    {
                                                        accessor: 'description',
                                                        title: t('description'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{t('make_payment')}</p>,
                                                    },
                                                    {
                                                        accessor: 'price',
                                                        title: t('amount'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{numberWithCommas(item?.amount)}</p>,
                                                    },
                                                    {
                                                        accessor: 'payment_type',
                                                        title: t('payment_channel'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{item?.bank_name}</p>,
                                                    },
                                                    {
                                                        accessor: 'id_reference',
                                                        title: t('reference_number'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{item?.reference || '-'}</p>,
                                                    },
                                                    {
                                                        accessor: 'action_who',
                                                        title: t('operator'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{item?.admin_name}</p>,
                                                    },
                                                    {
                                                        accessor: 'action',
                                                        title: t('action'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item) => (
                                                            <div className="flex gap-4 items-center w-max mx-auto">
                                                                <a
                                                                    href={`/apps/report/form-payment/preview/${item.id_payment}?id_shop=${shopBuData.id_shop}`}
                                                                    className="flex cursor-pointer items-center relative group"
                                                                >
                                                                    <IconEye className="w-4.5 h-4.5 flex items-center transition-opacity duration-200 group-hover:opacity-0" />
                                                                    <p className="absolute left-[-10px] text-center text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                                        {t('view_data')}
                                                                    </p>
                                                                </a>
                                                            </div>
                                                        ),
                                                    },
                                                ]}
                                                minHeight={200}
                                                // page={pagePayment}
                                                // highlightOnHover
                                                // totalRecords={totalItemsPayment}
                                                // recordsPerPage={pageSizePayment}
                                                // onPageChange={(p) => setPagePayment(p)}
                                                // recordsPerPageOptions={PAGE_SIZES}
                                                // onRecordsPerPageChange={(p) => {
                                                //     setPagePayment(1);
                                                //     setPageSizePayment(p);
                                                // }}
                                                // paginationText={({ from, to, totalRecords }) => `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`}
                                            />
                                            <div className="rounded-b-md mt-2 bg-blue-200 h-[50px] flex justify-between items-center px-5">
                                                <p className="text-black font-semibold">{t('total_sum')}</p>
                                                <p className="text-black font-semibold">{numberWithCommas(totalPaymentDone)} {t('baht')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Panel>
                                <Tab.Panel>
                                    <div className="py-4 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-lg">{t('transaction_list')} {totalItems} {t('transactions')}</h5>
                                            <div className="flex flex-col">
                                                <button
                                                    type="button"
                                                    className="btn btn-success gap-2 w-full h-[40px]"
                                                    onClick={() => handleExportAccount(`report_account_${new Date().toLocaleString()}`)}
                                                >
                                                    {t('export')}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="datatables pagination-padding">
                                            <DataTable
                                                className="whitespace-nowrap table-hover invoice-table"
                                                records={debtShopData}
                                                columns={[
                                                    {
                                                        accessor: 'index',
                                                        title: t('sequence'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any, index: number) => <p>{(page - 1) * pageSize + (index + 1)}</p>,
                                                    },
                                                    {
                                                        accessor: 'created_at',
                                                        title: t('date'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{item?.date}</p>,
                                                    },
                                                    {
                                                        accessor: 'amount',
                                                        title: t('item_count'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{item?.count} {t('items')}</p>,
                                                    },
                                                    {
                                                        accessor: 'description',
                                                        title: t('description'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{item?.details}</p>,
                                                    },
                                                    {
                                                        accessor: 'price',
                                                        title: t('amount'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item: any) => <p>{numberWithCommas(item?.total_shop)}</p>,
                                                    },
                                                    {
                                                        accessor: 'action',
                                                        title: t('action'),
                                                        textAlignment: 'center',
                                                        sortable: false,
                                                        render: (item) => (
                                                            <div className="flex gap-4 items-center w-max mx-auto">
                                                                {/* <Tippy content="ดูข้อมูล" theme="Primary">
                                                                    <a href={`/apps/report/account-creditor/detail/${shopBuData.id_shop}?start_at=${shopBuData.start_at}&end_at=${shopBuData.end_at}`} target="_blank" className="flex cursor-pointer active">
                                                                        <IconEye  className="w-4.5 h-4.5 " />
                                                                    </a>
                                                                </Tippy> */}
                                                                <a
                                                                    href={`/apps/report/account-creditor/detail/${shopBuData.id_shop}?start_at=${item.date}&end_at=${item.date}&id_business_unit=${shopBuData.id_business_unit}`}
                                                                    className="flex cursor-pointer items-center relative group"
                                                                >
                                                                    <IconEye className="w-4.5 h-4.5 flex items-center transition-opacity duration-200 group-hover:opacity-0" />
                                                                    <p className="absolute left-[-10px] text-center text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                                        {t('view_data')}
                                                                    </p>
                                                                </a>
                                                            </div>
                                                        ),
                                                    },
                                                ]}
                                                minHeight={200}
                                                page={page}
                                                highlightOnHover
                                                totalRecords={totalItems}
                                                recordsPerPage={pageSize}
                                                onPageChange={(p) => setPage(p)}
                                                recordsPerPageOptions={PAGE_SIZES}
                                                onRecordsPerPageChange={(p) => {
                                                    setPage(1);
                                                    setPageSize(p);
                                                }}
                                                paginationText={({ from, to, totalRecords }) => `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('entries')}`}
                                            />
                                        </div>
                                    </div>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountCreditor;
