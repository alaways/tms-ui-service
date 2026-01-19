import { useDispatch, useSelector } from 'react-redux';
import domainOverride from './theme.domain.init';

export type ThemeType = {
  name: string;
  color: {
    themePrimary: string;
  };
  link: {
    privacy_url: string;
  };
  // features: {
  //   contract_appr_restart: boolean, // EXAMPLE : IND0000025 // สัญญาที่อนุมัติแล้ว กลับไปร่างสัญญา 
  //   contract_issuer: boolean,
  //   payment_transfer: boolean,
  //   contract_refinance: boolean,
  //   signature_online: boolean,
  //   shop_user:boolean,
  //   singature_rc_shop:boolean,
  // },
  features:any;
  paymentGateway: {
    tqr: boolean;
    ps: boolean;
  };
  logo: {
    AdminLogo: string;
    BussinessLogo: string;
    ShopLogo: string;
    CustomerLogo: string;
  };
  favicon: string;
};

// Default Theme
const defaultTheme: ThemeType = {
  name: "TPLUS Leasing",
  color: {
    themePrimary: "#f15a00",
  },
  link: {
    privacy_url: "https://tplus.co.th/privacy-policy",
  },
  features : {
    contract_appr_restart: false, // ปิดใช้งานก่อน
    contract_issuer: false,  // ไม่ได้ใช้ใน TMS
    payment_transfer: false,
    contract_refinance: false,  // ปิดใช้งานก่อน
    signature_online: true,
    singature_rc_shop:true,
    commission_type:true,
    pdf_pay:true, 
    pdf_receipts:true,
    pdf_close:true,
    pdf_return:true,
    customer_close_contract:true,
    e_sign_status:true,
    permissions: false, // ปิดบน prod
  },
  
  paymentGateway: {
    tqr: true,
    ps: true,
  },
  logo: {
    AdminLogo: "/assets/images/AdminLogo.png",
    BussinessLogo: "/assets/images/BussinesLogo.png",
    ShopLogo: "/assets/images/ShopLogo.png",
    CustomerLogo: "/assets/images/CustomerLogo.png",
  },
  favicon: '/assets/images/favicon.png'
};

// Deep merge function
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key in source) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (
      typeof sourceVal === 'object' &&
      sourceVal !== null &&
      !Array.isArray(sourceVal)
    ) {
      result[key] = deepMerge(
        targetVal as any,
        sourceVal as any
      );
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as any;
    }
  }

  return result;
}
// Merge override with default
const themeInit: ThemeType = deepMerge(defaultTheme, domainOverride);

// Apply to HTML
document.documentElement.style.setProperty('--theme-primary', themeInit.color.themePrimary);
const search = window.location.search.replace(/\?/g, '&').replace('&', '?');
const params = new URLSearchParams(search);
const NotBusiness = ['ASO','SGL']

if(!NotBusiness.find((item:any) => params.get('business_unit') == item)){
  setFavicon(themeInit.favicon);
}

function setFavicon(url: string) {
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;

  let link2: HTMLLinkElement | null = document.querySelector("link[rel~='apple-touch-icon']");
  if (!link2) {
    link2 = document.createElement("link");
    link2.rel = "apple-touch-icon";
    document.head.appendChild(link2);
  }
  link2.href = url;
  
}

export default themeInit;
