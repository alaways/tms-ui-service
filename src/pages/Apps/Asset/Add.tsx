import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { Form, Formik, FormikProps } from 'formik'
import CreatableSelect from 'react-select/creatable'
import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'
import { Assets, AssetsImage, AssetsTypes, Shop } from '../../../types/index'
import {
  useAssetImgDeleteMutation,
  useAssetUpdateMutation
} from '../../../services/mutations/useAssetMutation'

import { useUploadMutation } from '../../../services/mutations/useUploadMutation'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import { PRICE_REGEX } from '../../../helpers/regex'
import { toastAlert } from '../../../helpers/constant'
import { resizeImage } from '../../../helpers/helpFunction'
import PreLoading from '../../../helpers/preLoading';
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { useTranslation } from 'react-i18next'   // 新增


const mode = process.env.MODE || 'admin'

const Add = () => {
  const { t } = useTranslation();
  const toast = Swal.mixin(toastAlert)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setPageTitle(t('add_asset')))
  })

  const breadcrumbItems = [
    { to: '/apps/asset/list', label: t('asset') }, // 新 key：资产（单数）
    { label: t('add'), isCurrent: true },         // 已有 key
  ]

  const storedUser:any = localStorage.getItem(mode)
  const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null
 const dataTest = JSON.parse(storedUser)

  const role = storedUser ? JSON.parse(storedUser).role : null;

  if (role != 'admin' && role != 'shop' && role != 'business_unit') {
    navigate('/');
  }

  const defaultForm = {
    id_asset_type: '',
    id_shop: id_shop,
    name: '',
    model_number: '',
    capacity: '',
    color: '',
    serial_number: '',
    imei: '',
    insurance_type_id: '',
    price: 0,
    note: '',
    is_active: true,
  }

  const [formData, setFormData] = useState<any>(defaultForm)

  const [shopListData, setShopListData] = useState<Shop[]>([])
  const [assetTypeList, setAssetTypeList] = useState<AssetsTypes[]>([])
  const [assetColorList, setAssetColorList] = useState<any[]>([])
  const [assetModelList, setAssetModelList] = useState<any[]>([])
  const [assetNameList, setAssetNameList] = useState<any[]>([])
  const [assetCapacityList, setAssetCapacityList] = useState<any[]>([])

  const [tempAssetColorList, setTempAssetColorList] = useState<any[]>([])
  const [tempAssetModelList, setTempAssetModelList] = useState<any[]>([])
  const [tempAssetNameList, setTempAssetNameList] = useState<any[]>([])
  const [tempAssetCapacityList, setTempAssetCapacityList] = useState<any[]>([])
  const [images, setImages] = useState<any>([])
  const [isSearchAsset, setIsSearchAsset] = useState<number>(0)

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
    fetchShopData({ data: {} })
    fetchAssetCapacityData({ data: {} })
    fetchAssetTypeData({ data: { page: 1, page_size: -1 } })
  }, [])

  const { mutateAsync: uploadFile, isLoading: isLoadingUpload } = useUploadMutation({
    onSuccess: (res: any) => {
    },
    onError: (err: any) => {
    },
  })

  const { mutate: fetchAssetTypeData, isLoading: isLoadingAssetTypeData } = useGlobalMutation(url_api.assetTypeFindAllActive, {
    onSuccess: (res: any) => {
      setAssetTypeList(
        res.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      )
    },
    onError: () => { },
  })

  const { mutate: fetchAssetColorData } = useGlobalMutation(url_api.assetColorFindAll, {
    onSuccess: (res: any) => {
      const data = res.data.map((item: any) => ({
        value: item.name,
        label: item.name,
      }))
      setAssetColorList(data)
      setTempAssetColorList(data)
    },
    onError: () => { },
  })

  const { mutate: fetchAssetModelData } = useGlobalMutation(url_api.assetModelFindAll, {
    onSuccess: (res: any) => {
      const data = res.data.map((item: any) => ({
        value: item.name,
        label: item.name,
      }))
      setAssetModelList(data)
      setTempAssetModelList(data)
    },
    onError: () => { },
  })

  const { mutate: fetchAssetNameData } = useGlobalMutation(url_api.assetNameFindAll, {
    onSuccess: (res: any) => {
      const data = res.data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }))
      setAssetNameList(data)
      setTempAssetNameList(data)
    },
    onError: () => { },
  })


  const { mutate: fetchAssetCapacityData } = useGlobalMutation(url_api.assetCapacityFindAll, {
    onSuccess: (res: any) => {
      const data = res.data.map((item: any) => ({
        value: item.name,
        label: item.name,
      }))
      setAssetCapacityList(data)
      setTempAssetCapacityList(data)
    },
    onError: () => { },
  })

  const { mutate: assetCreate, isLoading: isCreateLoading  } = useGlobalMutation(url_api.assetCreate, {
      onSuccess: async (res: any, event: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        const uploadPromises: any[] = []
        images.forEach((item: any) => {
          uploadPromises.push(uploadFile({ data: { file: item.file, type: 'asset' } }))
        })
        if (uploadPromises.length > 0) {
          const results1 = await Promise.all(uploadPromises)
          const createAssetImg: any[] = []
          results1.forEach((item: any) => {
            if (item.code !== 'error') {
              createAssetImg.push(
                assetImgCreate({
                  data: {
                    id_asset: res.data.id,
                    name: item.data.file_name,
                    image_url: item.data.file_name,
                    extension: 'extension',
                    size: item.data.size,
                  },
                })
              )
            } else {
              const toast = Swal.mixin(toastAlert)
              toast.fire({
                icon: 'error',
                title: t('asset_file_upload_error'),          // 新 key：文件上传错误
                padding: '10px 20px',
              })
            }
          })
          if (createAssetImg.length > 0) {
            await Promise.all(createAssetImg)
          }
        }
        toast.fire({
          icon: 'success',
          title: t('save_success'),                     // 已有 key
          padding: '10px 20px',
        })

        navigate('/apps/asset/list')
      } else {
        toast.fire({
          icon: 'error',
          title: res?.message,
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

  const { mutateAsync: assetImgDetele } = useAssetImgDeleteMutation();

  const { mutate: assetUpdate } = useAssetUpdateMutation({
    onSuccess: async (res) => {
      if (res.statusCode === 200 || res.code === 200) {
        const uploadPromises: any[] = [];
        const deletePromises: any[] = [];
        formData.asset_images?.forEach((item: any) => {
          const isDeleted = images.find((a: any) => a.id === item.id);
          if (isDeleted === undefined) {
            deletePromises.push(assetImgDetele({ data: { id: item.id } }));
          }
        });
        images.forEach((item: any) => {
          if (item?.id === undefined) {
            uploadPromises.push(uploadFile({ data: { file: item.file, type: 'asset' } }));
          }
        });
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
        if (uploadPromises.length > 0) {
          const resultsUpload = await Promise.all(uploadPromises);
          const resultsCreateAssetImg: any[] = [];
          resultsUpload.forEach((item: any) => {
            if (item.code !== 'error') {
              resultsCreateAssetImg.push(
                assetImgCreate({
                  data: {
                    id_asset: res.data.id,
                    name: item.data.file_name,
                    image_url: item.data.file_name,
                    extension: 'extension',
                    size: item.data.size,
                  },
                })
              );
            } else {
              const toast = Swal.mixin(toastAlert);
              toast.fire({
                icon: 'error',
                title: t('asset_file_upload_error'),
                padding: '10px 20px',
              });
            }
          });
          if (resultsCreateAssetImg.length > 0) {
            await Promise.all(resultsCreateAssetImg);
          }
        }
        toast.fire({
          icon: 'success',
          title: t('edit_success'),                     // 已有 key
          padding: '10px 20px',
        })
        navigate('/apps/asset/list');
      } else {
        toast.fire({
          icon: 'error',
          title: res?.message,
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
    }
  })


  const { mutateAsync: assetImgCreate } = useGlobalMutation(url_api.assetImgCreate, {})
  const { mutate: serialNumberCheck } = useGlobalMutation(url_api.assetSearch, {

    onSuccess: async (res: any, variables: any) => {
      if (res.code === 400 || res.statusCode === 400) {
        setImages([])
        setIsSearchAsset(1)
        setFormData(defaultForm)
      } else {
        setIsSearchAsset(2)
        fetchShopData({ data: { query: res.data.shop.name } })
        if (res.data?.asset_images.length > 0) {
          setImages(
            res.data?.asset_images.map((item: AssetsImage) => {
              return { dataURL: item.image_url, name: item.name, id: item.id }
            })
          )
        }
        setFormData({ ...res.data, id_shop: res.data.shop.uuid })
      }
    },

  })



  const handleSearch = (props: any, event: any, name: any) => {
    fetchShopData({ data: { query: event } })
  }

  const handleChangeInput = (props: FormikProps<Assets>, event: any, name: any) => {
    switch (name) {
      case 'model_number':
        setAssetModelList(tempAssetModelList)
        break
      case 'name':
        if (event !== '') {
          // setAssetCapacityList([{ value: event, label: event }])
        } else {
          setAssetNameList(tempAssetNameList)
        }
        break
      case 'capacity':
        if (event !== '') {
          // setAssetCapacityList([{ value: event, label: event }])
        } else {
          setAssetCapacityList(tempAssetCapacityList)
        }
        break
      case 'color':
        if (event !== '') {
          // setAssetColorList([{ value: event, label: event }])
        } else {
          setAssetColorList(tempAssetColorList)
        }
        break
      default:
    }
  }

  const handleChangeAssetModel = (props: any, event: any, name: any) => {
    fetchAssetModelData({
      data: {
        id_asset_type: props.values.id_asset_type,
        id_asset_name: event?.value,
      }
    })
    fetchAssetColorData({
      data: {
        id_asset_type: props.values.id_asset_type,
        id_asset_name: event?.value,
      }
    })
    fetchAssetCapacityData({
      data: {
        id_asset_type: props.values.id_asset_type,
        id_asset_name: event?.value,
      }
    })
    props.setFieldValue('capacity', '')
    props.setFieldValue('color', '')
    props.setFieldValue('model_number', '')
  }

  const handleChangeAssetType = (props: any, event: any, name: any) => {
    fetchAssetNameData({
      data: {
        id_asset_type: event.value,
      }
    })
    props.setFieldValue('name', event.value)
  }

   const { mutate: changeAssetShop } = useGlobalMutation(url_api.changeAssetShop, {
      onSuccess: (res: any) => {
         toast.fire({
          icon: 'success',
          title: t('edit_success'),
          padding: '10px 20px',
        });
        navigate('/apps/asset/list');
      },
      onError: (err: any) => {
        toast.fire({
          icon: 'error',
          title: err.massage,
          padding: '10px 20px',
        })
    }
    })

  const submitForm = useCallback(
    (event: any) => {

      if (event.uuid) {
        //
        // if (images.length > 0) {
        //   assetUpdate({ data: { ...event, id: event.uuid } })
        // } else {
        //   const toast = Swal.mixin(toastAlert)
        //   toast.fire({
        //     icon: 'error',
        //     title: 'กรุณาเพิ่มรูปสินทรัพย์อย่างน้อย 1 รูป',
        //     padding: '10px 20px',
        //   })
        // }
        if(role == "shop") {
              if(isSearchAsset == 1 ) {
                  assetUpdate({ data: { ...event, id: event.uuid } })
              } else {
                 changeAssetShop({ data: { id_asset: event.uuid } })
              }
          } else {
             assetUpdate({ data: { ...event, id: event.uuid } })
          }

      }
      else {
        // if (images.length > 0) {
        //   assetCreate({
        //     data: {
        //       ...event,
        //       price: Number(event.price),
        //     },
        //   })
        // } else {
        //   const toast = Swal.mixin(toastAlert)
        //   toast.fire({
        //     icon: 'error',
        //     title: 'กรุณาเพิ่มรูปสินทรัพย์อย่างน้อย 1 รูป',
        //     padding: '10px 20px',
        //   })
        // }
        assetCreate({
          data: {
            ...event,
            price: Number(event.price),
          },
        })
      }
    },
    [assetCreate, images]
  )

  const onImgChange = async (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    const resizedImages = await resizeImage(imageList)
    setImages(resizedImages)
  }

  const onError = () => {
    toast.fire({
      icon: 'error',
      title: t('asset_image_limit_error'),        // 新 key：图片数量限制错误
      padding: '10px 20px',
    })
  }

  const SubmittedForm = Yup.object().shape({
    ame: Yup.string().required(t('required_field')),              // 已有 key
  id_shop: Yup.string().required(t('required_field')),           // 已有 key
  id_asset_type: Yup.string().required(t('required_field')),     // 已有 key
  serial_number: Yup.string().required(t('required_field')),     // 已有 key
  price: Yup.string().required(t('required_field')).matches(PRICE_REGEX, t('asset_price_invalid')), // 新 key
})

  if (isLoadingAssetTypeData) return <div>Loading...</div>

  return (
    <div className="flex flex-col gap-2.5">
      {(isLoadingUpload || isCreateLoading) && <PreLoading />}
      <Breadcrumbs items={breadcrumbItems} />
      <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
          {(props) => (
            <Form className="space-y-5 dark:text-white custom-select">
             {formData?.on_contract === true && (
                <div className="w-full bg-[#fedee2] text-[#f9303e] rounded-md">
                  <div className="p-5">
                  {t('asset_under_contract')} {formData?.bu_name}
                  </div>
                </div>
              )}
              <div className="input-flex-row">
                <div className="w-full">
                  <InputField
                    require={true}
                    label={t('asset_serial_number')}
                    name="serial_number"
                    type="text"
                    onKeyPress={(e: any) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (props.values.serial_number) {
                          serialNumberCheck({ data: { query: props.values.serial_number }, props })
                        } else {
                          toast.fire({
                            icon: 'error',
                            title: t('asset_serial_required'),
                            padding: '10px 20px',
                          })
                        }
                        return
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-dark mt-2 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                    onClick={() => {
                      if (props.values.serial_number) {
                        serialNumberCheck({ data: { query: props.values.serial_number }, props })
                      } else {
                        toast.fire({
                          icon: 'error',
                          title: t('asset_serial_required'),      // 新 key
                          padding: '10px 20px',
                        })
                      }
                    }}
                  >
                    {t('asset_check')}
                  </button>
                  <p className="mt-4 text-[11px] text-white-dark"> {t('asset_check_help_text')}        </p>
                </div>
              </div>
              {isSearchAsset === 1 || isSearchAsset === 2 ? (
                <>
                  <div className="input-flex-row">
                    {!id_shop && (
                      <SelectField
                        require={true}
                        id="id_shop"
                        label={t('shop')}
                        name="id_shop"
                        options={shopListData}
                        // disabled={isSearchAsset === 2}
                        isSearchable={true}
                        onInputChange={(event: any) => {
                          handleSearch(props, event, 'id_shop')
                        }}
                        handleOnMenuOpen={() => {
                          fetchShopData({
                            data: {
                              query: '',
                            },
                          });
                        }}
                      />
                    )}
                    <SelectField
                      require={true}
                      id="id_asset_type"
                      label={t('asset_type')}
                      name="id_asset_type"
                      options={assetTypeList}
                      disabled={isSearchAsset === 2}
                      onChange={(event: any) => {
                        handleChangeAssetType(props, event, 'id_asset_type')
                      }}
                    />
                  </div>
                  <div className="input-flex-row">
                    <div className="input-container">
                      {isSearchAsset === 2 ? (<InputField
                        label={t('asset_name')}
                        name="name"
                        require={true}
                        disabled={true}
                      />) : (<div>
                        <label>{t('asset_name')} <span className="text-rose-600"> * </span></label>
                        <div className={'relative text-white-dark'}>
                          <CreatableSelect
                            id="name"
                            placeholder={t('asset_name')}
                            name="name"
                            isClearable
                            options={assetNameList}
                            onChange={(event: any) => {
                              props.setFieldValue('name', event ? event.label : '')
                              handleChangeAssetModel(props, event, 'name')
                            }}
                          />
                        </div>
                      </div>
                      )}
                    </div>
                    <div className="input-container">
                      {isSearchAsset === 2 ? (<InputField
                        label={t('asset_model_number')}
                        name="model_number"
                        disabled={true}
                      />) : (<div>
                        <label>{t('asset_model_number')}</label>
                        <div className={'relative text-white-dark'}>
                          <CreatableSelect
                            id="model_number"
                            placeholder={t('asset_model_number')}
                            name="model_number"
                            isClearable
                            options={assetModelList}
                            onChange={(event: any) => {
                              props.setFieldValue('model_number', event ? event.label : '')
                            }}
                          />
                        </div>

                      </div>)}

                    </div>
                  </div>
                  <div className="input-flex-row">
                    <div className="input-container">
                      {isSearchAsset === 2 ? (<InputField
                        label={t('asset_capacity')}
                        name="capacity"
                        disabled={true}
                      />) : (<div><label>{t('asset_capacity')}</label>
                        <div className={'relative text-white-dark'}>
                          <CreatableSelect
                            id="capacity"
                            placeholder={t('asset_capacity')}
                            name="capacity"
                            isClearable
                            options={assetCapacityList}
                            onChange={(event: any) => {
                              props.setFieldValue('capacity', event ? event.label : '')
                            }}
                          />
                        </div></div>)}

                    </div>

                    <div className="input-container">
                      {isSearchAsset === 2 ? (<InputField
                        label={t('asset_capacity')}
                        name="capacity"
                        disabled={true}
                      />) : (<div>
                        <label>{t('asset_color')}</label>
                        <div className={'relative text-white-dark'}>
                          <CreatableSelect
                            id="color"
                            placeholder={t('asset_color')}
                            name="color"
                            isClearable
                            options={assetColorList}
                            onChange={(event: any) => {
                              props.setFieldValue('color', event ? event.label : '')
                            }}
                          />
                        </div>
                      </div>)}

                    </div>
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label={t('asset_imei')}
                      name="imei"
                      maxLength={15}
                      type="text"
                      disabled={isSearchAsset === 2}
                      onKeyPress={(e: any) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault()
                        }
                      }}
                    />
                    <InputField
                      require={true}
                      label={t('asset_selling_price')}
                      name="price"
                      disabled={isSearchAsset === 2}
                      onKeyPress={(e: any) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault()
                        }
                      }}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label={t('asset_note')}
                      name="note"
                      as="textarea"
                      rows="4"
                      placeholder={t('please_enter_info')}
                      className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                      disabled={isSearchAsset === 2}
                    />
                  </div>
                  <div className="input-flex-row">
                    <div className="custom-file-container" data-upload-id="Image">
                      <div className="label-container">
                        <label> {t('asset_images')} </label>
                        {isSearchAsset === 1 && images.length > 0 && (
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
                        )}
                      </div>
                      <label className={`custom-file-container__custom-file ${isSearchAsset === 2 && 'hidden'}`}></label>
                      <input type="file" className={`custom-file-container__custom-file__custom-file-input hidden`} accept="image/*" />
                      <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                      <ImageUploading multiple value={images} onChange={onImgChange} onError={onError} maxNumber={15}>
                        {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                          <div className="upload__image-wrapper">
                            {isSearchAsset === 1 && (
                              <button type="button" className="custom-file-container__custom-file__custom-file-control custom-btn-select-file" onClick={onImageUpload}>
                                {t('asset_select_file')}
                              </button>
                            )}
                            <div className="grid gap-4 sm:grid-cols-3 grid-cols-1">
                              {imageList.map((image, index) => (
                                <div key={index} className="custom-file-container__image-preview relative">
                                  {isSearchAsset === 1 && (
                                    <button
                                      type="button"
                                      className="custom-file-container__image-clear bg-dark-light dark:bg-dark dark:text-white-dark rounded-full block w-fit p-1 absolute top-0 right-0 z-10"
                                      title="Clear Image"
                                      onClick={() => onImageRemove(index)}
                                    >
                                      ×
                                    </button>
                                  )}
                                  <div key={index} className="custom-file-container__image-preview relative">
                                    <img src={image.dataURL} alt="img" className={'m-auto'} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </ImageUploading>
                    </div>
                  </div>
                  {((isSearchAsset == 2 && formData?.on_contract === false && role != "shop") || (isSearchAsset == 1) )&& (
                    <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                      {isCreateLoading && (
                        <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>
                      )}
                     {t('save')}
                    </button>
                  )}

                   {((isSearchAsset == 2 && formData?.on_contract === false && role == "shop") )&& (
                    <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                      {isCreateLoading && (
                        <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>
                      )}
                      {t('asset_add_to_shop')}
                    </button>
                  )}
                </>
              ) : (
                <></>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )

}

export default Add
