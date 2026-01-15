import { ErrorMessage, Field, Form, Formik, useField } from 'formik';
import InputField from '../../../components/HOC/InputField';
import SelectField from '../../../components/HOC/SelectField';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import moment from 'moment-timezone';
import Select from 'react-select';
import IconCaretDown from '../../../components/Icon/IconCaretDown';
import { resizeImage } from '../../../helpers/helpFunction';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useEffect, useState } from 'react';
import { toastAlert } from '../../../helpers/constant';
import { convertDateClientToDb } from '../../../helpers/formatDate';
import Breadcrumbs from '../../../helpers/breadcrumbs';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PreLoading from '../../../helpers/preLoading';
import DatePickerTime from '../../../components/HOC/DatePickerTime';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';

const breadcrumbItems = [
    { to: '/apps/report/account-creditor', label: 'บัญชีเจ้าหนี้ร้านค้า' },
    { label: 'ชำระเงินให้ร้านค้า', isCurrent: true },
];

const mode = process.env.MODE || 'admin';

const FormPayToShopPreview = () => {
    const toast = Swal.mixin(toastAlert);
    const { id } = useParams();

    const [searchParams, setSearchParams] = useSearchParams();
    const id_shop = searchParams.get('id_shop');
    const start_at = searchParams.get('start_at');
    const end_at = searchParams.get('end_at');

    const navigate = useNavigate();

    const storedUser = localStorage.getItem(mode);
    const nameLocal = storedUser ? JSON.parse(storedUser).name : null;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const [images, setImages] = useState<any>([]);

    const [defaultForm, setDefaultForm] = useState<any>({
        shop_name: '',
        bank_account_number: null,
        admin_name: nameLocal,
        created_at: convertDateClientToDb([new Date()]),
        remark: '',
        amount: '',
        payed_at: null,
        reference:'',
        payment_type:''
    });
    const [bankOptions, setBankOptions] = useState<any>([]);

    const SubmittedForm = Yup.object().shape({
        bank_account_number: Yup.object()
            .nullable()
            .shape({
                value: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
            })
            .required('กรุณาใส่ข้อมูลให้ครบ'),
        amount: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        payed_at: Yup.date().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    });

    const CustomSelect = ({ field, form, options, className, disabled }: any) => {
        const [metaField, meta] = useField(field.name);
        const hasError = meta.touched && meta.error;

        const onChange = (option: any) => {
            const value = option ? option.value : '';
            form.setFieldValue(field.name, value);
        };

        return (
            <div className="flex flex-col w-full">
                <Select
                    options={options}
                    value={options.find((option: any) => option.value === field.value) || null}
                    onChange={onChange}
                    components={{
                        DropdownIndicator: disabled ? () => null : IconCaretDown,
                    }}
                    placeholder="เลือกธนาคาร"
                    isSearchable={false}
                    className={`w-full ${className} ${disabled ? 'form-select bg-[#eee] !text-black' : null}`}
                    classNames={{
                        control: ({ isFocused }) => `${isFocused ? '!border-blue-500' : null} ${hasError ? '!border-red-500' : 'border'}   !rounded-xl shadow-sm p-4 w-full !cursor-pointer`,
                        menu: () => 'bg-white border rounded-lg shadow-md mt-1 !cursor-pointer',
                        option: ({ isFocused }) => (isFocused ? 'bg-gray-100 p-2 !cursor-pointer' : 'p-2 !cursor-pointer'),
                    }}
                />
                <ErrorMessage name={field.name} component="div" className="text-red-500 text-sm mt-1" />
            </div>
        );
    };

    const { mutate: fetchPaymentPreview } = useGlobalMutation(url_api.shopPaymentPreview, {
        onSuccess: (res: any) => {
            setDefaultForm(res.data);
            setImages(res.data.slip)
            return res;
        },
        onError: () => {
        },
    });
    
    const { mutate: fetchPaymentPayload } = useGlobalMutation(url_api.shopPaymentPayload, {
        onSuccess: (res:any) => {
            if (res.code == 200 && res.statusCode == 200) {
                const sortDataBank = res.data.banks.map((items: any) => {
                    const text = items.name;
                    const part = text.split(' -');
                    const bank = part[0].trim();
                    const noBank = part[1].trim().split(' ')[0];
                    const nameBank = part[1].trim().split(' (')[1].replace(')', '');
                    return {
                        value: items.name,
                        label: (
                            <div className="flex items-center gap-10">
                                <div className="">
                                    <p>ธนาคาร</p>
                                    <p className="text-gray-800 font-medium">{bank}</p>
                                </div>
                                <div>
                                    <p>เลขที่บัญชี</p>
                                    <p className="text-sm text-gray-800">{noBank}</p>
                                </div>
                                <div>
                                    <p>ชื่อบัญชี</p>
                                    <p className="text-sm text-gray-800">{nameBank}</p>
                                </div>
                            </div>
                        ),
                    };
                });
                setBankOptions(sortDataBank);
            }
        },
        onError: (err:any) => {},
    });


    const onImgChange = async (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        const resizedImages = await resizeImage(imageList);
        setImages(resizedImages);
    };

    const onError = () => {
        toast.fire({
            icon: 'error',
            title: 'รูปภาพเกิน 10 รูป',
            padding: '10px 20px',
        });
    };

    const onSubmit = async (value: any) => {
    };

    useEffect(() => {
        fetchPaymentPayload({ data: { id_shop: id_shop } });
        fetchPaymentPreview({ data: { id_payment: id } });
    }, []);
    
    return (
        <>
            <Breadcrumbs items={breadcrumbItems} />
            {(isLoading || isDownloading) && <PreLoading />}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <h5 className="my-3 text-2xl font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">แบบฟอร์มชำระเงินให้ร้านค้า</h5>
                <Formik initialValues={defaultForm} onSubmit={onSubmit} validationSchema={SubmittedForm} enableReinitialize>
                    {({ setFieldValue }) => (
                        <Form className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <InputField name="shop_name" label="ร้านค้า" disabled={true} />
                                {/* <InputField name="id_payment" label="เลขที่ชำระเงิน" disabled={true} /> */}
                            </div>
                            <div className="flex gap-4">
                                <InputField name="admin_name" label="ผู้ดำเนินการ" disabled={true} />
                                <InputField name="created_at" label="วันที่สร้าง" disabled={true} />
                            </div>
                            <hr />
                            <h5 className="text-lg font-semibold">รับชำระเงิน</h5>
                            <div className="flex gap-4">
                                <InputField
                                    name="amount"
                                    label="ยอดชำระเงิน"
                                    onKeyDown={(e: any) => {
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
                                            e.preventDefault();
                                        }
                                    }}
                                    disabled={true}
                                />
                                <SelectField
                                    name="payment_method"
                                    id="payment_method"
                                    label="ช่องทางการชำระเงิน"
                                    options={[
                                        { value: 'cash', label: 'เงินสด' },
                                        { value: 'promptpay', label: 'พร้อมเพย์' },
                                    ]}
                                    disabled={true}
                                />
                            </div>
                            <div className="flex gap-4">
                                <InputField name="reference" label="หมายเลขอ้างอิง" disabled={true} />
                                <DatePickerTime
                                    label="วันที่และเวลาที่ชำระ"
                                    name="payed_at"
                                    onChange={(value: any) => {
                                        setFieldValue('payed_at', moment(value[0]).tz('Asia/Bangkok').format());
                                    }}
                                    disabled={true}
                                />
                            </div>
                            <div className="w-full flex gap-4 custom-select">
                                <Field name="bank_account_number" component={CustomSelect} options={bankOptions} disabled={true} />
                                <div className="w-full"></div>
                            </div>
                            <div className="w-full flex gap-4">
                                <div className="w-full">
                                    <InputField name="remark" label="หมายเหตุ" disabled={true} />
                                </div>
                                <div className="w-full"></div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p>หลักฐานการโอนเงิน</p>
                                <ImageUploading multiple value={images} onChange={onImgChange} onError={onError} maxNumber={1}>
                                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                        <div className="relative">
                                            <div
                                                className={`${
                                                    imageList.length == 0 ? 'cursor-pointer' : null
                                                } border min-h-[200px] bg-violet-100/40 rounded-xl  flex flex-col items-center justify-center gap-2`}
                                                onClick={imageList.length == 0 ? onImageUpload : undefined}
                                                {...dragProps}
                                            >
                                                {imageList.length == 0 && (
                                                    <>
                                                        <p>
                                                            <span className="text-violet-500 font-semibold">Click to Upload</span> or drug and drop
                                                        </p>
                                                        <p>SVG, PNG, JPG OR GIF</p>
                                                    </>
                                                )}
                                                <div className="flex flex-wrap gap-4">
                                                    {imageList?.map((image, index) => (
                                                        <div key={index} className="relative">
                                                            {/* <button
                                                                type="button"
                                                                className="custom-file-container__image-clear bg-dark-light dark:bg-dark dark:text-white-dark rounded-full block w-fit p-1 absolute top-0 right-0 z-10"
                                                                title="Clear Image"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    onImageRemove(index);
                                                                }}
                                                            >
                                                                ×
                                                            </button> */}

                                                            <img src={image.image_url} alt="img" className="w-auto h-[180px]" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </ImageUploading>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </>
    );
};

export default FormPayToShopPreview;
