import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setUser } from '../../store/dataStore'
import { setPageTitle } from '../../store/themeConfigSlice'
import { toastAlert } from '../../helpers/constant'
import IconMail from '../../components/Icon/IconMail'
import IconLockDots from '../../components/Icon/IconLockDots'
import themeInit from '../../theme.init'
import { useGlobalMutation } from '../../helpers/globalApi'
import { url_api } from '../../services/endpoints'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'shop'

const LoginShop: React.FC = () => {

  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(setPageTitle(t('auth_login_title')))
  }, [dispatch])

  const [formData, setFormData] = useState({
    username: localStorage.getItem('username') ?? '',
    password: localStorage.getItem('password') ?? '',
    rememberMe: localStorage.getItem('rememberMe')?.toLowerCase() === 'true',
    fcm_token: localStorage.getItem('FCM_TOKEN') ?? '',
  })

  const handleChange = (event: any) => {
    const { name, value, type, checked } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const { mutate: handleLogIn, isLoading } = useGlobalMutation(url_api.loginShop, {
      onSuccess: (res: any) => {
        if (res.statusCode === 200 || res.code === 200) {
          const userData: any = {
            uuid: res.data.uuid,
            name: res.data.name,
            username: res.data.username,
            access_token: res.data.access_token,
            access_level: res.data?.access_level ?? '',
            role: res.data.role,
            id_shop:res.data.id_shop,
            acc: res.data.is_create_customer
          }
          dispatch(setUser(userData))
          localStorage.setItem(mode, JSON.stringify(userData))
          if (formData.rememberMe) {
            localStorage.setItem('username', formData.username)
            localStorage.setItem('password', formData.password)
            localStorage.setItem('rememberMe', formData.rememberMe.toString())
          } else {
            localStorage.removeItem('username')
            localStorage.removeItem('password')
            localStorage.removeItem('rememberMe')
          }
          navigate('/')
        } else {
          const toast = Swal.mixin(toastAlert)
          toast.fire({
            icon: 'error',
              title: res?.message ?? t('auth_invalid_data'),
              padding: '10px 20px',
            })
          }
        },
        onError: (err: any) => {
          const toast = Swal.mixin(toastAlert)
          toast.fire({
            icon: 'error',
            title: err?.message ?? t('auth_invalid_data'),

  const submitForm = useCallback(
    (event: any) => {
      event.preventDefault()
      if (!formData.username || !formData.password) {
        Swal.fire({
          icon: 'info',
          title: t('auth_please_enter_username_password'),
          padding: '10px 20px',
        })
        return
      }
      handleLogIn({ data: { username: formData.username, password: formData.password ,fcm_token:localStorage.getItem('FCM_TOKEN') ?? ''} })
    },
    [formData, handleLogIn]
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <div className="absolute inset-0">{/* <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" /> */}</div>
      {/* bg-[url(/assets/images/auth/map.png)] */}
      <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 bg-[#f0f0f0] dark:bg-[#060818] sm:px-16">
        {/* <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
        <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
        <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
        <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" /> */}
        <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
          <div className="relative hidden w-full items-center justify-center lg:inline-flex lg:max-w-[835px] border-r-1 border-[80px] border-solid border-[#002a41]">
            <div className="">
              <div className="w-48 block lg:w-72 ms-10">
                <img src={`${themeInit.logo.ShopLogo}`} alt="Logo" className="w-full" />
              </div>
              {/* <p className="text-right text-white text-3xl">ร้านค้า</p> */}
              {/* <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                <img src="/assets/images/auth/login.svg" alt="Cover Image" className="w-full" />
              </div> */}
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
            <div className="w-full max-w-[440px] lg:mt-16">
              <div className="mb-10">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-[#002a41] md:text-4xl">
                  {t('auth_login_title')}
                </h1>
                <p className="text-base font-normal leading-normal text-white-dark">
                  {t('auth_use')} <span className={`text-themePrimary`}>{t('auth_username')}</span>
                  {t('auth_and')} <span className={`text-themePrimary`}>{t('auth_password')}</span>
                  {t('auth_to_login')}
                </p>
              </div>
              <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                <div>
                  <label htmlFor="Username">
                    {t('auth_username')}
                  </label>
                  <div className="relative text-white-dark">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Username"
                      className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                      <IconMail fill={true} />
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="Password">
                    {t('auth_password')}
                  </label>
                  <div className="relative text-white-dark">
                    <input
                      id="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t('auth_enter_password')}
                      className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                      <IconLockDots fill={true} />
                    </span>
                  </div>
                </div>
                <div>
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className={`form-checkbox checked:bg-themePrimary focus:checked:bg-themePrimary checked:hover:bg-themePrimary bg-white dark:bg-black`}
                    />
                    <span className="text-white-dark">
                      {t('auth_remember_password')}
                    </span>
                  </label>
                </div>
                <button type="submit" className={`btn bg-themePrimary text-lg font-light text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]`}>
                  {t('auth_login_title')}
                </button>
              </form>
              {/* <div className="mt-7 text-center dark:text-white">
                ยังไม่มีบัญชีร้านค้าใช่ไหม?&nbsp
                <Link to="/apps/register" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                  สมัครบัญชีร้านค้า
                </Link>
              </div> */}
              {/* <div className="mt-7 text-center dark:text-white">
                <Link to="/apps/customer-login" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                  สำหรับลูกค้า?
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

export default LoginShop
