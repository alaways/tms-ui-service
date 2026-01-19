import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useCallback, Fragment } from 'react'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { url_api } from '../../../services/endpoints'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { toastAlert } from '../../../helpers/constant'
import { useBusinessUnitFindMutation } from '../../../services/mutations/useBusinessUnitMutation'
import { Form, Formik } from 'formik'
import { Tab } from '@headlessui/react'
import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import themeInit from '../../../theme.init'
import AutoNotificationSettings from './LineSetting/AutoNotificationSettings'
import PaymentNotificationSettings from './LineSetting/PaymentNotificationSettings'
import LineSystemSettings from './LineSetting/LineSystemSettings'
import PaymentGatewaySettings from './PaymentSetting/PaymentGatewaySettings'
import BankAccountSettings from './BankAccount/BankAccountSettings'
import LockDeviceSettings from './LockDevice/LockDeviceSettings'
import SettingToc from './TOC/SettingToc'

const defaultForm = {
  id_business_unit: '',
  id_shop_group: '',
  id_interest_rate: '',
  commission: '',
  commission_type:1,
  signature_online:false,
  signature_online_type:'',
  benefit: '',
  penalty_fee: '',
  fee: '',
  tracking_fee: '',
  unlock_fee: '',
  condition_contract: '',
  flow_account_token: '',
  paysolution_key: '',
  paysolution_mercantid: '',
  prefix_contract: '',
  paysolution_secret_key: '',
  paysolution_token: '',
  payment_late_period: '',
  payment_late_period_lvl_1:'',
  payment_late_period_lvl_2:'',
  payment_late_period_lvl_3:'',
  //payment_late_period_lvl_4:'', // ไม่ใช้งาน lvl4
  payment_late_period_lvl_5:'',
  locked_period: '',
  ln_pre_due_day: '',
  ln_after_due_day: '',
  ln_enabled: '',
  ln_pre_due_day_txt: '',
  ln_due_day_txt: '',
  ln_after_due_day_txt: '',
  ln_late_day_txt: '',
  ln_time_notify: '',
}

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const BuInfomation = () => {

  const { id } = useParams()

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const storedUser = localStorage.getItem(mode)
  const user = storedUser ? JSON.parse(storedUser) : null
 
  const role = user ? user?.role : null
  let id_bu = Number(id)
  if(role == "business_unit") {
    id_bu = user?.id_business_unit
  }
  const [shopFormData, setShopFormData] = useState<any>(defaultForm)

  const { mutate: fetchBusinessUnitFindData, isLoading: isBusinessUnitFindLoading } = useBusinessUnitFindMutation({
    onSuccess: (res) => {
      const setFormValue = res.data
      setShopFormData({
        ...shopFormData,
        commission: setFormValue?.commission || 0,
        commission_type: setFormValue?.commission_type|| 0,
        benefit: setFormValue?.benefit || 0,
        penalty_fee: setFormValue?.penalty_fee || 0,
        penalty_fee_limit: setFormValue?.penalty_fee_limit || 0,
        fee: setFormValue?.fee || 0,
        tracking_fee: setFormValue?.tracking_fee || 0,
        unlock_fee: setFormValue?.unlock_fee || 0,
        condition_contract: setFormValue?.condition_contract || '',
        flow_account_token: setFormValue?.flow_account_token || '',
        paysolution_key: setFormValue?.paysolution_key || '',
        paysolution_mercantid: setFormValue?.paysolution_mercantid || '',
        prefix_contract: setFormValue?.prefix_contract || '',
        paysolution_secret_key: setFormValue?.paysolution_secret_key || '',
        paysolution_token: setFormValue?.paysolution_token || '',
        flowaccount_client_id: setFormValue?.flowaccount_client_id || '',
        flowaccount_client_secret: setFormValue?.flowaccount_client_secret || '',
        pdf_watermark: setFormValue?.pdf_watermark || '',
        hide_content_days:setFormValue?.hide_content_days || 0,
        is_opened: setFormValue?.is_opened || false,
        payment_late_period: setFormValue?.payment_late_period || 0,
        payment_late_period_lvl_1: setFormValue?.payment_late_period_lvl_1 || '',
        payment_late_period_lvl_2: setFormValue?.payment_late_period_lvl_2 || '',
        payment_late_period_lvl_3: setFormValue?.payment_late_period_lvl_3 || '',
        //payment_late_period_lvl_4: setFormValue?.payment_late_period_lvl_4 || '',
        payment_late_period_lvl_5: setFormValue?.payment_late_period_lvl_5 || '',
        locked_period: setFormValue?.locked_period || 0,
        line_qa_id: setFormValue.line_qa_id || '',
        line_group_uuid: setFormValue.line_group_uuid || '',
        ln_pre_due_day: setFormValue.ln_pre_due_day || 0,
        ln_after_due_day: setFormValue.ln_after_due_day || 0,
        ln_enabled: setFormValue.ln_enabled || false,
        ln_pre_due_day_txt: setFormValue.ln_pre_due_day_txt || '',
        ln_due_day_txt: setFormValue.ln_due_day_txt || '',
        ln_after_due_day_txt: setFormValue.ln_after_due_day_txt || '',
        ln_late_day_txt: setFormValue.ln_late_day_txt || '',
        ln_time_notify: setFormValue.ln_time_notify || '',

        tqr_biller_id:setFormValue.tqr_biller_id,
        tqr_merchant_name:setFormValue.tqr_merchant_name,
        // tqr_user:setFormValue.tqr_user,
        // tqr_password:setFormValue.tqr_password,
        // tqr_customer_key:setFormValue.tqr_customer_key,
        // tqr_customer_secret:setFormValue.tqr_customer_secret,
        tqr_company_name:setFormValue.tqr_company_name,
        tqr_company_name_en:setFormValue.tqr_company_name_en,
        payment_qr_method:setFormValue.payment_qr_method,
        pdf_contract_templete:setFormValue?.pdf_contract_templete,

        cbd_condition:setFormValue?.cbd_condition,
        cbd_discount_1:setFormValue?.cbd_discount_1,
        cbd_discount_2:setFormValue?.cbd_discount_2,
        cbd_discount_3:setFormValue?.cbd_discount_3,

        is_login:setFormValue?.is_login,
        signature_online:setFormValue?.signature_online,
        signature_online_type: setFormValue?.signature_online_type,
        is_asset_commission: setFormValue?.is_asset_commission,
        line_token: setFormValue?.line_token,
        line_secret: setFormValue?.line_secret
      })
    },
    onError: () => { },
  })

  const { mutate: buUpdateConfig } = useGlobalMutation(url_api.buUpdateConfig, {
     onSuccess: (res:any) => {
       if (res.statusCode !== 400) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        });
        location.reload()
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        });
      }
    },
    onError: (err:any) => {
      const toast = Swal.mixin(toastAlert)
      toast.fire({
        icon: 'error',
        title: err.message,
        padding: '10px 20px',
      })
    },
  })




  const SubmittedForm1 = Yup.object().shape({
    commission: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'Commission ต้องอยู่ระหว่าง 0 ถึง 100').max(100, 'Commission ต้องอยู่ระหว่าง 0 ถึง 100'),
    benefit: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าผลตอบแทน ต้องมากกว่า 0'),
    penalty_fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าดำเนินการล่าช้า ต้องมากกว่า 0'),
    fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าธรรมเนียม ต้องมากกว่า 0'),
    tracking_fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าธรรมเนียมการติดตาม ต้องมากกว่า 0'),
    unlock_fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าธรรมเนียมปลดล็อค 0'),
    condition_contract: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    payment_late_period_lvl_1: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    payment_late_period_lvl_2: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    payment_late_period_lvl_3: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    //payment_late_period_lvl_4: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    payment_late_period_lvl_5: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const SubmittedAdv = Yup.object().shape({
      hide_content_days: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ต้องมากกว่า 0'),
      cbd_condition: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(4, 'ต้องมากกว่า 3'),
      cbd_discount_1: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ต้องมากกว่าหรือเท่ากับ 0'),
      cbd_discount_2: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ต้องมากกว่าหรือเท่ากับ 0'),
      cbd_discount_3: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ต้องมากกว่าหรือเท่ากับ 0'), 
   }
)



  const submitForm = useCallback(
    (values: any) => {
      const data = {
        ...values,
        is_active: true,
      }
      buUpdateConfig({ data: { ...data},id: id_bu  })
    },
    [buUpdateConfig]
  )

  const breadcrumbItems = [
    { to: '/apps/business-unit/list', label: 'หน่วยธุรกิจ' },
    { to: '/apps/business-unit/preview/' + id, label: 'ข้อมูลหน่วยธุรกิจ' },
    { label: 'การตั้งค่าหน่วยธุรกิจ', isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle('การตั้งค่าหน่วยธุรกิจ'))
    dispatch(setSidebarActive(['bu', '/apps/business-unit/list']))
    if (mode !== 'admin' && mode !== 'business_unit') {
      navigate('/')
    }
  }, [dispatch])

  useEffect(() => {
    fetchBusinessUnitFindData({data: { id: id_bu}})
  }, [fetchBusinessUnitFindData])

  if (isBusinessUnitFindLoading) return <div>Loading...</div>

  return (
    <div className="pt-1">
      <Breadcrumbs items={breadcrumbItems} />
      <div>
        <Tab.Group>
          <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a] bg-white">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button  className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่า
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button  className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่าขั้นสูง
                </button>
              )}
            </Tab>

            <Tab as={Fragment}>
              {({ selected }) => (
                <button  className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  บัญชีธนาคาร
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button  className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่าการชำระเงิน
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button  className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่าล็อคเครื่อง
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button  className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่าไลน์
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่า TOC
                </button>
              )}
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <Formik initialValues={shopFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm1}>
                {() => (
                  <Form className="space-y-5 dark:text-white">
                    <div className="panel">
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่าจัดการร้านค้า
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mt-3">
                        <InputField
                          require={true}
                          required={true}
                          label="Prefix Contract Reference"
                          name="prefix_contract"
                          maxLength={3}
                          disabled={mode === 'business_unit'}
                        />

                        <InputField
                          label="ค่าตอบแทนพิเศษร้านค้า (บาท)"
                          name="benefit"
                          type="number"
                          min="0"
                        />

                      </div>
                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="Commission (%)"
                          name="commission"
                          type="number"
                          min="0"
                        />
                        {themeInit.features?.commission_type && (
                          <SelectField
                            label="รูปแบบการคำนวน Commission"
                            id="commission_type"
                            name="commission_type"
                            placeholder="กรุณาเลือก"
                            options={[
                            {
                              value: 1,
                              label: 'ราคาขาย-เงินดาวน์ x Commission'
                            },
                            {
                              value: 2,
                              label: 'ราคาขาย x Commission'
                            },
                          ]} />
                        )}
                        

                      </div>
                      <br />
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่าสัญญา
                      </div>
                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="ค่าดำเนินการล่าช้า (บาท)"
                          name="penalty_fee"
                          type="number"
                          min="0"
                        />
                        <InputField
                          require={true}
                          label="ค่าดำเนินการล่าช้าไม่เกิน (บาท/ครั้ง)"
                          name="penalty_fee_limit"
                          type="number"
                          min="0"
                        />
                      </div>

                      <div className="input-flex-row">
                       
                        <InputField
                          require={true}
                          label="ค่าธรรมเนียมทำสัญญา (บาท)"
                          name="fee"
                          type="number"
                          min="0"
                        />

                        <InputField
                          require={true}
                          label="ค่าธรรมเนียมการติดตาม (บาท)"
                          name="tracking_fee"
                          type="number"
                          min="0"
                        />
                      </div>

                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="ค่าธรรมเนียมปลดล็อค (บาท)"
                          name="unlock_fee"
                          type="number"
                          min="0"
                        />
                        <SelectField
                          label="รูปแบบการลงนามสัญญา"
                          id="signature_online_type"
                          name="signature_online_type"
                          placeholder="กรุณาเลือก"
                          options={[
                          {
                            value: 1,
                            label: 'ลงนามสัญญาออนไลน์'
                          },
                          {
                            value: 2,
                            label: 'ลงนามสัญญา EKYC'
                          },
                          {
                            value: 3,
                            label: 'ลงนามสัญญาออนไลน์ + EKYC'
                          }
                        ]} />
                      </div>
                      <div className="input-flex-row">
                        <SelectField
                          label="Comission สินทรัพย์จากหน่วยธุรกิจ"
                          id="is_asset_commission"
                          name="is_asset_commission"
                          placeholder="กรุณาเลือก"
                          options={[
                          {
                            value: true,
                            label: 'เปิด'
                          },
                          {
                            value: false,
                            label: 'ปิด'
                          }
                        ]} />
                        <div className="flex-1"></div>
                      </div>
                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="เงื่อนไขการผ่อนสินค้า"
                          name="condition_contract"
                          as="textarea"
                          rows="10"
                        />
                      </div>
                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="จำนวนวันค้างชำระไม่เกิน(ไม่มีค่าดำเนินการล่าช้า)"
                          name="payment_late_period"
                          type="number"
                          min="0"
                          disabled={true}
                          
                        />
                      </div>

                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="ระยะเวลาจ่ายเงินล่าช้า ระยะ 1"
                          name="payment_late_period_lvl_1"
                          type="text"
                          disabled={true}
                        />

                         <InputField
                          require={true}
                          label="ระยะเวลาจ่ายเงินล่าช้า ระยะ 2"
                          name="payment_late_period_lvl_2"
                          type="text"
                          disabled={true}
                        />
                      </div>


                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="ระยะเวลาจ่ายเงินล่าช้า ระยะ 3"
                          name="payment_late_period_lvl_3"
                          type="text"
                          disabled={true}
                        />

                         <InputField
                            require={true}
                            label="สถานะผิดนัดชำระ ระดับ4/หนี้เสีย (NPL)"
                            name="payment_late_period_lvl_5"
                            type="text"
                            disabled={true}
                          />

                         {/* <InputField
                          require={true}
                          label="ระยะเวลาจ่ายเงินล่าช้า ระยะ 4"
                          name="payment_late_period_lvl_4"
                          type="text"
                        /> */}
                      </div>


                      <div className="input-flex-row">
                      

                        <InputField
                          require={false}
                          label="ระยะเวลาล็อคเครื่อง"
                          name="locked_period"
                          type="number"
                          min="0"
                        />

                      </div>

                      <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                        บันทึก
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Tab.Panel>
            <Tab.Panel>
              <Formik initialValues={shopFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedAdv}>
                {() => (
                  <Form className="space-y-5 dark:text-white">
                    <div className="panel flex flex-col gap-4">
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่าสัญญา
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <SelectField
                          label="การสร้างสัญญา"
                          id="is_opened"
                          name="is_opened"
                          placeholder="กรุณาเลือก"
                          options={[{
                            value: true,
                            label: 'เปิด'
                          },
                          {
                            value: false,
                            label: 'ปิด'
                          }]}
                        />


                        <InputField
                          label="ซ่อนสัญญาหลังอนุมัติ (x) วัน"
                          name="hide_content_days"
                          type="number"
                          min="0"
                        />
                        
                      </div>
                      

                      <div className="flex flex-col sm:flex-row gap-4">

                         <SelectField
                          label="รูปแบบสัญญา (PDF)"
                          id="pdf_contract_templete"
                          name="pdf_contract_templete"
                          placeholder="กรุณาเลือก"
                          options={[
                          {
                            value: 'default',
                            label: 'รูปแบบที่ 1'
                          },
                          {
                            value: 'pango',
                            label: 'รูปแบบที่ 2'
                          },
                          {
                            value: 'default_receipt',
                            label: 'รูปแบบที่ 3'
                          },
                        ]}
                        />


                        <InputField
                          required={false}
                          label="ลายน้ำ PDF"
                          name="pdf_watermark"
                          disabled={mode === 'business_unit'}
                        />

                       
                      </div>

                      {mode === 'admin' && (
                        <>
                          <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                            ตั้งค่าระบบ
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <SelectField
                              label="ระบบล็อคอิน"
                              id="is_login"
                              name="is_login"
                              placeholder="กรุณาเลือก"
                              options={[
                              {
                                value: true,
                                label: 'เปิดการใช้งาน'
                              },
                              {
                                value: false,
                                label: 'ปิดการใช้งาน'
                              },
                            ]}
                            />
                          </div>
                        </>
                      )}

                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่าการชำระเงิน
                      </div>

                        <div className="flex flex-col sm:flex-row gap-4">
             
                        
                        <SelectField
                          label="การชำระเงิน QR CODE"
                          id="payment_qr_method"
                          name="payment_qr_method"
                          placeholder="กรุณาเลือก"
                          options={[
                          {
                            value: 'disabled',
                            label: 'ปิดการใช้งาน'
                          },
                          {
                            value: 'ps',
                            label: 'Pay Solution'
                          },
                           ...(themeInit.paymentGateway.tqr
                              ? [{ value: 'tqr', label: 'Thai QR' }]
                              : []
                          ),
                        ]}
                        />
                      </div>
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่า Flowaccount
                      </div>


                      <div className="flex flex-col sm:flex-row gap-4">
                        <InputField
                          required={false}
                          label="Flow Account Client Id"
                          name="flowaccount_client_id"
                          disabled={mode === 'business_unit'}
                        />
                        <InputField
                          required={false}
                          label="Flow Account Client Secert"
                          name="flowaccount_client_secret"
                          disabled={mode === 'business_unit'}
                        />
                      </div>
                      {/* {themeInit.features?.customer_close_contract && ( */}
                        <>
                          <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                            ตั้งค่าส่วนลดปิดสัญญา
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <InputField
                              required={false}
                              label="เงื่อนไขการปิดสัญญา (เดือน)"
                              name="cbd_condition"
                              type="number"
                            />
                            <InputField
                              required={false}
                              label="ส่วนลดเมื่อปิดสัญญาเดือนที่ 1 (%)"
                              name="cbd_discount_1"
                              type="number"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <InputField
                              required={false}
                              label="ส่วนลดเมื่อปิดสัญญาเดือนที่ 2 (%)"
                              name="cbd_discount_2"
                              type="number"
                            />
                            <InputField
                              required={false}
                              label="ส่วนลดเมื่อปิดสัญญาเดือนที่ 3 เป็นต้นไป (%) (ยกเว้นเดือนสุดท้าย)"
                              name="cbd_discount_3"
                              type="number"
                            />
                          </div>
                        </>
                      {/* )} */}
                     

                     
                      <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                        บันทึก
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Tab.Panel>

            <Tab.Panel>
              <BankAccountSettings id_bu={id_bu} />
            </Tab.Panel>

            <Tab.Panel>
              <PaymentGatewaySettings id_bu={id_bu} />
            </Tab.Panel>
            <Tab.Panel>
              <LockDeviceSettings id_bu={id_bu} />
            </Tab.Panel>
            <Tab.Panel>
              <div className="panel">
                <Tab.Group>
                  <Tab.List className="flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                    <Tab as={Fragment}>
                      {({ selected }) => (
                        <button className={`${selected ? `!border-white-light !border-b-white text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                          ตั้งค่าระบบ
                        </button>
                      )}
                    </Tab>
                    <Tab as={Fragment}>
                      {({ selected }) => (
                        <button className={`${selected ? `!border-white-light !border-b-white text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                          ตั้งค่าการแจ้งเตือนการชำระเงิน
                        </button>
                      )}
                    </Tab>
                    <Tab as={Fragment}>
                      {({ selected }) => (
                        <button className={`${selected ? `!border-white-light !border-b-white text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                          ตั้งค่าการแจ้งเตือนอัตโนมัติ
                        </button>
                      )}
                    </Tab>
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel>
                      <LineSystemSettings id_bu={id_bu} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <PaymentNotificationSettings id_bu={id_bu} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <AutoNotificationSettings id_bu={id_bu} />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <SettingToc />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}

export default BuInfomation