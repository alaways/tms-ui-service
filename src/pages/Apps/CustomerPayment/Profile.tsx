
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Formik, FormikProps } from 'formik';
import { thaiTitles, toastAlert } from '../../../helpers/constant';
import { IRootState } from '../../../store';
import InputField from '../../../components/HOC/InputField';
import SelectField from '../../../components/HOC/SelectField';
import IconLogout from '../../../components/Icon/IconLogout';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';

const mode = process.env.MODE || 'admin'

const Profile = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const creditLevelTypes = useSelector((state: IRootState) => state.dataStore.credit_level)
  const storedUser = JSON.parse(localStorage.getItem(mode) ?? '');

  const [customerFormData, setCustomerFormData] = useState<any>({

    title: '',
    name: '',
    citizen_id: '',
    phone_number: '',
    phone_number_ref: '',

    line_id: '',
    facebook_id: '',
    tiktok_id: '',
    instagram_id: '',

    email: '',
    credit_level: '',
    citizen_image_url: '',

    address: '',

    province_name: '',
    district_name: '',
    subdistrict_name: '',
    zip_code: '',

    current_address: '',
    current_province_name: '',
    current_district_name: '',
    current_subdistrict_name: '',
    current_zip_code: '',

    work_address: '',
    work_province_name: '',
    work_district_name: '',
    work_subdistrict_name: '',
    work_zip_code: '',

  });

  const { mutate: fetchCustomerData,isLoading: isCustomerLoading} = useGlobalMutation(url_api.customerGetProfile, {
      onSuccess: (res: any) => {
        const setFormValue = res.data;
        if (setFormValue.province !== undefined || setFormValue.province !== null) {
          setFormValue.province_name = setFormValue.province.name_th
          setFormValue.current_province_name = setFormValue.province.name_th
          setFormValue.work_province_name = setFormValue.province.name_th
        }
        if (setFormValue.district !== undefined || setFormValue.district !== null) {
          setFormValue.district_name = setFormValue.district.name_th
          setFormValue.current_district_name = setFormValue.district.name_th
          setFormValue.work_district_name = setFormValue.district.name_th
        }
        if (setFormValue.subdistrict !== undefined || setFormValue.subdistrict !== null) {
          setFormValue.subdistrict_name = setFormValue.subdistrict.name_th
          setFormValue.current_subdistrict_name = setFormValue.subdistrict.name_th
          setFormValue.work_subdistrict_name = setFormValue.subdistrict.name_th
        }
        if (setFormValue.zip_code !== undefined || setFormValue.subdistrict !== null) {
          setFormValue.subdistrict_name = setFormValue.subdistrict.name_th
          setFormValue.current_subdistrict_name = setFormValue.subdistrict.name_th
          //setFormValue.work_zip_code = setFormValue.subdistrict.name_th
        }
        setFormValue.tiktok_id = setFormValue.tiktok_id !== null ? setFormValue.tiktok_id : ''
        setFormValue.instagram_id = setFormValue.instagram_id !== null ? setFormValue.instagram_id : ''
        if (setFormValue.citizen_id?.length == 13) {
          const format = setFormValue.citizen_id.replace(/(\d{1})(\d{4})(\d{5})(\d{3})/, "$1-$2-$3-$4")
          setFormValue.citizen_id = format;
        }
        if (setFormValue.phone_number?.length == 9) {
          const format_phone = setFormValue.phone_number.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3") // 02-435-2356
          setFormValue.phone_number = format_phone;
        }
        if (setFormValue.phone?.length == 10) {
          const format_phone = setFormValue.phone_number.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3") // 089-345-2343
          setFormValue.phone_number = format_phone;
        }
        setCustomerFormData(setFormValue);
      },
      onError: (err: any) => { },
  });

  const { mutate: onLogout } = useGlobalMutation(url_api.logout, {
      onSuccess: (res: any) => {
        localStorage.removeItem(mode);
        navigate('/apps/login');
      }
  })

  useEffect(() => {
    fetchCustomerData({ data: { id: storedUser.id } });
  }, []);

  return (
    <div>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link to="/apps/customer-payment/list" className="text-primary hover:underline">
            หน้าหลัก
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>โปรไฟล์</span>
        </li>
      </ul>
      <div className="mt-5 p-5 pb-10 bg-white rounded-md border border-[#ebedf2] dark:border-[#191e3a]">
        <Formik initialValues={customerFormData} onSubmit={() => console.log('Submit')} enableReinitialize autoComplete="off">
          {(props) => (
            <Form className="space-y-5 dark:text-white custom-select">
              <div className="text-lg pt-3 font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                โปรไฟล์
              </div>
              <div className="grid md:grid-rows-1 xl:grid-cols-3 gap-2">
                <div className="md:col-span-1 xl:col-span-4 mr-6">
                  <div className="input-flex-row">
                    <div className="check-container">
                      <InputField
                        label="รหัสบัตรประชาชน"
                        name="citizen_id"
                        type="text"
                        disabled={true}
                      />
                    </div>
                  </div>
                  <hr className="mt-4"></hr>
                  <div className="text-l pt-5 pb-2 font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">
                    ข้อมูลส่วนบุคคล
                  </div>
                  <div className="input-flex-row">
                    <SelectField
                      label="คำนำหน้า"
                      id="title"
                      name="title"
                      disabled={true}
                      options={thaiTitles}
                      placeholder="กรุณาเลือก"
                    />
                    <InputField
                      label="ชื่อ-นามสกุล"
                      placeholder="ชื่อ-นามสกุล"
                      name="name"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="เบอร์โทรติดต่อ"
                      name="phone_number"
                      type="text"
                      disabled={true}
                    />
                    <InputField
                      label="เบอร์โทรอ้างอิง"
                      name="phone_number_ref"
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
                      label="Line ID"
                      name="line_id"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="Tiktok ID"
                      name="tiktok_id"
                      type="text"
                      disabled={true}
                    />
                    <InputField
                      label="Instagram ID"
                      name="instagram_id"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="Email"
                      name="email"
                      type="text"
                      disabled={true}
                    />
                    <div className="blank-container"></div>
                  </div>
                  <div className="text-l pt-5 pb-2 font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">
                    ที่อยู่ตามบัตรประชาชน
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="ที่อยู่"
                      name="address"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="จังหวัด"
                      id="province_name"
                      name="province_name"
                      type="text"
                      disabled={true}
                    />
                    <InputField
                      label="อำเภอ/เขต"
                      id="district_name"
                      name="district_name"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="ตำบล/แขวง"
                      id="subdistrict_name"
                      name="subdistrict_name"
                      type="text"
                      disabled={true}
                    />
                    <InputField
                      label="รหัสไปรษณีย์"
                      name="zip_code"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="text-l pt-5 pb-2 font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">
                    ที่อยู่ปัจจุบัน
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="ที่อยู่"
                      name="current_address"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="จังหวัด"
                      id="current_province_name"
                      name="current_province_name"
                      type="text"
                      disabled={true}
                    />
                    <InputField
                      label="อำเภอ/เขต"
                      id="current_district_name"
                      name="current_district_name"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="ตำบล/แขวง"
                      id="current_subdistrict_name"
                      name="current_subdistrict_name"
                      type="text"
                      disabled={true}
                    />
                    <InputField
                      label="รหัสไปรษณีย์"
                      name="current_zip_code"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="text-l pt-5 pb-2 font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">
                    ที่อยู่ที่ทำงาน
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="ที่อยู่"
                      name="work_address"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="จังหวัด"
                      id="work_province_name"
                      name="work_province_name"
                      type="text"
                      disabled={true}
                    />
                    <InputField
                      label="อำเภอ/เขต"
                      id="work_district_name"
                      name="work_district_name"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="input-flex-row">
                    <InputField
                      label="ตำบล/แขวง"
                      id="work_subdistrict_name"
                      name="work_subdistrict_name"
                      type="text"
                      disabled={true}
                    />
                    <InputField
                      label="รหัสไปรษณีย์"
                      name="work_zip_code"
                      type="text"
                      disabled={true}
                    />
                  </div>
                  <div className="sm:col-span-2 mt-5">
                    <a onClick={() => onLogout({})} className="btn btn-danger w-36">
                      <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                      ล็อคเอ้าท์
                    </a>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
        {/* <form className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 mb-5 bg-white dark:bg-black">
          <div className="flex flex-col sm:flex-row">
            <div className="ltr:sm:mr-4 rtl:sm:ml-4 w-full sm:w-2/12 mb-5">
              <img src="/assets/images/profile-40.png" alt="img" className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto" />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name">ชื่อ</label>
                <input id="name" type="text" className="form-input disabled:pointer-events-none disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed" disabled value={storedUser?.name} />
              </div>
              <div />
              <div>
                <label htmlFor="email">อีเมล</label>
                <input id="email" type="email" className="form-input disabled:pointer-events-none disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed" disabled value={storedUser?.email} />
              </div>
              <div />
              <div className="sm:col-span-2 mt-3">
                <a onClick={() => onLogout({})} className="btn btn-danger w-36">
                  <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                  ล็อคเอ้าท์
                </a>
              </div>
            </div>
          </div>
        </form> */}
      </div>
    </div>
  );

};

export default Profile;