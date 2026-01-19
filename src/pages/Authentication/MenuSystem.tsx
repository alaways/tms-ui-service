import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../store/themeConfigSlice'
import themeConfig from '../../theme.config'

const mode = process.env.MODE || 'admin'

const MenuSystem: React.FC = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  const goDashboard = () => {
    navigate('/')
  }

  const goPawn = () => {
    location.href = process.env.PAWN_URL ?? ''
  }

  const logout = () => {
    localStorage.clear()
    navigate('/apps/login')
  }

  useEffect(() => {
    if (role === null) { logout() }
    dispatch(setPageTitle('เลือกระบบที่ต้องารใช้งาน'))
  }, [dispatch])

  return (
    <div>
      <div className="absolute inset-0"></div>
      <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 bg-[#f0f0f0] dark:bg-[#060818] sm:px-16">
        <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
          <div className="relative hidden w-full items-center justify-center lg:inline-flex lg:max-w-[835px] bg-[#002a42]">
            <div className="w-48 block lg:w-72">
              <img src="/assets/images/tms-admin-logo.png" alt="Logo" className="w-full" />
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
            <div className="w-full max-w-[440px] lg:mt-16">
              <div className="mb-10">
                <h1 className="text-2xl font-extrabold uppercase !leading-snug text-[#002a41] md:text-3xl">
                  กรุณาเลือก <span className={`text-themePrimary`}>ระบบ</span> ที่ต้องการใช้งาน
                </h1>
                <p className="text-base text-lg font-normal leading-normal text-white-dark">
                  Please select the system you want to use
                </p>
              </div>
              <div className="p-5 pt-1 pb-3 bg-[#ffffff]">
                <button type="button" className="btn pt-5 pb-5 bg-[#f15a01] text-lg font-extrabold text-white !mt-3 w-full border-0 uppercase" style={{ boxShadow: 'none' }} onClick={goDashboard}>
                  TMS System
                </button>
                <button type="button" className="btn pt-5 pb-5 bg-[#e4e4e4] text-lg font-extrabold !mt-2 w-full border-0 uppercase" style={{ boxShadow: 'none' }} onClick={goPawn}>
                  ระบบฝากขาย
                </button>
                <button type="button" className="btn pt-5 pb-5 bg-[#ffffff] text-lg font-light !mt-2 w-full border-0 uppercase" style={{ boxShadow: 'none' }} onClick={logout}>
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

export default MenuSystem