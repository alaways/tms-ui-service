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

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const storedUser = localStorage.getItem(mode);
  const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null;

  const breadcrumbItems = [
    { label: 'ข้อมูลร้านค้า', isCurrent: true },
  ];

  if (!id_shop) {
    navigate('/');
  }

  useEffect(() => {
    dispatch(setPageTitle('ข้อมูลร้านค้า'));
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
                  บัญชีร้านค้า
                </div>
                <div>
                  <Tab.Group>
                    <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                      <Tab as={Fragment}>
                        {({ selected }) => (
                          <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                            บัญชีร้านค้า
                          </button>
                        )}
                      </Tab>
                      
                      {!themeInit.features?.shop_user &&
                        <Tab as={Fragment}>
                        {({ selected }) => (
                          <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                            บัญชีผู้ใช้งาน
                          </button>
                        )}
                       </Tab>
                      }

                      <Tab as={Fragment}>
                        {({ selected }) => (
                          <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
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
                        <div className="input-flex-row pt-2">
                          <div className="check-container">
                            <InputField
                              label="เลขประจำตัวผู้เสียภาษี"
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
                            label="ชื่อร้าน"
                            name="name"
                            type="text"
                            disabled={true}
                          />
                          <InputField
                            label="ชื่อผู้ติดต่อ"
                            name="contact_name"
                            type="text"
                            disabled={true}
                          />
                        </div>
                        <div className="input-flex-row">
                          <InputField
                            label="เบอร์โทรศัพท์"
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
                            label="เว็บไซต์"
                            name="website"
                            type="text"
                            disabled={true}
                          />
                        </div>
                        <div className="input-flex-row">
                          <InputField
                            label="อีเมล"
                            name="email"
                            type="text"
                            disabled={true}
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
                            disabled={true}
                          />
                          <SelectField
                            label="จังหวัด"
                            id="id_province"
                            name="id_province"
                            options={dataStoredProvinces}
                            placeholder="กรุณาเลือก"
                            onChange={(e: any) => handleChangeSelect(props, e, 'id_province')}
                            isSearchable={false}
                            disabled={true}
                          />
                        </div>
                        <div className="input-flex-row">
                            <SelectField
                              require={true}
                              label="อำเภอ/เขต"
                              id="id_district"
                              name="id_district"
                              placeholder="กรุณาเลือก"
                              options={districtIdList}
                              disabled={true}
                            />
                            <SelectField
                              require={true}
                              label="ตำบล/แขวง"
                              id="id_subdistrict"
                              name="id_subdistrict"
                              placeholder="กรุณาเลือก"
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
                              label="รหัสไปรษณีย์"
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
                            label="ชื่อผู้ใช้งาน"
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
                                  <th>ลำดับ</th>
                                  <th>ชื่อบัญชีธนาคาร</th>
                                  <th>ธนาคาร</th>
                                  <th>เลขบัญชีธนาคาร</th>
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
