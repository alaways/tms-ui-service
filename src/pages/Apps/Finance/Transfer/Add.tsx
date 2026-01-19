import { Form, Formik } from 'formik';
import { convertDateClientToDb } from '../../../../helpers/formatDate';
import { useCallback, useEffect, Fragment,useState, useRef } from 'react';

import * as Yup from 'yup';
import InputField from '../../../../components/HOC/InputField';
import SelectField from '../../../../components/HOC/SelectField';
import { NavLink, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../../../helpers/breadcrumbs';
import { useGlobalMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';
import { Shop } from '../../../../types';
import { values } from 'lodash';
import { toastAlert } from '../../../../helpers/constant';
import PreLoading from '../../../../helpers/preLoading';
import Swal from 'sweetalert2';
import { Dialog, Transition } from '@headlessui/react'
import IconX from '../../../../components/Icon/IconX';
import IconChecks from '../../../../components/Icon/IconChecks';
import themeInit from '../../../../theme.init';
import PinField from "react-pin-field";
const mode = process.env.MODE || 'admin';

const breadcrumbItems = [
    { label: 'ประวัติการโอนเงิน', to: '/apps/finance/transfer-history' },
    { label: 'โอนเงิน', isCurrent: true },
];

const AddTransfer = () => {
    const storedUser = localStorage.getItem(mode);
    const [modalPin, setModalPin] = useState<boolean>(false);
    const [pinValue, setPinValue] = useState<any>('');
    const pinRef = useRef<HTMLInputElement[] | null>(null);
    const toast = Swal.mixin(toastAlert);
    const navigate = useNavigate()
    const nameLocal = storedUser ? JSON.parse(storedUser).name : null;
    const [shopBanks, setShopBanks] = useState<any>([])
    const [shopLists, setShopLists] = useState<Shop[]>([])
    const [companyList, setCompanyList] = useState<any[]>([
      {
        label:'TMS',
        value:'tms',
      },
      {
        label:'ITmoney',
        value:'itm',
      },
      {
        label:'Rub Phone',
        value:'rph',
      }
    ])
    if(mode != 'admin') {
        navigate('/apps/login')
    }
    const [actionModal, setActionModal] = useState(false)
    const [dataTransfer, setDataTransfer] = useState<any>([])
    const [defaultForm, setDefaultForm] = useState<any>({
        id_shop:'',
        type: '',
        id_shop_bank: '',
        userChanged: nameLocal,
        created_at: convertDateClientToDb([new Date()]),
        note: '',
        amount: '',
        company:''
    });

    interface confirmData {
        reference:string
        bankName:string
        amount:string
        bankAccount:string
        receiverName:string
    }
    const [confirmData, setConfirmData] =  useState<confirmData | any>({})
    const SubmittedForm = Yup.object().shape({
       
        id_shop: Yup.string().required('กรุณาเลือกข้อมูล'),
        id_shop_bank: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
        amount: Yup.string()
            .required('กรุณาใส่ข้อมูลให้ครบ')
            .max(15, 'จำนวนไม่ควรเกิน 15 ตัวอักษร')
            .matches(/^\d{1,13}(\.\d{1,2})?$/, 'รูปแบบจำนวนเงินไม่ถูกต้อง (ทศนิยมไม่เกิน 2 ตำแหน่ง)')
            .test('is-greater-than-zero', 'จำนวนต้องมากกว่า 0', (value) => {
            const num = parseFloat(value || '');
            return !isNaN(num) && num > 0;
        }),
    });


    const { mutate: fetchShopFindOne } =useGlobalMutation(url_api.shopFind, {
        onSuccess: (res:any) => {
            if(res?.data?.shop_banks) {
                setShopBanks(
                   res?.data?.shop_banks.map((item: any) => ({
                        value: item.id,
                        label: `${item?.bank?.name} - ${item?.bank_account_number} (${item?.bank_account_name})` ,
                        type: item.id != 19  ? 'bank' : item?.bank_account_number?.length == 13 ? 'pp_cardid' : 'pp_phone'
                    }))
                )
            }
        },
        onError: () => {
            console.error('Failed to fetch data comission');
        },
    });

    const { mutate: fetchShopData } = useGlobalMutation(url_api.shopFindAll, {
        onSuccess: (res: any) => {
          setShopLists(
            res.data.list.map((item: any) => ({
              value: item.id,
              label: item.name,
            }))
          )
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });

    useEffect(() => {
        fetchShopData({})
    },[])

    const { mutate: bblValidate ,isLoading:isLoadingValidate } = useGlobalMutation(url_api.bblValidate, {
        onSuccess: (res: any) => {
           if (res.statusCode === 200 || res.code === 200) {
                // toast.fire({
                //     icon: 'success',
                //     title: 'สำเร็จ',
                //     padding: '10px 20px',
                // });
                setModalPin(false);
                setConfirmData(res?.data)
                setActionModal(true)
            } else {
              setModalPin(false);
                toast.fire({
                    icon: 'error',
                    title: res.message,
                    padding: '10px 20px',
                });
            }
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });


    const { mutate: bblConfirm ,isLoading:isLoadingConfirm } = useGlobalMutation(url_api.bblConfirm, {
        onSuccess: (res: any) => {
           if (res.statusCode === 200 || res.code === 200) {
                
                setActionModal(false)
                Swal.fire({
                    icon: 'success',
                    title: 'ชำระเงินสำเร็จ',
                    padding: '10px 20px',
                    confirmButtonColor: themeInit.color.themePrimary,
                    confirmButtonText: 'ยืนยัน',
                 }).then((result) => {
                    if (result.isConfirmed) {
                       navigate('/apps/finance/transfer-history');
                    }
                });
            } else {
                setActionModal(false)
                Swal.fire({
                    icon: 'error',
                    title: "เกิดข้อผิดพลาด",
                    text: res.message,
                    padding: '10px 20px',
                    confirmButtonColor: themeInit.color.themePrimary,
                    confirmButtonText: 'ยืนยัน',
                }).then((result) => {
                    if (result.isConfirmed) {
                      window.location.reload();
                    }
                });
               
            }
        },
        onError: () => {
            console.error('Failed to fetch asset type data');
        },
    });
    interface validateBBL {
        id_shop:string
        id_shop_bank:string
        note:string
        amount: number;
        additionalRef: string;
        company:string
    }

    const submitForm = useCallback(
        (values: any) => {
            setModalPin(true)
            const data:validateBBL = {
                id_shop:values?.id_shop,
                note:values?.note,
                id_shop_bank:values?.id_shop_bank,
                amount:+values?.amount,
                additionalRef:values.additionalRef,
                company:values.company
            }
            setDataTransfer(data)
        },
        []
    )
    return (
        <>
            <Breadcrumbs items={breadcrumbItems} />
            {(isLoadingValidate || isLoadingConfirm) && <PreLoading />}
            {modalPin  && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="relative bg-white p-6 rounded-lg shadow-lg text-center">
                  {/* ปุ่มกากบาทปิด */}
                  <button
                    onClick={() => setModalPin(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
                  >
                    &times;
                  </button>

                  <h2 className="text-xl font-semibold mb-4">Enter PIN Code</h2>

                  <PinField
                    ref={pinRef}
                    length={6}
                    onChange={(value) => {
                      const filtered = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    }}
                    onComplete={(value) => {
                        // bblValidate({data:{...dataTransfer,pin:value}})
                      setModalPin(false);
                         setTimeout(() => {
                            setPinValue(value)
                            bblValidate({data:{...dataTransfer,pin:value}})
                         }, 1000);
                     
                    }}
                    inputMode="text"
                    autoFocus
                    className="w-12 h-14 mx-1 text-2xl text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>
            )}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b] mt-3 px-10">
                <h5 className="my-3 text-2xl font-semibold ltr:sm:text-left rtl:sm:text-right text-center flex flex-row justify-between">โอนเงิน</h5>
                <Formik initialValues={defaultForm} onSubmit={submitForm} validationSchema={SubmittedForm} enableReinitialize>
                   {(props) => (
                        
                        <Form className="flex flex-col gap-4">
                          <div className="flex gap-4">
                            <SelectField
                                  label="โอนจากบัญชี"
                                  id="company"
                                  name="company"
                                  options={companyList}
                                  placeholder="กรุณาเลือก"
                                  isSearchable={true}
                                  require={true}
                                  onChange={(e: any) => {
                                      props.setFieldValue('company', e.value);
                                  }}
                              />
                          </div>
                            <div className="flex gap-4">
                                <InputField name="userChanged" label="ผู้ดำเนินการ" disabled={true} />
                                <InputField name="created_at" label="วันที่สร้าง" disabled={true} />
                            </div>
                            <hr />
                            <div className="flex gap-4">
                               
                                <InputField name="additionalRef" label="เลขที่ชำระเงิน" />

                                <SelectField
                                    label="ร้านค้า"
                                    id="id_shop"
                                    name="id_shop"
                                    options={shopLists}
                                    placeholder="กรุณาเลือก"
                                    isSearchable={true}
                                    require={true}
                                    onChange={(e: any) => {
                                        fetchShopFindOne({data:{},id:e.value})
                                        props.setFieldValue('id_shop', e.value);
                                    }}
                                />
                            </div>
                            <div className="flex gap-4">

                                <SelectField
                                    label="บัญชีธนาคาร"
                                    id="id_shop_bank"
                                    name="id_shop_bank"
                                    require={true}
                                    options={shopBanks}
                                    placeholder="กรุณาเลือก"
                                    isSearchable={true}
                                />

                                <InputField
                                    require={true}
                                    name="amount"
                                    label="ยอดชำระเงิน"
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
                                        if (e.target.value.includes('.')) {
                                            let [interPart, demical] = e.target.value.split('.');
                                            if (demical.length > 2) {
                                                demical = demical.slice(0, 2);
                                            }
                                            props.setFieldValue('amount', interPart + '.' + demical);
                                        } else {
                                            props.setFieldValue('amount', e.target.value);
                                        }
                                    }}
                                />
                             
                            </div>

                            <div className="flex gap-4">
                                <div className="w-full">
                                    <InputField
                                        label="บันทึกช่วยจำ"
                                        name="note"
                                        as="textarea"
                                        rows="5"
                                        className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                                        default-value="-"
                                    />
                                </div>
                              
                            </div>       
                           
                            <div className="flex gap-4 justify-center">
                                <NavLink to={`/apps/finance/transfer-history`} className="px-4 py-2 rounded-md border border-black/50 text-black">
                                    ยกเลิก
                                </NavLink>
                                <button type="submit" className="px-4 py-2 rounded-md bg-themePrimary text-white ">
                                    ตรวจสอบข้อมูล
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
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
                          <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px] text-center">ตรวจสอบข้อมูล</div>
                          <div className="p-5">
                            
                            <div className="p-5">
                              <div className="mb-5 space-y-1">
                                
                                <div className="flex items-center justify-between">
                                  <p className="text-[#515365] font-semibold">ธนาคาร </p>
                                  <p className="text-base">
                                    <span className="font-semibold">{confirmData?.bankName ?? 0}</span>
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-[#515365] font-semibold">ชื่อผู้รับ</p>
                                  <p className="text-base">
                                    <span className="font-semibold">{confirmData?.receiverName ?? 0}</span>
                                  </p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <p className="text-[#515365] font-semibold">หมายเลขบัญชี</p>
                                  <p className="text-base">
                                    <span className="font-semibold">{confirmData?.bankAccount ?? 0}</span>
                                  </p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <p className="text-[#515365] font-semibold">จำนวนเงิน </p>
                                  <span className="font-semibold ">{confirmData?.amount ?? 0} บาท</span>
                                </div>

                              </div>
                              <div className="text-center px-2 flex justify-around">

                                <button type="button" className="btn btn-success" onClick={() => {
                                  bblConfirm({data:{reference:confirmData?.reference,pin:pinValue}})
                                }}>
                                  ยืนยันการโอนเงิน
                                </button>
                              </div>
                            </div>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition>
        </>
    );
};

export default AddTransfer;
