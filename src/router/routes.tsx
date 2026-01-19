import React, { lazy } from 'react';
import themeInit from '../theme.init';
import path from 'path';
const Index = lazy(() => import('../pages/Index'));
const Blank = lazy(() => import('../pages/Blank'));
const Dashboard= lazy(() => import('../pages/Apps/Dashboard/Dashboard'))
const DashboardContract = lazy(() => import('../pages/Apps/Dashboard/DashboardContract'))
const DashboardCEOPV = lazy(() => import('../pages/Apps/DashboardCEO/IndexPV'))
const DashboardIncome = lazy(() => import('../pages/Apps/DashboardIncome/DashboardIncome'))
const Analytics = lazy(() => import('../pages/Analytics'));
const Finance = lazy(() => import('../pages/Finance'));
const Crypto = lazy(() => import('../pages/Crypto'));
const Todolist = lazy(() => import('../pages/Apps/Todolist'));
const Mailbox = lazy(() => import('../pages/Apps/Mailbox'));
const Notes = lazy(() => import('../pages/Apps/Notes'));
const Contacts = lazy(() => import('../pages/Apps/Contacts'));
const Chat = lazy(() => import('../pages/Apps/Chat'));
const Scrumboard = lazy(() => import('../pages/Apps/Scrumboard'));
const Calendar = lazy(() => import('../pages/Apps/Calendar'));
const List = lazy(() => import('../pages/Apps/Invoice/List'));
const Preview = lazy(() => import('../pages/Apps/Invoice/Preview'));
const Add = lazy(() => import('../pages/Apps/Invoice/Add'));
const Edit = lazy(() => import('../pages/Apps/Invoice/Edit'));
const Tabs = lazy(() => import('../pages/Components/Tabs'));
const Accordians = lazy(() => import('../pages/Components/Accordians'));
const Modals = lazy(() => import('../pages/Components/Modals'));
const Cards = lazy(() => import('../pages/Components/Cards'));
const Carousel = lazy(() => import('../pages/Components/Carousel'));
const Countdown = lazy(() => import('../pages/Components/Countdown'));
const Counter = lazy(() => import('../pages/Components/Counter'));
const SweetAlert = lazy(() => import('../pages/Components/SweetAlert'));
const Timeline = lazy(() => import('../pages/Components/Timeline'));
const Notification = lazy(() => import('../pages/Components/Notification'));
const MediaObject = lazy(() => import('../pages/Components/MediaObject'));
const ListGroup = lazy(() => import('../pages/Components/ListGroup'));
const PricingTable = lazy(() => import('../pages/Components/PricingTable'));
const LightBox = lazy(() => import('../pages/Components/LightBox'));
const Alerts = lazy(() => import('../pages/Elements/Alerts'));
const Avatar = lazy(() => import('../pages/Elements/Avatar'));
const Badges = lazy(() => import('../pages/Elements/Badges'));
const Breadcrumbs = lazy(() => import('../pages/Elements/Breadcrumbs'));
const Buttons = lazy(() => import('../pages/Elements/Buttons'));
const Buttongroups = lazy(() => import('../pages/Elements/Buttongroups'));
const Colorlibrary = lazy(() => import('../pages/Elements/Colorlibrary'));
const DropdownPage = lazy(() => import('../pages/Elements/DropdownPage'));
const Infobox = lazy(() => import('../pages/Elements/Infobox'));
const Jumbotron = lazy(() => import('../pages/Elements/Jumbotron'));
const Loader = lazy(() => import('../pages/Elements/Loader'));
const Pagination = lazy(() => import('../pages/Elements/Pagination'));
const Popovers = lazy(() => import('../pages/Elements/Popovers'));
const Progressbar = lazy(() => import('../pages/Elements/Progressbar'));
const Search = lazy(() => import('../pages/Elements/Search'));
const Tooltip = lazy(() => import('../pages/Elements/Tooltip'));
const Treeview = lazy(() => import('../pages/Elements/Treeview'));
const Typography = lazy(() => import('../pages/Elements/Typography'));
const Widgets = lazy(() => import('../pages/Widgets'));
const FontIcons = lazy(() => import('../pages/FontIcons'));
const DragAndDrop = lazy(() => import('../pages/DragAndDrop'));
const Tables = lazy(() => import('../pages/Tables'));
const Basic = lazy(() => import('../pages/DataTables/Basic'));
const Advanced = lazy(() => import('../pages/DataTables/Advanced'));
const Skin = lazy(() => import('../pages/DataTables/Skin'));
const OrderSorting = lazy(() => import('../pages/DataTables/OrderSorting'));
const MultiColumn = lazy(() => import('../pages/DataTables/MultiColumn'));
const MultipleTables = lazy(() => import('../pages/DataTables/MultipleTables'));
const AltPagination = lazy(() => import('../pages/DataTables/AltPagination'));
const Checkbox = lazy(() => import('../pages/DataTables/Checkbox'));
const RangeSearch = lazy(() => import('../pages/DataTables/RangeSearch'));
const Export = lazy(() => import('../pages/DataTables/Export'));
const ColumnChooser = lazy(() => import('../pages/DataTables/ColumnChooser'));
const Profile = lazy(() => import('../pages/Users/Profile'));
const AccountSetting = lazy(() => import('../pages/Users/AccountSetting'));
const KnowledgeBase = lazy(() => import('../pages/DefaultPages/KnowledgeBase'));
const ContactUsBoxed = lazy(() => import('../pages/DefaultPages/ContactUsBoxed'));
const ContactUsCover = lazy(() => import('../pages/DefaultPages/ContactUsCover'));
const Faq = lazy(() => import('../pages/DefaultPages/Faq'));
const ComingSoonBoxed = lazy(() => import('../pages/DefaultPages/ComingSoonBoxed'));
const ComingSoonCover = lazy(() => import('../pages/DefaultPages/ComingSoonCover'));
const ERROR404 = lazy(() => import('../pages/DefaultPages/Error404'));
const ERROR500 = lazy(() => import('../pages/DefaultPages/Error500'));
const ERROR503 = lazy(() => import('../pages/DefaultPages/Error503'));
const Maintenence = lazy(() => import('../pages/DefaultPages/Maintenence'));
const LoginBoxed = lazy(() => import('../pages/Authentication/LoginBoxed'));
const RegisterBoxed = lazy(() => import('../pages/Authentication/RegisterBoxed'));
const UnlockBoxed = lazy(() => import('../pages/Authentication/UnlockBox'));
const RecoverIdBoxed = lazy(() => import('../pages/Authentication/RecoverIdBox'));
const LoginCover = lazy(() => import('../pages/Authentication/LoginCover'));
const RegisterCover = lazy(() => import('../pages/Authentication/RegisterCover'));
const RecoverIdCover = lazy(() => import('../pages/Authentication/RecoverIdCover'));
const UnlockCover = lazy(() => import('../pages/Authentication/UnlockCover'));
const About = lazy(() => import('../pages/About'));
const Error = lazy(() => import('../components/Error'));
const Charts = lazy(() => import('../pages/Charts'));
const FormBasic = lazy(() => import('../pages/Forms/Basic'));
const FormInputGroup = lazy(() => import('../pages/Forms/InputGroup'));
const FormLayouts = lazy(() => import('../pages/Forms/Layouts'));
const Validation = lazy(() => import('../pages/Forms/Validation'));
const InputMask = lazy(() => import('../pages/Forms/InputMask'));
const Select2 = lazy(() => import('../pages/Forms/Select2'));
const Touchspin = lazy(() => import('../pages/Forms/TouchSpin'));
const CheckBoxRadio = lazy(() => import('../pages/Forms/CheckboxRadio'));
const Switches = lazy(() => import('../pages/Forms/Switches'));
const Wizards = lazy(() => import('../pages/Forms/Wizards'));
const FileUploadPreview = lazy(() => import('../pages/Forms/FileUploadPreview'));
const QuillEditor = lazy(() => import('../pages/Forms/QuillEditor'));
const MarkDownEditor = lazy(() => import('../pages/Forms/MarkDownEditor'));
const DateRangePicker = lazy(() => import('../pages/Forms/DateRangePicker'));
const Clipboard = lazy(() => import('../pages/Forms/Clipboard'));

// leasing modulesç
const LoginApps = lazy(() => import('../pages/Authentication/Login'));
const LoginShop = lazy(() => import('../pages/Authentication/LoginShop'));
const LoginCustomer = lazy(() => import('../pages/Authentication/LoginCustomer'));
const LoginBusiness = lazy(() => import('../pages/Authentication/LoginBusiness'));

const MenuSystem = lazy(() => import('../pages/Authentication/MenuSystem'));
const RegisterApps = lazy(() => import('../pages/Authentication/Register'));

const ShopList = lazy(() => import('../pages/Apps/Shop/List'));
const ShopAdd = lazy(() => import('../pages/Apps/Shop/Add'));
const ShopEdit = lazy(() => import('../pages/Apps/Shop/Edit'));
const ShopReport = lazy(() => import('../pages/Apps/Shop/Report'));
const ReportEdit = lazy(() => import('../pages/Apps/Shop/ReportEdit'));
const ShopDetail = lazy(() => import('../pages/Apps/Shop/ShopDetail'));
const ReportShop = lazy(() => import('../pages/Apps/Shop/ReportShop'));

const CustomerList = lazy(() => import('../pages/Apps/Customer/List'));
const CustomerAdd = lazy(() => import('../pages/Apps/Customer/AddV2'));
const CustomerAddV2 = lazy(() => import('../pages/Apps/Customer/AddV2'));
const CustomerEdit = lazy(() => import('../pages/Apps/Customer/Edit'));
const CustomerHistoryView = lazy(() => import('../pages/Apps/Customer/HistoryCustomer/Preview'));

const CustomerCredit = lazy(() => import('../pages/Apps/Customer/ListCredit'));
const CustomerCreditPreview = lazy(() => import('../pages/Apps/Customer/CreditCustomer/Preview'))
const CustomerPrescreen = lazy(() => import('../pages/Apps/Customer/Prescreen'))
const CustomerPrescreenAdd = lazy(() => import('../pages/Apps/Customer/AddBySelf'))
const CustomerPrescreenThankyou = lazy(() => import('../pages/Apps/Customer/CustomerPrescreenThankyouPage'))

const CustomerPaymentList = lazy(() => import('../pages/Apps/CustomerPayment/Dashboard'));
const CustomerPaymentInvoice = lazy(() => import('../pages/Apps/CustomerPayment/Invoice'));
const CustomerPaymentPayment = lazy(() => import('../pages/Apps/CustomerPayment/Payment'));
const CustomerPaymentPaymentCC = lazy(() => import('../pages/Apps/CustomerPayment/PaymentCC'));
const CustomerPaymentSuccess = lazy(() => import('../pages/Apps/CustomerPayment/PaymentSuccess'));

const CustomerPaymentInvoiceCC = lazy(() => import('../pages/Apps/CustomerPayment/InvoiceCC'));

const CustomerProfiles = lazy(() => import('../pages/Apps/CustomerPayment/Profile'));
const CustomerCheckLists = lazy(() => import('../pages/Apps/CustomerPayment/CheckList'));

const AssetList = lazy(() => import('../pages/Apps/Asset/List'));
const AssetAdd = lazy(() => import('../pages/Apps/Asset/Add'));
const AssetEdit = lazy(() => import('../pages/Apps/Asset/Edit'));
const AssetShop = lazy(() => import('../pages/Apps/Asset/Shop'));

const AssetTypeList = lazy(() => import('../pages/Apps/AssetType/List'));
const AssetCapacityList = lazy(() => import('../pages/Apps/AssetType/Capacity'));

const ColorModelCapacity = lazy(() => import('../pages/Apps/AssetType/ColorModelCapacity'));
const BusinessUnitList = lazy(() => import('../pages/Apps/BusinessUnit/List'));
const BusinessUnitAdd = lazy(() => import('../pages/Apps/BusinessUnit/Add'));
const BusinessUnitEdit = lazy(() => import('../pages/Apps/BusinessUnit/Edit'));
const BusinessUnitPreview = lazy(() => import('../pages/Apps/BusinessUnit/Preview'));
const BusinessUnitSetting = lazy(() => import('../pages/Apps/BusinessUnit/Setting'));
const InsuranceTypeList = lazy(() => import('../pages/Apps/InsuranceType/List'));
const ShopGroupList = lazy(() => import('../pages/Apps/ShopGroup/List'));
const ShopGroupListBu = lazy(() => import('../pages/Apps/ShopGroup/ListBu'));
const BuInfomation = lazy(() => import('../pages/Apps/BusinessUnit/BuInfomation'));
const InterestRateList = lazy(() => import('../pages/Apps/InterestRate/List'));

const EmployeeList = lazy(() => import('../pages/Apps/Employee/List'));
const EmployeeAdd = lazy(() => import('../pages/Apps/Employee/Add'));
const EmployeeEdit = lazy(() => import('../pages/Apps/Employee/Edit'));
const EmployeePreview = lazy(() => import('../pages/Apps/Employee/Preview'));

const ContractList = lazy(() => import('../pages/Apps/Contract/List'));
const ContractListCredit = lazy(() => import('../pages/Apps/Contract/ListCredit'));
const ContractListRefinance = lazy(() => import('../pages/Apps/Contract/ListRefinance'));
const ContractListCancel = lazy(() => import('../pages/Apps/Contract/ListCancel'));
const SearchContract = lazy(() => import('../pages/Apps/Contract/SearchContract'));
const ContractListComplete = lazy(() => import('../pages/Apps/Contract/ListComplete'));
const ContractListWait = lazy(() => import('../pages/Apps/Contract/ListWait'));

const ContractAddEdit = lazy(() => import('../pages/Apps/Contract/AddEdit'));
const ContractPayment = lazy(() => import('../pages/Apps/Contract/Payment'));
const CloseContract = lazy(() => import('../pages/Apps/Contract/CloseContract'));
const ContractType = lazy(() => import('../pages/Apps/ContractType/List'));

const ContractLeaseList = lazy(() => import('../pages/Apps/ContractLease/List'));
const ContractLeaseListCredit = lazy(() => import('../pages/Apps/ContractLease/ListCredit'));
const ContractLeaseListComplete = lazy(() => import('../pages/Apps/ContractLease/ListComplete'));
const ContractLeaseListCancel = lazy(() => import('../pages/Apps/ContractLease/ListCancel'));
const ContractLeaseListWait = lazy(() => import('../pages/Apps/ContractLease/ListWait'));
const ContractLeaseAddEdit = lazy(() => import('../pages/Apps/ContractLease/AddEdit'));

const ContractSignPreview = lazy(() => import('../pages/Apps/Contract/ContractSignPreview'));
const CustomerSignaturePage = lazy(() => import('../pages/Apps/Contract/CustomerSignaturePage'));
const CustomerErrorPage = lazy(() => import('../pages/Apps/Contract/CustomerErrorPage'));
const CustomerThankyouPage = lazy(() => import('../pages/Apps/Contract/CustomerThankyouPage'));
const ConfigInfo = lazy(() => import('../pages/Apps/ConfigInfo'));
const ContractAddReceiveProduct = lazy(() => import('../pages/Apps/Contract/ReceiveProduct/Add'))

const PayToShop = lazy(() => import('../pages/Apps/Report/PayToShop'));
const AccountCreditor = lazy(() => import('../pages/Apps/Report/AccountCreditor'));
const AccountCreditDetail = lazy(() => import('../pages/Apps/Report/AccountCreditDetail'));
const PaymentForm = lazy(() => import('../pages/Apps/Report/FormPayToShop'));
const ShopReportPV = lazy(() => import('../pages/Apps/Report/ShopReportPV'));
const FormPayToShopPreview = lazy(() => import('../pages/Apps/Report/FormPayToShopPreview'));

const Notifications = lazy(() => import('../pages/Apps/Notifications/List'));
const FinanceInvoice = lazy(() => import('../pages/Apps/Finance/Invoice'));

const FinancePaymentByAdmin = lazy(() => import('../pages/Apps/Finance/Payment/Admin'));
const FinanceTransferByAdmin = lazy(() => import('../pages/Apps/Finance/Transfer/List'));
const FinanceTransferAdd = lazy(() => import('../pages/Apps/Finance/Transfer/Add'));
const FinanceTransferView = lazy(() => import('../pages/Apps/Finance/Transfer/View'));

// const FinancePaymentByBusinessUnit = lazy(() => import('../pages/Apps/Finance/Payment/BusinessUnit'));

const AnnounceList = lazy(() => import('../pages/Apps/Announce/List'))

const MaintenenceApps = lazy(() => import('../pages/Apps/Maintenence'));
const SettingPaymentSystem = lazy(() => import('../pages/Apps/SettingPaymentSystem'));
const TestPaymentCallBack = lazy(() => import('../pages/Apps/TestPaymentCallBack'));

const CameraServices = lazy(() => import('../pages/Apps/Services/Camera'))

const PermissionCheck = lazy(() => import('../pages/Apps/Permission/Check'))
const PermissionRole = lazy(() => import('../pages/Apps/Permission/Role'))
const PermissionUser = lazy(() => import('../pages/Apps/Permission/User'))

const MODE = process.env.MODE;

//  PV
const PayToShopPv = lazy(() => import('../pages/Apps/Report/PayToShopPv'));

let routePermissions;

if (MODE) {
    const loginComponents: any = {
        admin: LoginApps,
        shop: LoginShop,
        business_unit: LoginBusiness,
        customer: LoginCustomer,
    };
    routePermissions = [
        {
            path: '/apps/login',
            element: MODE in loginComponents ? React.createElement(loginComponents[MODE]) : <LoginCustomer />,
            layout: 'blank',
        },
    ];
} else {
    routePermissions = [
        { path: '/apps/customer-login', element: <LoginCustomer />, layout: 'blank' },
        { path: '/apps/login', element: <LoginApps />, layout: 'blank' },
        { path: '/apps/shop-login', element: <LoginShop />, layout: 'blank' },
        { path: '/apps/business-login', element: <LoginBusiness />, layout: 'blank' },
    ];
}

const leasingRoutes = [
    ...routePermissions,
    { path: '/apps/register', element: <RegisterApps />, layout: 'blank' },
    { path: '/apps/shop/list', element: <ShopList /> },
    { path: '/apps/shop/add', element: <ShopAdd /> },
    { path: '/apps/shop/edit/:id?', element: <ShopEdit /> },
    { path: '/apps/shop/preview', element: <ShopEdit /> },
    { path: '/apps/shop/report/:id?', element: <ShopReport /> },

    { path: '/apps/shop/detail', element: <ShopDetail /> },
    { path: '/apps/shop/report-customer', element: <ReportShop /> },
    { path: '/apps/customer/list', element: <CustomerList /> },
    { path: '/apps/customer/add', element: <CustomerAdd /> },
    { path: '/apps/customer/add-v2', element: <CustomerAddV2 /> },
    { path: '/apps/customer/edit/:id?', element: <CustomerEdit /> },
    { path: '/apps/customer/history/:uuid/:id', element: <CustomerHistoryView /> },
    { path: '/apps/customer/credit/:id?', element: <CustomerCredit /> },
    { path: '/apps/customer/credit-level/:id', element: <CustomerCreditPreview /> },
    { path: '/apps/customer/pre-screen/:id', element: <CustomerPrescreen /> ,layout:"blank"},
    { path: '/apps/customer/pre-screen/:id/step-2', element: <CustomerPrescreenAdd /> ,layout:"blank"},
    { path: '/apps/customer/pre-screen/thankyou', element: <CustomerPrescreenThankyou /> ,layout:"blank"},

    { path: '/apps/asset/list', element: <AssetList /> },
    { path: '/apps/asset/add', element: <AssetAdd /> },
    { path: '/apps/asset/view/:id?/:shop_id?', element: <AssetEdit /> },
    { path: '/apps/asset/edit/:id?/:shop_id?', element: <AssetEdit /> },
    { path: '/apps/asset/shop', element: <AssetShop /> },
    { path: '/apps/asset-type/list', element: <AssetTypeList /> },
    { path: '/apps/asset-capacity', element: <AssetCapacityList /> },
    { path: '/apps/business-unit/list', element: <BusinessUnitList /> },
    { path: '/apps/business-unit/add', element: <BusinessUnitAdd /> },
    { path: '/apps/business-unit/edit/:id?', element: <BusinessUnitEdit /> },
    { path: '/apps/business-unit/preview/:id?', element: <BusinessUnitPreview /> },
    { path: '/apps/business-unit/setting/:id?', element: <BusinessUnitSetting /> },
    { path: '/apps/color-model-capacity/list/:id?/:type_name?', element: <ColorModelCapacity /> },
    { path: '/apps/insurance-type/list', element: <InsuranceTypeList /> },
    { path: '/apps/interest-rate/list', element: <InterestRateList /> },
    { path: '/apps/shop-group/list', element: <ShopGroupList /> },
    { path: '/apps/shop-group/list-bu/:buid?/:id?', element: <ShopGroupListBu /> },
    { path: '/apps/shop-group/shop-bu-interestrate/:id?', element: <BuInfomation /> },
    { path: '/apps/employee/list', element: <EmployeeList /> },
    { path: '/apps/employee/add', element: <EmployeeAdd /> },
    { path: '/apps/employee/edit/:id?', element: <EmployeeEdit /> },
    { path: '/apps/employee/preview/:id?', element: <EmployeePreview /> },
    { path: '/apps/contract/list', element: <ContractList /> },
    { path: '/apps/contract/list-credit', element: <ContractListCredit /> },
    { path: '/apps/contract/list-cancel', element: <ContractListCancel /> },
    { path: '/apps/contract/search', element: <SearchContract /> },
    { path: '/apps/contract/list-complete', element: <ContractListComplete /> },
    { path: '/apps/contract/list-wait', element: <ContractListWait /> },
    { path: '/apps/contract/:id?/:uuid?', element: <ContractAddEdit /> },
    { path: '/apps/contract/payment/:ctid?/:uuid?/:inid?', element: <ContractPayment /> },
    { path: '/apps/contract/close-contract/:ctid?/:uuid?', element: <CloseContract /> },
    { path: '/apps/contract/receive-product/:id', element: <ContractAddReceiveProduct /> ,layout:"blank"},

    { path: '/apps/contract-lease/list', element: <ContractLeaseList /> },
    { path: '/apps/contract-lease/list-credit', element: <ContractLeaseListCredit /> },
    { path: '/apps/contract-lease/list-cancel', element: <ContractLeaseListCancel /> },
    { path: '/apps/contract-lease/list-complete', element: <ContractLeaseListComplete /> },
    { path: '/apps/contract-lease/list-wait', element: <ContractLeaseListWait /> },
    { path: '/apps/contract-lease/:id?/:uuid?', element: <ContractLeaseAddEdit /> },
    
    { path: '/apps/contract/signature-preview/:uuid?', element: <ContractSignPreview /> },
    { path: '/apps/contract-type/list', element: <ContractType /> },
    { path: '/apps/finance/invoice', element: <FinanceInvoice /> },
    { path: '/apps/finance/payment/business-unit', element: <FinancePaymentByAdmin /> },
    { path: '/apps/finance/payment-history', element: <FinancePaymentByAdmin /> },
    ...( themeInit.features?.payment_transfer ? [{ path: '/apps/finance/transfer-history', element: <FinanceTransferByAdmin /> }] : []),
    ...( themeInit.features?.payment_transfer ? [{ path: '/apps/finance/transfer/add', element: <FinanceTransferAdd /> }] : []),
    ...( themeInit.features?.payment_transfer ? [{ path: '/apps/finance/transfer/view/:id', element: <FinanceTransferView /> }] : []),
    ...( themeInit.features?.payment_transfer ? [{ path: '/apps/contract/list-refinance', element: <ContractListRefinance /> }] : []),
    { path: '/apps/customer-payment/success', element: <CustomerPaymentSuccess />, layout: 'customer' },
    { path: '/apps/customer-payment/payment', element: <CustomerPaymentPayment />, layout: 'customer' },
    { path: '/apps/customer-payment/payment-cc/:id', element: <CustomerPaymentPaymentCC />, layout: 'customer' },
    { path: '/apps/customer-payment/invoice', element: <CustomerPaymentInvoice />, layout: 'customer' },
    { path: '/apps/customer-payment/invoice-cc/:id', element: <CustomerPaymentInvoiceCC />, layout: 'customer' },
    { path: '/apps/customer-payment/list', element: <CustomerPaymentList />, layout: 'customer' },
    { path: '/apps/customer-payment/profile', element: <CustomerProfiles />, layout: 'customer' },
    { path: '/apps/customer-payment/checklist', element: <CustomerCheckLists />, layout: 'customer' },
    { path: '/apps/report/pay-to-shop', element: <PayToShop /> },
    { path: '/apps/report/account-creditor', element: <AccountCreditor /> },
    { path: '/apps/report/account-creditor/detail/:id', element: <AccountCreditDetail /> },
    { path: '/apps/report/form-payment/:id', element: <PaymentForm /> },
    { path: '/apps/report/form-payment/preview/:id', element: <FormPayToShopPreview /> },

    { path: '/apps/setting-payment-system', element: <SettingPaymentSystem /> },
    { path: '/apps/test-callback', element: <TestPaymentCallBack /> },
    { path: '/notifications', element: <Notifications /> },

    // test page
    { path: '/apps/report/pay-to-shop-pv', element: <PayToShopPv /> },
    { path: '/apps/report/pay-to-shop-pv/shop/:id', element: <ShopReportPV /> },
    { path: '/apps/report/pay-to-shop-pv/edit/:id?', element: <ReportEdit /> },

    { path: '/apps/announce/list', element: <AnnounceList /> },
    { path: '/apps/services/camera', element: <CameraServices />, layout: 'blank' },

    { path: '/apps/permission/check', element: <PermissionCheck /> },
    { path: '/apps/permission/role', element: <PermissionRole /> },
    { path: '/apps/permission/user', element: <PermissionUser /> },

];

const routes = [
    {
        path: '/contract/signature/:signature_uuid',
        element: <CustomerSignaturePage />,
        layout: 'blank',
    },
    {
        path: '/customer/thankyou',
        element: <CustomerThankyouPage />,
        layout: 'blank',
    },
    {
        path: '/customer/timeout',
        element: <CustomerErrorPage />,
        layout: 'blank',
    },
    ...leasingRoutes,
    // dashboard
    { path: '/', element: <Index /> },
    { path: '/blank', element: <Blank/>},
    { path: '/apps/maintenence', element: <MaintenenceApps />, layout: 'blank' },
    { path: '/menu', element: <MenuSystem />, layout: 'blank' },
    { path: '/dashboard' ,element : <Dashboard/>},
    { path: '/dashboard-v2' ,element : <DashboardContract/>},
    { path: '/dashboard-ceo-pv', element: <DashboardCEOPV /> },
    { path: '/dashboard-ceo-income', element: <DashboardIncome /> },
    // analytics page
    { path: '/analytics', element: <Analytics /> },
    // finance page
    { path: '/finance', element: <Finance /> },
    // crypto page
    { path: '/crypto', element: <Crypto /> },
    { path: '/apps/todolist', element: <Todolist /> },
    { path: '/apps/notes', element: <Notes /> },
    { path: '/apps/contacts', element: <Contacts /> },
    { path: '/apps/mailbox', element: <Mailbox /> },
    { path: '/apps/invoice/list', element: <List /> },
    // Apps page
    { path: '/apps/chat', element: <Chat /> },
    { path: '/apps/scrumboard', element: <Scrumboard /> },
    { path: '/apps/calendar', element: <Calendar /> },
    // preview page
    { path: '/apps/invoice/preview', element: <Preview /> },
    { path: '/apps/invoice/add', element: <Add /> },
    { path: '/apps/invoice/edit', element: <Edit /> },

    //ข้างล่างเป็น template website
    // components page
    { path: '/components/tabs', element: <Tabs /> },
    { path: '/components/accordions', element: <Accordians /> },
    { path: '/components/modals', element: <Modals /> },
    { path: '/components/cards', element: <Cards /> },
    { path: '/components/carousel', element: <Carousel /> },
    { path: '/components/countdown', element: <Countdown /> },
    { path: '/components/counter', element: <Counter /> },
    { path: '/components/sweetalert', element: <SweetAlert /> },
    { path: '/components/timeline', element: <Timeline /> },
    { path: '/components/notifications', element: <Notification /> },
    { path: '/components/media-object', element: <MediaObject /> },
    { path: '/components/list-group', element: <ListGroup /> },
    { path: '/components/pricing-table', element: <PricingTable /> },
    { path: '/components/lightbox', element: <LightBox /> },
    // elements page
    { path: '/elements/alerts', element: <Alerts /> },
    { path: '/elements/avatar', element: <Avatar /> },
    { path: '/elements/badges', element: <Badges /> },
    { path: '/elements/breadcrumbs', element: <Breadcrumbs /> },
    { path: '/elements/buttons', element: <Buttons /> },
    { path: '/elements/buttons-group', element: <Buttongroups /> },
    { path: '/elements/color-library', element: <Colorlibrary /> },
    { path: '/elements/dropdown', element: <DropdownPage /> },
    { path: '/elements/infobox', element: <Infobox /> },
    { path: '/elements/jumbotron', element: <Jumbotron /> },
    { path: '/elements/loader', element: <Loader /> },
    { path: '/elements/pagination', element: <Pagination /> },
    { path: '/elements/popovers', element: <Popovers /> },
    { path: '/elements/progress-bar', element: <Progressbar /> },
    { path: '/elements/search', element: <Search /> },
    { path: '/elements/tooltips', element: <Tooltip /> },
    { path: '/elements/treeview', element: <Treeview /> },
    { path: '/elements/typography', element: <Typography /> },
    // charts page
    { path: '/charts', element: <Charts /> },
    // widgets page
    { path: '/widgets', element: <Widgets /> },
    //  font-icons page
    { path: '/font-icons', element: <FontIcons /> },
    //  Drag And Drop page
    { path: '/dragndrop', element: <DragAndDrop /> },
    //  Tables page
    { path: '/tables', element: <Tables /> },
    // Data Tables
    { path: '/datatables/basic', element: <Basic /> },
    { path: '/datatables/advanced', element: <Advanced /> },
    { path: '/datatables/skin', element: <Skin /> },
    { path: '/datatables/order-sorting', element: <OrderSorting /> },
    { path: '/datatables/multi-column', element: <MultiColumn /> },
    { path: '/datatables/multiple-tables', element: <MultipleTables /> },
    { path: '/datatables/alt-pagination', element: <AltPagination /> },
    { path: '/datatables/checkbox', element: <Checkbox /> },
    { path: '/datatables/range-search', element: <RangeSearch /> },
    { path: '/datatables/export', element: <Export /> },
    { path: '/datatables/column-chooser', element: <ColumnChooser /> },
    // Users page
    { path: '/users/profile', element: <Profile /> },
    { path: '/users/user-account-settings', element: <AccountSetting /> },
    // pages
    { path: '/pages/knowledge-base', element: <KnowledgeBase /> },
    { path: '/pages/contact-us-boxed', element: <ContactUsBoxed />, layout: 'blank' },
    { path: '/pages/contact-us-cover', element: <ContactUsCover />, layout: 'blank' },
    { path: '/pages/faq', element: <Faq /> },
    { path: '/pages/coming-soon-boxed', element: <ComingSoonBoxed />, layout: 'blank' },
    { path: '/pages/coming-soon-cover', element: <ComingSoonCover />, layout: 'blank' },
    { path: '/pages/error404', element: <ERROR404 />, layout: 'blank' },
    { path: '/pages/error500', element: <ERROR500 />, layout: 'blank' },
    { path: '/pages/error503', element: <ERROR503 />, layout: 'blank' },
    { path: '/pages/maintenence', element: <Maintenence />, layout: 'blank' },
    // Authentication
    { path: '/auth/boxed-signin', element: <LoginBoxed />, layout: 'blank' },
    { path: '/auth/boxed-signup', element: <RegisterBoxed />, layout: 'blank' },
    { path: '/auth/boxed-lockscreen', element: <UnlockBoxed />, layout: 'blank' },
    { path: '/auth/boxed-password-reset', element: <RecoverIdBoxed />, layout: 'blank' },
    { path: '/auth/cover-login', element: <LoginCover />, layout: 'blank' },
    { path: '/auth/cover-register', element: <RegisterCover />, layout: 'blank' },
    { path: '/auth/cover-lockscreen', element: <UnlockCover />, layout: 'blank' },
    { path: '/auth/cover-password-reset', element: <RecoverIdCover />, layout: 'blank' },
    // forms page
    { path: '/forms/basic', element: <FormBasic /> },
    { path: '/forms/input-group', element: <FormInputGroup /> },
    { path: '/forms/layouts', element: <FormLayouts /> },
    { path: '/forms/validation', element: <Validation /> },
    { path: '/forms/input-mask', element: <InputMask /> },
    { path: '/forms/select2', element: <Select2 /> },
    { path: '/forms/touchspin', element: <Touchspin /> },
    { path: '/forms/checkbox-radio', element: <CheckBoxRadio /> },
    { path: '/forms/switches', element: <Switches /> },
    { path: '/forms/wizards', element: <Wizards /> },
    { path: '/forms/file-upload', element: <FileUploadPreview /> },
    { path: '/forms/quill-editor', element: <QuillEditor /> },
    { path: '/forms/markdown-editor', element: <MarkDownEditor /> },
    { path: '/forms/date-picker', element: <DateRangePicker /> },
    { path: '/forms/clipboard', element: <Clipboard /> },
    { path: '/about', element: <About />, layout: 'blank' },
    { path: '/web-info', element: <ConfigInfo />, layout: 'blank' },
    { path: '*', element: <Error />, layout: 'blank' },
];

export { routes };
