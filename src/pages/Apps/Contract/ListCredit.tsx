import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
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
import IconChecks from '../../../components/Icon/IconChecks';
import { useTranslation } from 'react-i18next';
const mode = process.env.MODE || 'admin';

const ListCredit = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const statusCode = queryParams.get('status');
    const buId = queryParams.get('bu_id');
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(setPageTitle(t('contract_list')));
    }, [dispatch, t]);

    const apiUrl = process.env.BACKEND_URL;
    const storedUser = localStorage.getItem(mode);

    const role = storedUser ? JSON.parse(storedUser).role : null;
    const token = storedUser ? JSON.parse(storedUser).access_token : null;

    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [contractList, setContractList] = useState<Contract[]>([]);
    const [page, setPage] = useState(1);
    const [prevPageSize, setPrevPageSize] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]); //PAGE_SIZES[0]
    const [totalItems, setTotalItems] = useState<number>(0);
    const [status, setStatus] = useState<any>([]);
    const [statusExcel, setStatusExcel] = useState<any>([]);
    const [businessUnit, setBusinessUnit] = useState<any>([]);
    const [filterParams, setFilterParams] = useState<any>({
        ...(statusCode !== null ? { status_code: statusCode, status_type: 'credit' } : {}),
        ...(buId !== null ? { id_business_unit: parseInt(buId) } : {}),
    });

    const [importedContracts, setImportedContracts] = useState<Contract[]>([]);
    const [selectedContracts, setSelectedContracts] = useState<Set<any>>(new Set()); // To track selected contracts
    const [selectAll, setSelectAll] = useState(false); // To track "Select All" checkbox
    const [isFileUploaded, setIsFileUploaded] = useState(false); // To track if file has been uploaded
    const [isNoDataFound, setIsNoDataFound] = useState(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedStatusCode, setSelectedStatusCode] = useState<any>(null);

    const [contractUnread, setContractUnread] = useState<any>([]);
    const { mutate: contractUpdateLockedContracts, isLoading: isLoadingcontractUpdateLockedContracts } = useGlobalMutation(url_api.contractUpdateLockedContracts, {
        onSuccess: (res: any) => {
            Swal.fire({
                icon: 'success',
                title: t('update_success'),
                html: `<span style="color: green;">${t('status_updated_successfully')}</span>`,
                confirmButtonText: t('confirm'),
            }).then(() => {
                window.location.reload();
            });

        },
        onError: () => {
            Swal.fire({
                icon: 'error',
                title: t('update_error'),
                text: t('cannot_update_status'),
                confirmButtonText: t('confirm'),
            });
        },
    });


    const { mutate: fetchContractData, isLoading: isLoadingContract } = useGlobalMutation(url_api.contractApprovedFindAll, {
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

    const { mutate: fetchContractGetStatus, isLoading: isLoadingStatus } = useGlobalMutation(url_api.contractFilter, {
        onSuccess: (res: any) => {
            setBusinessUnit(
                res.data.business_unit.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );

            setStatus(
                res.data.status
                    .filter((item: any) => ![11, 12, 13, 14, 15, 16,17, 33, 34, 18].includes(+item.status_code))
                    .map((item: any) => ({
                        value: item.status_code,
                        label: item.name,
                    }))
            );

            setStatusExcel(
                res.data.status
                    .map((item: any) => ({
                        value: item.status_code,
                        label: item.name,
                    }))
            );
        },

        onError: () => {
            console.error('Failed to fetch status data');
        },
    });


    useEffect(() => {
        fetchContractGetStatus({ data: { is_approved: true } });
    }, []);
    useEffect(() => {
        const isPageSizeChanged = prevPageSize !== pageSize;

        const queryPayload = isFileUploaded && importedContracts.length > 0
            ? {
                reference: importedContracts,
                page: isPageSizeChanged ? 1 : page,
                page_size: pageSize,
            }
            : {
                ...filterParams,
                page: isPageSizeChanged ? 1 : page,
                page_size: pageSize,
            };

        fetchContractData({ data: queryPayload });

        setPrevPageSize(pageSize);
    }, [page, pageSize, isFileUploaded, importedContracts, filterParams]);


    const { mutate: dailyUpdateCredit, isLoading: loadingUpdateCredit } = useGlobalMutation(url_api.dailyUpdateCredit, {
        onSuccess: (res: any) => {
            window.location.reload();
        },
        onError: () => {
            console.error('Failed to fetch status data');
        },
    });
    const updateCredit = () => {
        dailyUpdateCredit({});
    };

    const goEdit = (item: any) => {
        open('/apps/contract/' + item.id + '/' + item.uuid, '_blank');
    };

    const fetchExportCsv = async () => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', `Bearer ${token}`);
        const raw = JSON.stringify({...filterParams,page:1,page_size:999999,format:'excel'});
        const requestOptions: any = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };
        return fetch(apiUrl + url_api.contractApprovedFindAll, requestOptions)
            .then((response) => response.json())
            .then((result) => result.data)
            .catch((error) => {
                console.error("export error",error)
                return [];
            });
    };
    const fetchExportContractOfferCsv = async () => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', `Bearer ${token}`);

        const raw = JSON.stringify({});
        const requestOptions: any = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
        };

        return fetch(apiUrl + url_api.customerContractOfferExport, requestOptions)
            .then((response) => response.json())
            .then((result) => result.data)
            .catch((error) => {
                // console.error(error)
                return [];
            });
    };


    // Function to toggle the "Select All" checkbox
    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedContracts(new Set()); // Deselect all
        } else {
            // Select all by combining id and uuid as a unique key
            const allContractKeys:any = new Set(contractList.map((contract: any) => `${contract.id}_${contract.uuid}`));
            setSelectedContracts(allContractKeys); // Select all
        }
        setSelectAll(!selectAll);  // Toggle the "Select All" checkbox state
    };

    // Function to toggle individual selection
    const toggleSelectContract = (id: any, uuid: string) => {
        const newSelectedContracts = new Set(selectedContracts);
        const contractKey:any = `${id}_${uuid}`; // Combine id and uuid into a unique key

        if (newSelectedContracts.has(contractKey)) {
            newSelectedContracts.delete(contractKey); // Deselect if already selected
        } else {
            newSelectedContracts.add(contractKey); // Select if not selected
        }

        setSelectedContracts(newSelectedContracts); // Update the selection state
    };

    const handleExport = async (filename: string, values: any) => {
        if (!isDownloading) {
            setIsDownloading(true);

            const data: any = await fetchExportCsv();
            const headers = columns_csv.map(col => col.id);
            console.log("columns_csv",columns_csv)
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

    const handleExportContractOffer = async (filename: string) => {
        if (!isDownloading) {
            setIsDownloading(true);

            const data: any = await fetchExportContractOfferCsv();
            const worksheet = XLSX.utils.json_to_sheet(data, { header: columns_csv.map((col) => col.id) });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const headerDisplayNames = columns_csv.map((col) => col.displayName);
            XLSX.utils.sheet_add_aoa(worksheet, [headerDisplayNames], { origin: 'A1' });
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.xlsx`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsDownloading(false);
        }
    };

    const column: any = [
        isFileUploaded && {
            accessor: 'select',
            title: (
                <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="form-checkbox"
                />
            ),
            textAlignment: 'center',
            render: (_row: any, index: any) => (
                <input
                    type="checkbox"
                    checked={selectedContracts.has(`${contractList[index].id}_${contractList[index].uuid}`)} // Check both id and uuid
                    onChange={() => toggleSelectContract(contractList[index].id, contractList[index].uuid)} // Send both id and uuid
                    className="form-checkbox"
                />
            ),
        },
        {
            accessor: 'index',
            title: t('order'),
            textAlignment: 'center',
            render: (_row: any, index: any) => <p>{index + 1 + (page - 1) * pageSize}</p>,
        },
        mode !== 'shop' && {
            accessor: 'credit',
            title: t('operation_status'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p>{item.credit.code}</p>,
        },
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

                
                 return ((role == 'shop' && item?.is_view == 1) || role != 'shop') ? (
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
        // {
        //     accessor: 'shop',
        //     title: 'ร้านค้า / ชื่อลูกค้า',
        //     textAlignment: 'left',
        //     sortable: false,
        //     render: (item: any) => <div className='flex flex-col gap-2'>
        //         <p><span className='pr-[11px]'>ร้านค้า:</span> {item.shop.name}</p>
        //         <p>ชื่อลูกค้า: {item.customer.name}</p>
        //     </div> ,
        // },
        {
            accessor: 'contract_type',
            title: t('contract_type'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => <p>{item?.contract_type?.name}</p>,
        },
        {
            accessor: 'ins_due_at',
            title: t('first_installment_date'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
                 return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ? <p className="pointer">{convertDateDbToClient(item?.ins_due_at) ?? '-'}</p> :  '-'
            }
        },
        {
            accessor: 'contract_date',
            title: t('contract_date'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ? <p className="pointer">{convertDateDbToClient(item?.contract_date) ?? '-'}</p> :  '-'
               
            }
        },
        {
            accessor: 'approved_at',
            title: t('contract_approval_date'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
               return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ? <p className="pointer">{convertDateDbToClient(item?.approved_at) ?? '-'}</p> :  '-'
            }
        },
        {
            accessor: 'customer',
            title: t('customer_name'),
            textAlignment: 'left',
            sortable: false,
            render: (item: any) => {
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.customer.name}</p>:  '-'
            }
        },
        {
            accessor: 'ins_pay_day',
            title: t('payment_due_day'),
            textAlignment: 'center',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.ins_pay_day}</p>:  '-'
            }
        },
        {
            accessor: 'ins_amount',
            title: t('installment_amount'),
            textAlignment: 'center',
            sortable: false,
            render: (item: any) =>{
                 return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.ins_amount ? item.ins_amount.toLocaleString('en-US') : '-'}</p>:  '-'
            }
        },
        {
            accessor: 'price',
            title: t('price'),
            textAlignment: 'right',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.price ? item.price.toLocaleString('en-US') : '-'}</p>:  '-'
            }
        },
        {
            accessor: 'down_payment',
            title: t('down_payment'),
            textAlignment: 'right',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.down_payment ? item.down_payment.toLocaleString('en-US') : '-'}</p>:  '-'
            }
        },
        {
            accessor: 'principle',
            title: t('lease_principal'),
            textAlignment: 'right',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item.principle ? item.principle.toLocaleString('en-US') : '-'}</p>:  '-'
            }
        },
        {
            accessor: 'ins_period',
            title: t('installment_period'),
            textAlignment: 'center',
            sortable: false,
            render: (item: any) =>{
                return ((role == 'shop' && item?.is_view == 1) || role != 'shop')  ?  <p>{item?.ins_period ?? '-'}</p>:  '-'
            }
        },
        {
            accessor: 'customer_signature_at',
            title: t('online_signature'),
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
            title: t('ekyc_signature'),
            textAlignment: 'center',
            sortable: false,
            render: (item:any) => (
                <span className={`${item?.e_contract_status ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {item?.e_contract_status ? <IconChecks className="w-6 h-6" /> : ''}
                </span>
            ),
        },
        //is_view 
        {
            accessor: 'action',
            title: t('actions'),
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

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const binaryString = e.target?.result;
                if (binaryString) {
                    const wb = XLSX.read(binaryString, { type: 'binary' });
                    const ws = wb.Sheets[wb.SheetNames[0]]; // Get the first sheet
                    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Extract rows as arrays
                    const references = data.map((row: any) => row[0]).filter((reference: string) => reference); // Extract references
                 
                    if (references.length > 0) {
                        setImportedContracts(references);
                        setIsUploading(true);
                        fetchContractData({
                            data: {
                                query: '',
                                page: 1,
                                page_size: pageSize,
                                reference: references,
                            },
                        });
                        setImportedContracts(references);
                        setIsFileUploaded(true);
                        setIsUploading(false);
                        setIsOpen(false);
                        setIsNoDataFound(false);
                    } else {
                        setIsNoDataFound(true);
                        setIsOpen(false);
                    }
                }
            };
            reader.readAsBinaryString(file);
        }
    };
    const handleUpdateLockedContracts = () => {
        const selectedUUIDs = Array.from(selectedContracts);
        if (selectedUUIDs.length > 0) {
            setIsStatusModalOpen(true); // เปิด popup
        } else {
            Swal.fire({
                icon: 'warning',
                title: t('please_select_contract_first'),
                confirmButtonText: 'OK',
            });
        }
    };
    const confirmUpdateStatus = () => {
        const selectedUUIDs = Array.from(selectedContracts)
            .map((key) => key.split('_')[1]) // ดึง UUID จาก id_uuid
            .filter((uuid) => typeof uuid === 'string' && uuid.trim() !== '');

        const creditCode = selectedStatusCode?.value;

        if (selectedUUIDs.length > 0 && typeof creditCode === 'string' && creditCode.trim() !== '') {
            contractUpdateLockedContracts({
                data: {
                    uuid: selectedUUIDs,
                    credit_code: creditCode.trim(),
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: t('please_select_contract_and_status'),
                confirmButtonText: t('confirm'),
            });
        }
    };







    const handleSubmit = (values: any, { resetForm }: any) => {
        if (isFileUploaded && importedContracts.length > 0) {
            // ไม่ต้องเรียก fetch อีก เพราะ useEffect ทำงานแล้ว
            setPage(1); // เพื่อให้ useEffect ทำงานใหม่
        } else {
            const normalParams = {
                start_at: '',
                end_at: '',
                query: values.search || '',
                page: 1,
                page_size: pageSize,
                contract_date: values?.contract_date?.[0],
                contract_end_date: values?.contract_date?.[1],
                approved_at: values?.approved_at?.[0],
                approved_end_at: values?.approved_at?.[1],
                status_code: values.status_code,
                status_type: 'credit',
                id_business_unit: values.id_business_unit || '',
                is_locked: values.is_locked?.value || 'all',
            };
            setFilterParams(normalParams);
            setPage(1);
        }
        setFilterParams({
            start_at: '',
            end_at: '',
            query: values.search || '',
            page: 1,
            page_size: pageSize,
            contract_date: values?.contract_date?.[0],
            contract_end_date: values?.contract_date?.[1],
            approved_at: values?.approved_at?.[0],
            approved_end_at: values?.approved_at?.[1],
            status_code: values.status_code,
            status_type: 'credit',
            id_business_unit: values.id_business_unit || '',
            is_locked: values.is_locked?.value || 'all',
        });
        setPage(1);
    };
    const handleReset = () => {
        window.location.reload();
    };
    return (

        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            {(loadingUpdateCredit || isLoadingContract || isLoadingStatus || isDownloading) && <PreLoading />}
            <div className="invoice-table">
                {role !== 'shop' ? (
                    <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5 justify-between">
                    <div className="flex items-center gap-2">
                        <button className="btn btn-success gap-2" onClick={updateCredit}>
                            {t('update_contract_status')}
                        </button>
                        {isFileUploaded ? (
                                 <button
                                     className="btn btn-info gap-2"
                                     onClick={handleUpdateLockedContracts}
                                 >
                                     {t('update_excel')}
                                 </button>
                             ) : (
                                 <button
                                     className="btn btn-info gap-2"
                                     onClick={() => setIsOpen(true)}
                                 >
                                     {t('import_excel')}
                                 </button>
                             )}

                             {(role === 'admin') && (
                                <button
                                     type="button"
                                     className="btn btn-warning gap-2"
                                     onClick={() => {
                                         handleExportContractOffer(`contract_offer_${new Date().toLocaleString()}`);
                                    }}
                                 >
                                     {t('overdue_2_installments')}
                                 </button>
                              )}
                                 
                    </div>
                </div>
                ) : (
                    ''
                )}
                 <Transition.Root show={isOpen} as={React.Fragment}>
                     <Dialog as="div" className="fixed inset-0 z-[999] overflow-y-auto" onClose={setIsOpen}>
                         <div className="flex items-center justify-center min-h-screen px-4 py-8">
                             <Transition.Child
                                 as={React.Fragment}
                                 enter="ease-out duration-300"
                                 enterFrom="opacity-0"
                                 enterTo="opacity-100"
                                 leave="ease-in duration-200"
                                 leaveFrom="opacity-100"
                                 leaveTo="opacity-0"
                             >
                                 <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                             </Transition.Child>

                             <Transition.Child
                                 as={React.Fragment}
                                 enter="ease-out duration-300"
                                 enterFrom="opacity-0 scale-95"
                                 enterTo="opacity-100 scale-100"
                                 leave="ease-in duration-200"
                                 leaveFrom="opacity-100 scale-100"
                                 leaveTo="opacity-0 scale-95"
                             >

                                 <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 shadow-xl w-full max-w-lg">
                                     <button
                                         type="button"
                                         className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                         onClick={() => setIsOpen(false)}
                                     >
                                         <span className="sr-only">Close</span>
                                         <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                         </svg>
                                     </button>

                                     <div>
                                         <div className="text-center sm:text-left">
                                             <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                                 {t('upload_excel_file')}
                                             </Dialog.Title>
                                             <div className="mt-2">
                                                 <p className="text-sm text-gray-500">{t('select_excel_with_contracts')}</p>
                                             </div>
                                             <div className="mt-4">
                                                 <label className="btn btn-info gap-2">
                                                     {isUploading ? t('uploading') : t('upload_excel_file_button')}
                                                     <input
                                                         type="file"
                                                         accept=".xlsx, .xls"
                                                         onChange={handleFileUpload}
                                                         className="hidden"
                                                     />
                                                 </label>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </Transition.Child>

                         </div>
                     </Dialog>
                 </Transition.Root>

                <div className="flex w-full mb-4.5 px-5 md:items-center md:flex-row flex-col gap-5">
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            start_at: '',
                            end_at: '',
                            contract_date: '',
                            approved_at: '',
                            search: '',
                            query: '',
                            status_code: statusCode !== null ? statusCode : '',
                            status_type: '',
                            id_business_unit: role === 'business_unit' && businessUnit.length !== 0 ? businessUnit[0]?.value : buId ? parseInt(buId) : '',
                            is_locked: 'all',
                        }}
                         onSubmit={handleSubmit}
                       // onReset={handleReset}
                        // onSubmit={(values: any, { resetForm }) => {
                        //     fetchContractData({
                        //         data: {
                        //             start_at: '',
                        //             end_at: '',
                        //             query: values.search || '',
                        //             page: 1,
                        //             page_size: pageSize,
                        //             contract_date: values?.contract_date[0],
                        //             contract_end_date: values?.contract_date[1],
                        //             approved_at: values?.approved_at[0],
                        //             approved_end_at: values?.approved_at[1],
                        //             // contract_date: convertDateClientToDb(values?.contract_date[0] ? [values.contract_date[0]] : null),
                        //             // contract_end_date: convertDateClientToDb(values?.contract_date[1] ? [values.contract_date[1]] : null),
                        //             // approved_at: convertDateClientToDb(values?.approved_at[0] ? [values.approved_at[0]] : null),
                        //             // approved_end_at: convertDateClientToDb(values?.approved_at[1] ? [values.approved_at[1]] : null),
                        //             status_code: values.status_code,
                        //             status_type: 'credit',
                        //             id_business_unit: values.id_business_unit || '',
                        //             is_locked: values.is_locked.value,
                        //         },
                        //     });
                        //     setFilterParams({
                        //         start_at: '',
                        //         end_at: '',
                        //         query: values.search || '',
                        //         page: 1,
                        //         page_size: pageSize,
                        //         contract_date: values?.contract_date[0],
                        //         contract_end_date: values?.contract_date[1],
                        //         approved_at: values?.approved_at[0],
                        //         approved_end_at: values?.approved_at[1],
                        //         // contract_date: convertDateClientToDb(values?.contract_date[0] ? [values.contract_date[0]] : null),
                        //         // contract_end_date: convertDateClientToDb(values?.contract_date[1] ? [values.contract_date[1]] : null),
                        //         // approved_at: convertDateClientToDb(values?.approved_at[0] ? [values.approved_at[0]] : null),
                        //         // approved_end_at: convertDateClientToDb(values?.approved_at[1] ? [values.approved_at[1]] : null),
                        //         status_code: values.status_code,
                        //         status_type: 'credit',
                        //         id_business_unit: values.id_business_unit || '',
                        //         is_locked: values.is_locked.value,
                        //     });
                        //     setPage(1);
                        // }}
                        // onReset={() => {
                        //     setIsFileUploaded(false);  // Reset the file upload state
                        //     setIsUploading(false);     // Reset uploading state
                        //     setIsNoDataFound(false);
                        //     fetchContractData({
                        //         data: {
                        //             start_at: '',
                        //             end_at: '',
                        //             query: '',
                        //             page: 1,
                        //             page_size: pageSize,
                        //             contract_date: '',
                        //             approved_at: '',
                        //             contract_end_date: '',
                        //             approved_end_at: '',
                        //             status_type: 'credit',
                        //             is_locked: 'all',
                        //         },
                        //     });
                        //     setFilterParams({
                        //         start_at: '',
                        //         end_at: '',
                        //         query: '',
                        //         page: 1,
                        //         page_size: pageSize,
                        //         contract_date: '',
                        //         approved_at: '',
                        //         contract_end_date: '',
                        //         approved_end_at: '',
                        //         status_code: '',
                        //         ...(role !== 'business_unit' ? { id_business_unit: '' } : {}),
                        //         is_locked: 'all',
                        //     });
                        //     setPage(1);
                        // }}
                    >
                        {({ setFieldValue, values }) => (
                            <Form className="flex flex-col flex-auto gap-2">
                                {role !== 'shop' ? (
                                    <div className="flex flex-col sm:flex-row md:flex-row gap-5">
                                        <div className="z-10 flex-1">
                                            <SelectField
                                                id="id_business_unit"
                                                label="หน่วยธุรกิจ"
                                                name="id_business_unit"
                                                placeholder="เลือก หน่วยธุรกิจ"
                                                options={businessUnit}
                                                isSearchable={true}
                                                disabled={role === 'business_unit'}
                                            />
                                        </div>
                                        <div className="z-10 flex-1">
                                            <SelectField id="status_code" label="สถานะดำเนินการ" name="status_code" placeholder="เลือก สถานะ" options={status} isSearchable={true} />
                                        </div>
                                        <div className="z-10 flex-1">
                                            <label>สถานะการล็อคเครื่อง</label>
                                            <Select
                                                value={values.is_locked}
                                                placeholder="เลือก สถานะการล็อคเครื่อง"
                                                className="z-10 w-auto"
                                                options={[
                                                    {
                                                        value: 'all',
                                                        label: 'ทั้งหมด',
                                                    },
                                                    {
                                                        value: 'locked',
                                                        label: 'ล๊อคเครื่อง',
                                                    },
                                                    {
                                                        value: 'unlocked',
                                                        label: 'ปลดล๊อค',
                                                    },
                                                ]}
                                                isSearchable={true}
                                                onChange={(e: any) => {
                                                    setFieldValue('is_locked', e);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row md:flex-row gap-5">
                                        <div className="z-10 flex-1">
                                            <SelectField
                                                id="id_business_unit"
                                                label="หน่วยธุรกิจ"
                                                name="id_business_unit"
                                                placeholder="เลือก หน่วยธุรกิจ"
                                                options={businessUnit}
                                                isSearchable={true}
                                                disabled={role === 'business_unit'}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <InputField label="ค้นหา" placeholder="ค้นหา" name="search" type="text" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row md:flex-row gap-5 pt-3">
                                    {/* <DatePicker
                                        label="วันที่ทำสัญญา"
                                        name="contract_date"
                                        isRange={true}
                                        onChange={(value: any) => {
                                            setFieldValue('contract_date', value);
                                        }}
                                    />
                                    <DatePicker
                                        label="วันที่อนุมัติ"
                                        name="approved_at"
                                        isRange={true}
                                        onChange={(value: any) => {
                                            setFieldValue('approved_at', value);
                                        }}
                                    /> */}
                                    <DateRangeAntd label="วันที่ทำสัญญา" name="contract_date" />
                                    <DateRangeAntd label="วันที่อนุมัติ" name="approved_at" />
                                </div>
                                <div className="flex flex-col sm:flex-row md:flex-row gap-5">
                                    {role !== 'shop' ? (
                                        <div className="flex-1">
                                            <InputField label="ค้นหา" placeholder="ค้นหา" name="search" type="text" />
                                        </div>
                                    ) : (
                                        ''
                                    )}
                                    <div className="flex flex-col sm:flex-row md:flex-row gap-4 justify-end items-end">
                                        <button type="submit" className="btn btn-primary w-[100px] gap-2">
                                            ค้นหา
                                        </button>
                                        <button type="reset" className="btn btn-info gap-2 w-[100px]" onClick={() => handleReset()}>
                                            ล้างค่า
                                        </button>
                                        {(role === 'admin' || role === 'business_unit') && (
                                            <button
                                                type="button"
                                                className="btn btn-success gap-2 w-[100px]"
                                                onClick={() => {
                                                    handleExport(`contract_${new Date().toLocaleString()}`, values);
                                                }}
                                            >
                                                Export
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
                 <div className="datatables pagination-padding">
                     {isNoDataFound ? (
                         <div className="my-10 text-center text-gray-500">{t('no_data_in_uploaded_file')}</div>
                     ) : contractList.length === 0 ? (
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
                 <Transition.Root show={isStatusModalOpen} as={React.Fragment}>
                     <Dialog as="div" className="fixed inset-0 z-[999] overflow-y-auto" onClose={() => setIsStatusModalOpen(false)}>
                         <div className="flex items-center justify-center min-h-screen px-4 py-8">
                             <Transition.Child
                                 as={React.Fragment}
                                 enter="ease-out duration-300"
                                 enterFrom="opacity-0 scale-95"
                                 enterTo="opacity-100 scale-100"
                                 leave="ease-in duration-200"
                                 leaveFrom="opacity-100 scale-100"
                                 leaveTo="opacity-0 scale-95"
                             >
                                 <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
                             </Transition.Child>

                             <Transition.Child as={React.Fragment}>
                                 <div className="relative bg-white rounded-lg px-6 pt-5 pb-6 shadow-xl w-full max-w-3xl z-10">

                                     <button
                                         type="button"
                                         className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none"
                                         onClick={() => setIsStatusModalOpen(false)}
                                     >
                                         <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                         </svg>
                                     </button>

                                     <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                         {t('update_operation_status')}
                                     </Dialog.Title>

                                     <div className="mb-4">
                                         <label className="block text-sm font-medium text-gray-700 mb-1">{t('select_operation_status')}</label>
                                         <Select
                                             options={statusExcel}
                                             value={selectedStatusCode}
                                             onChange={(val) => setSelectedStatusCode(val)}
                                             placeholder={t('select_status_placeholder')}
                                         />
                                     </div>

                                     {/* <div className="max-h-[300px] overflow-y-auto border border-gray-300 rounded-md">
                                         <table className="min-w-full text-sm">
                                             <thead className="bg-gray-100">
                                                 <tr>
                                                     <th className="text-left p-2">#</th>
                                                     <th className="text-left p-2">เลขสัญญา</th>
                                                     <th className="text-left p-2">UUID</th>
                                                 </tr>
                                             </thead>
                                             <tbody>
                                                 {contractList
                                                     .filter((contract) =>
                                                         selectedContracts.has(`${contract.id}_${contract.uuid}`)
                                                     )
                                                     .map((contract, index) => (
                                                         <tr key={contract.uuid}>
                                                             <td className="p-2">{index + 1}</td>
                                                             <td className="p-2">{contract.reference}</td>
                                                             <td className="p-2">{contract.uuid}</td>
                                                         </tr>
                                                     ))}
                                             </tbody>
                                         </table>
                                     </div> */}

                                     <div className="mt-4 flex justify-end">
                                         <button
                                             type="button"
                                             className="btn btn-success"
                                             onClick={confirmUpdateStatus}
                                         >
                                             {t('confirm_update')}
                                         </button>
                                     </div>
                                 </div>
                             </Transition.Child>
                         </div>
                     </Dialog>
                 </Transition.Root>


        </div>
    );
};

export default ListCredit;
