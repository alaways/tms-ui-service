import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useCallback, Fragment } from 'react'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { url_api } from '../../../services/endpoints'
import { NUMBER_REGEX } from '../../../helpers/regex'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { formatBankAccountNumber } from '../../../helpers/formatNumeric'
import { toastAlert } from '../../../helpers/constant'
import { useBusinessUnitFindMutation } from '../../../services/mutations/useBusinessUnitMutation'
import { Form, Formik } from 'formik'
import { Tab, Dialog, Transition } from '@headlessui/react'
import Tippy from '@tippyjs/react'
import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'
import IconX from '../../../components/Icon/IconX'
import IconEdit from '../../../components/Icon/IconEdit'
import IconTrashLines from '../../../components/Icon/IconTrashLines'
import IconPlus from '../../../components/Icon/IconPlus'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import { DataTable } from 'mantine-datatable'
import { PAGE_SIZES } from '../../../helpers/config'
import { convertDateDbToClient } from '../../../helpers/formatDate'
import PreLoading from '../../../helpers/preLoading'
import themeInit from '../../../theme.init'
import IconRefresh from '../../../components/Icon/IconRefresh'

const defaultBankForm = {
  id_bank: '',
  id_business_unit: '',
  bank_account_name: '',
  bank_account_number: '',
  is_main_account: false,
}

const defaultForm = {
  id_business_unit: '',
  id_shop_group: '',
  id_interest_rate: '',
  commission: '',
  commission_type:1,
  signature_online:false,
  signature_online_type:'',
  benefit: '',
  penalty_fee: '',
  fee: '',
  tracking_fee: '',
  unlock_fee: '',
  condition_contract: '',
  flow_account_token: '',
  paysolution_key: '',
  paysolution_mercantid: '',
  prefix_contract: '',
  paysolution_secret_key: '',
  paysolution_token: '',
  payment_late_period: '',
  payment_late_period_lvl_1:'',
  payment_late_period_lvl_2:'',
  payment_late_period_lvl_3:'',
  //payment_late_period_lvl_4:'', // ไม่ใช้งาน lvl4
  payment_late_period_lvl_5:'',
  locked_period: '',
  ln_pre_due_day: '',
  ln_after_due_day: '',
  ln_enabled: '',
  ln_pre_due_day_txt: '',
  ln_due_day_txt: '',
  ln_after_due_day_txt: '',
  ln_late_day_txt: '',
  ln_time_notify: '',
}

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const Edit = () => {

  const { id } = useParams()

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const storedUser = localStorage.getItem(mode)
  const user = storedUser ? JSON.parse(storedUser) : null

  const role = user ? user?.role : null
  let id_bu = Number(id)
  if(role == "business_unit") {
    id_bu = user?.id_business_unit
  }
  const [tab, setTab] = useState<string>('contract')

  const [bankList, setBankList] = useState<any>([])
  const [masterDataBankList, setMasterDataBankList] = useState<any>([])

  const [shopFormData, setShopFormData] = useState<any>(defaultForm)

  const [actionModal, setActionModal] = useState(false)
  const [actionModal2, setActionModal2] = useState(false)
  const [actionModalLine, setActionModalLine] = useState<boolean>(false)

  const [bankFormData, setBankFormData] = useState<any>(defaultBankForm)

  //providerState

  const defaultProviderForm = {
    id: null,
    id_business_unit:id_bu,
    title: '',
    id_asset_type: '',
    service_provider: "",
    username: "",
    password: "",
    role: "",
    token: "",
    lock_content: "",
    lock_footer: "",
    lock_phone: "",
    unlock_content_noti: "",
    is_active: true,
    is_login:true
  }

  const defaultLineSettingForm = {
    id: null,
    day: '',
    message: '',
    title: '',
    //footer: '',
    is_active: true
  }

  const [providerList, setProviderList] = useState([])
  const [providerForm, setProviderForm] = useState(defaultProviderForm)
  const [prevPageSize, setPrevPageSize] = useState(1)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [assetType, setAssetType] = useState<any>([])
  const [serviceProvider, setServiceProvider] = useState<any>([])
  const [lineSettingList, setLineSettingList] = useState<any>([])
  const [lineSettingForm, setLineSettingForm] = useState(defaultLineSettingForm)

  const { mutate: fetchBusinessUnitFindData, isLoading: isBusinessUnitFindLoading } = useBusinessUnitFindMutation({
    onSuccess: (res) => {
      const setFormValue = res.data
      setShopFormData({
        ...shopFormData,
        commission: setFormValue?.commission || 0,
        commission_type: setFormValue?.commission_type|| 0,
        benefit: setFormValue?.benefit || 0,
        penalty_fee: setFormValue?.penalty_fee || 0,
        penalty_fee_limit: setFormValue?.penalty_fee_limit || 0,
        fee: setFormValue?.fee || 0,
        tracking_fee: setFormValue?.tracking_fee || 0,
        unlock_fee: setFormValue?.unlock_fee || 0,
        condition_contract: setFormValue?.condition_contract || '',
        flow_account_token: setFormValue?.flow_account_token || '',
        paysolution_key: setFormValue?.paysolution_key || '',
        paysolution_mercantid: setFormValue?.paysolution_mercantid || '',
        prefix_contract: setFormValue?.prefix_contract || '',
        paysolution_secret_key: setFormValue?.paysolution_secret_key || '',
        paysolution_token: setFormValue?.paysolution_token || '',
        flowaccount_client_id: setFormValue?.flowaccount_client_id || '',
        flowaccount_client_secret: setFormValue?.flowaccount_client_secret || '',
        pdf_watermark: setFormValue?.pdf_watermark || '',
        hide_content_days:setFormValue?.hide_content_days || 0,
        is_opened: setFormValue?.is_opened || false,
        payment_late_period: setFormValue?.payment_late_period || 0,
        payment_late_period_lvl_1: setFormValue?.payment_late_period_lvl_1 || '',
        payment_late_period_lvl_2: setFormValue?.payment_late_period_lvl_2 || '',
        payment_late_period_lvl_3: setFormValue?.payment_late_period_lvl_3 || '',
        //payment_late_period_lvl_4: setFormValue?.payment_late_period_lvl_4 || '',
        payment_late_period_lvl_5: setFormValue?.payment_late_period_lvl_5 || '',
        locked_period: setFormValue?.locked_period || 0,
        line_qa_id: setFormValue.line_qa_id || '',
        ln_pre_due_day: setFormValue.ln_pre_due_day || 0,
        ln_after_due_day: setFormValue.ln_after_due_day || 0,
        ln_enabled: setFormValue.ln_enabled || false,
        ln_pre_due_day_txt: setFormValue.ln_pre_due_day_txt || '',
        ln_due_day_txt: setFormValue.ln_due_day_txt || '',
        ln_after_due_day_txt: setFormValue.ln_after_due_day_txt || '',
        ln_late_day_txt: setFormValue.ln_late_day_txt || '',
        ln_time_notify: setFormValue.ln_time_notify || '',

        tqr_biller_id:setFormValue.tqr_biller_id,
        tqr_merchant_name:setFormValue.tqr_merchant_name,
        // tqr_user:setFormValue.tqr_user,
        // tqr_password:setFormValue.tqr_password,
        // tqr_customer_key:setFormValue.tqr_customer_key,
        // tqr_customer_secret:setFormValue.tqr_customer_secret,
        tqr_company_name:setFormValue.tqr_company_name,
        tqr_company_name_en:setFormValue.tqr_company_name_en,
        payment_qr_method:setFormValue.payment_qr_method,
        pdf_contract_templete:setFormValue?.pdf_contract_templete,

        cbd_condition:setFormValue?.cbd_condition,
        cbd_discount_1:setFormValue?.cbd_discount_1,
        cbd_discount_2:setFormValue?.cbd_discount_2,
        cbd_discount_3:setFormValue?.cbd_discount_3,

        is_login:setFormValue?.is_login,
        signature_online:setFormValue?.signature_online,
        signature_online_type: setFormValue?.signature_online_type,
        line_token: setFormValue?.line_token,
        line_secret: setFormValue?.line_secret
      })
    },
    onError: (err) => { },
  })

  const { mutate: buUpdateConfig } = useGlobalMutation(url_api.buUpdateConfig, {
     onSuccess: (res:any) => {
       if (res.statusCode !== 400) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        });
        location.reload()
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        });
      }
    },
    onError: (err:any) => {
      const toast = Swal.mixin(toastAlert)
      toast.fire({
        icon: 'error',
        title: err.message,
        padding: '10px 20px',
      })
    },
  })

  const { mutate: lineBoardCastOne , isLoading:boardcastLoading } = useGlobalMutation(url_api.lineBoardCastOne, {
    onSuccess(res:any) {
        if (res.statusCode !== 400) {
          toast.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            padding: '10px 20px',
          });

        } else {
          toast.fire({
            icon: 'error',
            title: res.message,
            padding: '10px 20px',
          });
        }
      },
      onError: (err:any) => {
        const toast = Swal.mixin(toastAlert)
        toast.fire({
          icon: 'error',
          title: err.message,
          padding: '10px 20px',
        })
      },
  })

  const { mutate: buUpdateLineConfig } = useGlobalMutation(url_api.buUpdateLineConfig, {
    onSuccess(res:any) {
        if (res.statusCode !== 400) {
          toast.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            padding: '10px 20px',
          });
          location.reload()
        } else {
          toast.fire({
            icon: 'error',
            title: res.message,
            padding: '10px 20px',
          });
        }
      },
      onError: (err:any) => {
        const toast = Swal.mixin(toastAlert)
        toast.fire({
          icon: 'error',
          title: err.message,
          padding: '10px 20px',
        })
      },
  })

  const { mutate: buNofiyFindAll } = useGlobalMutation(url_api.buNofiyFindAll, {
    onSuccess: (res:any) => {
      if (res.code == 200 && res.statusCode == 200) {
        setLineSettingList(res.data)
      }
    },
  })

  const { mutate: buNotifyCreate } = useGlobalMutation(url_api.buNotifyCreate, {
     onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'เพิ่มสำเร็จ',
          padding: '10px 20px',
        })
        buNofiyFindAll({
          data: {
            id_business_unit: Number(id),
          },
        })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
})

const { mutate: buNotifyUpdate } = useGlobalMutation(url_api.buNotifyUpdate, {
     onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ',
          padding: '10px 20px',
        })
        buNofiyFindAll({
          data: {
            id_business_unit: Number(id),
          },
        })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: bankFindAll } = useGlobalMutation(url_api.bankFindAll, {
    onSuccess: (res: any) => {
      setMasterDataBankList(
        res.data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      )
    },
  })


  useEffect(() => {
    buNofiyFindAll({ data: { id_business_unit: Number(id) } })
  }, [])

  const { mutate: BuAddBank } = useGlobalMutation(url_api.buAddBank, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'เพิ่มสำเร็จ',
          padding: '10px 20px',
        })
        fetchBuDataBank({
          data: {
            id_business_unit: id_bu,
          },
        })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: BuUpdateBank } = useGlobalMutation(url_api.buUpdateBank, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ',
          padding: '10px 20px',
        })
        fetchBuDataBank({
          data: {
            id_business_unit: id_bu,
          },
        })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: fetchBuDataBank } = useGlobalMutation(url_api.buGetBankList, {
    onSuccess: (res: any) => {
      const setFormValue = res.data
      setBankList(setFormValue ?? [])
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  const { mutate: DeleteBank } = useGlobalMutation(url_api.buDelBank, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          padding: '10px 20px',
        })
        fetchBuDataBank({
          data: {
            id_business_unit: id_bu,
          },
        })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const SubmittedForm1 = Yup.object().shape({
    commission: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'Commission ต้องอยู่ระหว่าง 0 ถึง 100').max(100, 'Commission ต้องอยู่ระหว่าง 0 ถึง 100'),
    benefit: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าผลตอบแทน ต้องมากกว่า 0'),
    penalty_fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าดำเนินการล่าช้า ต้องมากกว่า 0'),
    fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าธรรมเนียม ต้องมากกว่า 0'),
    tracking_fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าธรรมเนียมการติดตาม ต้องมากกว่า 0'),
    unlock_fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ค่าธรรมเนียมปลดล็อค 0'),
    condition_contract: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    payment_late_period_lvl_1: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    payment_late_period_lvl_2: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    payment_late_period_lvl_3: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    //payment_late_period_lvl_4: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    payment_late_period_lvl_5: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const SubmittedPayment = Yup.object().shape({
    ...(mode === 'business_unit' ? {} : { })
  })

    const SubmittedAdv = Yup.object().shape({
      hide_content_days: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ต้องมากกว่า 0'),
      cbd_condition: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(4, 'ต้องมากกว่า 3'),
      cbd_discount_1: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ต้องมากกว่าหรือเท่ากับ 0'),
      cbd_discount_2: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ต้องมากกว่าหรือเท่ากับ 0'),
      cbd_discount_3: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ').min(0, 'ต้องมากกว่าหรือเท่ากับ 0'),
   }
)

  const SubmittedBankForm = Yup.object().shape({
    bank_account_name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_bank: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    bank_account_number: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').matches(NUMBER_REGEX, 'ใส่ได้เฉพาะตัวเลข'),
    is_main_account: Yup.boolean().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const SubmittedFormLine = Yup.object().shape({
    line_qa_id: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  })
  const SubmittedTableLine = Yup.object().shape({
    day: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    message: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    title: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    //footer: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const submitBankForm = useCallback(
    (event: any) => {
      if (event?.id) {
        BuUpdateBank({
          data: {
            id: event.id,
            id_bank: event.id_bank,
            id_business_unit: id_bu,
            bank_account_name: event.bank_account_name,
            bank_account_number: event.bank_account_number,
            is_active: true,
          },
        })
      } else {
        BuAddBank({
          data: {
            id_bank: event.id_bank,
            id_business_unit: id_bu,
            bank_account_name: event.bank_account_name,
            bank_account_number: event.bank_account_number,
            is_active: true,
          },
        })
      }
      setActionModal(false)
    },
    [BuUpdateBank, BuAddBank]
  )

  const submitLineForm = useCallback(
    (values: any) => {
      const data = {
        ...values,
        ln_pre_due_day: +values.ln_pre_due_day,
        ln_after_due_day: +values.ln_after_due_day,
        is_active: true
      }
      buUpdateLineConfig({ data: { ...data },id: id_bu })
    }, [buUpdateLineConfig]
  )

  const submitTableLine = useCallback(
    async (values: any) => {
      const params = { ...values, id_business_unit: Number(id), day: +values.day }
      if (lineSettingForm.id) {
        await buNotifyUpdate({ data: params })
      } else {
        await buNotifyCreate({ data: params })
      }
      setActionModalLine(false)
    }, [buNotifyCreate,buNotifyUpdate,lineSettingForm]
  )

  const editLineNotify = (
    (values: any) => {
      setActionModalLine(true)
      setLineSettingForm(values)
    }
  )

  const submitForm = useCallback(
    (values: any) => {
      const data = {
        ...values,
        is_active: true
      }
      buUpdateConfig({ data: { ...data},id: id_bu  })
    },
    [buUpdateConfig]
  )

  const breadcrumbItems = [
    { to: '/apps/business-unit/list', label: 'หน่วยธุรกิจ' },
    { to: '/apps/business-unit/preview/' + id, label: 'ข้อมูลหน่วยธุรกิจ' },
    { label: 'การตั้งค่าหน่วยธุรกิจ', isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle('การตั้งค่าหน่วยธุรกิจ'))
    dispatch(setSidebarActive(['bu', '/apps/business-unit/list']))
    if (mode !== 'admin' && mode !== 'business_unit') {
      navigate('/')
    }
  }, [dispatch])

  useEffect(() => {
    fetchBusinessUnitFindData({data: { id: id_bu}})
  }, [fetchBusinessUnitFindData])



  useEffect(() => {
    bankFindAll({ data: { page: 1, pageSize: -1 } })
    fetchBuDataBank({
      data: {
        id_business_unit: id_bu,
      },
    })
  }, [])

  const { mutate: fetchProviderList } = useGlobalMutation(url_api.providerList, {
    onSuccess: (res: any) => {
      setProviderList(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch asset type data')
    },
  })

  const fetchProviderData = () => {
    const isPageSizeChanged = prevPageSize !== pageSize;
    fetchProviderList({
      data: {
        page: isPageSizeChanged ? 1 : page,
        page_size: pageSize,
        id_business_unit: id_bu,
      },
    })
    setPrevPageSize(pageSize);
  }

  useEffect(() => {
    if (tab === '5') {
      fetchProviderData()
    }
  }, [page, pageSize, tab])

  const addEdit = (item: any = null) => {
    setProviderForm(item ? JSON.parse(JSON.stringify(item)) : defaultProviderForm)
    setActionModal2(true)
  }

  const { mutateAsync: providerCreate, isLoading: CreateProviderLoading } = useGlobalMutation(url_api.providerCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'เพิ่มสำเร็จ',
          padding: '10px 20px',
        })
        fetchProviderData()
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutateAsync: providerUpdate, isLoading: UpdateProviderLoading } = useGlobalMutation(url_api.providerUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        })
        fetchProviderData()
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: providerPayload } = useGlobalMutation(url_api.providerPayload, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        const sp_list = res.data.sp_list.map((item: any) => ({ ...item, value: item.value, label: item.name }))
        const asset_type = res.data.asset_type.map((item: any) => ({ ...item, value: item.id, label: item.name }))
        setServiceProvider(sp_list)
        setAssetType(asset_type)
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  useEffect(() => {
    providerPayload({})
  }, [])

  const submitProviderForm = useCallback(
    async (values: any) => {
      let data = { ...values }
      if (values.id !== null) {
        await providerUpdate({ data })
      } else {
        delete data.id
        if (data.service_provider == 'Nebula') {
          data = {
            id_asset_type: values.id_asset_type,
            id_business_unit: values.id_business_unit,
            is_active: values.is_active,
            lock_content: values.lock_content,
            lock_footer: values.lock_footer,
            lock_phone: values.lock_phone,
            password: values.password,
            role: values.role,
            service_provider: values.service_provider,
            title: values.title,
            unlock_content_noti: values.unlock_content_noti,
            username: values.username,
          }
          await providerCreate({ data })
        } else {
          data = {
            id_asset_type: values.id_asset_type,
            id_business_unit: values.id_business_unit,
            is_active: values.is_active,
            lock_content: values.lock_content,
            lock_footer: values.lock_footer,
            lock_phone: values.lock_phone,
            service_provider: values.service_provider,
            title: values.title,
            unlock_content_noti: values.unlock_content_noti,
            token: values.token
          }
          await providerCreate({ data })
        }
      }
      setActionModal2(false)
    },
    []
  )

  const SubmittedForm = Yup.object().shape({
    title: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_asset_type: Yup.string().nullable().required('กรุณาเลือกข้อมูล'),
    service_provider: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    username: Yup.string().nullable().when("service_provider", {
      is: (value: any) => value == 'Nebula',
      then: (schema) => schema.required("กรุณาใส่ข้อมูลให้ครบ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: Yup.string().nullable().when("service_provider", {
      is: "Nebula",
      then: (schema) => schema.required("กรุณาใส่ข้อมูลให้ครบ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    role: Yup.string().nullable().when("service_provider", {
      is: "Nebula",
      then: (schema) => schema.required("กรุณาใส่ข้อมูลให้ครบ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    token: Yup.string().nullable().when("service_provider", {
      is: "Nuovo",
      then: (schema) => schema.required("กรุณาใส่ข้อมูลให้ครบ"),
      otherwise: (schema) => schema.notRequired(),
    }),
    lock_content: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    lock_phone: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    unlock_content_noti: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
  })


  if (isBusinessUnitFindLoading) return <div>Loading...</div>

  return (
    <div className="pt-1">
      <Breadcrumbs items={breadcrumbItems} />
      {(UpdateProviderLoading || CreateProviderLoading || boardcastLoading) && <PreLoading />}
      <div>
        <Tab.Group>
          <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a] bg-white">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button onClick={() => setTab('1')} className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่า
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button onClick={() => setTab('2')} className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่าขั้นสูง
                </button>
              )}
            </Tab>

            <Tab as={Fragment}>
              {({ selected }) => (
                <button onClick={() => setTab('3')} className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  บัญชีธนาคาร
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button onClick={() => setTab('4')} className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่าการชำระเงิน
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button onClick={() => setTab('5')} className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่าล็อคเครื่อง
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button onClick={() => setTab('6')} className={`${selected ? `!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ` : ''} dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}>
                  ตั้งค่าไลน์
                </button>
              )}
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <Formik initialValues={shopFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm1}>
                {(props) => (
                  <Form className="space-y-5 dark:text-white">
                    <div className="panel">
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        {t('shop_management_settings')}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mt-3">
                        <InputField
                          require={true}
                          required={true}
                          label="Prefix Contract Reference"
                          name="prefix_contract"
                          maxLength={3}
                          disabled={mode === 'business_unit'}
                        />

                        <InputField
                          label={t('shop_special_benefit')}
                          name="benefit"
                          type="number"
                          min="0"
                        />

                      </div>
                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="Commission (%)"
                          name="commission"
                          type="number"
                          min="0"
                        />
                        {themeInit.features?.commission_type && (
                          <SelectField
                            label="รูปแบบการคำนวน Commission"
                            id="commission_type"
                            name="commission_type"
                            placeholder="กรุณาเลือก"
                            options={[
                            {
                              value: 1,
                              label: 'ราคาขาย-เงินดาวน์ x Commission'
                            },
                            {
                              value: 2,
                              label: 'ราคาขาย x Commission'
                            },
                          ]} />
                        )}


                      </div>
                      <br />
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่าสัญญา
                      </div>
                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="ค่าดำเนินการล่าช้า (บาท)"
                          name="penalty_fee"
                          type="number"
                          min="0"
                        />
                        <InputField
                          require={true}
                          label="ค่าดำเนินการล่าช้าไม่เกิน (บาท/ครั้ง)"
                          name="penalty_fee_limit"
                          type="number"
                          min="0"
                        />
                      </div>

                      <div className="input-flex-row">

                        <InputField
                          require={true}
                          label="ค่าธรรมเนียมทำสัญญา (บาท)"
                          name="fee"
                          type="number"
                          min="0"
                        />

                        <InputField
                          require={true}
                          label="ค่าธรรมเนียมการติดตาม (บาท)"
                          name="tracking_fee"
                          type="number"
                          min="0"
                        />
                      </div>

                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="ค่าธรรมเนียมปลดล็อค (บาท)"
                          name="unlock_fee"
                          type="number"
                          min="0"
                        />
                        <SelectField
                          label="รูปแบบการลงนามสัญญา"
                          id="signature_online_type"
                          name="signature_online_type"
                          placeholder="กรุณาเลือก"
                          options={[
                          {
                            value: 1,
                            label: 'ลงนามสัญญาออนไลน์'
                          },
                          {
                            value: 2,
                            label: 'ลงนามสัญญา EKYC'
                          },
                        ]} />
                      </div>
                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="เงื่อนไขการผ่อนสินค้า"
                          name="condition_contract"
                          as="textarea"
                          rows="10"
                        />
                      </div>
                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="จำนวนวันค้างชำระไม่เกิน(ไม่มีค่าดำเนินการล่าช้า)"
                          name="payment_late_period"
                          type="number"
                          min="0"
                          disabled={true}

                        />
                      </div>

                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="ระยะเวลาจ่ายเงินล่าช้า ระยะ 1"
                          name="payment_late_period_lvl_1"
                          type="text"
                          disabled={true}
                        />

                         <InputField
                          require={true}
                          label="ระยะเวลาจ่ายเงินล่าช้า ระยะ 2"
                          name="payment_late_period_lvl_2"
                          type="text"
                          disabled={true}
                        />
                      </div>


                      <div className="input-flex-row">
                        <InputField
                          require={true}
                          label="ระยะเวลาจ่ายเงินล่าช้า ระยะ 3"
                          name="payment_late_period_lvl_3"
                          type="text"
                          disabled={true}
                        />

                         <InputField
                            require={true}
                            label="สถานะผิดนัดชำระ ระดับ4/หนี้เสีย (NPL)"
                            name="payment_late_period_lvl_5"
                            type="text"
                            disabled={true}
                          />

                         {/* <InputField
                          require={true}
                          label="ระยะเวลาจ่ายเงินล่าช้า ระยะ 4"
                          name="payment_late_period_lvl_4"
                          type="text"
                        /> */}
                      </div>


                      <div className="input-flex-row">


                        <InputField
                          require={false}
                          label="ระยะเวลาล็อคเครื่อง"
                          name="locked_period"
                          type="number"
                          min="0"
                        />

                      </div>

                      <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                        บันทึก
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Tab.Panel>
            <Tab.Panel>
              <Formik initialValues={shopFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedAdv}>
                {(props) => (
                  <Form className="space-y-5 dark:text-white">
                    <div className="panel flex flex-col gap-4">
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่าสัญญา
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <SelectField
                          label="การสร้างสัญญา"
                          id="is_opened"
                          name="is_opened"
                          placeholder="กรุณาเลือก"
                          options={[{
                            value: true,
                            label: 'เปิด'
                          },
                          {
                            value: false,
                            label: 'ปิด'
                          }]}
                        />


                        <InputField
                          label="ซ่อนสัญญาหลังอนุมัติ (x) วัน"
                          name="hide_content_days"
                          type="number"
                          min="0"
                        />

                      </div>


                      <div className="flex flex-col sm:flex-row gap-4">

                         <SelectField
                          label="รูปแบบสัญญา (PDF)"
                          id="pdf_contract_templete"
                          name="pdf_contract_templete"
                          placeholder="กรุณาเลือก"
                          options={[
                          {
                            value: 'default',
                            label: 'รูปแบบที่ 1'
                          },
                          {
                            value: 'pango',
                            label: 'รูปแบบที่ 2'
                          },
                          {
                            value: 'default_receipt',
                            label: 'รูปแบบที่ 3'
                          },
                        ]}
                        />


                        <InputField
                          required={false}
                          label="ลายน้ำ PDF"
                          name="pdf_watermark"
                          disabled={mode === 'business_unit'}
                        />


                      </div>

                      {mode === 'admin' && (
                        <>
                          <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                            ตั้งค่าระบบ
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <SelectField
                              label="ระบบล็อคอิน"
                              id="is_login"
                              name="is_login"
                              placeholder="กรุณาเลือก"
                              options={[
                              {
                                value: true,
                                label: 'เปิดการใช้งาน'
                              },
                              {
                                value: false,
                                label: 'ปิดการใช้งาน'
                              },
                            ]}
                            />
                          </div>
                        </>
                      )}

                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่าการชำระเงิน
                      </div>

                        <div className="flex flex-col sm:flex-row gap-4">


                        <SelectField
                          label="การชำระเงิน QR CODE"
                          id="payment_qr_method"
                          name="payment_qr_method"
                          placeholder="กรุณาเลือก"
                          options={[
                          {
                            value: 'disabled',
                            label: 'ปิดการใช้งาน'
                          },
                          {
                            value: 'ps',
                            label: 'Pay Solution'
                          },
                           ...(themeInit.paymentGateway.tqr
                              ? [{ value: 'tqr', label: 'Thai QR' }]
                              : []
                          ),
                        ]}
                        />
                      </div>
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่า Flowaccount
                      </div>


                      <div className="flex flex-col sm:flex-row gap-4">
                        <InputField
                          required={false}
                          label="Flow Account Client Id"
                          name="flowaccount_client_id"
                          disabled={mode === 'business_unit'}
                        />
                        <InputField
                          required={false}
                          label="Flow Account Client Secert"
                          name="flowaccount_client_secret"
                          disabled={mode === 'business_unit'}
                        />
                      </div>
                      {/* {themeInit.features?.customer_close_contract && ( */}
                        <>
                          <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                            ตั้งค่าส่วนลดปิดสัญญา
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <InputField
                              required={false}
                              label="เงื่อนไขการปิดสัญญา (เดือน)"
                              name="cbd_condition"
                              type="number"
                            />
                            <InputField
                              required={false}
                              label="ส่วนลดเมื่อปิดสัญญาเดือนที่ 1 (%)"
                              name="cbd_discount_1"
                              type="number"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <InputField
                              required={false}
                              label="ส่วนลดเมื่อปิดสัญญาเดือนที่ 2 (%)"
                              name="cbd_discount_2"
                              type="number"
                            />
                            <InputField
                              required={false}
                              label="ส่วนลดเมื่อปิดสัญญาเดือนที่ 3 เป็นต้นไป (%) (ยกเว้นเดือนสุดท้าย)"
                              name="cbd_discount_3"
                              type="number"
                            />
                          </div>
                        </>
                      {/* )} */}



                      <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                        บันทึก
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Tab.Panel>

            <Tab.Panel>
              <div className="panel">
                <div className="mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                  <div className="p-5">
                    <button
                      type="button"
                      className="btn bg-[#002a42] text-white w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                      onClick={() => {
                        setBankFormData(defaultBankForm)
                        setActionModal(true)
                      }}
                    >
                      เพิ่มบัญชีธนาคาร
                    </button>
                    <div className="panel p-0 mt-5 border-0 overflow-hidden">
                      <div className="table-responsive">
                        <table className="table-striped table-hover">
                          <thead>
                            <tr>
                              <th>ลำดับ</th>
                              <th>ชื่อบัญชีธนาคาร</th>
                              <th>ธนาคาร</th>
                              <th>เลขบัญชีธนาคาร</th>
                              <th className="!text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bankList.map((item: any, index: number) => (
                              <tr key={item.id}>
                                <td>
                                  <div className="flex items-center w-max">
                                    <div>{index + 1}</div>
                                  </div>
                                </td>
                                <td>{item?.bank_account_name}</td>
                                <td>{item.bank?.name}</td>
                                <td>{formatBankAccountNumber(item?.bank_account_number)}</td>
                                <td>
                                  <div className="flex gap-4 items-center w-max mx-auto">
                                    <Tippy content="แก้ไข" theme="Primary">
                                      <a className="flex hover:text-info cursor-pointer" onClick={() => {
                                        setBankFormData({ ...item, id_bank: item?.id_bank })
                                        setActionModal(true)
                                      }}>
                                        <IconEdit className="w-4.5 h-4.5" />
                                      </a>
                                    </Tippy>
                                    <Tippy content="ลบ" theme="Primary">
                                      <button
                                        type="button"
                                        className="flex hover:text-info cursor-pointer"
                                        onClick={() => {
                                          Swal.fire({
                                            title: 'ยืนยันการลบบัญชีธนาคาร',
                                            text: 'คุณต้องการลบบัญชีธนาคารนี้ใช่หรือไม่?',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor:themeInit.color.themePrimary,
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'ยืนยัน',
                                            cancelButtonText: 'ยกเลิก',
                                            reverseButtons: true,
                                          }).then((result) => {
                                            if (result.isConfirmed) {
                                              DeleteBank({ data: { id: item.id } })
                                            }
                                          })
                                        }}
                                      >
                                        <IconTrashLines />
                                      </button>
                                    </Tippy>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <Formik initialValues={shopFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedPayment}>
                {(props) => (
                  <Form className="space-y-5 dark:text-white">
                    <div className="panel flex flex-col gap-4">
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่าการชำระเงิน (Paysolution)
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <InputField
                          required={false}
                          label="MercantID Paysolution"
                          name="paysolution_mercantid"
                          disabled={mode === 'business_unit'}
                        />
                        <InputField
                          required={false}
                          label="Api Key Paysolution"
                          name="paysolution_key"
                          disabled={mode === 'business_unit'}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <InputField
                          required={false}
                          label="SecretKey Paysolution"
                          name="paysolution_secret_key"
                          disabled={mode === 'business_unit'}
                        />
                        <InputField
                          required={false}
                          label="Token Paysolution"
                          name="paysolution_token"
                          disabled={mode === 'business_unit'}
                        />
                      </div>

                      {themeInit?.paymentGateway.tqr && (
                        <>
                          <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-2">
                            ตั้งค่าการชำระเงิน (TQR)
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 ">
                            <InputField
                              required={false}
                              label="billerID"
                              name="tqr_biller_id"
                              disabled={mode === 'business_unit'}
                            />
                            <InputField
                              required={false}
                              label="Merchant Name"
                              name="tqr_merchant_name"
                              disabled={mode === 'business_unit'}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 ">
                            <InputField
                              required={false}
                              label="ชื่อบริษัท"
                              name="tqr_company_name"
                              disabled={mode === 'business_unit'}
                            />
                            <InputField
                              required={false}
                              label="ชื่อบริษัท (ภาษาอังกฤษ)"
                              name="tqr_company_name_en"
                              disabled={mode === 'business_unit'}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <InputField
                              required={false}
                              label="User"
                              name="tqr_user"
                              disabled={mode === 'business_unit'}
                            />
                            <InputField
                              required={false}
                              label="Password"
                              name="tqr_password"
                              disabled={mode === 'business_unit'}
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4 ">
                            <InputField
                              required={false}
                              label="Customer Key"
                              name="tqr_customer_key"
                              disabled={mode === 'business_unit'}
                            />
                            <InputField
                              required={false}
                              label="Customer Secret"
                              name="tqr_customer_secret"
                              disabled={mode === 'business_unit'}
                            />
                          </div>
                        </>
                      )}


                      {themeInit?.paymentGateway.tqr && (
                        <>
                          <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center mt-2">
                            ตั้งค่าการชำระเงิน (TQR)
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 ">
                            <InputField
                              required={false}
                              label="billerID"
                              name="tqr_biller_id"
                              disabled={mode === 'business_unit'}
                            />
                            <InputField
                              required={false}
                              label="Merchant Name"
                              name="tqr_merchant_name"
                              disabled={mode === 'business_unit'}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 ">
                            <InputField
                              required={false}
                              label="ชื่อบริษัท"
                              name="tqr_company_name"
                              disabled={mode === 'business_unit'}
                            />
                            <InputField
                              required={false}
                              label="ชื่อบริษัท (ภาษาอังกฤษ)"
                              name="tqr_company_name_en"
                              disabled={mode === 'business_unit'}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <InputField
                              required={false}
                              label="User"
                              name="tqr_user"
                              disabled={mode === 'business_unit'}
                            />
                            <InputField
                              required={false}
                              label="Password"
                              name="tqr_password"
                              disabled={mode === 'business_unit'}
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4 ">
                            <InputField
                              required={false}
                              label="Customer Key"
                              name="tqr_customer_key"
                              disabled={mode === 'business_unit'}
                            />
                            <InputField
                              required={false}
                              label="Customer Secret"
                              name="tqr_customer_secret"
                              disabled={mode === 'business_unit'}
                            />
                          </div>
                        </>
                      )}
                      <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                        บันทึก
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Tab.Panel>
            <Tab.Panel>
              <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4.5 px-5 ">
                  <h2 className="text-xl">
                    ตั้งค่าล็อคเครื่อง
                  </h2>
                  <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                      <button type="button" className="btn btn-primary" onClick={() => addEdit()}>
                        <IconPlus className="ltr:mr-2 rtl:ml-2" />
                        เพิ่มผู้ให้บริการ
                      </button>
                    </div>
                  </div>
                </div>
                <div className="datatables pagination-padding">
                  <DataTable
                    className="whitespace-nowrap table-hover invoice-table"
                    records={providerList}
                    columns={[
                      {
                        accessor: 'id',
                        title: 'ลำดับ',
                        textAlignment: 'center',
                        sortable: false,
                        render: (row, index) => (
                          <div>{index + 1}</div>
                        ),
                      },
                      {
                        accessor: 'title',
                        title: 'ชื่อผู้ให้บริการ',
                        textAlignment: 'left',
                        sortable: false,
                        render: ({ title }) => (
                          <div className="flex items-center font-normal">
                            <div>{title}</div>
                          </div>
                        ),
                      },
                      {
                        accessor: 'service_provider',
                        title: 'บริการ',
                        textAlignment: 'left',
                        sortable: false,
                        render: ({ service_provider }) => (
                          <div className="flex items-center font-normal">
                            <div>{service_provider}</div>
                          </div>
                        ),
                      },
                      {
                        accessor: 'username',
                        title: 'ผู้ใช้งาน',
                        textAlignment: 'left',
                        sortable: false,
                        render: ({ username }) => (
                          <div className="flex items-center font-normal">
                            <div>{username || '-'}</div>
                          </div>
                        ),
                      },
                      {
                        accessor: 'role',
                        title: 'ระดับ',
                        textAlignment: 'left',
                        sortable: false,
                        render: ({ role }) => (
                          <div className="flex items-center font-normal">
                            <div>{role || '-'}</div>
                          </div>
                        ),
                      },
                      {
                        accessor: 'lock_phone',
                        title: 'เบอร์โทร',
                        textAlignment: 'left',
                        sortable: false,
                        render: ({ lock_phone }) => (
                          <div className="flex items-center font-normal">
                            <div>{lock_phone}</div>
                          </div>
                        ),
                      },
                      {
                        accessor: 'created_at',
                        title: 'วันที่สร้าง',
                        textAlignment: 'left',
                        sortable: false,
                        render: ({ created_at }) => (
                          <div className="flex items-center font-normal">
                            <div> {convertDateDbToClient(created_at) ?? '-'}</div>
                          </div>
                        ),
                      },
                      {
                        accessor: 'is_active',
                        title: 'สถานะ',
                        textAlignment: 'center',
                        sortable: false,
                        render: ({ is_active }) => (
                          <span className={`badge ${is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                            {is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        ),
                      },
                      {
                        accessor: 'action',
                        title: 'Actions',
                        textAlignment: 'center',
                        sortable: false,
                        render: (item) => (
                          <div className="flex gap-4 items-center w-max mx-auto">
                            <Tippy content="แก้ไข" theme="Primary">
                              <a className="flex cursor-pointer active" onClick={() => { addEdit(item) }}>
                                <IconEdit className="w-4.5 h-4.5" />
                              </a>
                            </Tippy>
                          </div>
                        ),
                      },
                    ]}
                    page={page}
                    totalRecords={totalItems}
                    recordsPerPage={pageSize}
                    minHeight={150}
                    highlightOnHover
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={(p) => {
                      setPage(1)
                      setPageSize(p)
                    }}
                    paginationText={({ from, to, totalRecords }) => (
                      `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`
                    )}
                  />
                </div>

              </div>
            </Tab.Panel>
            <Tab.Panel>
              <Formik initialValues={shopFormData} onSubmit={submitLineForm} enableReinitialize autoComplete="off" validationSchema={SubmittedFormLine}>
                {(props) => (
                  <Form className="panel space-y-5 dark:text-white">
                    <div className=" flex flex-col gap-4">
                      <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                        ตั้งค่าไลน์
                      </div>
                      <div className="flex flex-wrap gap-3 w-full items-end">
                        <div className='flex w-1/4'>
                          <InputField
                            label="Line Qa Id"
                            name="line_qa_id"
                            type="text"
                            require={true}
                            // row={true}
                          />
                        </div>
                        <div className='flex w-1/4'>
                          <InputField
                            label="Line Token"
                            name="line_token"
                            type="text"
                            require={true}
                            // row={true}
                          />
                        </div>
                        <div className='flex w-1/4'>
                          <InputField
                            label="Line Secret"
                            name="line_secret"
                            type="text"
                            require={true}
                            // row={true}
                          />
                        </div>
                        <button type="submit" className="btn border-0 btn-primary h-[40px]">
                          บันทึก
                        </button>
                      </div>
                      {/* <div className="flex flex-col sm:flex-row gap-4">
                        <InputField
                          require={true}
                          label="ln_pre_due_day"
                          name="ln_pre_due_day"
                          type="text"
                          onChange={(e:any) => {
                            let newValue = e.target.value.replace(/\D/g,'')
                            if(newValue.startsWith('0') && newValue[1] == 0){
                              return
                            }else if (newValue.startsWith("0") && newValue.length > 1) {
                              newValue = newValue.replace(/^0+/, "");
                            }
                            props.setFieldValue('ln_pre_due_day',newValue)
                          }}
                          onKeyPress={(e: any) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault()
                            }
                          }}
                        />
                        <InputField
                          require={true}
                          label="ln_after_due_day"
                          name="ln_after_due_day"
                          type="text"
                          onChange={(e:any) => {
                            let newValue = e.target.value.replace(/\D/g,'')
                            if(newValue.startsWith('0') && newValue[1] == 0){
                              return
                            }else if (newValue.startsWith("0") && newValue.length > 1) {
                              newValue = newValue.replace(/^0+/, "");
                            }
                            props.setFieldValue('ln_after_due_day',newValue)
                          }}
                          onKeyPress={(e: any) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault()
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <InputField
                          required={false}
                          label="คำแจ้งเตือนก่อนถึงเวลาชำระ"
                          type="text"
                          name="ln_pre_due_day_txt"
                          require={true}
                        />
                        <InputField
                          required={false}
                          label="คำแจ้งเตือนเมื่อครบกำหนดวันชำระ"
                          type="text"
                          name="ln_due_day_txt"
                          require={true}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <InputField
                          required={false}
                          label="คำแจ้งเตือนก่อนถึงวันชำระ"
                          type="text"
                          name="ln_after_due_day_txt"
                          require={true}
                        />
                        <InputField
                          required={false}
                          label="คำแจ้งเตือนเมื่อเลยระยะเวลากำหนด"
                          type="text"
                          name="ln_late_day_txt"
                          require={true}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <InputField
                          required={false}
                          label="เวลาแจ้งเตือน"
                          type="text"
                          name="ln_time_notify"
                        />
                        <SelectField
                          label="สถานะเปิด-ปิด การส่งแจ้งเตือน"
                          id="ln_enabled"
                          name="ln_enabled"
                          placeholder="กรุณาเลือก"
                          options={[{
                            value: true,
                            label: 'เปิด'
                          },
                          {
                            value: false,
                            label: 'ปิด'
                          }]}
                        />
                      </div> */}

                    </div>
                    <button type='button' onClick={() => { setLineSettingForm(defaultLineSettingForm); setActionModalLine(true) }} className='btn text-white bg-green-600'>เพิ่มข้อมูล</button>
                    <div className="datatables pagination-padding">
                      <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={lineSettingList}
                        columns={[
                          {
                            accessor: 'id',
                            title: 'ลำดับ',
                            textAlignment: 'center',
                            sortable: false,
                            render: (row, index) => (
                              <div>{index + 1}</div>
                            ),
                          },
                          {
                            accessor: 'day',
                            title: 'วันที่แจ้งเตือนครบกำหนด',
                            textAlignment: 'left',
                            sortable: false,
                          },
                          {
                            accessor: 'message',
                            title: 'ข้อความแจ้งเตือน',
                            textAlignment: 'left',
                            sortable: false,
                          },
                          {
                            accessor: 'is_active',
                            title: 'สถานะ',
                            textAlignment: 'center',
                            sortable: false,
                            render: (item: any) => (
                              <span className={`badge ${item.is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                {item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                              </span>
                            ),
                          },
                          {
                            accessor: 'action',
                            title: 'Actions',
                            textAlignment: 'center',
                            sortable: false,
                            render: (item) => (
                              <div className="flex gap-4 items-center w-max mx-auto">
                                  {themeInit.features.boardCast && (
                                      <div className="bg-[#E5E4E2] w-8 h-8 rounded-full flex items-center justify-center text-white">
                                        <a className="flex cursor-pointer active" onClick={() =>
                                            lineBoardCastOne({data:{
                                              id_business_unit:id_bu,
                                              id_notify:item?.id
                                            }})
                                          }>
                                            <IconRefresh className="w-4.5 h-4.5" />
                                          </a>
                                       </div>
                                  )}

                                <Tippy content="แก้ไข" theme="Primary">
                                  <a className="flex cursor-pointer active" onClick={() => { editLineNotify(item) }}>
                                    <IconEdit className="w-4.5 h-4.5" />
                                  </a>
                                </Tippy>
                              </div>
                            ),
                          },
                        ]}
                        // page={page}
                        // totalRecords={totalItems}
                        // recordsPerPage={pageSize}
                        minHeight={150}
                        highlightOnHover
                      // onPageChange={(p) => setPage(p)}
                      // recordsPerPageOptions={PAGE_SIZES}
                      // onRecordsPerPageChange={(p) => {
                      //   setPage(1)
                      //   setPageSize(p)
                      // }}
                      // paginationText={({ from, to, totalRecords }) => (
                      //   `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`
                      // )}
                      />
                    </div>
                  </Form>
                )}
              </Formik>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      <Transition appear show={actionModal} as={Fragment}>
        <Dialog as="div" open={actionModal} className="relative z-[51]" onClose={() => setActionModal(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-[black]/60" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    บัญชีธนาคาร
                  </div>
                  <div className="p-5">
                    <Formik initialValues={bankFormData} onSubmit={submitBankForm} enableReinitialize autoComplete="off" validationSchema={SubmittedBankForm}>
                      {(props) => (
                        <Form className="space-y-5 dark:text-white custom-select">
                          <InputField
                            label="ชื่อบัญชีธนาคาร"
                            name="bank_account_name"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
                          <SelectField
                            label="ธนาคาร"
                            id="id_bank"
                            name="id_bank"
                            placeholder="กรุณาเลือก"
                            options={masterDataBankList}
                            isSearchable={true}
                          />
                          <InputField
                            label="เลขบัญชีธนาคาร"
                            name="bank_account_number"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                            maxLength={20}
                            onKeyPress={(e: any) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault()
                              }
                            }}
                          />
                          <div className="flex justify-end items-center mt-8">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setActionModal(false)}>
                              ยกเลิก
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                              {bankFormData?.id ? 'บันทึก' : 'เพิ่ม'}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={actionModal2} as={Fragment}>
        <Dialog as="div" open={actionModal2} onClose={() => setActionModal2(false)} className="relative z-[51]">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-[black]/60" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-16 py-8">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-4xl text-black dark:text-white-dark">
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal2(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {providerForm.id ? 'แก้ไข' : 'เพิ่ม'}
                  </div>
                  <div className="p-5">
                    <Formik initialValues={providerForm} onSubmit={submitProviderForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                      {(props) => (
                        <Form className="space-y-5 mb-7 dark:text-white custom-select">
                          <InputField label='ชื่อผู้ให้บริการ' type='text' name='title' placeholder='กรุณาใส่ข้อมูล' require={true} />
                          <SelectField label='ประเภทสินทรัพย์' id='id_asset_type' name='id_asset_type' options={assetType} require={true} placeholder='กรุณาเลือก' onChange={(e) => {
                            if (e.value == '1' || e.value == '2') {
                              props.setFieldValue('service_provider', "Nebula")
                            } else if (e.value == '3') {
                              props.setFieldValue('service_provider', "Nuovo")
                            } else {
                              props.setFieldValue('service_provider', null)
                            }
                          }} />
                          {(props.getFieldProps('service_provider').value == 'Nebula' || props.getFieldProps('service_provider').value == '') && <>
                            <div className="flex gap-4">
                              <SelectField label='บริการ' id='service_provider' name='service_provider' options={serviceProvider} require={true} placeholder='กรุณาเลือก' onChange={(e) => {
                                if (e.value == 'Nebula') {
                                  props.setFieldValue('id_asset_type', 1)
                                } else if (e.value == 'Nuovo') {
                                  props.setFieldValue('id_asset_type', 3)
                                }
                              }} />
                              <InputField
                                label="ระดับ"
                                name="role"
                                type="text"
                                placeholder="กรุณาใส่ข้อมูล"
                                require={true}
                              />
                            </div>
                            <div className="flex gap-4">
                              <InputField
                                label="ผู้ใช้งาน"
                                name="username"
                                type="text"
                                placeholder="กรุณาใส่ข้อมูล"
                                require={true}
                              />
                              <InputField
                                label="รหัสผ่าน"
                                name="password"
                                type="text"
                                placeholder="กรุณาใส่ข้อมูล"
                                require={true}
                              />
                            </div>
                          </>}
                          {(props.getFieldProps('service_provider').value == 'Nuovo' || props.getFieldProps('service_provider').value == '') &&
                            <>
                              <SelectField label='บริการ' id='service_provider' name='service_provider' options={serviceProvider} require={true} placeholder='กรุณาเลือก' onChange={(e) => {
                                if (e.value == 'Nebula') {
                                  props.setFieldValue('id_asset_type', 1)
                                } else if (e.value == 'Nuovo') {
                                  props.setFieldValue('id_asset_type', 3)
                                }
                              }} />
                              <InputField
                                label="Token"
                                name="token"
                                type="text"
                                placeholder="กรุณาใส่ข้อมูล"
                                require={true}
                              />
                            </>
                          }
                          <InputField
                            label="ข้อความแจ้งเตือนล็อคเครื่อง"
                            name="lock_content"
                            as="textarea"
                            rows="3"
                            placeholder="กรุณาใส่ข้อมูล"
                            require={true}
                          />
                          <InputField
                            label="ข้อความแจ้งเตือนล็อคเครื่อง(ด้านล่าง)"
                            name="lock_footer"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
                          <InputField
                            label="เบอร์โทร"
                            name="lock_phone"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
                          <InputField
                            label="ข้อความแจ้งเตือนปลดล็อคเครื่อง"
                            name="unlock_content_noti"
                            as="textarea"
                            rows="3"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
                          <SelectField
                            label="สถานะ*"
                            id="is_active"
                            name="is_active"
                            options={[
                              {
                                value: true,
                                label: 'เปิด',
                              },
                              {
                                value: false,
                                label: 'ปิด',
                              },
                            ]}
                            placeholder="กรุณาเลือก"
                            onChange={(e: any) => {
                              props.setFieldValue('is_active', e.value)
                            }}
                            isSearchable={false}
                          />
                          <div className="flex justify-end items-center mt-8">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setActionModal2(false)}>
                              ยกเลิก
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                              {providerForm.id ? 'บันทึก' : 'เพิ่ม'}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={actionModalLine} as={Fragment}>
        <Dialog as="div" open={actionModalLine} onClose={() => setActionModalLine(false)} className="relative z-[51]">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-[black]/60" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-16 py-8">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-2xl text-black dark:text-white-dark">
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModalLine(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {lineSettingForm.id ? 'แก้ไข' : 'เพิ่ม'}
                  </div>
                  <div className="p-5">
                    <Formik initialValues={lineSettingForm} onSubmit={submitTableLine} enableReinitialize autoComplete="off" validationSchema={SubmittedTableLine}>
                      {(props) => (
                        <Form className="space-y-5 mb-7 dark:text-white custom-select">

                          <InputField label='หัวเรื่อง' type='text' name='title' placeholder='กรุณาใส่ข้อมูล' require={true} />
                          <InputField label='ข้อความแจ้งเตือน' type='text' name='message' placeholder='กรุณาใส่ข้อมูล' require={true} />
                          <InputField label='กำหนดวันแจ้งเตือน' type='text' name='day' placeholder='กรุณาใส่ข้อมูล' require={true} onKeyPress={(e: any) => {
                            if (!/[0-9]/.test(e.key) && !(e.key === "-" && e.target.value === "")) {
                              e.preventDefault()
                            }
                          }} />
                          {/* <InputField label='ลงท้าย' type='text' name='footer' placeholder='กรุณาใส่ข้อมูล' require={true} /> */}
                          <SelectField
                            label="สถานะ*"
                            id="is_active"
                            name="is_active"
                            options={[
                              {
                                value: true,
                                label: 'เปิด',
                              },
                              {
                                value: false,
                                label: 'ปิด',
                              },
                            ]}
                            placeholder="กรุณาเลือก"
                            onChange={(e: any) => {
                              props.setFieldValue('is_active', e.value)
                            }}
                            isSearchable={false}
                          />
                          <div className="flex justify-end items-center mt-8">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setActionModalLine(false)}>
                              ยกเลิก
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                              {lineSettingForm.id ? 'บันทึก' : 'เพิ่ม'}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default Edit
