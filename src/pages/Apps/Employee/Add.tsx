import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { Form, Formik } from 'formik'
import { Employees } from '../../../types/index'
import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'
import { thaiTitles, roleTypes, accessLevelTypes, toastAlert } from '../../../helpers/constant'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'admin'

const Add = () => {
  const { t } = useTranslation()
  const toast = Swal.mixin(toastAlert)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  if (role != 'admin' && role != 'business_unit') {
    navigate('/')
  }

  const breadcrumbItems = [
    { to: '/apps/employee/list', label: t('employee') },
    { label: t('add'), isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle(t('add_employee')))
  }, [dispatch, t])

  const [employeeFormData] = useState<Employees>({
    title: '',
    name: '',
    phone_number: '',
    line_id: '',
    access_level: '',
    email: '',
    role: '',
    is_active: true,
  })
  const [businessUnit, setBusinessUnit] = useState<any>([])

  const SubmittedForm = Yup.object().shape({
    title: Yup.string().required(t('please_fill_all_fields')),
    name: Yup.string().required(t('please_fill_all_fields')),
    phone_number: Yup.string().required(t('please_fill_all_fields')),
    email: Yup.string().email(t('please_enter_valid_email')).required(t('please_fill_all_fields')),
    role: Yup.string().required(t('please_fill_all_fields')),
    access_level: Yup.string().required(t('please_fill_all_fields')),
    password: Yup.string().required(t('please_fill_all_fields')),
    password_repeat: Yup.string().oneOf([Yup.ref('password'), null], t('password_not_match')).required(t('please_fill_all_fields')),
  })


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

  const { mutate: employeeCreate } = useGlobalMutation(url_api.employeeCreate, {
    onSuccess: (res: any) => {
       if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
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

  const submitForm = useCallback(
    (event: any) => {
      employeeCreate({
        data: {
          ...event,
          is_approved: true,
          is_active: true,
        },
      })
    },
    [employeeFormData]
  )

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex xl:flex-row flex-col gap-2.5 pt-5">
        <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
          <Formik initialValues={employeeFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
            {(props) => (
              <Form className="space-y-5 dark:text-white custom-select">
                <div className="input-flex-row">
                  <SelectField
                    label={t('title_prefix')}
                    id="title"
                    name="title"
                    placeholder={t('please_select')}
                    options={thaiTitles}
                    isSearchable={false}
                    onChange={(e: any) => {
                      handleChangeSelect(props, e, 'title')
                    }}
                    require={true}
                  />
                  <InputField
                    label={t('employee_name')}
                    name="name"
                    type="text"
                    require={true}
                  />

                </div>
                <div className="input-flex-row">
                  <InputField
                    label="Line ID"
                    name="line_id"
                    type="text"
                  />
                  <InputField
                    label="Email"
                    name="email"
                    require={true}
                  />
                </div>
                <div className="input-flex-row">
                  <SelectField
                    label={t('position')}
                    id="role"
                    name="role"
                    placeholder={t('please_select')}
                    options={roleTypes}
                    isSearchable={false}
                    onChange={(e: any) => {
                      handleChangeSelect(props, e, 'role')
                    }}
                    require={true}
                  />
                  <SelectField
                    label={t('access_level')}
                    id="access_level"
                    name="access_level"
                    placeholder={t('please_select')}
                    isSearchable={false}
                    options={accessLevelTypes}
                    onChange={(e: any) => {
                      handleChangeSelect(props, e, 'access_level')
                    }}
                    require={true}
                  />
                </div>
                <div className="input-flex-row">
                  <InputField
                    label={t('employee_phone')}
                    name="phone_number"
                    type="text"
                    require={true}
                    maxLength={10}
                    onKeyPress={(e: any) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
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

                <div className="input-flex-row">
                  <InputField
                    label={t('password')}
                    name="password"
                    type="password"
                  />
                  <InputField
                    label={t('confirm_password')}
                    name="password_repeat"
                    type="password"
                  />
                </div>
                <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                  {t('add')}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  )

}

export default Add