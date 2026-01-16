import { DataTable } from 'mantine-datatable';
import { Fragment, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { convertDateTimeDbToClient } from '../../../../helpers/formatDate';
import Breadcrumbs from '../../../../helpers/breadcrumbs';
import InputField from '../../../../components/HOC/InputField';
import SelectField from '../../../../components/HOC/SelectField';
import { Form, Formik } from 'formik';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../../../components/Icon/IconX';
import { showNotification } from '../../../../helpers/showNotification';
import { useGlobalMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';
import IconEdit from '../../../../components/Icon/IconEdit';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import { useTranslation } from 'react-i18next';

const Preview = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const creditLevelTypes = useSelector((state: IRootState) => state.dataStore.credit_level)
    const id_customer = searchParams.get('id_customer');

    const [actionModal, setActionModal] = useState(false);

    const breadcrumbItems = [
        { to: '/apps/customer/list', label: t('customer') },
        { to: '/apps/customer/edit/' + id_customer, label: t('customer') },
        { label: t('credit_level'), isCurrent: true },
    ];

    const [history, setHistory] = useState<any>([]);
    const [dataCredit, setDataCredit] = useState<any>([]);
    const [businessUnitList, setBusinessUnitList] = useState<any>([]);
    const [creditFormData, setCreditFormData] = useState<any>({
        id: null,
        id_business_unit: '',
        credit_level: '',
        note: null,
    });


    const { mutate: fetchCustomerCredit } = useGlobalMutation(url_api.customerCreditFindOne, {
        onSuccess: (res: any) => {
            const convert = res.data;
            setDataCredit([convert]);
            setHistory(res.data.history);
            setCreditFormData(res.data);
        },
        onError: () => {
            console.error('Failed to fetch bu data');
        },
    });


    const { mutate: createUpdateCredit} = useGlobalMutation(url_api.customerCreditCreateAndUpdate, {
        onSuccess: (res: any) => {
           if (res.code == 200 && res.statusCode == 200) {
                showNotification(t('add_success'), 'success');
            }
        },
        onError: (err: any) => {
         
        },
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

    const onConfirmDataUpload = async (values: any) => {
        const params = { ...values, id_customer: id_customer };
        await createUpdateCredit({ data: params });
        fetchCustomerCredit({ data: { id_business_unit: Number(id), id_customer: id_customer } });
        setActionModal(false);
    };

    useEffect(() => {
        fetchCustomerCredit({ data: { id_business_unit: Number(id), id_customer: id_customer } });
        fetchContractGetStatus({});
    }, []);
    return (
        <>
            <Breadcrumbs items={breadcrumbItems} />
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                        <h5 className="px-4 text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">{t('credit_level_details')}</h5>
                        <a className="hover:text-info cursor-pointer btn btn-primary mr-1" onClick={() => setActionModal(true)}>
                            <IconEdit className="w-4.5 h-4.5" /> &nbsp; {t('edit')}
                        </a>
                    </div>
                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={dataCredit}
                            columns={[
                                {
                                    accessor: 'id',
                                    title: t('sequence'),
                                    sortable: false,
                                    textAlignment: 'center',
                                    render: (row, index) => <div>{index + 1}</div>,
                                },
                                {
                                    accessor: 'business_unit_name',
                                    title: t('business_unit'),
                                    sortable: false,
                                },
                                {
                                    accessor: 'credit_level',
                                    title: t('credit_level'),
                                    sortable: false,
                                },
                                // {
                                //     accessor: 'is_active',
                                //     title: 'เปิดปิดการใช้งาน',
                                //     sortable: false,
                                //     render: ({ is_active }: any) => (
                                //         <span className={`badge ${is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>{is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
                                //     ),
                                // },
                                {
                                    accessor: 'admin_name',
                                    title: t('operator'),
                                    sortable: false,
                                },
                                {
                                    accessor: 'created_at',
                                    title: t('date_time'),
                                    sortable: false,
                                    render: (item: any) => <p>{convertDateTimeDbToClient(item?.created_at)}</p>,
                                },
                            ]}
                            minHeight={160}
                            highlightOnHover
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2 mt-20">
                    <h5 className="px-4 text-[16px] ltr:sm:text-left rtl:sm:text-right text-center">{t('history')}</h5>
                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={history}
                            columns={[
                                {
                                    accessor: 'id',
                                    title: t('sequence'),
                                    sortable: false,
                                    textAlignment: 'center',
                                    render: (row, index) => <div>{index + 1}</div>,
                                },
                                {
                                    accessor: 'note',
                                    title: t('details'),
                                    sortable: false,
                                    render: (item: any) => <p>{item.note || '-'}</p>,
                                },
                                {
                                    accessor: 'admin_name',
                                    title: t('operator'),
                                    sortable: false,
                                },
                                {
                                    accessor: 'created_at',
                                    title: t('date_time_label'),
                                    sortable: false,
                                    render: (item: any) => <p>{convertDateTimeDbToClient(item?.created_at)}</p>,
                                },
                            ]}
                            minHeight={160}
                            highlightOnHover
                        />
                    </div>
                </div>
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
                                        <div className="text-lg font-medium  dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{t('edit_data')}</div>
                                    </div>
                                    <Formik initialValues={creditFormData} onSubmit={onConfirmDataUpload} enableReinitialize autoComplete="off">
                                        <Form className="px-4 flex flex-col gap-3 custom-select">
                                            <SelectField
                                                require={true}
                                                placeholder={t('please_select')}
                                                isSearchable={true}
                                                label={t('business_unit')}
                                                options={businessUnitList}
                                                name="id_business_unit"
                                                id="id_business_unit"
                                            />
                                            <SelectField
                                                require={true}
                                                label={t('credit_level_admin')}
                                                id="credit_level"
                                                name="credit_level"
                                                options={creditLevelTypes}
                                                placeholder={t('please_select')}
                                                isSearchable={true}
                                            />
                                            {creditFormData.id && <InputField require={true} label={t('edit_reason')} name="note" />}
                                            <div className=" pb-5">
                                                <div className="flex justify-end items-center mt-8">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger"
                                                        onClick={() => {
                                                            setActionModal(false);
                                                        }}
                                                    >
                                                        {t('cancel')}
                                                    </button>
                                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                        {t('confirm')}
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
        </>
    );
};

export default Preview;
