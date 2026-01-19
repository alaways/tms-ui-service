import { displayName } from "react-quill"
import themeInit from "../theme.init"
// Bangkok地区中心坐标
export const defaultCenter = {
  lat: 13.7563, // Bangkok
  lng: 100.5018,
}

export const googleApiKey = 'AIzaSyB0yi1E8Ssif3lcd77TgwUWTuRUU69cluM'

// 泰国省份列表
export const provinces = [
  { value: 'bangkok', label: 'provinces.bangkok' },
  { value: 'krabi', label: 'provinces.krabi' },
  { value: 'kanchanaburi', label: 'provinces.kanchanaburi' },
  { value: 'kalasin', label: 'provinces.kalasin' },
  { value: 'kamphaeng_phet', label: 'provinces.kamphaeng_phet' },
  { value: 'khon_kaen', label: 'provinces.khon_kaen' },
  { value: 'chanthaburi', label: 'provinces.chanthaburi' },
  { value: 'chachoengsao', label: 'provinces.chachoengsao' },
  { value: 'chon_buri', label: 'provinces.chon_buri' },
  { value: 'chainat', label: 'provinces.chainat' },
  { value: 'chaiyaphum', label: 'provinces.chaiyaphum' },
  { value: 'chumphon', label: 'provinces.chumphon' },
  { value: 'chiang_mai', label: 'provinces.chiang_mai' },
  { value: 'chiang_rai', label: 'provinces.chiang_rai' },
  { value: 'trang', label: 'provinces.trang' },
  { value: 'trat', label: 'provinces.trat' },
  { value: 'tak', label: 'provinces.tak' },
  { value: 'nakhon_nayok', label: 'provinces.nakhon_nayok' },
  { value: 'nakhon_pathom', label: 'provinces.nakhon_pathom' },
  { value: 'nakhon_phanom', label: 'provinces.nakhon_phanom' },
  { value: 'nakhon_ratchasima', label: 'provinces.nakhon_ratchasima' },
  { value: 'nakhon_si_thammarat', label: 'provinces.nakhon_si_thammarat' },
  { value: 'nakhon_sawan', label: 'provinces.nakhon_sawan' },
  { value: 'nonthaburi', label: 'provinces.nonthaburi' },
  { value: 'narathiwat', label: 'provinces.narathiwat' },
  { value: 'nan', label: 'provinces.nan' },
  { value: 'bueng_kan', label: 'provinces.bueng_kan' },
  { value: 'buriram', label: 'provinces.buriram' },
  { value: 'pathum_thani', label: 'provinces.pathum_thani' },
  { value: 'prachuap_khiri_khan', label: 'provinces.prachuap_khiri_khan' },
  { value: 'prachuap_khiri_khan', label: 'provinces.prachuap_khiri_khan' },
  { value: 'pattani', label: 'provinces.pattani' },
  { value: 'phra_nakhon_si_ayutthaya', label: 'provinces.phra_nakhon_si_ayutthaya' },
  { value: 'phang_nga', label: 'provinces.phang_nga' },
  { value: 'phatthalung', label: 'provinces.phatthalung' },
  { value: 'phichit', label: 'provinces.phichit' },
  { value: 'phitsanulok', label: 'provinces.phitsanulok' },
  { value: 'phetchaburi', label: 'provinces.phetchaburi' },
  { value: 'phetchabun', label: 'provinces.phetchabun' },
  { value: 'phrae', label: 'provinces.phrae' },
  { value: 'phayao', label: 'provinces.phayao' },
  { value: 'phuket', label: 'provinces.phuket' },
  { value: 'maha_sarakham', label: 'provinces.maha_sarakham' },
  { value: 'mukdahan', label: 'provinces.mukdahan' },
  { value: 'mae_hong_son', label: 'provinces.mae_hong_son' },
  { value: 'yasothon', label: 'provinces.yasothon' },
  { value: 'yala', label: 'provinces.yala' },
  { value: 'roi_et', label: 'provinces.roi_et' },
  { value: 'ranong', label: 'provinces.ranong' },
  { value: 'rayong', label: 'provinces.rayong' },
  { value: 'ratchaburi', label: 'provinces.ratchaburi' },
  { value: 'lopburi', label: 'provinces.lopburi' },
  { value: 'lampang', label: 'provinces.lampang' },
  { value: 'lamphun', label: 'provinces.lamphun' },
  { value: 'loei', label: 'provinces.loei' },
  { value: 'sisaket', label: 'provinces.sisaket' },
  { value: 'sakon_nakhon', label: 'provinces.sakon_nakhon' },
  { value: 'songkhla', label: 'provinces.songkhla' },
  { value: 'satun', label: 'provinces.satun' },
  { value: 'samut_prakan', label: 'provinces.samut_prakan' },
  { value: 'samut_songkhram', label: 'provinces.samut_songkhram' },
  { value: 'samut_sakhon', label: 'provinces.samut_sakhon' },
  { value: 'sa_kaew', label: 'provinces.sa_kaew' },
  { value: 'saraburi', label: 'provinces.saraburi' },
  { value: 'singburi', label: 'provinces.singburi' },
  { value: 'sukhothai', label: 'provinces.sukhothai' },
  { value: 'suphan_buri', label: 'provinces.suphan_buri' },
  { value: 'surat_thani', label: 'provinces.surat_thani' },
  { value: 'surin', label: 'provinces.surin' },
  { value: 'nong_khai', label: 'provinces.nong_khai' },
  { value: 'nong_bua_lam_phu', label: 'provinces.nong_bua_lam_phu' },
  { value: 'ang_thong', label: 'provinces.ang_thong' },
  { value: 'amnat_charoen', label: 'provinces.amnat_charoen' },
  { value: 'udon_thani', label: 'provinces.udon_thani' },
  { value: 'uttaradit', label: 'provinces.uttaradit' },
  { value: 'uthai_thani', label: 'provinces.uthai_thani' },
  { value: 'ubon_ratchathani', label: 'provinces.ubon_ratchathani' },
]

// 店铺组别
export const shopGroup = [
  { value: 'TA', label: 'shopGroup.TA' },
  { value: 'BA', label: 'shopGroup.BA' },
  { value: 'SA', label: 'shopGroup.SA' },
]

// 泰国标题/敬语
export const thaiTitles = [
  { value: 'mr', label: 'titles.mr' },
  { value: 'mrs', label: 'titles.mrs' },
  { value: 'ms', label: 'titles.ms' },
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

// 资产类型
export const assetType = [
  { value: 'Android', label: 'assetType.android' },
  { value: 'Ios', label: 'assetType.ios' },
]

// 保险类型
export const insuranceType = [
  { value: 'none', label: 'insuranceType.none' },
  { value: '1_year', label: 'insuranceType.1_year' },
  { value: '2_years', label: 'insuranceType.2_years' },
  { value: '3_years', label: 'insuranceType.3_years' },
  { value: 'other', label: 'insuranceType.other' },
]

// 职位类型 (泰国标准)
export const roleTypes = [
  { value: 'executive', label: 'roleTypes.executive' },
  { value: 'manager', label: 'roleTypes.manager' },
  { value: 'head_of_department', label: 'roleTypes.head_of_department' },
  { value: 'employee', label: 'roleTypes.employee' },
]

// 访问权限级别
export const accessLevelTypes = [
  { value: 'A', label: 'accessLevel.super_admin' },
  { value: 'B', label: 'accessLevel.admin' },
  { value: 'C', label: 'accessLevel.it_support' },
  { value: 'D', label: 'accessLevel.standard_user' },
]

// export const creditLevelTypes = [
//   { value: 'A', label: 'A - เครดิตดีมาก' },
//   { value: 'B', label: 'B - เครดิตดี' },
//   { value: 'C', label: 'C - เครดิตปานกลาง' },
//   { value: 'D', label: 'D - เครดิตไม่ดี' },
//   { value: 'N', label: 'N - ลูกค้าใหม่' },
// ]

// 保险期数列表
export const insPeriod = [
  { value: 1, label: 'insPeriod.1', ref: 'inr_1' },
  { value: 2, label: 'insPeriod.2', ref: 'inr_2' },
  { value: 3, label: 'insPeriod.3', ref: 'inr_3' },
  { value: 4, label: 'insPeriod.4', ref: 'inr_4' },
  { value: 5, label: 'insPeriod.5', ref: 'inr_5' },
  { value: 6, label: 'insPeriod.6', ref: 'inr_6' },
  { value: 7, label: 'insPeriod.7', ref: 'inr_7' },
  { value: 8, label: 'insPeriod.8', ref: 'inr_8' },
  { value: 9, label: 'insPeriod.9', ref: 'inr_9' },
  { value: 10, label: 'insPeriod.10', ref: 'inr_10' },
  { value: 11, label: 'insPeriod.11', ref: 'inr_11' },
  { value: 12, label: 'insPeriod.12', ref: 'inr_12' },
  { value: 13, label: 'insPeriod.13', ref: 'inr_13' },
  { value: 14, label: 'insPeriod.14', ref: 'inr_14' },
  { value: 15, label: 'insPeriod.15', ref: 'inr_15' },
  { value: 16, label: 'insPeriod.16', ref: 'inr_16' },
  { value: 17, label: 'insPeriod.17', ref: 'inr_17' },
  { value: 18, label: 'insPeriod.18', ref: 'inr_18' },
  { value: 19, label: 'insPeriod.19', ref: 'inr_19' },
  { value: 20, label: 'insPeriod.20', ref: 'inr_20' },
  { value: 21, label: 'insPeriod.21', ref: 'inr_21' },
  { value: 22, label: 'insPeriod.22', ref: 'inr_22' },
  { value: 23, label: 'insPeriod.23', ref: 'inr_23' },
  { value: 24, label: 'insPeriod.24', ref: 'inr_24' },
]

// 保险支付天数列表
export const insPayDay = Array.from({
  length: 30
}, (_, index) => {
  return {
    value: index + 1,
    label: index + 1
  }
})

// 交易状态类型
export const statusTypes = [
  { value: 'pending', label: 'statusTypes.pending' },
  { value: 'processing', label: 'statusTypes.processing' },
  { value: 'complete', label: 'statusTypes.complete' },
  { value: 'cancel', label: 'statusTypes.cancel' },
]

export const toastAlert: any = {
  toast: true,
  position: 'top',
  showConfirmButton: false,
  timer: 3000,
}

// 客户 CSV 导出列配置
export const customer_csv = [
  {
    id: 'created_at',
    displayName: 'customer_csv.created_at',
  },
  {
    id: 'shop_name',
    displayName: 'customer_csv.shop_name',
  },
  {
    id: 'name',
    displayName: 'customer_csv.name',
  },
  {
    id: 'phone_number',
    displayName: 'customer_csv.phone_number',
  },
  {
    id: 'line_id',
    displayName: 'customer_csv.line_id',
  },
  {
    id: 'citizen_id',
    displayName: 'customer_csv.citizen_id',
  },
  {
    id: 'credit_level',
    displayName: 'customer_csv.credit_level_bu',
  },
  {
    id: 'shop_credit_level',
    displayName: 'customer_csv.credit_level_shop',
  },
  {
    id: 'approval_status',
    displayName: 'customer_csv.approval_status',
  },
]

// 合同 CSV 导出列配置
export const columns_csv = [
  {
    id: 'contract_id',
    displayName: 'columns_csv.contract_id',
  },
  {
    id: 'contract_date',
    displayName: 'columns_csv.contract_date',
  },
  {
    id: 'shop_name',
    displayName: 'columns_csv.shop_name',
  },
  {
    id: 'business_name',
    displayName: 'columns_csv.business_name',
  },
  {
    id: 'business_tax_id',
    displayName: 'columns_csv.business_tax_id',
  },
  {
    id: 'customer_name',
    displayName: 'columns_csv.customer_name',
  },
  {
    id: 'customer_citizen_id',
    displayName: 'columns_csv.customer_citizen_id',
  },
  {
    id: 'customer_phone',
    displayName: 'columns_csv.customer_phone',
  },
  {
    id: 'customer_phone_ref',
    displayName: 'columns_csv.customer_phone_ref',
  },
  {
    id: 'customer_facebook_id',
    displayName: 'columns_csv.customer_facebook_id',
  },
  {
    id: 'customer_line_id',
    displayName: 'columns_csv.customer_line_id',
  },
  {
    id: 'customer_current_address',
    displayName: 'columns_csv.customer_current_address',
  },
  {
    id: 'customer_work_address',
    displayName: 'columns_csv.customer_work_address',
  },
  {
    id: 'asset_name',
    displayName: 'columns_csv.asset_name',
  },
  {
    id: 'asset_capacity',
    displayName: 'columns_csv.asset_capacity',
  },
  {
    id: 'asset_color',
    displayName: 'columns_csv.asset_color',
  },
  {
    id: 'asset_imei',
    displayName: 'columns_csv.asset_imei',
  },
  {
    id: 'asset_serial_number',
    displayName: 'columns_csv.asset_serial_number',
  },
  {
    id: 'price',
    displayName: 'columns_csv.price',
  },
  {
    id: 'down_payment',
    displayName: 'columns_csv.down_payment',
  },
  {
    id: 'subtotal',
    displayName: 'columns_csv.subtotal',
  },
  {
    id: 'ins_period',
    displayName: 'columns_csv.ins_period',
  },
  {
    id: 'interest_rate',
    displayName: 'columns_csv.interest_rate',
  },
  {
    id: 'principle',
    displayName: 'columns_csv.principle',
  },
  {
    id: 'installment_start_at',
    displayName: 'columns_csv.installment_start_at',
  },
  {
    id: 'ins_amount',
    displayName: 'columns_csv.ins_amount',
  },
  {
    id: 'ins_pay_day',
    displayName: 'columns_csv.ins_pay_day',
  },
  {
    id: 'contract_type',
    displayName: 'columns_csv.contract_type',
  },

  {
    id: 'memo',
    displayName: 'columns_csv.memo',
  },
  {
    id: 'last_payed_ins_no',
    displayName: 'columns_csv.last_payed_ins_no',
  },
  {
    id: 'last_payed_at',
    displayName: 'columns_csv.last_payed_at',
  },
  {
    id: 'next_pay_ins_no',
    displayName: 'columns_csv.next_pay_ins_no',
  },
  {
    id: 'next_pay_at',
    displayName: 'columns_csv.next_pay_at',
  },
  {
    id: 'price_total',
    displayName: 'columns_csv.price_total',
  },
   {
    id: 'close_contract_at',
    displayName: 'columns_csv.close_contract_at',
  },
  {
    id: 'approve_by',
    displayName: 'columns_csv.approve_by',
  },
  {
    id:'preliminary_credit_assessment',
    displayName: "columns_csv.preliminary_credit_assessment"
  }

]

// 报告 CSV 导出列配置
export const report_csv = [
  {
    id: 'no',
    displayName: 'report_csv.no',
  },
  {
    id: 'business_unit_name',
    displayName: 'report_csv.business_unit_name',
  },
  {
    id: 'shop_name',
    displayName: 'report_csv.shop_name',
  },
  {
    id: 'count_contract',
    displayName: 'report_csv.count_contract',
  },
  {
    id: 'price',
    displayName: 'report_csv.price',
  },
  {
    id: 'down_payment',
    displayName: 'report_csv.down_payment',
  },
  {
    id: 'principle',
    displayName: 'report_csv.principle',
  },
  {
    id: 'commission',
    displayName: 'report_csv.commission',
  },
  {
    id: 'benefit',
    displayName: 'report_csv.benefit',
  },
  {
    id: 'amount',
    displayName: 'report_csv.amount',
  },
  {
    id: 'fee',
    displayName: 'report_csv.fee',
  },
  {
    id: 'total',
    displayName: 'report_csv.total',
  },
  {
    id: 'bank_name',
    displayName: 'report_csv.bank_name',
  },
  {
    id: 'bank_account_name',
    displayName: 'report_csv.bank_account_name',
  },
  {
    id: 'bank_account_number',
    displayName: 'report_csv.bank_account_number',
  },
]

// 付款 CSV 导出列配置
export const payment_csv = [
  {
    id: 'no',
    displayName: 'payment_csv.no',
  },
  {
    id: 'contract_id',
    displayName: 'payment_csv.contract_id',
  },
  {
    id: 'business_unit_name',
    displayName: 'payment_csv.business_unit_name',
  },
  {
    id: 'customer_name',
    displayName: 'payment_csv.customer_name',
  },
  {
    id: 'ins_no',
    displayName: 'payment_csv.ins_no',
  },
  {
    id: 'amount',
    displayName: 'payment_csv.amount',
  },
  {
    id: 'status',
    displayName: 'payment_csv.status',
  },
  {
    id: 'payed_at',
    displayName: 'payment_csv.payed_at',
  },
  {
    id: 'reference',
    displayName: 'payment_csv.reference',
  },
  {
    id: 'payment_method',
    displayName: 'payment_csv.payment_method',
  },
  {
    id: 'channel',
    displayName: 'payment_csv.channel',
  },
  {
    id: 'penalty_fee',
    displayName: 'payment_csv.penalty_fee',
  },
  {
    id: 'tracking_fee',
    displayName: 'payment_csv.tracking_fee',
  },
  {
    id: 'unlock_fee',
    displayName: 'payment_csv.unlock_fee',
  },
  {
    id: 'discount',
    displayName: 'payment_csv.discount',
  },
  {
    id: 'total',
    displayName: 'payment_csv.total',
  },
]

// 商务单位付款 CSV 导出列配置
export const payment_bu_csv = [
  {
    id: 'id',
    displayName: 'payment_bu_csv.id',
  },
  {
    id: 'reference',
    displayName: 'payment_bu_csv.reference',
  },
  {
    id: 'invoice_id',
    displayName: 'payment_bu_csv.invoice_id',
  },
  {
    id: 'payment_method',
    displayName: 'payment_bu_csv.payment_method',
  },
  {
    id: 'payed_at',
    displayName: 'payment_bu_csv.payed_at',
  },
  {
    id: 'amount',
    displayName: 'payment_bu_csv.amount',
  },
  {
    id: 'status',
    displayName: 'payment_bu_csv.status',
  },
  {
    id: 'extra_note',
    displayName: 'payment_bu_csv.extra_note',
  },
  {
    id: 'note',
    displayName: 'payment_bu_csv.note',
  },
  {
    id: 'channel',
    displayName: 'payment_bu_csv.channel',
  }
]

// 发票 CSV 导出列配置
export const invoice_csv = [
  {
    id: 'index',
    displayName: 'invoice_csv.index',
  },
  {
    id: 'id',
    displayName: 'invoice_csv.id',
  },
  {
    id: 'invoice_date',
    displayName: 'invoice_csv.invoice_date',
  },
  {
    id: 'invoice_type',
    displayName: 'invoice_csv.invoice_type',
  },
  {
    id: 'contract_reference',
    displayName: 'invoice_csv.contract_reference',
  },
  {
    id: 'ins_no',
    displayName: 'invoice_csv.ins_no',
  },
  {
    id: 'amount',
    displayName: 'invoice_csv.amount',
  },
  {
    id: 'payment_method',
    displayName: 'invoice_csv.payment_method',
  },
  {
    id: 'payed_at',
    displayName: 'invoice_csv.payed_at',
  },
  {
    id: 'payment_reference',
    displayName: 'invoice_csv.payment_reference',
  },
  {
    id: 'status',
    displayName: 'invoice_csv.status',
  },
]

// 店铺报告 CSV 导出列配置
export const shop_report_csv = [
  {
    id: 'reference',
    displayName: 'shop_report_csv.reference',
  },
  {
    id: 'contract_date',
    displayName: 'shop_report_csv.contract_date',
  },
  {
    id: 'approved_at',
    displayName: 'shop_report_csv.approved_at',
  },
  {
    id: 'asset_name',
    displayName: 'shop_report_csv.asset_name',
  },
  {
    id: 'asset_price',
    displayName: 'shop_report_csv.asset_price',
  },
  {
    id: 'down_payment',
    displayName: 'shop_report_csv.down_payment',
  },
  {
    id: 'principle',
    displayName: 'shop_report_csv.principle',
  },
  {
    id: 'commission',
    displayName: 'shop_report_csv.commission',
  },
  {
    id: 'benefit',
    displayName: 'shop_report_csv.benefit',
  },
  {
    id: 'amount',
    displayName: 'shop_report_csv.amount',
  },
  {
    id: 'fee',
    displayName: 'shop_report_csv.fee',
  },
  {
    id: 'total',
    displayName: 'shop_report_csv.total',
  },
]

// 账户报告 CSV 导出列配置
export const report_account_csv = [
  {
    id: 'id',
    displayName: 'report_account_csv.id',
  },
  {
    id: 'created_at',
    displayName: 'report_account_csv.created_at',
  },
  {
    id: 'amount',
    displayName: 'report_account_csv.amount',
  },
  {
    id: 'description',
    displayName: 'report_account_csv.description',
  },
  {
    id: 'price',
    displayName: 'report_account_csv.price',
  },
]

// 店铺付款报告 CSV 导出列配置
export const report_paid_shop_csv = [
  {
    id: 'id',
    displayName: 'report_paid_shop_csv.id',
  },
  {
    id: 'created_at',
    displayName: 'report_paid_shop_csv.created_at',
  },
  {
    id: 'description',
    displayName: 'report_paid_shop_csv.description',
  },
  {
    id: 'price',
    displayName: 'report_paid_shop_csv.price',
  },
  {
    id: 'payment_type',
    displayName: 'report_paid_shop_csv.payment_type',
  },
  {
    id: 'reference',
    displayName: 'report_paid_shop_csv.reference'
  },
  {
    id: 'admin_name',
    displayName: 'report_paid_shop_csv.admin_name',
  },
]

// 百分比数组 (0%, 10%, 15%, 20%, ... 65%)
export const percentageArray = Array.from({ length: 12 }, (_, index) => {
  const value = index === 0 ? 0 : 10 + (index - 1) * 5;
  return { label: `${value}%`, value: value / 100 };
});

// 增值税类型 (已登记/未登记)
export const vatTypes = [
  { value: true, label: 'vatTypes.registered' },
  { value: false, label: 'vatTypes.unregistered' },
]

// 付款状态类型
export const statusPaymentType = [
  { value: 'complete', label: 'statusPayment.complete' },
  { value: 'cancel', label: 'statusPayment.cancel' },
  { value: 'all', label: 'statusPayment.all' },
]

// 支付方式 (现金/Pay Solution/Thai QR)
export const paymentMethod = [
  { value: 'cash', label: 'paymentMethod.cash' },
  { value: 'ps', label: 'paymentMethod.pay_solution' },
  ...(themeInit.paymentGateway.tqr
    ? [{ value: 'tqr', label: 'paymentMethod.thai_qr' }]
    : []
  ),
]

/**
 * 在组件中使用此函数来翻译常量数组中的标签
 * 用法: import { translateLabelArray } from './helpers/constant'
 *       const translatedOptions = translateLabelArray(provinces, i18n)
 *
 * @param array - 包含 label 属性的数组 (例如: provinces, shopGroup 等)
 * @param i18n - i18next 实例
 * @returns 包含翻译后 label 的新数组
 */
export const translateLabelArray = (
  array: Array<{ value: any; label: string; [key: string]: any }>,
  i18n: any
) => {
  return array.map((item) => ({
    ...item,
    label: i18n.t(item.label),
  }));
};
