import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import InputField from '../../../../components/HOC/InputField';
import SelectField from '../../../../components/HOC/SelectField';
import UploadField from '../../../../components/HOC/UploadField';
import { thaiTitles } from '../../../../helpers/constant';
import { useDistrictMutation, useSubDistrictMutation } from '../../../../services/mutations/useProvincesMutation';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import { Form, Formik, FormikProps } from 'formik';
import { Customer } from '../../../../types';
import Checkbox from '../../../../components/HOC/CheckboxField';
import Breadcrumbs from '../../../../helpers/breadcrumbs';
import { resizeImage } from '../../../../helpers/helpFunction';
import { useGlobalMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';
import { useParams } from 'react-router-dom';
import PreLoading from '../../../../helpers/preLoading';

const mode = process.env.MODE || 'admin';

const HistoryCustomerPreview = () => {
    const storedUser = localStorage.getItem(mode);
    const role = storedUser ? JSON.parse(storedUser).role : null;
    const { uuid,id } = useParams();

    const creditLevelTypes = useSelector((state: IRootState) => state.dataStore.credit_level);
    const dataStoredProvinces = useSelector((state: IRootState) => state.dataStore.provinces);
    const pageAction = useSelector((state: IRootState) => state.pageStore.pageAction) !== 'edit';

    const [districtIdList, setDistrictIdList] = useState<any>([]);
    const [districtCurrentList, setDistrictCurrentList] = useState<any>([]);
    const [districtWorkList, setDistrictWorkList] = useState<any>([]);

    const [subDistrictIdList, setSubDistrictIdList] = useState<any>([]);
    const [subDistrictCurrentList, setSubDistrictCurrentList] = useState<any>([]);
    const [subDistrictWorkList, setSubDistrictWorkList] = useState<any>([]);

    const [customerFormData, setCustomerFormData] = useState<any>({
        shop_credit_level: '',
        title: '',
        name: '',
        citizen_id: '',
        phone_number: '',
        phone_number_ref: '',
        line_id: '',
        facebook_id: '',
        email: '',
        citizen_image_url: '',
        address: '',
        id_province: 0,
        id_district: 0,
        id_subdistrict: 0,
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

        tiktok_id: '',
        instagram_id: '',
        credit_level: '',
        approval_status: 'Approved',
        enabled_line_notify: false,

        statement: '',
        pay_slip: '',
        address_bill: '',
        employee_name: '',
        id_employee: '',
    });

    const [customerFormUpload, setCustomerFormUpload] = useState<any>({
        citizen_id: '',
        name: '',
        address: '',
        subdistrict: '',
        district: '',
        province: '',
        zip_code: '',
    });

    const [citizenImageFile, setCitizenImageFile] = useState<any>([]);
    const [verificationImageFile, setVerificationImageFile] = useState<any>([]);

    const breadcrumbItems = [
        { to: '/apps/customer/list', label: 'ลูกค้า' },
        { to: true, label: 'ข้อมูล' },
        { label: 'ประวัติ', isCurrent: true },
    ];

    const SubmittedForm = Yup.object().shape({
        title: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        phone_number: Yup.string().length(10, 'กรุณาใส่ข้อมูลให้ครบ 10 เลข'),
        citizen_id: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').length(13, 'กรุณาใส่ข้อมูลให้ครบ 13 หลัก'),
        email: Yup.string().email('กรุณาใส่อีเมลที่ถูกต้อง').required('กรุณาใส่ข้อมูลให้ครบ'),
        address: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        id_province: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        id_district: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        id_subdistrict: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        current_address: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        current_id_province: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        current_id_district: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        current_id_subdistrict: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        work_address: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        work_id_province: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        work_id_district: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        work_id_subdistrict: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
        // credit_level: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    });

    const personalContent = (props: any) => {
        return (
            <div className="md:col-span-1 xl:col-span-3 mr-6">
                <div className="input-flex-row">
                    <div className="check-container">
                        <InputField
                            label="รหัสบัตรประชาชน"
                            name="citizen_id"
                            type="text"
                            disabled={true}
                            onKeyPress={(e: any) => {
                                if (!/[0-9]/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            maxLength={13}
                        />
                    </div>
                </div>
                <hr className="mt-4"></hr>
                <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">ข้อมูลส่วนบุคคล</div>
                <div className="input-flex-row">
                    <SelectField
                        require={true}
                        label="คำนำหน้า"
                        id="title"
                        name="title"
                        options={[ ...thaiTitles]}
                        placeholder="กรุณาเลือก"
                        onChange={(e: any) => handleChangeSelect(props, e, 'title')}
                        isSearchable={false}
                        disabled={true}
                    />
                    <InputField require={true} label="ชื่อ-นามสกุล" name="name" type="text" disabled={true} />
                </div>
                <div className="input-flex-row">
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
                        disabled={true}
                    />
                    <InputField
                        require={true}
                        label="เบอร์โทรอ้างอิง"
                        name="phone_number_ref"
                        type="text"
                        maxLength={10}
                        onKeyPress={(e: any) => {
                            if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        disabled={true}
                    />
                </div>
                <div className="input-flex-row">
                    <InputField label="Facebook ID" name="facebook_id" type="text" disabled={true} />
                    <InputField label="Line ID" name="line_id" type="text" disabled={true} />
                </div>
                <div className="input-flex-row">
                    <InputField label="Tiktok ID" name="tiktok_id" type="text" disabled={true} />
                    <InputField label="Instagram ID" name="instagram_id" type="text" disabled={true} />
                </div>
                <div className="input-flex-row">
                    <InputField require={true} label="Email" name="email" type="text" disabled={true} />
                    <div className="flex-1"></div>
                </div>
                {/* <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">ข้อมูลเกรด</div>
                <div className="input-flex-row">
                    <InputField require={true} label="รายได้ต่อเดือน" name="income_monthly" disabled={true} />
                    <InputField require={true} label="จำนวนโพสต์ 3 เดือน" name="amount_post" type="text" disabled={true} />
                </div>
                <div className="input-flex-row">
                    <UploadField name="pay_slip" label="สลิปเงินเดือน" disabled={true} />
                    <UploadField name="statement" label="รายการเดินบัญชีธนาคาร" disabled={true} />
                </div>
                <div className="input-flex-row">
                    <UploadField name="address_bill" label="บิลค่าน้ำไฟที่พัก" disabled={true} />
                    <SelectField id="occupation" name="occupation" label="อาชีพ" options={[{ value: 'พนักงานประจำ', label: 'พนักงานประจำ' }]} disabled={true} />
                </div>
                <div className="input-flex-row">
                    <SelectField
                        isMulti={true}
                        id="credit_card"
                        name="credit_card"
                        label="บัตรเคดิต"
                        options={customerFormData?.credit_card?.length > 0 ? customerFormData?.credit_card?.map((item: any) => ({ value: item, label: item })) : []}
                        disabled={true}
                    />
                    <SelectField id="social" name="social" label="จำนวนเพื่อนในโซเชียล" options={[]} disabled={true} />
                </div>
                <div className="input-flex-row">
                    <InputField require={true} label="slug_customer" name="slug_customer" disabled={true} />
                    <InputField require={true} label="face_score_compare" name="face_score_compare" disabled={true} />
                </div> */}
                <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-4">ข้อมูลที่อยู่</div>
                {addressContent(props)}
                {role != 'shop' && (
                    <div className="input-flex-row">
                        {/* <SelectField
              require={true}
              label="ระดับเครดิต (แอดมิน)"
              id="credit_level"
              name="credit_level"
              options={creditLevelTypes}
              placeholder="กรุณาเลือก"
              isSearchable={true}
              disabled={true}
            /> */}
                        <SelectField
                            require={true}
                            label="รับการแจ้งเตือนค่างวด"
                            id="enabled_line_notify"
                            name="enabled_line_notify"
                            options={[
                                { label: 'เปิด', value: true },
                                { label: 'ปิด', value: false },
                            ]}
                            placeholder="กรุณาเลือก"
                            isSearchable={true}
                            disabled={true}
                        />
                        {/* <div className="blank-container"></div> */}
                    </div>
                )}
                <div className="input-flex-row">
                    <SelectField
                        require={true}
                        label="ระดับเครดิต (ร้านค้า)"
                        id="shop_credit_level"
                        name="shop_credit_level"
                        options={creditLevelTypes}
                        placeholder="กรุณาเลือก"
                        isSearchable={true}
                        disabled={true}
                    />
                    {/* <div className="blank-container"></div> */}
                </div>
                <div className="input-flex-row">
                    <InputField name="employee_name" label="ผู้ดำเนินการ" disabled={true} />
                    {/* <InputField name="id_employee" label="id ผู้ดำเนินการ" disabled={true} copy={true} /> */}
                </div>
            </div>
        );
    };

    const addressContent = (props: any) => {
        return (
            <>
                <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                    <div className=" border-white-light dark:border-[#1b2e4b] p-5 pt-0">
                        <span className="bg-white dark:bg-black dark:text-white-light w-[15svw] h-[20px] lg:w-[10vw] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px] ">
                            ที่อยู่ตามบัตรประชาชน
                        </span>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="input-flex-row">
                            <InputField
                                require={true}
                                label="ที่อยู่"
                                name="address"
                                rows="1"
                                disabled={true}
                                onChange={(e: any) => {
                                    props.setFieldValue('address', e.target.value);
                                    props.setFieldValue('copyAddress', false);
                                    props.setFieldValue('copyAddressForWork', false);
                                }}
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
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'id_province');
                                    props.setFieldValue('copyAddress', false);
                                    props.setFieldValue('copyAddressForWork', false);
                                }}
                                isSearchable={false}
                                disabled={true}
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
                                isSearchable={false}
                                disabled={districtIdList.length === 0 || true}
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
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'id_subdistrict');
                                    props.setFieldValue('copyAddress', false);
                                    props.setFieldValue('copyAddressForWork', false);
                                }}
                                isSearchable={false}
                                disabled={subDistrictIdList.length === 0 || true}
                            />
                            <InputField label="รหัสไปรษณีย์" name="zip_code" rows="1" disabled={true} />
                        </div>
                    </div>
                </div>
                <label className="flex cursor-pointer items-center">
                    <Checkbox name="copyAddress" label="ใช้ที่อยู่เดียวกับบัตรประชาชน" onCheck={(e: any) => handleCheck(props, e)} disabled={true} />
                </label>
                <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                    <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0">
                        <span className="bg-white dark:bg-black  dark:text-white-light w-[15svw] h-[20px] lg:w-[8vw] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px] ">
                            ที่อยู่ปัจจุบัน
                        </span>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="input-flex-row">
                            <InputField
                                require={true}
                                label="ที่อยู่"
                                name="current_address"
                                rows="1"
                                disabled={true}
                                onChange={(e: any) => {
                                    props.setFieldValue('copyAddress', false);
                                    props.setFieldValue('current_address', e.target.value);
                                }}
                            />
                        </div>
                        <div className="input-flex-row">
                            <SelectField
                                require={true}
                                label="จังหวัด"
                                id="current_id_province"
                                name="current_id_province"
                                options={dataStoredProvinces}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'current_id_province');
                                    props.setFieldValue('copyAddress', false);
                                }}
                                isSearchable={false}
                                disabled={true}
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
                                isSearchable={false}
                                disabled={districtCurrentList.length === 0 || true}
                            />
                        </div>
                        <div className="input-flex-row">
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
                                isSearchable={false}
                                disabled={subDistrictCurrentList.length === 0 || true}
                            />
                            <InputField label="รหัสไปรษณีย์" name="current_zip_code" rows="1" disabled={true} />
                        </div>
                    </div>
                </div>
                <label className="flex cursor-pointer items-center">
                    <Checkbox name="copyAddressForWork" label="ใช้ที่อยู่เดียวกับบัตรประชาชน" onCheck={(e: any) => handleCheckForWork(props, e)} disabled={true} />
                </label>
                <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                    <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0">
                        <span className="bg-white dark:bg-black  dark:text-white-light w-[15svw] h-[20px] lg:w-[8vw] lg:h-[20px] rounded flex justify-center items-center text-[12px] font-semibold -mt-[10px] ">
                            ที่อยู่ที่ทำงาน
                        </span>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="input-flex-row">
                            <InputField
                                require={true}
                                label="ที่อยู่"
                                name="work_address"
                                rows="1"
                                disabled={true}
                                onChange={(e: any) => {
                                    props.setFieldValue('copyAddressForWork', false);
                                    props.setFieldValue('work_address', e.target.value);
                                }}
                            />
                        </div>
                        <div className="input-flex-row">
                            <SelectField
                                require={true}
                                label="จังหวัด"
                                id="work_id_province"
                                name="work_id_province"
                                options={dataStoredProvinces}
                                placeholder="กรุณาเลือก"
                                onChange={(e: any) => {
                                    handleChangeSelect(props, e, 'work_id_province');
                                    props.setFieldValue('copyAddressForWork', false);
                                }}
                                isSearchable={false}
                                disabled={true}
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
                                isSearchable={false}
                                disabled={districtWorkList.length === 0 || true}
                            />
                        </div>
                        <div className="input-flex-row">
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
                                isSearchable={false}
                                disabled={subDistrictWorkList.length === 0 || true}
                            />
                            <InputField label="รหัสไปรษณีย์" name="work_zip_code" rows="1" disabled={true} />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const uploadContent = () => {
        return (
            <div className="md:col-span-1 xl:col-span-1 pt-5">
                <div className="upload-container">
                    <div className="custom-file-container" data-upload-id="myFirstImage">
                        <div className="label-container">
                            <label>
                                รูปบัตรประชาชน <span className="text-rose-600">*</span>
                            </label>
                            {!pageAction && (
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
                            )}
                        </div>
                        <label className="custom-file-container__custom-file hidden"></label>
                        <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" />
                        <input type="hidden" name="MAX_FILE_SIZE1" value="10485760" />
                        <ImageUploading value={citizenImageFile} onChange={onImgChange}>
                            {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                <div className="upload__image-wrapper">
                                    {!pageAction && (
                                        <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                                            เลือกไฟล์...
                                        </button>
                                    )}
                                    &nbsp;
                                    {imageList.map((image, index) => (
                                        <div key={index} className="custom-file-container__image-preview relative">
                                            <img src={image.dataURL} alt="img" className={!pageAction ? 'm-auto mt-10' : 'm-auto'} />
                                        </div>
                                    ))}
                                    {!pageAction && imageList.length > 0 && (
                                        <button type="button" className="btn btn-success mt-2 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                            ตรวจสอบบัตรประชาชน
                                        </button>
                                    )}
                                </div>
                            )}
                        </ImageUploading>

                        {/* {citizenImageFile.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''} */}
                    </div>
                </div>
                <div className="upload-container mt-10">
                    <div className="custom-file-container" data-upload-id="myFirstImage">
                        <div className="label-container">
                            <label>
                                รูปยืนยันบุคคล <span className="text-rose-600">*</span>
                            </label>
                        </div>
                        <label className="custom-file-container__custom-file hidden"></label>
                        <input type="file" className="custom-file-container__custom-file__custom-file-input hidden" accept="image/*" />
                        <input type="hidden" name="MAX_FILE_SIZE2" value="10485760" />
                        <ImageUploading value={verificationImageFile} onChange={onImgChange2}>
                            {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                <div className="upload__image-wrapper">
                                    {!pageAction && (
                                        <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                                            เลือกไฟล์...
                                        </button>
                                    )}
                                    &nbsp;
                                    {imageList.map((image, index) => (
                                        <div key={index} className="custom-file-container__image-preview relative">
                                            <img src={image.dataURL} alt="img" className={!pageAction ? 'm-auto mt-10' : 'm-auto'} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ImageUploading>
                        {/* {verificationImageFile.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''} */}
                    </div>
                </div>
            </div>
        );
    };

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

    const { mutateAsync: fetchHistory,isLoading } = useGlobalMutation(url_api.findoneHistoryCustomer, {
        onSuccess: (res: any) => {
            if (res.statusCode == 200) {
                const setFormValue = res.data;
                getDistrict({ id: setFormValue?.id_province, type: 'id_province' });
                getSubDistrict({ id: setFormValue?.id_district, type: 'id_district' });
                getDistrict({ id: setFormValue?.current_id_province, type: 'current_id_province' });
                getSubDistrict({ id: setFormValue?.current_id_district, type: 'current_id_district' });
                getDistrict({ id: setFormValue?.work_id_province, type: 'work_id_province' });
                getSubDistrict({ id: setFormValue?.work_id_district, type: 'work_id_district' });
                setCustomerFormData({ ...setFormValue});
                if (setFormValue?.citizen_image_url) {
                    setCitizenImageFile([{ dataURL: setFormValue.citizen_image_url }]);
                }
                if (setFormValue?.verification_image_url) {
                    setVerificationImageFile([{ dataURL: setFormValue.verification_image_url }]);
                }
            }
        },
        onError: (err: any) => {
            console.log(err);
        },
    });

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

    const onImgChange = async (imageList: ImageListType) => {
        const resizedImages = await resizeImage(imageList);
        setCitizenImageFile(resizedImages);
        // await uploadOCR({ data: { image: resizedImages[0].file } })
    };

    const onImgChange2 = async (imageList: ImageListType) => {
        const resizedImages = await resizeImage(imageList);
        setVerificationImageFile(resizedImages);
    };

    useEffect(() => {
        fetchHistory({ data : {uuid:uuid,log_id:Number(id)} });
    }, []);

    return (
        <div className="flex flex-col gap-2.5">
            {/* {isLoading && <PreLoading />} */}
            <div className="flex items-center justify-between flex-wrap">
                <Breadcrumbs items={breadcrumbItems} />
                <div className="flex"></div>
            </div>
            <div>
                <div className="panel px-6 flex-1 py-6 rtl:xl:ml-6">
                    <Formik initialValues={customerFormData} onSubmit={() => {}} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                        {(props) => (
                            <Form className="space-y-5 dark:text-white custom-select">
                                <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">บัญชีลูกค้า</div>
                                <div className="grid md:grid-rows-1 xl:grid-cols-4 gap-2 pb-5">
                                    {personalContent(props)}
                                    {uploadContent()}
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default HistoryCustomerPreview;
