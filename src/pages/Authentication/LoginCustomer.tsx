import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setUser } from '../../store/dataStore'
import { setPageTitle } from '../../store/themeConfigSlice'
import { UserState } from '../../types/index'
import { toastAlert } from '../../helpers/constant'
import { formatNumeric } from '../../helpers/formatNumeric'
import IconLockDots from '../../components/Icon/IconLockDots'
import IconPhoneCall from '../../components/Icon/IconPhoneCall'
import themeInit from '../../theme.init'
import { useGlobalMutation } from '../../helpers/globalApi'
import { url_api } from '../../services/endpoints'

const mode = process.env.MODE || 'customer'

const LoginCustomer: React.FC = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(setPageTitle('เข้าสู่ระบบ'))
    localStorage.clear()
  }, [dispatch])

  const [formData, setFormData] = useState({
    phone_number: localStorage.getItem('phone_number') ?? '',
    password: localStorage.getItem('password') ?? '',
    fcm_token: localStorage.getItem('FCM_TOKEN') ?? '',
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    if (name === 'password') {
      const numericValue = formatNumeric(value, 4)
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: numericValue,
      }))
    } else {
      const numericValue = formatNumeric(value, 10)
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: numericValue,
      }))
    }
  }
  const { mutate: handleLogIn, isLoading } = useGlobalMutation(url_api.loginCustomer, {
      onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        const userData: UserState = {
          uuid: res.data.uuid,
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          access_token: res.data.access_token,
          role: res.data.role,
        }
        dispatch(setUser(userData))
        localStorage.setItem(mode, JSON.stringify(userData))
        navigate('/apps/customer-payment/list')
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
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!formData.phone_number || !formData.password) {
        Swal.fire({
          icon: 'info',
          title: 'กรุณากรอกเบอร์โทรศัพท์และเลข 4 ตัวท้ายบัตรประชาชน!',
          padding: '10px 20px',
        })
        return
      }
      handleLogIn({ data: { phone_number: formData.phone_number, password: formData.password } })
    },
    [formData, handleLogIn]
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <div className="absolute inset-0">{/* <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" /> */}</div>
      <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 bg-[#002a41] dark:bg-[#060818] sm:px-16">
        <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
          <div className="relative hidden w-full items-center justify-center bg-[#fffff] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-6 border-r-1 border-solid border-[#696969]">
            <div className="">
              <div className="w-48 block lg:w-72 ms-10">
                <img src={`${themeInit.logo.CustomerLogo}`} alt="Logo" className="w-full" />
              </div>
              {/* <p className="text-right text-[#002a41] text-2xl">
                ลูกค้า
              </p> */}
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
            <div className="w-full max-w-[440px] lg:mt-16">
              <div className="mb-10">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-[#002a41] md:text-4xl">
                  ล็อกอิน
                </h1>
                <p className="text-base font-normal leading-normal text-white-dark">
                  ใช้ <span className={`text-themePrimary`}>เบอร์โทรศัพท์</span>
                  และ <span className={`text-themePrimary`}>รหัสผ่าน</span>
                  เพื่อเข้าสู่ระบบ
                </p>
              </div>
              <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                <div>
                  <label htmlFor="phone_number">
                    เบอร์โทรศัพท์
                  </label>
                  <div className="relative text-white-dark">
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="text"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="กรอกเบอร์โทรศัพท์"
                      className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                      <IconPhoneCall fill={true} />
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="password">
                    รหัสผ่าน
                  </label>
                  <div className="relative text-white-dark">
                    <input
                      id="password"
                      name="password"
                      type="text"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="กรอกเลข 4 ตัวท้ายบัตรประชาชน"
                      className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                      <IconLockDots fill={true} />
                    </span>
                  </div>
                </div>
                <button type="submit" className={`btn bg-themePrimary text-lg font-light text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]`}>
                  เข้าสู่ระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

export default LoginCustomer
