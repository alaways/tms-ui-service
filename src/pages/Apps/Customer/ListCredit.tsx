import { useEffect, useMemo, useState } from 'react';
import { Contract } from '../../../types';
import { DataTable } from 'mantine-datatable';
import IconOpenBook from '../../../components/Icon/IconOpenBook';
import { convertDateDbToClient } from '../../../helpers/formatDate';
import { PAGE_SIZES } from '../../../helpers/config';
import { useParams } from 'react-router-dom';
import IconSearch from '../../../components/Icon/IconSearch';
import { debounce } from 'lodash';
import Breadcrumbs from '../../../helpers/breadcrumbs';
import { url_api } from '../../../services/endpoints';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { useTranslation } from 'react-i18next';

const mode = process.env.MODE || 'admin';

const ListCredit = () => {
    const { t } = useTranslation();
    const { id } = useParams();

    const storedUser = localStorage.getItem(mode);
    const id_bussiness = storedUser ? JSON.parse(storedUser).id_business_unit : null;
    const role = storedUser ? JSON.parse(storedUser).role : null;

    const [contractList, setContractList] = useState<Contract[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [hasFetchedInitially, setHasFetchedInitially] = useState(false);

    const [contractUnread, setContractUnread] = useState<any>([]);

    const breadcrumbItems = [
        { to: '/apps/customer/list', label: t('customer') },
        { to: `/apps/customer/edit/${id}`, label: t('info') },
        { label: t('contracts_in_progress'), isCurrent: true },
    ];

    const column: any = [
        {
            accessor: 'index',
            title: t('sequence'),
            textAlignment: 'center',
            render: (_row: any, index: any) => <p>{index + 1 + (page - 1) * pageSize}</p>,
        },
        {
            accessor: 'credit',
            title: t('operation_status'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p>{item.credit?.code}</p>,
        },
        // TODO: clean code later
        mode !== 'shop' && {
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
                return (
                    <div className={`${item?.id_business_unit == id_bussiness || role == 'admin' ? 'active pointer' : null}  flex items-center space-x-2 `} onClick={() => goEdit(item)}>
                        <span className={`w-3 h-3 rounded-full ${unreadStatus > 0 ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                        <span>{item.reference}</span>
                    </div>
                );
            },
        },
        // TODO: clean code later
        mode === 'shop' && {
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
                return (
                    <div className={`active pointer flex items-center space-x-2`} onClick={() => goEditShop(item)}>
                        <span className={`w-3 h-3 rounded-full bg-red-500`}></span>
                        <span>{item.reference}</span>
                    </div>
                );
            },
        },
        {
            accessor: 'business_unit',
            title: t('business_unit'),
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
            accessor: 'ins_due_at',
            title: t('first_installment_start'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p className="pointer">{convertDateDbToClient(item?.ins_due_at) ?? '-'}</p>,
        },
        {
            accessor: 'contract_date',
            title: t('contract_date'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p className="pointer">{convertDateDbToClient(item?.contract_date) ?? '-'}</p>,
        },
        {
            accessor: 'approved_at',
            title: t('approval_date'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <div className="pointer">{item.approved_at !== null ? convertDateDbToClient(item?.approved_at) : '-'}</div>,
        },
        {
            accessor: 'customer',
            title: t('customer_name'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p>{item.customer.name}</p>,
        },
        {
            accessor: 'ins_pay_day',
            title: t('payment_due_day'),
            textAlignment: 'center',
            sortable: false,
            render: (item: any) => <p>{item.ins_pay_day}</p>,
        },
        {
            accessor: 'ins_amount',
            title: t('installment_amount'),
            textAlignment: 'center',
            sortable: false,
            render: ({ ins_amount }: any) => <p>{ins_amount ? ins_amount.toLocaleString('en-US') : '-'}</p>,
        },
        {
            accessor: 'price',
            title: t('price'),
            textAlignment: 'right',
            sortable: false,
            render: ({ price }: any) => <p>{price ? price.toLocaleString('en-US') : '-'}</p>,
        },
        {
            accessor: 'down_payment',
            title: t('down_payment'),
            textAlignment: 'right',
            sortable: false,
            render: ({ down_payment }: any) => <p>{down_payment ? down_payment.toLocaleString('en-US') : '-'}</p>,
        },
        {
            accessor: 'principle',
            title: t('lease_principal'),
            textAlignment: 'right',
            sortable: false,
            render: ({ principle }: any) => <p>{principle ? principle.toLocaleString('en-US') : '-'}</p>,
        },
        {
            accessor: 'ins_period',
            title: t('installment_period'),
            textAlignment: 'center',
            sortable: false,
        },
        // TODO: clean code later
       
        mode !== 'shop' && {
            accessor: 'action',
            title: t('actions'),
            sortable: false,
            textAlignment: 'center',
            render: (item: any) => (
                <div className="flex gap-4 items-center w-max mx-auto">
                    <a className={`flex ${item?.id_business_unit == id_bussiness || role == 'admin' ? 'active cursor-pointer' : null}`} onClick={() => goEdit(item)}>
                        <IconOpenBook />
                    </a>
                </div>
            ),
        },
         mode === 'shop' && {
            accessor: 'action',
            title: t('actions'),
            sortable: false,
            textAlignment: 'center',
            render: (item: any) => (
                <div className="flex gap-4 items-center w-max mx-auto">
                    <a className={`active cursor-pointer`} onClick={() => goEditShop(item)}>
                        <IconOpenBook />
                    </a>
                </div>
            ),
        },
    ].filter(Boolean);

    const { mutate: getHistory } = useGlobalMutation(url_api.contractFindAllHistory, {
        onSuccess: (res: any) => {
            setContractList(res.data.list);
            setTotalItems(res.data.total);
        },
        onError: (err: any) => {},
    });
    // TODO: clean code later
    const goEdit = (item: any) => {
        if (item.id_business_unit == id_bussiness || role == 'admin') {
            open('/apps/contract/' + item.id + '/' + item.uuid, '_blank');
        }
    };

    const goEditShop = (item: any) => {
        open('/apps/contract/' + item.id + '/' + item.uuid, '_blank');
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPage(1);
        setSearch(e.target.value);
    };

    const fetchHistory = () => {
        const params = {
            data: {
                page: page,
                page_size: pageSize,
                id_customer: id,
            },
        };
        getHistory(params);
    };

    const debouncedFetchCustomerData = useMemo(
        () =>
            debounce((searchValue) => {
                const params = {
                    data: {
                        page: 1,
                        page_size: pageSize,
                        id_customer: id,
                        query: searchValue,
                    },
                };
                getHistory(params);
            }, 500),
        [getHistory, search]
    );

    useEffect(() => {
        if (hasFetchedInitially) {
            debouncedFetchCustomerData(search);
        }
        return () => {
            debouncedFetchCustomerData.cancel();
        };
    }, [search, debouncedFetchCustomerData]);

    useEffect(() => {
        fetchHistory();
        setHasFetchedInitially(true);
    }, [page, pageSize]);

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between flex-wrap">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
                    <h2 className="text-xl">{t('contracts_in_progress')} : {contractList[0]?.customer?.name}</h2>
                </div>
                <div className="flex items-center justify-end flex-wrap gap-4 mb-4.5 px-5 ">
                    <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto ">
                        <div className="flex flex-row gap-3">
                            <div className="relative">
                                <input type="text" placeholder={t('search_text')} className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={handleSearch} />
                                <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                                    <IconSearch className="mx-auto" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="datatables pagination-padding">
                    {contractList.length === 0 ? (
                        <div className="my-10 text-center text-gray-500">{t('not_found_data')}</div>
                    ) : (
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={contractList}
                            columns={column}
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

export default ListCredit;
