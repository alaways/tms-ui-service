import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle, setSidebarActive } from '../store/themeConfigSlice';
import { url_api } from '../services/endpoints';
import { useBusinessUnitFindAllMutation } from '../services/mutations/useBusinessUnitMutation';
import { useGlobalLineMutation, useGlobalMutation } from '../helpers/globalApi';
import { numberWithCommas } from '../helpers/formatNumeric';
import Select from 'react-select';
import ReportShop from './Apps/Shop/ReportShop';
import ReportCustomer from './Apps/CustomerPayment/Dashboard';
import PreLoading from '../helpers/preLoading';
import { convertDateClientToDb, convertDateTimeDbToClient } from '../helpers/formatDate';
import IconInfoCircle from '../components/Icon/IconInfoCircle';
import { useTranslation } from 'react-i18next';

import moment from 'moment';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';


const mode = process.env.MODE || 'admin';
const deployMode = process.env.DEPLOY || 'dev'

const Index = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const storedUser = localStorage.getItem(mode);

  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user ? user.role : null;
  const [buId, setBuId] = useState(null);
  if (role === 'shop') {
    return <ReportShop />;
  } else if (role === 'customer') {
    return <ReportCustomer />;
  }

  useEffect(() => {
    dispatch(setPageTitle('Finance'));
    dispatch(setSidebarActive(['', '/']));
  }, [dispatch]);

  const [loading, setLoading] = useState(false);
  const [itemBusinessUnit, setBusinessUnitList] = useState<any[]>([]);

  const [dashboardLists, setDashboardLists] = useState<any>({
    total_day: 0, // 今日金额 / 泰铢
    total_week: 0, // 本周金额 / 泰铢
    total_month: 0, // 本月金额 / 泰铢
    total_year: 0, // 本年金额 / 泰铢
    ct_approve_day: 0, // 已批准合同 (今日) / 泰铢
    ct_approve_month: 0, // 已批准合同 (本月) / 泰铢
    ct_approve_year: 0, // 已批准合同 (全年) / 泰铢
    due_today: 0, // 今日应付金额 / 泰铢
    due_month: 0, // 本月应付金额 / 泰铢
    due_year: 0, // 全年应付金额 / 泰铢
    ct_approve_count_day: 0, // 已批准合同数量 (今日) / 项
    ct_approve_count_month: 0, // 已批准合同数量 (本月) / 项
    ct_approve_count_year: 0, // 已批准合同数量 (全年) / 项
    ct_3_to_10: 0, // 超过3天但不到10天 / 项
    ct_10_to_15: 0, // 超过10天但不到15天 / 项
    ct_15_up: 0, // 超过15天 / 项
    updated_at: null,
    total_amount_a: 0,
    ct_amount_a: 0,
    ct_unpaid_a: 0,
    ct_count_appr_a: 0,
    ct_hire_purchase_d: 0,
    ct_hire_purchase_m: 0,
    ct_hire_purchase_y: 0,
    ct_hire_purchase_a: 0,
    quota_limit: 0,
    quota_push: 0,
    quota_reply: 0,
    quota_send: 0,
  });

  const { mutate: fetchDashboardData } = useGlobalMutation(url_api.dashboardFindAll, {
    onSuccess: (res: any) => {
      setDashboardLists({
        total_day: res.data?.total_amount_d || 0, // 今日金额 / 泰铢
        total_week: res.data?.total_amount_w || 0, // 本周金额 / 泰铢
        total_month: res.data?.total_amount_m || 0, // 本月金额 / 泰铢
        total_year: res.data?.total_amount_y || 0, // 本年金额 / 泰铢
        ct_approve_day: res.data?.ct_amount_d || 0, // 已批准合同 (今日) / 泰铢
        ct_approve_month: res.data?.ct_amount_m || 0, // 已批准合同 (本月) / 泰铢
        ct_approve_year: res.data?.ct_amount_y || 0, // 已批准合同 (全年) / 泰铢
        ct_approve_count_day: res.data?.ct_count_appr_d || 0, // 已批准合同数量 (今日) / 项
        ct_approve_count_month: res.data?.ct_count_appr_m || 0, // 已批准合同数量 (本月) / 项
        ct_approve_count_year: res.data?.ct_count_appr_y || 0, // 已批准合同数量 (全年) / 项
        due_today: res.data?.ct_unpaid_d || 0, // 应付金额 / 泰铢
        due_month: res.data?.ct_unpaid_m || 0, // 本月应付金额 / 泰铢
        due_year: res.data?.ct_unpaid_y || 0, // 全年应付金额 / 泰铢
        ct_3_to_10: res.data?.ct_status_20 || 0, // 超过3天但不到10天 / 项
        ct_10_to_15: res.data?.ct_status_21 || 0, // 超过10天但不到15天 / 项
        ct_15_up: res.data?.ct_status_22 || 0, // 超过15天 / 项
        updated_at: res.data?.updated_at,
        total_amount_a: res.data?.total_amount_a || 0,
        ct_amount_a: res.data?.ct_amount_a || 0,
        ct_unpaid_a: res.data?.ct_unpaid_a || 0,
        ct_count_appr_a: res.data?.ct_count_appr_a || 0,
        ct_hire_purchase_d: res.data?.ct_hire_purchase_d || 0,
        ct_hire_purchase_m: res.data?.ct_hire_purchase_m || 0,
        ct_hire_purchase_y: res.data?.ct_hire_purchase_y || 0,
        ct_hire_purchase_a: res.data?.ct_hire_purchase_a || 0,
      });
      setLoading(false);
    },
    onError: () => {
      console.error('Failed to fetch dashboard data');
      setLoading(false);
    },
  });
  const { mutate: updateDashboard, isLoading } = useGlobalMutation(url_api.dailyUpdateDashboard, {
    onSuccess: (res: any) => {
      location.reload();
    },
    onError: () => {
      console.error('Failed to fetch dashboard data');
      setLoading(false);
    },
  });

  const { mutate: fetchBusinessUnitData } = useBusinessUnitFindAllMutation({
    onSuccess: (res: any) => {
      setBusinessUnitList(
        res.data.list.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      );
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const { mutate: fetchLineLimit } = useGlobalLineMutation(url_api.lineDevLimet,{'method':'get'}, {
    onSuccess: (res: any) => {
       setDashboardLists((prev: any) => ({ ...prev, quota_limit: res.data.quota.limit, quota_push: res.data.quota.push, quota_reply: res.data.quota.reply, quota_send: res.data.quota.send }));
    },
    onError: () => {
    },
  });

  const goToHistory = () => {
    navigate('/apps/report/pay-to-shop');
  };

  const goToContractList = (status: any) => {
    const bu_id = buId ? `&bu_id=${buId}` : '';
    navigate(`/apps/contract/list-credit?status=${status}${bu_id}`);
  };

  useEffect(() => {
    if (role === 'admin') {
      setLoading(true);
      fetchBusinessUnitData({
        data: {
          page: 1,
          page_size: 100,
        },
      });
      const nowDate = convertDateClientToDb(new Date().toISOString())
      // TODO: name（前缀）应从 BU 获取
      fetchLineLimit({ params: { date: moment(nowDate).format("YYYYMMDD"), name: 'tpl', mode: deployMode } });
    } else {
      fetchDashboardData({
        data: {
          page: 1,
          page_size: 100,
        },
      });
    }
  }, [fetchBusinessUnitData]);

  return (
    <>
      <div>
        <div className="pt-5">
          <div className="flex flex-wrap ">
            <div className="flex flex-wrap gap-4 w-full items-start justify-between">
              <div className="flex flex-col">
                <ul className="flex space-x-2 rtl:space-x-reverse">
                  <li>
                    <Link to="#" className="hover:underline text-xl">
                      Dashboard
                    </Link>
                  </li>
                </ul>
                <div className="flex mt-3">
                  {' '}
                  {t('dashboard_latest_data_as_of')} {convertDateTimeDbToClient(dashboardLists?.updated_at)}{' '}
                  <p
                    className="ml-2 text-blue-500 underline hover:text-blue-700 cursor-pointer"
                    onClick={() => {
                      updateDashboard({});
                    }}
                  >
                    {' '}
                    {t('dashboard_update')}
                  </p>{' '}
                </div>
              </div>
              {role === 'admin' && (
                <div>
                  <label htmlFor="ctnSelect1">{t('dashboard_business_unit')}</label>
                  <Select
                    placeholder={t('dashboard_business_unit')}
                    className="z-10 w-[250px]"
                    options={itemBusinessUnit}
                    isSearchable={true}
                    onChange={(e) => {
                      setLoading(true);
                      setBuId(e.value);
                      if (e.value === null) {
                        fetchDashboardData({
                          data: {
                            page: 1,
                            page_size: 100,
                          },
                        });
                      } else {
                        fetchDashboardData({
                          data: {
                            page: 1,
                            page_size: 100,
                            id_business_unit: e.value,
                          },
                        });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {(loading || isLoading) && <PreLoading />}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 lg:grid-rows-3 gap-3 mt-2">
            <div className="flex flex-wrap panel bg-gradient-to-r from-[#4361ee] to-[#160f6b] min-h-[100px] text-white">
              <div className="flex-initial w-full">
                <div className="ltr:mr-1 rtl:ml-1 text-xl font-semibold">{t('dashboard_todays_amount')}</div>
              </div>
              <div className="flex items-center mt-4 w-full">
                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">
                  {numberWithCommas(dashboardLists.total_day, 0)}
                  <span className="text-2xl"> ฿</span>
                </div>
              </div>
            </div>
            <div className="lg:row-start-2 lg:row-span-2 flex flex-wrap panel">
              <div className="flex flex-wrap w-[100%] mb-2 pb-2" style={{ borderBottom: '1px solid #eee' }}>
                <div className="ltr:pr-4 rtl:pl-4">
                  <div className="flex items-baseline font-semibold">
                    <div className="text-md ltr:mr-1 rtl:ml-1">{t('dashboard_weekly_amount')}</div>
                  </div>
                  <div className="flex items-center mt-2 text-success">
                    <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">{numberWithCommas(dashboardLists.total_week, 0)} ฿</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap w-[100%] mb-2 pb-2" style={{ borderBottom: '1px solid #eee' }}>
                <div className="ltr:pr-4 rtl:pl-4">
                  <div className="items-baseline font-semibold">
                    <div className="text-md ltr:mr-1 rtl:ml-1">{t('dashboard_monthly_amount')}</div>
                  </div>
                  <div className="items-center mt-2 text-success">
                    <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">{numberWithCommas(dashboardLists.total_month, 0)} ฿</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap w-[100%] mb-2 pb-2" style={{ borderBottom: '1px solid #eee' }}>
                <div className="ltr:pr-4 rtl:pl-4">
                  <div className="flex items-baseline font-semibold">
                    <div className="text-md ltr:mr-1 rtl:ml-1">{t('dashboard_yearly_amount')}</div>
                  </div>
                  <div className="flex items-center mt-2 text-success">
                    <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">{numberWithCommas(dashboardLists.total_year, 0)} ฿</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap w-[100%] pb-2" style={{ borderBottom: '1px solid #eee' }}>
                <div className="ltr:pr-4 rtl:pl-4">
                  <div className="flex items-baseline font-semibold">
                    <div className="text-md ltr:mr-1 rtl:ml-1">{t('dashboard_total_amount')}</div>
                  </div>
                  <div className="flex items-center mt-2 text-success">
                    <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">{numberWithCommas(dashboardLists.total_amount_a, 0)} ฿</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap w-[100%] items-center pt-3">
                <div className="w-[100%] text-center">
                  <a role="button" className="btn btn-sm btn-primary w-auto" style={{ display: 'inline-block' }} onClick={() => goToHistory()}>
                    {t('dashboard_view_more')}
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap w-full panel">
                          <div className="flex-initial w-full">
                              <div className="flex items-center">
                                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                                      {t('dashboard_approved_contracts_money')}
                                  </div>
                                  <Tippy content={t('dashboard_approved_contracts_tooltip')} placement="right">
                                      <img
                                          src="/assets/images/information.png"
                                          alt="Info"
                                          className="cursor-pointer w-5 h-5 ml-2"
                                      />
                                  </Tippy>
                              </div>
                          </div>

              <div className="flex items-center mt-5 w-full">
                <div className="flex flex-wrap w-[50%]">
                  <div className="text-sm">{t('dashboard_this_year')}</div>
                  <div className="flex items-center mt-1 w-full">
                    <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{numberWithCommas(dashboardLists.ct_approve_year, 0)} ฿</div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[50%]">
                  <div className="text-sm">{t('dashboard_this_month')}</div>
                  <div className="flex items-center mt-1 w-full">
                    <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{numberWithCommas(dashboardLists.ct_approve_month, 0)} ฿</div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[50%]">
                  <div className="text-sm">{t('dashboard_total')}</div>
                  <div className="flex items-center mt-1 w-full">
                    <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{numberWithCommas(dashboardLists.ct_amount_a, 0)} ฿</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:row-start-2 xl:col-start-2 flex flex-wrap w-full panel">
              <div className="flex-initial w-full">
                              <div className="flex items-center">
                                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                                      {t('dashboard_number_approved_contracts')}
                                  </div>
                                  <Tippy content={t('dashboard_number_approved_contracts_tooltip')} placement="right">
                                      <img
                                          src="/assets/images/information.png"
                                          alt="Info"
                                          className="cursor-pointer w-5 h-5 ml-2"
                                      />
                                  </Tippy>
                              </div>
              </div>
              <div className="flex items-center mt-5 w-full">
                <div className="flex flex-wrap w-[50%]">
                  <div className="text-sm">{t('dashboard_this_year')}</div>
                  <div className="flex items-center mt-1 w-full">
                    <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{numberWithCommas(dashboardLists.ct_approve_count_year, 0)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[50%]">
                  <div className="text-sm">{t('dashboard_this_month')}</div>
                  <div className="flex items-center mt-1 w-full">
                    <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{numberWithCommas(dashboardLists.ct_approve_count_month, 0)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[50%]">
                  <div className="text-sm">{t('dashboard_total')}</div>
                  <div className="flex items-center mt-1 w-full">
                    <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{numberWithCommas(dashboardLists.ct_count_appr_a, 0)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:row-start-3 xl:col-start-2 flex flex-wrap w-full panel">
              <div className="flex-initial w-full">
                              <div className="flex items-center">
                                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                                      {t('dashboard_overdue_contracts')}
                                  </div>
                                  <Tippy content={t('dashboard_overdue_tooltip')} placement="right">
                                      <img
                                          src="/assets/images/information.png"
                                          alt="Info"
                                          className="cursor-pointer w-5 h-5 ml-2"
                                      />
                                  </Tippy>
                              </div>
              </div>
              <div className="flex items-center mt-5 w-full">
                <div className="flex flex-wrap w-[50%]">
                  <div className="text-sm">{t('dashboard_this_year')}</div>
                  <div className="flex items-center mt-1 w-full">
                    <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{numberWithCommas(dashboardLists.due_year, 0)} ฿</div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[50%]">
                  <div className="text-sm">{t('dashboard_this_month')}</div>
                  <div className="flex items-center mt-1 w-full">
                    <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{numberWithCommas(dashboardLists.due_month, 0)} ฿</div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[50%]">
                  <div className="text-sm">{t('dashboard_total')}</div>
                  <div className="flex items-center mt-1 w-full">
                    <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{numberWithCommas(dashboardLists.ct_unpaid_a, 0)} ฿</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:col-start-3 flex flex-wrap w-full panel bg-gradient-to-r from-[#f5704a] to-[#da4a24] text-white">
              <div className="flex flex-wrap justify-center w-full">
                <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{t('dashboard_approved_contracts_today')}</div>
              </div>
              <div className="flex items-center justify-center w-full">
                <div className="text-4xl font-bold ltr:mr-3 rtl:ml-3">
                  {numberWithCommas(dashboardLists.ct_approve_day, 0)}
                  <span className="text-2xl"> ฿</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap w-full panel bg-gradient-to-r from-[#f5704a] to-[#da4a24] text-white">
              <div className="flex flex-wrap justify-center w-full">
                <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{t('dashboard_number_approved_contracts_today')}</div>
              </div>
              <div className="flex items-center justify-center w-full">
                <div className="text-4xl font-bold ltr:mr-3 rtl:ml-3">{numberWithCommas(dashboardLists.ct_approve_count_day, 0)}</div>
              </div>
            </div>
            <div className="lg:col-span-2 xl:col-span-1 flex flex-wrap w-full panel bg-gradient-to-r from-[#f5704a] to-[#da4a24] text-white">
              <div className="flex flex-wrap justify-center w-full">
                <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">{t('dashboard_overdue_contracts_today')}</div>
              </div>
              <div className="flex items-center justify-center w-full">
                <div className="text-4xl font-bold ltr:mr-3 rtl:ml-3">
                  {numberWithCommas(dashboardLists.due_today, 0)}
                  <span className="text-2xl"> ฿</span>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="flex flex-wrap items-start" style={{ marginLeft: '-10px', marginRight: '-10px' }}>
            <div className="flex flex-wrap lg:w-[30%] md:w-[100%]">
              <div className="flex flex-wrap panel w-full bg-gradient-to-r from-[#4361ee] to-[#160f6b] min-h-[100px] text-white mx-2 my-2 h-[140px]">
                <div className="flex-initial w-full">
                  <div className="ltr:mr-1 rtl:ml-1 text-xl font-semibold">
                    ยอดเงินวันนี้
                  </div>
                </div>
                <div className="flex items-center mt-4 w-full">
                  <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">
                    {numberWithCommas(dashboardLists.total_day, 0)}
                    <span className="text-2xl"> ฿</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap panel w-full mx-2 my-2">
                <div className="flex flex-wrap w-[100%] mb-2 pb-2" style={{ borderBottom: '1px solid #eee' }}>
                  <div className="ltr:pr-4 rtl:pl-4">
                    <div className="flex items-baseline font-semibold">
                      <div className="text-md ltr:mr-1 rtl:ml-1">ยอดเงินสัปดาห์</div>
                    </div>
                    <div className="flex items-center mt-2 text-success">
                      <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">
                        {numberWithCommas(dashboardLists.total_week, 0)} ฿
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[100%] mb-2 pb-2" style={{ borderBottom: '1px solid #eee' }}>
                  <div className="ltr:pr-4 rtl:pl-4">
                    <div className="items-baseline font-semibold">
                      <div className="text-md ltr:mr-1 rtl:ml-1">ยอดเงินเดือนนี้</div>
                    </div>
                    <div className="items-center mt-2 text-success">
                      <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">
                        {numberWithCommas(dashboardLists.total_month, 0)} ฿
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[100%] mb-2 pb-2" style={{ borderBottom: '1px solid #eee' }}>
                  <div className="ltr:pr-4 rtl:pl-4">
                    <div className="flex items-baseline font-semibold">
                      <div className="text-md ltr:mr-1 rtl:ml-1">ยอดเงินปีนี้</div>
                    </div>
                    <div className="flex items-center mt-2 text-success">
                      <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">
                        {numberWithCommas(dashboardLists.total_year, 0)} ฿
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[100%] pb-2" style={{ borderBottom: '1px solid #eee' }}>
                  <div className="ltr:pr-4 rtl:pl-4">
                    <div className="flex items-baseline font-semibold">
                      <div className="text-md ltr:mr-1 rtl:ml-1">ยอดเงินทั้งหมด</div>
                    </div>
                    <div className="flex items-center mt-2 text-success">
                      <div className="min-w-20 text-xl ltr:mr-3 rtl:ml-3">
                        {numberWithCommas(dashboardLists.total_amount_a, 0)} ฿
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap w-[100%] items-center pt-3">
                  <div className="w-[100%] text-center">
                    <a role="button" className="btn btn-sm btn-primary w-auto" style={{ display: 'inline-block' }} onClick={() => goToHistory()}>
                      ดูเพิ่มเติม
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap lg:w-[40%] md:w-[100%]">
              <div className="flex flex-wrap w-full panel mx-2 my-2 h-[140px]">
                <div className="flex-initial w-full">
                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                    สัญญาที่อนุมัติ (รวมเป็นเงิน)
                  </div>
                </div>
                <div className="flex items-center mt-5 w-full">
                  <div className="flex flex-wrap w-[50%]">
                    <div className="text-sm">
                      ปีนี้
                    </div>
                    <div className="flex items-center mt-1 w-full">
                      <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                        {numberWithCommas(dashboardLists.ct_approve_year, 0)} ฿
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap w-[50%]">
                    <div className="text-sm">
                      เดือนนี้
                    </div>
                    <div className="flex items-center mt-1 w-full">
                      <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                        {numberWithCommas(dashboardLists.ct_approve_month, 0)} ฿
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap w-[50%]">
                    <div className="text-sm">
                      ทั้งหมด
                    </div>
                    <div className="flex items-center mt-1 w-full">
                      <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                        {numberWithCommas(dashboardLists.ct_amount_a, 0)} ฿
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap w-full panel mx-2 my-2 h-[140px]">
                <div className="flex-initial w-full">
                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                    จำนวนสัญญาที่อนุมัติ
                  </div>
                </div>
                <div className="flex items-center mt-5 w-full">
                  <div className="flex flex-wrap w-[50%]">
                    <div className="text-sm">
                      ปีนี้
                    </div>
                    <div className="flex items-center mt-1 w-full">
                      <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                        {numberWithCommas(dashboardLists.ct_approve_count_year, 0)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap w-[50%]">
                    <div className="text-sm">
                      เดือนนี้
                    </div>
                    <div className="flex items-center mt-1 w-full">
                      <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                        {numberWithCommas(dashboardLists.ct_approve_count_month, 0)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap w-[50%]">
                    <div className="text-sm">
                      ทั้งหมด
                    </div>
                    <div className="flex items-center mt-1 w-full">
                      <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                        {numberWithCommas(dashboardLists.ct_count_appr_a, 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap w-full panel mx-2 my-2 h-[140px]">
                <div className="flex-initial w-full">
                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                    สัญญาค้างชำระ
                  </div>
                </div>
                <div className="flex items-center mt-5 w-full">
                  <div className="flex flex-wrap w-[50%]">
                    <div className="text-sm">
                      ปีนี้
                    </div>
                    <div className="flex items-center mt-1 w-full">
                      <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                        {numberWithCommas(dashboardLists.due_year, 0)} ฿
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap w-[50%]">
                    <div className="text-sm">
                      เดือนนี้
                    </div>
                    <div className="flex items-center mt-1 w-full">
                      <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                        {numberWithCommas(dashboardLists.due_month, 0)} ฿
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap w-[50%]">
                    <div className="text-sm">
                      ทั้งหมด
                    </div>
                    <div className="flex items-center mt-1 w-full">
                      <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                        {numberWithCommas(dashboardLists.ct_unpaid_a, 0)} ฿
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap lg:w-[30%] md:w-[100%]">
              <div className="flex flex-wrap w-full panel bg-gradient-to-r from-[#f5704a] to-[#da4a24] text-white mx-2 my-2 h-[140px]">
                <div className="flex flex-wrap justify-center w-full">
                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                    สัญญาที่อนุมัติวันนี้
                  </div>
                </div>
                <div className="flex items-center justify-center w-full">
                  <div className="text-4xl font-bold ltr:mr-3 rtl:ml-3">
                    {numberWithCommas(dashboardLists.ct_approve_day, 0)}
                    <span className="text-2xl"> ฿</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap w-full panel bg-gradient-to-r from-[#f5704a] to-[#da4a24] text-white mx-2 my-2  h-[140px]">
                <div className="flex flex-wrap justify-center w-full">
                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                    จำนวนสัญญาที่อนุมัติวันนี้
                  </div>
                </div>
                <div className="flex items-center justify-center w-full">
                  <div className="text-4xl font-bold ltr:mr-3 rtl:ml-3">
                    {numberWithCommas(dashboardLists.ct_approve_count_day, 0)}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap w-full panel bg-gradient-to-r from-[#f5704a] to-[#da4a24] text-white mx-2 my-2  h-[140px]">
                <div className="flex flex-wrap justify-center w-full">
                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                    สัญญาค้างชำระวันนี้
                  </div>
                </div>
                <div className="flex items-center justify-center w-full">
                  <div className="text-4xl font-bold ltr:mr-3 rtl:ml-3">
                    {numberWithCommas(dashboardLists.due_today, 0)}
                    <span className="text-2xl"> ฿</span>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          <div className="flex flex-wrap pt-5">
            <div className="flex flex-wrap gap-4 w-full panel">
              <div className="input-container">
                              <div className="flex items-center">
                                  <div className="ltr:mr-1 rtl:ml-1 text-lg font-semibold">
                                      <label style={{ fontWeight: '600' }}>{t('dashboard_hire_purchase_amount')}</label>
                                  </div>
                                  <Tippy content={t('dashboard_hire_purchase_tooltip')} placement="right">
                                      <img
                                          src="/assets/images/information.png"
                                          alt="Info"
                                          className="cursor-pointer w-5 h-5 ml-2 mb-1"
                                      />
                                  </Tippy>
                              </div>
                <div className="flex flex-wrap pt-2">
                  <div className="flex flex-wrap lg:w-1/4 md:w-full items-center py-3">
                    <div className="pl-3 pb-2">
                      <a className="link" onClick={() => goToContractList('20')}>
                        <label style={{ fontWeight: '400' }}>{t('dashboard_today')}</label>
                        <p style={{ fontSize: '1.8rem' }}>{numberWithCommas(dashboardLists.ct_hire_purchase_d, 0)}</p>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap lg:w-1/4 md:w-full items-center py-3">
                    <div className="pl-3 pb-2">
                      <a className="link" onClick={() => goToContractList('21')}>
                        <label style={{ fontWeight: '400' }}>{t('dashboard_this_month')}</label>
                        <p style={{ fontSize: '1.8rem' }}>{numberWithCommas(dashboardLists.ct_hire_purchase_m, 0)}</p>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap lg:w-1/4 md:w-full items-center py-3">
                    <div className="pl-3 pb-2">
                      <a className="link" onClick={() => goToContractList('22')}>
                        <label style={{ fontWeight: '400' }}>{t('dashboard_this_year')}</label>
                        <p style={{ fontSize: '1.8rem' }}>{numberWithCommas(dashboardLists.ct_hire_purchase_y, 0)}</p>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap lg:w-1/4 md:w-full items-center py-3">
                    <div className="pl-3 pb-2">
                      <a className="link" onClick={() => goToContractList('22')}>
                        <label style={{ fontWeight: '400' }}>{t('dashboard_total')}</label>
                        <p style={{ fontSize: '1.8rem' }}>{numberWithCommas(dashboardLists.ct_hire_purchase_a, 0)}</p>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap pt-5">
            <div className="flex flex-wrap gap-4 w-full panel">
              <div className="input-container">
                <label style={{ fontWeight: '600' }}>{t('dashboard_overdue_contracts_count')}</label>
                <div className="flex flex-wrap pt-2">
                  <div className="flex flex-wrap lg:w-2/6 md:w-full items-center py-3">
                    <div className="shrink-0 w-10 h-10 rounded-full grid place-content-center text-white" style={{ backgroundColor: 'rgb(247, 147, 26)' }}>
                      3
                    </div>
                    <div className="pl-3 pb-2">
                      <a className="link" onClick={() => goToContractList('20')}>
                        <label style={{ fontWeight: '400' }}>{t('dashboard_contracts_over_status_20')}</label>
                        <p style={{ fontSize: '1.8rem' }}>{numberWithCommas(dashboardLists.ct_3_to_10, 0)}</p>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap lg:w-2/6 md:w-full items-center py-3">
                    <div className="shrink-0 w-10 h-10 rounded-full grid place-content-center text-white" style={{ backgroundColor: 'rgb(247, 147, 26)' }}>
                      10
                    </div>
                    <div className="pl-3 pb-2">
                      <a className="link" onClick={() => goToContractList('21')}>
                        <label style={{ fontWeight: '400' }}>{t('dashboard_contracts_over_status_21')}</label>
                        <p style={{ fontSize: '1.8rem' }}>{numberWithCommas(dashboardLists.ct_10_to_15, 0)}</p>
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap lg:w-2/6 md:w-full items-center py-3">
                    <div className="shrink-0 w-10 h-10 rounded-full grid place-content-center text-white" style={{ backgroundColor: 'rgb(247, 147, 26)' }}>
                      15
                    </div>
                    <div className="pl-3 pb-2">
                      <a className="link" onClick={() => goToContractList('22')}>
                        <label style={{ fontWeight: '400' }}>{t('dashboard_contracts_over_status_22')}</label>
                        <p style={{ fontSize: '1.8rem' }}>{numberWithCommas(dashboardLists.ct_15_up, 0)}</p>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap pt-5">
            <div className="flex flex-wrap gap-4 w-full panel">
              <div className="input-container">
                <label className='font-semibold'>{t('dashboard_line_notification_limit')}</label>
                <div className='flex justify-between px-3 py-4'>
                  <div className='flex-1'>
                    <p>{t('dashboard_limit')}</p>
                    <p className='text-2xl'>{dashboardLists.quota_limit}</p>
                  </div>
                  <div className='flex-1'>
                    <p>{t('dashboard_send_message')}</p>
                    <p className='text-2xl'>{dashboardLists.quota_send}</p>
                  </div>
                  <div className='flex-1'>
                    <p>{t('dashboard_reply_message')}</p>
                    <p className='text-2xl'>{dashboardLists.quota_reply}</p>
                  </div>
                  <div className='flex-1'>
                    <p>{t('dashboard_bot_send_message')}</p>
                    <p className='text-2xl'>{dashboardLists.quota_push}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
