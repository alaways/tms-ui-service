import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import { resizeImageByMaxHeight } from '../../../helpers/helpFunction'
import { Form, Formik } from 'formik'
import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'
import { toastAlert, vatTypes } from '../../../helpers/constant'
import { useUploadMutation } from '../../../services/mutations/useUploadMutation'
import { useDistrictMutation, useSubDistrictMutation } from '../../../services/mutations/useProvincesMutation'
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

  const breadcrumbItems = [
    { to: '/apps/business-unit/list', label: t('business_unit') },
    { label: t('add'), isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle(t('add_business_unit')))
    dispatch(setSidebarActive(['bu', '/apps/business-unit/list']))
  })

  const [businessUnitFormData, setBusinessUnitFormData] = useState<any>({
    id: '',
    name: '',
    tax_id: '',
    phone: '',
    address: '',
    email: '',
    line_id: '',
    website: '',
    id_province: '',
    id_district: '',
    id_subdistrict: '',
    zip_code: '',
    has_vat: '',
    is_active: true,
    contract_email: ''
  })

  const dataStoredProvinces = useSelector((state: IRootState) => state.dataStore.provinces)

  const [subDistrictIdList, setSubDistrictIdList] = useState<any>([])
  const [districtIdList, setDistrictIdList] = useState<any>([])

  const [images, setImages] = useState<any>([])
  const [qrImages, setQrImages] = useState<any>([])
  const [signature, setSignature] = useState<any>([])
  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required(t('required_field')),              // 已有 key
    tax_id: Yup.string().required(t('required_field')),           // 已有 key
    phone: Yup.string().required(t('required_field')),            // 已有 key
    address: Yup.string().required(t('required_field')),          // 已有 key
    id_province: Yup.string().nullable().required(t('required_field')), // 已有 key
    id_district: Yup.string().nullable().required(t('required_field')), // 已有 key
    id_subdistrict: Yup.string().nullable().required(t('required_field')), // 已有 key
    has_vat: Yup.boolean().required(t('required_field')),         // 已有 key
  })

  const { mutate: businessUnitCreate, isLoading: isLoadingCreate  } = useGlobalMutation(url_api.businessUnitCreate, {
        onSuccess: async (res: any, event: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),                     // 已有 key
          padding: '10px 20px',
        })
        navigate('/apps/business-unit/list')
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
    onError: (err: any) => {
      toast.fire({
        icon: 'error',
        title: err.massage,
        padding: '10px 20px',
      })
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

  // TODO: global mutate
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

  const { mutateAsync: uploadFile } = useUploadMutation({
    onSuccess: (res: any) => {
   
    },
    onError: (err: any) => {
     
    },
  })

  const submitForm = useCallback(
    async (event: any) => {
      if (!isLoadingCreate) {
        const uploadPromises = []
        if (images[0]?.file) {
          uploadPromises.push(uploadFile({ data: { file: images[0].file, type: 'business_unit' } }))
        } else {
          uploadPromises.push(Promise.resolve({}))
        }
        if (qrImages[0]?.file) {
          uploadPromises.push(uploadFile({ data: { file: qrImages[0].file, type: 'business_unit' } }))
        } else {
          uploadPromises.push(Promise.resolve({}))
        }

         if (signature[0]?.file) {
          uploadPromises.push(uploadFile({ data: { file: signature[0].file, type: 'business_unit' } }))
        } else {
          uploadPromises.push(Promise.resolve({}))
        }

        let res1, res2, res3
        if (uploadPromises.length > 0) {
          const results = await Promise.all(uploadPromises)
          res1 = results[0]
          res2 = results[1]
          res3 = results[2]
        }
        let businessParams = {
          data: {
            ...event,
            is_active: true,
            logo_image_url: res1?.data?.file_name || '',
            qr_code_image_url: res2?.data?.file_name || '',
            signature: res3?.data?.file_name || '',
            phone: event.phone.replaceAll('-', ''),
            tax_id: event.tax_id.replaceAll('-', ''),
          },
        }
        businessUnitCreate(businessParams)
      }
    },
    [businessUnitCreate, images, qrImages, signature,isLoadingCreate, uploadFile]
  )

  const onImgChange = async (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    const imglist = await resizeImageByMaxHeight(imageList, 150)
    if (imglist.length > 0) {
      setImages(imglist)
    }
  }

  const onQrImgChange = async (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    const imglist = await resizeImageByMaxHeight(imageList, 150)
    if (imglist.length > 0) {
      setQrImages(imglist)
    }
  }

  const onSignatureImgChange = async (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    const imglist = await resizeImageByMaxHeight(imageList, 150)
    if (imglist.length > 0) {
      setSignature(imglist)
    }
  }

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
    if (actions[name]) {
      actions[name]()
    }
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex xl:flex-row flex-col gap-2.5 pt-5">
        <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
          <Formik initialValues={businessUnitFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
            {(props) => (
              <Form className="space-y-5 dark:text-white custom-select">
                <>
                  <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                  {t('business_unit')}  
                  </div>
                  <div className='input-flex-row'>
                    <InputField
                      require={true}
                      label={t('tax_id')} 
                      name="tax_id"
                      type="text"
                      placeholder={t('please_enter_info')}   
                      onKeyPress={(e: any) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault()
                        }
                      }}
                      onClick={(e: any) => {
                        if (props.values.tax_id?.length === 16) {
                          props.setFieldValue('tax_id', props.values.tax_id.replaceAll('-', ''))
                        }
                      }}
                      onBlur={(e: any) => {
                        if (props.values.tax_id?.length == 13) {
                          var format_card = props.values.tax_id.replace(/(\d{1})(\d{4})(\d{5})(\d{3})/, "$1-$2-$3-$4")
                          props.setFieldValue('tax_id', format_card)
                        }
                      }}
                      maxLength={13}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      require={true}
                      label={t('business_name')}    
                      name="name"
                      type="text"
                      placeholder={t('please_enter_info')} 
                    />
                    <InputField
                      require={true}
                      label={t('phone_number')}
                      name="phone"
                      type="text"
                      placeholder={t('please_enter_info')}  
                      maxLength={10}
                      onKeyPress={(e: any) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onClick={(e: any) => {
                        if (props.values.phone?.length == 11 || props.values.phone?.length == 12) {
                          props.setFieldValue('phone', props.values.phone?.replaceAll('-', ''))
                        }
                      }}
                      onBlur={(e: any) => {
                        if (props.values.phone?.length == 9) {
                          var format_phone = props.values.phone.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3") // 02-435-2356
                          props.setFieldValue('phone', format_phone)
                        }
                        if (props.values.phone?.length == 10) {
                          var format_phone = props.values.phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3") // 089-345-2343
                          props.setFieldValue('phone', format_phone)
                        }
                      }}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="Email"
                      name="email"
                      type="text"
                      placeholder={t('please_enter_info')} 
                    />
                    <InputField
                      label={t('contract_email')}  
                      name="contract_email"
                      type="text"
                      placeholder={t('please_enter_info')}  
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="Website"
                      name="website"
                      type="text"
                      placeholder={t('please_enter_info')}      
                    />
                    <InputField
                      require={true}
                      label={t('address')}  
                      name="address"
                      as="textarea"
                      rows="1"
                    />

                  </div>
                  <div className="input-flex-row">
                    <SelectField
                      require={true}
                      label={t('province')}
                      id="id_province"
                      name="id_province"
                      placeholder={t('please_select')}    
                      options={dataStoredProvinces}
                      onChange={(e) => {
                        handleChangeSelect(props, e, 'id_province')
                      }}
                      isSearchable={true}
                    />
                    <SelectField
                      require={true}
                      label={t('district')} 
                      id="id_district"
                      name="id_district"
                      placeholder={t('please_select')}    
                      options={districtIdList}
                      onChange={(e) => {
                        handleChangeSelect(props, e, 'id_district')
                      }}
                      isSearchable={true}
                    />

                  </div>
                  <div className="input-flex-row">
                    <SelectField
                      require={true}
                      label={t('subdistrict')}       
                      id="id_subdistrict"
                      name="id_subdistrict"
                      placeholder={t('please_select')} 
                      options={subDistrictIdList}
                      onChange={(e) => {
                        handleChangeSelect(props, e, 'id_subdistrict')
                      }}
                      isSearchable={true}
                    />
                    <InputField
                      label={t('zip_code')}  
                      name="zip_code"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="LINE ID"
                      name="line_id"
                      type="text"
                    />
                    <SelectField
                      require={true}
                      label={t('has_vat')}     
                      id="has_vat"
                      name="has_vat"
                      placeholder={t('please_select')}     
                      options={vatTypes}
                      onChange={(e) => {
                        handleChangeSelect(props, e, 'has_vat')
                      }}
                    />
                  </div>
                  <div className="input-flex-row">
                    <div className="input-container">
                      <div className="custom-file-container" data-upload-id="myFirstImage">
                        <div className="label-container">
                        {t('line_qr_code')}   
                          <button type="button" className="custom-file-container__image-clear" title="Clear Image" onClick={() => setQrImages([])}>
                            ×
                          </button>
                        </div>
                        <label className="custom-file-container__custom-file hidden"></label>
                        <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" />
                        <input type="hidden" name="MAX_FILE_SIZE1" value="10485760" />
                        <br />
                        <ImageUploading value={qrImages} onChange={onQrImgChange}>
                          {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                            <div className="upload__image-wrapper">
                              <button type="button" className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload}>
                              {t('asset_select_file')}
                              </button>
                              &nbsp;
                              {imageList.map((image, index) => (
                                <div key={index} className="custom-file-container__image-preview relative">
                                  <img className={'m-auto mt-10'} alt="img" src={image.dataURL} />
                                </div>
                              ))}
                            </div>
                          )}
                        </ImageUploading>
                      </div>
                    </div>
                    <div className="flex-1 upload-container">
                      <div className="custom-file-container" data-upload-id="myFirstImage">
                        <div className="label-container">
                          LOGO
                          <button type="button" className="custom-file-container__image-clear" title="Clear Image" onClick={() => setImages([])}>
                            ×
                          </button>
                        </div>
                        <label className="custom-file-container__custom-file hidden"></label>
                        <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" />
                        <input type="hidden" name="MAX_FILE_SIZE1" value="10485760" />
                        <br />
                        <ImageUploading value={images} onChange={onImgChange}>
                          {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                            <div className="upload__image-wrapper">
                              <button type="button" className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload}>
                              {t('asset_select_file')}       
                              </button>
                              &nbsp;
                              {imageList.map((image, index) => (
                                <div key={index} className="custom-file-container__image-preview relative">
                                  <img className={'m-auto mt-10'} alt="img" src={image.dataURL} />
                                </div>
                              ))}
                            </div>
                          )}
                        </ImageUploading>
                      </div>
                    </div>
                  </div>
                   <div className="input-flex-row">
                      <div className="input-container">
                        <div className="custom-file-container" data-upload-id="myFirstImage">
                          <div className="label-container">
                          {t('signature')}    
                            <button
                              type="button"
                              className="custom-file-container__image-clear"
                              title="Clear Image"
                              onClick={() => {
                                setSignature([])
                              }}
                            >
                              ×
                            </button>
                          </div>
                          <label className="custom-file-container__custom-file hidden"></label>
                          <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" />
                          <input type="hidden" name="MAX_FILE_SIZE1" value="10485760" />
                          <br />
                          <ImageUploading value={signature} onChange={onSignatureImgChange}>
                            {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                              <div className="upload__image-wrapper">
                                <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                                {t('asset_select_file')}     
                                </button>
                                &nbsp;
                                {imageList.map((image, index) => (
                                  <div key={index} className="custom-file-container__image-preview relative">
                                    <img src={image.dataURL} alt="img" className={'m-auto mt-5'} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </ImageUploading>
                        </div>
                      </div>
                      <div className="input-container"></div>
                    </div>
                  <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                    {isLoadingCreate && (<span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>)}
                    {t('save')}   
                  </button>
                </>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  )

}

export default Add