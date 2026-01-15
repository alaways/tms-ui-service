export type stringType = string | null;

interface IdentifyFields {
  id?: stringType;
  uuid?: stringType;
}

interface CommonModelFields {
  active?: boolean;
  is_active?: boolean;
  created_at?: stringType;
  updated_at?: stringType;
  deleted_at?: stringType;
  create_by?: stringType;
  update_by?: stringType;
  deleted_by?: stringType;
}

export interface UserState {
  id: number | null;
  uuid: stringType;
  name: stringType;
  access_token: stringType;
  email: stringType;
  role?: stringType;
}

export interface Shop extends IdentifyFields, CommonModelFields {

  id_shop?: stringType;
  id_shop_group?: stringType;

  shop_group?: any;

  id_business_unit?: stringType;
  business_unit?: any;

  name?: stringType;
  tax_id?: stringType;

  username?: stringType;
  password?: stringType;
  password_repeat?: stringType;

  contact_name?: stringType;
  phone_number?: stringType;
  website?: stringType;
  email?: stringType;

  address?: stringType;
  full_address?: stringType;

  province?: any;
  province_name?: stringType;

  id_province?: stringType;
  id_district?: stringType;
  id_subdistrict?: stringType;

  zip_code?: stringType;

  line_id?: stringType;
  facebook_id?: stringType;

  latitude?: stringType;
  longitude?: stringType;

  bank_no?: stringType;
  bank_account?: stringType;
  bank_name?: stringType;

  is_approved?: boolean;
  is_create_customer?: boolean
  is_create_refinance?:boolean
}

export interface ShopGroup extends IdentifyFields, CommonModelFields {
  name?: stringType;
  id_business_unit?: number | null;
  business_unit?: any;
}

export interface Customer extends IdentifyFields, CommonModelFields {
  citizen_id?: stringType;
  title?: stringType;
  name?: stringType;
  id_shop?: stringType;
  email?: stringType;
  phone_number?: stringType;
  phone_number_ref?: stringType;
  address?: stringType;
  id_province?: number | null;
  id_district?: number | null;
  id_subdistrict?: number | null;
  zip_code?: string | null;
  current_address?: stringType;
  current_id_province?: number | null;
  current_id_district?: number | null;
  current_id_subdistrict?: number | null;
  current_zip_code?: string | null;
  work_address?: stringType;
  work_id_province?: number | null;
  work_id_district?: number | null;
  work_id_subdistrict?: number | null;
  work_zip_code?: string | null;
  line_id?: stringType;
  facebook_id?: stringType;
  credit_level?: stringType;
  citizen_image_url?: stringType;
  verification_image_url?: stringType;
  approval_status?: stringType;
  copyAddress?: any;
  tiktok_id: stringType;
  instagram_id: stringType;
  shop_name?: stringType;
}

export interface Assets extends IdentifyFields, CommonModelFields {
  id_asset_type?: stringType;
  asset_type?: any;
  id_shop?: stringType;
  shop?: any;
  name?: stringType;
  model_number?: stringType;
  capacity?: stringType;
  color?: stringType;
  serial_number?: stringType;
  imei?: stringType;
  insurance_type_id?: stringType;
  price?: number;
  note?: stringType;
  on_contract?:boolean;
  asset_images?: any[];
}

export interface AssetsImage extends IdentifyFields, CommonModelFields {
  id_asset?: stringType;
  asset?: Assets | null;
  name: stringType;
  image_url: stringType;
  extension?: stringType;
  size?: stringType;
}

export interface AssetsTypes extends IdentifyFields, CommonModelFields {
  id?: stringType;
  name?: stringType;
  description?: stringType;
}

export interface ContractTypes extends IdentifyFields, CommonModelFields {
  id?: stringType;
  name?: stringType;
}

export interface AssetsColors extends IdentifyFields, CommonModelFields {
  id?: stringType;
  name?: stringType;
  label?: stringType;
  value?: any;
  id_asset_type?: stringType;
id_asset_name?: stringType;
  asset_type: {
    id: string;
    name: string;
  };
}

export interface AssetsModels extends IdentifyFields, CommonModelFields {
  id?: stringType;
  name?: stringType;
  label?: stringType;
  value?: any;
  id_asset_type?: stringType;
    id_asset_name?: stringType;
  asset_type: {
    id: string;
    name: string;
  };
}

export interface AssetsCapacitys extends IdentifyFields, CommonModelFields {
  id?: stringType;
  name?: stringType;
  label?: stringType;
  value?: any;
  is_active?: boolean;
  id_asset_type?: number;
}

export interface AssetsNames extends IdentifyFields, CommonModelFields {
  id?: stringType;
  name?: stringType;
  label?: stringType;
  value?: any;
  id_asset_type?: stringType;
  asset_type: {
    id: stringType;
    name: stringType;
  };
  asset_name: {
    id: stringType;
    name: stringType;
  };

}

export interface Contract extends IdentifyFields, CommonModelFields {
  contract_date?: stringType;
  id_shop?: stringType;
  id_shop_group?: stringType;
  id_business_unit?: stringType;
  shop?: any;
  shop_name?: stringType;
  id_customer?: stringType;
  customer?: any;
  id_asset?: stringType;
  uuid:any,
  asset?: any;
  price?: number;
  down_payment?: number;
  principle?: number;
  ins_amount?: number;
  ins_period?: number | null;
  ins_period_unit?: stringType;
  ins_due_at?: stringType;
  paid_date?: stringType;
  id_employee?: number | null;
  employee?: any;
  contract_ref_link?: stringType;
  status?: stringType;
  rate_name?: stringType;
  ins_pay_day?: number | null;
  rate_per_month?: number | null;
  interest?: number | null;
  status_id?: number | null;
  contract_type_id?: number | null;
  memo?: stringType;
  commission?: number | null;
  penalty_fee?: number | null;
  unlock_fee?: number | null;
  tracking_fee?: number | null;
  fee?: number;
  is_locked?: boolean;
  is_refinance?:any
}

export interface Installments extends IdentifyFields, CommonModelFields {
  id_contract?: stringType;
  ins_no?: stringType;
  due_at?: stringType;
  item?: stringType;
  amount?: number;
  fine?: number;
  tracking_cost?: number;
  device_unlocking_cost?: number;
}

export interface Employees extends IdentifyFields, CommonModelFields {
  title?: stringType;
  name?: stringType;
  phone_number?: stringType;
  line_id?: stringType;
  email?: stringType;
  role?: stringType;
  access_level?: stringType;
}

export interface InsuranceTypes extends IdentifyFields, CommonModelFields {
  name?: stringType;
  description?: stringType;
}

export interface BusinessUnits extends IdentifyFields, CommonModelFields {
  name?: stringType;
  tax_id?: stringType;
  phone?: stringType;
  email?: stringType;
  line_id?: stringType;
  website?: stringType;
  address?: stringType;
  province?: any;
  description?: stringType;
  penalty_fee?: stringType;
  fee?: stringType;
  tracking_fee?: stringType;
  unlock_fee?: stringType;
  id_province?: stringType;
  id_district?: stringType;
  id_subdistrict?: stringType;
  zip_code?: stringType;
  logo_image_url?: stringType;
  full_address?: stringType
}

export interface ShopGroupBuConfig extends IdentifyFields, CommonModelFields {
  id_business_unit?: stringType;
  id_shop_group?: stringType;
  id_interest_rate?: stringType;
  commission?: stringType;
  benefit?: stringType;
  penalty_fee?: stringType;
  fee?: stringType;
  tracking_fee?: stringType;
  unlock_fee?: stringType;
  condition_contract?: stringType;
}

export interface CustomerPaymentContract extends IdentifyFields, CommonModelFields {
  preview: any;
  due_at: any;
  ins_now: stringType;
  customer: any;
  status?: stringType;
  asset_name?: stringType;
  shop_name?: stringType;
}

export interface InterestRate extends IdentifyFields, CommonModelFields {
  name?: stringType;
  id_shop_group?: number | null;
  inr_3?: number | null;
  inr_4?: number | null;
  inr_5?: number | null;
  inr_6?: number | null;
  inr_7?: number | null;
  inr_8?: number | null;
  inr_9?: number | null;
  inr_10?: number | null;
  inr_11?: number | null;
  inr_12?: number | null;
  shop_group?: any;
}
