import { useEffect, useState, useCallback, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageAction } from '../../../store/pageStore'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { Customer } from '../../../types/index'
import { useUploadMutation, useOCRMutation } from '../../../services/mutations/useUploadMutation'
import { useDistrictMutation, useSubDistrictMutation } from '../../../services/mutations/useProvincesMutation'
import { useCustomerUpdateMutation, useCustomerFindMutation } from '../../../services/mutations/useCustomerMutation'
import { Form, Formik, FormikProps } from 'formik'
import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'
import Checkbox from '../../../components/HOC/CheckboxField'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import { resizeImage } from '../../../helpers/helpFunction'
import { thaiTitles, toastAlert } from '../../../helpers/constant'
import PreLoading from '../../../helpers/preLoading'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import IconEdit from '../../../components/Icon/IconEdit'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { Dialog, Tab, Transition } from '@headlessui/react'
import IconX from '../../../components/Icon/IconX'
import List from './CreditCustomer/List'
import ListNoteCustomer from './NoteCustomer/List'
import themeConfig from '../../../theme.config'
import CameraOCR from '../../../components/CameraOCR'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'admin'

const Edit = () => {
  const { t } = useTranslation()
  const acc = JSON.parse(localStorage.getItem(mode) ?? '{}')?.acc
  const { id } = useParams()
  const creditLevelTypes = useSelector((state: IRootState) => state.dataStore.credit_level)
  const toast = Swal.mixin(toastAlert)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setPageTitle(t('customer_info')))
    dispatch(setSidebarActive(['customer', '/apps/customer/list']))
  })

  const pageAction = useSelector((state: IRootState) => state.pageStore.pageAction) !== 'edit'
  const [tabIndex, setTabIndex] = useState<number>(0)

  const dataStoredProvinces = useSelector((state: IRootState) => state.dataStore.provinces)
  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  const [installmentsData,setInstallmentsData] = useState([])

  const breadcrumbItems = [
    { to: '/apps/customer/list', label: t('customer') },
    { label: pageAction ? t('info') : t('edit'), isCurrent: true },
  ]

  // shop - only view
  if (role != 'admin' && role !== 'business_unit' && pageAction === false) {
    navigate('/')
  }

  if (!acc) {
    navigate('/apps/customer/list')
  }

  const [isCameraOcr, setIsCameraOcr] = useState(false)
  const handleCameraSubmit = (data:any) => {
    onImgChange([data])
    setIsCameraOcr(false)
  }

  const dataStoredCustomer = useSelector((state: IRootState) => state.dataStore.customer)

  const [districtIdList, setDistrictIdList] = useState<any>([])
  const [districtCurrentList, setDistrictCurrentList] = useState<any>([])
  const [districtWorkList, setDistrictWorkList] = useState<any>([])

  const [subDistrictIdList, setSubDistrictIdList] = useState<any>([])
  const [subDistrictCurrentList, setSubDistrictCurrentList] = useState<any>([])
  const [subDistrictWorkList, setSubDistrictWorkList] = useState<any>([])

  const [customerFormData, setCustomerFormData] = useState<any>({
    shop_credit_level: '',
    title: '',
    name: '',
    citizen_id: '',
    phone_number: '',
    phone_number_ref: '',
    line_id: '',
    facebook_id: '',
    email: '',
    citizen_image_url: '',
    address: '',
    id_province: 0,
    id_district: 0,
    id_subdistrict: 0,
    zip_code: '',

    current_address: '',
    current_id_province: 0,
    current_id_district: 0,
    current_id_subdistrict: 0,
    current_zip_code: '',

    work_address: '',
    work_id_province: 0,
    work_id_district: 0,
    work_id_subdistrict: 0,
    work_zip_code: '',

    tiktok_id: '',
    instagram_id: '',
    credit_level: '',
    approval_status: 'Approved',
    enabled_line_notify: false

  })

  const [customerFormUpload, setCustomerFormUpload] = useState<any>({
    citizen_id: '',
    name: '',
    address: '',
    subdistrict: '',
    district: '',
    province: '',
    zip_code: '',
  })

  const [citizenImageFile, setCitizenImageFile] = useState<any>([])
  const [verificationImageFile, setVerificationImageFile] = useState<any>([])

  const [isLoadding, setIsLoadding] = useState(false)
  const [actionModal, setActionModal] = useState(false)
  const [actionModal2, setActionModal2] = useState(false)
  const { mutate: fetchCustomerData, isLoading: isCustomerLoading } = useCustomerFindMutation({
    onSuccess: (res: any) => {
      const setFormValue = res.data
      getDistrict({ id: setFormValue?.id_province, type: 'id_province' })
      getSubDistrict({ id: setFormValue?.id_district, type: 'id_district' })
      getDistrict({ id: setFormValue?.current_id_province, type: 'current_id_province' })
      getSubDistrict({ id: setFormValue?.current_id_district, type: 'current_id_district' })
      getDistrict({ id: setFormValue?.work_id_province, type: 'work_id_province' })
      getSubDistrict({ id: setFormValue?.work_id_district, type: 'work_id_district' })
      setCustomerFormData(setFormValue)
      if (setFormValue?.citizen_image_url) {
        setCitizenImageFile([{ dataURL: setFormValue.citizen_image_url }])
      }
      if (setFormValue?.verification_image_url) {
        setVerificationImageFile([{ dataURL: setFormValue.verification_image_url }])
      }
    },
    onError: (err: any) => { },
  })

  useEffect(() => {
    fetchCustomerData({
      data: {
        id: id || dataStoredCustomer.id
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
      current_id_province: () => {
        getDistrict({ id: event.value, type: name })
        resetFields(['current_id_district', 'current_id_subdistrict'], [setDistrictCurrentList, setSubDistrictCurrentList])
      },
      work_id_province: () => {
        getDistrict({ id: event.value, type: name })
        resetFields(['work_id_district', 'work_id_subdistrict'], [setDistrictWorkList, setSubDistrictWorkList])
      },
      id_district: () => {
        getSubDistrict({ id: event.value, type: name })
        resetFields(['id_subdistrict'], [setSubDistrictIdList])
      },
      current_id_district: () => {
        getSubDistrict({ id: event.value, type: name })
        resetFields(['current_id_subdistrict'], [setSubDistrictCurrentList])
      },
      work_id_district: () => {
        getSubDistrict({ id: event.value, type: name })
        resetFields(['work_id_subdistrict'], [setSubDistrictWorkList])
      },
      id_subdistrict: () => {
        props.setFieldValue('zip_code', parseInt(event.zipCode))
      },
      current_id_subdistrict: () => {
        props.setFieldValue('current_zip_code', parseInt(event.zipCode))
      },
      work_id_subdistrict: () => {
        props.setFieldValue('work_zip_code', parseInt(event.zipCode))
      },
    }
    if (actions[name]) {
      actions[name]()
    }
  }

  const { mutateAsync: uploadOCR, isLoading: isOCRLoading } = useOCRMutation({
    onSuccess: (res: any) => {
      setCustomerFormUpload((prev: any) => ({ ...res.data, zip_code: parseInt(res.data?.zip_code) }))
      // getDistrict({ id: res.data?.id_province, type: 'id_province' })
      // getSubDistrict({ id: res.data?.id_district, type: 'id_district' })
      // setCustomerFormData((prev: any) => ({ ...prev, ...res.data, zip_code: parseInt(res.data?.zip_code) }))
    },
    onError: (error: any) => {
      toast.fire({
        icon: 'warning',
        title: t('cannot_read_citizen_id'),
        padding: '10px 20px',
      })
    }
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
        case 'current_id_province':
          setDistrictCurrentList(mapList)
          break
        case 'work_id_province':
          setDistrictWorkList(mapList)
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
        case 'current_id_district':
          setSubDistrictCurrentList(mapList)
          break
        case 'work_id_district':
          setSubDistrictWorkList(mapList)
          break
        default:
          break
      }
    },
    onError: (err: any) => { },
  })

  const { mutateAsync: uploadFile, isLoading: isUpload } = useUploadMutation({
    onSuccess: (res: any) => {
    },
    onError: (err: any) => {
    },
  })

  const { mutate: customerUpdate, isLoading } = useCustomerUpdateMutation({
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        setTimeout(() => {
           location.reload(); 
        }, 500);
       // navigate('/apps/customer/list')
      } else {
        toast.fire({
          icon: 'warning',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: shopUpdateCredit } = useGlobalMutation(url_api.shopUpdateCredit, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('save_credit_level_shop_success'),
          padding: '10px 20px',
        })
      } else {
        toast.fire({
          icon: 'warning',
          title: res.message,
          padding: '10px 20px',
        })
      }
    }
  })


  const { mutate: customerSearchProfile,isLoading:isLoadingProfile } = useGlobalMutation(url_api.customerSearchProfile, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
          setInstallmentsData(res?.data)
          setActionModal2(true)
      } else {
        toast.fire({
          icon: 'warning',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
    onError: (err: any) => {
      toast.fire({
          icon: 'warning',
          title: err.message,
          padding: '10px 20px',
        })
    }
    
  })

  const submitForm = useCallback(
    async (event: any) => {
      if (!isLoading) {
        const uploadPromises = []
        if (citizenImageFile[0]?.file) {
          uploadPromises.push(uploadFile({ data: { file: citizenImageFile[0].file, type: 'customer' } }))
        } else {
          if (event.citizen_image_url === '' || event.citizen_image_url === null) {
            toast.fire({
              icon: 'warning',
              title: t('citizen_id_not_found'),
              padding: '10px 20px',
            })
            return
          }
          uploadPromises.push(Promise.resolve({}))
        }
        if (verificationImageFile[0]?.file) {
          uploadPromises.push(uploadFile({ data: { file: verificationImageFile[0].file, type: 'customer' } }))
        } else {
          if (event.verification_image_url === '' || event.verification_image_url === null) {
            toast.fire({
              icon: 'warning',
              title: t('verification_image_not_found'),
              padding: '10px 20px',
            })
            return
          }
          uploadPromises.push(Promise.resolve({}))
        }
        let res1, res2
        if (uploadPromises.length > 0) {
          const results = await Promise.all(uploadPromises)
          res1 = results[0]
          res2 = results[1]
        }
        let customerParams = {
          data: {
            ...event,
            is_active: true,
          },
        }
        if (res1?.data?.file_name) {
          customerParams.data.citizen_image_url = res1?.data?.file_name
        }
        if (res2?.data?.file_name) {
          customerParams.data.verification_image_url = res2?.data?.file_name
        }
        if (customerParams.data.citizen_image_url.includes('http')) {
          delete customerParams.data.citizen_image_url
        }
        if (customerParams.data.verification_image_url.includes('http')) {
          delete customerParams.data.verification_image_url
        }
        customerUpdate(customerParams)
      }
    },
    [customerUpdate, citizenImageFile, verificationImageFile]
  )

  const handleCheck = async (props: FormikProps<Customer>, event: any) => {
    if (event) {
      getDistrict({ id: props.values.id_province, type: 'current_id_province' })
      getSubDistrict({ id: props.values.id_district, type: 'current_id_district' })
      props.setFieldValue('current_address', props.values.address)
      props.setFieldValue('current_id_province', props.values.id_province)
      props.setFieldValue('current_id_district', props.values.id_district)
      props.setFieldValue('current_id_subdistrict', props.values.id_subdistrict)
      props.setFieldValue('current_zip_code', props.values.zip_code)
    } else {
      props.setFieldValue('current_address', '')
      props.setFieldValue('current_id_province', null)
      props.setFieldValue('current_id_district', null)
      props.setFieldValue('current_id_subdistrict', null)
      props.setFieldValue('current_zip_code', '')
    }
  }

  const handleCheckForWork = async (props: FormikProps<Customer>, event: any) => {
    if (event) {
      getDistrict({ id: props.values.id_province, type: 'work_id_province' })
      getSubDistrict({ id: props.values.id_district, type: 'work_id_district' })
      props.setFieldValue('work_address', props.values.address)
      props.setFieldValue('work_id_province', props.values.id_province)
      props.setFieldValue('work_id_district', props.values.id_district)
      props.setFieldValue('work_id_subdistrict', props.values.id_subdistrict)
      props.setFieldValue('work_zip_code', props.values.zip_code)
    } else {
      props.setFieldValue('work_address', '')
      props.setFieldValue('work_id_province', null)
      props.setFieldValue('work_id_district', null)
      props.setFieldValue('work_id_subdistrict', null)
      props.setFieldValue('work_zip_code', '')
    }
  }

  const onImgChange = async (imageList: ImageListType) => {
    const resizedImages = await resizeImage(imageList)
    setCitizenImageFile(resizedImages)
    // await uploadOCR({ data: { image: resizedImages[0].file } })
  }

  const onImgAnalisy = async () => {
    setIsLoadding(true)
    await uploadOCR({
      data: {
        image: citizenImageFile[0].file
      }
    })
    setIsLoadding(false)
    setActionModal(true)
  }

  const onConfirmDataUpload = () => {
    getDistrict({ id: customerFormUpload?.id_province, type: 'id_province' })
    getSubDistrict({ id: customerFormUpload?.id_district, type: 'id_district' })
    setCustomerFormData((prev: any) => ({ ...prev, ...customerFormUpload, ...(isNaN(customerFormUpload?.zip_code) && { zip_code: ' ' }), citizen_id: prev.citizen_id }))
    setActionModal(false)
  }

  const onImgChange2 = async (imageList: ImageListType) => {
    const resizedImages = await resizeImage(imageList)
    setVerificationImageFile(resizedImages)
  }

  const SubmittedForm = Yup.object().shape({
    title: Yup.string().required(t('please_fill_all_fields')),
    name: Yup.string().required(t('please_fill_all_fields')),
    phone_number: Yup.string().length(10, t('phone_10_digits')),
    citizen_id: Yup.string().required(t('please_fill_all_fields')).length(13, t('citizen_id_13_digits')),
    email: Yup.string().required(t('please_fill_all_fields')).matches(/^[A-Za-z0-9@._]+$/,t('email_english_only')).email(t('invalid_email')),
    address: Yup.string().required(t('please_fill_all_fields')),
    id_province: Yup.string().nullable().required(t('please_fill_all_fields')),
    id_district: Yup.string().nullable().required(t('please_fill_all_fields')),
    id_subdistrict: Yup.string().nullable().required(t('please_fill_all_fields')),
    current_address: Yup.string().nullable().required(t('please_fill_all_fields')),
    current_id_province: Yup.string().nullable().required(t('please_fill_all_fields')),
    current_id_district: Yup.string().nullable().required(t('please_fill_all_fields')),
    current_id_subdistrict: Yup.string().nullable().required(t('please_fill_all_fields')),
    work_address: Yup.string().nullable().required(t('please_fill_all_fields')),
    work_id_province: Yup.string().nullable().required(t('please_fill_all_fields')),
    work_id_district: Yup.string().nullable().required(t('please_fill_all_fields')),
    work_id_subdistrict: Yup.string().nullable().required(t('please_fill_all_fields')),
    // credit_level: Yup.string().nullable().required(t('please_fill_all_fields')),
  })

  const personalContent = (props: any) => {
    return (
      <div className="md:col-span-1 xl:col-span-3 mr-6">
        <div className="input-flex-row">
          <div className="check-container">
            <InputField
              label={t('citizen_id_label')}
              name="citizen_id"
              type="text"
              disabled={pageAction}
              onKeyPress={(e: any) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault()
                }
              }}
              maxLength={13}
            />
          </div>
        </div>
        <hr className="mt-4"></hr>
        <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">
          {t('personal_information')}
        </div>
        <div className="input-flex-row">
          <SelectField
            require={true}
            label={t('title')}
            id="title"
            name="title"
            options={thaiTitles}
            placeholder={t('please_select')}
            onChange={(e: any) => handleChangeSelect(props, e, 'title')}
            isSearchable={false}
            disabled={pageAction}
          />
          <InputField
            require={true}
            label={t('name_surname')}
            name="name"
            type="text"
            disabled={pageAction}
          />
        </div>
        <div className="input-flex-row">
          <InputField
            require={true}
            label={t('phone_contact')}
            name="phone_number"
            type="text"
            maxLength={10}
            onKeyPress={(e: any) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault()
              }
            }}
            disabled={pageAction}
          />
          <InputField
            require={true}
            label={t('phone_reference')}
            name="phone_number_ref"
            type="text"
            maxLength={10}
            onKeyPress={(e: any) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault()
              }
            }}
            disabled={pageAction}
          />
        </div>
        <div className="input-flex-row">
          <InputField
            label={t('facebook_id')}
            name="facebook_id"
            type="text"
            disabled={pageAction}
          />
          <InputField
            label={t('line_id')}
            name="line_id"
            type="text"
            disabled={pageAction}
          />
        </div>
        <div className="input-flex-row">
          <InputField
            label={t('tiktok_id')}
            name="tiktok_id"
            type="text"
            disabled={pageAction}
          />
          <InputField
            label={t('instagram_id')}
            name="instagram_id"
            type="text"
            disabled={pageAction}
          />
        </div>
        <div className="input-flex-row">
          <InputField
            require={true}
            label={t('email')}
            name="email"
            type="text"
            disabled={pageAction}
          />
          <div className="blank-container"></div>
        </div>
        <br />
        <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">
          {t('address_information')}
        </div>
        {addressContent(props)}
        <br />
        {
          role != 'shop' && (<div className="input-flex-row">
            {/* <SelectField
              require={true}
              label={t('credit_level_admin')}
              id="credit_level"
              name="credit_level"
              options={creditLevelTypes}
              placeholder={t('please_select')}
              isSearchable={true}
              disabled={pageAction}
            /> */}
            <SelectField
              require={true}
              label={t('receive_installment_notification')}
              id="enabled_line_notify"
              name="enabled_line_notify"
              options={[{ label: t('open'), value: true }, { label: t('close'), value: false }]}
              placeholder={t('please_select')}
              isSearchable={true}
              disabled={pageAction}
            />
            {/* <div className="blank-container"></div> */}
          </div>)
        }
        {
          role == 'shop' && (<div className="input-flex-row">
            <SelectField
              require={true}
              label={t('credit_level_shop')}
              id="shop_credit_level"
              name="shop_credit_level"
              options={creditLevelTypes}
              placeholder={t('please_select')}
              isSearchable={true}
            />
            <div className="blank-container"></div>
          </div>)
        }
      </div>
    )
  }

  const addressContent = (props: any) => {
    return (
      <>
        <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
          <div className=" border-white-light dark:border-[#1b2e4b] p-5 pt-0">
            <span className="bg-white dark:bg-black dark:text-white-light w-[15svw] h-[20px] lg:w-[10vw] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px] ">
              {t('id_card_address')}
            </span>
          </div>
          <div className="px-5 pb-5">
            <div className="input-flex-row">
              <InputField
                require={true}
                label={t('address_label')}
                name="address"
                rows="1"
                disabled={pageAction}
                onChange={(e: any) => {
                  props.setFieldValue('address', e.target.value)
                  props.setFieldValue('copyAddress', false)
                  props.setFieldValue('copyAddressForWork', false)
                }}
              />
            </div>
            <div className="input-flex-row">
              <SelectField
                require={true}
                label={t('province')}
                id="id_province"
                name="id_province"
                options={dataStoredProvinces}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  handleChangeSelect(props, e, 'id_province')
                  props.setFieldValue('copyAddress', false)
                  props.setFieldValue('copyAddressForWork', false)
                }}
                isSearchable={false}
                disabled={pageAction}
              />
              <SelectField
                require={true}
                label={t('district_label')}
                id="id_district"
                name="id_district"
                options={districtIdList}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  handleChangeSelect(props, e, 'id_district')
                  props.setFieldValue('copyAddress', false)
                  props.setFieldValue('copyAddressForWork', false)
                }}
                isSearchable={false}
                disabled={districtIdList.length === 0 || pageAction}
              />
            </div>
            <div className="input-flex-row">
              <SelectField
                require={true}
                label={t('subdistrict_label')}
                id="id_subdistrict"
                name="id_subdistrict"
                options={subDistrictIdList}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  handleChangeSelect(props, e, 'id_subdistrict')
                  props.setFieldValue('copyAddress', false)
                  props.setFieldValue('copyAddressForWork', false)
                }}
                isSearchable={false}
                disabled={subDistrictIdList.length === 0 || pageAction}
              />
              <InputField
                label={t('zip_code')}
                name="zip_code"
                rows="1"
                disabled={true}
              />
            </div>
          </div>
        </div>
       <label className="flex cursor-pointer items-center">
          {/* <Checkbox
            name="copyAddress"
            label={t('same_as_id_card')}
            onCheck={(e: any) => handleCheck(props, e)}
            disabled={pageAction}
          /> */}
          <br />
        </label> 
        <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
          <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0">
            <span className="bg-white dark:bg-black  dark:text-white-light w-[15svw] h-[20px] lg:w-[8vw] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px] ">
              {t('current_address')}
            </span>
          </div>
          <div className="px-5 pb-5">
            <div className="input-flex-row">
              <InputField
                require={true}
                label={t('address_label')}
                name="current_address"
                rows="1"
                disabled={pageAction}
                onChange={(e: any) => {
                  props.setFieldValue('copyAddress', false)
                  props.setFieldValue('current_address', e.target.value)
                }}
              />
            </div>
            <div className="input-flex-row">
              <SelectField
                require={true}
                label={t('province')}
                id="current_id_province"
                name="current_id_province"
                options={dataStoredProvinces}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  handleChangeSelect(props, e, 'current_id_province')
                  props.setFieldValue('copyAddress', false)
                }}
                isSearchable={false}
                disabled={pageAction}
              />
              <SelectField
                require={true}
                label={t('district_label')}
                id="current_id_district"
                name="current_id_district"
                options={districtCurrentList}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  handleChangeSelect(props, e, 'current_id_district')
                  props.setFieldValue('copyAddress', false)
                }}
                isSearchable={false}
                disabled={districtCurrentList.length === 0 || pageAction}
              />
            </div>
            <div className="input-flex-row">
              <SelectField
                require={true}
                label={t('subdistrict_label')}
                id="current_id_subdistrict"
                name="current_id_subdistrict"
                options={subDistrictCurrentList}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  handleChangeSelect(props, e, 'current_id_subdistrict')
                  props.setFieldValue('copyAddress', false)
                }}
                isSearchable={false}
                disabled={subDistrictCurrentList.length === 0 || pageAction}
              />
              <InputField
                label={t('zip_code')}
                name="current_zip_code"
                rows="1"
                disabled={true}
              />
            </div>
          </div>
        </div>
        <label className="flex cursor-pointer items-center">
          {/* <Checkbox
            name="copyAddressForWork"
            label={t('same_as_id_card')}
            onCheck={(e: any) => handleCheckForWork(props, e)}
            disabled={pageAction}
          /> */ }
          <br />
        </label>
        <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
          <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0">
            <span className="bg-white dark:bg-black  dark:text-white-light w-[15svw] h-[20px] lg:w-[8vw] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px] ">
              {t('work_address')}
            </span>
          </div>
          <div className="px-5 pb-5">
            <div className="input-flex-row">
              <InputField
                require={true}
                label={t('address_label')}
                name="work_address"
                rows="1"
                disabled={pageAction}
                onChange={(e: any) => {
                  props.setFieldValue('copyAddressForWork', false)
                  props.setFieldValue('work_address', e.target.value)
                }}
              />
            </div>
            <div className="input-flex-row">
              <SelectField
                require={true}
                label={t('province')}
                id="work_id_province"
                name="work_id_province"
                options={dataStoredProvinces}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  handleChangeSelect(props, e, 'work_id_province')
                  props.setFieldValue('copyAddressForWork', false)
                }}
                isSearchable={false}
                disabled={pageAction}
              />
              <SelectField
                require={true}
                label={t('district_label')}
                id="work_id_district"
                name="work_id_district"
                options={districtWorkList}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  props.setFieldValue('copyAddressForWork', false)
                  handleChangeSelect(props, e, 'work_id_district')
                }}
                isSearchable={false}
                disabled={districtWorkList.length === 0 || pageAction}
              />
            </div>
            <div className="input-flex-row">
              <SelectField
                require={true}
                label={t('subdistrict_label')}
                id="work_id_subdistrict"
                name="work_id_subdistrict"
                options={subDistrictWorkList}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  props.setFieldValue('copyAddressForWork', false)
                  handleChangeSelect(props, e, 'work_id_subdistrict')
                }}
                isSearchable={false}
                disabled={subDistrictWorkList.length === 0 || pageAction}
              />
              <InputField
                label={t('zip_code')}
                name="work_zip_code"
                rows="1"
                disabled={true}
              />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (isCustomerLoading) return <div>Loading...</div>

  const uploadContent = () => {
    return (
      <div className="md:col-span-1 xl:col-span-1 pt-5">
        <div className="upload-container">
          <div className="custom-file-container" data-upload-id="myFirstImage">
            <div className="label-container">
              <label>{t('citizen_image')} <span className="text-rose-600">*</span></label>
              {!pageAction && (
                <button
                  type="button"
                  className="custom-file-container__image-clear"
                  title="Clear Image"
                  onClick={() => {
                    setCitizenImageFile([])
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <label className="custom-file-container__custom-file hidden"></label>
            <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" />
            <input type="hidden" name="MAX_FILE_SIZE1" value="10485760" />
            <ImageUploading value={citizenImageFile} onChange={onImgChange}>
              {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                <div className="upload__image-wrapper">
                  {!pageAction && (
                    <>
                      <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                      {t('select_file')}
                      </button>
                      <div style={{ textAlign: 'right' }}>
                          <button type="button" className="btn btn-primary" onClick={() => setIsCameraOcr(true)} style={{ display: 'inline-block' }}>
                            {t('take_photo')}
                          </button>
                        </div>
                    </>
                    
                  )}
                  &nbsp;
                  {imageList.map((image, index) => (
                    <div key={index} className="custom-file-container__image-preview relative">
                      <img src={image.dataURL} alt="img" className={!pageAction ? 'm-auto mt-10' : 'm-auto'} />
                    </div>
                  ))}
                  {!pageAction && imageList.length > 0 && <button type="button" className="btn btn-success mt-2 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" onClick={onImgAnalisy}>
                    {t('verify_citizen_id')}
                  </button>}
                </div>
              )}
            </ImageUploading>

            {/* {citizenImageFile.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''} */}
          </div>
        </div>
        <div className="upload-container mt-10">
          <div className="custom-file-container" data-upload-id="myFirstImage">
            <div className="label-container">
              <label>{t('verification_image')} <span className="text-rose-600">*</span></label>
              {!pageAction && (
                <button
                  type="button"
                  className="custom-file-container__image-clear"
                  title="Clear Image"
                  onClick={() => {
                    setVerificationImageFile([])
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <label className="custom-file-container__custom-file hidden"></label>
            <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" />
            <input type="hidden" name="MAX_FILE_SIZE2" value="10485760" />
            <ImageUploading value={verificationImageFile} onChange={onImgChange2}>
              {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                <div className="upload__image-wrapper">
                  {!pageAction && (
                    <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                      {t('select_file')}
                    </button>
                  )}
                  &nbsp;
                  {imageList.map((image, index) => (
                    <div key={index} className="custom-file-container__image-preview relative">
                      <img src={image.dataURL} alt="img" className={!pageAction ? 'm-auto mt-10' : 'm-auto'} />
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>
            {/* {verificationImageFile.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''} */}
          </div>
        </div>
      </div>
    )
  }

  const goEdit = () => {
    dispatch(setPageAction('edit'))
    setTabIndex(0)
  }

  const goCreditProcess = () => {
    navigate('/apps/customer/credit/' + id)
  }

   const checkProfile = () => {
    customerSearchProfile({data:{uuid:id}})
  }

  return (
    <>
     {isCameraOcr ? <CameraOCR onSubmit={handleCameraSubmit} onClose={() => setIsCameraOcr(false)}/> :  
      <div className="flex flex-col gap-2.5">
        {isOCRLoading || isLoadingProfile && <PreLoading />}
        <div className="flex items-center justify-between flex-wrap">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex">
          {
            (pageAction && role !== 'shop') && (
              <>
                <a className="cursor-pointer btn btn-warning mr-1" onClick={() => checkProfile()}>
                   {t('check_credit')}
                </a>

                <a className="cursor-pointer btn btn-primary mr-1" onClick={() => goCreditProcess()}>
                  <IconEdit className="w-4.5 h-4.5" /> &nbsp;
                  {t('contracts_in_progress')}
                </a>
                <a className="cursor-pointer btn btn-info mr-1" onClick={() => goEdit()}>
                  <IconEdit className="w-4.5 h-4.5" /> &nbsp;
                  {t('edit')}
                </a>
              </>
            )
          }

            {
            (pageAction && role === 'shop') && (
              <>
                <a className="hover:text-info cursor-pointer btn btn-primary mr-1" onClick={() => goCreditProcess()}>
                  <IconEdit className="w-4.5 h-4.5" /> &nbsp;
                  {t('contracts_in_progress')}
                </a>
              </>
            )
          }
        </div>
        </div>
        <div>
        <Tab.Group selectedIndex={tabIndex}>
          <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a] bg-white">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button onClick={() => setTabIndex(0)} className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  {t('customer_account')}
                </button>
              )}
            </Tab>
            {role !== 'shop' && <Tab as={Fragment}>
              {({ selected }) => (
                <button onClick={() => setTabIndex(1)} className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  {t('customer_credit_tab')}
                </button>
              )}
            </Tab>}
            {role !== 'shop' && 
            <Tab as={Fragment}>
              {({ selected }) => (
                <button onClick={() => setTabIndex(2)} className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  {t('notes_tab')}
                </button>
              )}
            </Tab>
            }
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="panel px-6 flex-1 py-6 rtl:xl:ml-6">
                <Formik initialValues={customerFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                  {(props) => (
                    <Form className="space-y-5 dark:text-white custom-select">
                      <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        {t('customer_account')}
                      </div>
                      <div className="grid md:grid-rows-1 xl:grid-cols-4 gap-2 pb-5">
                        {personalContent(props)}
                        {uploadContent()}
                      </div>
                      {!pageAction && (
                        <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                          {(isUpload || isLoading) && <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>}
                          {pageAction ? t('info') : t('edit')}
                        </button>
                      )}
                      {
                        role == 'shop' && (<button className="btn !mt-6 w-full border-0 btn-primary" type="button" onClick={() => {
                          shopUpdateCredit({
                            data: {
                              shop_credit_level: props.values.shop_credit_level,
                              id_customer: customerFormData.uuid
                            }
                          })
                        }}>
                          {(isUpload || isLoading) && <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>}
                          {t('edit_credit_level_shop')}
                        </button>)
                      }
                    </Form>
                  )}
                </Formik>
              </div>
              <Transition appear show={actionModal} as={Fragment}>
                <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
                  <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                  </Transition.Child>
                  <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                      <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" >
                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                          <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                            <IconX />
                          </button>
                          <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                            {t('citizen_id_data')}
                          </div>
                          <div className="px-5 pt-3 pb-5">
                            <div className="flex flex-wrap justify-start">
                              <div className="w-full">
                                <p>
                                  {t('citizen_id_label')}:
                                  {customerFormUpload?.citizen_id}
                                </p>
                              </div>
                              <div className="w-full">
                                <p>
                                  {t('name_surname_label')}: {customerFormUpload.name?.trim()}
                                </p>
                              </div>
                              <div className="w-full">
                                <p>
                                  {customerFormUpload?.address ? `${t('address_detail')}: ${customerFormUpload?.address} ` : ' '}
                                  {customerFormUpload?.subdistrict ? `${t('subdistrict_label')}${customerFormUpload?.subdistrict} ` : ' '}
                                  {customerFormUpload?.district ? `${t('district_label')}${customerFormUpload?.district} ` : ' '}
                                  {customerFormUpload?.province ? `${t('province')}${customerFormUpload?.province} ` : ' '}
                                  {isNaN(customerFormUpload?.zip_code) ? ' ' : customerFormUpload?.zip_code}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end items-center mt-8">
                              <button type="button" className="btn btn-outline-danger" onClick={() => {
                                setActionModal(false)
                              }}>
                                {t('cancel')}
                              </button>
                              <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={onConfirmDataUpload}>
                                {t('confirm')}
                              </button>
                            </div>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition>
            </Tab.Panel>
            <Tab.Panel>
              <List />
            </Tab.Panel>
            <Tab.Panel>
              <ListNoteCustomer />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        </div>


          <Transition appear show={actionModal2} as={Fragment}>
              <Dialog as="div" open={actionModal2} onClose={() => setActionModal2(false)} className="relative z-[51]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center px-4 py-8">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" >
                      <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                        <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                          <IconX />
                        </button>
                        <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                          {t('credit_info')}
                        </div>
                        <div className="px-5 pt-3 pb-5 space-y-2">
                        {installmentsData.length === 0 ? (
                          <p>{t('no_installment_data')}</p>
                        ) : (
                          installmentsData.map((item:any, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 border rounded-md bg-[#f9f9f9] dark:bg-[#1e2a3a]"
                            >
                              <div>
                                <p className="font-medium">{item?.shopName}</p>
                              </div>
                              <span className="text-sm font-semibold ">
                                {item?.display}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
    

      </div>
     }
   </>
    
  )

}

export default Edit