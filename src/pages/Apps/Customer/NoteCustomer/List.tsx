import { Dialog, Transition } from '@headlessui/react';
import { Form, Formik } from 'formik';
import { useEffect, useState, useCallback, Fragment } from 'react';
import IconX from '../../../../components/Icon/IconX';
import InputField from '../../../../components/HOC/InputField';
import { DataTable } from 'mantine-datatable';
import { convertDateTimeDbToClient } from '../../../../helpers/formatDate';
import IconEye from '../../../../components/Icon/IconEye';
import { useParams } from 'react-router-dom';
import { useGlobalMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';
import { useTranslation } from 'react-i18next';

const List = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [actionModal, setActionModal] = useState(false);
    const [noteData, setNoteData] = useState<any>({ memo: '' });
    const [noteList, setNoteList] = useState<any>([]);

    const { mutate: fetchMemo} = useGlobalMutation(url_api.customerMemoFindAll, {
        onSuccess: (res: any) => {
            setNoteList(res.data);
        },
        onError: (err: any) => {
         
        },
    });

    const { mutate: postMemo} = useGlobalMutation(url_api.customerMemoAdd, {
        onSuccess: (res: any) => {
            fetchMemo({ data: { id_customer: id } });
        },
        onError: (err: any) => {
         
        },
    });


    const onSubmitData = async (value: any) => {
        postMemo({ data: { id_customer: id, memo: value.memo } });
        setActionModal(false);
    };


    useEffect(() => {
        fetchMemo({ data: { id_customer: id } });
    }, []);
    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="px-5 mb-4 flex justify-between items-center">
                <h1 className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">{t('customer_notes')}</h1>
                <button
                    className="hover:text-info cursor-pointer btn btn-primary mr-1"
                    onClick={() => {
                        setActionModal(true);
                        setNoteData({ memo: '' });
                    }}
                >
                    {t('add_data')}
                </button>
            </div>
            <div className="overflow-x-auto px-4">
                {noteList?.length > 0 &&
                    noteList?.map((item: any, index: number) => (
                        <div className="flex flex-col bg-[#FAFAFA] gap-3 border rounded-xl p-4 mb-5" key={index}>
                            <div className="flex-1 flex-col justify-center">
                                <h5 className="font-semibold">{t('message')}</h5>
                                <p style={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{item.memo}</p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <h5 className="font-semibold">{t('operator')}</h5>
                                <p>
                                    {item.admin_name} {convertDateTimeDbToClient(item?.created_at)}
                                </p>
                            </div>
                        </div>
                    ))}
            </div>
            {/* <div className="datatables pagination-padding">
                <DataTable
                    className="whitespace-nowrap table-hover invoice-table"
                    records={noteList}
                    columns={[
                        {
                            accessor: 'id',
                            title: 'ลำดับ',
                            sortable: false,
                            textAlignment: 'center',
                            render: (row, index) => <div>{index + 1}</div>,
                        },
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
                                    <p className="flex cursor-pointer items-center relative group" onClick={() => onEdit(item)}>
                                        <IconEye className="w-4.5 h-4.5 flex items-center transition-opacity duration-200 group-hover:opacity-0" />
                                        <p className="absolute left-[-10px] text-center text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">ดูข้อมูล</p>
                                    </p>
                                </div>
                            ),
                        },
                    ]}
                    minHeight={160}
                    highlightOnHover
                />
            </div> */}
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
                                        <div className="text-lg font-medium  dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">{noteData.id ? t('view_data') : t('add_data')}</div>
                                    </div>
                                    <Formik initialValues={noteData} onSubmit={onSubmitData} enableReinitialize autoComplete="off">
                                        <Form className="px-4 pb-4 flex flex-col gap-3 custom-select">
                                            <InputField as="textarea" label={t('message')} name="memo" rows="10"/>
                                            {!noteData.id && (
                                                <button type="submit" className="btn btn-primary  rtl:mr-4">
                                                    {t('save')}
                                                </button>
                                            )}
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
