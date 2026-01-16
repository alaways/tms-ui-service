import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { defaultCenter, googleApiKey, toastAlert } from '../../helpers/constant';
import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { Form, Formik } from 'formik';
import InputField from '../../components/HOC/InputField';
import SelectField from '../../components/HOC/SelectField';
import Swal from 'sweetalert2';
import { Shop } from '../../types/index';
import * as Yup from 'yup';
import { useGlobalMutation } from '../../helpers/globalApi';
import { url_api } from '../../services/endpoints';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    
    useEffect(() => {
        dispatch(setPageTitle(t('shop_registration')));
    });

    const [shopGroup, setShopGroup] = useState<any>([]);
    const [businessUnit, setBusinessUnit] = useState<any>([]);
    const [provinces, setProvinces] = useState<any>([]);

    const [formData] = useState<Shop>({
        id_shop_group: '',
        id_business_unit: '',
        name: '',
        password: '',
        password_repeat: '',
        contact_name: '',
        phone_number: '',
        line_id: '',
        facebook_id: '',
        website: '',
        email: '',
        address: '',
        id_province: '',
        latitude: '',
        longitude: '',
        bank_no: '',
    });

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required(t('please_enter_data')),
        id_shop_group: Yup.string().required(t('please_enter_data')),
        id_business_unit: Yup.string().required(t('please_enter_data')),
        id_province: Yup.string().required(t('please_enter_data')),
        email: Yup.string().email(t('please_enter_valid_email')).required(t('please_enter_data')),
        password: Yup.string().required(t('please_enter_data')),
        password_repeat: Yup.string()
            .oneOf([Yup.ref('password'), null], t('password_not_match'))
            .required(t('please_enter_data')),
    });


    const { mutate: fetchProvincesData,isLoading: isProvincesLoading} = useGlobalMutation(url_api.provincesFindAllGuest, {
        onSuccess: (res: any) => {
            setProvinces(res.data.map((item: any) => ({
            value: item.id,
            label: item.name,
            })));
        },
    });

    const { mutate: fetchBusinessUnitData, isLoading: isBusinessUnitLoading } = useGlobalMutation(url_api.businessUnitFindAllGuest, {
        onSuccess: (res: any) => {
            setBusinessUnit(res.data.map((item: any) => ({
                value: item.id,
                label: item.name,
            })));
        },
        onError: (err: any) => {},
    });


    const { mutate: fetchShopGroupData, isLoading: isShopGroupLoading } = useGlobalMutation(url_api.shopGroupFindAllGuest, {
        onSuccess: (res: any) => {
            setShopGroup(res.data.map((item: any) => ({
                value: item.id,
                label: item.name,
            })));
        },
        onError: (err: any) => {},
    });
     const { mutate: shopRegister, } = useGlobalMutation(url_api.shopRegister, {
         onSuccess: (res: any) => {
            const toast = Swal.mixin(toastAlert);
            toast.fire({
                icon: 'success',
                title: t('shop_registration_success'),
                padding: '10px 20px',
            });
            navigate('/apps/shop/list');
        },
        onError: (err: any) => {},
    });

   
    useEffect(() => {
        fetchBusinessUnitData({
            page: 1,
            page_size: -1,
        });
        fetchShopGroupData({
            page: 1,
            page_size: -1,
        });
        fetchProvincesData({
            page: 1,
            page_size: -1,
        });
    }, []);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: googleApiKey,
    });

    const handleChangeSelect = (props: any, event: any, name: any) => {
        props.setFieldValue(name, event.value);
    };

    const submitForm = useCallback(
        (event: any) => {
            shopRegister({
                data: {
                    ...event,
                    "is_approved": false,
                    "is_active": true
                },
            });
        },
        [formData]
    );

    const handleMapClick = (props: any, event: any) => {
        props.setFieldValue('latitude', event.latLng.lat().toString());
        props.setFieldValue('longitude', event.latLng.lng().toString());
    };


    if (!isLoaded || isShopGroupLoading || isBusinessUnitLoading || isProvincesLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[1502px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-10">
                        <div className="mx-auto w-full max-w-[1080px]">
                            <div className="mb-5">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{t('shop_registration')}</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">{t('fill_in_complete_information')}</p>
                            </div>
                            <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off">
                                {(props) => (
                                    <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                                        {(props) => (
                                            <Form className="space-y-5 dark:text-white ">
                                                <div className="input-flex-row">
                                                    <InputField label={t('shop_name')} name="name" type="text" />
                                                </div>
                                                <div className="input-flex-row">
                                                    <SelectField
                                                        label={t('shop_group')}
                                                        id="id_shop_group"
                                                        name="id_shop_group"
                                                        options={shopGroup}
                                                        placeholder={t('please_select')}
                                                        onChange={(e: any) => handleChangeSelect(props, e, 'id_shop_group')}
                                                        isSearchable={false}
                                                    />
                                                    <SelectField
                                                        label={t('business_unit')}
                                                        id="id_business_unit"
                                                        name="id_business_unit"
                                                        options={businessUnit}
                                                        placeholder={t('please_select')}
                                                        onChange={(e: any) => handleChangeSelect(props, e, 'id_business_unit')}
                                                        isSearchable={false}
                                                    />
                                                </div>
                                                <div className="input-flex-row">
                                                    <InputField label={t('password')} name="password" type="password" />
                                                    <InputField label={t('confirm_password')} name="password_repeat" type="password" />
                                                </div>
                                                <div className="input-flex-row">
                                                    <InputField label={t('main_contact_name')} name="contact_name" type="text" />
                                                    <InputField label={t('shop_phone_number')} name="phone_number" type="text" />
                                                </div>
                                                <div className="input-flex-row">
                                                    <InputField label={t('line_id')} name="line_id" type="text" />
                                                    <InputField label={t('facebook_id')} name="facebook_id" type="text" />
                                                </div>
                                                <div className="input-flex-row">
                                                    <InputField label={t('website')} name="website" type="text" />
                                                    <InputField label={t('email')} name="email" type="text" />
                                                </div>
                                                <div className="input-flex-row">
                                                    <InputField
                                                        label={t('address')}
                                                        name="address"
                                                        as="textarea"
                                                        rows="1"
                                                        placeholder={t('please_enter_data')}
                                                        className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                                                    />
                                                    <SelectField
                                                        label={t('province')}
                                                        id="id_province"
                                                        name="id_province"
                                                        options={provinces}
                                                        placeholder={t('please_select')}
                                                        onChange={(e: any) => handleChangeSelect(props, e, 'id_province')}
                                                        isSearchable={false}
                                                    />
                                                </div>
                                                <div className="input-flex-row">
                                                    <InputField label={t('shop_bank_account')} name="bank_no" type="text" />
                                                </div>
                                                <div className="input-flex-row">
                                                    <InputField label={t('latitude')} name="latitude" type="text" />
                                                    <InputField label={t('longitude')} name="longitude" type="text" />
                                                </div>
                                                <div className="input-flex-row mb-3">
                                                    <GoogleMap
                                                        mapContainerStyle={{
                                                            height: '400px',
                                                            width: '100%',
                                                        }}
                                                        zoom={13}
                                                        center={defaultCenter}
                                                        onClick={(e: any) => handleMapClick(props, e)}
                                                    />
                                                </div>
                                                <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                                                    {t('add')}
                                                </button>
                                            </Form>
                                        )}
                                    </Formik>
                                )}
                            </Formik>
                            <div className="mt-7 text-center dark:text-white">
                                {t('have_shop_account_login')}&nbsp;
                                <Link to="/apps/login" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    {t('login')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
