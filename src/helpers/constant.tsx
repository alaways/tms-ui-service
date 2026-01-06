import { displayName } from "react-quill"
import themeInit from "../theme.init"
export const defaultCenter = {
  lat: 13.7563, // กรุงเทพมหานคร
  lng: 100.5018,
}

export const googleApiKey = 'AIzaSyB0yi1E8Ssif3lcd77TgwUWTuRUU69cluM'

export const provinces = [
  { value: 'กรุงเทพมหานคร', label: 'กรุงเทพมหานคร' },
  { value: 'กระบี่', label: 'กระบี่' },
  { value: 'กาญจนบุรี', label: 'กาญจนบุรี' },
  { value: 'กาฬสินธุ์', label: 'กาฬสินธุ์' },
  { value: 'กำแพงเพชร', label: 'กำแพงเพชร' },
  { value: 'ขอนแก่น', label: 'ขอนแก่น' },
  { value: 'จันทบุรี', label: 'จันทบุรี' },
  { value: 'ฉะเชิงเทรา', label: 'ฉะเชิงเทรา' },
  { value: 'ชลบุรี', label: 'ชลบุรี' },
  { value: 'ชัยนาท', label: 'ชัยนาท' },
  { value: 'ชัยภูมิ', label: 'ชัยภูมิ' },
  { value: 'ชุมพร', label: 'ชุมพร' },
  { value: 'เชียงใหม่', label: 'เชียงใหม่' },
  { value: 'เชียงราย', label: 'เชียงราย' },
  { value: 'ตรัง', label: 'ตรัง' },
  { value: 'ตราด', label: 'ตราด' },
  { value: 'ตาก', label: 'ตาก' },
  { value: 'นครนายก', label: 'นครนายก' },
  { value: 'นครปฐม', label: 'นครปฐม' },
  { value: 'นครพนม', label: 'นครพนม' },
  { value: 'นครราชสีมา', label: 'นครราชสีมา' },
  { value: 'นครศรีธรรมราช', label: 'นครศรีธรรมราช' },
  { value: 'นครสวรรค์', label: 'นครสวรรค์' },
  { value: 'นนทบุรี', label: 'นนทบุรี' },
  { value: 'นราธิวาส', label: 'นราธิวาส' },
  { value: 'น่าน', label: 'น่าน' },
  { value: 'บึงกาฬ', label: 'บึงกาฬ' },
  { value: 'บุรีรัมย์', label: 'บุรีรัมย์' },
  { value: 'ปทุมธานี', label: 'ปทุมธานี' },
  { value: 'ประจวบคีรีขันธ์', label: 'ประจวบคีรีขันธ์' },
  { value: 'ปราจีนบุรี', label: 'ปราจีนบุรี' },
  { value: 'ปัตตานี', label: 'ปัตตานี' },
  { value: 'พระนครศรีอยุธยา', label: 'พระนครศรีอยุธยา' },
  { value: 'พังงา', label: 'พังงา' },
  { value: 'พัทลุง', label: 'พัทลุง' },
  { value: 'พิจิตร', label: 'พิจิตร' },
  { value: 'พิษณุโลก', label: 'พิษณุโลก' },
  { value: 'เพชรบุรี', label: 'เพชรบุรี' },
  { value: 'เพชรบูรณ์', label: 'เพชรบูรณ์' },
  { value: 'แพร่', label: 'แพร่' },
  { value: 'พะเยา', label: 'พะเยา' },
  { value: 'ภูเก็ต', label: 'ภูเก็ต' },
  { value: 'มหาสารคาม', label: 'มหาสารคาม' },
  { value: 'มุกดาหาร', label: 'มุกดาหาร' },
  { value: 'แม่ฮ่องสอน', label: 'แม่ฮ่องสอน' },
  { value: 'ยโสธร', label: 'ยโสธร' },
  { value: 'ยะลา', label: 'ยะลา' },
  { value: 'ร้อยเอ็ด', label: 'ร้อยเอ็ด' },
  { value: 'ระนอง', label: 'ระนอง' },
  { value: 'ระยอง', label: 'ระยอง' },
  { value: 'ราชบุรี', label: 'ราชบุรี' },
  { value: 'ลพบุรี', label: 'ลพบุรี' },
  { value: 'ลำปาง', label: 'ลำปาง' },
  { value: 'ลำพูน', label: 'ลำพูน' },
  { value: 'เลย', label: 'เลย' },
  { value: 'ศรีสะเกษ', label: 'ศรีสะเกษ' },
  { value: 'สกลนคร', label: 'สกลนคร' },
  { value: 'สงขลา', label: 'สงขลา' },
  { value: 'สตูล', label: 'สตูล' },
  { value: 'สมุทรปราการ', label: 'สมุทรปราการ' },
  { value: 'สมุทรสงคราม', label: 'สมุทรสงคราม' },
  { value: 'สมุทรสาคร', label: 'สมุทรสาคร' },
  { value: 'สระแก้ว', label: 'สระแก้ว' },
  { value: 'สระบุรี', label: 'สระบุรี' },
  { value: 'สิงห์บุรี', label: 'สิงห์บุรี' },
  { value: 'สุโขทัย', label: 'สุโขทัย' },
  { value: 'สุพรรณบุรี', label: 'สุพรรณบุรี' },
  { value: 'สุราษฎร์ธานี', label: 'สุราษฎร์ธานี' },
  { value: 'สุรินทร์', label: 'สุรินทร์' },
  { value: 'หนองคาย', label: 'หนองคาย' },
  { value: 'หนองบัวลำภู', label: 'หนองบัวลำภู' },
  { value: 'อ่างทอง', label: 'อ่างทอง' },
  { value: 'อำนาจเจริญ', label: 'อำนาจเจริญ' },
  { value: 'อุดรธานี', label: 'อุดรธานี' },
  { value: 'อุตรดิตถ์', label: 'อุตรดิตถ์' },
  { value: 'อุทัยธานี', label: 'อุทัยธานี' },
  { value: 'อุบลราชธานี', label: 'อุบลราชธานี' },
]

export const shopGroup = [
  { value: 'TA', label: 'TA' },
  { value: 'BA', label: 'BA' },
  { value: 'SA', label: 'SA' },
]

export const thaiTitles = [
  { value: 'นาย', label: 'นาย' },
  { value: 'นาง', label: 'นาง' },
  { value: 'นางสาว', label: 'นางสาว' },
  // { value: 'เด็กชาย', label: 'เด็กชาย' },
  // { value: 'เด็กหญิง', label: 'เด็กหญิง' },
  // { value: 'ดร.', label: 'ดร.' },
  // { value: 'ศ.', label: 'ศ.' },
  // { value: 'รศ.', label: 'รศ.' },
  // { value: 'ผศ.', label: 'ผศ.' },
  // { value: 'พล.ต.อ.', label: 'พล.ต.อ.' },
  // { value: 'พล.ต.ท.', label: 'พล.ต.ท.' },
  // { value: 'พล.ต.', label: 'พล.ต.' },
  // { value: 'พ.ต.อ.', label: 'พ.ต.อ.' },
  // { value: 'พ.ต.ท.', label: 'พ.ต.ท.' },
  // { value: 'พ.ต.', label: 'พ.ต.' },
]

export const assetType = [
  { value: 'Android', label: 'Android' },
  { value: 'Ios', label: 'Ios' },
]

export const insuranceType = [
  { value: 'ไม่มีประกัน', label: 'ไม่มีประกัน' },
  { value: '1ปี', label: '1 ปี' },
  { value: '2ปี', label: '2 ปี' },
  { value: '3ปี', label: '3 ปี' },
  { value: 'อื่นๆ', label: 'อื่น ๆ' },
]

export const roleTypes = [
  { value: 'executive', label: 'ผู้บริหาร' },
  { value: 'manager', label: 'ผู้จัดการ' },
  { value: 'head_of_department', label: 'หัวหน้าฝ่าย' },
  { value: 'employee', label: 'พนักงาน' },
]

export const accessLevelTypes = [
  { value: 'A', label: 'Super Admin' },
  { value: 'B', label: 'Admin' },
  { value: 'C', label: 'IT Support' },
  { value: 'D', label: 'Standard User' },
]

// export const creditLevelTypes = [
//   { value: 'A', label: 'A - เครดิตดีมาก' },
//   { value: 'B', label: 'B - เครดิตดี' },
//   { value: 'C', label: 'C - เครดิตปานกลาง' },
//   { value: 'D', label: 'D - เครดิตไม่ดี' },
//   { value: 'N', label: 'N - ลูกค้าใหม่' },
// ]

export const insPeriod = [
  { value: 1, label: '1', ref: 'inr_1' },
  { value: 2, label: '2', ref: 'inr_2' },
  { value: 3, label: '3', ref: 'inr_3' },
  { value: 4, label: '4', ref: 'inr_4' },
  { value: 5, label: '5', ref: 'inr_5' },
  { value: 6, label: '6', ref: 'inr_6' },
  { value: 7, label: '7', ref: 'inr_7' },
  { value: 8, label: '8', ref: 'inr_8' },
  { value: 9, label: '9', ref: 'inr_9' },
  { value: 10, label: '10', ref: 'inr_10' },
  { value: 11, label: '11', ref: 'inr_11' },
  { value: 12, label: '12', ref: 'inr_12' },
  { value: 13, label: '13', ref: 'inr_13' },
  { value: 14, label: '14', ref: 'inr_14' },
  { value: 15, label: '15', ref: 'inr_15' },
  { value: 16, label: '16', ref: 'inr_16' },
  { value: 17, label: '17', ref: 'inr_17' },
  { value: 18, label: '18', ref: 'inr_18' },
  { value: 19, label: '19', ref: 'inr_19' },
  { value: 20, label: '20', ref: 'inr_20' },
  { value: 21, label: '21', ref: 'inr_21' },
  { value: 22, label: '22', ref: 'inr_22' },
  { value: 23, label: '23', ref: 'inr_23' },
  { value: 24, label: '24', ref: 'inr_24' },
]

export const insPayDay = Array.from({
  length: 30
}, (_, index) => {
  return {
    value: index + 1,
    label: index + 1
  }
})

export const statusTypes = [
  { value: 'pending', label: 'pending' },
  { value: 'processing', label: 'processing' },
  { value: 'complete', label: 'complete' },
  { value: 'cancel', label: 'cancel' },
]

export const toastAlert: any = {
  toast: true,
  position: 'top',
  showConfirmButton: false,
  timer: 3000,
}

export const customer_csv = [
  {
    id: 'created_at',
    displayName: 'วันที่สร้าง',
  },
  {
    id: 'shop_name',
    displayName: 'ร้านค้า',
  },
  {
    id: 'name',
    displayName: 'ชื่อ-นามสกุล',
  },
  {
    id: 'phone_number',
    displayName: 'เบอร์โทรศัพท์ลูกค้า',
  },
  {
    id: 'line_id',
    displayName: 'Line ID',
  },
  {
    id: 'citizen_id',
    displayName: 'รหัสบัตรประชาชน',
  },
  {
    id: 'credit_level',
    displayName: 'ระดับเครดิต (BU)',
  },
  {
    id: 'shop_credit_level',
    displayName: 'ระดับเครดิต (ร้านค้า)',
  },
  {
    id: 'approval_status',
    displayName: 'อนุมัติ',
  },
]

export const columns_csv = [
  {
    id: 'contract_id',
    displayName: 'เลขที่สัญญา',
  },
  {
    id: 'contract_date',
    displayName: 'วันที่ทำสัญญา',
  },
  {
    id: 'shop_name',
    displayName: 'ชื่อร้านค้า',
  },
  {
    id: 'business_name',
    displayName: 'ชื่อหน่วยธุรกิจ',
  },
  {
    id: 'business_tax_id',
    displayName: 'เลขประจำตัวผู้เสียภาษี',
  },
  {
    id: 'customer_name',
    displayName: 'ชื่อลูกค้า',
  },
  {
    id: 'customer_citizen_id',
    displayName: 'เลขประชาชนลูกค้า',
  },
  {
    id: 'customer_phone',
    displayName: 'เบอร์โทรร้านค้า',
  },
  {
    id: 'customer_phone_ref',
    displayName: 'เบอร์โทรอ้างอิง',
  },
  {
    id: 'customer_facebook_id',
    displayName: 'Facebook ลูกค้า',
  },
  {
    id: 'customer_line_id',
    displayName: 'Line ลูกค้า',
  },
  {
    id: 'customer_current_address',
    displayName: 'ที่อยู่ปัจจุบัน',
  },
  {
    id: 'customer_work_address',
    displayName: 'ที่อยู่ที่ทำงาน',
  },
  {
    id: 'asset_name',
    displayName: 'สินทรัพย์',
  },
  {
    id: 'asset_capacity',
    displayName: 'ความจุ',
  },
  {
    id: 'asset_color',
    displayName: 'สี',
  },
  {
    id: 'asset_imei',
    displayName: 'IMEI',
  },
  {
    id: 'asset_serial_number',
    displayName: 'Serial Number',
  },
  {
    id: 'price',
    displayName: 'ราคาสินค้า',
  },
  {
    id: 'down_payment',
    displayName: 'เงินดาวน์',
  },
  {
    id: 'subtotal',
    displayName: 'รวม',
  },
  {
    id: 'ins_period',
    displayName: 'จำนวนงวด',
  },
  {
    id: 'interest_rate',
    displayName: 'ผลตอบแทน',
  },
  {
    id: 'principle',
    displayName: 'เงินต้น',
  },
  {
    id: 'installment_start_at',
    displayName: 'งวดแรกเริ่มเมื่อ',
  },
  {
    id: 'ins_amount',
    displayName: 'ผ่อนงวดละ',
  },
  {
    id: 'ins_pay_day',
    displayName: 'ชำระทุกวันที่',
  },
  {
    id: 'contract_type',
    displayName: 'ประเภทสัญญา',
  },

  {
    id: 'memo',
    displayName: 'หมายเหตุประกอบสัญญา',
  },
  {
    id: 'last_payed_ins_no',
    displayName: 'งวดชำระล่าสุด',
  },
  {
    id: 'last_payed_at',
    displayName: 'วันที่ชำระล่าสุด',
  },
  {
    id: 'next_pay_ins_no',
    displayName: 'งวดชำระถัดไป',
  },
  {
    id: 'next_pay_at',
    displayName: 'วันที่งวดถัดไป',
  },
  {
    id: 'price_total',
    displayName: 'ราคาที่ทำสัญญา',
  },
   {
    id: 'close_contract_at',
    displayName: 'วันที่ปิดสัญญา',
  },
  {
    id: 'approve_by',
    displayName: 'ผู้อนุมัติสัญญา',
  },
  {
    id:'preliminary_credit_assessment',
    displayName: "ค่าพิจารณาสัญญา"
  }
  
]

export const report_csv = [
  {
    id: 'no',
    displayName: 'ลำดับ',
  },
  {
    id: 'business_unit_name',
    displayName: 'หน่วยธุรกิจ',
  },
  {
    id: 'shop_name',
    displayName: 'ร้านค้า',
  },
  {
    id: 'count_contract',
    displayName: 'จำนวนสัญญา',
  },
  {
    id: 'price',
    displayName: 'รวมราคาขาย',
  },
  {
    id: 'down_payment',
    displayName: 'รวมเงินดาวน์',
  },
  {
    id: 'principle',
    displayName: 'รวมทุนเช่าซื้อ',
  },
  {
    id: 'commission',
    displayName: 'รวมค่านายหน้า',
  },
  {
    id: 'benefit',
    displayName: 'ผลตอบแทนพิเศษ',
  },
  {
    id: 'amount',
    displayName: 'รวมเป็นเงิน',
  },
  {
    id: 'fee',
    displayName: 'ค่าทำสัญญา',
  },
  {
    id: 'total',
    displayName: 'รวมเป็นเงินทั้งสิ้น',
  },
  {
    id: 'bank_name',
    displayName: 'ธนาคาร',
  },
  {
    id: 'bank_account_name',
    displayName: 'ชื่อบัญชีธนาคาร',
  },
  {
    id: 'bank_account_number',
    displayName: 'เลขที่บัญชีธนาคาร',
  },
]

export const payment_csv = [
  {
    id: 'no',
    displayName: 'ลำดับ',
  },
  {
    id: 'contract_id',
    displayName: 'เลขที่สัญญา',
  },
  {
    id: 'business_unit_name',
    displayName: 'หน่วยธุรกิจ',
  },
  {
    id: 'customer_name',
    displayName: 'ชื่อลูกค้า',
  },
  {
    id: 'ins_no',
    displayName: 'ชำระงวดที่',
  },
  {
    id: 'amount',
    displayName: 'ค่างวด',
  },
  {
    id: 'status',
    displayName: 'สถานะการชำระเงิน',
  },
  {
    id: 'payed_at',
    displayName: 'วันที่ชำระ',
  },
  {
    id: 'reference',
    displayName: 'เลขที่อ้างอิง',
  },
  {
    id: 'payment_method',
    displayName: 'ช่องทางการชำระเงิน',
  },
  {
    id: 'channel',
    displayName: 'ช่องทาง',
  },
  {
    id: 'penalty_fee',
    displayName: 'ค่าดำเนินการล่าช้า',
  },
  {
    id: 'tracking_fee',
    displayName: 'ค่าติดตาม',
  },
  {
    id: 'unlock_fee',
    displayName: 'ค่าปลดล็อค',
  },
  {
    id: 'discount',
    displayName: 'ส่วนลด',
  },
  {
    id: 'total',
    displayName: 'ยอดชำระ',
  },
]

export const payment_bu_csv = [
  {
    id: 'id',
    displayName: 'ลำดับ',
  },
  {
    id: 'reference',
    displayName: 'เลขที่อ้างอิง',
  },
  {
    id: 'invoice_id',
    displayName: 'เลขที่ใบแจ้งหนี้',
  },
  {
    id: 'payment_method',
    displayName: 'ช่องทางชำระเงิน',
  },
  {
    id: 'payed_at',
    displayName: 'วันที่ชำระเงิน',
  },
  {
    id: 'amount',
    displayName: 'จำนวนเงิน',
  },
  {
    id: 'status',
    displayName: 'สถานะชำระเงิน',
  },
  {
    id: 'extra_note',
    displayName: 'บันทึกเพิ่มเติม',
  },
  {
    id: 'note',
    displayName: 'หมายเหตุ',
  },
  {
    id: 'channel',
    displayName: 'ช่องทาง',
  }
]

export const invoice_csv = [
  {
    id: 'index',
    displayName: 'ลำดับ',
  },
  {
    id: 'id',
    displayName: 'เลขที่',
  },
  {
    id: 'invoice_date',
    displayName: 'วันที่',
  },
  {
    id: 'invoice_type',
    displayName: 'ประเภทใบแจ้งหนี้',
  },
  {
    id: 'contract_reference',
    displayName: 'สัญญาเลขที่',
  },
  {
    id: 'ins_no',
    displayName: 'งวดที่',
  },
  {
    id: 'amount',
    displayName: 'จำนวนเงิน',
  },
  {
    id: 'payment_method',
    displayName: 'ช่องทางชำระเงิน',
  },
  {
    id: 'payed_at',
    displayName: 'วันที่ชำระเงิน',
  },
  {
    id: 'payment_reference',
    displayName: 'เลขที่อ้างอิง',
  },
  {
    id: 'status',
    displayName: 'สถานะชำระเงิน',
  },
]

export const shop_report_csv = [
  {
    id: 'reference',
    displayName: 'เลขที่สัญญา',
  },
  {
    id: 'contract_date',
    displayName: 'วันที่ทำสัญญา',
  },
  {
    id: 'approved_at',
    displayName: 'วันที่อนุมัติสัญญา',
  },
  {
    id: 'asset_name',
    displayName: 'ชื่อทรัพย์สิน',
  },
  {
    id: 'asset_price',
    displayName: 'ราคาขาย',
  },
  {
    id: 'down_payment',
    displayName: 'เงินดาวน์',
  },
  {
    id: 'principle',
    displayName: 'ทุนเช่าซื้อ',
  },
  {
    id: 'commission',
    displayName: 'ค่านายหน้า',
  },
  {
    id: 'benefit',
    displayName: 'ผลตอบแทนพิเศษ',
  },
  {
    id: 'amount',
    displayName: 'รวมเป็นเงิน',
  },
  {
    id: 'fee',
    displayName: 'ค่าทำสัญญา',
  },
  {
    id: 'total',
    displayName: 'คงเหลือให้ร้านค้า',
  },
]

export const report_account_csv = [
  {
    id: 'id',
    displayName: 'ลำดับ',
  },
  {
    id: 'created_at',
    displayName: 'วันที่',
  },
  {
    id: 'amount',
    displayName: 'จำนวนรายการ',
  },
  {
    id: 'description',
    displayName: 'รายละเอียด',
  },
  {
    id: 'price',
    displayName: 'ยอดเงิน',
  },
]

export const report_paid_shop_csv = [
  {
    id: 'id',
    displayName: 'ลำดับ',
  },
  {
    id: 'created_at',
    displayName: 'วันที่',
  },
  {
    id: 'description',
    displayName: 'รายละเอียด',
  },
  {
    id: 'price',
    displayName: 'ยอดเงิน',
  },
  {
    id: 'payment_type',
    displayName: 'ช่องทางการชำระเงิน',
  },
  {
    id: 'reference',
    displayName: 'หมายเลขอ้างอิง'
  },
  {
    id: 'admin_name',
    displayName: 'ผู้ทำรายการ',
  },
]

export const percentageArray = Array.from({ length: 12 }, (_, index) => {
  const value = index === 0 ? 0 : 10 + (index - 1) * 5;
  return { label: `${value}%`, value: value / 100 };
});

export const vatTypes = [
  { value: true, label: 'จดภาษีมูลค่าเพิ่มแล้ว' },
  { value: false, label: 'ยังไม่เข้าระบบภาษีมูลค่าเพิ่ม' },
]

export const statusPaymentType = [
  { value: 'complete', label: 'สำเร็จ' },
  { value: 'cancel', label: 'ไม่สำเร็จ' },
  { value: 'all', label: 'ทั้งหมด' },
]

export const paymentMethod = [
  { value: 'cash', label: 'เงินสด' },
  { value: 'ps', label: 'Pay Solution' },
  ...(themeInit.paymentGateway.tqr
    ? [{ value: 'tqr', label: 'Thai QR' }]
    : []
  ),
]