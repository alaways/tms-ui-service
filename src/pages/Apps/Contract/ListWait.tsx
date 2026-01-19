import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { Contract } from '../../../types';
import { PAGE_SIZES } from '../../../helpers/config';
import { Form, Formik } from 'formik';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import DatePicker from '../../../components/HOC/DatePicker';
import SelectField from '../../../components/HOC/SelectField';
import InputField from '../../../components/HOC/InputField';
import { url_api } from '../../../services/endpoints';
import { columns_csv } from '../../../helpers/constant';
import { useGlobalChatMutation, useGlobalMutation } from '../../../helpers/globalApi';
import { convertDateClientToDb, convertDateDbToClient } from '../../../helpers/formatDate';
import IconOpenBook from '../../../components/Icon/IconOpenBook';
import PreLoading from '../../../helpers/preLoading';
import DateRangeAntd from '../../../components/HOC/DateRangeAntd';
import IconChecks from '../../../components/Icon/IconChecks';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const mode = process.env.MODE || 'admin';

const ListWait = () => {
    const storedUser = localStorage.getItem(mode);
    const apiUrl = process.env.BACKEND_URL;
    const dispatch = useDispatch()
    const { t } = useTranslation();

    const role = storedUser ? JSON.parse(storedUser).role : null;
    const token = storedUser ? JSON.parse(storedUser).access_token : null;

    const [contractList, setContractList] = useState<Contract[]>([]);
    const [page, setPage] = useState(1);
    const [prevPageSize, setPrevPageSize] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [businessUnit, setBusinessUnit] = useState<any>([]);
    const [status, setStatus] = useState<any>([]);

    const [isDownloading, setIsDownloading] = useState<any>(false);
    const [filterValues, setFilterValues] = useState({});
    const [contractUnread, setContractUnread] = useState<any>([]);

    const goEdit = (item: any) => {
        open('/apps/contract/' + item.id + '/' + item.uuid, '_blank');
    };


    const handleSubmit = (values: any, { resetForm }: any) => {
            const params = {
            ...values,
            status_type: 'credit',
            start_at: '',
            end_at: '',
            page: 1,
            page_size: pageSize,
            ...(values?.contract_date[0] && {
                contract_date: values?.contract_date[0],
                contract_end_date: values?.contract_date[1],
            }),

            ...(values?.closed_at[0] && {
                closed_at: values?.closed_at[0],
                closed_end_at: values?.closed_at[1],
            }),

            ...(values?.approved_at[0] && {
                approved_at: values?.approved_at[0],
                approved_end_at: values?.approved_at[1],
            }),
            is_completed:values?.is_completed,
        };
          delete params?.contract_close_date
         setFilterValues(params);
         fetchContractData({ data: params });
    };

    // const onSearch = (values: any) => {

    // };

    const { mutate: fetchContractGetStatus } = useGlobalMutation(url_api.contractFilter, {
        onSuccess: (res: any) => {
            setBusinessUnit(
                res.data.business_unit.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );
            setStatus(
                res.data.status
                    .filter((item: any) => [11, 12, 13, 14, 15, 16, 17,33, 34, 18].includes(+item.status_code))
                    .map((item: any) => ({
                        value: item.status_code,
                        label: item.name,
                    }))
            );
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });
    //
    const { mutate: fetchContractData, isLoading: isLoadingContract } = useGlobalMutation(url_api.contractWaitFindAll, {
        onSuccess: (res: any) => {
            setContractList(res.data.list);
            setTotalItems(res.data.total);
            getUnread({
                data: {
                    contract_list: res.data?.ids,
                },
            });
        },
        onError: () => {
            console.error('Failed to fetch contract data');
        },
    });

    const { mutate: getUnread } = useGlobalChatMutation('/chat/check-unread', {
        onSuccess: (res: any) => {
            setContractUnread(res?.data);
        },
    });

    const fetchExportCsv = async () => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', `Bearer ${token}`);
        const raw = JSON.stringify({...filterValues,page:1,page_size:999999,format:'excel'});
        const requestOptions: any = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };
        return fetch(apiUrl + url_api.contractWaitFindAll, requestOptions)
            .then((response) => response.json())
            .then((result) => result.data)
            .catch((error) => {
                // console.error(error)
                return [];
            });
    };

    const handleExport = async (filename: string, values: any) => {
        if (!isDownloading) {
            setIsDownloading(true);

            const data: any = await fetchExportCsv();
            const headers = columns_csv.map(col => col.id);
            const headerDisplayNames = columns_csv.map(col => col.displayName || col.id);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
            worksheet.addRow(headerDisplayNames);

            data.forEach((row: any) => {
                const rowData = headers.map(key => row?.[key] ?? '');
                worksheet.addRow(rowData);
            });

            worksheet.columns.forEach((column, i) => {
                column.width = Math.max(10, headerDisplayNames[i]?.length || 10);
            });

            const buffer = await workbook.xlsx.writeBuffer();

            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsDownloading(false);
        }
    };


    const columns: any = [
        {
            accessor: 'index',
            title: t('order'),
            textAlignment: 'center',
            render: (_row: any, index: number) => <p>{index + 1 + (page - 1) * pageSize}</p>,
        },

        {
            accessor: 'close_contract_at',
            title: t('contract_close_date'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ? <p className="pointer">{convertDateDbToClient(item?.close_contract_at) ?? '-'}</p> :  '-'

            }
        },

        mode !== 'shop'
            ? {
                accessor: 'credit',
                title: t('operation_status'),
                textAlignment: 'left',
                sortable: false,
                render: (item: any) => <p>{item.credit?.code ?? '-'}</p>,
            }
            : null,
        {
            accessor: 'id',
            title: t('contract_number'),
            textAlignment: 'center',
            sortable: false,
            render: (item: any) => {
                type ContractUnread = {
                    id_contract: number;
                    unread: number;
                };
                const unreadStatus = contractUnread?.find((c: ContractUnread) => c.id_contract === item.id)?.unread;


                 return ((role == 'shop' && item?.is_view == 1 || role != 'shop')) ? (
                    <>
                        <div className="pointer flex items-center space-x-2 active" onClick={() => goEdit(item)}>
                            <span className={`w-3 h-3 rounded-full ${unreadStatus > 0 ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                            <span>{item.reference}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${unreadStatus > 0 ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                            <span>{item.reference}</span>
                        </div>
                    </>
                )
            },
        },
        mode !== 'business_unit' && {
            accessor: 'business_unit',
            title: 'หน่วยธุรกิจ',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p className="pointer">{item?.business_unit?.name}</p>,
        },
        {
            accessor: 'shop',
            title: t('shop'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p>{item.shop.name}</p>,
        },
        {
            accessor: 'contract_type',
            title: 'ประเภทสัญญา',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p>{item?.contract_type?.name}</p>,
        },
        {
            accessor: 'ins_due_at',
            title: 'งวดแรกเริ่มเมื่อ',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
                    return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ? <p className="pointer">{convertDateDbToClient(item?.ins_due_at) ?? '-'}</p> :  '-'
            }
        },
        {
            accessor: 'contract_date',
            title: 'วันที่ทำสัญญา',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ? <p className="pointer">{convertDateDbToClient(item?.contract_date) ?? '-'}</p> :  '-'

            }
        },
        {
            accessor: 'approved_at',
            title: 'วันที่อนุมัติ',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
               return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ? <p className="pointer">{convertDateDbToClient(item?.approved_at) ?? '-'}</p> :  '-'
            }
        },
        {
            accessor: 'customer',
            title: 'ชื่อลูกค้า',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.customer.name}</p>:  '-'
            }
        },
        {
            accessor: 'ins_pay_day',
            title: 'ชำระทุกวันที่',
            textAlignment: 'center',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.ins_pay_day}</p>:  '-'
            }
        },
        {
            accessor: 'ins_amount',
            title: 'ค่างวด',
            textAlignment: 'center',
            sortable: false,
            render: (item: any) =>{
                 return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.ins_amount ? item.ins_amount.toLocaleString('en-US') : '-'}</p>:  '-'
            }
        },
        {
            accessor: 'price',
            title: 'ราคา',
            textAlignment: 'right',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.price ? item.price.toLocaleString('en-US') : '-'}</p>:  '-'
            }
        },
        {
            accessor: 'down_payment',
            title: 'ชำระเงินดาวน์',
            textAlignment: 'right',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.down_payment ? item.down_payment.toLocaleString('en-US') : '-'}</p>:  '-'
            }
        },
        {
            accessor: 'principle',
            title: 'ทุนเช่าซื้อ',
            textAlignment: 'right',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.principle ? item.principle.toLocaleString('en-US') : '-'}</p>:  '-'
            }
        },
        {
            accessor: 'ins_period',
            title: 'จำนวนงวด',
            textAlignment: 'center',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item?.ins_period ?? '-'}</p>:  '-'
            }
        },
        // {
        //     accessor: 'is_completed',
        //     title: 'สถานะ',
        //     textAlignment: 'left',
        //     sortable: false,
        //     render: (item: any) =>{
        //         return ((role == 'shop' && item?.is_view == 1))  ? '-' :  <p>{item.is_completed ? 'สิ้นสุดสัญญา' : 'รอดำเนินการ'}</p>
        //     }
        // },
        {
            accessor: 'customer_signature_at',
            title: 'ลงนามออนไลน์',
            textAlignment: 'center',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1)  || role != 'shop')  ?
                    <span className={`${item?.customer_signature_at ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                        {item?.customer_signature_at ? <IconChecks className="w-6 h-6" /> : ''}
                    </span>
                :  <></>
            }
        },
        {
            accessor: 'e_contract_status',
            title: 'ลงนาม Ekyc',
            textAlignment: 'center',
            sortable: false,
            render: (item:any) => (
                <span className={`${item?.e_contract_status ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {item?.e_contract_status ? <IconChecks className="w-6 h-6" /> : ''}
                </span>
            ),
        },
        {
            accessor: 'action',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (item: any) => {
              return ((role == 'shop' && item?.is_view == 1) || role != 'shop') && (
                    <div className="flex gap-4 items-center w-max mx-auto">
                    <a
                        className="flex cursor-pointer active"
                        onClick={() => goEdit(item)}
                    >
                        <IconOpenBook />
                    </a>
                    </div>
                )
            }
        },
    ].filter(Boolean);

    useEffect(() => {
        fetchContractGetStatus({ data: { is_approved: true } });
    }, []);

    useEffect(() => {
        fetchContractData({ data: { ...filterValues, page: page, page_size: pageSize } });
    }, [page, pageSize]);

    useEffect(() => {
        dispatch(setPageTitle(t('pending_completion_contract_list')))
    }, [dispatch, t])

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            {(isLoadingContract || isDownloading) && <PreLoading />}
            <div className="invoice-table">
                <div className="flex w-full mb-4.5 px-5 md:items-center md:flex-row flex-col gap-5 custom-select">
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            contract_date: '',
                            contract_end_date: '',
                            closed_at: '',
                            closed_end_at: '',
                            approved_at: '',
                            approved_end_at: '',
                            query: '',
                            status_code: '',
                            id_business_unit: '',
                            is_completed:'all',
                            is_locked: 'all',
                        }}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue, handleReset, values }) => (
                            <Form className="flex flex-col flex-auto gap-2">
                                <div className="flex flex-col sm:flex-row md:flex-row gap-5">
                                    <div className="flex-1">
                                        <SelectField label={t('business_unit')} placeholder={t('select_business_unit')} isSearchable={true} id="id_business_unit" name="id_business_unit" options={businessUnit} />
                                    </div>
                                    <div className="flex-1">
                                        <SelectField label={t('operation_status')} placeholder={t('select_status')} isSearchable={true} id="status_code" name="status_code" options={status} />
                                    </div>
                                    <SelectField
                                        label={t('device_lock_status')}
                                        placeholder={t('select_device_lock_status')}
                                        isSearchable={true}
                                        id="is_locked"
                                        name="is_locked"
                                        options={[
                                            {
                                                value: 'all',
                                                label: t('all'),
                                            },
                                            {
                                                value: 'locked',
                                                label: t('locked'),
                                            },
                                            {
                                                value: 'unlocked',
                                                label: t('unlocked'),
                                            },
                                        ]}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row md:flex-row gap-5 pt-3">
                                    <DateRangeAntd label={t('contract_date')} name="contract_date" />
                                    <DateRangeAntd label={t('contract_approval_date')} name="approved_at" />
                                    <div className="flex-1">
                                        <DateRangeAntd label={t('contract_close_date')} name="closed_at" />
                                    </div>
                                </div>

                               <div className="flex flex-col sm:flex-row md:flex-row gap-5 pt-3">

                                    <div className="flex-1">
                                        <InputField label={t('search')} id="query" name="query" />
                                    </div>
                                    <div className="flex flex-col sm:flex-row md:flex-row gap-5 justify-end items-start sm:items-end flex-1">
                                        <button type="submit" className="btn btn-primary gap-2 w-full h-[40px] sm:w-auto">
                                        {t('search_text')}
                                        </button>
                                        <button
                                        type="reset"
                                        className="btn btn-info gap-2 w-full sm:w-auto"
                                        onClick={() => {
                                            location.reload()
                                        }}
                                        >
                                        {t('clear')}
                                        </button>
                                        {(role === 'admin' || role === 'business_unit') && (
                                        <button
                                            type="button"
                                            className="btn btn-success gap-2 w-full h-[40px] sm:w-auto"
                                            onClick={() => {
                                            handleExport(`contract_${new Date().toLocaleString()}`, '');
                                            }}
                                        >
                                            {t('export')}
                                        </button>
                                        )}
                                    </div>
                                    </div>


                            </Form>
                        )}
                    </Formik>
                </div>

                <div className="datatables pagination-padding">
                    {contractList.length == 0 ? (
                        <div className="my-10 text-center text-gray-500">{t('not_found_data')}</div>
                    ) : (
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={contractList}
                            columns={columns}
                            page={page}
                            totalRecords={totalItems}
                            recordsPerPage={pageSize}
                            onPageChange={(e) => setPage(e)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={(p) => {
                                setPage(1);
                                setPageSize(p);
                            }}
                            highlightOnHover
                            paginationText={({ from, to, totalRecords }) => `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total_pages')}`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListWait;
