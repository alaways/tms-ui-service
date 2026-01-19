import { useState, useEffect, useCallback, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import * as Yup from 'yup'

import Swal from 'sweetalert2'
import Tippy from '@tippyjs/react'

import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import { googleApiKey, defaultCenter, toastAlert } from '../../../helpers/constant'

import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageAction } from '../../../store/pageStore'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'

import { NUMBER_REGEX } from '../../../helpers/regex'

import { Form, Formik } from 'formik'
import { Tab, Dialog, Transition } from '@headlessui/react'

import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'

import { Shop } from '../../../types/index'

import { useDistrictMutation, useSubDistrictMutation } from '../../../services/mutations/useProvincesMutation'
import { useShopUpdateMutation, useShopFindMutation } from '../../../services/mutations/useShopMutation'

import Breadcrumbs from '../../../helpers/breadcrumbs'
import PreLoading from '../../../helpers/preLoading'

import IconX from '../../../components/Icon/IconX'
import IconEdit from '../../../components/Icon/IconEdit'
import IconTrashLines from '../../../components/Icon/IconTrashLines'
import IconCheck from '../../../components/Icon/IconCheck'

import 'tippy.js/dist/tippy.css'
import { formatBankAccountNumber } from '../../../helpers/formatNumeric'
import themeInit from '../../../theme.init'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import List from '../ShopUser/List'

const defaultBankForm = {
  id_bank: '',
  bank_account_name: '',
  bank_account_number: '',
  is_main_account: false,
}

const mode = process.env.MODE || 'admin'

const Edit = () => {

  const { id } = useParams()

  const toast = Swal.mixin(toastAlert)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  const adminEmail = storedUser ? JSON.parse(storedUser).email : null
  let adminRoot = false
  if (adminEmail == "dev@tplus.co.th" || adminEmail == "admin258@tplus.co.th") {
    adminRoot = true;
  }
  // 
  const [actionModal, setActionModal] = useState(false)

  if (role !== 'admin' && role !== 'business_unit') {
    navigate('/')
  }

  useEffect(() => {
    dispatch(setPageTitle('ข้อมูลร้านค้า'))
    dispatch(setSidebarActive(['shop', '/apps/shop/list']))
  })

  const pageAction = useSelector((state: IRootState) => state.pageStore.pageAction) !== 'edit'

  const breadcrumbItems = [
    { to: '/apps/shop/list', label: 'ร้านค้า' },
    { label: pageAction ? 'ข้อมูล' : 'แก้ไข', isCurrent: true },
  ]

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
    is_create_customer: true,
    is_create_refinance: false,
  })

  const [marker, setMarker] = useState<any>(defaultCenter)

  const dataStoredProvinces = useSelector((state: IRootState) => state.dataStore.provinces)
  const dataStoredShop = useSelector((state: IRootState) => state.dataStore.shop)

  const [districtIdList, setDistrictIdList] = useState<any>([])
  const [subDistrictIdList, setSubDistrictIdList] = useState<any>([])

  const [shopFormData, setShopFormData] = useState<Shop>(defaultForm)
  const [bankFormData, setBankFormData] = useState<any>(defaultBankForm)
  const [bankList, setBankList] = useState<any>([])
  const [masterDataBankList, setMasterDataBankList] = useState<any>([])

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleApiKey,
  })

  const { mutate: fetchShopData, isLoading: isShopLoading, isError } = useShopFindMutation({
    onSuccess: (res: any) => {
      const setFormValue = res.data
      setFormValue.password = ''
      setFormValue.password_repeat = ''
      setBankList(setFormValue?.shop_banks ?? [])
      getDistrict({ id: setFormValue?.id_province, type: 'id_province' })
      getSubDistrict({ id: setFormValue?.id_district, type: 'id_district' })
      setShopFormData((prev) => ({ ...prev, ...setFormValue, id: dataStoredShop.id }))
      if (setFormValue.latitude && setFormValue.longitude) {
        setMarker({
          lat: parseFloat(setFormValue.latitude),
          lng: parseFloat(setFormValue.longitude),
        })
      }
    },
  })

  const { mutate: fetchShopDataBank } = useShopFindMutation({
    onSuccess: (res: any) => {
      const setFormValue = res.data
      setBankList(setFormValue?.shop_banks ?? [])
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

  const { mutate: shopUpdate, isLoading } = useShopUpdateMutation({
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ',
          padding: '10px 20px',
        })
        navigate('/apps/shop/list')
      } else {
        toast.fire({
          icon: 'error',
          title: res.error,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: bankFindAll } = useGlobalMutation(url_api.bankFindAll, {
    onSuccess: (res: any) => {
      setMasterDataBankList(
        res.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      )
    },
  })


  const { mutate: ShopAddBank } = useGlobalMutation(url_api.shopAddBank, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'เพิ่มสำเร็จ',
          padding: '10px 20px',
        })
        fetchShopDataBank({ data: { id: dataStoredShop.id } })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })


  const { mutate: ShopUpdateBank } = useGlobalMutation(url_api.shopUpdateBank, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ',
          padding: '10px 20px',
        })
        fetchShopDataBank({ data: { id: dataStoredShop.id } })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: DeleteBank } = useGlobalMutation(url_api.shopDeleteBank, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          padding: '10px 20px',
        })
        fetchShopDataBank({ data: { id: dataStoredShop.id } })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  useEffect(() => {
    bankFindAll({ data: { page: 1, pageSize: -1 } })
    fetchShopData({
      data: {
        id: id || dataStoredShop.id
      }
    })
  }, [])

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

  const submitForm = useCallback(
    (event: any) => {
      if (!isLoading) {
        shopUpdate({
          data: event,
          tax_id: event.tax_id,
        })
      }
    },
    [shopUpdate]
  )

  const submitBankForm = useCallback(
    (event: any) => {
      if (event?.id) {
        ShopUpdateBank({
          data: {
            id: event.id,
            id_bank: event.id_bank,
            id_shop: dataStoredShop.id,
            bank_account_name: event.bank_account_name,
            bank_account_number: event.bank_account_number,
            is_main_account: event.is_main_account || false,
            is_active: true,
          },
        })
      } else {
        ShopAddBank({
          data: {
            id_bank: event.id_bank,
            id_shop: dataStoredShop.id,
            bank_account_name: event.bank_account_name,
            bank_account_number: event.bank_account_number,
            is_main_account: event.is_main_account || false,
            is_active: true,
          },
        })
      }
      setActionModal(false)
    },
    [ShopUpdateBank, ShopAddBank, dataStoredShop]
  )

  const handleMapClick = (props: any, event: any) => {
    props.setFieldValue('latitude', event.latLng.lat().toString())
    props.setFieldValue('longitude', event.latLng.lng().toString())
    setMarker({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    })
  }

  const SubmittedForm = Yup.object().shape({
    username: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    tax_id: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').matches(NUMBER_REGEX, 'ใส่ได้เฉพาะตัวเลข').length(13, 'กรุณาใส่ข้อมูลให้ครบ 13 หลัก'),
    contact_name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_province: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_district: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_subdistrict: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    email: Yup.string().email('กรุณาใส่อีเมลที่ถูกต้อง').required('กรุณาใส่ข้อมูลให้ครบ'),
  })
  const SubmittedPasswordForm = Yup.object().shape({
    password_repeat: Yup.string().oneOf([Yup.ref('password'), null], 'รหัสผ่านไม่ตรงกัน'),
  })


  const SubmittedBankForm = Yup.object().shape({
    bank_account_name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_bank: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    bank_account_number: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').matches(NUMBER_REGEX, 'ใส่ได้เฉพาะตัวเลข'),
    is_main_account: Yup.boolean().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const goEdit = () => {
    dispatch(setPageAction('edit'))
  }

  const goReport = () => {
    navigate('/apps/shop/report/' + dataStoredShop.id)
  }

  const goActiveCreateCustomer = () => {

  }

  return (
    <>
      {(!isLoaded || isShopLoading || isError) && <PreLoading />}
      <div className="flex items-center justify-between flex-wrap">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex">
          {
            pageAction && (
              <a className="hover:text-info cursor-pointer btn btn-success mr-1" onClick={() => goReport()}>
                รายงานผลตอบแทน
              </a>
            )
          }
          {
            pageAction && (
              <a className="hover:text-info cursor-pointer btn btn-primary mr-1" onClick={() => goEdit()}>
                <IconEdit className="w-4.5 h-4.5" /> &nbsp;
                แก้ไข
              </a>
            )
          }
        </div>
      </div>
      <div className="flex xl:flex-row flex-col gap-2.5 mt-3">
        <div className="panel px-6 flex-1 py-6 rtl:xl:ml-6">
          <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
            บัญชีร้านค้า
          </div>
          <div>
            <Tab.Group>
              <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                      บัญชีร้านค้า
                    </button>
                  )}
                </Tab>
                {!themeInit.features?.shop_user &&
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                      บัญชีผู้ใช้งาน
                    </button>
                  )}
                </Tab>
                }
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                      บัญชีธนาคาร
                    </button>
                  )}
                </Tab>
                {themeInit.features?.shop_user &&
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                        พนักงาน
                      </button>
                    )}
                  </Tab>
                }
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <Formik initialValues={shopFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                    {(props) => (
                      <Form className="space-y-5 dark:text-white">
                        <div className="mt-6">
                          <div className="input-flex-row">
                            <div className="check-container">
                              <InputField
                                label="เลขประจำตัวผู้เสียภาษี"
                                name="tax_id"
                                type="text"
                                disabled={pageAction}
                                maxLength={13}
                                onKeyPress={(e: any) => {
                                  if (!/[0-9]/.test(e.key)) {
                                    e.preventDefault()
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <hr className="mt-4"></hr>
                          <div className="input-flex-row mt-4">
                            <InputField
                              label="ชื่อร้าน"
                              name="name"
                              type="text"
                              disabled={pageAction}
                            />
                            <InputField
                              label="ชื่อผู้ติดต่อ"
                              name="contact_name"
                              type="text"
                              disabled={pageAction}
                            />
                          </div>
                          <div className="input-flex-row">
                            <InputField
                              label="เบอร์โทรศัพท์"
                              name="phone_number"
                              type="text"
                              disabled={pageAction}
                            />
                            <InputField
                              label="Line ID"
                              name="line_id"
                              type="text"
                              disabled={pageAction}
                            />
                          </div>
                          <div className="input-flex-row">
                            <InputField
                              label="Facebook ID"
                              name="facebook_id"
                              type="text"
                              disabled={pageAction}
                            />
                            <InputField
                              label="เว็บไซต์"
                              name="website"
                              type="text"
                              disabled={pageAction}
                            />
                          </div>
                          <div className="input-flex-row">
                            <InputField
                              label="อีเมล"
                              name="email"
                              type="text"
                              disabled={pageAction}
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
                              disabled={pageAction}
                            />
                            <SelectField
                              label="จังหวัด"
                              id="id_province"
                              name="id_province"
                              placeholder="กรุณาเลือก"
                              isSearchable={false}
                              disabled={pageAction}
                              options={dataStoredProvinces}
                              onChange={(e: any) => {
                                handleChangeSelect(props, e, 'id_province')
                              }}
                            />
                          </div>
                          <div className="input-flex-row">
                            <SelectField
                              require={true}
                              label="อำเภอ/เขต"
                              id="id_district"
                              name="id_district"
                              placeholder="กรุณาเลือก"
                              isSearchable={false}
                              options={districtIdList}
                              disabled={districtIdList.length === 0 || pageAction}
                              onChange={(e: any) => {
                                handleChangeSelect(props, e, 'id_district')
                              }}
                            />
                            <SelectField
                              require={true}
                              label="ตำบล/แขวง"
                              id="id_subdistrict"
                              name="id_subdistrict"
                              placeholder="กรุณาเลือก"
                              options={subDistrictIdList}
                              isSearchable={false}
                              disabled={subDistrictIdList.length === 0 || pageAction}
                              onChange={(e: any) => {
                                handleChangeSelect(props, e, 'id_subdistrict')
                              }}
                            />
                          </div>
                          <div className="input-flex-row">
                            <InputField
                              label="รหัสไปรษณีย์"
                              name="zip_code"
                              as="textarea"
                              rows="1"
                              disabled={true}
                            />
                            <div className="blank-container"></div>
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
                          {/* <a className={`hover:text-info cursor-pointer btn ${shopFormData.is_create_customer ? 'btn-danger' : 'btn-success'} mr-1`} onClick={() => goActiveCreateCustomer()}>
            <IconLock className="w-4.5 h-4.5" /> &nbsp;
            {  shopFormData.is_create_customer ? 'ปิดการสร้างลูกค้า' : 'เปิดการสร้างลูกค้า' } 
          </a> */}
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
                              disabled={pageAction}
                            />
                            {(role == 'admin' && adminRoot == true) && (
                              <SelectField
                                require={true}
                                label="สร้างสัญญารีไฟแนนซ์"
                                id="is_create_refinance"
                                name="is_create_refinance"
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
                                disabled={pageAction}
                              />
                            )}

                          </div>
                          <div className="input-flex-row mb-3">
                            {isLoaded && (
                              <GoogleMap
                                zoom={13}
                                center={marker}
                                mapContainerStyle={{ marginTop: '15px', height: '400px', width: '100%' }}
                                onClick={(e: any) => (!pageAction ? handleMapClick(props, e) : null)}
                              >
                                {marker && <Marker position={{ lat: marker.lat, lng: marker.lng }} />}
                              </GoogleMap>
                            )}
                          </div>
                        </div>
                        {!pageAction && (
                          <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                            {isLoading && (<span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>)}
                            แก้ไข
                          </button>
                        )}
                      </Form>
                    )}
                  </Formik>
                </Tab.Panel>

                {!themeInit.features?.shop_user &&
                <Tab.Panel>
                  <Formik initialValues={shopFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedPasswordForm}>
                    {(props) => (
                      <Form>
                        <div className="mt-6">
                          <div className="border border-white-light dark:border-[#1b2e4b] group rounded-md">
                            <div className="px-5 pb-5">
                              <div className="input-flex-row">
                                <InputField
                                  label="ชื่อผู้ใช้งาน"
                                  name="username"
                                  type="text"
                                  disabled={pageAction}
                                />
                              </div>
                              {!pageAction && (
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
                              )}
                            </div>
                          </div>
                        </div>
                        {!pageAction && (
                          <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                            {isLoading && (<span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>)}
                            แก้ไข
                          </button>
                        )}
                      </Form>
                    )}
                  </Formik>


                </Tab.Panel>
                }
                <Tab.Panel>
                  <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                    <div className="p-5">
                      <button type="button" className="btn bg-[#002a42] text-white w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" onClick={() => {
                        setBankFormData(defaultBankForm)
                        setActionModal(true)
                      }}>
                        เพิ่มบัญชีธนาคาร
                      </button>
                      <div className="panel p-0 mt-5 border-0 overflow-hidden">
                        <div className="table-responsive">
                          <table className="table-striped table-hover">
                            <thead>
                              <tr>
                                <th>ลำดับ</th>
                                <th>ชื่อบัญชีธนาคาร</th>
                                <th>ธนาคาร</th>
                                <th>เลขบัญชีธนาคาร</th>
                                <th className="!text-center">บัญชีหลัก</th>
                                <th className="!text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bankList.map((item: any, index: number) => (
                                <tr key={item.id}>
                                  <td>
                                    <div className="flex items-center w-max">
                                      <div>{index + 1}</div>
                                    </div>
                                  </td>
                                  <td>{item?.bank_account_name}</td>
                                  <td>{item?.bank?.name}</td>
                                  <td>{formatBankAccountNumber(item?.bank_account_number)}</td>
                                  <td className="text-center text-green">
                                    {item?.is_main_account == true ? <IconCheck /> : ''}
                                  </td>
                                  <td>
                                    <div className="flex gap-4 items-center w-max mx-auto">
                                      <Tippy content="แก้ไข" theme="Primary">
                                        <a className="flex hover:text-info cursor-pointer" onClick={() => { setBankFormData({ ...item, id_bank: item?.bank?.id }); setActionModal(true) }}>
                                          <IconEdit className="w-4.5 h-4.5" />
                                        </a>
                                      </Tippy>
                                      <Tippy content="ลบ" theme="Primary">
                                        <button
                                          type="button"
                                          className="flex hover:text-info cursor-pointer"
                                          onClick={() => {
                                            Swal.fire({
                                              title: 'ยืนยันการลบบัญชีธนาคาร',
                                              text: 'คุณต้องการลบบัญชีธนาคารนี้ใช่หรือไม่?',
                                              icon: 'warning',
                                              showCancelButton: true,
                                              confirmButtonColor: themeInit.color.themePrimary,
                                              cancelButtonColor: '#d33',
                                              confirmButtonText: 'ยืนยัน',
                                              cancelButtonText: 'ยกเลิก',
                                              reverseButtons: true,
                                            }).then((result) => {
                                              if (result.isConfirmed) {
                                                DeleteBank({ data: { id: item.id } })
                                              }
                                            })
                                          }}
                                        >
                                          <IconTrashLines />
                                        </button>
                                      </Tippy>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Panel>
                {themeInit.features?.shop_user &&
                  <Tab.Panel>
                    <List />
                  </Tab.Panel>
                }
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div >
      <Transition appear show={actionModal} as={Fragment}>
        <Dialog as="div" open={actionModal} className="relative z-[51]" onClose={() => setActionModal(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-[black]/60" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" >
                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark" style={{ minHeight: '550px' }}>
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    บัญชีธนาคาร
                  </div>
                  <div className="p-5">
                    <Formik initialValues={bankFormData} onSubmit={submitBankForm} enableReinitialize autoComplete="off" validationSchema={SubmittedBankForm}>
                      {(props) => (
                        <Form className="space-y-5 dark:text-white custom-select">
                          <InputField
                            label="ชื่อบัญชีธนาคาร"
                            name="bank_account_name"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
                          <SelectField
                            label="ธนาคาร"
                            id="id_bank"
                            name="id_bank"
                            options={masterDataBankList}
                            placeholder="กรุณาเลือก"
                            isSearchable={true}
                          />
                          <InputField
                            label="เลขบัญชีธนาคาร"
                            name="bank_account_number"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                            maxLength={20}
                            onKeyPress={(e: any) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault()
                              }
                            }}
                          />
                          <SelectField
                            label="บัญชีหลัก"
                            id="is_main_account"
                            name="is_main_account"
                            options={[
                              { label: 'ใช่', value: true },
                              { label: 'ไม่ใช่', value: false }
                            ]}
                            placeholder="กรุณาเลือก"
                            isSearchable={true}
                          />
                          <div className="flex justify-end items-center mt-8">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setActionModal(false)}>
                              ยกเลิก
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                              {bankFormData?.id ? 'บันทึก' : 'เพิ่ม'}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )

}

export default Edit