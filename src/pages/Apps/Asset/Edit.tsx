import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice';
import { setPageAction } from '../../../store/pageStore'
import { Form, Formik, FormikProps } from 'formik';
import InputField from '../../../components/HOC/InputField';
import SelectField from '../../../components/HOC/SelectField';
import CreatableSelect from 'react-select/creatable';
import { toastAlert } from '../../../helpers/constant';
import { PRICE_REGEX } from '../../../helpers/regex';
import { resizeImage } from '../../../helpers/helpFunction';
import { Assets, AssetsTypes, AssetsImage, Shop, AssetsColors, AssetsModels, AssetsCapacitys } from '../../../types/index';
import { useAssetFindMutation, useAssetUpdateMutation, useAssetImgDeleteMutation } from '../../../services/mutations/useAssetMutation';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useUploadMutation } from '../../../services/mutations/useUploadMutation';
import Breadcrumbs from '../../../helpers/breadcrumbs';
import IconEdit from '../../../components/Icon/IconEdit'
import PreLoading from '../../../helpers/preLoading';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';

const mode = process.env.MODE || 'admin'

const Edit = () => {
  const { id } = useParams();
  const toast = Swal.mixin(toastAlert);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('ข้อมูลสินทรัพย์'));
    dispatch(setSidebarActive(['asset', '/apps/asset/list']))
  }, [dispatch]);

  const storedUser = localStorage.getItem(mode);
  const role = storedUser ? JSON.parse(storedUser).role : null;
  const isView = location.pathname.includes('/view');
  const pageAction = isView ? true : role === 'shop' ? true : false;
  const dataStoredAsset = useSelector((state: IRootState) => state.dataStore.assets);
  const [shopListData, setShopListData] = useState<Shop[]>([]);
  const [formData, setFormData] = useState<Assets>({});
  const [assetTypeList, setAssetTypeList] = useState<AssetsTypes[]>([]);
  const [assetColorList, setAssetColorList] = useState<any[]>([]);
  const [assetModelList, setAssetModelList] = useState<any[]>([]);
  const [assetCapacityList, setAssetCapacityList] = useState<AssetsCapacitys[]>([]);
  const [assetNameList, setAssetNameList] = useState<any[]>([]);

  const [tempAssetColorList, setTempAssetColorList] = useState<any[]>([]);
  const [tempAssetModelList, setTempAssetModelList] = useState<any[]>([]);
  const [tempAssetCapacityList, setTempAssetCapacityList] = useState<any[]>([]);
  const [tempAssetNameList, setTempAssetNameList] = useState<any[]>([]);

  const [images, setImages] = useState<any>([]);

  const breadcrumbItems = [
    { to: '/apps/asset/list', label: 'สินทรัพย์' },
    { label: pageAction ? 'ข้อมูล' : 'แก้ไข', isCurrent: true },
  ];

  // shop - only view
  if (role != 'admin' && role != 'business_unit' && pageAction === false) {
    navigate('/');
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

  const { mutate: fetchAssetData, isLoading: isLoadingAssetData } = useAssetFindMutation({
    async onSuccess(res: any) {
      const setFormValue = res.data;
      setFormData(setFormValue);
      
      if (setFormValue?.asset_images.length > 0) {
        await setFormValue.asset_images.forEach(async (item: AssetsImage) => {
          setImages((prev: any) => [...prev, { dataURL: item.image_url, name: item.name, id: item.id }]);
        });
      }
      fetchAssetNameData({ data: { id_asset_type: setFormValue.id_asset_type } });
      fetchAssetColorData({ data: { id_asset_type: setFormValue.id_asset_type } });
      fetchAssetModelData({ data: { id_asset_type: setFormValue.id_asset_type } });
      fetchAssetCapacityData({ data: { id_asset_type: setFormValue.id_asset_type } });
      fetchShopData({
        data: {
          query: setFormValue.shop.name,
        }
      });
    },
    onError(error: any) { },
  });

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

  const handleChangeAssetModel = (props: any, event: any, name: any) => {
    fetchAssetModelData({ data: { id_asset_type: event?.value } });
    fetchAssetColorData({ data: { id_asset_type: event?.value } });
    fetchAssetCapacityData({ data: { id_asset_type: event?.value } });
    props.setFieldValue('capacity', '');
    props.setFieldValue('color', '');
    props.setFieldValue('model_number', '');
  };

  const handleChangeAssetType = (props: any, event: any, name: any) => {
    fetchAssetNameData({ data: { id_asset_type: event.value } });
    props.setFieldValue('name', event.value);
  };

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
  

  const { mutateAsync: uploadFile } = useUploadMutation({
    onSuccess: (res: any) => {
     
    },
    onError: (err: any) => {
      
    },
  });

  const { mutateAsync: assetImgCreate } = useGlobalMutation(url_api.assetImgCreate, {})
  const { mutateAsync: assetImgDetele } = useAssetImgDeleteMutation();

  const { mutate: assetUpdate, isLoading } = useAssetUpdateMutation({
    onSuccess: async (res: any) => {
      if (res.code === 200 || res.statusCode === 200) {
        const uploadPromises: any[] = [];
        const deletePromises: any[] = [];
        formData.asset_images?.forEach((item: any) => {
          const isDeleted = images.find((a: any) => a.id === item.id);
          if (_.isUndefined(isDeleted)) {
            deletePromises.push(assetImgDetele({ data: { id: item.id } }));
          }
        });
        images.forEach((item: any) => {
          if (_.isUndefined(item?.id)) {
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
                title: 'เพิ่มไฟล์ผิดพลาดกรุณาใช้ไฟล์ที่เป็นรูปเท่านั้น',
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
          title: 'แก้ไขสำเร็จ',
          padding: '10px 20px',
        });
        navigate('/apps/asset/list');
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        });
      }
    },
    onError: (err: any) => { },
  });

  useEffect(() => {
    fetchAssetData({
      data: {
        id: id || dataStoredAsset.id
      }
    });

    // fetchShopData({
    //   data: {
    //     id_shop: parseInt(dataStoredAsset?.shop?.id),
    //   }
    // });

    fetchAssetCapacityData({ data: {} })
    fetchAssetTypeData({ data: { page: 1, page_size: -1 } });
  }, []);


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
 
  const submitForm = useCallback(
    async (event: any) => {
      delete event.shop
      assetUpdate({
        data: {
          ...event,
          price: Number(event.price),
        },
      });
    },
    [assetUpdate, images]
  );

  const onImgChange = async (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    const resizedImages = await resizeImage(imageList);
    setImages(resizedImages);
  };

  const onError = () => {
    toast.fire({
      icon: 'error',
      title: 'รูปภาพเกิน 15 รูป',
      padding: '10px 20px',
    });
  }

  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_asset_type: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    serial_number: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    price: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').matches(PRICE_REGEX, 'กรุณาใส่ราคาให้ถูกต้อง'),
  });

  const handleSearch = (props: any, event: any, name: any) => {
    fetchShopData({ data: { query: event } });
  };
  const goEdit = () => {
    const newPath = location.pathname.replace('/view', '/edit');
    navigate(newPath);
  }

  if (isLoadingAssetTypeData || isLoadingAssetData) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-2.5">
      {(isLoading || isLoading) && <PreLoading />}
      <div className="flex items-center justify-between flex-wrap">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex">
          {
            (pageAction && role !== 'shop') && (
              <a className="hover:text-info cursor-pointer btn btn-primary mr-1" onClick={() => goEdit()}>
                <IconEdit className="w-4.5 h-4.5" /> &nbsp;
                แก้ไข
              </a>
            )
          }
        </div>
      </div>
      <div className="panel px-6 flex-1 py-6">
        <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
          {(props) => (
            <Form className="space-y-5 dark:text-white custom-select">
              <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">ข้อมูลสินทรัพย์</div>
              <div className="input-flex-row">
                <div className="w-full">
                  <InputField label="หมายเลขซีเรียล" name="serial_number" type="text" disabled={pageAction} />
                </div>
              </div>
              <div className="input-flex-row">
                <SelectField
                  id="id_shop"
                  label="ร้านค้า"
                  name="id_shop"
                  options={shopListData}
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
                  disabled={pageAction || formData.on_contract == true}
                />
                <SelectField
                  id="id_asset_type"
                  label="ประเภทสินทรัพย์"
                  name="id_asset_type"
                  options={assetTypeList}
                  disabled={pageAction}
                  onChange={(event: any) => {
                    handleChangeAssetType(props, event, 'id_asset_type')
                  }}
                />
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <label>ชื่อสินทรัพย์ <span className="text-rose-600"> * </span></label>
                  <div className={'relative text-white-dark'}></div>
                  <CreatableSelect
                    id="name"
                    placeholder="ชื่อสินทรัพย์"
                    name="name"
                    isDisabled={pageAction}
                    isClearable
                    options={assetNameList}
                    onChange={(event: any) => {
                      props.setFieldValue('name', event ? event.label : '')
                      handleChangeAssetModel(props, event, 'name')
                    }}
                    defaultValue={{ value: formData?.name, label: formData?.name }}
                  /></div>
                <div className="input-container">
                  <label>หมายเลขรุ่น</label>
                  <div className={'relative text-white-dark'}>
                    <CreatableSelect
                      id="model_number"
                      placeholder="หมายเลขรุ่น"
                      name="model_number"
                      isDisabled={pageAction}
                      isClearable
                      options={assetModelList}
                      onChange={(event: any) => {
                        props.setFieldValue('model_number', event ? event.label : '')
                      }}
                      defaultValue={{ value: formData?.model_number, label: formData?.model_number }}
                    />
                  </div>
                </div>
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <label>ความจุ <span className="text-rose-600"> * </span></label>
                  <div className={'relative text-white-dark'}>
                    <CreatableSelect
                      id="capacity"
                      placeholder="ความจุ"
                      name="capacity"
                      isDisabled={pageAction}
                      isClearable
                      options={assetCapacityList}
                      onChange={(event: any) => {
                        props.setFieldValue('capacity', event ? event.label : '')
                      }}
                      defaultValue={{ value: formData?.capacity, label: formData?.capacity }}
                    />
                  </div>
                </div>
                <div className="input-container">
                  <label>สี</label>
                  <div className={'relative text-white-dark'}>
                    <CreatableSelect
                      id="color"
                      placeholder="สี"
                      name="color"
                      isDisabled={pageAction}
                      isClearable
                      options={assetColorList}
                      onChange={(event: any) => {
                        props.setFieldValue('color', event ? event.label : '')
                      }}
                      defaultValue={{ value: formData?.color, label: formData?.color }}
                    />
                  </div>
                </div>
              </div>
              <div className="input-flex-row">
                <InputField
                  label="หมายเลข IMEI"
                  name="imei"
                  type="text"
                  maxLength={15}
                  disabled={pageAction}
                  onKeyPress={(e: any) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                />
                <InputField
                  label="ราคาขาย"
                  require={true}
                  name="price"
                  disabled={pageAction}
                  onKeyPress={(e: any) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                />
              </div>
              <div className="input-flex-row">
                <InputField
                  label="ข้อสังเกตุ"
                  name="note"
                  as="textarea"
                  rows="4"
                  placeholder="กรุณาใส่ข้อมูล"
                  className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                  disabled={pageAction}
                />
              </div>
              <div className="input-flex-row">
                <div className="custom-file-container" data-upload-id="Image">
                  <div className="label-container">
                    <label> รูปสินทรัพย์ </label>
                    {!pageAction && images.length > 0 && (
                      <button
                        type="button"
                        className="custom-file-container__image-clear"
                        title="Clear Image"
                        onClick={() => {
                          setImages([]);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <label className={`custom-file-container__custom-file` + (pageAction ? ' hidden' : '')}></label>
                  <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" disabled={pageAction} />
                  <input type="hidden" name="MAX_FILE_SIZE" value="10485760" disabled={pageAction} />
                  <ImageUploading multiple value={images} onChange={onImgChange} onError={onError} maxNumber={15}>
                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                      <div className="upload__image-wrapper">
                        {!pageAction && (
                          <button type="button" className="custom-file-container__custom-file__custom-file-control custom-btn-select-file" onClick={onImageUpload}>
                            เลือกไฟล์...
                          </button>
                        )}
                        &nbsp;
                        <div className="grid gap-4 sm:grid-cols-3 grid-cols-1">
                          {imageList.map((image, index) => (
                            <div key={index} className="custom-file-container__image-preview relative">
                              {!pageAction && (
                                <button
                                  type="button"
                                  className="custom-file-container__image-clear bg-dark-light dark:bg-dark dark:text-white-dark rounded-full block w-fit p-1 absolute top-0 right-0 z-10"
                                  title="Clear Image"
                                  onClick={() => {
                                    onImageRemove(index);
                                  }}
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
              {!pageAction && (
                <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                  {isLoading && <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>}
                  แก้ไข
                </button>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );

};

export default Edit;