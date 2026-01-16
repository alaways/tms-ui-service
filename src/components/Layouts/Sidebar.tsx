import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import PerfectScrollbar from 'react-perfect-scrollbar'
import AnimateHeight from 'react-animate-height'

import { useTranslation } from 'react-i18next'

import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../store'
import { toggleSidebar, setSidebarActive } from '../../store/themeConfigSlice'

import IconUser from '../Icon/IconUser'
import IconMinus from '../Icon/IconMinus'
import IconArchive from '../Icon/IconArchive'
import IconCaretDown from '../Icon/IconCaretDown'
import IconCaretsDown from '../Icon/IconCaretsDown'
import IconMenuShop from '../Icon/Menu/IconMenuShop'
import IconDollarSignCircle from '../Icon/IconDollarSignCircle'

import IconNotes from '../../components/Icon/IconNotes'
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard'
import IconNotesEdit from '../../components/Icon/IconNotesEdit'
import IconUsersGroup from '../../components/Icon/IconUsersGroup'
import IconTrendingUp from '../../components/Icon/IconTrendingUp'
import SidebarTemplate from './SidebarTemplate'
import themeInit from '../../theme.init'

const mode = process.env.MODE || 'admin'

const Sidebar = () => {

  const location = useLocation()

  const [currentMenu, setCurrentMenu] = useState<string>('')
  const [currentSubMenu, setCurrentSubMenu] = useState<string>('/')

  const [errorSubMenu, setErrorSubMenu] = useState(false)

  const themeConfig = useSelector((state: IRootState) => state.themeConfig)
  const semidark = useSelector((state: IRootState) => state.themeConfig.semidark)

  const active = useSelector((state: IRootState) => state.themeConfig.sidebarActive)

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser ?? '{}').role : null
  const access_level = storedUser ? JSON.parse(storedUser ?? '{}').access_level : null

  const dispatch = useDispatch()
  const { t } = useTranslation()

  const toggleMenu = (value: string) => {
    dispatch(setSidebarActive([
      currentMenu === value ? '' : value,
      location.pathname
    ]))
    setCurrentMenu(value)
    setCurrentSubMenu(location.pathname)
  }

  useEffect(() => {
    const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]')
    if (selector) {
      selector.classList.add('active')
      const ul: any = selector.closest('ul.sub-menu')
      if (ul) {
        let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || []
        if (ele.length) {
          ele = ele[0]
          setTimeout(() => {
            ele.click()
          })
        }
      }
    }
  }, [])

  useEffect(() => {
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar())
    }
    const selectorActive: NodeList = document.querySelectorAll('a[class="active"]')
    if (selectorActive !== undefined && selectorActive.length > 0) {
      Array.from(selectorActive).map((item: any, index: number) => {
        if (window.location.pathname.split('/').length !== 5 && item.pathname !== window.location.pathname) {
          item.classList.remove('active')
        }
      })
    }
    // if (typeof active === 'string') {
    //   const menu = active.split(',')
    //   setCurrentMenu(menu.length === 2 ? menu[0] : '')
    //   setCurrentSubMenu(menu.length === 2 ? menu[1] : '/')
    // } else if (typeof active === 'object') {
    //   setCurrentMenu(active[0])
    //   setCurrentSubMenu(active[1])
    // }
  }, [location])

  useEffect(() => {
    if (typeof active === 'string') {
      const menu = active.split(',')
      setCurrentMenu(menu.length === 2 ? menu[0] : '')
      setCurrentSubMenu(menu.length === 2 ? menu[1] : '/')
    } else if (typeof active === 'object') {
      setCurrentMenu(active[0])
      setCurrentSubMenu(active[1])
    }
  },[active])

  return (
    <div className={semidark ? 'dark' : ''}>
      <nav className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}>
        <div className="bg-white dark:bg-black h-full">
          <div className="flex justify-between items-center px-4 py-3">
            <NavLink to="/" className="main-logo flex items-center shrink-0">
              <img className="w-26 h-16 ml-[35px] flex-none" src={`${themeInit.logo.AdminLogo}`} alt="logo" />
            </NavLink>
            <button type="button" className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180" onClick={() => {
              dispatch(toggleSidebar())
            }}>
              <IconCaretsDown className="m-auto rotate-90" />
            </button>
          </div>
          <PerfectScrollbar className="h-[calc(100vh-80px)] relative">
            <ul className="relative space-y-0.5 p-4 py-0">
              <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                <IconMinus className="w-4 h-5 flex-none hidden" />
                <span>{t('leasing_apps')}</span>
              </h2>

              <li className="nav-item">
                <NavLink to="/" className="group" onClick={() => {
                  dispatch(setSidebarActive(['', '/']))
                  setCurrentMenu('')
                  setCurrentSubMenu('/')
                }}>
                  <div className="flex items-center">
                    <IconMenuDashboard className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                      {t('Dashboard')}
                    </span>
                  </div>
                </NavLink>
              </li>

              {(access_level == 'A' || access_level == 'B') && (
                  <>
                    <li className='nav-item'>
                      <NavLink to="/dashboard-v2" className="group" onClick={() => {
                        toggleMenu('dashboard-v2')
                      }}>
                        <div className="flex items-center">
                          <IconTrendingUp className="group-hover:!text-primary shrink-0" />
                          <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                            {t('Dashboard V2')}
                          </span>
                        </div>
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink to="/dashboard-ceo-pv" className="group" onClick={() => {
                        toggleMenu('dashboard-ceo-pv')
                      }}>
                        <div className="flex items-center">
                          <IconTrendingUp className="group-hover:!text-primary shrink-0" />
                          <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                            {t('Dashboard CEO PV')}
                          </span>
                        </div>
                      </NavLink>
                    </li>

                    <li className="nav-item">
                      <NavLink to="/dashboard-ceo-income" className="group" onClick={() => {
                        toggleMenu('dashboard-ceo-income')
                      }}>
                        <div className="flex items-center">
                          <IconTrendingUp className="group-hover:!text-primary shrink-0" />
                          <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                            {t('report')}
                          </span>
                        </div>
                      </NavLink>
                    </li>

                  </>
              )}

              <li className="nav-item">
                <ul>
                  <li className="menu nav-item">
                    <button type="button" className={`${currentMenu === 'bu' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('bu')}>
                      <div className="flex items-center">
                        <IconNotes className="group-hover:!text-primary shrink-0" />
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                          {t('business_unit')}
                        </span>
                      </div>
                      <div className={currentMenu !== 'bu' ? 'rtl:rotate-90 -rotate-90' : ''}>
                        <IconCaretDown />
                      </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === 'bu' ? 'auto' : 0}>
                      <ul className="sub-menu text-gray-500">
                        <li>
                          <NavLink to="/apps/business-unit/list" className={currentSubMenu === '/apps/business-unit/list' ? 'active' : ''}>
                            {t('business_unit_list')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/apps/shop-group/list" className={currentSubMenu === '/apps/shop-group/list' ? 'active' : ''}>
                            {t('shop_group')}
                          </NavLink>
                        </li>
                        {/* <li>
                          <NavLink to="/apps/interest-rate/list" className={currentSubMenu === '/apps/interest-rate/list' ? 'active' : ''}>
                            {t('reward_report')}
                          </NavLink>
                        </li> */}
                      </ul>
                    </AnimateHeight>
                  </li>
                  <li className="menu nav-item">
                    <button type="button" className={`${currentMenu === 'customer' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('customer')}>
                      <div className="flex items-center">
                        <IconUsersGroup fill={true} className="group-hover:!text-primary shrink-0" />
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#3c475b] dark:group-hover:text-white-dark">
                          {t('customer')}
                        </span>
                      </div>
                      <div className={currentMenu !== 'customer' ? 'rtl:rotate-90 -rotate-90' : ''}>
                        <IconCaretDown />
                      </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === 'customer' ? 'auto' : 0}>
                      <ul className="sub-menu text-gray-500">
                        <li>
                          <NavLink to="/apps/customer/list" className={currentSubMenu === '/apps/customer/list' ? 'active' : ''}>
                            {t('customer_list')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/apps/customer/add" className={currentSubMenu === '/apps/customer/add' ? 'active' : ''}>
                            {t('add_customer')}
                          </NavLink>
                        </li>
                      </ul>
                    </AnimateHeight>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <ul>
                  <li className="menu nav-item">
                    <button type="button" className={`${currentMenu === 'asset' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('asset')}>
                      <div className="flex items-center">
                        <IconArchive fill={true} className="group-hover:!text-primary shrink-0" />
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                          {t('asset')}
                        </span>
                      </div>
                      <div className={currentMenu !== 'asset' ? 'rtl:rotate-90 -rotate-90' : ''}>
                        <IconCaretDown />
                      </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === 'asset' ? 'auto' : 0}>
                      <ul className="sub-menu text-gray-500">
                        <li>
                          <NavLink to="/apps/asset/list" className={currentSubMenu === '/apps/asset/list' ? 'active' : ''}>
                            {t('asset_list')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/apps/asset/add" className={currentSubMenu === '/apps/asset/add' ? 'active' : ''}>
                            {t('add_asset')}
                          </NavLink>
                        </li>
                      </ul>
                    </AnimateHeight>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <ul>
                  <li className="menu nav-item">
                    <button type="button" className={`${currentMenu === 'contract' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('contract')}>
                      <div className="flex items-center">
                        <IconNotesEdit fill={true} className="group-hover:!text-primary shrink-0" />
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                          {t('contract')}
                        </span>
                      </div>
                      <div className={currentMenu !== 'contract' ? 'rtl:rotate-90 -rotate-90' : ''}>
                        <IconCaretDown />
                      </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === 'contract' ? 'auto' : 0}>
                      <ul className="sub-menu text-gray-500">
                        <li>
                          <NavLink to="/apps/contract/list" className={currentSubMenu === '/apps/contract/list' ? 'active' : ''}>
                            {t('contract_list')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/apps/contract/list-credit" className={currentSubMenu === '/apps/contract/list-credit' ? 'active' : ''}>
                            {t('approved_contracts')}
                          </NavLink>
                        </li>
                        {themeInit?.features?.contract_refinance && <li>
                          <NavLink to="/apps/contract/list-refinance" className={currentSubMenu === '/apps/contract/list-refinance' ? 'active' : ''}>
                            {t('refinance_contract_list')}
                          </NavLink>
                        </li>}
                        <li>
                          <NavLink to="/apps/contract/list-wait" className={currentSubMenu === '/apps/contract/list-wait' ? 'active' : ''}>
                            {t('pending_completion_contract_list')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/apps/contract/list-complete" className={currentSubMenu === '/apps/contract/list-complete' ? 'active' : ''}>
                            {t('completed_contract_list')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/apps/contract/list-cancel" className={currentSubMenu === '/apps/contract/list-cancel' ? 'active' : ''}>
                            {t('cancelled_contracts')}
                          </NavLink>
                        </li>
                      </ul>
                    </AnimateHeight>
                  </li>
                </ul>
              </li>
              <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                <IconMinus className="w-4 h-5 flex-none hidden" />
                <span>{t('leasing_management')}</span>
              </h2>
              <li className="nav-item">
                <ul>
                  <li className="menu nav-item">
                    <button type="button" className={`${currentMenu === 'shop' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('shop')}>
                      <div className="flex items-center">
                        <IconMenuShop className="group-hover:!text-primary shrink-0" />
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                          {t('shop')}
                        </span>
                      </div>
                      <div className={currentMenu !== 'shop' ? 'rtl:rotate-90 -rotate-90' : ''}>
                        <IconCaretDown />
                      </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === 'shop' ? 'auto' : 0}>
                      <ul className="sub-menu text-gray-500">
                        <li>
                          <NavLink to="/apps/shop/list" className={currentSubMenu === '/apps/shop/list' ? 'active' : ''}>
                            {t('shop_list')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/apps/shop/add" className={currentSubMenu === '/apps/shop/add' ? 'active' : ''}>
                            {t('add_shop')}
                          </NavLink>
                        </li>
                      </ul>
                    </AnimateHeight>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <ul>
                  <li className="menu nav-item">
                    <button type="button" className={`${currentMenu === 'employee' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('employee')}>
                      <div className="flex items-center">
                        <IconUser fill={true} className="group-hover:!text-primary shrink-0" />
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                          {t('employee')}
                        </span>
                      </div>
                      <div className={currentMenu !== 'employee' ? 'rtl:rotate-90 -rotate-90' : ''}>
                        <IconCaretDown />
                      </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === 'employee' ? 'auto' : 0}>
                      <ul className="sub-menu text-gray-500">
                        {themeInit.features?.permissions && (
                          <li>
                            <NavLink to="/apps/permission/user" className={currentSubMenu === '/apps/permission/user' ? 'active' : ''}>
                              {t('permission_management')}
                            </NavLink>
                          </li>
                        )}
                        <li>
                          <NavLink to="/apps/employee/list" className={currentSubMenu === '/apps/employee/list' ? 'active' : ''}>
                            {t('employee_list')}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/apps/employee/add" className={currentSubMenu === '/apps/employee/add' ? 'active' : ''}>
                            {t('add_employee')}
                          </NavLink>
                        </li>
                      </ul>
                    </AnimateHeight>
                  </li>
                </ul>
              </li>
              <li className="menu nav-item">
                <button type="button" className={`${currentMenu === 'finance' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('finance')}>
                  <div className="flex items-center">
                    <IconDollarSignCircle fill={true} className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#3c475b] dark:group-hover:text-white-dark">
                      {t('finance')}
                    </span>
                  </div>
                  <div className={currentMenu !== 'finance' ? 'rtl:rotate-90 -rotate-90' : ''}>
                    <IconCaretDown />
                  </div>
                </button>

                <AnimateHeight duration={300} height={currentMenu === 'finance' ? 'auto' : 0}>
                  <ul className="sub-menu text-gray-500">
                    <li>
                      <NavLink to="/apps/finance/invoice" className={currentSubMenu === '/apps/finance/invoice' ? 'active' : ''}>
                        {t('invoice')}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/apps/finance/payment-history" className={currentSubMenu === '/apps/finance/payment-history' ? 'active' : ''}>
                        {t('payment_history')}
                      </NavLink>
                    </li>
                    {themeInit.features?.payment_transfer && <li>
                      <NavLink to="/apps/finance/transfer-history" className={currentSubMenu === '/apps/finance/transfer-history' ? 'active' : ''}>
                        {t('transfer_history')}
                      </NavLink>
                    </li>}
                  </ul>
                </AnimateHeight>
              </li>
              <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                <IconMinus className="w-4 h-5 flex-none hidden" />
                <span>{t('leasing_report')}</span>
              </h2>
              {/* 预留：支付给商店
              <li className="nav-item">
                <NavLink to="/apps/report/pay-to-shop" className={currentMenu === 'pay-to-shop' ? 'group active' : 'group'} onClick={() => toggleMenu('pay-to-shop')}>
                  <div className="flex items-center">
                    <IconDollarSignCircle className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                      {t('pay_to_shop_pv')}
                    </span>
                  </div>
                </NavLink>
              </li>
              */}
              {/* TODO: 测试 PV */}
              {(role == 'admin' || role == 'business_unit') && <>
                <li className="nav-item">
                  <NavLink to="/apps/report/pay-to-shop-pv" className={currentMenu === 'pay-to-shop-pv' ? 'group active' : 'group'} onClick={() => toggleMenu('pay-to-shop-pv')}>
                    <div className="flex items-center">
                      <IconDollarSignCircle className="group-hover:!text-primary shrink-0" />
                      <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                        {t('pay_to_shop_pv')}
                      </span>
                    </div>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/apps/report/account-creditor" className={currentMenu === 'account-creditor' ? 'group active' : 'group'} onClick={() => toggleMenu('account-creditor')}>
                    <div className="flex items-center">
                      <IconDollarSignCircle className="group-hover:!text-primary shrink-0" />
                      <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                        {t('shop_transactions')}
                      </span>
                    </div>
                  </NavLink>
                </li>
              </>}
              <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                <IconMinus className="w-4 h-5 flex-none hidden" />
                <span>{t('leasing_setting')}</span>
              </h2>
              <li className="nav-item">
                <NavLink to="/apps/announce/list" className={currentMenu === 'announce' ? 'group active' : 'group'} onClick={() => toggleMenu('announce')}>
                  <div className="flex items-center">
                    <IconNotes className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                      {t('announce')}
                    </span>
                  </div>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/apps/asset-type/list" className={currentMenu === 'asset-type' ? 'group active' : 'group'} onClick={() => toggleMenu('asset-type')}>
                  <div className="flex items-center">
                    <IconNotes className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                      {t('asset_type')}
                    </span>
                  </div>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/apps/asset-capacity" className={currentMenu === 'asset-capacity' ? 'group active' : 'group'} onClick={() => toggleMenu('asset-capacity')}>
                  <div className="flex items-center">
                    <IconNotes className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                      {t('asset_capacity_type')}
                    </span>
                  </div>
                </NavLink>
              </li>
              {themeInit.features?.permissions && <li className="nav-item">
                <NavLink to="/apps/insurance-type/list" className={currentMenu === 'insurance-type' ? 'group active' : 'group'} onClick={() => toggleMenu('insurance-type')}>
                  <div className="flex items-center">
                    <IconNotes className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                      {t('insurance_type')}
                    </span>
                  </div>
                </NavLink>
              </li>}
              {/* <li className="nav-item">
                <NavLink to="/apps/shop-group/list" className={currentMenu === 'shop-group' ? 'group active' : 'group'} onClick={() => toggleMenu('shop-group')}>
                  <div className="flex items-center">
                    <IconNotes className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                      {t('shop_group')}
                    </span>
                  </div>
                </NavLink>
              </li> */}
              {/* <li className="nav-item">
                <NavLink to="/apps/interest-rate/list" className="group">
                  <div className="flex items-center">
                    <IconNotes className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                      {t('reward_report')}
                    </span>
                  </div>
                </NavLink>
              </li> */}
              {/* {SidebarTemplate({ currentMenu, t, toggleMenu, errorSubMenu, setErrorSubMenu })} */}
            </ul>
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  )

}

export default Sidebar
