import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo, Fragment } from 'react';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { resizeImage } from '../../../helpers/helpFunction';
import { numberCommas } from '../../../helpers/formatNumeric';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import DatePicker from '../../../components/HOC/DatePicker';
import 'flatpickr/dist/flatpickr.min.css';
import { ErrorMessage, Form, Formik } from 'formik';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import InputField from '../../../components/HOC/InputField';
import SelectField from '../../../components/HOC/SelectField';
import { toastAlert } from '../../../helpers/constant';
import Breadcrumbs from '../../../helpers/breadcrumbs';
import moment from 'moment-timezone';
import Lightbox from 'react-18-image-lightbox';
import { convertDateTimeDbToClient, convertDateTimeToApiByBangkok } from '../../../helpers/formatDate';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { url_api } from '../../../services/endpoints';
import { showNotification } from '../../../helpers/showNotification';
import DatePickerTime from '../../../components/HOC/DatePickerTime';
import { useUploadMutation } from '../../../services/mutations/useUploadMutation';
import _ from 'lodash';
import PreLoading from '../../../helpers/preLoading';
import IconEdit from '../../../components/Icon/IconEdit';
import { DataTable } from 'mantine-datatable';
import themeInit from '../../../theme.init';
import { Dialog, Transition } from '@headlessui/react'
import IconX from '../../../components/Icon/IconX';
import { useTranslation } from 'react-i18next';
const mode = process.env.MODE || 'admin';

const Payment = () => {
    const { t } = useTranslation();
    const { ctid, uuid, inid } = useParams();
    const [dataCancel, setDataCancel] = useState({
            admin_name:'',
            created_at:'',
            reason_cancel:'',
            payment_slip:[]

    })
    const contract_id = ctid ? Number(ctid) : undefined;
    const installment_id = inid ? Number(inid) : undefined;
    const contract_uuid = uuid ? uuid : undefined;
    const [masterDataBankList, setMasterDataBankList] = useState<any>([]);
    const [masterDataPPList, setMasterDataPPList] = useState<any>([{ value: 'promptpay', label: 'promptpay' }]);
    const [masterBankList, setMasterBankList] = useState<any>([]);
    const [masterPaymentMethod, setMasterPaymentMethod] = useState<any>([
        {
            label: 'promptpay',
            value: 'promptpay',
        },
        {
            label: t('cash'),
            value: 'cash',
        },
    ]);
    const [actionModal, setActionModal] = useState(false)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const storedUser = localStorage.getItem(mode);
    const role = storedUser ? JSON.parse(storedUser).role : null;
    const [images, setImages] = useState<any>([]);
    const toast = Swal.mixin(toastAlert);
    const [pictureURL, setPictureURL] = useState<any>('');
    const [isOpenPic, setIsOpenPic] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [history, setHistory] = useState<any>([]);

    if (role != 'admin' && role != 'business_unit') {
        navigate('/');
    }
    const [isEdit, setIsEdit] = useState(false);
    const [info, setInfo] = useState({
        reference: '',
        status: '',
        ins_no: '',
    });
    const [formData, setFormData] = useState({
        due_at: '',
        isReferenceExists: false,
        id_invoice: 0,
        id_payment: '',
        amount: 0,
        discount: 0,
        penalty_fee: 0,
        penalty_fee_limit:0,
        unlock_fee: 0,
        total: 0,
        reference: '',
        bank_account_number: '',
        payment_method: '',
        remark: '',
        payed_at: new Date(),
        payment_slip: [],
        payment_qr: {},
    });

    const breadcrumbItems = [
        { to: '/apps/contract/list', label: t('contract') },
        { to: true, label: t('edit') },
        { label: t('payment_receive'), isCurrent: true },
    ];

    useEffect(() => {
        dispatch(setPageTitle(t('payment_receive')));
    });

    const [expiredate, setExpiredate] = useState<string>('');
    const [qrCodeImage, setQrCodeImage] = useState<string>('');
    const [paymentQr, setPaymentQr] = useState<any>({});
    const { mutate: fetchContranctPaymentData,isLoading:isFetchData } = useGlobalMutation(url_api.contractGetPayment, {
        onSuccess: (res: any) => {
            setInfo({
                reference: res.data?.reference,
                status: res.data?.status,
                ins_no: res.data?.ins_no,
            });

            
            if(res.data?.history) {
                setHistory(res.data?.history);
            }

            if (res.data?.payment?.reference) {
                const datePayed = new Date(res.data?.payment.payed_at);
                datePayed.setHours(datePayed.getHours() - 7);
                setFormData({
                    ...formData,
                    due_at: res.data?.due_at,
                    ...(res.data?.payment_method == 'cash' && {
                        bank_account_number: res.data.bank_account_number,
                    }),
                    id_invoice: res.data?.id_invoice,
                    id_payment: res.data?.id_payment,
                    amount: res.data?.payment.amount,
                    discount: res.data?.payment.discount,
                    penalty_fee: res.data?.payment.penalty_fee,
                    penalty_fee_limit: res.data?.penalty_fee_limit ?? 0,
                    unlock_fee: res.data?.payment.unlock_fee,
                    total: res.data?.payment.total,
                    reference: res.data?.payment.reference,
                    ...(res.data?.payment?.payment_method == 'cash' && {
                        bank_account_number: res.data?.payment.bank_account_number,
                    }),
                    ...(res.data?.payment?.payment_method != 'cash' && {
                        bank_account_number: 'promptpay',
                    }),
                    payment_method: res.data?.payment?.payment_method,
                    remark: res.data?.payment.remark,
                    payed_at: datePayed ?? new Date(),
                    isReferenceExists: true,
                    payment_slip: res.data?.payment_slip,
                });

                if (res.data?.payment_qr) {
                    setPaymentQr(res.data.payment_qr);
                    setQrCodeImage(res.data.payment_qr?.image);
                    setExpiredate(res.data.payment_qr?.expiredate);
                }
                if (res.data?.payment?.payment_method != 'cash') {
                    
                    if(res.data.payment?.payment_gateway == 'tqr') {
                        setMasterDataBankList([{ value: 'promptpay', label: 'Thai Qr' }]);
                    } else {
                        setMasterDataBankList([{ value: 'promptpay', label: 'Pay Solution' }]);
                    }
                    
                } else {
                    setMasterDataBankList(
                        res.data?.business_unit_banks.map((item: any) => ({
                            value: `${item.bank.name} - ${item.bank_account_number}`,
                            label: `${item.bank.name} - ${item.bank_account_number}`,
                        }))
                    );
                }
              
            } else {
                if (res.statusCode === 400 || res.code === 400) {
                    showNotification('พบข้อผิดพลาด ไม่สามารถโหลดข้อมูลได้!', 'error');
                } else {
                    // setFormData({

                    //     payed_at: res.data.payed_at ? new Date(res.data.payed_at) : new Date(),
                    //     amount: 0,
                    //     penalty_fee: 0,
                    //     unlock_fee: 0,
                    //     total: 0,
                    //     isReferenceExists: false,
                    // });

                    setFormData({
                        ...formData,
                        ...(res.data?.payment_method == 'cash' && {
                            bank_account_number: res.data.bank_account_number,
                        }),
                        due_at: res.data?.due_at,
                        amount: res.data?.payment?.amount,
                        discount: res.data?.payment?.discount,
                        penalty_fee: res.data?.payment?.penalty_fee,
                        penalty_fee_limit:res.data?.penalty_fee_limit ?? 0,
                        unlock_fee: res.data?.payment?.unlock_fee,
                        total: res.data?.payment?.total,
                        reference: res.data?.payment.reference,
                        bank_account_number: res.data?.payment.bank_account_number,
                        payment_method: res.data?.payment?.payment_method,
                        remark: res.data?.payment?.remark,
                        payed_at: res.data?.payment?.payed_at ?? new Date(),
                        isReferenceExists: false,
                    });

                    setMasterDataBankList(
                        res.data?.business_unit_banks.map((item: any) => ({
                            value: `${item.bank.name} - ${item.bank_account_number}`,
                            label: `${item.bank.name} - ${item.bank_account_number}`,
                        }))
                    );

                    setMasterBankList(
                        res.data?.business_unit_banks.map((item: any) => ({
                            value: `${item.bank.name} - ${item.bank_account_number}`,
                            label: `${item.bank.name} - ${item.bank_account_number}`,
                        }))
                    );
                }
            }
            setLoading(false);
        },
        onError: (err: any) => {
            showNotification(err.message, 'error');
            setLoading(false);
        },
    });

    const { mutate: fetchPaymentStatus } = useGlobalMutation(url_api.paymentCheckStatus, {

        onSuccess: (res: any) => {
            if (res.statusCode === 400 || res.code === 400) {
                Swal.fire({
                        icon: 'error',
                        title: t('cancel_payment'),
                        padding: '10px 20px',
                    }).then(() => {
                        window.location.reload();
                });
            } else {
                if (res.data?.status == 'cancel') {
                    Swal.fire({
                        icon: 'error',
                        title: t('cancel_payment'),
                        padding: '10px 20px',
                    }).then(() => {
                        window.location.reload();
                    });
                } else if (res.data?.status == 'complete') {
                    Swal.fire({
                        icon: 'success',
                        title: t('payment_success'),
                        padding: '10px 20px',
                    }).then(() => {
                        window.location.reload();
                    });
                }
            }
        },

        onError: (err: any) => {
            showNotification(err.message, 'error');
            setLoading(false);
        },
    });

    useEffect(() => {
        if (paymentQr?.id_payment) {
            const interval = setInterval(async () => {
                try {
                    fetchPaymentStatus({ data: { id_contract: contract_uuid, id_installment: installment_id } });
                } catch (error) {
                    console.error('Error checking payment status:', error);
                }
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [paymentQr]);
    const SubmittedForm = Yup.object().shape({
        payed_at: Yup.string().nullable().required(t('please_fill_all_fields')),
        bank_account_number: Yup.string().required(t('please_fill_all_fields')),
        amount: Yup.string().required(t('please_fill_all_fields')),
        ...(formData?.penalty_fee_limit > 0  ? {
         penalty_fee: Yup.number().max(formData?.penalty_fee_limit, `${t('late_fee_limit_error')} ${formData?.penalty_fee_limit} ${t('baht_per_time')}`).required(t('please_fill_all_fields')),
        } : {
         penalty_fee: Yup.number().required(t('please_fill_all_fields')),
        }),
       
        unlock_fee: Yup.string().required(t('please_fill_all_fields')),
        discount: Yup.number()
            .max(formData?.amount - 1)
            .required(t('please_fill_all_fields')),
    });

    const onImgChange = async (imageList: ImageListType) => {
        const resizedImages = await resizeImage(imageList); 

        setImages(resizedImages);
    };

    const { mutate: makePayment, isLoading } = useGlobalMutation(url_api.contractMakePayment, {
        onSuccess: async (res: any) => {
            if (res.statusCode === 400 || res.code === 400) {
                setLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    padding: '10px 20px',
                });
            } else {
                const id_payment = res.data.id;
                try {
                    await upLoadImg(id_payment);
                    setLoading(false);
                    Swal.fire({
                        icon: 'success',
                        title: t('payment_success'),
                        padding: '10px 20px',
                    }).then(() => {
                        navigate('/apps/contract/' + contract_id + '/' + contract_uuid);
                    });
                } catch (error) {
                    console.error('Error uploading images:', error);
                }
            }
        },
        onError: (err: any) => {
            setLoading(false)
            Swal.fire({
                icon: 'error',
                title: err.message,
                padding: '10px 20px',
            })
        },
    });

    const { mutateAsync: addContractImage,isLoading:isAddImageLoading} = useGlobalMutation(url_api.contractAddSlip)

    const upLoadImg = async (id_payment: string) => {
        const uploadPromises: any = [];

        images.forEach((item: any) => {
            if (_.isUndefined(item?.id)) {
                uploadPromises.push(uploadFile({ data: { file: item.file, type: 'payment' } }));
            }
        });

        const addContractImg: any = [];

        if (uploadPromises.length > 0) {
            const results = await Promise.all(uploadPromises);
            results.forEach((item: any) => {
                if (item?.code !== 'error') {
                    addContractImg.push(
                        addContractImage({
                            data: {
                                id_payment: id_payment,
                                image_url: item.data.file_name,
                            },
                        })
                    );
                } else {
                    toast.fire({
                        icon: 'error',
                        title: t('file_upload_error_image_only'),
                        padding: '10px 20px',
                    });
                }
            });
        }

        if (addContractImg.length > 0) {
            await Promise.all(addContractImg);
        }
    };

    const handleChangeSelect = (props: any, event: any, name: any) => {
        props.setFieldValue(name, event.value);
    };

    const handleChangePayment = (props: any, event: any, name: any) => {
        props.setFieldValue(name, event.value);

        if (event.value == 'promptpay') {
            setMasterDataBankList([{ value: 'promptpay', label: 'promptpay' }]);
            props.setFieldValue('bank_account_number', 'promptpay');
        } else {
            setMasterDataBankList(masterBankList);
        }
    };

    const { mutateAsync: uploadFile, isLoading: isUploadLoading } = useUploadMutation({
        onSuccess: (res: any) => {
           
        },
        onError: (err: any) => {
           
        },
    });

    const goBack = () => {
        navigate('/apps/contract/' + contract_id + '/' + contract_uuid);
    };

    interface makePaymentCash {
        id_contract: any;
        id_installment: number;
        remark?: string;
        reference?: string;
        bank_account_number: string;
        amount: number;
        penalty_fee: number;
        unlock_fee: number;
        discount: number;
        payed_at: any;
        type?: string;
    }

    const submitForm = useCallback(
        (event: any, is_edit: boolean) => {
            if (is_edit) {
                handleUpdatePayment(event);
            } else {
                const payed_at_now = new Date(event.payed_at); // Convert to Date object
                payed_at_now.setHours(payed_at_now.getHours() + 7);
                const payed_at_formattedISO = payed_at_now.toISOString();
                const dataPayment: makePaymentCash = {
                    id_contract: contract_uuid,
                    id_installment: Number(installment_id),
                    remark: event.remark,
                    reference: event.reference,
                    bank_account_number: event.bank_account_number,
                    amount: Number(event.amount),
                    payed_at: payed_at_formattedISO,
                    penalty_fee: Number(event.penalty_fee),
                    unlock_fee: Number(event.unlock_fee),
                    discount: Number(event.discount),
                };

                Swal.fire({
                    title: t('payment_confirmation'),
                    text: t('payment_confirmation_text'),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: themeInit.color.themePrimary,
                    cancelButtonColor: '#d33',
                    confirmButtonText: t('confirm'),
                    cancelButtonText: t('cancel'),
                    reverseButtons: true,
                }).then((result) => {
                    if (result.isConfirmed) {
                        setLoading(true);
                        if (images.length > 0) {
                            makePayment({ data: dataPayment });
                        } else {
                            setLoading(false);
                            toast.fire({
                                icon: 'error',
                                title: t('add_proof_image'),
                                padding: '10px 20px',
                            });
                        }
                    } else {
                      
                    }
                });
            }
        },
        [makePayment, images]
    );

    const onError = () => {
        toast.fire({
            icon: 'error',
            title: t('image_limit_10'),
            padding: '10px 20px',
        });
    };

    useEffect(() => {
        setLoading(true);
        fetchContranctPaymentData({ data: { id_contract: contract_uuid, id_installment: installment_id } });
    }, [contract_id, installment_id]);

    interface TimeLeft {
        days?: number;
        hours?: number;
        minutes?: number;
        seconds?: number;
    }

    const timerComponents: JSX.Element[] = [];
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({});
    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval as keyof TimeLeft]) {
            return;
        }
        timerComponents.push(
            <span key={interval}>
                {timeLeft[interval as keyof TimeLeft]} {interval}{' '}
            </span>
        );
    });

    useEffect(() => {
        if (!expiredate) return;
        const calculateTimeLeft = () => {
            const difference = +new Date(expiredate) - +new Date();
            let timeLeft: TimeLeft = {};
            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return timeLeft;
        };
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [expiredate]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrCodeImage;
        link.download = 'qr_code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    interface makePaymentQrCode {
        id_contract: any;
        id_installment: any;
        invoice_type: string;
        penalty_fee: number;
        unlock_fee: number;
        discount: number;
        remark: string;
    }

    const handleGenerateQrcode = async (data: any) => {
        setLoading(true);
        const dataPayment: makePaymentQrCode = {
            id_contract: contract_uuid,
            id_installment: installment_id,
            invoice_type: 'pay_installment',
            penalty_fee: +data?.penalty_fee,
            unlock_fee: +data?.unlock_fee,
            discount: Number(data.discount),
            remark: data?.remark ?? '',
        };
        await generateQrcode({ data: dataPayment });
    };
    //isLoading: isLoadding
    const { mutate: generateQrcode,isLoading:isGenLoading } = useGlobalMutation(url_api.getPayment, {
        onSuccess: async (res: any) => {
            if (res.statusCode === 400 || res.code === 400) {
              showNotification(res.message, 'error');
              setLoading(false);
            } else {
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        },
        onError: (err: any) => {
            showNotification(err.message, 'error');
        },
    });

    const { mutate: updatePayment,isLoading:isUpdateLoading} = useGlobalMutation(url_api.updatePayment, {
        onSuccess: async (res: any) => {
            if (res.statusCode !== 400) {
                const id_payment = res.data.id;
                try {
                    await upLoadImg(id_payment);
                    setLoading(false);
                    Swal.fire({
                        icon: 'success',
                        title: t('payment_success'),
                        padding: '10px 20px',
                    }).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    console.error('Error uploading images:', error);
                }
            } else {
                setLoading(false);
                toast.fire({
                    icon: 'error',
                    title: res.message,
                    padding: '10px 20px',
                });
            }
        },
        onError: (err: any) => {
            toast.fire({
                icon: 'error',
                title: err.message,
                padding: '10px 20px',
            });
        },
    });

    const { mutate: cancelPaymentCash,isLoading:isCancelLoading } = useGlobalMutation(url_api.cancelPaymentCash, {
        onSuccess: async (res: any) => {
            if (res.statusCode !== 400) {
                try {
                    setLoading(false);
                    Swal.fire({
                        icon: 'success',
                        title: t('cancel_payment_success'),
                        padding: '10px 20px',
                    }).then(() => {
                        navigate('/apps/contract/' + contract_id + '/' + contract_uuid);
                    });
                } catch (error) {
                    console.error('Error uploading images:', error);
                }
            } else {
                setLoading(false);
                toast.fire({
                    icon: 'error',
                    title: res.message,
                    padding: '10px 20px',
                });
            }
        },
        onError: (err: any) => {
            toast.fire({
                icon: 'error',
                title: err.message,
                padding: '10px 20px',
            });
        },
    });


    const { mutate: cancelQrcode } = useGlobalMutation(url_api.cancelQrcode, {
        onSuccess: async (res: any) => {
            if (res.statusCode === 400 || res.code === 400) {
                showNotification(res.message, 'error');
            } else {
                window.location.reload();
            }
        },
        onError: (err: any) => {
            toast.fire({
                icon: 'error',
                title: err.message,
                padding: '10px 20px',
            });
        },
    });

    const handleCancelQrCode = async () => {
        setLoading(true);
        cancelQrcode({ data: { id_payment: paymentQr.id_payment } });
    };
    const goEdit = async () => {
        setIsEdit(!isEdit);
    };

    const handleUpdatePayment = async (event: any) => {
        const imageTotal = formData?.payment_slip?.length + images?.length;
        if (imageTotal > 10) {
            toast.fire({
                icon: 'error',
                title: t('image_limit_10'),
                padding: '10px 20px',
            });
            return false;
        }

        interface paymentCashUpdate {
            id_payment: string;
            id_invoice: number;
            reference: string;
            bank_account_number: string;
            amount: number;
            penalty_fee: number;
            unlock_fee: number;
            discount: number;
            payed_at: string;
            type: string;
        }
        ///update
        const payed_at_now = new Date(event.payed_at); // Convert to Date object
        payed_at_now.setHours(payed_at_now.getHours() + 7);
        const payed_at_formattedISO = payed_at_now.toISOString();

        const dataPayment: paymentCashUpdate = {
            id_payment: event.id_payment,
            id_invoice: event.id_invoice,
            reference: event.reference,
            bank_account_number: event.bank_account_number,
            amount: Number(event.amount),
            penalty_fee: Number(event.penalty_fee),
            unlock_fee: Number(event.unlock_fee),
            discount: Number(event.discount),
            payed_at: payed_at_formattedISO,
            type: 'pay_installment',
        };

        Swal.fire({
            title: t('edit_payment_confirmation'),
            text: t('edit_payment_confirmation_text'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: themeInit.color.themePrimary,
            cancelButtonColor: '#d33',
            confirmButtonText: t('confirm'),
            cancelButtonText: t('cancel'),
            reverseButtons: true,
            html: `
                <label for="password" style="display: block; text-align: left; font-size: 1rem; margin-top: 10px; color: #000000 color: #000000;">${t('user_password')}:</label>
                <input id="password" type="password" type="text" class="swal2-input" style="margin: 0 !important; width: 100%; font-size: 1rem; color: #000000;" placeholder="${t('user_password_for_edit')}">`,
            preConfirm: () => {
                const password = document?.getElementById('password')?.value;

                if (!password) {
                    Swal.showValidationMessage(t('fill_all_fields'));
                    return false;
                }

                return { password };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setLoading(true);
                const { password } = result.value;
                updatePayment({ data: { ...dataPayment, password: password } });
                setIsEdit(false);
            }
        });
    };

    const cancelPayment = async(event:any) => {
        if(!formData.id_payment) {
            navigate('/apps/contract/' + contract_id + '/' + contract_uuid);
        } else {
            interface paymentCancel {
                id_payment: string;
                password: string;
                reason_cancel: string;
            }
            Swal.fire({
                title: t('cancel_payment_title'),
                text: t('cancel_payment_text'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: themeInit.color.themePrimary,
                cancelButtonColor: '#d33',
                confirmButtonText: t('confirm'),
                cancelButtonText: t('cancel'),
                reverseButtons: true,
                html: `<label for="reason_cancel" style="display: block; text-align: left; margin-bottom: 10px; font-size: 1rem; margin-top: 10px; color: #000000;">${t('cancellation_reason')}:</label>
                    <input id="reason_cancel" type="text" class="swal2-input" style="margin: 0 !important; width: 100%; font-size: 1rem; color: #000000;" placeholder="${t('please_enter_info')}">
                    <label for="password" style="display: block; text-align: left; font-size: 1rem; margin-top: 10px; color: #000000 color: #000000;">${t('user_password')}:</label>
                    <input id="password" type="password" type="text" class="swal2-input" style="margin: 0 !important; width: 100%; font-size: 1rem; color: #000000;" placeholder="${t('user_password_for_edit')}">`,
                preConfirm: () => {
                    const {value} = document?.getElementById('password') as HTMLInputElement;
                   
                    const reason_cancel = document?.getElementById('reason_cancel') as HTMLInputElement;
                    const password = document?.getElementById('password') as HTMLInputElement;
    
                    if (!reason_cancel.value || !password.value) {
                        Swal.showValidationMessage(t('fill_all_fields'));
                        return false;
                    }

                    return { reason_cancel: reason_cancel.value, password: password.value };
                },
            }).then((result) => {
                if (result.isConfirmed){
                    setLoading(true);
                    const { password,reason_cancel } = result.value;
                    const paymentCancel: paymentCancel = {
                        id_payment: formData.id_payment,
                        password:password,
                        reason_cancel:reason_cancel
                    };
                    cancelPaymentCash({ data: { ...paymentCancel} });
                    setIsEdit(false);
            
                }
            });
        }
        
    }

    const checkPayment = (item: any = null) => {
        if(item.is_deleted) {
            setActionModal(true)
            if(item?.cancel_details) {
                const details = item?.cancel_details
                setDataCancel({
                    admin_name:details.admin_name,
                    created_at:details.created_at,
                    reason_cancel:details.reason_cancel,
                    payment_slip:item?.payment_slip ?? []
                })
            }
        }
    }

    return (
        <>
            {(loading || isLoading || isCancelLoading || isGenLoading || isCancelLoading || isAddImageLoading || isUpdateLoading || isUploadLoading || isFetchData) && <PreLoading />}
            <div className="flex items-center justify-between flex-wrap">
                <Breadcrumbs items={breadcrumbItems} />
                {formData.isReferenceExists && formData?.payment_method == 'cash' && !isEdit && (
                    <div className="flex">
                        <a className="hover:text-info cursor-pointer btn btn-primary mr-1" onClick={() => goEdit()}>
                            <IconEdit className="w-4.5 h-4.5" /> &nbsp; {t('edit')}
                        </a>
                    </div>
                )}
            </div>
            {isOpenPic && <Lightbox mainSrc={pictureURL} onCloseRequest={() => setIsOpenPic(false)} />}


            <Transition appear show={actionModal} as={Fragment}>
                <Dialog as="div" open={actionModal} onClose={() => {
                    setActionModal(false)
                }} className="relative z-[51]">
                    <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    >
                    <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                        >
                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark" style={{maxWidth:'40rem'}}>
                            <button
                            type="button"
                            onClick={() => {
                                setActionModal(false)
                            }}
                            className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                            >
                            <IconX />
                            </button>
                            <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px] text-center">{t('cancellation_info')}</div>
                            <div className="p-5">
                            
                            <div className="p-5">
                                <div className="mb-5 space-y-1">
                                
                                <div className="flex items-center justify-between">
                                    <p className="text-[#515365] font-semibold">{t('cancellation_reason')} </p>
                                    <p className="text-base">
                                    <span className="font-semibold">{dataCancel?.reason_cancel ?? ''}</span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[#515365] font-semibold">{t('operator')}</p>
                                    <p className="text-base">
                                    <span className="font-semibold">{dataCancel?.admin_name ?? '-'}</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-[#515365] font-semibold">{t('cancellation_date')}</p>
                                    <p className="text-base">
                                    <span className="font-semibold">{convertDateTimeDbToClient(dataCancel?.created_at ?? '-')}</span>
                                    </p>
                                </div>
                                
                                <p className="text-[#515365] font-semibold">{t('transfer_proof_label')}</p>
                               {Array.isArray(dataCancel?.payment_slip) && dataCancel.payment_slip.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-3 grid-cols-1">
                                        {dataCancel.payment_slip.map((image: any, index: number) => (
                                        <div key={index} className="custom-file-container__image-preview relative">
                                            <img
                                            src={image.image_url}
                                            alt="img"
                                            className="m-auto pointer"
                                            onClick={() => {
                                                setPictureURL(image.image_url);
                                                setIsOpenPic(true);
                                            }}
                                            />
                                        </div>
                                        ))}
                                    </div>
                                    ) : (
                                    <>-</>
                                    )}

                                </div>
                            </div>
                            </div>
                        </Dialog.Panel>
                        </Transition.Child>
                    </div>
                    </div>
                </Dialog>
            </Transition>
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <Formik initialValues={formData} onSubmit={(values) => submitForm(values, isEdit)} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                    {(props) => {
                        useEffect(() => {
                            const penalty_fee = props.values.penalty_fee ? +props.values.penalty_fee : 0;
                            const unlock_fee = props.values.unlock_fee ? +props.values.unlock_fee : 0;
                            const amount = props.values.amount;
                            const discount = props.values.discount ? +props.values.discount : 0;
                            const sum = penalty_fee + unlock_fee + amount - discount;
                            props.setFieldValue('total', sum);
                        }, [props.values.penalty_fee, props.values.unlock_fee, props.values.discount, props.setFieldValue]);

                        return (
                            <Form onSubmit={props.handleSubmit} className="space-y-5 dark:text-white custom-select">
                                <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">{t('payment_receive')}</div>

                                <div className="grid grid-cols-6 gap-4">
                                    <div className="col-start-1 col-end-3">
                                        <label htmlFor="">{t('contract_number_label')}</label>
                                        <input disabled type="text" value={info.reference} className="form-input disabled:bg-[#eee] " />
                                    </div>
                                    <div className="col-end-7 col-span-2">
                                        <DatePicker label={t('due_date')} name="due_at" disabled />
                                    </div>
                                </div>

                                <div className="table-responsive pt-10">
                                    <div className="text-md font-semibold ltr:sm:text-left rtl:sm:text-right text-center">{t('items')}</div>

                                    <table className="table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th className="text-left" style={{ width: '50px' }}>
                                                    {t('installment_number')}
                                                </th>
                                                <th className="text-center" style={{ width: '100px' }}>
                                                    {t('installment_per_period')}
                                                </th>
                                                <th className="text-center" style={{ width: '100px' }}>
                                                    {t('late_fee')}
                                                </th>
                                                <th className="text-center" style={{ width: '100px' }}>
                                                    {t('unlock_fee')}
                                                </th>
                                                <th className="text-center" style={{ width: '100px' }}>
                                                    {t('discount')}
                                                </th>
                                                <th className="text-center" style={{ width: '100px' }}>
                                                    {t('total')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-left">{info?.ins_no}</td>
                                                <td className="text-center">{numberCommas(formData?.amount || 0)}</td>
                                                <td>
                                                    <InputField
                                                        label=""
                                                        name="penalty_fee"
                                                        disabled={!!formData.isReferenceExists && !isEdit}
                                                        onKeyPress={(e: any) => {
                                                            if (!/[0-9]/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <InputField
                                                        label=""
                                                        name="unlock_fee"
                                                        disabled={!!formData.isReferenceExists && !isEdit}
                                                        onKeyPress={(e: any) => {
                                                            if (!/[0-9]/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </td>

                                                <td>
                                                    <InputField
                                                        label=""
                                                        name="discount"
                                                        disabled={!!formData.isReferenceExists && !isEdit}
                                                        onKeyPress={(e: any) => {
                                                            if (!/[0-9]/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </td>

                                                <td>
                                                    <InputField label="" name="total" disabled />
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan={5} className="text-right font-bold py-4">
                                                    {t('total_payment')}
                                                </td>
                                                <td className="text-center font-bold">{numberCommas(props.values.total) + ' ' + t('total_amount_baht')}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <>
                                    <div className="input-flex-row">
                                        <InputField label={t('reference_number')} name="reference" disabled={(!!formData.isReferenceExists || props.values.payment_method == 'promptpay') && !isEdit} />
                                        <DatePickerTime
                                            require
                                            label={t('payment_date_time')}
                                            name="payed_at"
                                            selected={props.values?.payed_at}
                                            onChange={(value: any) => {
                                                const date = value[0];
                                                const isoString = moment(date).toISOString();
                                                props.setFieldValue('payed_at', isoString);
                                            }}
                                            disabled={(!!formData.isReferenceExists || props.values.payment_method == 'promptpay') && !isEdit}
                                        />
                                    </div>
                                    <div className="input-flex-row">
                                        <SelectField
                                            require
                                            label={t('payment_channel')}
                                            id="payment_method"
                                            name="payment_method"
                                            placeholder={t('please_select')}
                                            options={masterPaymentMethod}
                                            isSearchable={false}
                                            onChange={(e: any) => {
                                                handleChangePayment(props, e, 'payment_method');
                                            }}
                                            disabled={!!formData.isReferenceExists}
                                        />

                                        <SelectField
                                            require
                                            label={t('transfer_to_bank_account')}
                                            id="bank_account_number"
                                            name="bank_account_number"
                                            placeholder={t('please_select')}
                                            options={masterDataBankList}
                                            isSearchable={false}
                                            onChange={(e: any) => {
                                                handleChangeSelect(props, e, 'bank_account_number');
                                            }}
                                            disabled={(!!formData.isReferenceExists || props.values.payment_method == 'promptpay') && !isEdit}
                                        />
                                    </div>

                                    <div className="input-flex-row">
                                        <InputField label={t('payment_amount')} name="total" type="text" disabled />
                                    </div>

                                    {/* {props.values.payment_method != 'promptpay' && ( */}
                                        <div className="flex flex-row mt-6 gap-4">
                                            <div className="upload-container w-full">
                                                <div className="custom-file-container" data-upload-id="firstImage">
                                                    <div className="label-container">
                                                        <p>{t('transfer_proof')} </p>
                                                        {(!formData.isReferenceExists || isEdit) && (
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
                                                    <div></div>

                                                    <input type="file" className={`custom-file-container__custom-file__custom-file-input hidden`} accept="image/*" />
                                                    <input type="hidden" name="MAX_FILE_SIZE1" value="10485760" />
                                                    <div>
                                                        <ImageUploading multiple value={images} onChange={onImgChange} onError={onError} maxNumber={10}>
                                                            {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                                <div className="upload__image-wrapper">
                                                                    {(!formData.isReferenceExists || isEdit) && (
                                                                        <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                                                                            {t('select_file')}
                                                                        </button>
                                                                    )}
                                                                    <div className="grid gap-4 sm:grid-cols-3 grid-cols-1 pt-[70px]">
                                                                        {formData?.payment_slip?.map((image: any, index: any) => (
                                                                            <div key={index} className="custom-file-container__image-preview relative">
                                                                                <img
                                                                                    src={image.image_url}
                                                                                    alt="img"
                                                                                    className={'m-auto pointer'}
                                                                                    onClick={() => {
                                                                                        setPictureURL(image.image_url);
                                                                                        setIsOpenPic(true);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    <div className="grid gap-4 sm:grid-cols-3 grid-cols-1 pt-[70px]">
                                                                        {imageList.map((image, index) => (
                                                                            <div key={index} className="custom-file-container__image-preview relative">
                                                                                {image?.id === undefined && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="custom-file-container__image-clear bg-dark-light dark:bg-dark dark:text-white-dark rounded-full block w-fit p-1 absolute top-0 left-0 z-10"
                                                                                        title="Clear Image"
                                                                                        onClick={() => {
                                                                                            onImageRemove(index);
                                                                                        }}
                                                                                    >
                                                                                        ×
                                                                                    </button>
                                                                                )}
                                                                                <div key={index} className="custom-file-container__image-preview relative">
                                                                                    <img
                                                                                        src={image.dataURL}
                                                                                        alt="img"
                                                                                        className={'m-auto pointer'}
                                                                                        onClick={() => {
                                                                                            setPictureURL(image.dataURL);
                                                                                            setIsOpenPic(true);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </ImageUploading>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    {/* )} */}

                                    <div className="input-flex"></div>
                                    <div className="mt-6">
                                        <InputField
                                            label={t('remark')}
                                            name="remark"
                                            as="textarea"
                                            rows="5"
                                            className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                                            default-value="-"
                                            disabled={!!formData.isReferenceExists}
                                        />
                                    </div>

                                    <div className="i">
                                        {formData?.payment_qr &&
                                            qrCodeImage &&
                                            (info?.status !== 'complete' ? (
                                                <>
                                                    <div className="flex text-center justify-center font-normal">
                                                        <div
                                                            className={`badge ${
                                                                info?.status === 'complete' ? 'badge-outline-success' : info?.status === 'pending' ? 'badge-outline-warning' : 'badge-outline-danger'
                                                            }`}
                                                        >
                                                            {info?.status === 'complete' ? t('success') : info?.status === 'pending' ? t('pending_payment') : t('cancelled')}
                                                        </div>
                                                    </div>

                                                    <div className="border-[#ebedf2] dark:border-[#1b2e4b]">
                                                        <div className="my-4">
                                                            {qrCodeImage && timerComponents.length ? (
                                                                <img src={qrCodeImage} alt="QR Code" className="w-full max-w-xs mx-auto" />
                                                            ) : (
                                                                <div>{expiredate}</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-center">
                                                        <div className="py-2">{t('countdown_timer')}</div>
                                                        <div>{timerComponents.length && timerComponents}</div>
                                                    </div>
                                                    <br />
                                                    {qrCodeImage && timerComponents.length && (
                                                        <div className="text-center">
                                                            <button type="button" className="bg-blue-600 text-white py-2 px-4 rounded mr-2.5" onClick={handleDownload}>
                                                                {t('save_image')}
                                                            </button>

                                                            <button type="button" className="bg-red-600 text-white py-2 px-4 rounded mg" onClick={handleCancelQrCode}>
                                                                {t('cancel')}
                                                            </button>
                                                        </div>
                                                    )}

                                                   
                                                </>
                                            ) : (
                                                <></>
                                            ))}
                                    </div>
                                    {props.values.payment_method != 'cash' && info?.status != 'complete' &&  !qrCodeImage &&  props.values.payment_method !== undefined &&  (
                                        <div className="flex justify-center items-center mt-8">
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => handleGenerateQrcode(props.values)}>
                                                {t('generate_qr_code')}
                                            </button>
                                        </div>
                                    )}
                                    
                                    {props.values.payment_method == 'cash' && (info?.status != 'complete' || isEdit) && (
                                        <div className="flex justify-center items-center mt-8">
                                            <button type="button" onClick={cancelPayment} className="btn bg-red-500 text-white border-none shadow-lg shadow-red-500/10 ltr:ml-4 rtl:mr-4">
                                               {formData.id_payment ? t('cancel_payment') : t('back')}
                                            </button>
                                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                {!isEdit ? t('save_data') : t('edit_data')}
                                            </button>
                                        </div>
                                    )}
                                </>
                            </Form>
                        );
                    }}
                </Formik>
            </div>

            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <h5 className="text-lg font-semibold mb-4">{t('transaction_history')}</h5>
              
                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={history}
                        columns={[
                            {
                                accessor: 'id',
                                title: t('sequence'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item, index) => <p>{history.length - index}</p>,
                            },
                            {
                                accessor: 'reference',
                                title: t('reference'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item) => (
                                <a className="flex cursor-pointer active"onClick={() => checkPayment(item)}>
                                    <div>{item.reference || '-'}</div>
                                </a>
                                ),
                            },
                            {
                                accessor: 'amount',
                                title: t('installment_amount'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'penalty_fee',
                                title: t('late_operation_fee'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'unlock_fee',
                                title: t('unlock_fee_label'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'discount',
                                title: t('discount_label'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'total',
                                title: t('total_payment'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'bank_account_number',
                                title: t('bank_account'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'payed_at',
                                title: t('payment_date'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item: any) => <p>{convertDateTimeDbToClient(item?.payed_at)}</p>,
                            },
                            {
                                accessor: 'admin_name',
                                title: t('operator_adjusted'),
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'created_at',
                                title: t('date_time'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item: any) => <p>{convertDateTimeDbToClient(item?.created_at)}</p>,
                            },
                             {
                                accessor: 'deleted_at',
                                title: t('status'),
                                textAlignment: 'center',
                                sortable: false,
                                render: (item) => (
                                    <span className={`badge ${item.is_deleted == 0 ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                        {item.is_deleted ? t('cancelled') : t('normal')}
                                    </span>
                                ),
                            },
                        ]}
                        minHeight={160}
                        highlightOnHover
                        // page={page}
                        // totalRecords={totalItems}
                        // recordsPerPage={pageSize}
                        // onPageChange={(p) => setPage(p)}
                        // recordsPerPageOptions={PAGE_SIZES}
                        // onRecordsPerPageChange={(p) => {
                        //     setPage(1);
                        //     setPageSize(p);
                        // }}
                        // paginationText={({ from, to, totalRecords }) => `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`}
                    />
                </div>
            </div>
        </>
    );
};

export default Payment;
