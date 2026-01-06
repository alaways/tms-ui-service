import { PropsWithChildren, Suspense, useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../store'
import { setCreditLevel, setProvinces } from '../../store/dataStore'
import { toggleSidebar } from '../../store/themeConfigSlice'

import { url_api } from '../../services/endpoints'
import { useGlobalMutation } from '../../helpers/globalApi'

import App from '../../App'
import Portals from '../../components/Portals'

import Header from './Header'
import Sidebar from './Sidebar'
import SidebarShop from './SidebarShop'
import SidebarBusiness from './SidebarBusiness'

import Footer from './Footer'
import CookiePolicy from './CookiePolicy'

const mode = process.env.MODE || 'admin'

const DefaultLayout = ({ children }: PropsWithChildren) => {

  const themeConfig = useSelector((state: IRootState) => state.themeConfig)

  const dispatch = useDispatch()

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser ?? '{}').role : null

  const [showLoader, setShowLoader] = useState(true)

  const [showTopButton, setShowTopButton] = useState(false)
  const [showBottomButton, setBottomTopButton] = useState(true)

  const goToTop = () => {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }

  const onScrollHandler = () => {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      setShowTopButton(true)
      setBottomTopButton(false)
    } else {
      setShowTopButton(false)
      setBottomTopButton(true)
    }
  }

  const { mutate: fetchProvincesData } = useGlobalMutation(url_api.provincesFindAll, {
    onSuccess: (res: any) => {
      if (res.message) {
        const provinces = res.data.map((item: any) => ({
          value: item.id,
          label: item.name_th,
        }))
        localStorage.setItem('provinces', JSON.stringify(provinces))
        dispatch(setProvinces(provinces))
      }
    },
  })

  const { mutate: fetchMasterCustomerCredit } = useGlobalMutation(url_api.masterCustomerCredit, {
    onSuccess: (res: any) => {
      if (res.message) {
        const data = res.data.map((item: any) => ({
          value: item?.value,
          label: item.label,
        }))
        localStorage.setItem('customer_credit_level', JSON.stringify(data))
        dispatch(setCreditLevel(data))
      }
    }
  })

  useEffect(() => {
    const localProvinces = localStorage.getItem('provinces')
    if (localProvinces) {
      const provinces = JSON.parse(localProvinces)
      dispatch(setProvinces(provinces))
    } else {
      fetchProvincesData({})
    }
    const localCL = localStorage.getItem('customer_credit_level')
    if (localCL) {
      const data = JSON.parse(localCL)
      dispatch(setCreditLevel(data))
    } else {
      fetchMasterCustomerCredit({})
    }
    window.addEventListener('scroll', onScrollHandler)
    const screenLoader = document.getElementsByClassName('screen_loader')
    if (screenLoader?.length) {
      screenLoader[0].classList.add('animate__fadeOut')
      setTimeout(() => {
        setShowLoader(false)
      }, 200)
    }
    return () => {
      window.removeEventListener('onscroll', onScrollHandler)
    }
  }, [])

  let SidebarComponent

  if (role === 'admin') {
    SidebarComponent = <Sidebar />
  } else if (role === 'business_unit') {
    SidebarComponent = <SidebarBusiness />
  } else if (role === 'shop') {
    SidebarComponent = <SidebarShop />
  }

  return (
    <App>
      {/* BEGIN MAIN CONTAINER */}
      <div className="relative">
        {/* sidebar menu overlay */}
        <div className={`${(!themeConfig.sidebar && 'hidden') || ''} fixed inset-0 bg-[black]/60 z-50 lg:hidden`} onClick={() => dispatch(toggleSidebar())}></div>
        {/* screen loader */}
        {showLoader && (
          <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
            <svg width="64" height="64" viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg" fill="#4361ee">
              <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
                <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="-360 67 67" dur="2.5s" repeatCount="indefinite" />
              </path>
              <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
                <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="360 67 67" dur="8s" repeatCount="indefinite" />
              </path>
            </svg>
          </div>
        )}
        {/* <div className="fixed bottom-10 ltr:right-6 rtl:left-6 z-50" style={{ bottom: showBottomButton ? '1.5rem' : '5.2rem', right: '1.5rem' }}>
          <a href="#buttom" className="btn btn-outline-primary rounded-full p-2 animate-pulse bg-[#fafafa] dark:bg-[#060818] dark:hover:bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: '2rem', height: '2rem', transform: 'rotate(180deg)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18"></path>
            </svg>
          </a>
        </div> */}
        <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50">
          {showTopButton && (
            <button type="button" className="btn btn-outline-primary rounded-full p-2 animate-pulse bg-[#fafafa] dark:bg-[#060818] dark:hover:bg-primary" onClick={goToTop}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ width: '2rem', height: '2rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
              </svg>
            </button>
          )}
        </div>
        {/* BEGIN APP SETTING LAUNCHER */}
        {/* <Setting /> */}
        {/* END APP SETTING LAUNCHER */}
        <div className={`${themeConfig.navbar} main-container text-black dark:text-white-dark min-h-screen`}>
          {/* BEGIN SIDEBAR */}
          {SidebarComponent}
          {/* END SIDEBAR */}
          <div className="main-content flex flex-col min-h-screen">
            {/* BEGIN TOP NAVBAR */}
            <Header />
            {/* END TOP NAVBAR */}
            {/* BEGIN CONTENT AREA */}
            <Suspense>
              <div className={`${themeConfig.animation} p-6 animate__animated`}>
                {children}
              </div>
            </Suspense>
            {/* END CONTENT AREA */}
            {/* BEGIN FOOTER */}
            <Footer />
            <CookiePolicy />
            {/* END FOOTER */}
            <Portals />
          </div>
        </div>
      </div>
      <div id="buttom"></div>
    </App>
  )

}

export default DefaultLayout