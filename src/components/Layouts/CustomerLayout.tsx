import { PropsWithChildren, Suspense, useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../store'

import App from '../../App'
import HeaderCustomer from './HeaderCustomer'
import Footer from './Footer'

import Portals from '../../components/Portals'

const DefaultLayout = ({ children }: PropsWithChildren) => {
  const themeConfig = useSelector((state: IRootState) => state.themeConfig)
  return (
    <App>
      {/* BEGIN MAIN CONTAINER */}
      <div className="relative">
        {/* sidebar menu overlay */}
        <div className={`${themeConfig.navbar} main-container text-black dark:text-white-dark min-h-screen`}>
          {/* BEGIN SIDEBAR */}
          {/* END SIDEBAR */}
          <div>
            {/* BEGIN TOP NAVBAR */}
            <HeaderCustomer />
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
            {/* END FOOTER */}
            <Portals />
          </div>
        </div>
      </div>
    </App>
  )
}

export default DefaultLayout