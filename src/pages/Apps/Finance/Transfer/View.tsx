import { useState, useEffect, useRef} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setPageTitle, setSidebarActive } from '../../../../store/themeConfigSlice';
import { Form, Formik } from 'formik';
import InputField from '../../../../components/HOC/InputField';
import Breadcrumbs from '../../../../helpers/breadcrumbs';
import { useGlobalMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';
import { convertDateTimeDbToClient } from '../../../../helpers/formatDate';
import PreLoading from '../../../../helpers/preLoading';
import themeInit from '../../../../theme.init';
import Swal from 'sweetalert2';
import PinField from "react-pin-field";
import { toastAlert } from '../../../../helpers/constant';
const mode = process.env.MODE || 'admin'
const View = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [pinValue, setPinValue] = useState<any>('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = Swal.mixin(toastAlert);
  const [modalPin, setModalPin] = useState<boolean>(false);
  const pinRef = useRef<HTMLInputElement[] | null>(null);
  const [dataTransfer, setDataTransfer] = useState<any>([])
  useEffect(() => {
    dispatch(setPageTitle(t('finance_transfer_view_title')));
  }, [dispatch, t]);
  const storedUser = localStorage.getItem(mode);
  const role = storedUser ? JSON.parse(storedUser).role : null;
  const [formData, setFormData] = useState<any>({
    company:'',
    transfer_name:'',
    created_at:'',

    shop_phone:'',
    shop_name:'',
    receiverName:'',
    receiverValue:'',
    bank_name:'',
    amount:'',
    receiverValueType:'',
    status:'',
    payed_at:'',
    note:'',
    reference:'',
    uuid:'',
    v_expired:'',
    can_pay:false,
    p_reference:''
  });

  const breadcrumbItems = [
    { to: '/apps/finance/transfer-history', label: t('finance_transfer_view_breadcrumb_history') },
    { label: t('finance_transfer_view_breadcrumb_info'), isCurrent: true },
  ];

  if(mode != 'admin') {
    navigate('/apps/login')
  }

  const { mutate: fetchData,isLoading } = useGlobalMutation(url_api.bblFindOne+'/'+id, {
      onSuccess: (res: any) => {
          setFormData({
              ...res?.data,
              status_text: res?.data?.status === 'complete' ? t('finance_transfer_view_status_success') : res?.data?.status === 'pending' ? t('finance_transfer_view_status_pending') : t('finance_transfer_view_status_failed'),
              amount:res?.data?.amount?.toFixed(2),
              payed_at: res?.data?.payed_at ? convertDateTimeDbToClient(res?.data?.payed_at) : '',
              created_at: res?.data?.payed_at ? convertDateTimeDbToClient(res?.data?.created_at) : ''
          })
      },
      onError: () => {
          console.error('Failed to fetch bu data');
      },
  });

  const { mutate: bblConfirm ,isLoading:isLoadingConfirm } = useGlobalMutation(url_api.bblConfirm, {
      onSuccess: (res: any) => {
          if (res.statusCode === 200 || res.code === 200) {

              Swal.fire({
                  icon: 'success',
                  title: t('finance_transfer_view_payment_success_title'),
                  padding: '10px 20px',
                  confirmButtonColor: themeInit.color.themePrimary,
                  confirmButtonText: t('finance_transfer_view_confirm_button'),
                }).then((result) => {
                  if (result.isConfirmed) {
                      navigate('/apps/finance/transfer-history');
                  }
              });
          } else {
            toast.fire({
                    icon: 'error',
                    title: res.message,
                    padding: '10px 20px',
                });
              // Swal.fire({
              //     icon: 'error',
              //     title: "เกิดข้อผิดพลาด",
              //     text: res.message,
              //     padding: '10px 20px',
              //     confirmButtonColor: themeInit.color.themePrimary,
              //     confirmButtonText: 'ยืนยัน',
              // }).then((result) => {
              //     if (result.isConfirmed) {
              //       window.location.reload();
              //     }
              // });

          }
      },
      onError: () => {
          console.error('Failed to fetch asset type data');
      },
  });
  useEffect(() => {
    fetchData({})
  }, []);


  return (
    <div className="flex flex-col gap-2.5">
      {(isLoading || isLoadingConfirm) && <PreLoading />}
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

              <h2 className="text-xl font-semibold mb-4">{t('finance_transfer_view_pin_title')}</h2>

              <PinField
                ref={pinRef}
                length={6}
                onChange={(value) => {
                  const filtered = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                }}
                onComplete={(value) => {
                    setModalPin(false);
                    setTimeout(() => {
                      setPinValue(value)
                      bblConfirm({data:{...dataTransfer,pin:value}})
                    }, 1000);

                }}
                inputMode="text"
                autoFocus
                className="w-12 h-14 mx-1 text-2xl text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>
          </div>
        )}
      <div className="flex items-center justify-between flex-wrap">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <div className="panel px-6 flex-1 py-6">
        <Formik initialValues={formData} onSubmit={()=>{}} enableReinitialize autoComplete="off" validationSchema={{}}>
          {(props) => (
            <Form className="space-y-5 dark:text-white custom-select">
                <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">{t('finance_transfer_view_payer_info')}</div>
                 <div className="flex gap-4">
                    <InputField name="p_reference" label="transactionID" disabled={true} />
                    <InputField name="created_at" label={t('finance_transfer_view_transaction_date')} disabled={true} />
                </div>
                <div className="flex gap-4">
                    <InputField name="company" label="Company" disabled={true} />
                    <InputField name="transfer_name" label={t('finance_transfer_view_payer_name')} disabled={true} />
                </div>

                <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">{t('finance_transfer_view_receiver_info')}</div>
                <div className="flex gap-4">
                    <InputField name="shop_phone" label={t('finance_transfer_view_phone')} disabled={true} />
                    <InputField name="shop_name" label={t('finance_transfer_view_shop_name')} disabled={true} />
                </div>
                <div className="flex gap-4">
                    <InputField name="receiverValueType" label={t('finance_transfer_view_transfer_type')} disabled={true} />
                    <InputField name="bank_name" label={t('finance_transfer_view_bank_name')} disabled={true} />
                </div>
                <div className="flex gap-4">
                    <InputField name="receiverName" label={t('finance_transfer_view_account_name')} disabled={true} />
                    <InputField name="receiverValue" label={t('finance_transfer_view_account_number')} disabled={true} />
                </div>
                <div className="flex gap-4">
                    <InputField name="amount" label={t('finance_transfer_view_amount')} disabled={true} />
                    <InputField name="status_text" label={t('finance_transfer_view_status')} disabled={true} />
                </div>

                <div className="flex gap-4">
                    <InputField name="payed_at" label={t('finance_transfer_view_received_date')} disabled={true} />
                    <InputField name="reference" label={t('finance_transfer_view_reference')} disabled={true} />
                </div>

                <div className="flex gap-4">
                    <div className="w-full">
                        <InputField
                            label={t('finance_transfer_view_note')}
                            name="note"
                            as="textarea"
                            rows="5"
                            className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                            default-value="-"
                            disabled={true}
                        />
                    </div>

                </div>

                {formData.status === 'pending' && (
                  <div className="text-center px-2 flex justify-around ">
                    <p className="font-bold text-red-500 mr-2">{t('finance_transfer_view_pay_by_time')} <span>{convertDateTimeDbToClient(formData.v_expired)}</span> </p>
                  </div>
                )}

                <div className="text-center px-2 flex justify-around">
                {formData.status == 'pending' && (
                  <>
                    {formData.can_pay ? (
                        <button type="button" className="btn btn-success" onClick={() => {
                            setModalPin(true)
                            setDataTransfer({reference:formData?.p_reference})
                          }}>
                            {t('finance_transfer_view_transfer_button')}
                          </button>
                      ): (
                        <button type="button" className="btn btn-info" disabled>
                          {t('finance_transfer_view_expired_button')}
                        </button>
                      )}

                  </>
                )}
              </div>

            </Form>
          )}
        </Formik>

      </div>
    </div>
  );

};

export default View;
