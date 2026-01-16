import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { Form, Formik } from 'formik'
import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'
import { thaiTitles, roleTypes, accessLevelTypes, toastAlert } from '../../../helpers/constant'
import { Employees } from '../../../types/index'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import themeInit from '../../../theme.init'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const Edit = () => {

  const { id } = useParams()

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  
  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  const userUUID = storedUser ? JSON.parse(storedUser).uuid : null
  const access_level = storedUser ? JSON.parse(storedUser ?? '{}').access_level : null
  const adminEmail = storedUser ? JSON.parse(storedUser).email : null
  let adminRoot = false
  if(adminEmail == "dev@tplus.co.th" || adminEmail == "admin258@tplus.co.th") {
    adminRoot = true;
  }

  const [enabledPin,setEnabledPIN] = useState(false)

  if (role !== 'admin' && role !== 'business_unit') {
    navigate('/')
  }

  const breadcrumbItems = [
    { to: '/apps/employee/list', label: t('employee') },
    { label: t('edit'), isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle(t('edit_employee')))
    dispatch(setSidebarActive(['employee', '/apps/employee/list']))
  }, [])
  const [businessUnit, setBusinessUnit] = useState<any>([])
  const dataStoredEmployee = useSelector((state: IRootState) => state.dataStore.employees)
  const [employeeFormData, setEmployeeFormData] = useState<Employees>({})

  const { mutate: fetchEmployeeData,isLoading: isEmployeeLoading } = useGlobalMutation(url_api.employeeFind, {
    onSuccess: (res: any) => {
      const setFormValue = res.data
      setFormValue.password = ''
      setFormValue.password_repeat = ''
      setFormValue.pin = ''
      setEmployeeFormData({ ...setFormValue, id_business_unit: setFormValue.account_type === 'admin' ? 'tms' : setFormValue.id_business_unit })
      
      if((setFormValue.role == "executive" && setFormValue.access_level == "A") || adminRoot || userUUID == id) {
          if(themeInit.features?.payment_transfer == true) { 
            setEnabledPIN(true)
          }
      }
    },
    onError: () => {
      console.error('Failed to fetch bu data')
    },
  })

  useEffect(() => {
    fetchEmployeeData({
      data: {},
      id:id || dataStoredEmployee.id
    })
  }, [])
  const { mutate: fetchContractGetStatus } = useGlobalMutation(url_api.contractFilter, {
    onSuccess: (res: any) => {
      setBusinessUnit(
        [{ value: 'tms', label: 'TMS' }, ...res.data.business_unit.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))]
      )
    },
    onError: () => {
      console.error('Failed to fetch bu data')
    },
  })

  useEffect(() => {
    if (role === 'admin') {
      fetchContractGetStatus({})
    }
  }, [])


  const { mutate: employeeUpdate, } = useGlobalMutation(url_api.employeeUpdate, {
    onSuccess: (res: any) => {
     if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('edit_success'),
          padding: '10px 20px',
        })
        navigate('/apps/employee/list')
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
    onError: () => {
      console.error('Failed to fetch bu data')
    },
  })


  const handleChangeSelect = (props: any, event: any, name: any) => {
    props.setFieldValue(name, event.value)
  }

 const submitForm = useCallback((event: any) => {
    const { id, ...cleanedEvent } = event; 
    if(cleanedEvent?.pin && cleanedEvent?.pin?.length != 6) {
      toast.fire({
          icon: 'error',
          title: t('pin_length_error'),
          padding: '10px 20px',
        })
        return false
    }
    employeeUpdate({ 
      data: cleanedEvent, 
      id: id || dataStoredEmployee.id 
    });
  }, [t]);

  const SubmittedForm = Yup.object().shape({
    title: Yup.string().required(t('please_fill_all_fields')),
    name: Yup.string().required(t('please_fill_all_fields')),
    phone_number: Yup.string().required(t('please_fill_all_fields')),
    email: Yup.string().email(t('please_enter_valid_email')).required(t('please_fill_all_fields')),
    role: Yup.string().required(t('please_fill_all_fields')),
    access_level: Yup.string().required(t('please_fill_all_fields')),
    password_repeat: Yup.string().oneOf([Yup.ref('password'), null], t('password_not_match')),
  })

  if (isEmployeeLoading) return <div>{t('loading')}</div>

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex xl:flex-row flex-col gap-2. pt-5">
        <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
          <Formik initialValues={employeeFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
            {(props) => (
              <Form className="space-y-5 dark:text-white custom-select">
                <div className="input-flex-row">
                  <SelectField
                    label={t('title_prefix')}
                    id="title"
                    name="title"
                    options={thaiTitles}
                    placeholder={t('please_select')}
                    onChange={(e: any) => handleChangeSelect(props, e, 'title')}
                    isSearchable={false}
                    require={true}
                  />
                  <InputField label={t('employee_name')} name="name" type="text" placeholder={t('please_enter_data')} require={true} />
                </div>
                <div className="input-flex-row">
                  <InputField label={t('line_id')} name="line_id" type="text" placeholder={t('please_enter_data')} />
                  <InputField label={t('email')} name="email" type="text" placeholder={t('please_enter_data')} require={true} />
                </div>
                <div className="input-flex-row">
                  <SelectField
                    label={t('position')}
                    id="role"
                    name="role"
                    options={roleTypes}
                    placeholder={t('please_select')}
                    onChange={(e: any) => handleChangeSelect(props, e, 'role')}
                    isSearchable={false}
                    require={true}
                  />
                  <SelectField
                    label={t('access_level')}
                    id="access_level"
                    name="access_level"
                    options={accessLevelTypes}
                    placeholder={t('please_select')}
                    onChange={(e: any) => handleChangeSelect(props, e, 'access_level')}
                    isSearchable={false}
                    require={true}
                  />
                </div>

                <div className="input-flex-row">
                  <InputField
                    label={t('employee_phone')}
                    name="phone_number"
                    type="text"
                    maxLength={10}
                    onKeyPress={(e: any) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    require={true}
                  />
                  {
                    role === 'admin' && (
                      <SelectField
                        label={t('business_unit')}
                        id="id_business_unit"
                        name="id_business_unit"
                        placeholder={t('please_select')}
                        className="w-auto"
                        options={businessUnit}
                        isSearchable={true}
                        onChange={(e: any) => {
                          handleChangeSelect(props, e, 'id_business_unit')
                        }}
                      />
                    )
                  }
                </div>
                {(access_level == 'A' || access_level == 'B') && (
                 <div className="input-flex-row">
                      <SelectField
                          label={t('active_status')}
                          id="is_active"
                          name="is_active"
                          placeholder={t('please_select')}
                          options={[
                          {
                            value: true,
                            label: t('active')
                          },
                          {
                            value: false,
                            label: t('inactive')
                          },
                        ]}
                        />
                </div>
                )}
                
                <div className="input-flex-row">
                  <InputField label={t('password')} name="password" type="password" require={true} />
                  <InputField label={t('confirm_password')} name="password_repeat" type="password" require={true} />
                </div>
                {enabledPin && (
                    <>
                     <div className="input-flex-row">
                        <InputField
                          label={t('pin_label')}
                          name="pin"
                          type="password"
                          maxLength={6}
                          onKeyPress={(e: any) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>

                    </>
                    
                )}
                <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                  {t('save')}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  )

}

export default Edit