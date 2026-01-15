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

const mode = process.env.MODE || 'admin'

const Login: React.FC = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(setPageTitle('เข้าสู่ระบบ'))
  }, [dispatch])

  const [formData, setFormData] = useState({
    email: localStorage.getItem('email') ?? '',
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


  const { mutate: handleLogIn, isLoading } = useGlobalMutation(url_api.login, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        const userData: any = {
          uuid: res.data.uuid,
          name: res.data.name,
          email: res.data.email,
          access_token: res.data.access_token,
          access_level: res.data?.access_level ?? '',
          role: res.data.role,
          acc: res.data.is_create_customer
        }
        dispatch(setUser(userData))
        localStorage.setItem(mode, JSON.stringify(userData))
        if (formData.rememberMe) {
          localStorage.setItem('email', formData.email)
          localStorage.setItem('password', formData.password)
          localStorage.setItem('rememberMe', formData.rememberMe.toString())
        } else {
          localStorage.removeItem('email')
          localStorage.removeItem('password')
          localStorage.removeItem('rememberMe')
        }
        navigate('/')
      } else {
        const toast = Swal.mixin(toastAlert)
        toast.fire({
          icon: 'error',
          title: res?.message ?? 'ข้อมูลไม่ถูกต้องโปรดลองอีกครั้ง !',
          padding: '10px 20px',
        })
      }
    },
    onError: (err: any) => {
      const toast = Swal.mixin(toastAlert)
      toast.fire({
        icon: 'error',
        title: err?.message ?? 'ข้อมูลไม่ถูกต้องโปรดลองอีกครั้ง',
        padding: '10px 20px',
      })
    },
  })
  
  const submitForm = useCallback(
    (event: any) => {
      event.preventDefault()
      if (!formData.email || !formData.password) {
        Swal.fire({
          icon: 'info',
          title: 'กรุณากรอกอีเมลและรหัสผ่าน!',
          padding: '10px 20px',
        })
        return
      }
      handleLogIn({ data: { email: formData.email, password: formData.password, fcm_token: localStorage.getItem('FCM_TOKEN') ?? '' } })
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
          <div className={`relative hidden w-full items-center justify-center  lg:inline-flex lg:max-w-[835px] border-[80px] border-solid border-themePrimary`}>
            <div className="">
              <div className="w-48 block lg:w-72 ms-10">
                <img src={`${themeInit.logo.AdminLogo}`} alt="Logo" className="w-full" />
              </div>
              {/* <p className="text-right text-white text-3xl">แอดมิน</p> */}
              {/* <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                <img src="/assets/images/auth/login.svg" alt="Cover Image" className="w-full" />
              </div> */}
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
            <div className="w-full max-w-[440px] lg:mt-16">
              <div className="mb-10">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-[#002a41] md:text-4xl">
                  ล็อกอิน
                </h1>
                <p className="text-base font-normal leading-normal text-white-dark">
                  ใช้ <span className={`text-themePrimary`}>อีเมล</span>
                  และ <span className={`text-themePrimary`}>รหัสผ่าน</span>
                  เพื่อเข้าสู่ระบบ
                </p>
              </div>
              <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                <div>
                  <label htmlFor="Username">
                    อีเมล
                  </label>
                  <div className="relative text-white-dark">
                    <input
                      id="email"
                      name="email"
                      type="text"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="กรอกอีเมล"
                      className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                      <IconMail fill={true} />
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="Password">
                    รหัสผ่าน
                  </label>
                  <div className="relative text-white-dark">
                    <input
                      id="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="กรอกรหัสผ่าน"
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
                      จำรหัสผ่าน
                    </span>
                  </label>
                </div>
                <button type="submit" className={`btn bg-themePrimary text-lg font-light text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]`}>
                  เข้าสู่ระบบ
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

export default Login