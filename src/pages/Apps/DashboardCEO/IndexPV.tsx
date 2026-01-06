import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import themeInit from '../../../theme.init';
import { useDispatch } from 'react-redux';
import { useBusinessUnitFindAllMutation, useBusinessUnitFindMutation } from '../../../services/mutations/useBusinessUnitMutation';
import { Formik, Form } from 'formik';
import DatePicker from '../../../components/HOC/DatePicker';
import moment from 'moment-timezone';
import SelectField from '../../../components/HOC/SelectField';
import IconDollarSignCircle from '../../../components/Icon/IconDollarSignCircle';
import IconCashBanknotes from '../../../components/Icon/IconCashBanknotes';
import { useGlobalMutation } from '../../../helpers/globalApi';
import PreLoading from '../../../helpers/preLoading';
import { url_api } from '../../../services/endpoints';
import { numberWithCommas, numberCommas } from '../../../helpers/formatNumeric'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { toastAlert } from '../../../helpers/constant'
import Swal from 'sweetalert2'
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const mode = process.env.MODE || 'admin'

const DashboardCEOPV = () => {
  const toast = Swal.mixin(toastAlert)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const storedUser = localStorage.getItem(mode)

  const user = storedUser ? JSON.parse(storedUser) : null
  const role = user ? user.role : null

  if (role != 'admin' && role != 'business_unit') {
    navigate('/')
  }

  useEffect(() => {
    dispatch(setPageTitle('Dashboard CEO'))
  }, [dispatch])

  const [itemBusinessUnit, setBusinessUnitList] = useState<any[]>([])
  const [dashboardCEOData, setDashboardCEOData] = useState<any>({
    amountContract: 0,
    appContractCount: 0,
    bankAmountPayment: 0,
    canContractCount: 0,
    comContractCount: 0,
    paidContract: 0,
    paysAmountPayment: 0,
    r20DueContract: 0,
    r21DueContract: 0,
    r22DueContract: 0,
    rTodayContact: 0,
    recievableContract: 0,
    s10ContractCount: 0,
    s20ContractCount: 0,
    s21ContractCount: 0,
    s22ContractCount: 0,
    total_amount_shop: 0,  //ต้องโอน   จ่ายคืนให้ร้านค้า
    total_payment_com: 0, //จ่ายจริง (45%+คอม)
    total_transfer_down: 0,  //โอนดาวน์
    total_payment_notcom: 0,  // ยอดจ่าย(ไม่รวมคอม)
    total_commission: 0, // ค่าคอม
    total_contract_fee: 0, //ค่่าทำสัญญา
    total_asset: 0, // จำนวนเครื่อง
    total_down_payment: 0, //ยอดดาวน์
    collect_money: 0,  //ยอดเก็บ
    profit_withcom: 0, //กำไร(ยังไม่หักคอม)
    profit_real: 0,  //กำไรจริง
    total_cost_product: 0, // ต้้นทุนสินค้า // ต้องโอน+ยอดดาวน์
  }
  )

  const { mutate: fetchPvDashboard, isLoading: isLoadingPvDashboard } = useGlobalMutation(url_api.pvDashboardCEO, {
    onSuccess: (res: any) => {
      setDashboardCEOData({
        amountContract: res.data?.amountContract,
        appContractCount: res.data?.appContractCount,
        bankAmountPayment: res.data?.bankAmountPayment,
        canContractCount: res.data?.canContractCount,
        comContractCount: res.data?.comContractCount,
        paidContract: res.data?.paidContract,
        paysAmountPayment: res.data?.paysAmountPayment,
        paysAmountPaymentTQR: res.data?.paysAmountPaymentTQR ?? 0,
        r20DueContract: res.data?.r20DueContract,
        r21DueContract: res.data?.r21DueContract,
        r22DueContract: res.data?.r22DueContract,
        rTodayContact: res.data?.rTodayContact,
        recievableContract: res.data?.recievableContract,
        s10ContractCount: res.data?.s10ContractCount,
        s20ContractCount: res.data?.s20ContractCount,
        s21ContractCount: res.data?.s21ContractCount,
        s22ContractCount: res.data?.s22ContractCount,
        total_amount_shop: res.data?.total_amount_shop,
        total_payment_com: res.data?.total_payment_com,
        total_transfer_down: res.data?.total_transfer_down,
        total_payment_notcom: res.data?.total_payment_notcom,
        total_commission: res.data?.total_commission,
        total_contract_fee: res.data?.total_contract_fee,
        total_asset: res.data?.total_asset,
        total_down_payment: res.data?.total_down_payment,
        collect_money: res.data?.collect_money,
        profit_withcom: res.data?.profit_withcom,
        profit_real: res.data?.profit_real,
        total_cost_product: res.data?.total_cost_product
      })
    },
    onError: () => {
      console.error('Failed to fetch dashboard data')
    },
  })


  const { mutate: fetchBusinessUnitData, isLoading: buLoading } = useBusinessUnitFindAllMutation({
    onSuccess: (res: any) => {
      setBusinessUnitList(res.data.list.map((item: any) => ({
        value: item.id,
        label: item.name,
      })))
    },
    onError: () => {
    },
  })

  useEffect(() => {
    if (role === 'admin') {
      fetchBusinessUnitData({
        data: {
          page: 1,
          page_size: 1000,
        },
      })
    } else {
      fetchPvDashboard({
        data: {
          start_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}`,
          end_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}`,
          id_business_unit: [user.id_business_unit]
        }
      })
    }
  }, [])

  return (
    <>
      <div>
        <div className="pt-5">
          <div className="flex flex-wrap ">
            <ul className="flex space-x-2 rtl:space-x-reverse">
              <li>
                <Link to="#" className="hover:underline text-xl">
                  Dashboard CEO PV
                </Link>
              </li>
            </ul>
            <Formik autoComplete="off" initialValues={{
              start_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}`,
              end_at: `${moment.tz(new Date(), 'Asia/Bangkok').format('YYYY-MM-DD')}`,
              id_business_unit: user.id_business_unit ? user.id_business_unit : null
            }}
              onSubmit={(values) => {
                if (values.id_business_unit === null) {
                  toast.fire({
                    icon: 'warning',
                    title: 'กรุณาเลือกหน่วยธุรกิจเพื่อค้นหา',
                    padding: '10px 20px',
                  })
                } else {
                  fetchPvDashboard({
                    // todo
                    data: {
                      start_at: `${moment.tz(values.start_at, 'Asia/Bangkok').format('YYYY-MM-DD')}`,
                      end_at: `${moment.tz(values.end_at, 'Asia/Bangkok').format('YYYY-MM-DD')}`,
                      id_business_unit: role === 'admin' ? values.id_business_unit : [values.id_business_unit]
                    }
                  })
                }

              }} enableReinitialize>
              {() => (
                <Form className="flex flex-wrap gap-4 w-full items-center justify-between">
                  <div className="flex flex-col w-full min-[1141px]:w-[50%] gap-2">
                    {role === 'admin' && (<div className='w-full min-[1141px]:max-w-[634px] pt-6'>
                      <SelectField
                        id='bu'
                        label='หน่วยธุรกิจ'
                        className="z-10"
                        name="id_business_unit"
                        options={itemBusinessUnit}
                        isSearchable={true}
                        isMulti={true}
                        onChange={(e) => {
                        }}
                      />
                    </div>)}

                    <div className="flex flex-col sm:flex-row flex-auto gap-4 sm:items-center ">
                      <div className='flex gap-4 items-center w-full min-[1141px]:w-auto'>
                        <div className='w-[50px]'>วันที่ </div>
                        <DatePicker
                          name="start_at"
                        />
                      </div>
                      <div className='flex gap-4 items-center w-full min-[1141px]:w-auto'>
                        <div className='w-[50px]'>ถึง วันที่ </div>
                        <DatePicker
                          name="end_at"
                        />
                      </div>
                      <div className='flex mt-1 '>
                        <button type="submit" className="btn btn-success gap-2 w-full h-[40px]">
                          อัพเดท
                        </button>
                      </div>

                    </div>
                  </div>


                </Form>
              )}
            </Formik>
          </div>
          {(isLoadingPvDashboard) && <PreLoading />}
          <div className="flex flex-wrap items-start mt-6">
            <div className="flex flex-wrap w-full">
              <h1 className="text-[#f7931a] font-medium text-2xl">
                บัญชีเงินสด
              </h1>
            </div>
            <div className="flex flex-wrap flex-col pt-5 mr-2" style={{ width: themeInit.paymentGateway.tqr ? 'calc(25% - 10px)' : 'calc(50% - 10px)' }}>
              <div className="flex flex-wrap w-full">
                <div className="bg-[#113144] w-8 h-8 rounded-full flex items-center justify-center text-white mr-2">
                  <IconDollarSignCircle className="w-6 h-6" />
                </div>

                <p className="text-lg text-[#113144]">
                  Pay solution
                </p>
                              <Tippy content="เงินรับจาก Payment Gateway Pay solution" placement="right">
                                  <img
                                      src="/assets/images/information.png"
                                      alt="Info"
                                      className="cursor-pointer w-5 h-5 ml-2 mt-1.5"
                                  />
                              </Tippy>
              </div>
              <div className="flex flex-wrap w-full pt-3">
                <div className="w-full border border-[#e0e6ed] rounded-lg">
                  <p className="p-3 pl-5 pr-5 text-3xl text-center text-[#4e9676] mr-2">
                    {numberWithCommas(dashboardCEOData?.paysAmountPayment)} ฿
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap">
              </div>
            </div>
            
            {themeInit.paymentGateway.tqr && (
               <div className="flex flex-wrap flex-col pt-5 "style={{ width: 'calc(25% - 10px)' }}>
                <div className="flex flex-wrap w-full">
                  <div className="bg-[#113144] w-8 h-8 rounded-full flex items-center justify-center text-white mr-2">
                    <IconDollarSignCircle className="w-6 h-6" />
                  </div>
                  <p className="text-lg text-[#113144]">
                    Thai QR
                  </p>
                                <Tippy content="เงินรับจาก Thai QR โดย ธนาคารกรุงเทพ" placement="right">
                                    <img
                                        src="/assets/images/information.png"
                                        alt="Info"
                                        className="cursor-pointer w-5 h-5 ml-2 mt-1.5"
                                    />
                                </Tippy>
                </div>
                <div className="flex flex-wrap w-full pt-3">
                  <div className="w-full border border-[#e0e6ed] rounded-lg">
                    <p className="p-3 pl-5 pr-5 text-3xl text-center text-[#4e9676] mr-2">
                      {numberWithCommas(dashboardCEOData?.paysAmountPaymentTQR)} ฿
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap">
                </div>
              </div>
            )}
           

            <div className="flex flex-wrap flex-col pt-5 pl-5" style={{width:'50%'}}>
              <div className="flex flex-wrap w-full text-[#113144]">
                <div className="bg-[#113144] w-8 h-8 rounded-full flex items-center justify-center text-white mr-2">
                  <IconCashBanknotes className="w-6 h-6" />
                </div>
                <p className="text-lg">
                  บัญชีธนาคาร / เงินสด
                </p>
                              <Tippy content="ลูกค้าโอนเงิน/ชำระเงินสด" placement="right">
                                  <img
                                      src="/assets/images/information.png"
                                      alt="Info"
                                      className="cursor-pointer w-5 h-5 ml-2 mt-1.5"
                                  />
                              </Tippy>
              </div>
              <div className="flex flex-wrap w-full pt-3">
                <div className="w-full border border-[#e0e6ed] rounded-lg">
                  <p className="p-3 pl-5 pr-5 text-3xl text-center text-[#fb9d08]">
                    {numberWithCommas(dashboardCEOData?.bankAmountPayment)} ฿
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap">
              </div>
            </div>


          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 ">
            <div className="col-span-1 md:col-span-1">
              <div className="border border-gray-300 rounded-lg shadow-lg">
                <div className="bg-gradient-to-r from-[#03263a] to-[#0069a1] text-white p-4 rounded-t-lg">
                  <h2 className="text-lg font-bold text-center">สัญญา</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-6">
                    <div className="flex justify-between">
                      <span className="font-bold">รายการ</span>
                      <span className="font-bold">จำนวนสัญญา</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className='text-[#ababab]'>สัญญาที่อนุมัติแล้วทั้งหมด</span>
                      <span className="font-bold text-[#113144]">{numberCommas(dashboardCEOData?.appContractCount)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className='text-[#ababab]'>สัญญาที่ยกเลิก</span>
                      <span className="font-bold text-[#113144]">{numberCommas(dashboardCEOData?.canContractCount)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className='text-[#ababab]'>สัญญาที่เสร็จสิ้น (11-13)</span>
                      <span className="font-bold text-[#113144]">{numberCommas(dashboardCEOData?.comContractCount)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className='text-[#ababab]'>สัญญาสถานะปกติ (10)</span>
                      <span className="font-bold text-[#113144]">{numberCommas(dashboardCEOData?.s10ContractCount)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className='text-[#ababab]'>สัญญาสถานะเกินชำระ (20)</span>
                      <span className="font-bold text-[#113144]">{numberCommas(dashboardCEOData?.s20ContractCount)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className='text-[#ababab]'>สัญญาสถานะเกินชำระ (21)</span>
                      <span className="font-bold text-[#113144]">{numberCommas(dashboardCEOData?.s21ContractCount)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className='text-[#ababab]'>สัญญาสถานะเกินชำระ (22)</span>
                      <span className="font-bold text-[#113144]">{numberCommas(dashboardCEOData?.s22ContractCount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-1 grid grid-rows-2 gap-2">
              <div className="border border-gray-300 rounded-lg shadow-lg">
                <div className="bg-gradient-to-r from-[#f69e13] to-[#e75701] text-white p-4 rounded-t-lg">
                  <h2 className="text-lg font-bold text-center">จำนวนเงินในสัญญา</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-bold">รายการ</span>
                      <span className="font-bold">฿</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                                          <span className='text-[#ababab] flex items-center'>
                            จำนวนเงินในสัญญา
                                              <Tippy content="จำนวนเงินเช่าซื้อที่ไม่รวมเงินดาวน์" placement="right">
                                                  <img
                                                      src="/assets/images/information.png"
                                                      alt="Info"
                                                      className="cursor-pointer w-5 h-5 ml-2"
                                                  />
                                              </Tippy>
                        </span>
                        <span className="font-bold text-[#113144] flex items-center">
                            {numberWithCommas(dashboardCEOData?.amountContract)}

                        </span>
                    </div>

                    <hr />
                    <div className="flex justify-between">
                                          <span className='text-[#ababab] flex items-center'>รับชำระแล้ว
                                              <Tippy content="เงินที่ลูกค้าชำระแล้วในงวด" placement="right">
                                                  <img
                                                      src="/assets/images/information.png"
                                                      alt="Info"
                                                      className="cursor-pointer w-5 h-5 ml-2"
                                                  />
                                              </Tippy>
                      </span>
                      <span className="font-bold text-[#113144] flex items-center">
                            {numberWithCommas(dashboardCEOData?.paidContract)}
                        </span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                                          <span className='text-[#ababab] flex items-center'>รอรับชำระ
                                              <Tippy content="จำนวนเงินในสัญญา - รับชำระแล้ว" placement="right">
                                                  <img
                                                      src="/assets/images/information.png"
                                                      alt="Info"
                                                      className="cursor-pointer w-5 h-5 ml-2"
                                                  />
                                              </Tippy>
                      </span>
                        <span className="font-bold text-[#113144] ">
                            {numberWithCommas(dashboardCEOData?.recievableContract)}

                        </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg shadow-lg">
                <div className="bg-gradient-to-r from-[#a202fe] to-[#6578ff] text-white p-4 rounded-t-lg">
                  <h2 className="text-lg font-bold text-center">หนี้เกินกำหนดชำระ</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-bold">รายการ</span>
                      <span className="font-bold">฿</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                                          <span className='text-[#ababab] flex items-center'>หนี้เกินกำหนดชำระ (20)
                                              <Tippy content="จำนวนเงินค้างชำระที่ลูกค้ามีหนี้เกินกำหนด 3 - 10วัน" placement="right">
                                                  <img
                                                      src="/assets/images/information.png"
                                                      alt="Info"
                                                      className="cursor-pointer w-5 h-5 ml-2"
                                                  />
                                              </Tippy>
                      </span>
                                          <span className="font-bold text-[#113144] flex items-center">
                                              {numberWithCommas(dashboardCEOData?.r20DueContract)}

                                          </span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                                          <span className='text-[#ababab] flex items-center'>หนี้เกินกำหนดชำระ (21)
                                              <Tippy content="จำนวนเงินค้างชำระที่ลูกค้ามีหนี้เกินกำหนด 10 - 15วัน" placement="right">
                                                  <img
                                                      src="/assets/images/information.png"
                                                      alt="Info"
                                                      className="cursor-pointer w-5 h-5 ml-2"
                                                  />
                                              </Tippy>
                                          </span>
                                          <span className="font-bold text-[#113144] flex items-center">
                                              {numberWithCommas(dashboardCEOData?.r21DueContract)}

                                          </span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                                          <span className='text-[#ababab] flex items-center'>หนี้เกินกำหนดชำระ (22)
                                              <Tippy content="จำนวนเงินค้างชำระที่ลูกค้ามีหนี้เกินกำหนด 15วันขึ้นไป" placement="right">
                                                  <img
                                                      src="/assets/images/information.png"
                                                      alt="Info"
                                                      className="cursor-pointer w-5 h-5 ml-2"
                                                  />
                                              </Tippy>
                                          </span>
                                          <span className="font-bold text-[#113144] flex items-center">
                                              {numberWithCommas(dashboardCEOData?.r22DueContract)}

                                          </span>
                    </div>
                    <hr />

                    <div className="flex justify-between">
                      <span className="font-bold text-[#113144]">หนี้ครบกำหนด ณ วันที่เลือก</span>
                      <span className="font-bold text-yellow-500">{numberWithCommas(dashboardCEOData?.rTodayContact)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="border border-gray-300 rounded-lg shadow-lg">
                <div className="bg-gradient-to-r from-red-800 to-red-500 text-white p-4 rounded-t-lg flex flex-col gap-2">
                  <h2 className="text-lg font-bold text-center">คงเหลือจ่ายให้ร้านค้า</h2>
                  <h2 className="font-bold text-white text-3xl text-center">{numberWithCommas(dashboardCEOData?.total_amount_shop)}</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between gap-4">
                      <div className="flex w-full flex-col gap-1">
                        <span className='text-[#ababab]'>จำนวนสัญญา</span>
                        <span className="font-bold text-[#113144]">{numberCommas(dashboardCEOData?.total_asset)}</span>
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <span className='text-[#ababab]'>รวมยอดขาย (ทุนสินค้า)</span>
                        <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.total_cost_product)}</span>
                      </div>
                    </div>
                    <hr />
                    <div className="flex justify-between gap-4">
                      {/* <div className="flex flex-col gap-1 w-full">
                        <span className='text-[#ababab]'>โอนดาวน์</span>
                        <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.total_transfer_down)}</span>
                      </div> */}
                      <div className="flex flex-col gap-1 w-full">
                        <span className='text-[#ababab]'>รวมเงินดาวน์</span>
                        <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.total_down_payment)}</span>
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <span className='text-[#ababab]'>รวมทุนเช่าซื้อ</span>
                        <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.total_payment_notcom)}</span>
                      </div>
                    </div>
                    <hr />
                    <div className="flex justify-between gap-4">
                      <div className="flex flex-col gap-1 w-full">
                        <span className='text-[#ababab]'>รวมค่านายหน้า</span>
                        <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.total_commission)}</span>
                      </div>
                      <div className="flex w-full flex-col gap-1">
                        <span className='text-[#ababab]'>หัก รวมค่าทำสัญญา</span>
                        <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.total_contract_fee)}</span>
                      </div>
                    </div>
                    <hr />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 grid-rows-2 gap-2">
              <div className="border border-gray-300 rounded-lg shadow-lg">
                <div className="bg-gradient-to-r from-green-800 to-green-500 text-white p-4 rounded-t-lg flex flex-col gap-2">
                                  <div className="flex items-center justify-center">
                                      <h2 className="text-lg font-bold text-center mr-2">
                                          เงินทุนรอจัดเก็บสุทธิ (Net Funds to be Collected)
                                      </h2>
                                      <Tippy content="วงเงินเช่าซื้อ - ค่านายหน้า + ค่าทำสัญญา" placement="right">
                                          <img
                                              src="/assets/images/information-white.png"
                                              alt="Info"
                                              className="cursor-pointer w-5 h-5"
                                          />
                                      </Tippy>
                                  </div>
                  <h2 className="font-bold text-white text-3xl text-center">{numberWithCommas(dashboardCEOData?.profit_real)}</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                  <div className="flex flex-col gap-1 w-full">
                    <span className="flex items-center text-[#ababab]">
                        วงเงินให้เช่าซื้อ
                        <Tippy content="ไม่รวมเงินดาวน์" placement="right">
                        <img
                            src="/assets/images/information.png"
                            alt="Info"
                            className="cursor-pointer w-5 h-5 ml-2"
                        />
                        </Tippy>
                    </span>
                    <span className="font-bold text-[#113144]">
                        {numberWithCommas(dashboardCEOData?.collect_money)}
                    </span>
                    </div>

                    <hr />
                    <h5 className='font-semibold text-green-500'>รายได้</h5>
                    <div className='flex justify-between gap-4'>
                      <div className="flex flex-col gap-1 w-full">
                        <span className='text-[#ababab]'>ค่าดำเนินการเช่าซื้อ</span>

                        <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.profit_withcom)}</span>
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <span className="flex items-center text-[#ababab]">
                                                  ค่าทำสัญญา
                        <Tippy content="ค่าบริการทำสัญญา" placement="right">
                        <img
                            src="/assets/images/information.png"
                            alt="Info"
                            className="cursor-pointer w-5 h-5 ml-2"
                        />
                        </Tippy>
                    </span>
                        <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.total_contract_fee)}</span>
                      </div>
                    </div>
                    <hr />
                    <h5 className='font-semibold text-red-500'>รายจ่าย</h5>
                    <div>
                      <div className="flex flex-col gap-1 w-full">
                                              <span className="flex items-center text-[#ababab]">
                                                  ค่านายหน้า
                                                  <Tippy content="ค่านายหน้า Commission จากร้านค้า/พาร์ทเนอร์" placement="right">
                                                      <img
                                                          src="/assets/images/information.png"
                                                          alt="Info"
                                                          className="cursor-pointer w-5 h-5 ml-2"
                                                      />
                                                  </Tippy>
                                              </span>
                        <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.total_commission)}</span>
                      </div>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className='text-green-700 font-semibold'>กำไรจริง</span>
                      <span className="font-bold text-[#113144]">{numberWithCommas(dashboardCEOData?.recievableContract)}</span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>



          </div>
        </div>
      </div>
    </>
  )

}

export default DashboardCEOPV
