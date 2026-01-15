import { Form, Formik, Field } from 'formik';
import Swal from 'sweetalert2';
import SelectField from '../../../components/HOC/SelectField';
import InputField from '../../../components/HOC/InputField';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { PAGE_SIZES } from '../../../helpers/config';
import Breadcrumbs from '../../../helpers/breadcrumbs';
import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toastAlert } from '../../../helpers/constant';
import PreLoading from '../../../helpers/preLoading';
import { convertDateClientToDb, convertDateTimeToApiByBangkok, convertTimeDateDbToClient } from '../../../helpers/formatDate';
import themeInit from '../../../theme.init';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';
import { useTranslation } from 'react-i18next'   // 新增

// const defaultForm = {
//     commission: '',
//     benefit: '',
//     fee: '',
// };

const ReportEdit = () => {
    const { t } = useTranslation();              // 新增

    const { id } = useParams();
    const toast = Swal.mixin(toastAlert);
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const id_business_unit = searchParams.get('id_business_unit');
    const id_shop = searchParams.get('id_shop');

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [defaultForm, setDefaultForm] = useState<any>({
        id_shop: '',
        id_contract: '',
        commission_price: '',
        benefit: '',
        fee: '',
        principle: 0,
    });
    const [principle, setPrinciple] = useState<any>({ old: 0, remain: 0 });
    const [commission, setCommission] = useState<any>({ old: 0, remain: 0 });
    const [bonus, setBonus] = useState<any>({ old: 0, remain: 0 });
    const [contractFee, setContractFee] = useState<any>({ old: 0, remain: 0 });
    const [history, setHistory] = useState<any>([]);

    const breadcrumbItems = [
        { to: '/apps/report/pay-to-shop-pv', label: t('shop_reward_report') }, // 新 key：店铺回报报告
        { to: `/apps/report/pay-to-shop-pv/shop/${id_shop}?id_business_unit=${id_business_unit}`, label: t('reward_report') }, // 已有 key：回报报告
        { label: t('edit'), isCurrent: true },
    ];

    const { mutate: fetchContractPayload } = useGlobalMutation(url_api.contractPVPayload, {
            onSuccess: (res: any) => {
                setDefaultForm((prev: any) => ({
                    ...prev,
                    ...res.data,
                    id_shop: res.data?.shop?.name,
                    id_contract: res.data?.contract?.reference,
                    commission_price: res.data?.commission_price,
                    benefit: res.data?.benefit,
                    fee: res.data?.fee,
                    principle: res.data?.principle,

                }));
                setCommission({ old: res.data.commission_price, remain: res.data.commission_price });
                setBonus({ old: res.data.benefit, remain: res.data.benefit });
                setContractFee({ old: res.data.fee, remain: res.data.fee });
                setHistory(res.data.history);
                setPrinciple({ old: res.data.principle, remain: res.data.principle });
                setTotalItems(res.data.history.length);
            },
            onError: () => {
                console.error('Failed to fetch status data');
            },
    });


    const { mutate: updateContractPV } = useGlobalMutation(url_api.contractPVUpdate, {
            onSuccess: (res: any) => {
                if (res.code == 200 || res.statusCode == 200) {
                    location.reload();
                    toast.fire({
                        icon: 'success',
                        title: t('save_success'),                     // 已有 key
                        padding: '10px 20px',
                    })
                } else {
                    toast.fire({
                        icon: 'error',
                        title: res?.message,
                        padding: '10px 20px',
                    });
                }
            },
            onError: () => {
                console.error('Failed to fetch status data');
            },
    });


    const { mutate: cancelContractPV } = useGlobalMutation(url_api.contractPVCancel, {
            onSuccess: (res: any) => {
                if (res.code == 200 || res.statusCode == 200) {
                    toast.fire({
                        icon: 'success',
                        title: t('cancel_pv_success'),                // 新 key：取消 PV 成功
                        padding: '10px 20px',
                    })
                    navigate(`/apps/report/pay-to-shop-pv/shop/${id_shop}?id_business_unit=${id_business_unit}`)
                } else {
                    toast.fire({
                        icon: 'error',
                        title: res?.message,
                        padding: '10px 20px',
                    });
                }
            },
            onError: () => {
                console.error('Failed to fetch status data');
            },
    });

    const onSubmit = async (event: any) => {
        const params = {
            ...(event.commission_price ? { commission_price: +event.commission_price } : { commission_price: commission.old }),
            ...(event.benefit ? { benefit: +event.benefit } : { benefit: bonus.old }),
            ...(event.fee ? { fee: +event.fee } : { fee: contractFee.old }),
            ...(event.principle ? { principle: +event.principle } : { principle: principle.old }),
            pv_id: id,
        };
        setIsLoading(true);
        await updateContractPV({
            data: params,
        });
        setIsLoading(false);
    };

    const onCancelPV = () => {
        Swal.fire({
            title: t('confirm_cancel_pv'),             // 新 key：确认取消 PV
            text: t('confirm_cancel_pv_text'),         // 新 key：确认取消 PV 文本
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: themeInit.color.themePrimary,
            cancelButtonColor: '#d33',
            confirmButtonText: t('confirm'),           // 已有 key
            cancelButtonText: t('cancel'),             // 已有 key
            reverseButtons: true,
            html: `<label for="reason_cancel" style="display: block; text-align: left; margin-bottom: 10px; font-size: 1rem; margin-top: 10px; color: #000000;">${t('cancellation_reason')}:</label>  // 新 key：取消原因
            <input id="reason_cancel" type="text" class="swal2-input" style="margin: 0 !important; width: 100%; font-size: 1rem; color: #000000;" placeholder="${t('please_enter_info')}">  // 已有 key：请输入信息
            <label for="password" style="display: block; text-align: left; font-size: 1rem; margin-top: 10px; color: #000000;">${t('user_password')}:</label>  // 新 key：用户密码
            <input id="password" type="password" type="text" class="swal2-input" style="margin: 0 !important; width: 100%; font-size: 1rem; color: #000000;" placeholder="${t('user_password_confirm')}">`,  // 新 key：用户密码确认
            preConfirm: () => {
                const reason_cancel = document?.getElementById('reason_cancel') as HTMLInputElement;
                const password = document?.getElementById('password') as HTMLInputElement;
    
                if (!reason_cancel.value || !password.value) {
                    Swal.showValidationMessage(t('fill_all_fields'));  // 新 key：请填写所有字段
                    return false;
                }
    
                return { reason_cancel: reason_cancel.value, password: password.value };
            },
        }).then((result) => {
            const params = { ...result.value, pv_id: id };
            if (result.isConfirmed) {
                cancelContractPV({ data: params });
            }
        });
    };

    useEffect(() => {
        fetchContractPayload({ data: { pv_id: id } });
    }, []);
    
    return (
        <>
            <Breadcrumbs items={breadcrumbItems} />
            {isLoading && <PreLoading />}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <div className="invoice-table flex justify-between">
                    <div className="my-3 text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">{t('edit_shop_reward')}  </div>
                    <button type="button" onClick={onCancelPV} className="bg-red-500 rounded-lg px-4 active:scale-[0.97] shadow text-white border-0">
                    {t('cancel_pv')}                // 新 key：取消 PV
                    </button>
                </div>
                <Formik initialValues={defaultForm} onSubmit={onSubmit} enableReinitialize>
                    {({ setFieldValue }) => (
                        <Form className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <InputField label={t('shop')} id="id_shop" name="id_shop" disabled={true} />
                                <InputField label={t('contract_number')} id="id_contract" name="id_contract" disabled={true} />
                            </div>
                            <h3 className="text-[16px] font-semibold">{t('item_number')}</h3>
                            <div className="table-responsive ">
                                <table className="table-striped table-hover">
                                    <thead>
                                        <tr>
                                        <th className="text-center">{t('order')}</th>  // 已有 key：序号
                                        <th className="min-w-[155px]">{t('item')}</th>  // 新 key：项目
                                        <th className="min-w-[200px]">{t('current_amount')}</th>  // 新 key：当前金额
                                        <th>{t('adjusted_amount')}</th>   
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="text-center">1</td>
                                            <td>{t('lease_principal')}</td>   
                                            <td>{principle.old}</td>
                                            <td>
                                                <Field name="principle">
                                                    {({ field }: any) => (
                                                        <input
                                                            type="text"
                                                            {...field}
                                                            disabled={defaultForm?.reason_cancel}
                                                            onChange={(e: any) => {
                                                                setFieldValue('principle', e.target.value);
                                                                if (e.target.value == '') {
                                                                    setPrinciple((prev: any) => ({ ...prev, remain: prev.old }));
                                                                }
                                                                setPrinciple((prev: any) => ({ ...prev, remain: +e.target.value }));
                                                            }}
                                                            className="outline-none border-b shadow py-2 px-2"
                                                            onKeyDown={(e) => {
                                                                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && !(e.ctrlKey && e.key.toLowerCase() === 'a')) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-center">2</td>
                                            <td>{t('brokerage_fee')}</td>     
                                            <td>{commission.old}</td>
                                            <td>
                                                <Field name="commission_price">
                                                    {({ field }: any) => (
                                                        <input
                                                            type="text"
                                                            {...field}
                                                            disabled={defaultForm?.reason_cancel}
                                                            onChange={(e: any) => {
                                                                setFieldValue('commission_price', e.target.value);
                                                                if (e.target.value == '') {
                                                                    setCommission((prev: any) => ({ ...prev, remain: prev.old }));
                                                                }
                                                                setCommission((prev: any) => ({ ...prev, remain: +e.target.value }));
                                                            }}
                                                            className="outline-none border-b shadow py-2 px-2"
                                                            onKeyDown={(e) => {
                                                                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && !(e.ctrlKey && e.key.toLowerCase() === 'a')) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                            </td>
                                        </tr>
                                        <tr className="bg-[rgba(224,230,237,0.2)]">
                                            <td className="text-center">3</td>
                                            <td>{t('special_reward')}</td>   
                                            <td>{bonus.old}</td>
                                            <td>
                                                <Field name="benefit">
                                                    {({ field }: any) => (
                                                        <input
                                                            type="text"
                                                            {...field}
                                                            disabled={defaultForm?.reason_cancel}
                                                            onChange={(e) => {
                                                                setFieldValue('benefit', e.target.value);
                                                                if (e.target.value == '') {
                                                                    setBonus((prev: any) => ({ ...prev, remain: prev.old }));
                                                                }
                                                                setBonus((prev: any) => ({ ...prev, remain: +e.target.value }));
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (!/[0-9\-]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && !(e.ctrlKey && e.key.toLowerCase() === 'a')) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            className="outline-none border-b shadow py-2 px-2"
                                                        />
                                                    )}
                                                </Field>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-center">4</td>
                                            <td>{t('contract_fee')}</td>        
                                            <td>{contractFee.old}</td>
                                            <td>
                                                <Field name="fee">
                                                    {({ field }: any) => (
                                                        <input
                                                            type="text"
                                                            {...field}
                                                            disabled={defaultForm?.reason_cancel}
                                                            onKeyDown={(e) => {
                                                                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && !(e.ctrlKey && e.key.toLowerCase() === 'a')) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            onChange={(e) => {
                                                                setFieldValue('fee', e.target.value);
                                                                if (e.target.value == '') {
                                                                    setContractFee((prev: any) => ({ ...prev, remain: prev.old }));
                                                                }
                                                                setContractFee((prev: any) => ({ ...prev, remain: +e.target.value }));
                                                            }}
                                                            className="outline-none border-b shadow py-2 px-2"
                                                        />
                                                    )}
                                                </Field>
                                            </td>
                                        </tr>
                                        <tr className="bg-[rgba(224,230,237)]">
                                            <td className="text-center"></td>
                                            <td className="font-semibold">{t('total')}</td> 
                                            <td></td>
                                            <td className="font-semibold">{principle.remain + commission.remain + bonus.remain - contractFee.remain}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {!defaultForm?.reason_cancel && <div className="flex gap-4 justify-center">
                                <NavLink to={`/apps/report/pay-to-shop-pv/shop/${id_shop}?id_business_unit=${id_business_unit}`} className="px-4 py-2 rounded-md border border-black/50 text-black">
                                {t('cancel')}   
                                </NavLink>
                                <button type="submit" className="px-4 py-2 rounded-md bg-blue-500 text-white ">
                                {t('save')}       
                                </button>
                            </div>}
                        </Form>
                    )}
                </Formik>
            </div>
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <h5 className="text-lg font-semibold mb-4">ประวัติการทำรายการ</h5>
                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={history}
                        columns={[
                            {
                                accessor: 'id',
                                title: t('order'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => <p>{history.length - index}</p>,
                            },
                            {
                                accessor: 'pv_no',
                                title: t('transaction_number'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'commission_price',
                                title: t('brokerage_fee'),  
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'benefit',
                                title: t('special_reward'),    
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'fee',
                                title: t('contract_fee'),  
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'commission_price_before',
                                title: t('brokerage_fee_adjusted'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'benefit_before',
                                title: t('special_reward_adjusted'),   
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'fee_before',
                                title: t('contract_fee_adjusted'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'userChanged',
                                title: t('operator_adjusted'),     
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'created_at',
                                title: t('date_time'), 
                                textAlignment: 'center',
                                sortable: false,
                                render: (item: any) => <p>{convertDateTimeToApiByBangkok(item?.created_at)}</p>,
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
            </div>
        </>
    );
};

export default ReportEdit;
