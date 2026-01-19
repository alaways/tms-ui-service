import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { setCustomer } from '../../../store/dataStore';
import { setPageAction } from '../../../store/pageStore';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { formatIDNumber, formatPhoneNumber } from '../../../helpers/formatNumeric';
import { convertDateDbToClient } from '../../../helpers/formatDate';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Select from 'react-select';
import IconPlus from '../../../components/Icon/IconPlus';
import IconEye from '../../../components/Icon/IconEye';
import { IRootState } from '../../../store';
import PreLoading from '../../../helpers/preLoading';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';
import { Field, Form, Formik, FormikProps } from 'formik';
import { columns_csv, customer_csv } from '../../../helpers/constant';
import DateRangeAntd from '../../../components/HOC/DateRangeAntd';
import InputGenerateField from '../../../components/HOC/InputGenerateField';
import SelectField from '../../../components/HOC/SelectField';
import IconX from '../../../components/Icon/IconX';
import { Dialog, Transition } from '@headlessui/react';
import QRCode from 'react-qr-code';
import IconCheckCircle from '../../../components/Icon/IconCheck';
import IconXCircle from '../../../components/Icon/IconXCircle';

const List = () => {
    const mode = process.env.MODE || 'admin';
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [customerLists, setCustomerLists] = useState<any[]>([]);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const acc = JSON.parse(localStorage.getItem(mode) ?? '{}')?.acc;

    const storedUser = localStorage.getItem(mode);
    const role = storedUser ? JSON.parse(storedUser).role : null;
    const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null;

    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [shopList, setShopLists] = useState<any>([]);
    const [firstLoading, setFirstLoading] = useState(false);

    const [initialAddUppass, setInitialAddUppass] = useState<any>({ id_shop: '', url: '' });
    const [actionModalAddUppass, setActionModalAddUppass] = useState<boolean>(false);
    const [statusGenerateLink, setStatusGenerateLink] = useState<boolean>(false);
    const qrRef = useRef(null);
    const formikRef = useRef<any>(null);

    useEffect(() => {
        setFirstLoading(true);
    }, []);
    const creditLevelTypes = useSelector((state: IRootState) => state.dataStore.credit_level);

    const { mutate: fetchShopData } = useGlobalMutation(url_api.shopFindAll, {
        onSuccess: (res: any) => {
            setShopLists(
                res.data.list.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );
        },
        onError: () => {},
    });


    const { mutate: genLinkPreScreen } = useGlobalMutation(url_api.customerCreateLinkPreScreen, {
        onSuccess: (res: any) => {
            setStatusGenerateLink(true);
            if (formikRef.current?.setFieldValue) {
                formikRef.current.setFieldValue('url', `${process.env.WEB_CUSTOMER_URL}/apps/customer/pre-screen/${res?.data?.token}?openExternalBrowser=1`);
            }
        },
        onError: () => {},
    });

    

    type filterParams = {
        query?: string;
        credit_level?: string;
        shop_credit_level?: string;
        id_shop?: string;
        line_regis?: string;
        created_at?: any;
        updated_at?: any;
    };

    const [filter, setFilter] = useState<filterParams>({});

    const lineRegis = [
        {
            label: 'ทั้งหมด',
            value: 'all',
        },
        {
            label: 'ลงทะเบียน',
            value: 'regis',
        },
        {
            label: 'ไม่ได้ลงทะเบียน',
            value: 'unregis',
        },
    ];

    const { mutateAsync: fetchCustomerData, isLoading } = useGlobalMutation(url_api.customerFindAll, {
        onSuccess: (res: any) => {
            setCustomerLists(res.data.list);
            setTotalItems(res.data.total);
        },
        onError: () => {},
    });

    const handleExport = async (filename: string, values: any) => {
        if (!isDownloading) {
            setIsDownloading(true);
            const query = {
                query: values.search,
                page: page,
                page_size: pageSize,
                ...(values.id_shop.value && { id_shop: values.id_shop.value }),
                ...(values.credit_level.value && { credit_level: values.credit_level.value }),
                ...(values.shop_credit_level.value && { shop_credit_level: values.shop_credit_level.value }),
                ...(values.line_regis.value && { line_regis: values.line_regis.value }),
            };
            const data: any = await fetchCustomerData({ data: query });
            const convertData = data.data.list.map((item: any) => ({
                created_at: item.created_at ? convertDateDbToClient(item?.created_at) : 'อนุมัติ-',
                shop_name: item.shop_name,
                name: item.name,
                phone_number: item.phone_number,
                line_id: item.line_id,
                citizen_id: item.citizen_id,
                credit_level: item.credit_level,
                shop_credit_level: item.shop_credit_level,
                approval_status: item.approval_status,
                line_uuid: item.line_uuid,
            }));
            const worksheet = XLSX.utils.json_to_sheet(convertData, { header: customer_csv.map((col) => col.id) });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const headerDisplayNames = customer_csv.map((col) => col.displayName);
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

    const goPreview = (item: any) => {
        dispatch(setCustomer(item));
        dispatch(setPageAction('preview'));
        navigate('/apps/customer/edit/' + item.id);
    };

    const addCustomerByUppass = () => {
        setActionModalAddUppass(true);
    };

    const onGenerateLinkUppass = (id_shop: string, setFieldValue: any) => {
        if (!id_shop) {
            return;
        }
        genLinkPreScreen({data:{id_shop:id_shop}})
    };

    const downloadQR = () => {
        const svg = qrRef.current;
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const urlBlob = URL.createObjectURL(svgBlob);

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            URL.revokeObjectURL(urlBlob);

            const pngUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = 'qrcode.png';
            link.click();
        };

        img.src = urlBlob;
    };

    useEffect(() => {
        dispatch(setPageTitle('รายการลูกค้า'));
        fetchShopData({});
        fetchCustomerData({ data: { page: 1, page_size: pageSize } });
    }, []);

    useEffect(() => {
        if (!firstLoading) return;
        fetchCustomerData({ data: { page: 1, page_size: pageSize, ...filter } });
    }, [pageSize]);

    useEffect(() => {
        if (!firstLoading) return;
        fetchCustomerData({ data: { page: page, page_size: pageSize, ...filter } });
    }, [page]);

    return (
        <div>
            {isLoading && <PreLoading />}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
                    <h2 className="text-xl">ลูกค้า</h2>
                </div>

                <div className="flex flex-col items-start flex-wrap gap-4 mb-4.5 px-5 ">
                    {acc && (
                        <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                            {<div className="flex gap-3">
                                <Link to="/apps/customer/add" className="btn btn-primary gap-2">
                                    <IconPlus />
                                    เพิ่มลูกค้า
                                </Link>
                            </div>}
                            <div className="flex gap-3">
                                <button type="button" onClick={addCustomerByUppass} className="btn btn-secondary gap-2">
                                    <IconPlus />
                                    สร้างลิงค์เพิ่มลูกค้า
                                </button>
                            </div>
                        </div>
                    )}
                    <Formik
                        initialValues={{ credit_level: '', shop_credit_level: '', id_shop: '', query: '', line_regis: '', created_at: null, updated_at: null }}
                        onSubmit={(values: any) => {
                            setPage(1);
                            fetchCustomerData({
                                data: {
                                    page: 1,
                                    page_size: pageSize,
                                    credit_level: values.credit_level?.value,
                                    shop_credit_level: values.shop_credit_level?.value,
                                    id_shop: values.id_shop?.value,
                                    line_regis: values.line_regis?.value,
                                    query: values.query,
                                    ...(values.created_at && { created_at: values.created_at[0], created_at_end: values.created_at[1] }),
                                    ...(values.updated_at && { updated_at: values.updated_at[0], updated_at_end: values.updated_at[1] }),
                                },
                            });
                            setFilter({
                                ...values,
                                id_shop: values.id_shop?.value,
                                ...(values.created_at && { created_at: values.created_at[0], created_at_end: values.created_at[1] }),
                                ...(values.updated_at && { updated_at: values.updated_at[0], updated_at_end: values.updated_at[1] }),
                            });
                        }}
                    >
                        {({ setFieldValue, handleReset, values }) => (
                            <Form className="w-full">
                                <div className="flex flex-col gap-3 w-full">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Select
                                            id="credit_level"
                                            name="credit_level"
                                            value={values.credit_level}
                                            placeholder="เครดิต (bu)"
                                            className="z-6 flex-1 dropdown-custom"
                                            options={creditLevelTypes}
                                            isSearchable={true}
                                            onChange={(e: any) => {
                                                setFieldValue('credit_level', e);
                                            }}
                                        />
                                        <Select
                                            id="shop_credit_level"
                                            name="shop_credit_level"
                                            value={values.shop_credit_level}
                                            placeholder="เครดิต (ร้านค้า)"
                                            className="z-5 flex-1 dropdown-custom"
                                            options={creditLevelTypes}
                                            isSearchable={true}
                                            onChange={(e: any) => {
                                                setFieldValue('shop_credit_level', e);
                                            }}
                                        />
                                        {!id_shop && (
                                            <Select
                                                id="id_shop"
                                                name="id_shop"
                                                value={values.id_shop}
                                                placeholder="ร้านค้า"
                                                className="z-4 flex-1 dropdown-custom"
                                                options={shopList}
                                                isSearchable={true}
                                                onChange={(e: any) => {
                                                    setFieldValue('id_shop', e);
                                                }}
                                            />
                                        )}
                                        <Select
                                            id="line_regis"
                                            name="line_regis"
                                            value={values.line_regis}
                                            placeholder="ลงทะเบียนแจ้งเตือน"
                                            className="z-3 flex-1 dropdown-custom"
                                            options={lineRegis}
                                            isSearchable={true}
                                            onChange={(e: any) => {
                                                setFieldValue('line_regis', e);
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                                        <DateRangeAntd name="created_at" placeholder={['เริ่มวันที่สร้าง', 'ถึงวันที่']} />
                                        <DateRangeAntd name="updated_at" placeholder={['เริ่มวันที่แก้ไข', 'ถึงวันที่']} />
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="query"
                                                name="query"
                                                placeholder="ค้นหา"
                                                className="form-input py-2 ltr:pr-11 rtl:pl-11 peer"
                                                value={values.query}
                                                onChange={(e) => {
                                                    setFieldValue('query', e.target.value);
                                                }}
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <button type="submit" className="btn btn-primary w-[100px] gap-2">
                                                ค้นหา
                                            </button>
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
                                                        created_at: null,
                                                        updated_at: null,
                                                    };
                                                    setPage(1);
                                                    setFilter({ ...resetValues });
                                                    fetchCustomerData({ data: { page: 1, page_size: pageSize, ...resetValues } });
                                                }}
                                            >
                                                ล้างค่า
                                            </button>
                                            {(role === 'admin' || role === 'business_unit') && (
                                                <button
                                                    type="button"
                                                    className="btn btn-success gap-2 w-[100px]"
                                                    onClick={() => {
                                                        handleExport(`customer_${new Date().toLocaleString()}`, values);
                                                    }}
                                                >
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
                        <div className="my-10 text-center text-gray-500">ไม่พบข้อมูล</div>
                    ) : (
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={customerLists}
                            columns={[
                                {
                                    accessor: 'index',
                                    title: 'ลำดับ',
                                    textAlignment: 'center',
                                    render: (row, index) => {
                                        const i = index + 1 + (page - 1) * pageSize;
                                        return <div>{i}</div>;
                                    },
                                },
                                {
                                    accessor: 'created_at',
                                    title: 'วันที่สร้าง',
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
                                              title: 'วันที่แก้ไข',
                                              //textAlignment: 'left',
                                              sortable: false,
                                              render: (item: any) => (
                                                  <div className="flex items-center font-normal">
                                                      <div>{convertDateDbToClient(item?.updated_at)}</div>
                                                  </div>
                                              ),
                                          },
                                          {
                                              accessor: 'shop_name',
                                              title: 'ร้านค้า',
                                              //textAlignment: 'left',
                                              sortable: false,
                                              render: (item: any) => (
                                                  <div className="flex items-center font-normal">
                                                      <div> {item?.shop_name || '-'}</div>
                                                  </div>
                                              ),
                                          },
                                      ]
                                    : []),

                                {
                                    accessor: 'name',
                                    title: 'ชื่อ-นามสกุล',
                                    textAlignment: 'left',
                                    sortable: false,
                                    render: (item) => {
                                        return role == 'shop' ? (
                                            <div className="flex items-center font-normal">
                                                <a className="flex">
                                                    <div>{item.title + ' ' + item.name}</div>
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex items-center font-normal">
                                                <a className="flex cursor-pointer active" onClick={() => goPreview(item)}>
                                                    <div>{item.title + ' ' + item.name}</div>
                                                </a>
                                            </div>
                                        );
                                    },
                                },

                                ...(role !== 'shop'
                                    ? [
                                          {
                                              accessor: 'phone_number',
                                              title: 'เบอร์โทรศัพท์ลูกค้า',
                                            //   textAlignment: 'left',
                                              sortable: false,
                                              render: (item: any) => (
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
                                              title: 'รหัสบัตรประชาชน',
                                              //textAlignment: 'left',
                                              sortable: false,
                                              render: (item: any) => formatIDNumber(item.citizen_id) ?? '-',
                                          },
                                          {
                                              accessor: 'credit_level',
                                              title: 'ระดับเครดิต (BU)',
                                              //textAlignment: 'left',
                                              sortable: false,
                                              render: (item: any) => (
                                                  <div className="flex items-center font-normal">
                                                      <div>{`${creditLevelTypes.find((i) => i.value === item?.credit_level)?.label || '-'}`}</div>
                                                  </div>
                                              ),
                                          },
                                          {
                                              accessor: 'shop_credit_level',
                                              title: 'ระดับเครดิต (ร้านค้า)',
                                              //textAlignment: 'left',
                                              sortable: false,
                                              render: (item: any) => (
                                                  <div className="flex items-center font-normal">
                                                      <div>{`${creditLevelTypes.find((i) => i.value === item?.shop_credit_level)?.label || '-'}`}</div>
                                                  </div>
                                              ),
                                          },
                                          {
                                              accessor: 'approval_status',
                                              title: 'อนุมัติ',
                                              //textAlignment: 'center',
                                              sortable: false,
                                              render: (item: any) => (
                                                  <span className={`badge ${item?.approval_status ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                                      {item?.approval_status ? 'อนุมัติ' : 'ไม่อนุมัติ'}
                                                  </span>
                                              ),
                                          },
                                          {
                                              accessor: 'otp_verify',
                                              title: 'ยืนยันตัวตน',
                                            //   textAlignment: 'center',
                                              sortable: false,
                                              render: (item: any) => (
                                                <div className={`${item?.otp_verify ? 'text-green-500': 'text-red-500'} flex justify-center`}>
                                                      {item?.otp_verify ? <IconCheckCircle /> : <IconXCircle />}
                                                </div>
                                                  
                                              ),
                                          },
                                          {
                                              accessor: 'action',
                                              title: 'Actions',
                                              sortable: false,
                                              // textAlignment: 'center',
                                              render: (item: any) => (
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
                                setPage(1);
                                setPageSize(p);
                            }}
                            paginationText={({ from, to, totalRecords }) => `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`}
                        />
                    )}
                </div>
            </div>
            <Transition appear show={actionModalAddUppass} as={Fragment}>
                <Dialog as="div" open={actionModalAddUppass} onClose={() => setActionModalAddUppass(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setActionModalAddUppass(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg rounded-t-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{'เพิ่ม'}</div>
                                    <div className="p-5">
                                        <Formik
                                            innerRef={formikRef}
                                            initialValues={initialAddUppass}
                                            onSubmit={() => {}}
                                            enableReinitialize
                                            autoComplete="off"
                                        >
                                            {({ values, setFieldValue }) => (
                                                <Form className="flex flex-col gap-3 custom-select">
                                                    <SelectField
                                                        name="id_shop"
                                                        id="id_shop"
                                                        options={shopList}
                                                        isSearchable={true}
                                                        onChange={({ value }) => {
                                                            setStatusGenerateLink(false);
                                                            setFieldValue('url', '');
                                                            setFieldValue('id_shop', value);
                                                        }}
                                                    />
                                                    <InputGenerateField
                                                        showStatus={statusGenerateLink}
                                                        label="ลิงค์"
                                                        name="url"
                                                        disabled={true}
                                                        copy={true}
                                                        onGenerate={() => onGenerateLinkUppass(values.id_shop, setFieldValue)}
                                                    />
                                                    {values.url && (
                                                        <div className="flex items-center flex-col gap-3">
                                                            <QRCode ref={qrRef} value={values.url} />
                                                            <button type='button' onClick={downloadQR} className="btn btn-secondary">ดาวน์โหลด Qr code</button>
                                                        </div>
                                                    )}
                                                </Form>
                                            )}
                                        </Formik>
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
