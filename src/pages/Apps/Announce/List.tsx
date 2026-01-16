import { DataTable } from 'mantine-datatable';
import { Fragment, useEffect, useState } from 'react';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { PAGE_SIZES } from '../../../helpers/config';
import IconPlus from '../../../components/Icon/IconPlus';
import IconSearch from '../../../components/Icon/IconSearch';
import Tippy from '@tippyjs/react';
import IconEdit from '../../../components/Icon/IconEdit';
import IconTrash from '../../../components/Icon/IconTrash';
import IconEye from '../../../components/Icon/IconEye';
import { Dialog, Transition } from '@headlessui/react';
import { Form, Formik } from 'formik';
import InputField from '../../../components/HOC/InputField';
import SelectField from '../../../components/HOC/SelectField';
import DatePickerTime from '../../../components/HOC/DatePickerTime';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';
import { convertDateTimeDbToClient } from '../../../helpers/formatDate';
import { showNotification } from '../../../helpers/showNotification';
import moment from 'moment';
import IconX from '../../../components/Icon/IconX';
import themeInit from '../../../theme.init';
import { useTranslation } from 'react-i18next';

const mode = process.env.MODE || 'admin';

const List = () => {
    const { t } = useTranslation();
    const storedUser = localStorage.getItem(mode);
    const id_business_unit = storedUser ? JSON.parse(storedUser).id_business_unit : null;

    const [businessUnitList, setBusinessUnitList] = useState<any>([]);
    const [shopList, setShopList] = useState<any>([]);
    const [annouceList, setAnnouceList] = useState<any>([]);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [search, setSearch] = useState('');

    const [actionModal, setActionModal] = useState<boolean>(false);
    const [formData, setFormData] = useState<any>({
        id_business_unit: '',
        shop_list: [],
        subject: '',
        message: '',
        start_at: null,
        end_at: null,
        is_active: true,
    });



    const { mutate: fetchAnnounce} = useGlobalMutation(url_api.announceFindAll, {
        onSuccess: (res: any) => {
            if (res.statusCode == 200 && res.code == 200) {
                setAnnouceList(res.data.list);
                setTotalItems(res.data.total);
            }
        },
        onError: () => {
          console.error('Failed to fetch asset type data')
        },
    })


    const { mutate: createAnnounce} = useGlobalMutation(url_api.announceCreate, {
        onSuccess: (res: any) => {
            if (res.statusCode == 200 && res.code == 200) {
                showNotification(t('announce_create_success'), 'success');
                setTimeout(() => {
                    location.reload();
                }, 500);

            }
        },
        onError: () => {
          console.error('Failed to fetch asset type data')
        },
    })


    const { mutate: updateAnnounce} = useGlobalMutation(url_api.announceUpdate, {
        onSuccess: (res: any) => {
            if (res.statusCode == 200 && res.code == 200) {
                showNotification(t('announce_update_success'), 'success');
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        },
        onError: () => {
          console.error('Failed to fetch asset type data')
        },
    })

    const { mutate: deleteAnnounce} = useGlobalMutation(url_api.announceDelete, {
        onSuccess: (res: any) => {
            if (res.statusCode == 200 && res.code == 200) {
                showNotification(t('announce_delete_success'), 'success');
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        },
        onError: () => {
          console.error('Failed to fetch asset type data')
        },
    })

    const { mutate: fetchBusinessUnit } = useGlobalMutation(url_api.contractFilter, {
        onSuccess: (res: any) => {
            setBusinessUnitList(
                res.data.business_unit.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });


    const { mutate: fetchShopData } = useGlobalMutation(url_api.shopFindAll, {
        onSuccess: (res: any) => {
            setShopList(
                res.data.list.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });

    useEffect(() => {
        fetchShopData({});
        fetchBusinessUnit({});
    }, []);

    useEffect(() => {
        fetchAnnounce({ data: { page: page, page_size: pageSize, ...(id_business_unit && { id_business_unit: id_business_unit }) } });
    }, [page, pageSize]);

    const SubmittedForm = Yup.object().shape({
        id_business_unit: Yup.string().required(t('required_field')),
        subject: Yup.string().required(t('required_field')),
        message: Yup.string().required(t('required_field')),
        start_at: Yup.date().nullable().required(t('required_field')),
        end_at: Yup.date().nullable().required(t('required_field')),
        is_active: Yup.boolean().required(t('required_field')),
    });

    const SubmittedEditForm = Yup.object().shape({
        id_business_unit: Yup.string().required(t('required_field')),
        subject: Yup.string().required(t('required_field')),
        message: Yup.string().required(t('required_field')),
        is_active: Yup.boolean().required(t('required_field')),
    });

    const addModal = () => {
        setActionModal(true);
        setFormData({
            id_business_unit: '',
            shop_list: [],
            subject: '',
            message: '',
            start_at: null,
            end_at: null,
            is_active: true,
        });
    };

    const previewModal = (data: any) => {
        setActionModal(true);
        const dateStart = new Date(data.start_at);
        const dateEnd = new Date(data.end_at);
        setFormData({ ...data, start_at: dateStart.setHours(dateStart.getHours() - 7), end_at: dateEnd.setHours(dateEnd.getHours() - 7), shop_list: shopList, preview: true });
    };

    const editModal = (data: any) => {
        setActionModal(true);
        const shopList = data?.shops?.map((item: any) => item.uuid);
        const dateStart = new Date(data.start_at);
        const dateEnd = new Date(data.end_at);
        setFormData({
            ...data,
            start_at: dateStart.setHours(dateStart.getHours() - 7),
            end_at: dateEnd.setHours(dateEnd.getHours() - 7),
            shop_list: shopList,
        });
    };

    const onSubmitForm = async (values: any) => {
        const params = {
            ...values,
            start_at: moment.utc(values.start_at).tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss') + 'Z',
            end_at: moment.utc(values.end_at).tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss') + 'Z',
            announce_id: values.id,
            shop_list: ['all'],
        };
        if (values.id) {
            await updateAnnounce({ data: params });
        } else {
            await createAnnounce({ data: params });
        }
        fetchAnnounce({ data: { page: 1, page_size: pageSize, ...(id_business_unit && { id_business_unit: id_business_unit }) } });
        setActionModal(false);
    };

    const onDeleteAnnounce = (values: any) => {
        const params = { announce_id: values.id };
        Swal.fire({
            title: t('delete_announce_title'),
            text: t('delete_announce_text'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: themeInit.color.themePrimary,
            cancelButtonColor: '#d33',
            confirmButtonText: t('confirm'),
            cancelButtonText: t('cancel'),
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteAnnounce({ data: params });
                fetchAnnounce({ data: { page: 1, page_size: pageSize } });
            }
        });
    };

    const onSearchShop = (value:any) => {
        const filterValue = value.map((item:any) => item.value)
        fetchAnnounce({ data: { page: 1, page_size: pageSize, ...(id_business_unit && { id_business_unit: id_business_unit }),shop_list:filterValue } });
    }

    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4.5 px-5 ">
                <h2 className="text-xl">{t('announce')}</h2>
                <Formik initialValues={{}} onSubmit={() => {}} enableReinitialize autoComplete="off">
                    <Form className="flex flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto custom-select max-w-[500px]">
                        <div className="w-full flex gap-3">
                            <button type="button" className="btn btn-primary w-[200px]" onClick={addModal}>
                                <IconPlus className="ltr:mr-2 rtl:ml-2" />
                                {t('add_announce')}
                            </button>
                            <div className="relative w-full flex items-center">
                                <input
                                    type="text"
                                    placeholder={t('search_text')}
                                    className="form-input py-2 ltr:pr-11 rtl:pl-11 peer"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary"
                                >
                                    <IconSearch className="mx-auto" />
                                </button>
                            </div>
                        </div>
                        <div className="w-full">
                            <SelectField
                                isMulti={true}
                                id="shop_list"
                                name="shop_list"
                                placeholder={t('select_shop')}
                                options={shopList}
                                onChange={onSearchShop}
                            />
                        </div>
                    </Form>
                </Formik>
            </div>
            <div className="datatables pagination-padding">
                <DataTable
                    className="whitespace-nowrap table-hover invoice-table"
                    records={annouceList}
                    columns={[
                        {
                            accessor: 'id',
                            title: t('order'),
                            textAlignment: 'center',
                            sortable: false,
                            render: (row, index) => <div>{index + 1}</div>,
                        },
                        {
                            accessor: 'id_business_unit',
                            title: t('business_unit'),
                            textAlignment: 'center',
                            sortable: false,
                            render: (item: any) => <p>{item?.business_unit_name || '-'}</p>,
                        },
                        {
                            accessor: 'subject',
                            title: t('announce_subject'),
                            textAlignment: 'left',
                            sortable: false,
                            render: (item: any) => <p>{item?.subject || '-'}</p>,
                        },
                        {
                            accessor: 'message',
                            title: t('announce_message'),
                            textAlignment: 'left',
                            sortable: false,
                            render: (item: any) => <p>{item?.message || '-'}</p>,
                        },
                        {
                            accessor: 'start_at',
                            title: t('announce_start_datetime'),
                            textAlignment: 'left',
                            sortable: false,
                            render: (item: any) => <p>{convertDateTimeDbToClient(item.start_at) || '-'} </p>,
                        },
                        {
                            accessor: 'end_at',
                            title: t('announce_end_datetime'),
                            textAlignment: 'left',
                            sortable: false,
                            render: (item: any) => <p>{convertDateTimeDbToClient(item.end_at) || '-'} </p>,
                        },
                        {
                            accessor: 'admin_name',
                            title: t('operator'),
                            textAlignment: 'left',
                            sortable: false,
                        },
                        {
                            accessor: 'is_active',
                            title: t('active_status'),
                            textAlignment: 'center',
                            sortable: false,
                            render: ({ is_active }) => (
                                <span
                                    className={`badge ${
                                        is_active ? 'badge-outline-success' : 'badge-outline-danger'
                                    }`}
                                >
                                    {is_active ? t('open') : t('close')}
                                </span>
                            ),
                        },
                        {
                            accessor: 'action',
                            title: t('actions'),
                            textAlignment: 'center',
                            sortable: false,
                            render: (item) => (
                                <div className="flex gap-4 items-center w-max mx-auto">
                                    <Tippy content={t('view_data')} theme="Primary">
                                        <a className="flex cursor-pointer active" onClick={() => previewModal(item)}>
                                            <IconEye className="w-4.5 h-4.5" />
                                        </a>
                                    </Tippy>
                                    <Tippy content={t('edit')} theme="Primary">
                                        <a className="flex cursor-pointer active" onClick={() => editModal(item)}>
                                            <IconEdit className="w-4.5 h-4.5" />
                                        </a>
                                    </Tippy>
                                    <Tippy content={t('delete')} theme="Primary">
                                        <a className="flex cursor-pointer active" onClick={() => onDeleteAnnounce(item)}>
                                            <IconTrash />
                                        </a>
                                    </Tippy>
                                </div>
                            ),
                        },
                    ]}
                    minHeight={180}
                    page={page}
                    totalRecords={totalItems}
                    recordsPerPage={pageSize}
                    highlightOnHover
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={(p) => {
                        setPage(1);
                        setPageSize(p);
                    }}
                    paginationText={({ from, to, totalRecords }) => t('pagination_text', { from, to, totalRecords })}
                />
            </div>
            <Transition appear show={actionModal} as={Fragment}>
                <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-12 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-5xl text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setActionModal(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    {formData.preview
                                            ? t('view_detail')
                                            : formData.id
                                            ? t('edit')
                                            : t('add')}
                                    </div>
                                    <div className="p-5">
                                        <Formik
                                            initialValues={formData}
                                            onSubmit={onSubmitForm}
                                            enableReinitialize
                                            autoComplete="off"
                                            validationSchema={formData.id ? SubmittedEditForm : SubmittedForm}
                                        >
                                            {(props) => (
                                                <Form className="space-y-5 mb-7 dark:text-white">
                                                    {mode === 'admin' && (
                                                        <SelectField
                                                            label={t('business_unit') || ''}
                                                            id="id_business_unit"
                                                            name="id_business_unit"
                                                            isSearchable={true}
                                                            options={businessUnitList}
                                                            disabled={formData?.id ? true : false}
                                                        />
                                                    )}
                                                    {/*
                                                    <SelectField
                                                        label="ร้านค้า"
                                                        isMulti={true}
                                                        id="shop_list"
                                                        name="shop_list"
                                                        isSearchable={true}
                                                        options={shopList}
                                                        disabled={formData?.preview ? true : false}
                                                    /> */}
                                                    <InputField
                                                        label={t('announce_subject')}
                                                        name="subject"
                                                        type="text"
                                                        placeholder={t('required_field')}
                                                        disabled={formData?.preview ? true : false}
                                                    />
                                                    <InputField
                                                        label={t('announce_message')}
                                                        name="message"
                                                        type="text"
                                                        placeholder={t('required_field')}
                                                        disabled={formData?.preview ? true : false}
                                                    />
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <DatePickerTime
                                                            label={t('from_date')}
                                                            name="start_at"
                                                            disabled={formData?.preview ? true : false}
                                                        />
                                                        <DatePickerTime
                                                            label={t('to_date')}
                                                            name="end_at"
                                                            disabled={formData?.preview ? true : false}
                                                        />
                                                    </div>
                                                    <SelectField
                                                        label={t('status')}
                                                        id="is_active"
                                                        name="is_active"
                                                        options={[
                                                            {
                                                                value: true,
                                                                label: t('open'),
                                                            },
                                                            {
                                                                value: false,
                                                                label: t('close'),
                                                            },
                                                        ]}
                                                        placeholder={t('please_select')}
                                                        onChange={(e: any) => {
                                                            props.setFieldValue('is_active', e.value);
                                                        }}
                                                        isSearchable={false}
                                                        disabled={formData?.preview ? true : false}
                                                    />
                                                    {!formData?.preview && (
                                                        <div className="flex justify-end items-center mt-8">
                                                            <button type="button" className="btn btn-outline-danger" onClick={() => setActionModal(false)}>
                                                                {t('cancel')}
                                                            </button>
                                                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                            {formData.id ? t('save') : t('add')}
                                                            </button>
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
