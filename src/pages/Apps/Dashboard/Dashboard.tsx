import { Form, Formik, FormikProps } from 'formik';
import SelectField from '../../../components/HOC/SelectField';
import { DatePicker, Space } from 'antd';
import type { DatePickerProps } from 'antd';
import { useGlobalMutation } from '../../../helpers/globalApi';
import dayjs from 'dayjs';
import th from 'antd/es/date-picker/locale/th_TH';
import dayTh from 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { numberWithCommas } from '../../../helpers/formatNumeric';
import { useState, useEffect } from 'react';
import { url_api } from '../../../services/endpoints';
import { toastAlert } from '../../../helpers/constant'
import Swal from 'sweetalert2'
import PreLoading from '../../../helpers/preLoading';
const Dashboard = () => {
    dayjs.extend(buddhistEra);
    dayjs.locale(dayTh);
    const toast = Swal.mixin(toastAlert)
    interface reportTab1 {
        month: number
        total_price_total: number //ยอดสินชื่อ
        total_down_payment: number // ยอดดาวน์
        total_pay_amount: number //ยอดค่างวดที่จ่ายแล้ว
        total_pay_penalty: number // ยอดค่าปรับที่จ่ายแล้ว
        total_pay_unlock: number //ยอดค่าปลดล้อคที่จ่ายแล้ว
        total_discount: number //ยอดส่วนลด
        total_summary1: number // รวมยอดที่จ่าย

        total_asset_price: number //ค่าเครื่อง
        total_commission_price: number  // ค่าคอม
        total_benefit: number
        total_fee: number
        total_summary2: number //ต้นทุน
        total_unpaid:number // ยอดต้างจ่าย
        total_profit: number // กำไร/ขาดทุน
    }
    const defaultItemTab1 = {
        total_price_total: 0,
        total_down_payment: 0,
        total_pay_amount: 0,
        total_pay_penalty: 0,
        total_pay_unlock: 0,
        total_discount: 0,
        total_summary1: 0,
        total_asset_price: 0,
        total_commission_price: 0,
        total_benefit: 0,
        total_fee: 0,
        total_summary2: 0,
        total_unpaid:0,
        total_profit: 0,
    };
    interface reportTab2 { 
        month : number
        on_process :number
        closed : number
        refund : number
        tracking : number
        unabled_contract : number
        report_to_police : number
        bad_debt : number
        cancel: number
        total: number
    }

    const defaultItemTab2 = {
        on_process : 0,
        closed :  0,
        refund :  0,
        tracking :  0,
        unabled_contract :  0,
        report_to_police :  0,
        bad_debt :  0,
        cancel:  0,
        total:  0,
    };
    // Generate default report1 for 13 months
    const [report1, setReport1] = useState<reportTab1[]>(
        Array.from({ length: 13 }, (_, index) => ({
            month: index,
            ...defaultItemTab1
        }))
    );

    const [report2, setReport2] = useState<reportTab2[]>(
        Array.from({ length: 13 }, (_, index) => ({
            month: index,
            ...defaultItemTab2
        }))
    );
    const [itemBusinessUnit, setBusinessUnitList] = useState<any[]>([])
    const buddhistLocale: typeof th = {
        ...th,
        lang: {
            ...th.lang,
            fieldDateFormat: 'BBBB-MM-DD',
            fieldYearFormat: 'BBBB',
            fieldDateTimeFormat: 'BBBB-MM-DD HH:mm:ss',
            yearFormat: 'BBBB',
            cellYearFormat: 'BBBB',
        },
    };
    const onChange = (props: FormikProps<any>, date: any, dateString: string) => {
        const formatted = date.locale('en').format('YYYY');
        props.setFieldValue('date', formatted);
    };

    const onSubmit = (values: any) => {
        const year = values?.date
        const id_business_unit = values.id_business_unit
        if (id_business_unit === null || id_business_unit === undefined) {
            toast.fire({
              icon: 'warning',
              title: 'กรุณาเลือกหน่วยธุรกิจเพื่อค้นหา',
              padding: '10px 20px',
            })
          
        } else if (year === null || year === undefined) {
            
            toast.fire({
                icon: 'warning',
                title: 'กรุณาเลือกปีเพื่อค้นหา',
                padding: '10px 20px',
            })
        } else {
            
            fetchReportTab1({data: {"id_business_unit": id_business_unit,"year": +year}})
            fetchReportTab2({data: {"id_business_unit": id_business_unit,"year": +year}})
        }
    };

    const { mutate: fetchBuALL } = useGlobalMutation(url_api.businessUnitFindAll, {
        onSuccess: (res: any) => {
            setBusinessUnitList(res.data.list.map((item: any) => ({
                value: item.id,
                label: item.name,
            })))
        },
        onError: () => {
        },
    })

    const { mutate: fetchReportTab1 ,isLoading} = useGlobalMutation(url_api.dashboardRepord + "?tab=tab_1", {
        onSuccess: (res: any) => {
            if (res.message) {
                const data = res.data.map((item: reportTab1) => ({
                    month: item.month,
                    total_price_total: item.total_price_total,
                    total_down_payment: item.total_down_payment,
                    total_pay_amount: item.total_pay_amount,
                    total_pay_penalty: item.total_pay_penalty,
                    total_pay_unlock: item.total_pay_unlock,
                    total_discount: item.total_discount,
                    total_summary1: item.total_summary1,
                    total_asset_price: item.total_asset_price,
                    total_commission_price: item.total_commission_price,
                    total_benefit: item.total_benefit,
                    total_fee: item.total_fee,
                    total_summary2: item.total_summary2,
                    total_unpaid: item.total_unpaid,
                    total_profit: item.total_profit,
                }));
                setReport1(data);
            }
        }
    })

    const { mutate: fetchReportTab2,isLoading:isLoading2} = useGlobalMutation(url_api.dashboardRepord + "?tab=tab_2", {
        onSuccess: (res: any) => {
            if (res.message) {
                const data = res.data.map((item: reportTab2) => ({
                    month: item.month,
                    on_process: item.on_process,
                    closed: item.closed,
                    refund: item.refund,
                    tracking: item.tracking,
                    unabled_contract: item.unabled_contract,
                    report_to_police: item.report_to_police,
                    bad_debt: item.bad_debt,
                    cancel: item.cancel,
                    total: item.total,
                }));

                setReport2(data);
            }
        }
    })

    useEffect(() => {
        fetchBuALL({})
    }, [])
    return (
        
        <>
         {isLoading || isLoading2 && <PreLoading />}
            <Formik initialValues={{id_business_unt: '',year: ''}} 
            onSubmit={onSubmit}>
                {(props) => (
                    <Form className="flex flex-col gap-6">

                        <div className="flex flex-row flex-wrap justify-end items-center gap-2 w-full">

                            {/* Left side (DatePicker + Search Button) */}
                            <div className="flex flex-row gap-5 items-center">
                                <DatePicker
                                    onChange={(date: any, dateString: any) => onChange(props, date, dateString)}
                                    name="date"
                                    picker="year"
                                    className="w-[200px]"
                                    locale={buddhistLocale}
                                />

                                <SelectField
                                    id="bu"
                                    label=""
                                    className="z-10"
                                    name="id_business_unit"
                                    options={itemBusinessUnit}
                                    isSearchable={true}
                                    isMulti={true}
                                    onChange={(e) => { }}
                                />

                                <button type="submit" className="text-white bg-[#002A41] rounded-lg py-2 px-4">
                                    ค้นหา
                                </button>
                            </div>

                        </div>

                        <div className="flex flex-col gap-1">
                            <h1 className="font-semibold text-xl">สรุปยอดแยกเดือน</h1>
                            <div className="bg-white rounded-xl " style={{
                                overflowY: 'auto',
                                display: 'block'
                            }}>
                                <table className="income">
                                    <tr className="h-[40px]">
                                        <th colSpan={2} className="border-b border-white bg-[#002A41] text-white"></th>
                                        <th colSpan={7} className="border-r border-b border-white bg-[#002A41] text-white">
                                            รายรับ
                                        </th>
                                        <th colSpan={4} className="border border-white bg-[#002A41] text-white">
                                            ต้นทุน
                                        </th>
                                        <th colSpan={2} className="border border-b-none border-white bg-[#002A41] text-white">
                                            สรุป
                                        </th>
                                    </tr>
                                    <tr className="second bg-[#F0F2F7] h-[40px] sec">
                                        <th>เดือน</th>
                                        <th>ยอดสินเชื่อ</th>
                                        <th>ยอดดาวน์</th>
                                        <th>ยอดค่างวดที่จ่ายแล้ว</th>
                                        <th>ยอดค่าดำเนินการล่าช้าที่จ่ายแล้ว</th>
                                        <th>ยอดค่าปลดล็อคที่จ่ายแล้ว</th>
                                        <th>ส่วนลด</th>
                                        <th>ค่าทำสัญญา</th>
                                        <th>รวม</th>
                                        <th>ค่าเครื่อง</th>
                                        <th>ค่าคอม</th>
                                        <th>ค่าผลตอบแทนพิเศษ</th>
                                       
                                        <th>รวม</th>
                                        <th>ยอดค้างจ่าย</th>
                                        <th>กำไร/ขาดทุน</th>
                                    </tr>
                                    <tbody>
                                        {report1.map((item, index) => (
                                            <tr key={index}>
                                                <td className="">
                                                    {item.month === 12 ? "รวม" : item.month + 1}
                                                </td>
                                                <td className="">{numberWithCommas(item.total_price_total)}</td>
                                                <td className="">{numberWithCommas(item.total_down_payment)}</td>
                                                <td className="">{numberWithCommas(item.total_pay_amount)}</td>
                                                <td className="">{numberWithCommas(item.total_pay_penalty)}</td>
                                                <td className="">{numberWithCommas(item.total_pay_unlock)}</td>
                                                <td className="">{numberWithCommas(item.total_discount)}</td>
                                                <td className="">{numberWithCommas(item.total_fee)}</td>
                                                <td className="">{numberWithCommas(item.total_summary1)}</td>
                                                <td className="">{numberWithCommas(item.total_asset_price)}</td>
                                                <td className="">{numberWithCommas(item.total_commission_price)}</td>
                                                <td className="">{numberWithCommas(item.total_benefit)}</td>
                                              
                                                <td className="">{numberWithCommas(item.total_summary2)}</td>
                                                <td className="">{numberWithCommas(item.total_unpaid)}</td>
                                                <td className="">{numberWithCommas(item.total_profit)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h1 className="font-semibold text-xl">สรุปสถานะแยกเดือน</h1>
                            <div className="bg-white rounded-xl " style={{
                                overflowY: 'auto',
                                display: 'block'
                            }}>
                                <table className="income">
                                    <tr className="h-[50px]">
                                        <th colSpan={10} className="border border-b-none border-white bg-[#002A41] text-white">
                                            จำนวนสินเชื่อ
                                        </th>
                                    </tr>
                                    <tr className="second bg-[#F0F2F7] h-[40px] sec">
                                        <th>เดือน</th>
                                        <th>กำลังผ่อน</th>
                                        <th>ปิดยอด</th>
                                        <th>คืนเงิน</th>
                                        <th>ติดตาม</th>
                                        <th>ติดต่อไม่ได้</th>
                                        <th>แจ้งความ</th>
                                        <th>หนี้สิน</th>
                                        <th>ยกเลิก</th>
                                        <th>รวม</th>
                                    </tr>
                                    <tbody>
                                        {report2.map((item, index) => (
                                            <tr key={index}>
                                                <td className="">
                                                    {item.month === 12 ? "รวม" : item.month + 1}
                                                </td>
                                                <td className="">{(item.on_process)}</td>
                                                <td className="">{(item.closed)}</td>
                                                <td className="">{(item.refund)}</td>
                                                <td className="">{(item.tracking)}</td>
                                                <td className="">{(item.unabled_contract)}</td>
                                                <td className="">{(item.report_to_police)}</td>
                                                <td className="">{(item.bad_debt)}</td>
                                                <td className="">{(item.cancel)}</td>
                                                <td className="">{(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    );
};

export default Dashboard;
