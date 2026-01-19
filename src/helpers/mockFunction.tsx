import { Shop, Customer, Assets, Employees, Installments, InsuranceTypes, numbeType, Contract } from '../types/index';
import { provinces, shopGroup, thaiTitles, insuranceType, roleTypes, accessLevelTypes , toastAlert } from '../helpers/constant';
import { initialState } from '../store/dataStore';

export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const getRandomPrice = (): numbeType => {
    return Math.floor(Math.random() * 100000);
};

const generateContractData = () => {
    const price: any = getRandomPrice();
    const downPaymentPercentage = Math.random() * 0.3; // Down payment is between 0% to 30% of the price
    const downPayment: numbeType = Math.floor(price * downPaymentPercentage);
    const principle: numbeType = price - downPayment;  // Principle is the remaining amount after down payment

    return {
        price,
        down_payment: downPayment,
        principle
    };
};




// export const generateMockShopData = () => {
//     const mockData: Array<Shop> = [];
//     for (let i = 1; i <= 10; i++) {
//         mockData.push({
//             ...initialState.shop,
//             id: i.toString(),
//             uuid: generateUUID(),
//             name: `Shop ${i}`,
//             contact_name: `contactName ${i}`,
//             phone_number: `085-456-789${i}`,
//             line_id: `line_id_${i}`,
//             email: `ShopEmail${i}@example.com`,
//             address: `Address ${i}`,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString(),
//             deleted_at: null,
//             is_active: Math.random() >= 0.2,
//             is_approved: Math.random() >= 0.5,
//             bank_no: Math.floor(Math.random() * Math.pow(10, 13))
//                 .toString()
//                 .padStart(13, '0'),
//             facebook_id: `facebook${i}`,
//             latitude: '13.80028496040805',
//             longitude: '100.50778426857772',
//             province_name: provinces[Math.floor(Math.random() * provinces.length)]?.value || null,
//             website: `https://www.Shop${i}.com`,
//         });
//     }
//     return mockData;
// };

// export const generateMockCustomerData = () => {
//     const mockData: Array<Customer> = [];
//     for (let i = 1; i <= 10; i++) {
//         mockData.push({
//             ...initialState.employees,
//             id: i.toString(),
//             uuid: generateUUID(),
//             title: thaiTitles[Math.floor(Math.random() * thaiTitles.length)]?.value || null,
//             name: `Customer ${i}`,
//             citizen_id: Math.floor(Math.random() * Math.pow(10, 13))
//                 .toString()
//                 .padStart(13, '0'),
//             line_id: `line_id_${i}`,
//             facebook_id: `facebook${i}`,
//             email: `ShopEmail${i}@example.com`,
//             address: `Address${i}`,
//             current_address: `CurrentAddress${i}`,
//             credit_level: `1`,
//             district: `district`,
//             sub_district: `sub_district`,
//             province_name: provinces[Math.floor(Math.random() * provinces.length)]?.value || null,
//             approval_status: "Approved",
//             citizen_image_url: `www.tplus.com/image?image.jpg`,
//             is_active: Math.random() >= 0.2,
//             phone_number: `085-456-789${i}`,
//             work_address: ``,
//             work_province_name: provinces[Math.floor(Math.random() * provinces.length)]?.value || null,
//             verification_image_url: `www.tplus.com/image?image.jpg`,
//             id_province: ``,
//             id_work_province: ``,
//             phone_number_ref: ``,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString(),
//             deleted_at: null,
//         });
//     }
//     return mockData;
// };

// export const generateMockAssetsData = () => {
//     const mockData: Array<Assets> = [];
//     for (let i = 1; i <= 10; i++) {
//         mockData.push({
//             ...initialState.assets,
//             id: i.toString(),
//             uuid: generateUUID(),
//             name: `Asset ${i}`,
//             model_number: `Model ${i}`,
//             asset_type: {
//                 name: Math.random() >= 0.5 ? `Android` : `Ios`,
//             },
//             capacity: `Capacity ${i}`,
//             color: `Color ${i}`,
//             serial_number: `Serial ${i}`,
//             imei: `IMEI ${i}`,
//             insurance_type: {
//                 name: insuranceType[Math.floor(Math.random() * insuranceType.length)]?.value || null,
//             },
//             price: `${Math.floor(Math.random() * 10000)}`,
//             note: `Note ${i}`,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString(),
//             deleted_at: null,
//             is_active: Math.random() >= 0.2,
//         });
//     }
//     return mockData;
// };

// export const generateMockInstallmentsData = () => {
//     const mockData: Array<Installments> = [];
//     for (let i = 1; i <= 10; i++) {
//         mockData.push({
//             ...initialState.installments,
//             id: i.toString(),
//             uuid: generateUUID(),
//             id_contract: `contract_${i}`,
//             ins_no: `INS00${i}`,
//             due_at: new Date().toISOString(),
//             item: `Item ${i}`,
//             amount: Math.floor(Math.random() * 50000),
//             fine: Math.floor(Math.random() * 500),
//             tracking_cost: Math.floor(Math.random() * 200),
//             device_unlocking_cost: Math.floor(Math.random() * 300),
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString(),
//             deleted_at: null,
//             is_active: Math.random() >= 0.2,
//         });
//     }
//     return mockData;
// };

// export const generateMockEmployeesData = () => {
//     const mockData: Array<Employees> = [];
//     for (let i = 1; i <= 10; i++) {
//         mockData.push({
//             ...initialState.employees,
//             id: i.toString(),
//             uuid: generateUUID(),
//             title: thaiTitles[Math.floor(Math.random() * thaiTitles.length)]?.value,
//             name: `Employee ${i}`,
//             phone_number: `085-123-456${i}`,
//             line_id: `line_id_${i}`,
//             email: `employee${i}@example.com`,
//             role: roleTypes[Math.floor(Math.random() * roleTypes.length)]?.value,
//             access_level: accessLevelTypes[Math.floor(Math.random() * accessLevelTypes.length)]?.value,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString(),
//             deleted_at: null,
//             is_active: Math.random() >= 0.2,
//         });
//     }
//     return mockData;
// };

// export const generateMockInsuranceTypesData = () => {
//     const mockData: Array<InsuranceTypes> = [];
//     for (let i = 1; i <= 5; i++) {
//         mockData.push({
//             ...initialState.insuranceTypes,
//             id: i.toString(),
//             uuid: generateUUID(),
//             name: `Insurance Type ${i}`,
//             description: `Description for Insurance Type ${i}`,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString(),
//             deleted_at: null,
//             is_active: true,
//         });
//     }
//     return mockData;
// };

export const generateMockContractsData = () => {
    const mockData: Array<Contract> = [];
    for (let i = 1; i <= 10; i++) {
        const contract = generateContractData();
        mockData.push({
            ...initialState.contract,
            id: i.toString(),
            uuid: generateUUID(),
            contract_date: new Date().toISOString(),
            id_shop: Math.floor(Math.random() * 10).toString(),
            shop_name: `Shop ${i}`,
            id_customer: Math.floor(Math.random() * 10).toString(),
            customer_name: `Customer ${i}`,
            id_asset: Math.floor(Math.random() * 10).toString(),
            price: contract.price,
            down_payment: contract.down_payment,
            principle: contract.principle,
            ins_amount: 12,
            ins_period: Math.floor(Math.random() * 12) + 1,
            ins_period_unit: 'months',
            ins_due_at: new Date().toISOString(),
            fee: 7,
            paid_date: new Date().toISOString(),
            id_employee: Math.floor(Math.random() * 10).toString(),
            contract_ref_link: `https://example.com/contract/${i}`,
            status: 'active',
            is_active: Math.random() >= 0.2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        });
    }
    return mockData;
};
