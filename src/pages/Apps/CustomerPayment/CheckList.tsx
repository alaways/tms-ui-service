import React, { useState, useEffect, Fragment, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { DataTable } from 'mantine-datatable'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { Tab, Dialog, Transition } from '@headlessui/react'
import { convertDateClientToDb, convertDateDbToClient, convertTimeDateDbToClient } from '../../../helpers/formatDate'
import Tippy from '@tippyjs/react'
import IconSearch from '../../../components/Icon/IconSearch'
import { ErrorMessage, Form, Formik } from 'formik';
import IconX from '../../../components/Icon/IconX'
import moment from 'moment-timezone'
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { resizeImage } from '../../../helpers/helpFunction';
import { toastAlert } from '../../../helpers/constant';
import Swal from 'sweetalert2'
import { useUploadMutation } from '../../../services/mutations/useUploadMutation'
import _ from 'lodash'
import PreLoading from '../../../helpers/preLoading'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import themeInit from '../../../theme.init'
import { showNotification } from '../../../helpers/showNotification'
interface Installment {
    id: string
    amount: number
    due_at: string
    status: string
    payment?: { amount: number }
    payed_at?: string
    is_due?: boolean
    ins_no: string
}

const mode = process.env.MODE || 'admin'

const List: React.FC = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    //TODO ???
    const location = useLocation()

    const [actionModal, setActionModal] = useState(false)
    const [modalUpload, setModalUpload] = useState(false)
    const { contractData } = location.state || {}

    const storedUser = localStorage.getItem(mode)
    const role = storedUser ? JSON.parse(storedUser).role : null
    const [loading, setLoading] = useState(true)
    const [installment, setInstallemnts] = useState<any[]>([])
    const [installemntLast, setInstallmentLast] = useState<any | null>(null)
    const [installmentDetail, setInstallmentDetail] = useState<any>({})
    const [contract,setContract] = useState<any>({})
    const [asset, setAsset] = useState<any>({})
    const [formData,setFormData] = useState({
        id_payment:0,
        payment_slip:[]
    })
    const [images, setImages] = useState<any>([]);
    const toast = Swal.mixin(toastAlert);
  

    const { mutate: fetchData,isLoading } = useGlobalMutation(url_api.customContract+contractData.id, {
        onSuccess: (res: any) => {

            const { installments, asset, ...contractData } = res.data;

            if(contractData?.on_payment_process == 'close_contract') {
                 navigate('/apps/customer-payment/invoice-cc/' + contractData.id );
            }
            setInstallemnts(installments);
            setAsset(asset);
            setContract(contractData);

            const firstUnpaidInstallment = res.data.installments.find((installment: Installment) => installment.payed_at === null)
            setInstallmentLast(firstUnpaidInstallment || null)
            setLoading(false)
        },
        onError: () => {
            // Handle error
            setLoading(false)
        },
    })

    useEffect(() => {
        if (role !== 'customer') {
            navigate('/')
        }
    }, [role, navigate])

    useEffect(() => {
        dispatch(setPageTitle('ยอดที่ต้องชำระ'))
    }, [dispatch])

    useEffect(() => {
        if (contractData) {
            fetchData({})
        }
    }, [fetchData, contractData])

    const getStatusText = (status: string, is_due?: boolean) => {
        switch (status) {
            case 'complete':
                return 'ชำระแล้ว'
            default:
                return is_due ? 'ค้างชำระ' : 'ยังไม่ครบกำหนด'
        }
    }

    // TODO: change to btn-info
    const getStatusClassName = (status: string, is_due?: boolean) => {
        switch (status) {
            case 'complete':
                return 'btn-success'
            default:
                return is_due ? 'btn-danger' : 'btn-dark'
        }
    }

    const goPreview = (item: Installment) => {
        //TODO: update param name
        navigate('/apps/customer-payment/invoice', {
            state: {
                installmentLast: installemntLast?.id,
                contractID: contractData.id,
                ins_no: item,
                history: true,
            },
        })
    }

    const onImgChange = async (imageList: ImageListType) => {
        console.log("image,change",imageList)
        const resizedImages = await resizeImage(imageList); 
        console.log("resizedImages",resizedImages)
        setImages(resizedImages);
     };

    const onError = () => {
        toast.fire({
            icon: 'error',
            title: 'รูปภาพเกิน 10 รูป',
            padding: '10px 20px',
        });
    };


    const submitForm = useCallback(
        async (event: any) => {
            console.log(event?.id_payment)
            if (event?.id_payment) {
            await upLoadImg(event?.id_payment);
            }
            // //YYY0000019
        },
        [images]
     );

    const { mutateAsync: uploadFile, isLoading: isUpload } = useUploadMutation({
        onSuccess: (res: any) => {
            
        },
        onError: (err: any) => {
            
        },
    });
    
    const { mutateAsync: addContractImage} = useGlobalMutation(url_api.contractAddSlip)

    const upLoadImg = async (id_payment: number) => {
        const uploadPromises: any = [];
        console.log("id",id_payment)
        console.log("images",images)
        images.forEach((item: any) => {
           // if (_.isUndefined(item?.id)) {
                uploadPromises.push(uploadFile({ data: { file: item.file, type: 'payment' } }));
            //}
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

            Swal.fire({
                icon: 'success',
                title: 'ชำระเงินสำเร็จ',
                padding: '10px 20px',
            }).then(() => {
                window.location.reload();
            });
                          
        }
    };

    const handleModalUpload = (data:any) => {
        
        setFormData({
           ...formData,
            payment_slip:data?.payment_slip ?? [],
            id_payment:data?.payment.id
        })

        console.log("setFormData",data?.payment.id)
         setModalUpload(true) 
    }

    const { mutate: cancelQrcode,isLoading:cancelLoading } = useGlobalMutation(url_api.customerCancelQrcode, {
      onSuccess: async (res: any) => {
          if (res.statusCode === 400 || res.code === 400) {
              showNotification(res.message, 'error');
          } else {
            toast.fire({
                icon: 'success',
                title: 'สำเร็จ',
                padding: '10px 20px',
            })
            setTimeout(() => {
              window.location.reload()
          }, 500);
            //
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

        Swal.fire({
            title: 'ยืนยันการยกเลิกการชำระเงิน',
            text: 'คุณต้องการยกเลิกชำระเงินใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: themeInit.color.themePrimary,
            cancelButtonColor: '#d33',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                cancelQrcode({data: { id_payment:installemntLast.payment.uuid }})
                
            }
        });
    
    }

    const closeContact = async () => {
        
        if(contract.on_payment_process == "close_contract") {
           navigate('/apps/customer-payment/invoice-cc/' + contractData.id );
        } else {
            Swal.fire({
                title: 'คุณต้องการปิดสัญญาใช่หรือไม่',
                text: '',
                showCancelButton: true,
                confirmButtonText: 'ยืนยัน',
                cancelButtonText: 'ยกเลิก',
                reverseButtons: true,
                didOpen: () => {
                    const confirmButton: any = Swal.getConfirmButton();
                    const cancelButton: any = Swal.getCancelButton();
                    confirmButton.style.backgroundColor = themeInit.color.themePrimary; // สีเขียว
                    confirmButton.style.color = 'white';
                    cancelButton.style.backgroundColor = '#2196F3'; // สีฟ้า
                    cancelButton.style.color = 'white';
                }
            }).then((result) => {
                if (result.isConfirmed) {
                  navigate('/apps/customer-payment/invoice-cc/' + contractData.id );
                }
            });
        }
    }

    return (
      
     
        <div>
            {(isUpload || isLoading || cancelLoading) && <PreLoading />}
            <div className="flex justify-between">
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link to="/apps/customer-payment/list" className="text-primary hover:underline">
                            หน้าหลัก
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>เลขที่สัญญา {contractData.reference}</span>
                    </li>
                </ul>
                
                {themeInit?.features.customer_close_contract && contract.on_payment_process === "" && (
                    <div>
                        <button
                        type="button"
                        className={`flex-0 btn btn-sm btn-outline-danger`}
                        onClick={() => closeContact()}
                        disabled={contract.on_payment_process === "pay_installment"}
                        >
                        ปิดสัญญา {contract.on_payment_process === "close_contract" ? "(กำลังชำระเงิน)" : ""}
                        </button>
                    </div>
                )}
            </div>
            <div className="pt-5">
                <div className="panel px-0 border-white-light dark:border-[#1b2e4b] pt-0">
                    {themeInit.features?.customer_close_contract && contract.on_payment_process === "pay_installment" && (
                        <div className="w-full h-auto text-center text-warning bg-warning-light dark:bg-warning-dark-light rounded-md mb-5">
                            <div className="flex justify-between items-center p-5">
                            <div
                                className="text-left"
                            >
                                ขณะนี้อยู่ระหว่างการดำเนินการชำระเงิน กรุณาชำระเงิน หรือกดยกเลิกหากท่านไม่ประสงค์จะดำเนินการต่อ {">"}
                            </div>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleCancelQrCode()}
                            >
                                ยกเลิก
                            </button>
                            </div>
                        </div>
                    )}
                    
                            
                    <div className="flex items-center justify-between mb-10">
                        <h5 className="font-semibold text-lg dark:text-white-light pl-4">
                            เลขที่สัญญา {contractData.reference}
                        </h5>
                        {/* TODO: change param later */}
                        <p className="mr-4">
                            งวดที่ {installemntLast?.ins_no} / {installment.length}
                        </p>
                    </div>
                    {!installemntLast?.payed_at && (
                        <>
                            <div className="flex items-center justify-center my-5">
                                <h2 className="text-xl">ยอดที่ต้องชำระ</h2>
                            </div>
                            <div className="flex items-center justify-center">
                                <p className="text-5xl">{isLoading ? 0 : (installemntLast?.amount + installemntLast?.penalty_fee + installemntLast?.unlock_fee).toLocaleString()} บาท</p>
                            </div>
                            <div className="flex items-center justify-center my-5">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-lg w-36 border-0 bg-gradient-to-r from-[#3d38e1] to-[#1e9afe]"
                                    onClick={() => installemntLast && goPreview(installemntLast)}
                                >
                                    ชำระเงิน
                                </button>
                            </div>
                        </>
                    )}
                    <div className="datatables pagination-padding">
                        
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={installment}
                            highlightOnHover
                            columns={[
                                {
                                    accessor: 'id',
                                    title: 'ลำดับ',
                                    sortable: false,
                                    render: (row, index) => <div>{index + 1}</div>
                                },
                                {
                                    accessor: 'amount',
                                    title: 'ผ่อนงวดละ',
                                    sortable: false,
                                    render: ({ amount }) => (
                                        <div className="flex items-center font-normal">
                                            <div>{amount?.toLocaleString()}</div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'due_at',
                                    title: 'วันที่ครบกำหนด',
                                    sortable: false,
                                    render: ({ due_at }) => (
                                        <div className="flex items-center font-normal">
                                            <div>{convertDateDbToClient(due_at)}</div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'status',
                                    title: 'สถานะ',
                                    sortable: false,
                                    render: ({ status, is_due }) => (
                                        <div className="flex items-center font-normal">
                                            <span className={`badge ${getStatusClassName(status, is_due)}`}>
                                                {getStatusText(status, is_due)}
                                            </span>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'payment',
                                    title: 'ยอดชำระ',
                                    sortable: false,
                                    render: ({ ins_no, payment }) => (
                                        <div className="flex items-center font-normal">
                                            {installemntLast?.ins_no !== undefined && ins_no <= installemntLast?.ins_no ? (
                                                <div>{payment?.amount != null ? payment.amount : '-'}</div>
                                            ): (
                                                <div>-</div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'payed_at',
                                    title: 'วันที่ชำระ',
                                    sortable: false,
                                    render: ({ payed_at }) => (
                                        <div className="flex items-center font-normal">
                                            <div>{payed_at ? convertDateDbToClient(payed_at) : '-'}</div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'action',
                                    title: 'Actions',
                                    sortable: false,
                                    textAlignment: 'center',
                                    render: (item) => (
                                        <div className="flex gap-4 items-center w-max mx-auto">
                                            {item.status == 'complete' && (
                                                <>  
                                               
                                                     <Tippy theme="Primary">
                                                        <a className="flex hover:text-info cursor-pointer" onClick={() => { setInstallmentDetail(item); setActionModal(true) }}>
                                                        รายละเอียด
                                                        </a>
                                                    </Tippy>

                                                     <Tippy theme="Primary">
                                                        <a className="flex hover:text-info cursor-pointer" onClick={() => handleModalUpload(item)}>
                                                        หลักฐานการโอนเงิน
                                                        </a>
                                                    </Tippy>
                                                </>
                                               
                                                
                                            )}
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
            <Transition appear show={actionModal} as={Fragment}>
                <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActionModal(false)
                                        }}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        เลขที่สัญญา : {contractData.reference}
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-2 content-center">
                                            <div className="h-auto p-2 w-auto"> ชื่อสินทรัพย์ </div>
                                            <div className="h-auto p-2 w-auto text-right"> {asset?.name}</div>
                                        </div>
                                        <div className="grid grid-cols-2 content-center">
                                            <div className="h-auto p-2 w-auto"> งวดที่ </div>
                                            <div className="h-auto p-2 w-auto text-right"> {installmentDetail?.ins_no}</div>
                                        </div>
                                        <div className="grid grid-cols-2 content-center">
                                            <div className="h-auto p-2 w-auto"> วันที่ชำระ </div>
                                            <div className="h-auto p-2 w-auto text-right"> {installmentDetail?.payed_at ? moment(installmentDetail?.payed_at).format('DD/MM/YYYY') : '-'} </div>
                                        </div>
                                        <div className="grid grid-cols-2 content-center">
                                            <div className="h-auto p-2 w-auto"> ค่างวด </div>
                                            <div className="h-auto p-2 w-auto text-right"> {installmentDetail?.amount?.toLocaleString('en-US')} บาท</div>
                                        </div>
                                        {installmentDetail?.penalty_fee > 0 && (
                                        <div className="grid grid-cols-2 content-center">
                                            <div className="h-auto p-2 w-auto"> ค่าดำเนินการล่าช้า </div>
                                            <div className="h-auto p-2 w-auto text-right"> {installmentDetail?.penalty_fee?.toLocaleString('en-US')} บาท</div>
                                        </div>
                                        )}
                                        {installmentDetail?.unlock_fee > 0 && (
                                        <div className="grid grid-cols-2 content-center">
                                            <div className="h-auto p-2 w-auto"> ค่าปลดล็อค </div>
                                            <div className="h-auto p-2 w-auto text-right"> {installmentDetail?.unlock_fee?.toLocaleString('en-US')} บาท</div>
                                        </div>
                                        )}
                                        {installmentDetail?.discount > 0 && (
                                            <div className="grid grid-cols-2 content-center">
                                                <div className="h-auto p-2 w-auto"> ส่วนลด </div>
                                                <div className="h-auto p-2 w-auto text-right"> {installmentDetail?.discount?.toLocaleString('en-US')} บาท</div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 content-center">
                                            <div className="h-auto p-2 w-auto"> รวมเป็นเงิน </div>
                                            <div className="h-auto p-2 w-auto text-right">
                                                {((installmentDetail?.payment?.amount || 0)).toLocaleString('en-US')} บาท
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>


            <Transition appear show={modalUpload} as={Fragment}>
                <Dialog as="div" open={modalUpload} onClose={() => setActionModal(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark" style={{maxWidth:'800px',width:'90%'}}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImages([]);
                                            setModalUpload(false)
                                        }}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        เพิ่มหลักฐานการชำระเงิน
                                    </div>
                                     <Formik initialValues={formData} onSubmit={(values) => submitForm(values)} enableReinitialize autoComplete="off" onChange={() => console.log("")}>
                                        {(props) => {
                                            return (
                                                <Form onSubmit={props.handleSubmit} className="space-y-5 dark:text-white custom-select">
                             
                                                    <div className="flex flex-row pt-4 pb-4 gap-4">
                                                        <div className="upload-container w-full" style={{paddingLeft:'10px',paddingRight:'10px'}}>
                                                            <div className="custom-file-container" data-upload-id="firstImage">
                                                                <input type="hidden" name="id_payment" value={formData.id_payment} readOnly/>
                                                                <input type="file" className={`custom-file-container__custom-file__custom-file-input hidden`} accept="image/*" />
                                                                <input type="hidden" name="MAX_FILE_SIZE1" value="10485760" />
                                                                <div>
                                                                    <ImageUploading multiple value={images} onChange={onImgChange} onError={onError} maxNumber={10}>
                                                                        {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                                            <div className="upload__image-wrapper">
                                                                             <div className="flex space-x-4">
                                                                                <button className="btn btn-primary" onClick={onImageUpload} type="button">
                                                                                    เลือกไฟล์...
                                                                                </button>

                                                                                <button type="submit" className="btn btn-success">
                                                                                    บันทึกข้อมูล
                                                                                </button>
                                                                             </div>

                                                                       
                                                                                <div className="grid gap-4 sm:grid-cols-3 grid-cols-1 pt-[70px]">
                                                                                    {formData?.payment_slip?.map((image: any, index: any) => (
                                                                                        <div key={index} className="custom-file-container__image-preview relative">
                                                                                            <img
                                                                                                src={image.image_url}
                                                                                                alt="img"
                                                                                                className={'m-auto pointer'}
                                                                                                onClick={() => {
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                    ))} 
                                                                                </div>
            
                                                                                <div className="grid gap-4 sm:grid-cols-3 grid-cols-1">
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
                    
                                                    
                                                </Form>
                                            );
                                        }}
                                    </Formik>    
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )

}

export default List
