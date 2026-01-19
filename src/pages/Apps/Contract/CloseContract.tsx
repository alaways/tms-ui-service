import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
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
import {toastAlert } from '../../../helpers/constant';
import Breadcrumbs from '../../../helpers/breadcrumbs';
import moment from 'moment-timezone';
import Lightbox from 'react-18-image-lightbox';
import { convertDateTimeDbToClient } from '../../../helpers/formatDate';
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
import { useTranslation } from 'react-i18next';

const mode = process.env.MODE || 'admin';

const CloseContract = () => {
    const { ctid, uuid, inid } = useParams();
    const { t } = useTranslation();

    const contract_id = ctid ? Number(ctid) : undefined;
    const installment_id = inid ? Number(inid) : undefined;
    const contract_uuid = uuid ? uuid : undefined;
    const [masterDataBankList, setMasterDataBankList] = useState<any>([]);
    const [masterDataPPList, setMasterDataPPList] = useState<any>([{value:'promptpay',label:'promptpay'}]);
    const [masterBankList, setMasterBankList] = useState<any>([]);
    const [masterPaymentMethod, setMasterPaymentMethod] = useState<any>([
        {
            label : 'promptpay',
            value : 'promptpay',
        },
        {
            label : t('cash'),
            value : 'cash',
        }
    ]);
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
    const [isEdit,setIsEdit] = useState(false)
    const goEdit  = async () => {
        setIsEdit(!isEdit)
    } 
    const [info,setInfo] = useState({
        reference: '',
        status:'',
        ins_no: ''
    })
    const [formData, setFormData] = useState({
        due_at:'',
        isReferenceExists: false,
        id_invoice:0,
        id_payment:'',
        amount: 0,
        discount: 0,
        penalty_fee: 0,
        penalty_fee_limit:0,
        unlock_fee: 0,
        total: 0,
        reference: '',
        remaining_ins:0,
        bank_account_number: '',
        payment_method:'',
        remark: '',
        payed_at: new Date(),
        payment_slip: [],
        payment_qr:{}
        
    });

    const breadcrumbItems = [
        { to: '/apps/contract/list', label: t('contract') },
        { to: true, label: t('edit') },
        { label: t('receive_payment'), isCurrent: true },
    ];

    useEffect(() => {
        dispatch(setPageTitle(t('receive_payment')));
    });

    
    const [expiredate, setExpiredate] = useState<string>('')
    const [qrCodeImage, setQrCodeImage] = useState<string>('')
    const [paymentQr, setPaymentQr] = useState<any>({})
    const { mutate: fetchContranctPaymentData ,isLoading:isFetchData} = useGlobalMutation(url_api.contractClosePreview, {
        onSuccess: (res: any) => {
            setInfo({
                reference: res.data?.reference,
                status:res.data?.status,
                ins_no:res.data?.ins_no,
            })

            if (res.data?.payment?.reference) {
                setFormData({
                    ...formData,
                    due_at:res.data?.due_at,
                    ...(res.data?.payment_method == 'cash' && {
                        bank_account_number:res.data.bank_account_number,
                    }),
                    id_invoice:res.data?.id_invoice,
                    id_payment:res.data?.id_payment,
                    amount: res.data?.payment.amount,
                    discount:res.data?.payment.discount,
                    penalty_fee:res.data?.payment.penalty_fee,
                    penalty_fee_limit: res.data?.penalty_fee_limit ?? 0,
                    unlock_fee:res.data?.payment.unlock_fee,
                    total:res.data?.payment.total,
                    reference: res.data?.payment.reference,

                    ...(res.data?.payment?.payment_method == 'cash' && {
                        bank_account_number:  res.data?.payment.bank_account_number,
                    }),
                    ...(res.data?.payment?.payment_method != 'cash' && {
                        bank_account_number:  "promptpay",
                    }),
                    payment_method: res.data?.payment.payment_method,
                    remark:  res.data?.payment.remark,
                    payed_at: res.data?.payment.payed_at ? convertDateTimeDbToClient(res.data?.payment.payed_at) : new Date(),
                    remaining_ins:res.data?.payment.remaining_ins,
                    isReferenceExists: true,
                    payment_slip:res.data?.payment_slip
                });
                if(res.data?.payment_qr) {
                    setPaymentQr(res.data.payment_qr)
                    setQrCodeImage(res.data.payment_qr?.image)
                    setExpiredate(res.data.payment_qr?.expiredate)

                }
                if(res.data?.payment?.payment_method != 'cash') {
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
                setHistory(res.data?.history)
            } else {
                if (res.statusCode === 400 || res.code === 400) {
                    showNotification(t('error_load_data'), 'error');
                } else {
                    setFormData({
                        ...formData,
                        ...(res.data?.payment_method == 'cash' && {
                            bank_account_number:res.data.bank_account_number,
                        }),
                        amount: res.data?.payment?.amount,
                        discount:res.data?.payment?.discount,
                        penalty_fee:res.data?.payment?.penalty_fee,
                        penalty_fee_limit: res.data?.penalty_fee_limit ?? 0,
                        unlock_fee:res.data?.payment?.unlock_fee,
                        total:res.data?.payment?.total,
                        reference: res.data?.payment.reference,
                        bank_account_number:  res.data?.payment.bank_account_number,
                        payment_method: res.data?.payment?.payment_method,
                        remark:  res.data?.payment?.remark,
                        remaining_ins:res.data?.payment.remaining_ins,
                        payed_at:  res.data?.payment?.payed_at ?? new Date(),
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
            if (res.data?.status == 'cancel') {
                Swal.fire({
                    icon: 'error',
                    title: 'ยกเลิกชำระเงิน',
                    padding: '10px 20px',
                }).then(() => {
                    setTimeout(() => {
                        window.location.reload(); 
                    }, 3000);
                    
                });
            } else if (res.data?.status == 'complete') {
                Swal.fire({
                    icon: 'success',
                    title: 'ชำระเงินสำเร็จ',
                    padding: '10px 20px',
                }).then(() => {
                    window.location.reload();
                });
            }
        },
        onError: (err: any) => {
            showNotification(err.message, 'error');
            setLoading(false);
        },
    });

    useEffect(() => {

        if(paymentQr?.id_payment){
            const interval = setInterval(async () => {
                try {
                    fetchPaymentStatus({data: { id_contract: contract_uuid, type: 'close_contract' } });
                } catch (error) {
                  console.error('Error checking payment status:', error)
                }
              }, 10000)
              return () => clearInterval(interval)
        }
    }, [paymentQr]);

    const SubmittedForm = Yup.object().shape({

        payed_at: Yup.string().nullable().required('กรุณาใส่เลือกวันที่'),
        bank_account_number: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        amount: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        ...(formData?.penalty_fee_limit > 0  ? {
            penalty_fee: Yup.number().max(formData?.penalty_fee_limit, `ค่าดำเนินการล่าช้าไม่เกิน ${formData?.penalty_fee_limit} บาท/ครั้ง`).required('กรุณาใส่ข้อมูลให้ครบ'),
        } : {
            penalty_fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ'),
        }),
               
        unlock_fee: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        discount: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        //discount: Yup.number().max((formData?.amount * formData?.remaining_ins)-1).required('กรุณาใส่ข้อมูลให้ครบ'),

    });

    const onImgChange = async (imageList: ImageListType) => {
        const resizedImages = await resizeImage(imageList);
        setImages(resizedImages);
    };

    const { mutate: makePayment,isLoading } = useGlobalMutation(url_api.contractMakePaymentClose, {
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
                    setLoading(false)
                    Swal.fire({
                        icon: 'success',
                        title: 'ชำระเงินสำเร็จ',
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
                        title: 'เพิ่มไฟล์ผิดพลาดกรุณาใช้ไฟล์ที่เป็นรูปเท่านั้น',
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
        console.log("event.value",event.value)
        if(event.value == 'promptpay') {
            setMasterDataBankList([{value:'promptpay',label:'promptpay'}])
            props.setFieldValue('bank_account_number', "promptpay")
        } else {
            setMasterDataBankList(masterBankList)
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
    }

    interface makePaymentCash {
        id_contract: any;
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

    const handleUpdatePayment  = async (event:any) => {
        const imageTotal = formData?.payment_slip?.length + images?.length
        if(imageTotal > 10) {
            toast.fire({
                icon: 'error',
                title: 'รูปภาพเกิน 10 รูป',
                padding: '10px 20px',
            });
            return false
        }
        
        interface paymentCashUpdate {
            id_payment: string;
            id_invoice:number;
            reference: string;
            bank_account_number: string;
            amount: number;
            penalty_fee: number;
            unlock_fee: number;
            discount: number;
            payed_at: any;
            type:string
        }
        ///update
        const payed_at_now = new Date(event.payed_at); // Convert to Date object
        payed_at_now.setHours(payed_at_now.getHours() + 7);
        const payed_at_formattedISO = payed_at_now.toISOString();
        
        const dataPayment:paymentCashUpdate = {
            id_payment: event.id_payment,
            id_invoice:event.id_invoice,
            reference: event.reference,
            bank_account_number: event.bank_account_number,
            amount: Number(event.amount),
            penalty_fee: Number(event.penalty_fee),
            unlock_fee: Number(event.unlock_fee),
            discount: Number(event.discount),
            payed_at: payed_at_formattedISO,
            type:"close_contract"
        }

        Swal.fire({
            title: 'ยืนยันการแก้ไขข้อมูล',
            text: 'คุณต้องการแก้ไขข้อมูลการชำระเงินรายการนี้ใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: themeInit.color.themePrimary,
            cancelButtonColor: '#d33',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            html:
                `
                <label for="password" style="display: block; text-align: left; font-size: 1rem; margin-top: 10px; color: #000000 color: #000000;">รหัสผ่านผู้ใช้งาน:</label>
                <input id="password" type="password" type="text" class="swal2-input" style="margin: 0 !important; width: 100%; font-size: 1rem; color: #000000;" placeholder="รหัสผ่านผู้ใช้งาน สำหรับยืนยันการแก้ไข">`,
            preConfirm: () => {
                const password = document?.getElementById('password')?.value;

                if (!password) {
                    Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
                    return false;
                }

                return {password };
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    setLoading(true);
                    const { password } = result.value;
                    updatePayment({ data: { ...dataPayment,password:password} });
                    setIsEdit(false)
                    
                }
            });
    }
    
    const { mutate: updatePayment,isLoading:isUpdateLoading } = useGlobalMutation(url_api.updatePayment, {
        onSuccess: async (res: any) => {
            if (res.statusCode !== 400) {
                const id_payment = res.data.id;
                try {
                    await upLoadImg(id_payment);
                    setLoading(false)
                    Swal.fire({
                        icon: 'success',
                        title: 'ชำระเงินสำเร็จ',
                        padding: '10px 20px',
                    }).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    console.error('Error uploading images:', error);
                }
            } else {
                setLoading(false)
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

    const submitForm = useCallback(
        (event: any,is_edit:boolean) => {
            if(is_edit) {
                handleUpdatePayment(event)
            } else {
                const payed_at_now = new Date(event.payed_at); // Convert to Date object
                payed_at_now.setHours(payed_at_now.getHours() + 7);
                const payed_at_formattedISO = payed_at_now.toISOString();
                const dataPayment:makePaymentCash = {
                    id_contract: contract_uuid,
                    remark: event.remark,
                    reference: event.reference,
                    bank_account_number: event.bank_account_number,
                    amount: Number(event.amount),
                    payed_at: payed_at_formattedISO,
                    penalty_fee: Number(event.penalty_fee),
                    unlock_fee: Number(event.unlock_fee),
                    discount: Number(event.discount),
                }

                
                Swal.fire({
                    title: 'ยืนยันการชำระเงิน',
                    text: 'คุณต้องการชำระเงินรายการนี้ใช่หรือไม่?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: themeInit.color.themePrimary,
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'ยืนยัน',
                    cancelButtonText: 'ยกเลิก',
                    reverseButtons: true,
                }).then((result) => {
                    if (result.isConfirmed) {
                        setLoading(true);
                        if (images.length > 0) {
                            makePayment({ data:dataPayment});
                            
                        } else {
                            setLoading(false);
                            toast.fire({
                                icon: 'error',
                                title: 'กรุณาเพิ่มรูปหลักฐานการชำระเงินอย่างน้อย 1 รูป',
                                padding: '10px 20px',
                            });

                        }
                    }
                });
            }
            
        },
        [makePayment, images]
    );

    const onError = () => {
        toast.fire({
            icon: 'error',
            title: 'รูปภาพเกิน 10 รูป',
            padding: '10px 20px',
        });
    };

    useEffect(() => {
        setLoading(true);
        fetchContranctPaymentData({ data: { id_contract: contract_uuid, id_installment: installment_id } });
    }, [contract_id, installment_id]);

    interface TimeLeft {
        days?: number
        hours?: number
        minutes?: number
        seconds?: number
    }

    const timerComponents: JSX.Element[] = []
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({})
    Object.keys(timeLeft).forEach((interval) => {
      if (!timeLeft[interval as keyof TimeLeft]) {
        return
      }
      timerComponents.push(
        <span key={interval}>
          {timeLeft[interval as keyof TimeLeft]} {interval}{' '}
        </span>
      )
    })

    useEffect(() => {
        if (!expiredate) return
        const calculateTimeLeft = () => {
          const difference = +new Date(expiredate) - +new Date()
          let timeLeft: TimeLeft = {}
          if (difference > 0) {
            timeLeft = {
              days: Math.floor(difference / (1000 * 60 * 60 * 24)),
              hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
              minutes: Math.floor((difference / 1000 / 60) % 60),
              seconds: Math.floor((difference / 1000) % 60),
            }
          }
          return timeLeft
        }
        const timer = setInterval(() => {
          setTimeLeft(calculateTimeLeft())
        }, 1000)
        return () => clearInterval(timer)
    }, [expiredate])
    

    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = qrCodeImage
        link.download = 'qr_code.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    interface makePaymentQrCode{
        id_contract: any;
        invoice_type:string,
        penalty_fee: number;
        amount:number
        unlock_fee: number;
        discount: number;
        remark: string;
    }

    const handleGenerateQrcode = async (data:any) => { 
        const dataPayment:makePaymentQrCode = {
            id_contract: contract_uuid,
            invoice_type:'close_contract',
            amount : +data.amount,
            penalty_fee: +data?.penalty_fee,
            unlock_fee: +data?.unlock_fee,
            discount: Number(data.discount),
            remark: data?.remark ?? '',
        }
        generateQrcode({data : dataPayment})
       
    }
    //isLoading: isLoadding
    const { mutate: generateQrcode,isLoading:isGenLoading } = useGlobalMutation(url_api.getPaymentClose, {
        onSuccess: async (res: any) => {
            if (res.statusCode === 400 || res.code === 400) {
                window.location.reload();
            } else {
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
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
    
    const { mutate: cancelQrcode,isLoading:isCancelLoading  } = useGlobalMutation(url_api.cancelQrcode, {
        onSuccess: async (res: any) => {
            if (res.statusCode === 400 || res.code === 400) {
               showNotification(res.message, 'error');
            } else {
                window.location.reload()
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
       setLoading(true)
       cancelQrcode({data: { id_payment:paymentQr.id_payment }})
    }
    return (
        <>
            {(loading || isLoading || isGenLoading || isCancelLoading || isAddImageLoading || isUpdateLoading || isUploadLoading || isFetchData) && <PreLoading />}
            <div className="flex items-center justify-between flex-wrap">
                <Breadcrumbs items={breadcrumbItems} />
                {formData.isReferenceExists && formData?.payment_method == 'cash' && !isEdit && (
                     <div className="flex">
                         <a className="hover:text-info cursor-pointer btn btn-primary mr-1" onClick={() => goEdit()}>
                            <IconEdit className="w-4.5 h-4.5" /> &nbsp;
                            แก้ไข
                        </a>
                     </div>
                )}
               
            </div>
               
            {isOpenPic && <Lightbox mainSrc={pictureURL} onCloseRequest={() => setIsOpenPic(false)} />}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
     
                <Formik
                    initialValues={formData}
                    onSubmit={(values) => submitForm(values,isEdit)}
                    enableReinitialize
                    autoComplete="off"
                    validationSchema={SubmittedForm}
                >
                    {(props) => {
                        useEffect(() => {
                            const penalty_fee = (props.values.penalty_fee ? +(props.values.penalty_fee) : 0)
                            const unlock_fee =   (props.values.unlock_fee ? +(props.values.unlock_fee) : 0)
                            const amount = formData.isReferenceExists ? formData?.amount : formData?.amount * formData?.remaining_ins
                            const discount = (props.values.discount ? +(props.values.discount) : 0)
                            const sum =  penalty_fee +unlock_fee + amount - discount ;
                            props.setFieldValue('total', sum);
                            // props.setFieldValue('amount', sum);
                            
                        }, [props.values.penalty_fee, props.values.unlock_fee,props.values.discount, props.setFieldValue]);

                        return (
                            <Form onSubmit={props.handleSubmit} className="space-y-5 dark:text-white custom-select">
                                <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">รับชำระเงิน</div>

                                <div className="grid grid-cols-6 gap-4">
                                    <div className="col-start-1 col-end-3">
                                        <label htmlFor="">เลขที่สัญญา</label>
                                        <input disabled type="text" value={info?.reference} className='form-input disabled:bg-[#eee] ' />
                                    </div>
                                </div>

                                <div className="table-responsive pt-10">
                                    <div className="text-md font-semibold ltr:sm:text-left rtl:sm:text-right text-center">รายการ</div>

                                    <table className="table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th className="text-left" style={{ width: '50px' }}>งวดที่</th>
                                                <th className="text-center" style={{ width: '100px' }}>จำนวนคงเหลือทั้งสิ้น</th>
                                                <th className="text-center" style={{ width: '100px' }}>ค่าดำเนินการล่าช้า</th>
                                                <th className="text-center" style={{ width: '100px' }}>ค่าปลดล๊อค</th>
                                                <th className="text-center" style={{ width: '100px' }}>ส่วนลด</th>
                                                <th className="text-center" style={{ width: '100px' }}>รวม</th>
                                            </tr>
                                        </thead>
                                    
                                        <tbody>
                                            <tr>
                                                <td className="text-left">{info?.ins_no}</td>
                                                <td className="text-center">
                                                    {formData.isReferenceExists 
                                                        ? numberCommas(formData?.amount || 0)
                                                        : `${numberCommas(formData?.amount || 0)} * ${numberCommas(formData?.remaining_ins || 0)} = ${numberCommas(formData?.amount * formData?.remaining_ins || 0)}`
                                                    }
                                                </td>
                                                <td>
                                                    <InputField
                                                        label=""
                                                        name="penalty_fee"
                                                        disabled={!!formData.isReferenceExists && !isEdit}
                                                        onKeyPress={(e: any) => {
                                                            if (!/[0-9]/.test(e.key)) {
                                                                e.preventDefault()
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
                                                                e.preventDefault()
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
                                                                e.preventDefault()
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                
                                                <td>
                                                    <InputField
                                                        label=""
                                                        name="total"
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan={5} className="text-right font-bold py-4">จำนวนเงินทั้งสิ้น</td>
                                                <td className="text-center font-bold">{numberCommas(props.values.total) + ' บาท'}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <>
                                        <div className="input-flex-row">
                                            <InputField
                                                label="หมายเลขอ้างอิง"
                                                name="reference"
                                                disabled={(!!formData.isReferenceExists || props.values.payment_method == 'promptpay') && !isEdit}
                                            />
                                            <DatePickerTime
                                                require
                                                label="วันที่และเวลาที่ชำระ"
                                                name="payed_at"
                                                selected={props.values.payed_at}
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
                                                label="ช่องทางชำระเงิน"
                                                id="payment_method"
                                                name="payment_method"
                                                placeholder="กรุณาเลือก"
                                                options={masterPaymentMethod}
                                                isSearchable={false}
                                                onChange={(e: any) => {
                                                    handleChangePayment(props, e, 'payment_method');
                                                }}
                                                disabled={!!formData.isReferenceExists && !isEdit}
                                            />
                                            
                                            <SelectField
                                                require
                                                label="โอนเข้าบัญชีธนาคาร"
                                                id="bank_account_number"
                                                name="bank_account_number"
                                                placeholder="กรุณาเลือก"
                                                options={masterDataBankList}
                                                isSearchable={false}
                                                onChange={(e: any) => {
                                                    handleChangeSelect(props, e, 'bank_account_number');
                                                }}
                                                disabled={(!!formData.isReferenceExists || props.values.payment_method == 'promptpay') && !isEdit}
                                            />

                                        </div>

                                        <div className="input-flex-row">
                                                
                                            <InputField
                                                label="ยอดชำระเงิน"
                                                name="total"
                                                type="text"
                                                disabled
                                            />

                                        </div>
                                        {props.values.payment_method != 'promptpay' && (
                                        <div className="flex flex-row mt-6 gap-4">
                                            <div className="upload-container w-full">
                                                <div className="custom-file-container" data-upload-id="firstImage">
                                                    <div className="label-container">
                                                        <p>หลักฐานการโอนเงิน </p>
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
                                                                            เลือกไฟล์...
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
                                        )}

                                        <div className="input-flex"></div>
                                        <div className="mt-6">
                                            <InputField
                                                label="หมายเหตุ"
                                                name="remark"
                                                as="textarea"
                                                rows="5"
                                                className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                                                default-value="-"
                                                disabled={!!formData.isReferenceExists}
                                            />
                                        </div>
                                  
                                        <div className="i">
                                            {formData?.payment_qr && qrCodeImage && (
                                                info?.status !== 'complete' ? (
                                                    <>
                                                        <div className="flex text-center justify-center font-normal">
                                                            <div
                                                                className={`badge ${info?.status === 'complete' ? 'badge-outline-success' : info?.status === 'pending' ? 'badge-outline-warning' : 'badge-outline-danger'}`}
                                                            >
                                                                {info?.status === 'complete' ? 'สำเร็จ' : info?.status === 'pending' ? 'รอชำระ' : 'ยกเลิก'}
                                                            </div>
                                                        </div>
                                                        
                                                                    <div className="border-[#ebedf2] dark:border-[#1b2e4b]">
                                                            <div className="my-4">{(qrCodeImage && timerComponents.length) ? <img src={qrCodeImage} alt="QR Code" className="w-full max-w-xs mx-auto" /> : <div>{expiredate}</div>}</div>
                                                        </div>

                                                        <div className="text-center">
                                                            <div className="py-2">เวลานับถอยหลัง</div>
                                                            <div>
                                                                {timerComponents.length && (timerComponents)}
                                                            </div>
                                                        </div>

                                                        <br />
                                                        {(qrCodeImage && timerComponents.length) && (
                                                            <div className="text-center">
                                                                <button type="button" className="bg-blue-600 text-white py-2 px-4 rounded mr-2.5" onClick={handleDownload}>
                                                                บันทึกรูป
                                                                </button>

                                                                <button type="button" className="bg-red-600 text-white py-2 px-4 rounded mg" onClick={handleCancelQrCode}>
                                                                ยกเลิก
                                                                </button>

                                                            </div>
                                                        )}

                                                    </>
                                                    
                                                ) : (
                                                    <> </>
                                                )
                                            )}
                                        </div>

                                        {props.values.payment_method != 'cash' && info?.status != 'complete' &&  !qrCodeImage &&  props.values.payment_method !== undefined &&  (
                                            <div className="flex justify-center items-center mt-8">
                                                <button type='button' className='btn btn-primary ltr:ml-4 rtl:mr-4' onClick={()=>handleGenerateQrcode(props.values)}> สร้าง QR CODE </button>
                                            </div>
                                        )}
                                        {props.values.payment_method == 'cash' && (info?.status != 'complete' || isEdit) && (
                                            <div className="flex justify-center items-center mt-8">
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    {!isEdit ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                            </Form>
                        )
                    }}
                </Formik>
               
            </div>

            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <h5 className="text-lg font-semibold mb-4">ประวัติการทำรายการ</h5>
                <div className="datatables pagination-padding">
            
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={history}
                        columns={[
                            {
                                accessor: 'id',
                                title: 'ลำดับ',
                                textAlignment: 'center',
                                sortable: false,
                                render: (item,index) => <p>{history.length - index}</p>
                            },
                            {
                                accessor: 'reference',
                                title: 'Reference',
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'amount',
                                title: 'ค่างวด',
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'penalty_fee',
                                title: 'ค่าดำเนินการล่าช้า',
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'unlock_fee',
                                title: 'ค่าปลดล็อค',
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'discount',
                                title: 'ส่วนลด',
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'total',
                                title: 'ชำระทั้งสิ้น',
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'bank_account_number',
                                title: 'บัญชีธนาคาร',
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'payed_at',
                                title: 'วันที่ชำระ',
                                textAlignment: 'center',
                                sortable: false,
                                render: (item:any) => <p>{convertDateTimeDbToClient(item?.payed_at)}</p>
                            },
                            {
                                accessor: 'admin_name',
                                title: 'ผู้ดำเนินการ (ปรับปรุง)',
                                textAlignment: 'center',
                                sortable: false,
                            },
                            {
                                accessor: 'created_at',
                                title: 'วันที่ - เวลา',
                                textAlignment: 'center',
                                sortable: false,
                                render: (item:any) => <p>{convertDateTimeDbToClient(item?.created_at)}</p>
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

export default CloseContract;

