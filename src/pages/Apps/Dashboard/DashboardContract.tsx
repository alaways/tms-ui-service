import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';
import PreLoading from '../../../helpers/preLoading';
import { numberCommas } from '../../../helpers/formatNumeric';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SelectField from '../../../components/HOC/SelectField';
import { Form, Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice';
import { toastAlert } from '../../../helpers/constant';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const mode = process.env.MODE || 'admin';

const DashboardContract = () => {
    const { t } = useTranslation()
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState<any>();
    const [itemBusinessUnit, setBusinessUnitList] = useState<any>([]);
    const toast = Swal.mixin(toastAlert);
    const storedUser = localStorage.getItem(mode);
    const user = storedUser ? JSON.parse(storedUser) : null;
    const role = user ? user.role : null;
    if (role != 'admin' && role != 'business_unit') {
        navigate('/');
    }

    const [dataStored, setDataStored] = useState<any>(storedUser ? JSON.parse(storedUser) : null);
    const [businessSelect, setBusinessSelect] = useState<number | null>(mode == 'business_unit' && dataStored?.id_business_unit ? dataStored?.id_business_unit : null);
    const { mutateAsync: fetchDashboard, isLoading: isLoadingDashboard } = useGlobalMutation(url_api.dashboardFindAllV2, {
        onSuccess: (res: any) => {
            if (res.statusCode == 200) {
                setDashboardData(res.data);
            }
        },
        onError: (err: any) => console.log(err),
    });

    const { mutate: fetchBuALL } = useGlobalMutation(url_api.businessUnitFindAll, {
        onSuccess: (res: any) => {
            setBusinessUnitList(
                res.data.list.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                }))
            );
        },
        onError: () => {},
    });

    useEffect(() => {
        if (role === 'business_unit') {
            fetchDashboard({
                data: {
                    id_business_unit: [user.id_business_unit],
                },
            });
        }
    }, []);

    useEffect(() => {
        fetchBuALL({});
    }, []);

    useEffect(() => {
        dispatch(setPageTitle(t('dashboard_v2')));
        // dispatch(setSidebarActive(['', '/']));
    }, [dispatch, t]);

    return (
        <div className="pt-5">
            <h1 className="text-2xl font-semibold">{t('dashboard')}</h1>
            {mode != 'business_unit' && !dataStored?.id_business_unit && (
                <Formik
                    initialValues={{ id_business_unit: '' }}
                    onSubmit={(values) => {
                        if (values.id_business_unit === null) {
                            toast.fire({
                                icon: 'warning',
                                title: t('please_select_business_unit'),
                                padding: '10px 20px',
                            });
                        } else {
                            fetchDashboard({
                                // todo
                                data: {
                                    id_business_unit: role === 'admin' ? values.id_business_unit : [values.id_business_unit],
                                },
                            });
                        }
                    }}
                    enableReinitialize
                >
                    <Form>
                        {role === 'admin' && (
                            <>
                                <div className="w-full flex flex-wrap items-end gap-4 pt-6 mb-6 min-[1141px]:max-w-[634px]">
                                    <SelectField
                                        id="bu"
                                        label={t('business_unit')}
                                        className="z-10 flex-1 min-w-[250px]"
                                        name="id_business_unit"
                                        options={itemBusinessUnit}
                                        isSearchable={true}
                                        isMulti={true}
                                        onChange={(e) => {}}
                                    />
                                    <button type="submit" className="btn btn-success gap-2 h-[40px] px-4 whitespace-nowrap">
                                        {t('search')}
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                </Formik>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
                {isLoadingDashboard ? (
                    <>
                        <Skeleton className="min-h-[200px]" borderRadius={8} />
                        <Skeleton className="min-h-[200px]" borderRadius={8} />
                        <Skeleton className="min-h-[200px]" borderRadius={8} />
                        <Skeleton className="min-h-[200px]" borderRadius={8} />
                    </>
                ) : (
                    <>
                        <div
                            className={`flex bg-white items-center justify-center min-h-[100px] bg-cover bg-center bg-no-repeat rounded-lg `}
                            style={{ backgroundImage: "url('https://t3.ftcdn.net/jpg/08/55/60/54/360_F_855605431_u6po8au4Ma8CAdY5GDtfFt6AcuLmqq9b.jpg')", backgroundSize: 'cover' }}
                        >
                            <div className="border h-full rounded-lg shadow-sm pt-4 bg-black/20 backdrop-blur-sm border border-white/50 rounded-lg shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] text-white relative before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none">
                                <h1 className="text-xl font-semibold px-4">{t('contract_account')}</h1>
                                <table className="w-full table-fixed border-collapse">
                                    <tr className="h-[50px]">
                                        <th className="w-1/4 text-left px-4">{t('item')}</th>
                                        <th className="w-1/4">{t('yesterday')}</th>
                                        <th className="w-1/4">{t('this_month')}</th>
                                        <th className="w-1/4">{t('1_month_ago')}</th>
                                        <th className="w-1/4">{t('3_months_ago')}</th>
                                        <th className="w-1/4">{t('6_months_ago')}</th>
                                        <th className="w-1/4">{t('this_year')}</th>
                                        <th className="w-1/4">{t('all')}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('approved_contracts')}</th>
                                        <th>{numberCommas(dashboardData?.contract?.appv.today)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.appv.month)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.appv.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.appv.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.appv.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.appv.year)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.appv.all)}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('total_contract_value')}</th>
                                        <th>{numberCommas(dashboardData?.contract?.price_total.today)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.price_total.month)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.price_total.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.price_total.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.price_total.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.price_total.year)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.price_total.all)}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('down_payment_amount')}</th>
                                        <th>{numberCommas(dashboardData?.contract?.down_payment.today)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.down_payment.month)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.down_payment.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.down_payment.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.down_payment.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.down_payment.year)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.down_payment.all)}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('contract_processing_fee')}</th>
                                        <th>{numberCommas(dashboardData?.contract?.fee.today)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.fee.month)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.fee.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.fee.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.fee.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.fee.year)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.fee.all)}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('product_cost')}</th>
                                        <th>{numberCommas(dashboardData?.contract?.principle.today)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.principle.month)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.principle.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.principle.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.principle.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.principle.year)}</th>
                                        <th>{numberCommas(dashboardData?.contract?.principle.all)}</th>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <div
                            className={`flex bg-white items-center justify-center min-h-[100px] bg-cover bg-center bg-no-repeat rounded-lg `}
                            style={{
                                backgroundImage: "url('https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?cs=srgb&dl=pexels-francesco-ungaro-281260.jpg&fm=jpg')",
                                backgroundSize: 'cover',
                            }}
                        >
                            <div className="border h-full rounded-lg shadow-sm pt-4 bg-black/20 backdrop-blur-sm border border-white/50 rounded-lg shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] text-white relative before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none">
                                <h1 className="text-xl font-semibold px-4">{t('debtor_account')}</h1>
                                <table className="w-full table-fixed border-collapse">
                                    <tr className="h-[50px]">
                                        <th className="w-1/4 text-left px-4">{t('item')}</th>
                                        <th className="w-1/4">{t('yesterday')}</th>
                                        <th className="w-1/4">{t('this_month')}</th>
                                        <th className="w-1/4">{t('1_month_ago')}</th>
                                        <th className="w-1/4">{t('3_months_ago')}</th>
                                        <th className="w-1/4">{t('6_months_ago')}</th>
                                        <th className="w-1/4">{t('this_year')}</th>
                                        <th className="w-1/4">{t('all')}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('outstanding_debt')}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.outstanding.today)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.outstanding.month)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.outstanding.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.outstanding.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.outstanding.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.outstanding.year)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.outstanding.all)}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('paid')}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.paid.today)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.paid.month)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.paid.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.paid.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.paid.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.paid.year)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.paid.all)}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('overdue')}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.price_total.today)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.price_total.month)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.price_total.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.price_total.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.price_total.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.price_total.year)}</th>
                                        <th>{numberCommas(dashboardData?.debtor?.price_total.all)}</th>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <div
                            className={`flex bg-white items-center justify-center min-h-[100px] bg-cover bg-center bg-no-repeat rounded-lg `}
                            style={{
                                backgroundImage:
                                    "url('https://static.vecteezy.com/system/resources/thumbnails/007/905/994/small_2x/starry-purple-night-sky-star-illustration-for-universe-space-astronomy-education-or-background-graphic-element-vector.jpg')",
                                backgroundSize: 'cover',
                            }}
                        >
                            <div className="border min-h-[100px] rounded-lg shadow-sm pt-4 bg-black/20 backdrop-blur-sm border border-white/50 rounded-lg shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] text-white relative before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none">
                                <h1 className="text-xl font-semibold px-4">{t('installment_payment_account')}</h1>
                                <table className="w-full table-fixed border-collapse">
                                    <tr className="h-[50px]">
                                        <th className="w-1/4 text-left px-4">{t('item')}</th>
                                        <th className="w-1/4">{t('yesterday')}</th>
                                        <th className="w-1/4">{t('this_month')}</th>
                                        <th className="w-1/4">{t('1_month_ago')}</th>
                                        <th className="w-1/4">{t('3_months_ago')}</th>
                                        <th className="w-1/4">{t('6_months_ago')}</th>
                                        <th className="w-1/4">{t('this_year')}</th>
                                        <th className="w-1/4">{t('all')}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('pay_solution')}</th>
                                        <th>{numberCommas(dashboardData?.payment?.ps.today)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.ps.month)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.ps.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.ps.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.ps.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.ps.year)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.ps.all)}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('cash_bank_transfer')}</th>
                                        <th>{numberCommas(dashboardData?.payment?.cash.today)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.cash.month)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.cash.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.cash.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.cash.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.cash.year)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.cash.all)}</th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th className="text-left px-4">{t('total_amount')}</th>
                                        <th>{numberCommas(dashboardData?.payment?.total.today)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.total.month)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.total.month_1)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.total.month_3)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.total.month_6)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.total.year)}</th>
                                        <th>{numberCommas(dashboardData?.payment?.total.all)}</th>
                                    </tr>
                                </table>
                            </div>
                        </div>


                        <div
                            className={`flex bg-white items-center justify-center min-h-[100px] bg-cover bg-center bg-no-repeat rounded-lg `}
                            style={{
                                backgroundImage: "url('https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?_gl=1*sm4vee*_ga*ODQ4ODI1MTI0LjE3NTc1OTkyMjc.*_ga_8JE65Q40S6*czE3NTc1OTkyMjckbzEkZzAkdDE3NTc1OTkyMjckajYwJGwwJGgw')",
                                backgroundSize: 'cover',
                            }}
                        >
                            <div className="border h-full rounded-lg shadow-sm pt-4 bg-black/20 backdrop-blur-sm border border-white/50 rounded-lg shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] text-white relative before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none">
                                <h1 className="text-xl font-semibold px-4">{t('overdue_contracts')}</h1>
                                <table className="w-full table-fixed border-collapse">
                                     <tr className="h-[50px]">
                                        <th className="w-1/4">{t('phase')} 1</th>
                                        <th className="w-1/4">{t('phase')} 2</th>
                                        <th className="w-1/4">{t('phase')} 3</th>
                                        <th className="w-1/4">{t('phase')} 4</th>
                                        <th className="w-1/4"></th>
                                    </tr>
                                    <tr className="h-[50px] border-t">
                                        <th>{numberCommas(dashboardData?.pay_late?.contract_late_payed_code_20)}</th>
                                        <th>{numberCommas(dashboardData?.pay_late?.contract_late_payed_code_21)}</th>
                                        <th>{numberCommas(dashboardData?.pay_late?.contract_late_payed_code_22)}</th>
                                        <th>{numberCommas(dashboardData?.pay_late?.contract_late_payed_code_48)}</th>
                                        <th></th>
                                    </tr>

                                </table>
                            </div>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardContract;
