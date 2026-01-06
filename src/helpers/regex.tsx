export const ID = new RegExp(/^[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+$/);
export const PASSWORD = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{4,20}$/);

export const INS_PERIOD = new RegExp(/^(10|[1-9])$/);
export const NUMBER_REGEX = new RegExp(/^[\d]+$/);
export const PHONE_NUMBER = new RegExp(/^0\d{9,9}$/);
export const PRICE_REGEX = new RegExp(/^\d+(\.\d{1,2})?$/);

export const CONTACT_PHONE_NUMBER = new RegExp(/^[0]{1}[1-9]{1}[0-9]{7,8}$/);
export const CHECK_LAST6_ALL_ZERO = new RegExp(/^000000/);
export const MOBILE_PHONE_NUMBER = new RegExp(/^0[6,8,9](?!00000000)\d{8}$/);
export const PHONE_PUBLIC_NUMBER = new RegExp(/^0\d{7,254}$/);
export const EMAIL = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z]+[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
export const USER_LOGIN = new RegExp(/^[A-Za-z0-9_.+]+$/);
export const THAI_ID_CARD = new RegExp(/^[0-9]{13}$/);
export const PASSPORT_NUMBER = new RegExp(/^(?!^0+$)[a-zA-Z0-9]{3,24}$/);
export const FATCA_GREEN_ID_CARD = new RegExp(/^[a-zA-Z0-9]{1,15}$/);

export const SCB_APPLICATION_NUM = new RegExp(/^\d{15,15}$/);
export const TEXT_WITHOUT_NUMBER = new RegExp(/^([^\d]*)$/);
export const INPUT_TEXT = new RegExp(/^[\u0E00-\u0E7Fa-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\s]+$/);
export const INPUT_TEXT_ALPHABET = new RegExp(/^[\u0E00-\u0E7Fa-zA-Z0-9\s]+$/);
export const POSTAL_CODE = new RegExp(/^0\d{1,255}$/);
export const MONEY_REGEX = new RegExp(/^[0-9,]+$/);

export const NUMBER_MAX2 = new RegExp(/^[0-9]{1,2}$/);
export const NUMBER_MAX3 = new RegExp(/^[0-9]{1,3}$/);

export const LASER_CODE = new RegExp(/^[a-zA-Z]{2,2}[0-9]{10,10}/);
export const INPUT_ADDRESS = new RegExp(/^[\u0E00-\u0E7Fa-zA-Z0-9-/\s]+$/);
export const ADDRESS_INPUT = new RegExp(/^[ A-Za-z0-9\/\-]*$/);
export const NAME_INPUT = new RegExp(/^[\u0E00-\u0E7Fa-zA-Z-\s]+$/);

export const MONTH_INPUT = new RegExp(/^(1?[012]|0?[1-9])$/);

export const ASSIGN_CONTAIN = new RegExp(/@/);
export const LOAN_NUMBER = new RegExp(/^478/i);
