import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { IRootState } from '../../store'
import { toggleLocale } from '../../store/themeConfigSlice'
import Dropdown from '../Dropdown'
import IconLogout from '../Icon/IconLogout'
import { useGlobalMutation } from '../../helpers/globalApi'
import moment from 'moment'
import { url_api } from '../../services/endpoints'
import themeInit from '../../theme.init'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'customer'

const HeaderCustomer = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const storedUser = JSON.parse(localStorage.getItem(mode) ?? '{}')
  const [closeMessage, setCloseMessage] = useState(null)

  const { mutate: getConfigTMS } = useGlobalMutation(url_api.getConfigTMS, {
    onSuccess: (res: any) => {
      const startDate = moment.tz(res.data.date_start, 'YYYY-MM-DD HH:mm', 'Asia/Bangkok').subtract(1, 'day');
      const endDate = moment.tz(res.data.date_end, 'YYYY-MM-DD HH:mm', 'Asia/Bangkok');
      const now = moment.tz('Asia/Bangkok');
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
    getConfigTMS({})
  }, [])

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

  const { mutate: onLogout } = useGlobalMutation(url_api.logout, {
      onSuccess: (res: any) => {
        localStorage.clear()
        navigate('/apps/login');
      }
  })

  return (
    <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
      <div className="shadow-sm">
        <div className="relative bg-white flex w-full items-center px-5 py-2.5 dark:bg-black">
          <Link to="/apps/customer-payment/list" className="main-logo flex items-center shrink-0">
            <img className="w-22 h-14 ltr:-ml-1 rtl:-mr-1 inline" src={themeInit.logo.CustomerLogo}  alt="logo" />
          </Link>
          <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
            <div className="sm:ltr:mr-auto sm:rtl:ml-auto">
              {closeMessage !== null &&
                <div className="flex items-center p-3.5 rounded text-danger bg-danger-light dark:bg-danger-dark-light">
                  <span className="ltr:pr-2 rtl:pl-2">
                    <strong className="ltr:mr-1 rtl:ml-1">{t('alert')}!</strong> {closeMessage}
                  </span>
                </div>
              }
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
            <div className="dropdown shrink-0"></div>
            <div className="dropdown shrink-0 flex">
              <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                btnClassName="relative group block"
                button={<img className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/demo/profile-40.png" alt="userProfile" />}
              >
                <ul className="text-dark dark:text-white-dark !py-0 dark:text-white-light/90 !min-w-[230px] w-full">
                  <li>
                    <div className="flex items-center px-4 py-4">
                      <img className="rounded-md w-10 h-10 object-cover" src="/assets/images/demo/profile-40.png" alt="userProfile" />
                      <div className="ltr:pl-4 rtl:pr-4 truncate">
                        <h4 className="text-base">
                          {storedUser?.name}
                          <span className="text-xs bg-success-light rounded text-success px-1 ltr:ml-2 rtl:ml-2">
                            {storedUser?.role}
                          </span>
                        </h4>
                        <Link to="/apps/customer-payment/profile" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                          {storedUser?.email}
                        </Link>
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

export default HeaderCustomer