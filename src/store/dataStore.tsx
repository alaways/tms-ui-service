import { createSlice } from '@reduxjs/toolkit'
import { Shop, UserState, Customer, Assets, AssetsImage, AssetsTypes, Contract, Installments, Employees, InsuranceTypes, BusinessUnits, ShopGroupBuConfig } from '../types/index'

interface AppState {
  user: UserState
  shop: Shop
  customer: Customer
  assets: Assets
  assetsImage: AssetsImage
  assetsTypes: AssetsTypes
  contract: Contract
  installments: Installments
  employees: Employees
  insuranceTypes: InsuranceTypes
  provinces: Array<any>
  credit_level: Array<any>
  businessUnits: BusinessUnits
  shopGroupBuConfig: any
}

const mode = process.env.MODE || 'admin'

export const initialState: AppState = {
  provinces: [],
  credit_level:[],
  user: {
    id: 0,
    uuid: '',
    name: '',
    email: '',
    access_token: '',
    role: '',
  },
  shop: {
    id: '',
    uuid: '',
    id_shop_group: '',
    name: '',
    contact_name: '',
    phone_number: '',
    line_id: '',
    facebook_id: '',
    website: '',
    email: '',
    address: '',
    id_province: '',
    province_name: '',
    latitude: '',
    longitude: '',
    bank_no: '',
    is_approved: true,
    is_active: true,
  },
  customer: {
    id: '',
    uuid: '',
    title: '',
    name: '',
    citizen_id: '',
    credit_level: '',
    current_address: '',
    email: '',
    facebook_id: '',
    tiktok_id: '',
    instagram_id: '',
    phone_number: '',
    phone_number_ref: '',
    citizen_image_url: '',
    verification_image_url: '',
    approval_status: 'Approval',
    is_active: true,
  },
  assets: {
    id: '',
    uuid: '',
    id_asset_type: '',
    name: '',
    model_number: '',
    capacity: '',
    color: '',
    serial_number: '',
    imei: '',
    insurance_type_id: '',
    price: 0,
    note: '',
    is_active: true,
  },
  assetsImage: {
    id: '',
    uuid: '',
    id_asset: '',
    asset: null,
    name: '',
    image_url: '',
    extension: '',
    size: '',
    is_active: true,
  },
  assetsTypes: {
    id: '',
    uuid: '',
    name: '',
    description: '',
    is_active: true,
  },
  contract: {
    id: null,
    uuid: '',
    contract_date: '',
    asset: null,
    id_shop: '',
    id_customer: '',
    id_asset: '',
    price: 0,
    down_payment: 0,
    principle: 0,
    ins_amount: 0,
    ins_period: 0,
    ins_period_unit: '',
    ins_due_at: '',
    fee: 0,
    paid_date: '',
    id_employee: 0,
    contract_ref_link: '',
    status: '',
    is_active: true,
  },
  installments: {
    id: '',
    uuid: '',
    id_contract: '',
    ins_no: '',
    due_at: '',
    item: '',
    amount: 0,
    fine: 0,
    tracking_cost: 0,
    device_unlocking_cost: 0,
    is_active: true,
  },
  employees: {
    id: '',
    uuid: '',
    title: '',
    name: '',
    phone_number: '',
    line_id: '',
    email: '',
    role: '',
    access_level: '',
    is_active: true,
  },
  insuranceTypes: {
    id: '',
    uuid: '',
    name: '',
    description: '',
    is_active: true,
  },
  businessUnits: {
    id: '',
    name: '',
    tax_id: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    id_province: '',
    id_district: '',
    id_subdistrict: '',
    zip_code: '',
    active: true,
  },
  shopGroupBuConfig: {
    commission: '',
    benefit: '',
    penalty_fee: '',
    fee: '',
    tracking_fee: '',
    unlock_fee: '',
    condition_contract: ''
  },
}
const dataStored = createSlice({
  name: 'storedData',
  initialState: initialState,
  reducers: {
    setUser(state, { payload }) {
      payload = payload || state.user
      localStorage.setItem(mode, JSON.stringify(payload))
      state.user = payload
    },
    setShop(state, { payload }) {
      payload = payload || state.shop
      state.shop = payload
    },
    setCustomer(state, { payload }) {
      payload = payload || state.customer
      state.customer = payload
    },
    setAsset(state, { payload }) {
      payload = payload || state.assets
      state.assets = payload
    },
    setAssetImage(state, { payload }) {
      payload = payload || state.assetsImage
      state.assetsImage = payload
    },
    setAssetTypes(state, { payload }) {
      payload = payload || state.assetsTypes
      state.assetsTypes = payload
    },
    setContract(state, { payload }) {
      payload = payload || state.contract
      state.contract = payload
    },
    setInstallment(state, { payload }) {
      payload = payload || state.installments
      state.installments = payload
    },
    setEmployee(state, { payload }) {
      payload = payload || state.employees
      state.employees = payload
    },
    setInsuranceTypes(state, { payload }) {
      payload = payload || state.insuranceTypes
      state.insuranceTypes = payload
    },
    setProvinces(state, { payload }) {
      payload = payload || state.provinces
      state.provinces = payload
    },
    setBusinessUnits(state, { payload }) {
      payload = payload || state.businessUnits
      state.businessUnits = payload
    },
    setShopGroupBuConfig(state, { payload }) {
      payload = payload || state.shopGroupBuConfig
      state.shopGroupBuConfig = payload
    },

    setCreditLevel(state, { payload }) {
      payload = payload || state.credit_level
      state.credit_level = payload
    },
  },
})

export const { setUser, setShop, setCustomer, setAsset, setAssetImage, setAssetTypes, setContract, setInstallment, setEmployee, setInsuranceTypes, setProvinces, setBusinessUnits, setShopGroupBuConfig,setCreditLevel } = dataStored.actions
export default dataStored.reducer