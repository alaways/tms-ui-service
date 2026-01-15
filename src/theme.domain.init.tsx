import type { ThemeType } from './theme.init';

const hostname = window.location.hostname;

let override: Partial<ThemeType> = {};

if (hostname.includes('asormoneyphone.com')) {
  override = {
    name: "ASOR MoneyPhone",
    color: {
      themePrimary: "#e41e26",
    },
    link: {
      privacy_url: "https://asormoneyphone.com/privacy-policy",
    },
    logo: {
      AdminLogo: "/assets/images/asor/logo.png",
      BussinessLogo: "/assets/images/asor/logo.png",
      ShopLogo: "/assets/images/asor/logo.png",
      CustomerLogo: "/assets/images/asor/logo.png",
    },
    favicon: "/assets/images/asor/favicon.png",
  };
}

if (hostname.includes('shop-rnp')) {
  override = {
    ...override,
    name: "ราชาเงินผ่อน",
    logo: {
      AdminLogo: "/assets/images/rnp/logo.png",
      BussinessLogo: "/assets/images/rnp/logo.png",
      ShopLogo: "/assets/images/rnp/logo.png",
      CustomerLogo: "/assets/images/rnp/logo.png",
    }
  };
}

export default override;
