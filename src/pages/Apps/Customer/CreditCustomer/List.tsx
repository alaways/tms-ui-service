import Tippy from '@tippyjs/react';
import { DataTable } from 'mantine-datatable';
import * as Yup from 'yup';
import IconEdit from '../../../../components/Icon/IconEdit';
import { PAGE_SIZES } from '../../../../helpers/config';
import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../../../components/Icon/IconX';
import SelectField from '../../../../components/HOC/SelectField';
import { Form, Formik } from 'formik';
import { useParams } from 'react-router-dom';
import { useGlobalMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';
import InputField from '../../../../components/HOC/InputField';
import { showNotification } from '../../../../helpers/showNotification';
import IconEye from '../../../../components/Icon/IconEye';
import { convertDateTimeDbToClient} from '../../../../helpers/formatDate';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';

const List = () => {
    const { id } = useParams();
    const [creditList, setCreditList] = useState<any>([]);
    const [businessUnitList, setBusinessUnitList] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const creditLevelTypes = useSelector((state: IRootState) => state.dataStore.credit_level)
    const [actionModal, setActionModal] = useState(false);
    const [creditFormData, setCreditFormData] = useState<any>({
        id: null,
        id_business_unit: '',
        credit_level: '',
        note: null,
    });

    const { mutate: fetchContractGetStatus } = useGlobalMutation(url_api.contractFilter, {
        onSuccess: (res: any) => {
            const convert = res.data.business_unit.map((item: any) => ({ value: item.id, label: item.name }));
            setBusinessUnitList(convert);
        },
        onError: () => {
            console.error('Failed to fetch bu data');
        },
    });

    const { mutate: createUpdateCredit} = useGlobalMutation(url_api.customerCreditCreateAndUpdate, {
        onSuccess: (res: any) => {
           if (res.code == 200 && res.statusCode == 200) {
                showNotification('เพิ่มข้อมูลสำเร็จ', 'success');
                fetchCustomerCredit({ data: { id_customer: id } });
            }
        },
        onError: (err: any) => {
         
        },
    });

     const { mutate: fetchCustomerCredit} = useGlobalMutation(url_api.customerCreditFindAll, {
        onSuccess: (res: any) => {
           if (res.code == 200 && res.statusCode == 200) {
                console.log("data",res.data)
               setCreditList(res.data);
            }
        },
        onError: (err: any) => {
         
        },
    });

    const SubmittedForm = Yup.object().shape({
        id_business_unit: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        credit_level: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    });

    const SubmittedFormEdit = Yup.object().shape({
        id_business_unit: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        credit_level: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        note: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    });

    const onConfirmData = async (values: any) => {
        const params = { ...values, id_customer: id };
        if (values.id) {
             createUpdateCredit({ data: params });
        } else {
             createUpdateCredit({ data: params });
        }
        setActionModal(false);
    };

    const onEdit = (item: any) => {
        setCreditFormData({
            ...item,
            note:''
        });
        setActionModal(true);
    };

    useEffect(() => {
        fetchContractGetStatus({});
        fetchCustomerCredit({ data: { id_customer: id } });
    }, []);

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="px-5 mb-4 flex justify-between items-center">
                <h5 className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">เครดิตลูกค้า</h5>
                <button className="hover:text-info cursor-pointer btn btn-primary mr-1" onClick={() => setActionModal(true)}>
                    เพิ่มข้อมูล
                </button>
            </div>
            <div className="datatables pagination-padding">
                <DataTable
                    className="whitespace-nowrap table-hover invoice-table"
                    records={creditList}
                    columns={[
                        {
                            accessor: 'id',
                            title: 'ลำดับ',
                            sortable: false,
                            textAlignment: 'center',
                            render: (row, index) => <div>{index + 1}</div>,
                        },
                        {
                            accessor: 'business_unit_name',
                            title: 'หน่วยธุรกิจ',
                            sortable: false,
                        },
                        {
                            accessor: 'credit_level',
                            title: 'ระดับเครดิต',
                            sortable: false,
                            render: ({ credit_level }) => (
                                <div className="flex items-center font-normal">
                                  <div>{`${creditLevelTypes.find(i => i.value === credit_level)?.label || '-'}`}</div>
                                </div>
                              ),
                        },

                        // {
                        //     accessor: 'is_active',
                        //     title: 'เปิดปิดการใช้งาน',
                        //     sortable: false,
                        //     render: (item: any) => (
                        //         <span className={`badge ${item?.is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>{item?.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
                        //     ),
                        // },
                        {
                            accessor: 'admin_name',
                            title: 'ผู้ดำเนินการ',
                            sortable: false,
                        },
                        {
                            accessor: 'created_at',
                            title: 'วันที่ - เวลา',
                            sortable: false,
                            render: (item: any) => <p>{convertDateTimeDbToClient(item?.created_at)}</p>,
                        },
                        {
                            accessor: 'action',
                            title: 'Actions',
                            sortable: false,
                            textAlignment: 'center',
                            render: (item) => (
                                <div className="flex gap-4 items-center w-max mx-auto">
                                    <a className="flex cursor-pointer items-center relative group" onClick={() => onEdit(item)}>
                                        <IconEdit className="w-4.5 h-4.5 flex items-center transition-opacity duration-200 group-hover:opacity-0" />
                                        <p className="absolute left-[-5px] text-center text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">แก้ไข</p>
                                    </a>

                                    <a href={`/apps/customer/credit-level/${item.id_business_unit}?id_customer=${id}`} className="flex cursor-pointer items-center relative group">
                                        <IconEye className="w-4.5 h-4.5 flex items-center transition-opacity duration-200 group-hover:opacity-0" />
                                        <p className="absolute left-[-10px] text-center text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">ดูข้อมูล</p>
                                    </a>
                                </div>
                            ),
                        },
                    ]}
                    minHeight={160}
                    highlightOnHover
                    // page={page}
                    // totalRecords={totalItems}
                    // recordsPerPage={pageSize}
                    // onPageChange={(p) => setPage(p)}
                    // recordsPerPageOptions={PAGE_SIZES}
                    // onRecordsPerPageChange={(p) => {
                    //     setPage(1);
                    //     setPageSize(p);
                    // }}
                    // paginationText={({ from, to, totalRecords }) => `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`}
                />
            </div>
            <Transition appear show={actionModal} as={Fragment}>
                <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
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
                                    <div>
                                        <button
                                            type="button"
                                            className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                            onClick={() => setActionModal(false)}
                                        >
                                            <IconX />
                                        </button>
                                        <div className="text-lg font-medium  dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                            {creditFormData?.id ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูล'}{' '}
                                        </div>
                                    </div>
                                    <Formik
                                        initialValues={creditFormData}
                                        onSubmit={onConfirmData}
                                        enableReinitialize
                                        autoComplete="off"
                                        validationSchema={creditFormData?.id ? SubmittedFormEdit : SubmittedForm}
                                    >
                                        <Form className="px-4 flex flex-col gap-3 custom-select">
                                            <SelectField
                                                require={true}
                                                placeholder="กรุณาเลือก"
                                                isSearchable={true}
                                                label="หน่วยธุรกิจ"
                                                options={businessUnitList}
                                                name="id_business_unit"
                                                id="id_business_unit"
                                            />
                                            <SelectField
                                                require={true}
                                                label="ระดับเครดิต (แอดมิน)"
                                                id="credit_level"
                                                name="credit_level"
                                                options={creditLevelTypes}
                                                placeholder="กรุณาเลือก"
                                                isSearchable={true}
                                            />
                                            {creditFormData.id && <InputField require={true} label="เหตุผลการแก้ไข" name="note" />}
                                            <div className=" pb-5">
                                                <div className="flex justify-end items-center mt-8">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger"
                                                        onClick={() => {
                                                            setActionModal(false);
                                                        }}
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                        ยืนยัน
                                                    </button>
                                                </div>
                                            </div>
                                        </Form>
                                    </Formik>
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
