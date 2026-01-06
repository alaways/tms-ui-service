import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'

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

import { BusinessUnits, Shop } from '../../../types/index'
import { toastAlert, vatTypes } from '../../../helpers/constant'

import { useUploadMutation } from '../../../services/mutations/useUploadMutation'
import { useDistrictMutation, useSubDistrictMutation } from '../../../services/mutations/useProvincesMutation'
import { useBusinessUnitFindMutation, useBusinessUnitUpdateMutation } from '../../../services/mutations/useBusinessUnitMutation'

import Breadcrumbs from '../../../helpers/breadcrumbs'

import 'tippy.js/dist/tippy.css'

const mode = process.env.MODE || 'admin'

const Edit = () => {

  const { id } = useParams()
  const toast = Swal.mixin(toastAlert)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const breadcrumbItems = [
    { to: '/apps/business-unit/list', label: 'หน่วยธุรกิจ' },
    { to: '/apps/business-unit/preview/' + id, label: 'ข้อมูลหน่วยธุรกิจ' },
    { label: 'แก้ไข', isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle('ข้อมูลหน่วยธุรกิจ'))
    dispatch(setSidebarActive(['bu', '/apps/business-unit/list']))
  }, [dispatch])

  const dataBusinessUnits = useSelector((state: IRootState) => state.dataStore.businessUnits)
  const dataStoredProvinces = useSelector((state: IRootState) => state.dataStore.provinces)

  const [subDistrictIdList, setSubDistrictIdList] = useState<any>([])
  const [districtIdList, setDistrictIdList] = useState<any>([])
  const [images, setImages] = useState<any>([])
  const [qrImages, setQrImages] = useState<any>([])
  const [signature, setSignature] = useState<any>([])
  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  if (role !== 'admin' && role !== 'business_unit') {
    navigate('/')
  }

  const [businessUnitFormData, setBusinessUnitFormData] = useState<any>({
    name: '',
    tax_id: '',
    phone: '',
    address: '',
    id_province: '',
    id_district: '',
    id_subdistrict: '',
    email: '',
    line_id: '',
    website: '',
    zip_code: '',
    has_vat: '',
    contract_email: ''
  })

  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    tax_id: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    phone: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    address: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_province: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_district: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_subdistrict: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    has_vat: Yup.boolean().required('กรุณาใส่ข้อมูลให้ครบ'),
    email: Yup.string().email('รูปแบบอีเมลไม่ถูกต้อง').required('กรุณาใส่ข้อมูลให้ครบ'),
    //contract_email: Yup.string().email('รูปแบบอีเมลไม่ถูกต้อง').required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const { mutate: fetchBusinessUnitsData, isLoading: isLoadingBusinessUnitsData } = useBusinessUnitFindMutation({
    async onSuccess(res: any) {
      const setFormValue = { ...businessUnitFormData, ...res.data }
      getDistrict({ id: setFormValue?.id_province, type: 'id_province' })
      getSubDistrict({ id: setFormValue?.id_district, type: 'id_district' })
      if (setFormValue?.logo_image_url) {
        setImages([{ dataURL: setFormValue.logo_image_url }])
      }
      if (setFormValue?.qr_code_image_url) {
        setQrImages([{ dataURL: setFormValue.qr_code_image_url }])
      }

      if (setFormValue?.signature) {
        setSignature([{ dataURL: setFormValue.signature }])
      }
      
      if (setFormValue.tax_id?.length == 13) {
        var format_card = setFormValue.tax_id.replace(/(\d{1})(\d{4})(\d{5})(\d{3})/, "$1-$2-$3-$4")
        setFormValue.tax_id = format_card
      }
      if (setFormValue.phone?.length == 9) {
        var format_phone = setFormValue.phone.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3") // 02-435-2356
        setFormValue.phone = format_phone
      }
      if (setFormValue.phone?.length == 10) {
        var format_phone = setFormValue.phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3") // 089-345-2343
        setFormValue.phone = format_phone
      }
      setBusinessUnitFormData(setFormValue)

    },
    onError(error: any) { },
  })

  const { mutate: businessUnitUpdate, isLoading: isLoadingUpdate } = useBusinessUnitUpdateMutation({
    onSuccess: async (res: any, event: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
    onError: (err: any) => { },
  })

  const { mutate: getDistrict } = useDistrictMutation({
    onSuccess: (res: any, variables: any) => {
      const mapList = res.data.map((item: any) => ({
        value: item.id,
        label: item.name_th,
      }))
      if (variables.type === 'id_province') {
        setDistrictIdList(mapList)
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
      if (variables.type === 'id_district') {
        setSubDistrictIdList(mapList)
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

  const handleChangeSelect = (props: any, event: any, name: any) => {
    const resetFields = (fields: string[], resetFunctions: Function[]) => {
      fields.forEach((field) => props.setFieldValue(field, null))
      resetFunctions.forEach((func) => func([]))
    }
    const actions: { [key: string]: () => void } = {
      id_province: () => {
        getDistrict({ id: event.value, type: name })
        resetFields(['id_district', 'id_subdistrict'], [setDistrictIdList, setSubDistrictIdList])
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

  const onImgChange = async (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    const imglist = await resizeImageByMaxHeight(imageList, 150) // height: 150 px
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

  useEffect(() => {
    fetchBusinessUnitsData({
      data: {
        id: id || dataBusinessUnits.id
      }
    })
  }, [dataBusinessUnits.id])

  const submitForm = useCallback(
    async (event: any) => {
      if (!isLoadingUpdate) {
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
            ...(res1?.data?.file_name && {
              logo_image_url: res1?.data?.file_name ?? ''
            }),
            ...(res2?.data?.file_name && {
              qr_code_image_url: res2?.data?.file_name ?? ''
            }),
            ...(res3?.data?.file_name && {
              signature: res3?.data?.file_name ?? ''
            }),
            phone: event.phone.replaceAll('-', ''),
            tax_id: event.tax_id.replaceAll('-', ''),
          },
        }

        if (res1?.data?.file_name === undefined) {
          delete businessParams.data.logo_image_url
        }
        if (res2?.data?.file_name === undefined) {
          delete businessParams.data.qr_code_image_url
        }

        if (res3?.data?.file_name === undefined) {
          delete businessParams.data.signature
        }

        businessUnitUpdate(businessParams)
      }
    },
    [businessUnitUpdate, images, qrImages, signature, isLoadingUpdate, uploadFile]
  )

  return (
    <div className="pt-1">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="grid pt-5 lg:grid-cols gap-6 mb-6">
        <div className="h-full">
          <div className="flex xl:flex-row flex-col gap-2.5">
            <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
              <Formik initialValues={businessUnitFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                {(props) => (
                  <Form className="space-y-5 dark:text-white custom-select">
                    <>
                      <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        หน่วยธุรกิจ
                      </div>
                      <div className='input-flex-row'>
                        <InputField
                          require={true}
                          label="เลขประจำตัวผู้เสียภาษี"
                          name="tax_id"
                          type="text"
                          placeholder="กรุณาใส่ข้อมูล"
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
                          label="ชื่อธุรกิจ"
                          name="name"
                          type="text"
                          placeholder="กรุณาใส่ข้อมูล"
                        />
                        <InputField
                          require={true}
                          label="เบอร์โทรศัพท์"
                          name="phone"
                          type="text"
                          placeholder="กรุณาใส่ข้อมูล"
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
                          placeholder="กรุณาใส่ข้อมูล"
                        />
                        <InputField
                          label="Email รับสำเนา"
                          name="contract_email"
                          type="text"
                          placeholder="กรุณาใส่ข้อมูล"
                        />
                      </div>
                      <div className="input-flex-row">
                        <InputField
                          label="Website"
                          name="website"
                          type="text"
                          placeholder="กรุณาใส่ข้อมูล"
                        />
                        <InputField
                          require={true}
                          label="ที่อยู่"
                          name="address"
                          as="textarea"
                          rows="1"
                        />
                      </div>
                      <div className="input-flex-row">
                        <SelectField
                          require={true}
                          label="จังหวัด"
                          id="id_province"
                          name="id_province"
                          options={dataStoredProvinces}
                          placeholder="กรุณาเลือก"
                          onChange={(e) => handleChangeSelect(props, e, 'id_province')}
                          isSearchable={true}
                        />
                        <SelectField
                          require={true}
                          label="อำเภอ/เขต"
                          id="id_district"
                          name="id_district"
                          options={districtIdList}
                          placeholder="กรุณาเลือก"
                          onChange={(e) => handleChangeSelect(props, e, 'id_district')}
                          isSearchable={true}
                        />

                      </div>
                      <div className="input-flex-row">
                        <SelectField
                          require={true}
                          label="ตำบล/แขวง"
                          id="id_subdistrict"
                          name="id_subdistrict"
                          options={subDistrictIdList}
                          placeholder="กรุณาเลือก"
                          onChange={(e) => handleChangeSelect(props, e, 'id_subdistrict')}
                          isSearchable={true}
                        />
                        <InputField
                          label="รหัสไปรษณีย์"
                          name="zip_code"
                          type="text"
                          readOnly={true}
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
                          label="จดภาษีมูลค่าเพิ่ม (VAT)"
                          id="has_vat"
                          name="has_vat"
                          placeholder="กรุณาเลือก"
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
                              Line QR code
                              <button
                                type="button"
                                className="custom-file-container__image-clear"
                                title="Clear Image"
                                onClick={() => {
                                  setQrImages([])
                                }}
                              >
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
                                  <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                                    เลือกไฟล์...
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
                        <div className="flex-1 upload-container">
                          <div className="custom-file-container" data-upload-id="myFirstImage">
                            <div className="label-container">
                              LOGO
                              <button
                                type="button"
                                className="custom-file-container__image-clear"
                                title="Clear Image"
                                onClick={() => {
                                  setImages([])
                                }}
                              >
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
                                  {
                                    <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                                      เลือกไฟล์...
                                    </button>
                                  }
                                  &nbsp;
                                  {imageList.map((image, index) => (
                                    <div key={index} className="custom-file-container__image-preview relative mt-5">
                                      <img src={image.dataURL} alt="img" className={'m-auto'} />
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
                              ลายเซ็นต์
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
                                    เลือกไฟล์...
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
                        {isLoadingUpdate && (<span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>)}
                        บันทึก
                      </button>
                    </>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

export default Edit