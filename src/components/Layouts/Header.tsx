import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../store'
import { toggleRTL, toggleSidebar, toggleLocale } from '../../store/themeConfigSlice'
import Dropdown from '../Dropdown'
import IconMenu from '../Icon/IconMenu'
import IconLogout from '../Icon/IconLogout'
import { useGlobalMutation } from '../../helpers/globalApi'
import { useBusinessUnitFindMutation } from '../../services/mutations/useBusinessUnitMutation'
import { url_api } from '../../services/endpoints'
import IconBellBing from '../Icon/IconBellBing'
import IconInfoCircle from '../Icon/IconInfoCircle'
import moment from 'moment-timezone'
import IconSearch from '../Icon/IconSearch'
import themeInit from '../../theme.init'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'admin'

const Header = () => {

  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const storedUser: any = localStorage.getItem(mode);
  const user: any = storedUser ? JSON.parse(storedUser) : null;
  const userRole = user ? user?.role : null;
  const [closeMessage, setCloseMessage] = useState(null)

  const { mutate: getConfigTMS } = useGlobalMutation(url_api.getConfigTMS, {
    onSuccess: (res: any) => {
      const startDate = moment.tz(res.data.date_start, 'YYYY-MM-DD HH:mm', 'Asia/Bangkok').subtract(1,'day')
      const endDate = moment.tz(res.data.date_end, 'YYYY-MM-DD HH:mm', 'Asia/Bangkok');
      const now = moment().tz('Asia/Bangkok');

      // if(res.data.status) {
      //   setCloseMessage(res.data.message)
      // }
      const isWithinRange = now.isBetween(startDate, endDate, null, '[]');
      if (isWithinRange && res.data.status) {
        setCloseMessage(res.data.message)
      } else {
        setCloseMessage(null)
      }
    }
  })

  useEffect(() => {
    // const fcm_token = localStorage.getItem('FCM_TOKEN')
    // if (fcm_token !== undefined && fcm_token !== null && fcm_token !== '') {
    //   updateFCM({ data: { fcm_token: fcm_token } })
    // }
    getConfigTMS({})
    if (userRole === "business_unit" && user?.buName === undefined) {
      fetchBusinessUnits({
        data: {
          id: user.id_business_unit
        }
      })
    }
  }, [])

  const { mutate: fetchBusinessUnits } = useBusinessUnitFindMutation({
    async onSuccess(res: any) {
      localStorage.setItem(mode, JSON.stringify({
        ...user,
        //tax_id: res?.data?.tax_id,
        buName: res?.data?.name,
        // email: res?.data?.email,
        // phone: res?.data?.phone,
        // commission: res?.data?.commission,
        // benefit: res?.data?.benefit,
        // penalty_fee: res?.data?.penalty_fee,
        // address: res?.data?.address,
        // id_subdistrict: res?.data?.id_subdistrict,
        // id_district: res?.data?.id_district,
        // id_province: res?.data?.id_province,
        // zip_code: res?.data?.zip_code,
        // full_address: res?.data?.full_address,
      }))
    },
    onError(error: any) { },
  })


  useEffect(() => {
    const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]')
    if (selector) {
      selector.classList.add('active')
      const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active')
      for (let i = 0; i < all.length; i++) {
        all[0]?.classList.remove('active')
      }
      const ul: any = selector.closest('ul.sub-menu')
      if (ul) {
        let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link')
        if (ele) {
          ele = ele[0]
          setTimeout(() => {
            ele?.classList.add('active')
          })
        }
      }
    }
  }, [location])

  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl'

  const themeConfig = useSelector((state: IRootState) => state.themeConfig)
  const dispatch = useDispatch()

  const [notifications, setNotifications] = useState([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);

  const [readNotifications, setReadNotifications] = useState<string[]>(() => {
    const storedReadNotifications = localStorage.getItem('readNotifications');
    return storedReadNotifications ? JSON.parse(storedReadNotifications) : [];
  });

  const { mutate: markNotificationAsRead } = useGlobalMutation(url_api.readNotify, {
    onSuccess: (res: any) => {
      setReadNotifications((prevReadNotifications) => [...prevReadNotifications, res.data.notificationId]);
      setNewNotificationsCount((prevCount) => prevCount - 1);
    },
    onError: (err: any) => {
      console.error("Failed to mark notification as read:", err);
    },
  });

  const { mutate: getNotify } = useGlobalMutation(url_api.getNotify, {
    onSuccess: (res: any) => {
      const sortedNotifications = res.data.sort(
        (a: any, b: any) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime()
      );
      setNotifications(sortedNotifications.slice(0, 10));
      const unreadCount = sortedNotifications.filter(
        (notification: any) => !notification.read
      ).length;
      setNewNotificationsCount(unreadCount);
    },
    onError: (err: any) => {
      console.error(err);
    },
  });

  const [searchText, setSearchText] = useState<any>('');
  const seachContract = () => {
     navigate(`/apps/contract/search?query=${searchText}`);
  };


  useEffect(() => {
    getNotify({});
    // const interval = setInterval(() => {
    //   getNotify({});
    // }, 15000);
    // return () => clearInterval(interval);
  }, []);

  const markAsRead = (notification: any) => {
    if (notification?.id && !readNotifications.includes(notification.id)) {
      markNotificationAsRead({ id: notification.id });
    }
  };

  const { mutate: onLogout } = useGlobalMutation(url_api.logout, {
    onSuccess: (res: any) => {
      navigate('/apps/login');
    }
  })

  const goContract = (item: any) => {
    open('/apps/contract/' + item.contract_id + '/' + item.contract_uuid, '_blank');
  }

  const goToBusiness = () => {
    navigate('/apps/business-unit/preview/' + user.id_business_unit)
  }

  const goNotifications = (item: any) => {
    open('/notifications');
  }

  const calculateTimeAgo = (activity_at: string): string => {
    const now = new Date();
    now.setHours(now.getHours() + 7); // 调整为 GMT+7
    const formattedISO = now.toISOString();
    const date1 = new Date(formattedISO);
    const date2 = new Date(activity_at);
    const diffInMilliseconds = date1.getTime() - date2.getTime();
    if (diffInMilliseconds > 0) {
      const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} ${t('minutes_ago')}`;
      } else if (diffInHours < 24) {
        return `${diffInHours} ${t('hours_ago')}`;
      } else if (diffInDays < 7) {
        return `${diffInDays} ${t('days_ago')}`;
      } else if (diffInWeeks < 4) {
        return `${diffInWeeks} ${t('weeks_ago')}`;
      } else {
        return `${diffInMonths} ${t('months_ago')}`;
      }
    } else {
      return `1 ${t('minutes_ago')}`;
    }
  };

  let logoContent = (<img className="w-22 h-14 ltr:-ml-1 rtl:-mr-1 inline" src={`${themeInit.logo.CustomerLogo}`} alt="logo" />)

  if (userRole === 'admin') {
    logoContent = (<img className="w-22 h-14 ltr:-ml-1 rtl:-mr-1 inline" src={`${themeInit.logo.AdminLogo}`} alt="logo" />)
  }

  if (userRole === 'shop') {
    logoContent = (<img className={"w-22 h-14 ltr:-ml-1 rtl:-mr-1 inline"} src={`${themeInit.logo.ShopLogo}`} alt="logo" />)
  }

  if (userRole === 'business_unit') {
    logoContent = (<img className="w-22 h-14 ltr:-ml-1 rtl:-mr-1 inline" src={`${themeInit.logo.BussinessLogo}`} alt="logo" />)
  }


  return (
    <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
      <div className="shadow-sm">
        <div className="relative bg-white flex w-full items-center px-5 py-2.5 dark:bg-black">
          <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
            <Link to="/" className="main-logo flex items-center shrink-0">
              {logoContent}
            </Link>
            <button type="button" className="collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex lg:hidden ltr:ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60" onClick={() => dispatch(toggleSidebar())}>
              <IconMenu className="w-5 h-5" />
            </button>
          </div>
          <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">

            <div className="sm:ltr:mr-auto sm:rtl:ml-auto">
              {
                userRole === 'business_unit' && (<a className="link" style={{ color: '#561de2', fontWeight: 'bold' }} onClick={() => goToBusiness()}>
                  {user?.buName ?? ''}
                </a>)
              }
            </div>

            <div className="flex items-center ltr:mr-4 rtl:ml-4">
                <div className="relative group">
                    <input
                        type="text"
                        className="form-input ltr:pr-8 rtl:pl-8 peer"
                        placeholder={t('search_contract')}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyUp={(e) => {
                          if (e.key === 'Enter') {
                            seachContract();
                          }
                        }}
                    />
                    <div className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary cursor-pointer" onClick={()=>{ seachContract()}}>
                        <IconSearch />
                    </div>
                </div>
            </div>


            {closeMessage !== null && userRole !== 'shop' &&
              <div className="flex items-center p-3.5 rounded text-danger bg-danger-light dark:bg-danger-dark-light">
                <span className="ltr:pr-2 rtl:pl-2">
                  <strong className="ltr:mr-1 rtl:ml-1">{t('alert')}!</strong> {closeMessage}
                </span>
              </div>
            }
            <div className="dropdown shrink-0">
              <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                btnClassName="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                button={
                  <span>
                    <IconBellBing />
                    {newNotificationsCount > 0 && (
                      <span className="flex absolute w-3 h-3 ltr:right-0 rtl:left-0 top-0">
                        <span className="animate-ping absolute ltr:-left-[3px] rtl:-right-[3px] -top-[3px] inline-flex h-full w-full rounded-full bg-success/50 opacity-75"></span>
                        <span className="relative inline-flex rounded-full w-[6px] h-[6px] bg-success"></span>
                      </span>
                    )}
                  </span>
                }
              >
                <ul className="!py-0 text-dark dark:text-white-dark w-[300px] sm:w-[350px] divide-y dark:divide-white/10 overflow-y-auto max-h-[300px]">
                  <li onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center px-4 py-2 justify-between ">
                      <h4 className="text-lg">
                        {t('notifications')}
                      </h4>
                      <span className="badge bg-primary/80">
                        {newNotificationsCount} {t('new_messages')}
                      </span>
                    </div>
                  </li>
                  {notifications.length > 0 ? (
                    notifications.map((notification: any) => {
                      if (!notification?.id) return null;
                      const isRead = notification.read;
                      const titleParts = notification.title.split(" ");
                      return (
                        <li
                          key={notification.id}
                          className={`dark:text-white-light/90 ${isRead ? '' : 'bg-gray-200 dark:bg-gray-800'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isRead) {
                              markAsRead(notification);
                            }
                            goContract(notification);
                          }}
                        >
                          <div className="group flex items-center px-4 py-2">
                            <div className="grid place-content-center rounded-full border-2 border-gray-300 w-[10vw] h-[10vw] max-w-12 max-h-12 relative">
                              <img className="w-[50%] h-[50%] object-cover mx-auto absolute inset-0 m-auto" alt="profile" src="/assets/images/iconDoc.png" />
                              {!isRead && (
                                <span className="bg-success w-[15%] h-[15%] rounded-full block absolute right-[6px] bottom-0"></span>
                              )}
                            </div>
                            <div className="ltr:pl-3 rtl:pr-3 flex flex-auto">
                              <div className="ltr:pr-3 rtl:pl-3">
                                <h6>
                                  {titleParts[0] + ' ' + titleParts[1] + ' '}
                                  <span className="text-orange-500">{titleParts[2]}</span>
                                </h6>
                                <span className="text-xs blue font-normal active">
                                  {calculateTimeAgo(notification.activity_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="!grid place-content-center hover:!bg-transparent text-lg min-h-[200px]">
                        <div className="mx-auto ring-4 ring-primary/30 rounded-full mb-4 text-primary">
                          <IconInfoCircle fill={true} className="w-10 h-10" />
                        </div>
                        {t('no_data_found')}
                      </button>
                    </li>
                  )}
                  <li>
                    <div className="p-4">
                      <button onClick={goNotifications} className="btn btn-primary btn-small block w-full">
                        {t('view_all')}
                      </button>
                    </div>
                  </li>
                </ul>
              </Dropdown>
            </div>
            <div className="dropdown shrink-0">
              <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                btnClassName="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                button={
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                }
              >
                <ul className="!py-0 text-dark dark:text-white-dark w-[160px] divide-y dark:divide-white/10">
                  {themeConfig.languageList.map((item: any) => {
                    return (
                      <li key={item.code}>
                        <button
                          type="button"
                          className={`w-full hover:text-primary ${themeConfig.locale === item.code ? 'bg-primary/10 text-primary' : ''}`}
                          onClick={() => {
                            dispatch(toggleLocale(item.code));
                          }}
                        >
                          <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Dropdown>
            </div>
            <div className="dropdown shrink-0 flex">
              <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                btnClassName="relative group block"
                button={<img className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/profile-1.jpeg" alt="userProfile" />}
              >
                <ul className="text-dark dark:text-white-dark !py-0 dark:text-white-light/90 !min-w-[230px] w-full">
                  <li>
                    <div className="flex items-center px-4 py-4">
                      <img className="rounded-md w-10 h-10 object-cover" src="/assets/images/profile-1.jpeg" alt="userProfile" />
                      <div className="ltr:pl-4 rtl:pr-4 truncate">
                        <h4 className="text-base">
                          {user?.name}
                          <span className="text-xs bg-success-light rounded text-success px-1 ltr:ml-2 rtl:ml-2">
                            {user?.role}
                          </span>
                        </h4>
                        <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white" /* onClick={() => { navigate('/apps/setting-payment-system') }} */>
                          {user?.email}
                        </button>
                      </div>
                    </div>
                  </li>
                  <li className="border-t border-white-light dark:border-white-light/10">
                    <a className="text-danger !py-3 pointer" onClick={() => onLogout({})}>
                      <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                      {t('logout')}
                    </a>
                  </li>
                </ul>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
