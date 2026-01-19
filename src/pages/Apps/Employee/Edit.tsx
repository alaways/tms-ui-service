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

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const Edit = () => {

  const { id } = useParams()

  const navigate = useNavigate()
  const dispatch = useDispatch()
  
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
    { to: '/apps/employee/list', label: 'พนักงาน' },
    { label: 'แก้ไข', isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle('แก้ไขพนักงาน'))
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
          title: 'แก้ไขสำเร็จ',
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
          title: 'PIN ต้องมีความยาว 6 ตัวเท่านั้น',
          padding: '10px 20px',
        })
        return
    }
    employeeUpdate({ 
      data: cleanedEvent, 
      id: id || dataStoredEmployee.id 
    });
  }, []);

  const SubmittedForm = Yup.object().shape({
    title: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    phone_number: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    email: Yup.string().email('กรุณาใส่อีเมลที่ถูกต้อง').required('กรุณาใส่ข้อมูลให้ครบ'),
    role: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    access_level: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    password_repeat: Yup.string().oneOf([Yup.ref('password'), null], 'รหัสผ่านไม่ตรงกัน'),
  })

  if (isEmployeeLoading) return <div>Loading...</div>

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
                    label="คำนำหน้า"
                    id="title"
                    name="title"
                    options={thaiTitles}
                    placeholder="กรุณาเลือก"
                    onChange={(e: any) => handleChangeSelect(props, e, 'title')}
                    isSearchable={false}
                    require={true}
                    disabled={!['A','B'].includes(access_level) && userUUID != id}
                  />
                  <InputField label="ชื่อพนักงาน" name="name" type="text" placeholder="กรุณาใส่ข้อมูล" require={true} disabled={!['A','B'].includes(access_level) && userUUID != id}/>
                </div>
                <div className="input-flex-row">
                  <InputField label="Line ID" name="line_id" type="text" placeholder="กรุณาใส่ข้อมูล" disabled={!['A','B'].includes(access_level) && userUUID != id}/>
                  <InputField label="Email" name="email" type="text" placeholder="กรุณาใส่ข้อมูล" require={true} disabled={!['A','B'].includes(access_level) && userUUID != id}/>
                </div>
                <div className="input-flex-row">
                  <SelectField
                    label="ตำแหน่ง"
                    id="role"
                    name="role"
                    options={roleTypes}
                    placeholder="กรุณาเลือก"
                    onChange={(e: any) => handleChangeSelect(props, e, 'role')}
                    isSearchable={false}
                    require={true}
                    disabled={!['A','B'].includes(access_level) && userUUID != id}
                  />
                  <SelectField
                    label="ระดับสิทธิ"
                    id="access_level"
                    name="access_level"
                    options={accessLevelTypes}
                    placeholder="กรุณาเลือก"
                    onChange={(e: any) => handleChangeSelect(props, e, 'access_level')}
                    isSearchable={false}
                    require={true}
                    disabled={!['A','B'].includes(access_level)}
                  />
                </div>

                <div className="input-flex-row">
                  <InputField
                    label="เบอร์โทรศัพท์พนักงาน"
                    name="phone_number"
                    type="text"
                    maxLength={10}
                    onKeyPress={(e: any) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    require={true}
                    disabled={!['A','B'].includes(access_level) && userUUID != id}
                  />
                  {
                    role === 'admin' && (
                      <SelectField
                        label="หน่วยธุรกิจ"
                        id="id_business_unit"
                        name="id_business_unit"
                        placeholder="กรุณาเลือก"
                        className="w-auto"
                        options={businessUnit}
                        isSearchable={true}
                        onChange={(e: any) => {
                          handleChangeSelect(props, e, 'id_business_unit')
                        }}
                        disabled={!['A','B'].includes(access_level) && userUUID != id}
                      />
                    )
                  }
                </div>
                {(access_level == 'A' || access_level == 'B') && (
                 <div className="input-flex-row">
                      <SelectField
                          label="เปิดใช้งาน"
                          id="is_active"
                          name="is_active"
                          placeholder="กรุณาเลือก"
                          options={[
                          {
                            value: true,
                            label: 'เปิดการใช้งาน'
                          },
                          {
                            value: false,
                            label: 'ปิดการใช้งาน'
                          },
                        ]}
                        />
                </div>
                )}
                
                <div className="input-flex-row">
                  <InputField label="รหัสผ่าน" name="password" type="password" require={true} disabled={!['A','B'].includes(access_level) && userUUID != id}/>
                  <InputField label="ยืนยันรหัสผ่าน" name="password_repeat" type="password" require={true} disabled={!['A','B'].includes(access_level) && userUUID != id}/>
                </div>
                {enabledPin && (
                    <>
                     <div className="input-flex-row">
                        <InputField
                          label="PIN"
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
                {(['A','B'].includes(access_level) ||  (['C','D'].includes(access_level) && userUUID == id)) && <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                  บันทึก
                </button>}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  )

}

export default Edit