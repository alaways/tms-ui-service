import { useEffect, useState, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import { defaultCenter, googleApiKey, toastAlert } from '../../../helpers/constant'
//code สำหรับเอา data เข้า database จากไฟล์ JSON
// import { importShopData } from '../../../helpers/importShopData'
import { useDispatch, useSelector } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { IRootState } from '../../../store'

import { NUMBER_REGEX } from '../../../helpers/regex'
import { Form, Formik } from 'formik'
import { Tab } from '@headlessui/react'
import { Shop } from '../../../types/index'

import { useDistrictMutation, useSubDistrictMutation } from '../../../services/mutations/useProvincesMutation'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'

import { setShop } from '../../../store/dataStore'
import { setPageAction } from '../../../store/pageStore'

import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'

import Breadcrumbs from '../../../helpers/breadcrumbs'
import PreLoading from '../../../helpers/preLoading'
import themeConfig from '../../../theme.config'

const mode = process.env.MODE || 'admin'

const Add = () => {

  const toast = Swal.mixin(toastAlert)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const breadcrumbItems = [
    { to: '/apps/shop/list', label: 'ร้านค้า' },
    { label: 'เพิ่ม', isCurrent: true }
  ]

  useEffect(() => {
    dispatch(setPageTitle('เพิ่มร้านค้า'))
    dispatch(setSidebarActive(['shop', '/apps/shop/add']))
    fetchContractGetStatus({})
  }, [])

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  const dataStoredProvinces = useSelector((state: IRootState) => state.dataStore.provinces)
  const id_business_unit = storedUser ? JSON.parse(storedUser ?? '{}').id_business_unit : null

  const [activeTab, setActiveTab] = useState('Shop')

  if (role !== 'admin' && role !== 'business_unit') {
    navigate('/')
  }
  const [defaultForm, setDefaultFormData] = useState<Shop>({
    username: '',
    password: '',
    password_repeat: '',
    tax_id: '',
    name: '',
    contact_name: '',
    phone_number: '',
    line_id: '',
    facebook_id: '',
    website: '',
    email: '',
    address: '',
    id_province: '',
    id_district: '',
    id_subdistrict: '',
    zip_code: '',
    latitude: '',
    longitude: '',
    is_active: true,
    is_approved: true,
    id_business_unit: '',
    is_create_customer: true
  })

  const [marker, setMarker] = useState<any>(null)

  const [districtIdList, setDistrictIdList] = useState<any>([])
  const [subDistrictIdList, setSubDistrictIdList] = useState<any>([])
  const [isFoundTax, setIsFoundTax] = useState<number>(0)
  // isFoundTax === 1 คือเจอ
  // isFoundTax === 2 คือไม่เจอ
  const [shopFormData, setShopFormData] = useState<Shop>(defaultForm)
  const [businessUnit, setBusinessUnit] = useState<any>([])

  const { mutate: shopSearch  } = useGlobalMutation(url_api.shopSearch, {
    onSuccess: (res: any, variables: any) => {
      if (res.code === 200 || res.statusCode === 200) {
        setShopFormData((prev: any) => ({
          ...prev,
          ...res.data,
          password: '',
        }))
        getDistrict({ id: res.data?.id_province, type: 'id_province' })
        getSubDistrict({ id: res.data?.id_district, type: 'id_district' })
        setIsFoundTax(1)
      } else {
        setShopFormData({
          ...defaultForm,
          tax_id: variables.props.values.tax_id,
        })
        setIsFoundTax(2)
      }
    },
  })

  const { mutate: shopCreate, isLoading  } = useGlobalMutation(url_api.shopCreate, {
      onSuccess: (res: any, variables: any) => {
      if (res.code === 200 || res.statusCode === 200) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        })
        dispatch(setShop(res.data))
        dispatch(setPageAction('edit'))
        navigate('/apps/shop/edit/' + res.data.id)
      } else {
        toast.fire({
          icon: 'error',
          title: res?.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: shopBuCreate, isLoading: isLoading2 } = useGlobalMutation(url_api.shopAddBu, {
    onSuccess: (res: any) => {
      if (res.code === 200 || res.statusCode === 200) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        })
        dispatch(setShop(res.data))
        dispatch(setPageAction('edit'))
        navigate('/apps/shop/edit/' + res.data.id)
      } else {
        toast.fire({
          icon: 'error',
          title: res?.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: getDistrict } = useDistrictMutation({
    onSuccess: (res: any, variables: any) => {
      const mapList = res.data.map((item: any) => ({
        value: item.id,
        label: item.name_th,
      }))
      switch (variables.type) {
        case 'id_province':
          setDistrictIdList(mapList)
          break
        default:
          break
      }
    },
    onError: (err: any) => { },
  })

  const { mutate: getSubDistrict } = useSubDistrictMutation({
    onSuccess: (res: any, variables: any) => {
      const mapList = res.data.map((item: any) => ({
        value: item.id,
        label: item.name_th,
        zipCode: item.zip_code,
      }))
      switch (variables.type) {
        case 'id_district':
          setSubDistrictIdList(mapList)
          break
        default:
          break
      }
    },
    onError: (err: any) => { },
  })

  const { mutate: fetchContractGetStatus } = useGlobalMutation(url_api.contractFilter, {
    onSuccess: (res: any) => {
      setBusinessUnit(
        res.data.business_unit.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      )
    },
    onError: () => {
      console.error('Failed to fetch status data')
    },
  })

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleApiKey,
  })

  const handleChangeSelect = (props: any, event: any, name: any) => {
    const resetFields = (fields: string[], resetFunctions: Function[]) => {
      fields.forEach((field) => props.setFieldValue(field, null))
      resetFunctions.forEach((func) => func([]))
    }
    const actions: { [key: string]: () => void } = {
      id_province: () => {
        getDistrict({ id: event.value, type: name })
        resetFields(['id_district', 'id_subdistrict'], [setSubDistrictIdList, setSubDistrictIdList])
      },
      id_district: () => {
        getSubDistrict({ id: event.value, type: name })
        resetFields(['id_subdistrict'], [setSubDistrictIdList])
      },
      id_subdistrict: () => {
        props.setFieldValue('zip_code', parseInt(event.zipCode))
      },
    }
    if (actions[name]) { actions[name]() }
  }

  const submitForm = useCallback((event: any) => {
    if (!isLoading) {
      if (isFoundTax === 1) {
        shopBuCreate({
          data: {
            "id_business_unit": id_business_unit ? id_business_unit : event.id_business_unit,
            "id_shop": event?.uuid
          }
        })
      } else {
        shopCreate({
          data: {
            ...event,
            tax_id: event.tax_id,
            id_business_unit: event.id_business_unit,
          },
        })
      }

    }
  }, [isFoundTax, shopBuCreate, shopCreate])

  const handleMapClick = (props: any, event: any) => {
    props.setFieldValue('latitude', event.latLng.lat().toString())
    props.setFieldValue('longitude', event.latLng.lng().toString())
    setMarker({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    })
  }
  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    tax_id: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').matches(NUMBER_REGEX, 'ใส่ได้เฉพาะตัวเลขเท่านั้น').length(13, 'กรุณาใส่ข้อมูลให้ครบ 13 หลัก'),
    contact_name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_province: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_district: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_subdistrict: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    email: Yup.string().email('กรุณาใส่อีเมลที่ถูกต้อง').required('กรุณาใส่ข้อมูลให้ครบ'),
    id_business_unit: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    ...((isFoundTax === 2) && {
      username: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
      password: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
      password_repeat: Yup.string().oneOf([Yup.ref('password'), null], 'รหัสผ่านไม่ตรงกัน').required('กรุณาใส่ข้อมูลให้ครบ'),
    })
  })

  return (
    <>
      {((!isLoaded && !isLoading2) || isLoading) && <PreLoading />}
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex xl:flex-row flex-col gap-2.5 mt-3">
        <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
          <div className="space-y-5 dark:text-white">
            <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
              ตั้งค่าจัดการร้านค้า
            </div>
            <Formik initialValues={shopFormData} onSubmit={submitForm} enableReinitialize={true} autoComplete="off" validationSchema={SubmittedForm}>
              {(props) => (
                <Form>
                  <div className="">
                    <div className="check-container">
                      <InputField
                        label="เลขประจำตัวผู้เสียภาษี"
                        name="tax_id"
                        type="text"
                        onChange={(e: any) => {
                          let cleanedValue = e.target.value.replace(/\D/g, "");
                          cleanedValue = cleanedValue.slice(0, 13);
                          props.setFieldValue("tax_id", cleanedValue);
                        }}
                        onKeyPress={(e: any) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (props.values.tax_id?.length === 13) {
                              shopSearch({ data: { tax_id: props.values.tax_id }, props })
                            } else {
                              toast.fire({
                                icon: 'error',
                                title: 'กรุณากรอกเลขประจำตัวผู้เสียภาษีให้ครบก่อนค้นหา',
                                padding: '10px 20px',
                              })
                            }
                            return
                          }
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault()
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-dark mt-2 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                        onClick={() => {
                          if (props.values.tax_id?.length === 13) {
                            shopSearch({ data: { tax_id: props.values.tax_id }, props })
                          } else {
                            toast.fire({
                              icon: 'error',
                              title: 'กรุณากรอกเลขประจำตัวผู้เสียภาษีให้ครบก่อนค้นหา',
                              padding: '10px 20px',
                            })
                          }
                        }}
                      >
                        ตรวจสอบ
                      </button>
                      <p className="mt-4 text-[11px] text-white-dark">
                        หากพบจะแสดงบัญชีร้านค้า หากไม่พบจะแสดงแบบฟอร์มให้สร้างบัญชีใหม่ได้
                      </p>
                    </div>

                  </div>

                  {isFoundTax === 1 || isFoundTax === 2 ? (
                    <div>
                      <Tab.Group>
                        <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                          <Tab as={Fragment}>
                            {({ selected }) => (
                              <button className={`${selected ? `!border-white-light !border-b-white text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                                บัญชีร้านค้า
                              </button>
                            )}
                          </Tab>
                        </Tab.List>
                        <Tab.Panels>
                          <Tab.Panel>
                            <div className="mt-6">
                              <div className="input-flex-row mt-4">
                                <SelectField
                                  require={true}
                                  id='id_business_unit'
                                  label='หน่วยธุรกิจ'
                                  name='id_business_unit'
                                  placeholder='เลือก หน่วยธุรกิจ'
                                  options={businessUnit}
                                  isSearchable={true}
                                />
                              </div>
                              <div className="input-flex-row mt-4">
                                <InputField
                                  require={true}
                                  label="ชื่อร้าน"
                                  name="name"
                                  type="text"
                                  disabled={isFoundTax == 1}
                                />
                                <InputField
                                  require={true}
                                  label="ชื่อผู้ติดต่อ"
                                  name="contact_name"
                                  type="text"
                                  disabled={isFoundTax == 1}
                                />
                              </div>
                              <div className="input-flex-row">
                                <InputField
                                  label="เบอร์โทรศัพท์"
                                  name="phone_number"
                                  type="text"
                                  disabled={isFoundTax == 1}
                                  maxLength={10}
                                  onKeyPress={(e: any) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault()
                                    }
                                  }}
                                />
                                <InputField
                                  label="Line ID"
                                  name="line_id"
                                  type="text"
                                  disabled={isFoundTax == 1}
                                />
                              </div>
                              <div className="input-flex-row">
                                <InputField
                                  label="Facebook ID"
                                  name="facebook_id"
                                  type="text"
                                  disabled={isFoundTax == 1}
                                />
                                <InputField
                                  label="เว็บไซต์"
                                  name="website"
                                  type="text"
                                  disabled={isFoundTax == 1}
                                />
                              </div>
                              <div className="input-flex-row">
                                <InputField
                                  require={true}
                                  label="อีเมล"
                                  name="email"
                                  type="text"
                                  disabled={isFoundTax == 1}
                                />
                              </div>
                              <div className="input-flex-row">
                                <InputField
                                  label="ที่อยู่"
                                  name="address"
                                  as="textarea"
                                  rows="1"
                                  placeholder="กรุณาใส่ข้อมูล"
                                  className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                                  disabled={isFoundTax == 1}
                                />
                              </div>
                              <div className="input-flex-row">
                                <SelectField
                                  require={true}
                                  label="จังหวัด"
                                  id="id_province"
                                  name="id_province"
                                  placeholder="กรุณาเลือก"
                                  isSearchable={true}
                                  options={dataStoredProvinces}
                                  onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'id_province')
                                  }}
                                  disabled={isFoundTax == 1}
                                />
                                <SelectField
                                  require={true}
                                  label="อำเภอ/เขต"
                                  id="id_district"
                                  name="id_district"
                                  placeholder="กรุณาเลือก"
                                  isSearchable={true}
                                  options={districtIdList}
                                  disabled={isFoundTax == 1 || districtIdList.length === 0}
                                  onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'id_district')
                                  }}
                                />
                              </div>
                              <div className="input-flex-row">
                                <SelectField
                                  require={true}
                                  label="ตำบล/แขวง"
                                  id="id_subdistrict"
                                  name="id_subdistrict"
                                  placeholder="กรุณาเลือก"
                                  isSearchable={true}
                                  options={subDistrictIdList}
                                  disabled={isFoundTax == 1 || subDistrictIdList.length === 0}
                                  onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'id_subdistrict')
                                  }}
                                />
                                <InputField
                                  label="รหัสไปรษณีย์"
                                  name="zip_code"
                                  as="textarea"
                                  rows="1"
                                  disabled
                                />
                              </div>
                              <div className="input-flex-row">
                                <InputField
                                  label="Latitude"
                                  name="latitude"
                                  type="text"
                                  disabled
                                />
                                <InputField
                                  label="Longitude"
                                  name="longitude"
                                  type="text"
                                  disabled
                                />
                              </div>
                              <div className="input-flex-row">
                                <SelectField
                                  require={true}
                                  label="สร้างลูกค้า"
                                  id="is_create_customer"
                                  name="is_create_customer"
                                  placeholder="กรุณาเลือก"
                                  options={[
                                    {
                                      value: false,
                                      label: 'ปิด',
                                    },
                                    {
                                      value: true,
                                      label: 'เปิด',
                                    }
                                  ]}
                                  isSearchable={false}
                                />
                              </div>
                              <div className="input-flex-row mb-3">
                                {isLoaded && (
                                  <GoogleMap
                                    zoom={13}
                                    center={defaultCenter}
                                    mapContainerStyle={{ marginTop: '15px', height: '400px', width: '100%' }}
                                    onClick={(e: any) => handleMapClick(props, e)}
                                  >
                                    {marker && <Marker position={{ lat: marker.lat, lng: marker.lng }} />}
                                  </GoogleMap>
                                )}
                              </div>
                            </div>
                            {
                              (isFoundTax === 2) && (<div className="pt-2">
                                <div className="input-flex-row">
                                  <InputField
                                    require={true}
                                    label="ชื่อผู้ใช้งาน"
                                    name="username"
                                    type="text"
                                  />
                                </div>
                                <div className="input-flex-row">
                                  <InputField
                                    label="รหัสผ่าน"
                                    name="password"
                                    type="password"
                                  />
                                  <InputField
                                    label="ยืนยันรหัสผ่าน"
                                    name="password_repeat"
                                    type="password"
                                  />
                                </div>
                              </div>)
                            }

                            <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                              {isLoading && (<span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>)}
                              บันทึก
                            </button>

                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                  ) : ''}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  )

}

export default Add