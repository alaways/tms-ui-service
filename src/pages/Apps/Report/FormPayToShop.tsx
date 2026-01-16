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
import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useUploadMutation } from '../../../services/mutations/useUploadMutation';
import PreLoading from '../../../helpers/preLoading';
import DatePickerTime from '../../../components/HOC/DatePickerTime';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';
import { useTranslation } from 'react-i18next';


const mode = process.env.MODE || 'admin';

const FormPayToShop = () => {
    const toast = Swal.mixin(toastAlert);
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const storedUser = localStorage.getItem(mode);
    const { t } = useTranslation();

    const nameLocal = storedUser ? JSON.parse(storedUser).name : null;

    const id_shop = searchParams.get('id_shop');
    const id_business_unit = searchParams.get('id_business_unit');
    const price = searchParams.get('price');

    const breadcrumbItems = [
        { to: `/apps/report/account-creditor?id_business_unit=${id_business_unit}&id_shop=${id_shop}`, label: t('account_creditor') },
        { label: t('pay_to_shop'), isCurrent: true },
    ];

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const [images, setImages] = useState<any>([]);

    const [shopData, setShopData] = useState<any>();
    const [defaultForm, setDefaultForm] = useState<any>({
        shop_name: '',
        bank_account_number: null,
        userChanged: nameLocal,
        created_at: convertDateClientToDb([new Date()]),
        remark: '',
        amount: '',
        payed_at: null,
    });
    const [bankOptions, setBankOptions] = useState<any>([]);

    const SubmittedForm = Yup.object().shape({
        bank_account_number: Yup.object()
            .nullable()
            .shape({
                value: Yup.string().required(t('please_enter_data')),
            })
            .required(t('please_enter_data')),
        amount: Yup.string().required(t('please_enter_data')),
        payed_at: Yup.date().nullable().required(t('please_enter_data')),
    });

    const CustomSelect = ({ field, form, options, className }: any) => {
        const [metaField, meta] = useField(field.name);
        const hasError = meta.touched && meta.error;

        const onChange = (option: any) => {
            form.setFieldValue(field.name, option);
        };

        return (
            <div className="flex flex-col w-full">
                <Select
                    options={options}
                    value={field.value}
                    onChange={onChange}
                    components={{ DropdownIndicator: IconCaretDown }}
                    placeholder={t('select_bank')}
                    isSearchable={false}
                    className={`w-full ${className}`}
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

    const { mutate: fetchPaymentPayload} = useGlobalMutation(url_api.shopPaymentPayload, {
        onSuccess: (res:any) => {
            if (res.code == 200 && res.statusCode == 200) {
                setDefaultForm((prev: any) => ({ ...prev, ...res.data }));
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


    const { mutateAsync: makePayment} = useGlobalMutation(url_api.shopMakePayment, {
        onSuccess: (res:any) => {
            return res;
        },
        onError: (err:any) => {},
    });


    const { mutateAsync: uploadPicture } = useUploadMutation({
        onSuccess: (res) => {
            return res;
        },
        onError: (err) => {},
    });


    const { mutateAsync: addSlipPayment} = useGlobalMutation(url_api.addSlipPayment, {
         onSuccess: (res:any) => {
            toast.fire({
                icon: 'success',
                title: t('payment_successful'),
                padding: '10px 20px',
            });
            navigate(`/apps/report/account-creditor?id_business_unit=${id_business_unit}&id_shop=${id_shop}`);
        },
        onError: (err:any) => {},
    });


     const { mutateAsync: fetchDashBoardPayment} = useGlobalMutation(url_api.shopPaymentDashboardFindAll, {
        onSuccess: (res: any) => {
            setDefaultForm((prev: any) => ({ ...prev, amount: res.data.os_balance }));
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });


    const onImgChange = async (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        const resizedImages = await resizeImage(imageList);
        setImages(resizedImages);
    };

    const onError = () => {
        toast.fire({
            icon: 'error',
            title: t('image_limit_exceeded'),
            padding: '10px 20px',
        });
    };

    const onSubmit = async (value: any) => {
        if (images.length == 0) {
            toast.fire({
                icon: 'error',
                title: t('please_add_transfer_evidence'),
                padding: '10px 20px',
            });
        } else {
            setIsLoading(true);
            const dataMakePayment = {
                ...value,
                payment_method: 'cash',
                payment_gateway: 'bank',
                bank_account_number: value.bank_account_number.value,
                amount: +value.amount,
                payed_at: moment(value.payed_at[0]).tz('Asia/Bangkok').format(),
                // payed_at: moment.utc(values.start_at[0]).tz("Asia/Bangkok").format("YYYY-MM-DDTHH:mm:ss") + "Z",
                id_shop: id_shop,
                ...(id_business_unit && { id_business_unit: +id_business_unit }),
            };
            const payment = await makePayment({ data: dataMakePayment });
            const picture = await uploadPicture({ data: { file: images[0].file, type: 'slip-pv' } });
            await addSlipPayment({ data: { id_payment: payment.data.id, image_url: picture.data.file_name } });
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentPayload({ data: { id_shop: id } });
        if (id_business_unit && id_shop) {
            const firstTime = new Date(2022, 0, 1).toISOString();
            const lastTimeOfDay = new Date();
            lastTimeOfDay.setHours(23, 59, 59, 999);
            fetchDashBoardPayment({ data: { id_business_unit: +id_business_unit, id_shop: id_shop, start_at: firstTime, end_at: lastTimeOfDay.toISOString() } });
        }
    }, []);
    return (
        <>
            <Breadcrumbs items={breadcrumbItems} />
            {(isLoading || isDownloading) && <PreLoading />}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <h5 className="my-3 text-2xl font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">{t('payment_form_title')}</h5>
                <Formik initialValues={defaultForm} onSubmit={onSubmit} validationSchema={SubmittedForm} enableReinitialize>
                    {({ setFieldValue }) => (
                        <Form className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <InputField name="shop_name" label={t('shop')} disabled={true} />
                                {/* <InputField name="id_payment" label="เลขที่ชำระเงิน" /> */}
                            </div>
                            <div className="flex gap-4">
                                <InputField name="userChanged" label={t('operator')} disabled={true} />
                                <InputField name="created_at" label={t('created_date')} disabled={true} />
                            </div>
                            <hr />
                            <h5 className="text-lg font-semibold">{t('receive_payment')}</h5>
                            <div className="flex gap-4">
                                <InputField
                                    require={true}
                                    name="amount"
                                    label={t('payment_amount')}
                                    onKeyDown={(e: any) => {
                                        if (e.ctrlKey && e.key === 'a') {
                                            return;
                                        }
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== '.') {
                                            e.preventDefault();
                                        }
                                        if (e.key === '.' && (e.target.value === '' || e.target.value.includes('.'))) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={(e: any) => {
                                        if (+e.target.value > defaultForm.amount) {
                                            setFieldValue('amount', defaultForm.amount);
                                        }
                                        else if(e.target.value.includes('.')){
                                            let [interPart,demical] = e.target.value.split('.')
                                            if(demical.length >2){
                                                demical = demical.slice(0,2)
                                            }
                                            setFieldValue('amount', interPart+'.'+demical)
                                        }
                                         else {
                                            setFieldValue('amount', e.target.value);
                                        }
                                    }}
                                />
                                <SelectField
                                    name="payment_type"
                                    id="payment_type"
                                    label={t('payment_channel')}
                                    options={[{ value: 'cash', label: t('cash') } /* ,{value:'promptpay',label:'พร้อมเพย์'} */]}
                                />
                            </div>
                            <div className="flex gap-4">
                                <InputField name="reference" label={t('reference_number')} />
                                <DatePickerTime
                                    require
                                    label={t('payment_date_time')}
                                    name="payed_at"
                                    onChange={(value: any) => {
                                        // setFieldValue('payed_at', moment(value[0]).tz('Asia/Bangkok').format());
                                        setFieldValue('payed_at', value);
                                    }}
                                />
                            </div>
                            <div className="w-full flex gap-4 custom-select">
                                <Field name="bank_account_number" component={CustomSelect} options={bankOptions} />
                                <div className="w-full"></div>
                            </div>
                            <div className="w-full flex gap-4">
                                <div className="w-full">
                                    <InputField name="remark" label={t('remark')} />
                                </div>
                                <div className="w-full"></div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p>{t('transfer_evidence')}</p>
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
                                                            <span className="text-violet-500 font-semibold">{t('click_to_upload')}</span> {t('or_drag_and_drop')}
                                                        </p>
                                                        <p>SVG, PNG, JPG OR GIF</p>
                                                    </>
                                                )}
                                                <div className="flex flex-wrap gap-4">
                                                    {imageList?.map((image, index) => (
                                                        <div key={index} className="relative">
                                                            <button
                                                                type="button"
                                                                className="custom-file-container__image-clear bg-dark-light dark:bg-dark dark:text-white-dark rounded-full block w-fit p-1 absolute top-0 right-0 z-10"
                                                                title="Clear Image"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    onImageRemove(index);
                                                                }}
                                                            >
                                                                ×
                                                            </button>

                                                            <img src={image.dataURL} alt="img" className="w-auto h-[180px]" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </ImageUploading>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <NavLink
                                    to={`/apps/report/account-creditor?id_business_unit=${id_business_unit}&id_shop=${id_shop}`}
                                    className="px-4 py-2 rounded-md border border-black/50 text-black"
                                >
                                    {t('cancel')}
                                </NavLink>
                                <button type="submit" className="px-4 py-2 rounded-md bg-violet-600 text-white ">
                                    {t('save')}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </>
    );
};

export default FormPayToShop;
