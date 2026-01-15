import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { Shop } from '../../../types/index';
import { useShopFindMutation } from '../../../services/mutations/useShopMutation';
import { Form, Formik } from 'formik';
import { Tab } from '@headlessui/react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { googleApiKey, defaultCenter } from '../../../helpers/constant';
import InputField from '../../../components/HOC/InputField';
import SelectField from '../../../components/HOC/SelectField';
import Breadcrumbs from '../../../helpers/breadcrumbs';
import { formatBankAccountNumber } from '../../../helpers/formatNumeric';
import { useDistrictMutation, useSubDistrictMutation } from '../../../services/mutations/useProvincesMutation'
import themeInit from '../../../theme.init';
import List from '../ShopUser/List';
import { useTranslation } from 'react-i18next'

const defaultForm = {
  username: '',
  name: '',
  tax_id: '',
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
  is_active: true,
  is_approved: true,
  bank_no: '',
  bank_account: '',
  bank_name: '',
};

const defaultBankForm = {
  bank_account_name: '',
  id_bank: '',
  bank_account_number: '',
};

const mode = process.env.MODE || 'admin'

const ShopDetail = () => {
  const { t } = useTranslation();              // 新增

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const storedUser = localStorage.getItem(mode);
  const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null;

  const breadcrumbItems = [
    { label: t('shop_info'), isCurrent: true },  // 已有 key：店铺信息
  ];

  if (!id_shop) {
    navigate('/');
  }

  useEffect(() => {
    dispatch(setPageTitle(t('shop_info')))       // 已有 key：店铺信息
  });

  const dataStoredProvinces = useSelector((state: IRootState) => state.dataStore.provinces);
  const [districtIdList, setDistrictIdList] = useState<any>([])
  const [subDistrictIdList, setSubDistrictIdList] = useState<any>([])
  const [marker, setMarker] = useState<any>(defaultCenter);
  const [shopFormData, setShopFormData] = useState<Shop>(defaultForm);
  const [bankList, setBankList] = useState<any>([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleApiKey,
  });

  const { mutate: fetchShopData, isLoading: isShopLoading, isError } = useShopFindMutation({
    onSuccess: (res: any) => {
      const setFormValue = res.data;
      setFormValue.password = '';
      setFormValue.password_repeat = '';
      setBankList(setFormValue?.shop_banks ?? []);
      setShopFormData((prev) => ({ ...prev, ...setFormValue, id: id_shop }));
      getDistrict({ id: setFormValue?.id_province, type: 'id_province' })
      getSubDistrict({ id: setFormValue?.id_district, type: 'id_district' })
      if (setFormValue.latitude && setFormValue.longitude) {
        setMarker({
          lat: parseFloat(setFormValue.latitude),
          lng: parseFloat(setFormValue.longitude),
        });
      }
    },
  });

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

  useEffect(() => {
    fetchShopData({ data: { id: id_shop } });
  }, []);

  const handleChangeSelect = (props: any, event: any, name: any) => {
    props.setFieldValue(name, event.value);
  };

  const handleMapClick = (props: any, event: any) => {
    props.setFieldValue('latitude', event.latLng.lat().toString());
    props.setFieldValue('longitude', event.latLng.lng().toString());
    setMarker({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  };

  if (!isLoaded || isShopLoading || isError) return <div>Loading...</div>;

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex xl:flex-row flex-col gap-2.5 mt-3">
        <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
          <Formik initialValues={shopFormData} onSubmit={() => console.log('Submit') } enableReinitialize autoComplete="off">
            {(props) => (
              <Form className="space-y-5 dark:text-white ">
                <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                {t('shop_account')}  
                </div>
                <div>
                  <Tab.Group>
                    <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                      <Tab as={Fragment}>
                        {({ selected }) => (
                          <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                             {t('shop_account')}   
                          </button>
                        )}
                      </Tab>
                      
                      {!themeInit.features?.shop_user &&
                        <Tab as={Fragment}>
                        {({ selected }) => (
                          <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                            {t('user_account')} 
                          </button>
                        )}
                       </Tab>
                      }

                      <Tab as={Fragment}>
                        {({ selected }) => (
                          <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                             {t('bank_account')}  
                          </button>
                        )}
                      </Tab>

                      {themeInit.features?.shop_user &&
                        <Tab as={Fragment}>
                          {({ selected }) => (
                            <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                               {t('employee')}    
                            </button>
                          )}
                        </Tab>
                      }

                    </Tab.List>
                    <Tab.Panels>
                      <Tab.Panel>
                        <div className="input-flex-row pt-2">
                          <div className="check-container">
                            <InputField
                              label={t('tax_id')}        
                              name="tax_id"
                              type="text"
                              disabled={true}
                              maxLength={13}
                            />
                          </div>
                        </div>
                        <hr className="mt-4"></hr>
                        <div className="input-flex-row mt-4">
                          <InputField
                                label={t('shop_name')}   
                            name="name"
                            type="text"
                            disabled={true}
                          />
                          <InputField
                            label={t('contact_name')} 
                            name="contact_name"
                            type="text"
                            disabled={true}
                          />
                        </div>
                        <div className="input-flex-row">
                          <InputField
                            label={t('phone_number')} 
                            name="phone_number"
                            type="text"
                            disabled={true}
                          />
                          <InputField
                            label="Line ID"
                            name="line_id"
                            type="text"
                            disabled={true}
                          />
                        </div>
                        <div className="input-flex-row">
                          <InputField
                            label="Facebook ID"
                            name="facebook_id"
                            type="text"
                            disabled={true}
                          />
                          <InputField
                            label={t('website')}
                            name="website"
                            type="text"
                            disabled={true}
                          />
                        </div>
                        <div className="input-flex-row">
                          <InputField
                            label={t('email')}    
                            name="email"
                            type="text"
                            disabled={true}
                          />
                        </div>
                        <div className="input-flex-row">
                          <InputField
                            label={t('address')}      
                            name="address"
                            as="textarea"
                            rows="1"
                            placeholder={t('please_enter_info')} 
                            className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                            disabled={true}
                          />
                          <SelectField
                            label={t('province')}
                            id="id_province"
                            name="id_province"
                            options={dataStoredProvinces}
                            placeholder={t('please_select')}       
                            onChange={(e: any) => handleChangeSelect(props, e, 'id_province')}
                            isSearchable={false}
                            disabled={true}
                          />
                        </div>
                        <div className="input-flex-row">
                            <SelectField
                              require={true}
                              label={t('district')}    
                              id="id_district"
                              name="id_district"
                              placeholder={t('please_select')} 
                              options={districtIdList}
                              disabled={true}
                            />
                            <SelectField
                              require={true}
                              label={t('subdistrict')}    
                              id="id_subdistrict"
                              name="id_subdistrict"
                              placeholder={t('please_select')} 
                              options={subDistrictIdList}
                              disabled={true}
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
                            <InputField
                              label={t('zip_code')}
                              name="zip_code"
                              as="textarea"
                              rows="1"
                              disabled={true}
                            />
                            <div className="blank-container"></div>
                          </div>
                        <div className="input-flex-row mb-3">
                          <GoogleMap
                            mapContainerStyle={{
                              height: '400px',
                              width: '100%',
                            }}
                            zoom={13}
                            center={marker}
                            onClick={(e: any) => (!true ? handleMapClick(props, e) : null)}
                          >
                            {marker && <Marker position={{ lat: marker.lat, lng: marker.lng }} />}
                          </GoogleMap>
                        </div>
                      </Tab.Panel>

                      {!themeInit.features?.shop_user &&
                      <Tab.Panel>
                        <div className="input-flex-row pt-2">
                          <InputField
                            label={t('username')}      
                            name="username"
                            type="text"
                            disabled={true}
                          />
                        </div>
                      </Tab.Panel>
                      }
                      <Tab.Panel>
                        <div className="mt-5 pt-2 panel p-0 border-0 overflow-hidden">
                          <div className="table-responsive">
                            <table className="table-striped table-hover">
                              <thead>
                                <tr>
                                  <th>{t('order')}</th>               {/* 已有 key */}
                                  <th>{t('bank_account_name')}</th>   {/* 已有 key */}
                                  <th>{t('bank')}</th>                {/* 已有 key */}
                                  <th>{t('bank_account_number')}</th> {/* 已有 key */}
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
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );

};

export default ShopDetail;
