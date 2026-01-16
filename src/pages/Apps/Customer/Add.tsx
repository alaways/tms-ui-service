import { useEffect, useState, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { resizeImage } from '../../../helpers/helpFunction'
import { thaiTitles, toastAlert } from '../../../helpers/constant'
import { Customer, Shop } from '../../../types/index'
import { useDistrictMutation, useSubDistrictMutation } from '../../../services/mutations/useProvincesMutation'
import { useUploadMutation, useOCRMutation } from '../../../services/mutations/useUploadMutation'
import { Form, Formik, FormikProps } from 'formik'
import { Dialog, Transition } from '@headlessui/react'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import InputField from '../../../components/HOC/InputField'
import Checkbox from '../../../components/HOC/CheckboxField'
import SelectField from '../../../components/HOC/SelectField'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import PreLoading from '../../../helpers/preLoading'
import IconX from '../../../components/Icon/IconX'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'admin'

const Add = () => {
  const { t } = useTranslation()
  const acc = JSON.parse(localStorage.getItem(mode) ?? '{}')?.acc
  const toast = Swal.mixin(toastAlert)
  const creditLevelTypes = useSelector((state: IRootState) => state.dataStore.credit_level)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const breadcrumbItems = [
    { to: '/apps/customer/list', label: t('customer') },
    { label: t('add'), isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle(t('add_customer')))
  })

  const storedUser = localStorage.getItem(mode)

  const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null
  const role = storedUser ? JSON.parse(storedUser).role : null

  const dataStoredProvinces = useSelector((state: IRootState) => state.dataStore.provinces)

  const [districtIdList, setDistrictIdList] = useState<any>([])
  const [districtCurrentList, setDistrictCurrentList] = useState<any>([])
  const [districtWorkList, setDistrictWorkList] = useState<any>([])

  const [subDistrictIdList, setSubDistrictIdList] = useState<any>([])
  const [subDistrictCurrentList, setSubDistrictCurrentList] = useState<any>([])
  const [subDistrictWorkList, setSubDistrictWorkList] = useState<any>([])

  const [shopListData, setShopListData] = useState<Shop[]>([])
  const [isFoundCitizen, setIsFoundCitizen] = useState<number>(0)

  const [isLoadding, setIsLoadding] = useState(false)
  const [actionModal, setActionModal] = useState(false)
  const [lockZipCode, setLockZipCode] = useState(true)
  const [citizenId, setCitizenId] = useState('')

  if (!acc) {
    navigate('/apps/customer/list')
  }

  const [customerFormData, setCustomerFormData] = useState<any>({
    title: '',
    name: '',
    citizen_id: '',
    phone_number: '',
    phone_number_ref: '',
    id_shop: id_shop,
    line_id: '',
    facebook_id: '',
    email: '',
    citizen_image_url: '',
    address: '',
    id_province: 0,
    province: '',
    id_district: 0,
    district: '',
    id_subdistrict: 0,
    subdistrict: '',
    zip_code: '',
    tiktok_id: '',
    instagram_id: '',

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

    credit_level: '',
    approval_status: 'Approved',
    copyAddress: false,

  })

  const [citizenImageFile, setCitizenImageFile] = useState<any>([])
  const [verificationImageFile, setVerificationImageFile] = useState<any>([])

  const handleSearch = (props: any, event: any, name: any) => {
    fetchShopData({ data: { query: event } })
  }

  const { mutate: fetchShopData } = useGlobalMutation(url_api.shopSearchContains, {
        onSuccess: (res: any) => {
          setShopListData(
            res.data.map((item: any) => ({
              value: item.id,
              label: item.name,
            }))
          )
        },
        onError: (err: any) => {
          toast.fire({
            icon: 'error',
            title: err.massage,
            padding: '10px 20px',
          })
      }
  })

  useEffect(() => {
    fetchShopData({
      data: {
        page: 1,
        pageSize: -1
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
      setCitizenId(res.data.citizen_id)
      setCustomerFormData((prev: any) => ({
        ...prev,
        // citizen_id: res?.data?.citizen_id ? res?.data?.citizen_id : customerFormData.citizen_id,
        citizen_id:  customerFormData.citizen_id,
        name: res.data.name,
        address: res.data.address,
        subdistrict: res.data.subdistrict,
        district: res.data.district,
        province: res.data.province,
        id_district: res.data.id_district,
        id_subdistrict: res.data.id_subdistrict,
        id_province: res.data.id_province,
        zip_code: res.data?.zip_code ? parseInt(res.data?.zip_code) : '',
      }))
      getDistrict({
        id: res.data?.id_province,
        type: 'id_province',
      })
      getSubDistrict({
        id: res.data?.id_district,
        type: 'id_district',
      })
      if (!res.data?.zip_code) {
        setLockZipCode(false)
      }

    },
    onError: (error: any) => {
      setIsLoadding(false)
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

  const { mutate: shopUpdateCredit } = useGlobalMutation(url_api.shopUpdateCredit, {
    onSuccess: () => {
      toast.fire({
        icon: 'success',
        title: t('save_success'),
        padding: '10px 20px',
      })
      navigate('/apps/customer/list')
    }
  })

  const { mutate: shopCustomerCreate, isLoading } = useGlobalMutation(url_api.shopCustomerCreate, {
    onSuccess: (res: any, variables: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        if (role === "shop") {
          shopUpdateCredit({
            data: {
              shop_credit_level: variables.data.shop_credit_level,
              id_customer: variables.data.uuid_customer
            }
          })
        } else {
          toast.fire({
            icon: 'success',
            title: t('save_success'),
            padding: '10px 20px',
          })
          navigate('/apps/customer/list')
        }
      } else {
        toast.fire({
          icon: 'warning',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })


  const { mutate: customerCreate ,isLoading: isLoadingCreate} = useGlobalMutation(url_api.customerCreate, {
    onSuccess: (res: any, variables: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        shopCustomerCreate({ data: { id_shop: variables.data.id_shop, id_customer: res.data.id, shop_credit_level: variables.data.shop_credit_level, uuid_customer: res.data.uuid } })
      } else {
        toast.fire({
          icon: 'warning',
          title: res.message,
          padding: '10px 20px',
        })

      }
    },
    onError: (err: any) => { },
  })

  const submitForm = useCallback(
    async (event: any) => {
      if (!isLoading && !isLoadingCreate) {
        if (isFoundCitizen === 2) {
          shopCustomerCreate({ data: {id_shop: event.id_shop, id_customer: event.id } })
        } else {
          const uploadPromises = []
          if (citizenImageFile[0]?.file) {
            uploadPromises.push(uploadFile({ data: { file: citizenImageFile[0].file, type: 'customer' } }))
          } else {
            uploadPromises.push(Promise.resolve({}))
          }
          if (verificationImageFile[0]?.file) {
            uploadPromises.push(uploadFile({ data: { file: verificationImageFile[0].file, type: 'customer' } }))
          } else {
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
              citizen_image_url: res1?.data?.file_name || '',
              verification_image_url: res2?.data?.file_name || '',
            },
          }
          if (customerParams.data.citizen_image_url === '' || customerParams.data.citizen_image_url === null) {
            toast.fire({
              icon: 'warning',
              title: t('citizen_id_not_found'),
              padding: '10px 20px',
            })
            return
          }
          if (customerParams.data.verification_image_url === '' || customerParams.data.verification_image_url === null) {
            toast.fire({
              icon: 'warning',
              title: t('verification_image_not_found'),
              padding: '10px 20px',
            })
            return
          }
          customerCreate(customerParams)
        }
      }
    },
    [customerCreate, citizenImageFile, verificationImageFile, isFoundCitizen]
  )

  const { mutate: citizenIdSearch} = useGlobalMutation(url_api.customerSearch, {
    onSuccess: (res: any, variables: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        const setFormValue = res?.data
        if (setFormValue) {
          setIsFoundCitizen(2)
          getDistrict({ id: setFormValue?.id_province, type: 'id_province' })
          getSubDistrict({ id: setFormValue?.id_district, type: 'id_district' })
          getDistrict({ id: setFormValue?.current_id_province, type: 'current_id_province' })
          getSubDistrict({ id: setFormValue?.current_id_district, type: 'current_id_district' })
          getDistrict({ id: setFormValue?.work_id_province, type: 'work_id_province' })
          getSubDistrict({ id: setFormValue?.work_id_district, type: 'work_id_district' })
          setCustomerFormData((prev: any) => ({ ...prev, ...setFormValue }))
          variables.props.setValues(setFormValue)
          if (setFormValue?.citizen_image_url) {
            setCitizenImageFile([{ dataURL: setFormValue.citizen_image_url }])
          }
          if (setFormValue?.verification_image_url) {
            setVerificationImageFile([{ dataURL: setFormValue.verification_image_url }])
          }
        }
      } else {
        setIsFoundCitizen(1)
        setCitizenImageFile([])
        setVerificationImageFile([])
        setCustomerFormData((prev: any) => ({
          ...prev,
          title: '',
          name: '',
          phone_number: '',
          phone_number_ref: '',
          line_id: '',
          facebook_id: '',
          email: '',
          tiktok_id: '',
          instagram_id: '',
          address: '',
          id_province: 0,
          province: '',
          id_district: 0,
          district: '',
          id_subdistrict: 0,
          subdistrict: '',
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
        }))
      }
    },
  })

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
    const resizedImages: any = await resizeImage(imageList)
    setCitizenImageFile(resizedImages)
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

  const onImgChange2 = async (imageList: ImageListType) => {
    const resizedImages = await resizeImage(imageList)
    setVerificationImageFile(resizedImages)
  }

  const SubmittedForm = Yup.object().shape({
    title: Yup.string().required(t('please_fill_all_fields')),
    name: Yup.string().required(t('please_fill_all_fields')),
    phone_number: Yup.string().length(10, t('phone_10_digits')),
    id_shop: Yup.string().required(t('please_fill_all_fields')),
    citizen_id: Yup.string().required(t('please_fill_all_fields')).length(13, t('citizen_id_13_digits')),
    email: Yup.string().required(t('please_fill_all_fields')).matches(/^[A-Za-z0-9@._]+$/,t('email_english_only')).email(t('invalid_email')),
    address: Yup.string().required(t('please_fill_all_fields')),
    id_province: Yup.string().nullable().required(t('please_fill_all_fields')),
    id_district: Yup.string().nullable().required(t('please_fill_all_fields')),
    id_subdistrict: Yup.string().nullable().required(t('please_fill_all_fields')),
    current_address: Yup.string().required(t('please_fill_all_fields')),
    current_id_province: Yup.string().nullable().required(t('please_fill_all_fields')),
    current_id_district: Yup.string().nullable().required(t('please_fill_all_fields')),
    current_id_subdistrict: Yup.string().nullable().required(t('please_fill_all_fields')),
    work_address: Yup.string().required(t('please_fill_all_fields')),
    work_id_province: Yup.string().nullable().required(t('please_fill_all_fields')),
    work_id_district: Yup.string().nullable().required(t('please_fill_all_fields')),
    work_id_subdistrict: Yup.string().nullable().required(t('please_fill_all_fields')),
    // ...(role == 'admin' && {
    //   credit_level: Yup.string().nullable().required(t('please_fill_all_fields')),
    // })
  })

  const SubmittedFormCitizen = Yup.object().shape({
    id_shop: Yup.string().required(t('please_fill_all_fields')),
  })

  const personalContent = (props: any) => {
    return (
      <div className="md:col-span-1 xl:col-span-6 ">
        <div className="input-flex-row">
          <div className="check-container">
            <InputField
              require={true}
              label={t('citizen_id_label')}
              name="citizen_id"
              type="text"
              maxLength={13}
              onKeyUp={(e: any) => {
                setCustomerFormData((prev: any) => ({
                  ...prev,
                  citizen_id: e.target.value
                })) 
              }}
              onKeyPress={(e: any) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (props.values.citizen_id?.length === 13) {
                    citizenIdSearch({
                      data: { citizen_id: props.values.citizen_id?.toString() },
                      props,
                    })
                  } else {
                    toast.fire({
                      icon: 'error',
                      title: t('citizen_id_search_required'),
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
                if (props.values.citizen_id?.length === 13) {
                  citizenIdSearch({ data: { citizen_id: props.values.citizen_id?.toString() }, props })
                } else {
                  toast.fire({
                    icon: 'error',
                    title: t('citizen_id_search_required'),
                    padding: '10px 20px',
                  })
                }
              }}
            >
              {t('check')}
            </button>
            {/* <p className="mt-4 text-[11px] text-white-dark">หากพบจะแสดงบัญชีลูกค้า หากไม่พบจะแสดงแบบฟอร์มให้สร้างบัญชีลูกค้าใหม่ได้</p> */}
          </div>
        </div>
        {
          isFoundCitizen === 1 || isFoundCitizen === 2 ? (
            <div className="input-flex-row pb-10">
              <div className="upload-container w-full pb-3">
                <div className="custom-file-container" data-upload-id="myFirstImage">
                  <div className="label-container">
                    <label>{t('citizen_image')} <span className="text-rose-600">*</span></label>
                    {isFoundCitizen === 1 && (
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
                      <>
                        <div className="upload__image-wrapper">
                          {isFoundCitizen === 1 && (
                            <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                              {t('select_file')}
                            </button>
                          )}
                          {imageList.map((image, index) => (
                            <div key={index} className="custom-file-container__image-preview relative pt-10 pb-10">
                              <img src={image.dataURL} alt="img" className={isFoundCitizen === 1 ? 'm-auto mt-10' : 'm-auto'} />
                            </div>
                          ))}
                        </div>
                        {
                          isFoundCitizen !== 2 && imageList.length > 0 && (
                            <button type="button" className="btn btn-success mt-2 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" onClick={onImgAnalisy}>
                              {t('verify_citizen_id')}
                            </button>
                          )
                        }
                      </>
                    )}
                  </ImageUploading>
                </div>
              </div>
            </div>
          ) : ''
        }
        {
          isFoundCitizen === 1 || isFoundCitizen === 2 ? (
            <>
              <hr className="mt-4"></hr>
              <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">
                {t('personal_information')}
              </div>
              {!id_shop && (
                <div className="input-flex-row">
                  <SelectField
                    require={true}
                    label={t('shop')}
                    id="id_shop"
                    name="id_shop"
                    isSearchable={true}
                    options={shopListData}
                    onInputChange={(event: any) => handleSearch(props, event, 'id_shop')}
                    handleOnMenuOpen={() => {
                      fetchShopData({
                        data: {
                          query: '',
                        },
                      });
                    }}
                  />
                </div>
              )}
              <div className="input-flex-row">
                <SelectField
                  require={true}
                  label={t('title')}
                  id="title"
                  name="title"
                  options={thaiTitles}
                  placeholder={t('please_select')}
                  isSearchable={true}
                  disabled={isFoundCitizen === 2}
                />
                <InputField
                  require={true}
                  label={t('name_surname')}
                  name="name"
                  type="text"
                  disabled={isFoundCitizen === 2}
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
                  disabled={isFoundCitizen === 2}
                />
                <InputField
                  label={t('phone_reference')}
                  name="phone_number_ref"
                  type="text"
                  maxLength={10}
                  onKeyPress={(e: any) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  disabled={isFoundCitizen === 2}
                />
              </div>
              <div className="input-flex-row">
                <InputField
                  label={t('facebook_id')}
                  name="facebook_id"
                  type="text"
                  disabled={isFoundCitizen === 2}
                />
                <InputField
                  label={t('line_id')}
                  name="line_id"
                  type="text"
                  disabled={isFoundCitizen === 2}
                />
              </div>
              <div className="input-flex-row">
                <InputField
                  label={t('tiktok_id')}
                  name="tiktok_id"
                  type="text"
                  disabled={isFoundCitizen === 2}
                />
                <InputField
                  label={t('instagram_id')}
                  name="instagram_id"
                  type="text"
                  disabled={isFoundCitizen === 2}
                />
              </div>
              <div className="input-flex-row">
                <InputField
                  require={true}
                  label={t('email')}
                  name="email"
                  type="text"
                  disabled={isFoundCitizen === 2}
                />
                <div className="blank-container"></div>
              </div>
              <br />
              <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">
                {t('address_information')}
              </div>
              {addressContent(props)}
              {/* {
                role != 'shop' && (<div className="input-flex-row">
                  <SelectField
                    require={true}
                    label={t('credit_level_admin')}
                    id="credit_level"
                    name="credit_level"
                    options={creditLevelTypes}
                    placeholder={t('please_select')}
                    isSearchable={true}
                    disabled={isFoundCitizen === 2}
                  />
                  <div className="blank-container"></div>
                </div>)
              } */}
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
                    disabled={isFoundCitizen === 2}
                  />
                  <div className="blank-container"></div>
                </div>)
              }

            </>
          ) : ''
        }
      </div>
    )
  }

  const addressContent = (props: any) => {
    return (
      <>
        <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
          <div className=" border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
            <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex items-center text-[12px] font-semibold -mt-[10px] ">
              {t('id_card_address')}
            </span>
          </div>
          <div className="px-5 pb-5">
            <div className="input-flex-row">
              <InputField
                require={true}
                label={t('address_label')}
                name="address"
                as="textarea"
                rows="1"
                disabled={isFoundCitizen === 2}
                onChange = {(e:any) => {
                  props.setFieldValue('address',e.target.value)
                  props.setFieldValue('copyAddress',false)
                  props.setFieldValue('copyAddressForWork',false)
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
                  props.setFieldValue('copyAddress',false)
                  props.setFieldValue('copyAddressForWork',false)
                }}
                isSearchable={true}
                disabled={isFoundCitizen === 2}
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
                  props.setFieldValue('copyAddress',false)
                  props.setFieldValue('copyAddressForWork',false)
                } }
                isSearchable={true}
                disabled={districtIdList.length === 0 || isFoundCitizen === 2}
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
                  props.setFieldValue('copyAddress',false)
                  props.setFieldValue('copyAddressForWork',false)
                } }
                isSearchable={true}
                disabled={subDistrictIdList.length === 0 || isFoundCitizen === 2}
              />
              <InputField
                label={t('zip_code')}
                name="zip_code"
                as="textarea"
                rows="1"
                disabled={lockZipCode}
              />
            </div>
          </div>
        </div>
        <label className="flex cursor-pointer items-center">
          {/* <Checkbox
            name="copyAddress"
            label={t('same_as_id_card')}
            onCheck={(e: any) => handleCheck(props, e)}
            disabled={isFoundCitizen === 2}
          /> */ }
          <br />
        </label>
        <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
          <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
            <span className="bg-white dark:bg-black  dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px] ">
              {t('current_address')}
            </span>
          </div>
          <div className="px-5 pb-5">
            <div className="input-flex-row">
              <InputField
                require={true}
                label={t('address_label')}
                name="current_address"
                as="textarea"
                rows="1"
                disabled={isFoundCitizen === 2}
                onChange={(e:any) => {
                  props.setFieldValue('copyAddress',false)
                  props.setFieldValue('current_address',e.target.value)
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
                  props.setFieldValue('copyAddress',false)
                }}
                isSearchable={true}
                disabled={isFoundCitizen === 2}
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
                  props.setFieldValue('copyAddress',false)
                } }
                isSearchable={true}
                disabled={districtCurrentList.length === 0 || isFoundCitizen === 2}
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
                  props.setFieldValue('copyAddress',false)
                }}
                isSearchable={true}
                disabled={subDistrictCurrentList.length === 0 || isFoundCitizen === 2}
              />
              <InputField
                label={t('zip_code')}
                name="current_zip_code"
                as="textarea"
                rows="1"
                disabled={lockZipCode}
              />
            </div>
          </div>
        </div>
        <label className="flex cursor-pointer items-center">
          { /* <Checkbox
            name="copyAddressForWork"
            label={t('same_as_id_card')}
            onCheck={(e: any) => handleCheckForWork(props, e)}
            disabled={isFoundCitizen === 2}
          /> */}
          <br />
        </label>
        <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
          <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
            <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px]">
              {t('work_address')}
            </span>
          </div>
          <div className="px-5 pb-5">
            <div className="input-flex-row">
              <InputField
                require={true}
                label={t('address_label')}
                name="work_address"
                as="textarea"
                rows="1"
                disabled={isFoundCitizen === 2}
                onChange={(e:any) => {
                  props.setFieldValue('copyAddressForWork',false)
                  props.setFieldValue('work_address',e.target.value)
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
                  props.setFieldValue('copyAddressForWork',false)
                }}
                isSearchable={true}
                disabled={isFoundCitizen === 2}
              />
              <SelectField
                require={true}
                label={t('district_label')}
                id="work_id_district"
                name="work_id_district"
                options={districtWorkList}
                placeholder={t('please_select')}
                onChange={(e: any) => {
                  props.setFieldValue('copyAddressForWork',false)
                  handleChangeSelect(props, e, 'work_id_district')
                }}
                isSearchable={true}
                disabled={districtWorkList.length === 0 || isFoundCitizen === 2}
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
                  props.setFieldValue('copyAddressForWork',false)
                  handleChangeSelect(props, e, 'work_id_subdistrict')
                }}
                isSearchable={true}
                disabled={subDistrictWorkList.length === 0 || isFoundCitizen === 2}
              />
              <InputField
                label={t('zip_code')}
                name="work_zip_code"
                as="textarea"
                rows="1"
                disabled={lockZipCode}
              />
            </div>
          </div>
        </div>
      </>
    )
  }

  const uploadContent = () => {
    return (
      <div className="md:col-span-1 xl:col-span-2">
        <div className="upload-container mt-6">
          <div className="custom-file-container" data-upload-id="myFirstImage">
            <div className="label-container">
              <label>{t('verification_image')} <span className="text-rose-600">*</span></label>
              {isFoundCitizen === 1 && (
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
                  {isFoundCitizen === 1 && (
                    <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                      {t('select_file')}
                    </button>
                  )}
                  {imageList.map((image, index) => (
                    <div key={index} className="custom-file-container__image-preview relative">
                      <img src={image.dataURL} alt="img" className={isFoundCitizen === 1 ? 'm-auto mt-10' : 'm-auto'} />
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {(isLoadding || isOCRLoading) && <PreLoading />}
      <Breadcrumbs items={breadcrumbItems} />
      <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <Formik initialValues={customerFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={isFoundCitizen == 2 ? SubmittedFormCitizen :SubmittedForm}>
          {(props) => (
            <Form className="space-y-5 dark:text-white custom-select ">
              <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                {t('customer_account')}
              </div>
              <div className={`grid md:grid-rows-1 ${isFoundCitizen !== 0 && `xl:grid-cols-8`} gap-2 pb-6`}>
                {personalContent(props)}
                {isFoundCitizen === 1 || isFoundCitizen === 2 ? uploadContent() : ''}
              </div>
              {isFoundCitizen !== 0 && (
                <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                  {(isUpload || isLoading || isLoadingCreate
                  ) && (
                      <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>
                    )}
                  
                  {isFoundCitizen == 2 ? t('add_to_shop') : t('add_data')}
                </button>
              )}
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
                          {citizenId}
                        </p>
                      </div>
                      <div className="w-full">
                        <p>
                          {t('name_surname_label')}: {customerFormData.name?.trim()}
                        </p>
                      </div>
                      <div className="w-full">
                        <p>
                          {customerFormData?.address ? `${t('address_detail')}: ${customerFormData?.address} ` : ' '}
                          {customerFormData?.subdistrict ? `${t('subdistrict')}${customerFormData?.subdistrict} ` : ' '}
                          {customerFormData?.district ? `${t('district')}${customerFormData?.district} ` : ' '}
                          {customerFormData?.district ? `${t('province')}${customerFormData?.province} ` : ' '}
                          {isNaN(customerFormData?.zip_code) ? ' ' : customerFormData?.zip_code}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end items-center mt-8">
                      <button type="button" className="btn btn-outline-danger" onClick={() => {
                        setCustomerFormData((prev: any) => ({
                          ...prev,
                          name: '',
                          address: '',
                          id_province: 0,
                          province: '',
                          id_district: 0,
                          district: '',
                          id_subdistrict: 0,
                          subdistrict: '',
                          zip_code: '',
                        }))
                        setActionModal(false)
                      }}>
                        {t('cancel')}
                      </button>
                      <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => setActionModal(false)}>
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
    </div>
  )

}

export default Add