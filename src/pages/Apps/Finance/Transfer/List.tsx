import { Form, Formik } from 'formik';
import { useEffect, useState,Fragment} from 'react';
import { useTranslation } from 'react-i18next';
import SelectField from '../../../../components/HOC/SelectField';
import { useGlobalMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';
import InputField from '../../../../components/HOC/InputField';
import { statusPaymentType } from '../../../../helpers/constant';
import DateRangeAntd from '../../../../components/HOC/DateRangeAntd';
import { PAGE_SIZES } from '../../../../helpers/config';
import { DataTable } from 'mantine-datatable';
import { useNavigate, NavLink } from 'react-router-dom';
import { convertDateTimeDbToClient } from '../../../../helpers/formatDate';
import { toastAlert } from '../../../../helpers/constant';
import IconRefresh from '../../../../components/Icon/IconRefresh';
import IconEye from '../../../../components/Icon/IconEye';
import { Dialog, Transition } from '@headlessui/react'
import IconX from '../../../../components/Icon/IconX';
import PreLoading from '../../../../helpers/preLoading';
import Swal from 'sweetalert2';
import { numberWithCommas } from '../../../../helpers/formatNumeric';

interface initFilter {
    start_at?: string | null;
    end_at?: string | null;
    id_business_unit?: number | null;
    query?: string;
    status?: string;
    payment_method?: string | null;
}

const initFilter: initFilter = {
    start_at: '',
    end_at: '',
    id_business_unit: null,
    query: '',
    status: '',
    payment_method: '',
};
const mode = process.env.MODE || 'admin'
const List = () => {
    const { t } = useTranslation()
    const navigate = useNavigate();
    const [paymentLists, setPaymentLists] = useState<any[]>([]);
    const [filterParams, setFilterParams] = useState<initFilter>(initFilter);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [prevPageSize, setPrevPageSize] = useState(1);
    const toast = Swal.mixin(toastAlert);
    const [businessUnit, setBusinessUnit] = useState<any>([]);
    const [actionModal, setActionModal] = useState(false)
    const [confirmData, setConfirmData] = useState({
        p_reference:'',
        responseCode:'',
        responseMesg:'',
        bankRefNo:''
    })

    if(mode != 'admin') {
        navigate('/apps/login')
    }
    const { mutate: fetchBusinessUnitData } = useGlobalMutation(url_api.businessUnitFindAll, {
        onSuccess: (res: any) => {
            setBusinessUnit(
                res.data.list.map((item: any) => ({
                    value: item?.id,
                    label: item?.name,
                }))
            );
        },
        onError: () => {
            console.error('Failed to fetch bu data');
        },
    });


    const { mutate: fetchData,isLoading } = useGlobalMutation(url_api.bblFindALL, {
        onSuccess: (res: any) => {
             setPaymentLists(res.data.list)
             setTotalItems(res.data.total)
        },
        onError: () => {
            console.error('Failed to fetch bu data');
        },
    });

     const { mutate: inquiry,isLoading:iqrLoading } = useGlobalMutation(url_api.bblInquiry, {
        onSuccess: (res: any) => {
            setConfirmData(res?.data)
        },
        onError: () => {
            console.error('Failed to fetch bu data');
        },
    });

    const { mutate: inquiryUpdate,isLoading:iqrUpdateLoading } = useGlobalMutation(url_api.bblInquiry, {
        onSuccess: (res: any) => {
            setActionModal(false)
            toast.fire({
                    icon: 'success',
                    title: t('finance_transfer_list_status_success'),
                    padding: '10px 20px',
                });
             fetchData({})
            //setConfirmData(res?.data)
        },
        onError: () => {
            console.error('Failed to fetch bu data');
        },
    });


    const onSubmit = () => {};

    const checkPayment = (item: any = null) => {
        inquiry({data:{reference:item.p_reference}})
        setActionModal(true)

    }

    const goPayment = (item: any = null) => {
        navigate('/apps/finance/transfer/view/'+item.uuid)
    }

    const handleExport = async (filename: any, values: any) => {};

    useEffect(() => {
        fetchBusinessUnitData({});
        fetchData({ data: {page: 1,page_size: pageSize,}})
    }, []);

    useEffect(() => {
        fetchData({ data: {page: page,page_size: pageSize}})
    }, [page]);

     useEffect(() => {
        fetchData({ data: {page: 1,page_size: pageSize}})
    }, [pageSize]);

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            {(isLoading || iqrLoading || iqrUpdateLoading) && <PreLoading />}
            <div className="invoice-table">
                <div className="ml-7 my-5 text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">{t('finance_transfer_list_title')}</div>
            </div>
            <div className="mb-4.5 px-5 md:items-center md:flex-row flex-col gap-5">
                <Formik
                    initialValues={{}}
                    onSubmit={onSubmit}
                    onReset={() => {
                        setFilterParams({
                            start_at: '',
                            end_at: '',
                            id_business_unit: null,
                            query: '',
                            status: '',
                            payment_method: '',
                        });
                        setPage(1);
                        setPaymentLists([]);
                    }}
                >
                    {({ setFieldValue, handleReset, values }) => (
                        <Form className="flex flex-col flex-auto gap-2">
                            <NavLink to={'/apps/finance/transfer/add'}  className="btn btn-primary gap-2 w-28 mb-2">{t('finance_transfer_list_title')}</NavLink>
                            <div className="flex flex-col sm:flex-row md:flex-row gap-5">
                                <SelectField zIndex="z-9" id="id_business_unit" label={t('finance_transfer_list_label_business_unit')} name="id_business_unit" placeholder={t('finance_transfer_list_placeholder_business_unit')} options={businessUnit} />
                                <SelectField zIndex="z-9" id="status" label={t('finance_transfer_list_label_payment_status')} name="status" placeholder={t('finance_transfer_list_placeholder_status')} options={statusPaymentType} />
                            </div>
                            <div className="flex flex-col sm:flex-row md:flex-row gap-5">
                                <InputField label={t('finance_transfer_list_label_search')} placeholder={t('finance_transfer_list_placeholder_search')} name="query" type="text" />
                                <DateRangeAntd label={t('finance_transfer_list_label_date')} name="date_at" />
                                <button type="submit" className="btn btn-primary gap-2 mt-5">
                                    {t('finance_transfer_list_btn_search')}
                                </button>
                                <button
                                    type="reset"
                                    className="btn btn-info gap-2 mt-5"
                                    onClick={() => {
                                        handleReset();
                                    }}
                                >
                                    {t('finance_transfer_list_btn_clear')}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            <div className="datatables pagination-padding">
                {paymentLists.length === 0 ? (
                    <div className="text-center text-gray-500">{t('finance_transfer_list_empty')}</div>
                ) : (
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={paymentLists}
                        columns={[
                            {
                                accessor: 'id',
                                title: t('finance_transfer_list_col_index'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                    const isSummaryRow = item?.isTotalRow;
                                    return !isSummaryRow ? <div>{index + 1 + (page - 1) * pageSize}</div> : null;
                                },
                            },
                            {
                                accessor: 'company',
                                title: t('finance_transfer_list_col_from'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                    return item?.company
                                },
                            },
                            {
                                accessor: 'shop_name',
                                title: t('finance_transfer_list_col_shop'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                    return item?.shop_name
                                },
                            },
                            {
                                accessor: 'bank_name',
                                title: t('finance_transfer_list_col_bank'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                    return item?.bank_name
                                },
                            },
                            {
                                accessor: 'receiverValueType',
                                title: t('finance_transfer_list_col_type'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                    return item?.receiverValueType
                                },
                            },
                            {
                                accessor: 'receiverName',
                                title: t('finance_transfer_list_col_receiver_name'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                    return item?.receiverName
                                },
                            },
                            {
                                accessor: 'receiverValue',
                                title: t('finance_transfer_list_col_receiver_account'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                    return item?.receiverValue
                                },
                            },
                            {
                                accessor: 'amount',
                                title: t('finance_transfer_list_col_amount'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                   return  <p>{numberWithCommas(item?.amount)}</p>
                                },
                            },
                          {
                            accessor: 'status',
                            title: t('finance_transfer_list_col_status'),
                            textAlignment: 'center',
                            sortable: false,
                            render: ({ status, isTotalRow }) =>
                                isTotalRow ? null : (
                                <div className="flex text-center justify-center font-normal">
                                    <div
                                    className={`badge ${
                                        status === 'complete'
                                        ? 'badge-outline-success'
                                        : status === 'pending'
                                        ? 'badge-outline-warning'
                                        : status === 'wait_to_update'
                                        ? 'badge-outline-secondary'
                                        : 'badge-outline-danger'
                                    }`}
                                    >
                                    {status === 'complete'
                                        ? t('finance_transfer_list_status_success')
                                        : status === 'pending'
                                        ? t('finance_transfer_list_status_pending')
                                        : status === 'wait_to_update'
                                        ? t('finance_transfer_list_status_wait_update')
                                        : t('finance_transfer_list_status_failed')}
                                    </div>
                                </div>
                                ),
                            },
                            {
                                accessor: 'payed_at',
                                title: t('finance_transfer_list_col_payment_date'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                    return convertDateTimeDbToClient(item?.payed_at)
                                },
                            },
                            {
                                accessor: 'created_at',
                                title: t('finance_transfer_list_col_transaction_date'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => {
                                    return convertDateTimeDbToClient(item?.created_at)
                                },
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: (item) =>
                                    item.isTotalRow ? null : (
                                    <div className="flex gap-4 items-center w-max mx-auto">
                                        <>
                                        {
                                            (item?.status == 'pending' || item?.status == 'wait_to_update') && (
                                            <div className="bg-[#E5E4E2] w-8 h-8 rounded-full flex items-center justify-center text-white">
                                                <a className="flex cursor-pointer active" onClick={() => checkPayment(item)}>
                                                <IconRefresh className="w-4.5 h-4.5" />
                                                </a>
                                            </div>)
                                        }

                                        <div className="bg-[#E5E4E2] w-8 h-8 rounded-full flex items-center justify-center text-white">
                                            <a className="flex cursor-pointer active" onClick={() => goPayment(item)}>
                                            <IconEye className="w-4.5 h-4.5" />
                                            </a>
                                        </div>

                                        </>
                                    </div>
                                    ),
                                },

                        ]}
                        page={page}
                        totalRecords={totalItems}
                        recordsPerPage={pageSize}
                        recordsPerPageOptions={PAGE_SIZES}
                        onPageChange={(p) => setPage(p)}
                        onRecordsPerPageChange={(p) => {
                            setPage(1);
                            setPageSize(p);
                        }}
                        paginationText={({ from, to, totalRecords }) => t('finance_transfer_list_pagination', { from, to, totalRecords })}
                    />
                )}
            </div>
        <Transition appear show={actionModal} as={Fragment}>
            <Dialog as="div" open={actionModal} onClose={() => {
                setActionModal(false)
            }} className="relative z-[51]">
                <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                >
                <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center px-4 py-8">
                    <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                    >
                    <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark" style={{maxWidth:'40rem'}}>
                        <button
                        type="button"
                        onClick={() => {
                            setActionModal(false)
                        }}
                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                        >
                        <IconX />
                        </button>
                        <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px] text-center">{t('finance_transfer_list_modal_title_verify')}</div>
                        <div className="p-5">

                        <div className="p-5">
                            <div className="mb-5 space-y-1">

                            <div className="flex items-center justify-between">
                                <p className="text-[#515365] font-semibold">{t('finance_transfer_list_modal_title_status')} </p>
                                <p className="text-base">
                                <span className="font-semibold">{confirmData?.responseMesg ?? ''}</span>
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[#515365] font-semibold">BBL transaction</p>
                                <p className="text-base">
                                <span className="font-semibold">{confirmData?.bankRefNo ?? '-'}</span>
                                </p>
                            </div>

                            </div>
                            <div className="text-center px-2 flex justify-around">

                            {confirmData?.bankRefNo ?
                                <button type="button" className="btn btn-success" onClick={() => {
                                    inquiryUpdate({data:{reference:confirmData.p_reference,callback:true}})
                                }}>
                                    {t('finance_transfer_list_btn_transfer')}
                                </button>
                            :(
                                <button type="button" className="btn btn-success" disabled>
                                {t('finance_transfer_list_btn_transfer')}
                                </button>
                            )}
                            </div>
                        </div>
                        </div>
                    </Dialog.Panel>
                    </Transition.Child>
                </div>
                </div>
            </Dialog>
        </Transition>
        </div>
    );
};

export default List;
