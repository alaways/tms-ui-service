import { Formik } from 'formik';
import Breadcrumbs from '../../../helpers/breadcrumbs';

import moment from 'moment';

import * as XLSX from 'xlsx';

import DatePicker from '../../../components/HOC/DatePicker';
import { useEffect, useState } from 'react';
import { convertDateClientToDb, convertDateDbToClient } from '../../../helpers/formatDate';
import { DataTable } from 'mantine-datatable';
import { PAGE_SIZES } from '../../../helpers/config';
import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { numberWithCommas } from '../../../helpers/formatNumeric';
import { useShopFindMutation } from '../../../services/mutations/useShopMutation';
import { Shop } from '../../../types';
import { shop_report_csv } from '../../../helpers/constant';
import { url_api } from '../../../services/endpoints';
import { useGlobalMutation } from '../../../helpers/globalApi';

const breadcrumbItems = [
    { to: '/apps/report/account-creditor', label: 'บัญชีเจ้าหนี้ร้านเค้า' },
    { label: 'รายละเอียดเจ้าหนี้ร้านค้า', isCurrent: true },
];

const mode = process.env.MODE || 'admin';

const AccountCreditDetail = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const id_business_unit = searchParams.get('id_business_unit');

    const apiUrl = process.env.BACKEND_URL;
    const storedUser = localStorage.getItem(mode);
    const token = storedUser ? JSON.parse(storedUser).access_token : null;

    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const [shopData, setShopdata] = useState<Shop>();
    const [shopBuData, setShopBuData] = useState<any>({
        start_at: searchParams.get('start_at') ? searchParams.get('start_at') : convertDateClientToDb(`${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`),
        end_at: searchParams.get('end_at') ? searchParams.get('end_at') : convertDateClientToDb(`${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}T00:00:00.000Z`),
        ...(id_business_unit && { id_business_unit: +id_business_unit }),
    });

    const [items, setItems] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);

    const { mutate: fetchCommissionFindAll } = useGlobalMutation(url_api.getCommissionDetailPV, {
        onSuccess: (res:any) => {
            setItems(res.data.list);
            setTotalItems(res.data.total);
        },
        onError: () => {
            console.error('Failed to fetch data comission');
        },
     });

    const { mutate: fetchShopFindOne } = useShopFindMutation({
        onSuccess: (res) => {
            setShopdata(res.data);
        },
        onError: () => {
            console.error('Failed to fetch data comission');
        },
    });

    const fetchExportCsv = async () => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', `Bearer ${token}`);
        const raw = JSON.stringify({
            id_shop: id,
            start_at: shopBuData.start_at,
            end_at: shopBuData.end_at,
            page_size: 50000,
            page: page,
        });
        const requestOptions: any = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };
        return fetch(apiUrl + '/shop/pv/get-commission-detail', requestOptions)
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

    useEffect(() => {
        const params = { page: page, page_size: pageSize, id_shop: id, ...shopBuData };
        fetchCommissionFindAll({ data: params });
    }, [page, pageSize, shopBuData]);

    useEffect(() => {
        fetchShopFindOne({ data: { id: id } });
    }, []);

    return (
        <>
            <Breadcrumbs items={breadcrumbItems} />
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <div className=''>
                    <h5 className="mt-3 text-xl font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">รายละเอียดเจ้าหนี้ร้านค้า : {shopData?.name}</h5>
                </div>
                <div className="pt-4 custom-select">
                    <Formik initialValues={shopBuData} onSubmit={() => {}}>
                        {({ setFieldValue, handleReset }) => (
                            <div className="flex flex-wrap items-center gap-3">
                                <label>การทำรายการที่ผ่านมา</label>
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
                                <button type="submit" className="btn btn-primary gap-2" onClick={() => handleExport(`shop_report_${new Date().toLocaleString()}`)}>
                                    Export
                                </button>
                            </div>
                        )}
                    </Formik>
                </div>

                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={items}
                        columns={[
                            {
                                accessor: 'index',
                                title: 'เลขที่สัญญา',
                                textAlignment: 'center',
                                sortable: false,
                                render: (item) => (
                                    <NavLink to={'/apps/contract/' + item?.contract_id + '/' + item?.contract_uuid} className="flex justify-center text-center font-normal">
                                        <a className="flex cursor-pointer active">{item.reference}</a>
                                    </NavLink>
                                ),
                            },
                            {
                                accessor: 'pv_no',
                                title: 'เลขที่ PV',
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'created_at',
                                title: 'วันที่ทำสัญญา',
                                textAlignment: 'center',
                                sortable: false,
                                render: (item: any) => <p>{convertDateDbToClient(item?.contract_date)}</p>,
                            },
                            {
                                accessor: 'approved_at',
                                title: 'วันที่อนุมัติสัญญา',
                                textAlignment: 'left',
                                sortable: false,
                                render: (item) => {
                                    return convertDateDbToClient(item?.contract_approved_date);
                                },
                            },
                            {
                                accessor: 'contract_status',
                                title: 'สถานะสัญญา',
                                textAlignment: 'left',
                                sortable: false,
                                render: (item) => {
                                    return item?.contract_status || '-';
                                },
                            },
                            {
                                accessor: 'asset.name',
                                title: 'ชื่อทรัพย์สิน',
                                textAlignment: 'left',
                                sortable: false,
                                render: (item) => {
                                    return item?.asset?.name || '0';
                                },
                            },
                            {
                                accessor: 'price',
                                title: 'ราคาขาย',
                                textAlignment: 'right',
                                sortable: false,
                                render: (item) => {
                                    return numberWithCommas(item?.price || '0');
                                },
                            },
                            {
                                accessor: 'down_payment',
                                title: 'เงินดาวน์',
                                textAlignment: 'right',
                                sortable: false,
                                render: (item) => {
                                    return numberWithCommas(item?.down_payment || '0');
                                },
                            },
                            {
                                accessor: 'principle',
                                title: 'ทุนเช่าซื้อ',
                                textAlignment: 'right',
                                sortable: false,
                                render: (item) => {
                                    return numberWithCommas(item?.principle || '0');
                                },
                            },
                            {
                                accessor: 'commission',
                                title: 'ค่านายหน้า',
                                textAlignment: 'right',
                                sortable: false,
                                render: (item) => {
                                    return numberWithCommas(item?.commission || '0');
                                },
                            },
                            {
                                accessor: 'benefit',
                                title: 'ผลตอบแทนพิเศษ',
                                textAlignment: 'right',
                                sortable: false,
                                render: (item) => {
                                    return numberWithCommas(item?.benefit || '0');
                                },
                            },
                            {
                                accessor: 'amount',
                                title: 'รวมเป็นเงิน',
                                textAlignment: 'right',
                                sortable: false,
                                render: (item) => {
                                    return numberWithCommas(item?.amount || '0');
                                },
                            },
                            {
                                accessor: 'fee',
                                title: 'ค่าทำสัญญา',
                                textAlignment: 'right',
                                sortable: false,
                                render: (item) => {
                                    return numberWithCommas(item?.fee || '0');
                                },
                            },
                            {
                                accessor: 'total',
                                title: 'คงเหลือให้ร้านค้า',
                                textAlignment: 'right',
                                sortable: false,
                                render: (item) => {
                                    return numberWithCommas(item?.total || '-');
                                },
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
                        paginationText={({ from, to, totalRecords }) => `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`}
                    />
                </div>
            </div>
        </>
    );
};

export default AccountCreditDetail;
