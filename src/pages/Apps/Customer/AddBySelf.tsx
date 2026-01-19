import { Form, Formik, FormikProps, useFormikContext } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { thaiTitles, toastAlert } from '../../../helpers/constant';
import { useEffect, useState } from 'react';
import { IRootState } from '../../../store';
import { useSelector } from 'react-redux';
import InputField from '../../../components/HOC/InputField';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import SelectField from '../../../components/HOC/SelectField';
import { resizeImage } from '../../../helpers/helpFunction';
import { useGlobalErrorMutation, useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';
import { useOCRMutation, useUploadPreScreenMutation } from '../../../services/mutations/useUploadMutation';
import CameraOCR from '../../../components/CameraOCR';
import { useDistrictMutation, useSubDistrictMutation } from '../../../services/mutations/useProvincesMutation';
import Checkbox from '../../../components/HOC/CheckboxField';
import { Customer } from '../../../types';
import { useNavigate, useParams } from 'react-router-dom';
import { showNotification } from '../../../helpers/showNotification';

const mode = process.env.MODE || 'admin';

const ScrollToTopOnErrors = () => {
    const { submitCount, isValid } = useFormikContext();
    useEffect(() => {
        if (submitCount > 0 && !isValid) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [submitCount, isValid]);
    return null;
};

const AddBySelf = () => {
    const toast = Swal.mixin(toastAlert);
    const navigate = useNavigate();
    

    const [isFoundCitizen, setIsFoundCitizen] = useState<number>(0);
    const [citizenImageFile, setCitizenImageFile] = useState<any>([]);
    const [verificationImageFile, setVerificationImageFile] = useState<any>([]);

    const storedUser = localStorage.getItem(mode);
    const { id } = useParams()
    const prescreen_ref = id
    const [uuid_shop, setShopUUID] = useState<string>('');

    const [districtIdList, setDistrictIdList] = useState<any>([]);
    const [districtCurrentList, setDistrictCurrentList] = useState<any>([]);
    const [districtWorkList, setDistrictWorkList] = useState<any>([]);

    const [subDistrictIdList, setSubDistrictIdList] = useState<any>([]);
    const [subDistrictCurrentList, setSubDistrictCurrentList] = useState<any>([]);
    const [subDistrictWorkList, setSubDistrictWorkList] = useState<any>([]);

    const [isLoadding, setIsLoadding] = useState(false);
    const [citizenId, setCitizenId] = useState('');
    const [lockZipCode, setLockZipCode] = useState(true);
    const [actionModal, setActionModal] = useState(false);
    const [isCameraOcr, setIsCameraOcr] = useState(false);
    const [provinces,setProvinces] = useState([])

    const { mutate: fetchProvincesData} = useGlobalMutation(url_api.provincesFindAll, {
            onSuccess: (res: any) => {
               if (res.message) {
                  const provinces = res.data.map((item: any) => ({
                    value: item.id,
                    label: item.name_th,
                  }))
                  setProvinces(provinces)
    
                }
            },
    });

    useEffect(() => {
        fetchProvincesData({})
    },[])
    
    const SubmittedForm = Yup.object().shape({
        title: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        phone_number: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').length(10, 'กรุณาใส่ข้อมูลให้ครบ 10 เลข'),
        citizen_id: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').length(13, 'กรุณาใส่ข้อมูลให้ครบ 13 หลัก'),
        email: Yup.string()
            .required('กรุณาใส่ข้อมูลให้ครบ')
            .matches(/^[A-Za-z0-9@._]+$/, 'กรุณาใช้ตัวอักษรภาษาอังกฤษ ตัวเลข เครื่องหมายมหัพภาค(.) _ และ @ เท่านั้น')
            .email('กรุณาใส่อีเมลที่ถูกต้อง'),
        address: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        id_province: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        id_district: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        id_subdistrict: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        current_address: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        current_id_province: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        current_id_district: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        current_id_subdistrict: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        work_address: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        work_id_province: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        work_id_district: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        work_id_subdistrict: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    });

    const SubmittedFormCitizen = Yup.object().shape({
        // uuid_shop: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    });

    const { mutate: getPreeScreenInfo, isLoading: isLoading } = useGlobalMutation(url_api.customerPreScreenInfo, {
        onSuccess: (res: any) => {
          if (res.statusCode === 400 || res.code === 400) {
            navigate('/customer/timeout?openExternalBrowser=1')
          } else {
            setShopUUID(res?.data?.id_shop)
          }
        },
        onError: (error: any) => {
          console.log("error", error)
        }
    })

    useEffect(() => {
         getPreeScreenInfo({data:{ref:prescreen_ref}})
     },[])

    const [customerFormData, setCustomerFormData] = useState<any>({
        title: '',
        name: '',
        citizen_id: '',
        phone_number: '',
        phone_number_ref: '',
        uuid_shop: uuid_shop,
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
    });

    const submitForm = async (event: any) => {
        const uploadPromises = [];
        if (citizenImageFile[0]?.file) {
            uploadPromises.push(uploadFile({ data: { file: citizenImageFile[0].file, type: 'customer' , ref: prescreen_ref } }));
        } else {
            uploadPromises.push(Promise.resolve({}));
        }

        if (verificationImageFile[0]?.file) {
            uploadPromises.push(uploadFile({ data: { file: verificationImageFile[0].file, type: 'customer', ref: prescreen_ref  } }));
        } else {
            uploadPromises.push(Promise.resolve({}));
        }

        let res1, res2;
        if (uploadPromises.length > 0) {
            const results = await Promise.all(uploadPromises);
            res1 = results[0];
            res2 = results[1];
        }
        let customerParams = {
                ...event,
                is_active: true,
                citizen_image_url: res1?.data?.file_name || '',
                verification_image_url: res2?.data?.file_name || '',
                prescreen_ref:prescreen_ref
        };

        if(isFoundCitizen == 1) {
            if (customerParams.citizen_image_url === '' || customerParams.citizen_image_url === null) {
                toast.fire({
                    icon: 'warning',
                    title: 'ไม่พบข้อมูลรูปบัตรประชาชน',
                    padding: '10px 20px',
                });
                return;
            }
            if (customerParams.verification_image_url === '' || customerParams.verification_image_url === null) {
                toast.fire({
                    icon: 'warning',
                    title: 'ไม่พบข้อมูลรูปภาพยืนยันบุคคล',
                    padding: '10px 20px',
                });
                return;
            }
            await createCustomer({data:{...customerParams,uuid_shop:uuid_shop}})
        } else {
            if (customerParams?.citizen_image_url === '' || customerParams?.citizen_image_url === null) {
                toast.fire({
                    icon: 'warning',
                    title: 'ไม่พบข้อมูลรูปบัตรประชาชน',
                    padding: '10px 20px',
                });
                return;
            }
            if (customerParams?.verification_image_url === '' || customerParams?.verification_image_url === null) {
                toast.fire({
                    icon: 'warning',
                    title: 'ไม่พบข้อมูลรูปภาพยืนยันบุคคล',
                    padding: '10px 20px',
                });
                return;
            }
            await updateCustomer({data:customerParams,id:customerParams.uuid})
        }
        
    };

    const { mutateAsync: uploadFile, isLoading: isUpload } = useUploadPreScreenMutation({
        onSuccess: (res: any) => {},
        onError: (err: any) => {},
    });

    const { mutate: citizenIdSearch } = useGlobalMutation(url_api.customerSearchSelf, {
        onSuccess: (res: any, variables: any) => {
            if (res.statusCode === 200 || res.code === 200) {
                showNotification('พบข้อมูลนี้ในระบบแล้ว','success')
                const setFormValue = res?.data;
                if (setFormValue) {
                    
                    setIsFoundCitizen(2);
                    setCustomerFormData((prev: any) => ({ ...prev, uuid:res.data.uuid }));
                    // getDistrict({ id: setFormValue?.id_province, type: 'id_province' });
                    // getSubDistrict({ id: setFormValue?.id_district, type: 'id_district' });
                    // getDistrict({ id: setFormValue?.current_id_province, type: 'current_id_province' });
                    // getSubDistrict({ id: setFormValue?.current_id_district, type: 'current_id_district' });
                    // getDistrict({ id: setFormValue?.work_id_province, type: 'work_id_province' });
                    // getSubDistrict({ id: setFormValue?.work_id_district, type: 'work_id_district' });
                    // setCustomerFormData((prev: any) => ({ ...prev, ...setFormValue }));
                    // variables.props.setValues(setFormValue);
                    // if (setFormValue?.citizen_image_url) {
                    //     setCitizenImageFile([{ dataURL: setFormValue.citizen_image_url }]);
                    // }
                    // if (setFormValue?.verification_image_url) {
                    //     setVerificationImageFile([{ dataURL: setFormValue.verification_image_url }]);
                    // }
                }
            } else {
                setIsFoundCitizen(1);
                setCitizenImageFile([]);
                setVerificationImageFile([]);
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
                }));
            }
        },
    });
    
    const {mutateAsync: createCustomer} = useGlobalErrorMutation(url_api.customerCreatePrescreen,{
        onSuccess: (res:any) => {
            navigate('/apps/customer/pre-screen/thankyou?openExternalBrowser=1');
        },
        onError: (err:any) => showNotification(err.message,'error')
    })


    const {mutateAsync: updateCustomer} = useGlobalErrorMutation(url_api.customerPreScreenUpdate,{
        onSuccess: (res:any) => {
            navigate('/apps/customer/pre-screen/thankyou?openExternalBrowser=1');
        },
        onError: (err:any) => showNotification(err.message,'error')
    })

    const handleCheck = async (props: FormikProps<Customer>, event: any) => {
        if (event) {
            getDistrict({ id: props.values.id_province, type: 'current_id_province' });
            getSubDistrict({ id: props.values.id_district, type: 'current_id_district' });
            props.setFieldValue('current_address', props.values.address);
            props.setFieldValue('current_id_province', props.values.id_province);
            props.setFieldValue('current_id_district', props.values.id_district);
            props.setFieldValue('current_id_subdistrict', props.values.id_subdistrict);
            props.setFieldValue('current_zip_code', props.values.zip_code);
        } else {
            props.setFieldValue('current_address', '');
            props.setFieldValue('current_id_province', null);
            props.setFieldValue('current_id_district', null);
            props.setFieldValue('current_id_subdistrict', null);
            props.setFieldValue('current_zip_code', '');
        }
    };

    const handleCheckForWork = async (props: FormikProps<Customer>, event: any) => {
        if (event) {
            getDistrict({ id: props.values.id_province, type: 'work_id_province' });
            getSubDistrict({ id: props.values.id_district, type: 'work_id_district' });
            props.setFieldValue('work_address', props.values.address);
            props.setFieldValue('work_id_province', props.values.id_province);
            props.setFieldValue('work_id_district', props.values.id_district);
            props.setFieldValue('work_id_subdistrict', props.values.id_subdistrict);
            props.setFieldValue('work_zip_code', props.values.zip_code);
        } else {
            props.setFieldValue('work_address', '');
            props.setFieldValue('work_id_province', null);
            props.setFieldValue('work_id_district', null);
            props.setFieldValue('work_id_subdistrict', null);
            props.setFieldValue('work_zip_code', '');
        }
    };

    const { mutate: getDistrict } = useDistrictMutation({
        onSuccess: (res: any, variables: any) => {
            const mapList = res.data.map((item: any) => ({
                value: item.id,
                label: item.name_th,
            }));
            switch (variables.type) {
                case 'id_province':
                    setDistrictIdList(mapList);
                    break;
                case 'current_id_province':
                    setDistrictCurrentList(mapList);
                    break;
                case 'work_id_province':
                    setDistrictWorkList(mapList);
                    break;
                default:
                    break;
            }
        },
        onError: (err: any) => {},
    });

    const { mutate: getSubDistrict } = useSubDistrictMutation({
        onSuccess: (res: any, variables: any) => {
            const mapList = res.data.map((item: any) => ({
                value: item.id,
                label: item.name_th,
                zipCode: item.zip_code,
            }));
            switch (variables.type) {
                case 'id_district':
                    setSubDistrictIdList(mapList);
                    break;
                case 'current_id_district':
                    setSubDistrictCurrentList(mapList);
                    break;
                case 'work_id_district':
                    setSubDistrictWorkList(mapList);
                    break;
                default:
                    break;
            }
        },
        onError: (err: any) => {},
    });

    const handleChangeSelect = (props: any, event: any, name: any) => {
        const resetFields = (fields: string[], resetFunctions: Function[]) => {
            fields.forEach((field) => props.setFieldValue(field, null));
            resetFunctions.forEach((func) => func([]));
        };
        const actions: { [key: string]: () => void } = {
            id_province: () => {
                getDistrict({ id: event.value, type: name });
                resetFields(['id_district', 'id_subdistrict'], [setSubDistrictIdList, setSubDistrictIdList]);
            },
            current_id_province: () => {
                getDistrict({ id: event.value, type: name });
                resetFields(['current_id_district', 'current_id_subdistrict'], [setDistrictCurrentList, setSubDistrictCurrentList]);
            },
            work_id_province: () => {
                getDistrict({ id: event.value, type: name });
                resetFields(['work_id_district', 'work_id_subdistrict'], [setDistrictWorkList, setSubDistrictWorkList]);
            },
            id_district: () => {
                getSubDistrict({ id: event.value, type: name });
                resetFields(['id_subdistrict'], [setSubDistrictIdList]);
            },
            current_id_district: () => {
                getSubDistrict({ id: event.value, type: name });
                resetFields(['current_id_subdistrict'], [setSubDistrictCurrentList]);
            },
            work_id_district: () => {
                getSubDistrict({ id: event.value, type: name });
                resetFields(['work_id_subdistrict'], [setSubDistrictWorkList]);
            },
            id_subdistrict: () => {
                props.setFieldValue('zip_code', parseInt(event.zipCode));
            },
            current_id_subdistrict: () => {
                props.setFieldValue('current_zip_code', parseInt(event.zipCode));
            },
            work_id_subdistrict: () => {
                props.setFieldValue('work_zip_code', parseInt(event.zipCode));
            },
        };
        if (actions[name]) {
            actions[name]();
        }
    };

    const onImgChange = async (imageList: ImageListType) => {
        const resizedImages: any = await resizeImage(imageList);
        setCitizenImageFile(resizedImages);
    };

    const onImgChange2 = async (imageList: ImageListType) => {
        const resizedImages = await resizeImage(imageList);
        setVerificationImageFile(resizedImages);
    };

    const { mutateAsync: uploadOCR, isLoading: isOCRLoading } = useOCRMutation({
        onSuccess: (res: any) => {
            setCitizenId(res.data.citizen_id);
            setCustomerFormData((prev: any) => ({
                ...prev,
                // citizen_id: res?.data?.citizen_id ? res?.data?.citizen_id : customerFormData.citizen_id,
                citizen_id: customerFormData.citizen_id,
                name: res.data.name,
                address: res.data.address,
                subdistrict: res.data.subdistrict,
                district: res.data.district,
                province: res.data.province,
                id_district: res.data.id_district,
                id_subdistrict: res.data.id_subdistrict,
                id_province: res.data.id_province,
                zip_code: res.data?.zip_code ? parseInt(res.data?.zip_code) : '',
            }));
              getDistrict({
                id: res.data?.id_province,
                type: 'id_province',
              })
              getSubDistrict({
                id: res.data?.id_district,
                type: 'id_district',
              })
            if (!res.data?.zip_code) {
                setLockZipCode(false);
            }
        },
        onError: (error: any) => {
            setIsLoadding(false);
            toast.fire({
                icon: 'warning',
                title: 'ไม่สามารถอ่านค่ารูปบัตรประชาชนได้',
                padding: '10px 20px',
            });
        },
    });

    const onImgAnalisy = async () => {
        setIsLoadding(true);
        await uploadOCR({
            data: {
                image: citizenImageFile[0].file,
            },
        });
        setIsFoundCitizen(1)
        setIsLoadding(false);
        setActionModal(true);
    };

    const addressContent = (props: any) => {
        return (
            <>
                <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                    <div className=" border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                        <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex items-center text-[12px] font-semibold -mt-[10px] ">
                            ที่อยู่ตามบัตรประชาชน
                        </span>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="flex flex-col gap-3">
                            <InputField
                                require={true}
                                label="ที่อยู่"
                                name="address"
                                as="textarea"
                                rows="1"
                                onChange={(e: any) => {
                                    props.setFieldValue('address', e.target.value);
                                    props.setFieldValue('copyAddress', false);
                                    props.setFieldValue('copyAddressForWork', false);
                                }}
                            />
                            <SelectField
                                require={true}
                                label="จังหวัด"
                                id="id_province"
                                name="id_province"
                                options={provinces}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'id_province');
                                    props.setFieldValue('copyAddress', false);
                                    props.setFieldValue('copyAddressForWork', false);
                                }}
                                isSearchable={true}
                            />
                            <SelectField
                                require={true}
                                label="อำเภอ/เขต"
                                id="id_district"
                                name="id_district"
                                options={districtIdList}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'id_district');
                                    props.setFieldValue('copyAddress', false);
                                    props.setFieldValue('copyAddressForWork', false);
                                }}
                                isSearchable={true}
                                disabled={districtIdList.length === 0}
                            />
                            <SelectField
                                require={true}
                                label="ตำบล/แขวง"
                                id="id_subdistrict"
                                name="id_subdistrict"
                                options={subDistrictIdList}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'id_subdistrict');
                                    props.setFieldValue('copyAddress', false);
                                    props.setFieldValue('copyAddressForWork', false);
                                }}
                                isSearchable={true}
                                disabled={subDistrictIdList.length === 0}
                            />
                            <InputField label="รหัสไปรษณีย์" name="zip_code" as="textarea" rows="1" disabled={lockZipCode} />
                        </div>
                    </div>
                </div>
                <label className="flex cursor-pointer items-center">
                    <Checkbox name="copyAddress" label="ใช้ที่อยู่เดียวกับบัตรประชาชน" onCheck={(e: any) => handleCheck(props, e)} />
                </label>
                <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                    <div className="border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                        <span className="bg-white dark:bg-black  dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px] ">
                            ที่อยู่ปัจจุบัน
                        </span>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="flex flex-col gap-3">
                            <InputField
                                require={true}
                                label="ที่อยู่"
                                name="current_address"
                                as="textarea"
                                rows="1"
                                onChange={(e: any) => {
                                    props.setFieldValue('copyAddress', false);
                                    props.setFieldValue('current_address', e.target.value);
                                }}
                            />
                            <SelectField
                                require={true}
                                label="จังหวัด"
                                id="current_id_province"
                                name="current_id_province"
                                options={provinces}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'current_id_province');
                                    props.setFieldValue('copyAddress', false);
                                }}
                                isSearchable={true}
                            />
                            <SelectField
                                require={true}
                                label="อำเภอ/เขต"
                                id="current_id_district"
                                name="current_id_district"
                                options={districtCurrentList}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'current_id_district');
                                    props.setFieldValue('copyAddress', false);
                                }}
                                isSearchable={true}
                                disabled={districtCurrentList.length === 0}
                            />
                            <SelectField
                                require={true}
                                label="ตำบล/แขวง"
                                id="current_id_subdistrict"
                                name="current_id_subdistrict"
                                options={subDistrictCurrentList}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'current_id_subdistrict');
                                    props.setFieldValue('copyAddress', false);
                                }}
                                isSearchable={true}
                                disabled={subDistrictCurrentList.length === 0}
                            />
                            <InputField label="รหัสไปรษณีย์" name="current_zip_code" as="textarea" rows="1" disabled={lockZipCode} />
                        </div>
                    </div>
                </div>
                <label className="flex cursor-pointer items-center">
                    <Checkbox name="copyAddressForWork" label="ใช้ที่อยู่เดียวกับบัตรประชาชน" onCheck={(e: any) => handleCheckForWork(props, e)} />
                </label>
                <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                    <div className=" border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                        <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px]">
                            ที่อยู่ที่ทำงาน
                        </span>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="flex flex-col gap-3">
                            <InputField
                                require={true}
                                label="ที่อยู่"
                                name="work_address"
                                as="textarea"
                                rows="1"
                                onChange={(e: any) => {
                                    props.setFieldValue('copyAddressForWork', false);
                                    props.setFieldValue('work_address', e.target.value);
                                }}
                            />
                            <SelectField
                                require={true}
                                label="จังหวัด"
                                id="work_id_province"
                                name="work_id_province"
                                options={provinces}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'work_id_province');
                                    props.setFieldValue('copyAddressForWork', false);
                                }}
                                isSearchable={true}
                            />
                            <SelectField
                                require={true}
                                label="อำเภอ/เขต"
                                id="work_id_district"
                                name="work_id_district"
                                options={districtWorkList}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    props.setFieldValue('copyAddressForWork', false);
                                    handleChangeSelect(props, e, 'work_id_district');
                                }}
                                isSearchable={true}
                                disabled={districtWorkList.length === 0}
                            />
                            <SelectField
                                require={true}
                                label="ตำบล/แขวง"
                                id="work_id_subdistrict"
                                name="work_id_subdistrict"
                                options={subDistrictWorkList}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    props.setFieldValue('copyAddressForWork', false);
                                    handleChangeSelect(props, e, 'work_id_subdistrict');
                                }}
                                isSearchable={true}
                                disabled={subDistrictWorkList.length === 0}
                            />
                            <InputField label="รหัสไปรษณีย์" name="work_zip_code" as="textarea" rows="1" disabled={lockZipCode} />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const personalContent = (props: any) => {
        return (
            <div className="md:col-span-1 xl:col-span-6 ">
                <div className="input-flex-row">
                    <div className="check-container">
                        <InputField
                            require={true}
                            label="รหัสบัตรประชาชน"
                            name="citizen_id"
                            type="text"
                            maxLength={13}
                            onKeyUp={(e: any) => {
                                setCustomerFormData((prev: any) => ({
                                    ...prev,
                                    citizen_id: e.target.value,
                                }));
                            }}
                            onKeyPress={(e: any) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (props.values.citizen_id?.length === 13) {
                                        citizenIdSearch({
                                            data: { citizen_id: props.values.citizen_id?.toString() },
                                            props,
                                        });
                                    } else {
                                        toast.fire({
                                            icon: 'error',
                                            title: 'กรุณากรอกรหัสบัตรประชาชนให้ครบก่อนค้นหา',
                                            padding: '10px 20px',
                                        });
                                    }
                                    return;
                                }
                                if (!/[0-9]/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                        <button
                            type="button"
                            className="btn btn-dark mt-2 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                            onClick={() => {
                                if (props.values.citizen_id?.length === 13) {
                                    citizenIdSearch({ data: { citizen_id: props.values.citizen_id?.toString() }, props });
                                } else {
                                    toast.fire({
                                        icon: 'error',
                                        title: 'กรุณากรอกรหัสบัตรประชาชนให้ครบก่อนค้นหา',
                                        padding: '10px 20px',
                                    });
                                }
                            }}
                        >
                            ตรวจสอบ
                        </button>
                    </div>
                </div>
                {(isFoundCitizen === 1 || isFoundCitizen === 2) && (
                    <div className="input-flex-row">
                        <div className="upload-container w-full pb-3">
                            <div className="custom-file-container" data-upload-id="myFirstImage">
                                <div className="label-container">
                                    <label>
                                        รูปบัตรประชาชน <span className="text-rose-600">*</span>
                                    </label>
                                    
                                        <button
                                            type="button"
                                            className="custom-file-container__image-clear"
                                            title="Clear Image"
                                            onClick={() => {
                                                setCitizenImageFile([]);
                                            }}
                                        >
                                            ×
                                        </button>
                                    
                                </div>
                                <label className="custom-file-container__custom-file hidden"></label>
                                <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" />
                                <input type="hidden" name="MAX_FILE_SIZE1" value="10485760" />
                                <ImageUploading value={citizenImageFile} onChange={onImgChange}>
                                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                        <>
                                            <div className="upload__image-wrapper">
                                                <>
                                                    <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                                                        เลือกไฟล์...
                                                    </button>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <button type="button" className="btn btn-primary" onClick={() => setIsCameraOcr(true)} style={{ display: 'inline-block' }}>
                                                            ถ่ายรูป
                                                        </button>
                                                    </div>
                                                </>
                                                
                                                {imageList.map((image, index) => (
                                                    <div key={index} className="custom-file-container__image-preview relative pt-10 pb-10">
                                                        <img src={image.dataURL} alt="img" className={isFoundCitizen === 1 ? 'm-auto mt-10' : 'm-auto'} />
                                                    </div>
                                                ))}
                                            </div>
                                            {isFoundCitizen !== 2 && imageList.length > 0 && (
                                                <button type="button" className="btn btn-success mt-2 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" onClick={onImgAnalisy}>
                                                    ตรวจสอบบัตรประชาชน
                                                </button>
                                            )}
                                        </>
                                    )}
                                </ImageUploading>
                            </div>
                        </div>
                    </div>
                )}
                {isFoundCitizen === 1 || isFoundCitizen === 2 ? (
                    <>
                        {uploadContent()}
                        <hr className="mt-4"></hr>
                        <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">ข้อมูลส่วนบุคคล</div>
                        <div className="flex flex-col gap-3 mt-3">
                            <SelectField require={true} label="คำนำหน้า" id="title" name="title" options={thaiTitles} placeholder="กรุณาเลือก" isSearchable={true} />
                            <InputField require={true} label="ชื่อ-นามสกุล" name="name" type="text" />

                            <InputField
                                require={true}
                                label="เบอร์โทรติดต่อ"
                                name="phone_number"
                                type="text"
                                maxLength={10}
                                onKeyPress={(e: any) => {
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            <InputField
                                label="เบอร์โทรอ้างอิง"
                                name="phone_number_ref"
                                type="text"
                                maxLength={10}
                                onKeyPress={(e: any) => {
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />

                            <InputField label="Facebook ID" name="facebook_id" type="text" />
                            <InputField label="Line ID" name="line_id" type="text" />

                            <InputField label="Tiktok ID" name="tiktok_id" type="text" />
                            <InputField label="Instagram ID" name="instagram_id" type="text" />

                            <InputField require={true} label="Email" name="email" type="text" />
                        </div>

                        <br />
                        <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">ข้อมูลที่อยู่</div>
                        {addressContent(props)}
                    </>
                ) : (
                    ''
                )}
            </div>
        );
    };

    const uploadContent = () => {
        return (
            <div className="md:col-span-1 xl:col-span-2">
                <div className="upload-container mt-6">
                    <div className="custom-file-container" data-upload-id="myFirstImage">
                        <div className="label-container">
                            <label>
                                รูปยืนยันบุคคล <span className="text-rose-600">*</span>
                            </label>
                            <button
                                type="button"
                                className="custom-file-container__image-clear"
                                title="Clear Image"
                                onClick={() => {
                                    setVerificationImageFile([]);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <label className="custom-file-container__custom-file hidden"></label>
                        <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" />
                        <input type="hidden" name="MAX_FILE_SIZE2" value="10485760" />
                        <ImageUploading value={verificationImageFile} onChange={onImgChange2}>
                            {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                <div className="upload__image-wrapper">
                                   
                                        <button className="bg-[#F1F2F3] w-full text-left p-2 rounded-md" onClick={onImageUpload} type="button">
                                            เลือกไฟล์...
                                        </button>
                                    
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
        );
    };

    const handleCameraSubmit = (data: any) => {
        onImgChange([data]);
        setIsCameraOcr(false);
    };

    return (
        <div className="relative">
            {isCameraOcr ? <CameraOCR onSubmit={handleCameraSubmit} onClose={() => setIsCameraOcr(false)} /> :
            <div className="px-0 sm:px-10">
                <div className="px-3 sm:px-10 py-4 w-full m-auto panel mt-4 sm:mt-6 mb-24">
                    <Formik initialValues={customerFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                        {(props) => (
                            <Form>
                                <ScrollToTopOnErrors />
                                <h1 className="text-lg sm:text-xl font-bold text-center">รายละเอียดเอกสารยืนยันตัวตน</h1>
                                {personalContent(props)}
                                <div className="fixed left-0 bottom-0 w-full border-t bg-white py-3 sm:py-4 px-3 sm:px-10 flex justify-between items-center">
                                    <h5 onClick={() => navigate(-1)} className="font-bold cursor-pointer hover:text-primary text-sm sm:text-base">
                                        ย้อนกลับ
                                    </h5>
                                    {(isFoundCitizen === 1 || isFoundCitizen === 2) && (
                                        <button type="submit" className="btn btn-primary py-3 px-6 sm:py-4 sm:px-8 text-sm sm:text-base">
                                            ตกลง
                                        </button>
                                    )}
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
            }
        </div>
    );
};

export default AddBySelf;
