import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { DataTable } from 'mantine-datatable';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { Formik, Form } from 'formik';
import Select from 'react-select';
import DatePicker from '../../../components/HOC/DatePicker';
import SelectField from '../../../components/HOC/SelectField';

import { Contract } from '../../../types/index';
import { PAGE_SIZES } from '../../../helpers/config';
import { url_api } from '../../../services/endpoints';
import { columns_csv } from '../../../helpers/constant';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { convertDateClientToDb, convertDateDbToClient } from '../../../helpers/formatDate';
import InputField from '../../../components/HOC/InputField';
import IconOpenBook from '../../../components/Icon/IconOpenBook';
import { useGlobalChatMutation } from '../../../helpers/globalApi';
import PreLoading from '../../../helpers/preLoading';
import DateRangeAntd from '../../../components/HOC/DateRangeAntd';
import { Dialog, Transition } from '@headlessui/react';
import React from 'react';
import Swal from 'sweetalert2';
const mode = process.env.MODE || 'admin';

const SearchContract = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('รายการสัญญา'));
    }, [dispatch]);

    const storedUser = localStorage.getItem(mode);

    const role = storedUser ? JSON.parse(storedUser).role : null;
    const token = storedUser ? JSON.parse(storedUser).access_token : null;

    const [contractList, setContractList] = useState<Contract[]>([]);
    const [page, setPage] = useState(1);
    const [prevPageSize, setPrevPageSize] = useState(1);
    const [prevQuery, setPrevQuery] = useState<any>('');
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [contractUnread, setContractUnread] = useState<any>([]);

    const { mutate: fetchContractData, isLoading: isLoadingContract } = useGlobalMutation(url_api.contractSearch, {
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

    useEffect(() => {
        const isPageSizeChanged = prevPageSize !== pageSize;
        const isQueryChanged = prevQuery !== query;
        fetchContractData({ data: {
                query:query,
                page: isPageSizeChanged  || isQueryChanged? 1 : page,
                page_size: pageSize,
            }});

        setPrevPageSize(pageSize);
        setPrevQuery(query)
    }, [page, pageSize,query]);
    

    const goEdit = (item: any) => {
        if(item.contract_hire_type_id == 2){
            open('/apps/contract-lease/' + item.id + '/' + item.uuid, '_blank');
        }else if(item.contract_hire_type_id == 1){
            open('/apps/contract/' + item.id + '/' + item.uuid, '_blank');
        }
    };

    const column: any = [
        {
            accessor: 'index',
            title: 'ลำดับ',
            textAlignment: 'center',
            render: (_row: any, index: any) => <p>{index + 1 + (page - 1) * pageSize}</p>,
        },
        mode !== 'shop' && {
            accessor: 'credit',
            title: 'สถานะดำเนินการ',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p>{item.credit.code}</p>,
        },
        {
            accessor: 'id',
            title: 'เลขสัญญา',
            textAlignment: 'center',
            sortable: false,
            render: (item: any) => {
                type ContractUnread = {
                    id_contract: number;
                    unread: number;
                };
                const unreadStatus = contractUnread?.find((c: ContractUnread) => c.id_contract === item.id)?.unread;
                return (
                    <div className="pointer flex items-center space-x-2 active" onClick={() => goEdit(item)}>
                        <span className={`w-3 h-3 rounded-full ${unreadStatus > 0 ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                        <span>{item.reference}</span>
                    </div>
                );
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
            title: 'ร้านค้า',
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
            render: (item: any) => <p className="pointer">{convertDateDbToClient(item?.ins_due_at) ?? '-'}</p>,
        },
        {
            accessor: 'contract_date',
            title: 'วันที่ทำสัญญา',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => (
                <div>
                    <p className="pointer">{convertDateDbToClient(item?.contract_date) ?? '-'}</p>
                </div>
            ),
        },
        {
            accessor: 'approved_at',
            title: 'วันที่อนุมัติ',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => (
                <div>
                    <p className="pointer">{convertDateDbToClient(item?.approved_at) ?? '-'}</p>
                </div>
            ),
        },
        {
            accessor: 'customer',
            title: 'ชื่อลูกค้า',
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p>{item.customer.name}</p>,
        },
        {
            accessor: 'ins_pay_day',
            title: 'ชำระทุกวันที่',
            textAlignment: 'center',
            sortable: false,
            render: (item: any) => <p>{item.ins_pay_day}</p>,
        },
        {
            accessor: 'ins_amount',
            title: 'ค่างวด',
            textAlignment: 'center',
            sortable: false,
            render: ({ ins_amount }: any) => <p>{ins_amount ? ins_amount.toLocaleString('en-US') : '-'}</p>,
        },
        {
            accessor: 'price',
            title: 'ราคา',
            textAlignment: 'right',
            sortable: false,
            render: ({ price }: any) => <p>{price ? price.toLocaleString('en-US') : '-'}</p>,
        },
        {
            accessor: 'down_payment',
            title: 'ชำระเงินดาวน์',
            textAlignment: 'right',
            sortable: false,
            render: ({ down_payment }: any) => <p>{down_payment ? down_payment.toLocaleString('en-US') : '-'}</p>,
        },
        {
            accessor: 'principle',
            title: 'ทุนเช่าซื้อ',
            textAlignment: 'right',
            sortable: false,
            render: ({ principle }: any) => <p>{principle ? principle.toLocaleString('en-US') : '-'}</p>,
        },
        {
            accessor: 'ins_period',
            title: 'จำนวนงวด',
            textAlignment: 'center',
            sortable: false,
        },
        {
            accessor: 'action',
            title: 'Actions',
            sortable: false,
            textAlignment: 'center',
            render: (item: any) => (
                <div className="flex gap-4 items-center w-max mx-auto">
                    <a className="flex cursor-pointer active" onClick={() => goEdit(item)}>
                        <IconOpenBook />
                    </a>
                </div>
            ),
        },
    ].filter(Boolean);

    return (

        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            {(isLoadingContract) && <PreLoading />}
            <div className="invoice-table">
                 <h2 className='text-center mb-12 text-3xl'> ผลลัพท์การค้นหา : {query}</h2>
                 <div className="datatables pagination-padding">
                     {contractList.length === 0  ? (
                         <div className="my-10 text-center text-gray-500">ไม่พบข้อมูล</div>
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
                             paginationText={({ from, to, totalRecords }) => `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`}
                         />
                     )}
                 </div>
            </div>
        </div>
    );
};

export default SearchContract;
