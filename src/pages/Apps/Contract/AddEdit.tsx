import { useEffect, useState, useCallback, Fragment, useRef, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import moment from 'moment-timezone'
import _ from 'lodash'

import { Tab, Dialog, Transition } from '@headlessui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { Form, Formik, FormikProps } from 'formik'

import { Contract, Shop, Customer, Assets, BusinessUnits } from '../../../types/index'
import { insPeriod, insPayDay, percentageArray, toastAlert } from '../../../helpers/constant'
import Checkbox from '../../../components/HOC/CheckboxField'

import InputField from '../../../components/HOC/InputField'
import DatePicker from '../../../components/HOC/DatePicker'
import SelectField from '../../../components/HOC/SelectField'

import * as Yup from 'yup'
import Swal from 'sweetalert2'

import { PRICE_REGEX } from '../../../helpers/regex'
import { setPageAction } from '../../../store/pageStore'
import { useGlobalBlobMutation, useGlobalErrorMutation, useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { useUploadMutation } from '../../../services/mutations/useUploadMutation'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import { resizeImage } from '../../../helpers/helpFunction'
import { convertDateClientToDb, convertDateDbToClient, convertDateTimeDbToClient, convertTimeDateDbToClient } from '../../../helpers/formatDate'
import PreLoading from '../../../helpers/preLoading'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import IconX from '../../../components/Icon/IconX'
import IconMapPin from '../../../components/Icon/IconMapPin'
import IconPhoneCall from '../../../components/Icon/IconPhoneCall'
import IconLink from '../../../components/Icon/IconLink'
import IconMail from '../../../components/Icon/IconMail'
import IconCreditCard from '../../../components/Icon/IconCreditCard'
import IconChecks from '../../../components/Icon/IconChecks'
import IconTiktok from '../../../components/Icon/IconTiktok'
import IconLine from '../../../components/Icon/IconLine'
import IconFacebook from '../../../components/Icon/IconFacebook'
import IconInstagram from '../../../components/Icon/IconInstagram'
import IconPlus from '../../../components/Icon/IconPlus'
import Carousel from '../../../components/HOC/Carousel'
import IconNotesEdit from '../../../components/Icon/IconNotesEdit'
import IconAward from '../../../components/Icon/IconAward'
import { formatIDNumber, formatPhoneNumber, convertRoundUpNumber } from '../../../helpers/formatNumeric'
import axios from 'axios'
import './AddEdit.css'
import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import 'filepond/dist/filepond.min.css'

registerPlugin(FilePondPluginFileValidateType)
registerPlugin(FilePondPluginFileValidateSize)

import Lightbox from 'react-18-image-lightbox'
import 'react-18-image-lightbox/style.css'
import { useInView } from 'react-intersection-observer'
import ChatPopup from '../../ChatPopup'
import { IRootState } from '../../../store'
import Dropdown from '../../../components/Dropdown'
import themeInit from '../../../theme.init'
import { Query } from 'react-query'
import SignatureCanvas from 'react-signature-canvas'
import IconRefresh from '../../../components/Icon/IconRefresh'
import { EditorProvider, Editor, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnNumberedList, BtnBulletList, Separator, BtnLink, BtnUndo, BtnRedo, BtnClearFormatting, BtnStyles } from 'react-simple-wysiwyg'
import InputGenerateField from '../../../components/HOC/InputGenerateField'
import { showNotification } from '../../../helpers/showNotification'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'admin'

interface ActionType {
  type: string;
  link?: string;
  status?: boolean;
}

const reducer = (state: any, action: ActionType) => {
  switch (action.type) {
    case 'change':
      return { status: action.status, link: action.link };
    case 'change-signed':
      return { ...state, link: action.link };
    case 'change-status':
      return { ...state,status: action.status};
    default:
      return state;
  }
};

const AddEdit = () => {

  const { ref, inView } = useInView({
    threshold: 0.1, // Show when the element is fully in view
  })

  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false
  const { t } = useTranslation()

  const { id, uuid } = useParams()
  const creditLevelTypes = useSelector((state: IRootState) => state.dataStore.credit_level)
  const contract_id = id ? Number(id) : undefined
  const contract_uuid = uuid ? uuid : undefined
  const toast = Swal.mixin(toastAlert)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const storedUser = localStorage.getItem(mode)
  const id_shop = storedUser ? JSON.parse(storedUser).id : null
  const userRole = storedUser ? JSON.parse(storedUser).role : null

  const admin_business_unit_role = (userRole === 'admin' || userRole === 'business_unit')
  const pageAction = !_.isUndefined(contract_uuid) // true when have id

  const breadcrumbItems = [
    { to: '/apps/contract/list', label: t('contract') },
    { label: pageAction ? t('edit') : t('add'), isCurrent: true },
  ]

  const [statusAction, setStatusAction] = useState<number>(0)
  const [contractStatusList, setContractStatusList] = useState<any>([])
  const [contractTypeList, setContractTypeList] = useState<any>([])
  const [insuranceTypeList, setInsuranceTypeList] = useState<any>([])

  const [shopListData, setShopListData] = useState<Shop[]>([])
  const [shopDetail, setShopDetail] = useState<Shop>({})
  const [buListData, setBuListData] = useState<any[]>([])
  const [shopGroupListData, setShopGroupListData] = useState<any[]>([])
  const [listContractRefinance, setListContractRefinance] = useState<any[]>([])
  const [buDetail, setBuDetail] = useState<any>({})
  const [customerListData, setCustomerListData] = useState<Customer[]>([])
  const [customerDetail, setCustomerDetail] = useState<any>({})
  const [tempAssetListData, setTempAssetListData] = useState<Assets[]>([])
  const [assetListData, setAssetListData] = useState<Assets[]>([])
  const [assetDetail, setAssetDetail] = useState<any>({})
  const [contractRate, setContractRate] = useState<any>(null)
  const [isSelectRate, setIsSelectRate] = useState<boolean>(false)
  const [historyLogData, setHistoryLogData] = useState<any>([])
  const [installmentsData, setInstallmentsData] = useState<any>([])
  const [contractFile, setContractFile] = useState<any>(null)
  const [images, setImages] = useState<any>([])
  const [video, setVideo] = useState<any>([])
  const [isVideo, setIsVideo] = useState<any>(null)

  const [isOpenPic, setIsOpenPic] = useState<boolean>(false)
  const [pictureURL, setPictureURL] = useState<any>('')

  const [actionModal, setActionModal] = useState(false)
  const [actionReportModal, setActionReportModal] = useState(false)
  const [actionRetuenModal, setActionRetuenModal] = useState(false)
  const [actionCancelEkyc,setActionCancelEkyc] = useState<boolean>(false)

  const [installmentDetail, setInstallmentDetail] = useState<any>({})
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdpaLoading, setPdpaLoading] = useState(false)
  const [pdfReceiptLoading, setPdfReceiptLoading] = useState(false)
  const [contractMessage, setContractMessage] = useState<any>([])

  const [statusCreditList, setStatusCreditList] = useState([])
  const [statusCreditListV2, setStatusCreditListV2] = useState([])
  const [refinanceAction, setRefinanceAction] = useState('none') // none
  const [isContractRefinance, setIsContractRefinance] = useState(false) // none
  const [lockUpdate, setLockUpdate] = useState(false) //
  const [statusCreditHistoryList, setStatusCreditHistoryList] = useState([])
  const [providerList, setProviderList] = useState([])
  const [selectProvider, setSelectProvider] = useState<any>(null)

  const [cloneData, setCloneData] = useState(false)
  const [dataReturnReceipt, setDataReturnReceipt] = useState<any>(null)

  const [html, setHtml] = useState('')

  // function onChange(e) {
  //   setHtml(e.target.value)
  // }

  const [formData, setFormData] = useState<any>({
    contract_date: convertDateClientToDb(moment().toISOString(true)) + 'T00:00:00.000Z',
    contract_no: '',
    id_shop: '',
    id_shop_group: 0,
    id_business_unit: '',
    id_customer: '',
    id_asset: '',
    price: 0,
    down_payment: 0,
    down_payment_rate: null,
    down_payment_type: 'percent',
    principle: 0,
    ins_amount: 0,
    ins_period: null,
    ins_pay_day: moment().date() != 31 ? moment().date() : 30,
    ins_period_unit: 'month',
    ins_due_at: convertDateClientToDb(moment().add(1, 'M').toISOString(true)) + 'T00:00:00.000Z',
    id_employee: 1,
    contract_ref_link: '',
    is_active: true,
    rate_name: 'rate',
    rate_per_month: null,
    status_id: 1,
    contract_type_id: null,
    insurance_type_id: null,
    memo: '',
    commission: 0,
    commission_type: 1,
    commission_price: 0,
    penalty_fee: 0,
    penalty_fee_limit:0,
    unlock_fee: 0,
    tracking_fee: 0,
    preliminary_credit_assessment: 0,
    fee: 0,
    is_locked: false,
    condition_contract: '',
    price_total: 0,
    benefit: 0,
    has_advance_installments: false,
    prev_contract_count: null,
    contract_process_text: '',
    refinance_ref: '',
    customer_signature_at: ''
  })

  const [c_ref_link, set_c_ref_link] = useState(null)
  const [isLoadingClone, setLoadingClose] = useState(false)
  const [tmpData, setTmpData] = useState<any>({})

  const [formDataContractStatus, setFormDataContractStatus] = useState<any>({
    note: '',
    contentStatus: null
  })

  const [formDataLockedDeviceStatus, setFormDataLockedDeviceStatus] = useState<any>({
    isLockedStatus: false,
    provider_applock_id: "",
    history: []
  })

  const [isLoadingLockDevice, setIsLoadingLockDevice] = useState(false)
  const [tab, setTab] = useState<string>('contract')

  const [focus, setFocus] = useState(false)

  const [state, dispatchState] = useReducer(reducer, { status: false, link: '' });

  const openContract = (refinance_ref_link: any) => {
    open('/apps/contract/' + refinance_ref_link, '_blank')
  }

  const calCommission = (commissionData: any) => {
    let comPrice = 0
    if (commissionData?.commission_type == 1) {
      comPrice = (commissionData.commission / 100) * commissionData.principle
    } else if (commissionData?.commission_type == 2) {
      comPrice = (commissionData.commission / 100) * commissionData.price
    }
    return parseFloat(comPrice.toFixed(2))
  }

  // ร้านค้าลงนาม
  const [isModalRCOpen, setIsModalRCOpen] = useState(false)
  const openModalRC = () => setIsModalRCOpen(true)
  const closeModal = () => setIsModalRCOpen(false)
  const clearSignature = () => sigPad.current?.clear()
  const sigPad = useRef<SignatureCanvas | any>(null)
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null)

  const { mutate: shopSignPdf, isLoading: isLoadingShopSignPdf } = useGlobalMutation(url_api.contractShopRCSign, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        location.reload()
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })

      }
    },
    onError: (err: any) => { },
  })

  const handleSaveSignature = async () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      Swal.fire(t('warning'), t('sign_before_save'), 'warning')
      return
    }

    Swal.fire({
      title: t('signature_save_confirm_title'),
      text: t('signature_save_confirm_text'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b3f5c',
      cancelButtonColor: '#e7515a',
      confirmButtonText: t('confirm'),
      cancelButtonText: t('cancel'),
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const dataURL = sigPad.current.getCanvas().toDataURL('image/png')

          // ฟังก์ชันแปลง base64 เป็น File
          function dataURLtoFile(dataurl: string, filename: string): File {
            const arr = dataurl.split(',')
            const mime = arr[0].match(/:(.*?)/)![1]
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n)
            }
            return new File([u8arr], filename, { type: mime })
          }

          const signatureFile = dataURLtoFile(dataURL, 'signature_shop.png')
          const uploadPromise = uploadFile({ data: { file: signatureFile, type: 'contract' } })
          const result = await uploadPromise
          if (result?.data) {
            shopSignPdf({
              data: {
                "id_contract": contract_uuid,
                "file_name": result?.data?.file_name,
              }
            })
          }

        } catch (error: any) {
          console.error(t('error_occurred') + ":", error)
          Swal.fire(t('error_occurred'), error.message || t('cannot_upload'), 'error')
        }
      }
    })
  }

  useEffect(() => {
    if (isModalRCOpen) {
      window.addEventListener('resize', handleCanvasResize)
    }
    return () => {
      window.removeEventListener('resize', handleCanvasResize)
    }
  }, [isModalRCOpen])

  const handleCanvasResize = () => {
    if (sigPad.current) {
      const canvas = sigPad.current.getCanvas()
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext("2d")?.scale(ratio, ratio)
      sigPad.current.clear()
    }
  }

  const { mutate: fetchPDFshopRC, isLoading: isLoadingPDFshopRC } = useGlobalBlobMutation(url_api.contractShopRC + contract_uuid, {
    onSuccess: (res: any) => {
      if (res.statusCode === 400 || res.code === 400) {

        Swal.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      } else {
        const blob = new Blob([res], { type: 'application/pdf' })
        const objectUrl = window.URL.createObjectURL(blob)
        setPdfObjectUrl(objectUrl)
      }
    },
    onError: (error: any) => {
      console.log("error", error)
    }
  })

  const { mutate: fetchContractEachTabData, isLoading: contractEachTabLoading } = useGlobalMutation(url_api.contractFindData + `${contract_uuid}/?tab=${tab}`, {
    onSuccess(res: any) {
      switch (tab) {
        case 'contract':
          setStatusAction(res.data.status_id)
          setFormData({ ...res.data })
          setBuDetail(res.data.business_unit)
          setCustomerDetail(res.data.customer)
          setAssetDetail(res.data.asset)
          setShopDetail(res.data.shop)
          setRefinanceAction(res.data.refinance)
          setIsContractRefinance(res.data.is_refinance)
          set_c_ref_link(res?.data?.refinance_ref_link ?? null)
          if (!res.data.is_refinance && ['complete', 'on_process'].includes(res.data.refinance)) {
            setLockUpdate(true)
          }
          const shopDetail: any = [
            {
              value: res.data.shop.id,
              label: res.data.shop.name,
              data: res.data.shop,
            },
          ]
          setShopListData(shopDetail)
          const buDetail: any = [
            {
              value: res.data.business_unit.id,
              label: res.data.business_unit.name,
              data: res.data.business_unit,
            },
          ]
          setBuListData(buDetail)
          const customerDetail: any = [
            {
              value: res.data.customer.id,
              label: res.data.customer.name,
              data: res.data.customer,
            },
          ]
          setCustomerListData(customerDetail)
          const assetDetail: any = [
            {
              value: res.data.asset.id,
              label: res.data.asset.name,
              data: res.data.asset,
            },
          ]
          const data1 = res.data?.shop_groups?.map((item: any) => ({
            value: item.id,
            label: item.name,
            data: item,
          }))
          setShopGroupListData(data1)
          setTempAssetListData(assetDetail)
          setAssetListData(assetDetail)
          setContractRate(res.data.rate_per_month)
          setIsSelectRate(true)
          // console.log("fetchContractRate4")
          fetchContractRate({
            data: {
              id_shop: res.data.shop.id,
              id_business_unit: res.data.business_unit.id,
              id_shop_group: res.data.id_shop_group,
              ...(contract_uuid && {
                id_contract: contract_uuid
              })
            }
          })
          break
        case 'additional':
          setFormData((prev: any) => ({
            ...prev,
            contract_images: res.data.contract_images,
            contract_pdf_url: res.data.contract_pdf_url,
            e_contract_status: res.data.e_contract_status,
            e_contract_link: res.data.e_contract_link,
            contract_key: res.data.contract_key
          }))
          if (res.data?.contract_pdf_url) {
            setContractFile(res.data?.contract_pdf_url)
          }
          if (res.data?.contract_images.length > 0) {
            const imageArray: any = []
            res.data?.contract_images.forEach(async (item: any) => {
              if (item.type === 'image') {
                imageArray.push({ dataURL: item.image_url, name: item.name, id: item.id })
              } else {
                setIsVideo({ url: item.image_url, type: item.type })
              }
            })
            setImages(imageArray)
          }
          break
        case 'history':
          setHistoryLogData(res.data || [])
          // fetchHistoryLogData({ data: { id_contract: contract_uuid } })
          break
        case 'installment':
          setInstallmentsData(res.data)
        case 'credit':
          setFormDataContractStatus({
            contentStatus: res.data?.credit?.code ? res.data?.credit?.code : null,
            note: res.data?.credit?.note ? res.data?.credit?.note : null,
          })
          setStatusCreditHistoryList(res.data?.credit_histories)
          break
        case 'note-event':
          setContractMessage(res.data)
          break
        case 'device-lock':
          setFormDataLockedDeviceStatus({
            isLockedStatus: !res.data?.is_locked,
            history: res.data?.history,
            provider_applock_id: res.data?.provider_applock_id
          })
          setProviderList(res.data?.provider_applock.map((item: any) => ({
            value: item.id,
            label: item.title || item.service_provider,
          })) || [])
          break
      }
    },
  })

  const { mutate: fetchContractPDF } = useGlobalBlobMutation(url_api.contractCleanPDF + contract_uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData?.reference}_${moment().utc().format('DD-MM-yyyy')}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
      setPdfLoading(false)
    },
    onError: (error: any) => {
      setPdfLoading(false)
    },
  })

  const { mutate: fetchContractReceipts } = useGlobalBlobMutation(url_api.contractRC + contract_uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData?.reference}_rc_${moment().utc().format('DD-MM-yyyy')}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
      setPdfLoading(false)
    },
    onError: (error: any) => {
      setPdfLoading(false)
    },
  })

  const { mutate: fetchContractPDPA } = useGlobalBlobMutation(url_api.contractPDPA + contract_uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData?.reference}_pdpa_${moment().utc().format('DD-MM-yyyy')}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
      setPdfLoading(false)
    },
    onError: (error: any) => {
      setPdfLoading(false)
    },
  })

  const { mutate: fetchContractGoodsReceiptPDF } = useGlobalBlobMutation(url_api.contractGoodsReceiptPDF + contract_uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData?.reference}_goods_receipt_${moment().utc().format('DD-MM-yyyy')}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
      setPdfLoading(false)
    },
    onError: (error: any) => {
      setPdfLoading(false)
    },
  })

  const { mutate: fetchContractRequestToPayDATA, isLoading: loadContentPDF } = useGlobalMutation(url_api.contractRequestToPayDATA + contract_uuid, {
    onSuccess: (res: any) => {
      if (res?.data) {
        setHtml(res?.data.content)
        setActionReportModal(true)
      }
    },
    onError: (error: any) => {
      setPdfLoading(false)
    },
  })

  const { mutate: fetchContractRequestToPayPDF } = useGlobalBlobMutation(url_api.contractRequestToPayPDF + contract_uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData?.reference}_request_to_pay_${moment().utc().format('DD-MM-yyyy')}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
      setPdfLoading(false)
    },
    onError: (error: any) => {
      setPdfLoading(false)
    },
  })

  const { mutate: fetchCloseContractToPDF } = useGlobalBlobMutation(url_api.contractCloseToPDF + contract_uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData?.reference}_close_contract/_${moment().utc().format('DD-MM-yyyy')}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
      setPdfLoading(false)
    },
    onError: (error: any) => {
      setPdfLoading(false)
    },
  })

  const { mutate: fetchContractRequestDATA,isLoading:loadingRqData } = useGlobalMutation(url_api.contractRequestToPayDATA + contract_uuid, {
    onSuccess: (res: any) => {
      if (res?.data) {
        setDataReturnReceipt(res?.data)
        setFormReturnReceiptData(calculateTotalReturnReceipt({
          down_payment: res?.data?.down_payment ?? '', // ยอดดาวน์
          ins_amount: res?.data?.ins_period ?? '', // ค่างวด
          penalty_fee: res?.data?.penalty_fee ?? '', // ค่าดำเนินการล่าช้า
          unlock_fee: res?.data?.unlock_fee ?? '', // ค่าปลดล็อค
          other_fee: res?.data?.other_fee ?? '', // อื่น ๆ
        }))
      }
      setActionRetuenModal(true)
      setPdfLoading(false)
    },
    onError: (error: any) => {
      setPdfLoading(false)
    },
  })

   const submitFormReturnReceiptData = useCallback(
    async (event: any) => {
          fetchReturnReceiptToPDF({
            data: {
              down_payment: event?.down_payment && event?.down_payment !== '' ? event?.down_payment : 0,
              ins_amount: event?.ins_amount && event?.ins_amount !== '' ? event?.ins_amount : 0,
              penalty_fee: event?.penalty_fee && event?.penalty_fee !== '' ? event?.penalty_fee : 0,
              unlock_fee: event?.unlock_fee && event?.unlock_fee !== '' ? event?.unlock_fee : 0,
              other_fee: event?.other_fee && event?.other_fee !== '' ? event?.other_fee : 0,
              deduct_down_payment: event?.deduct_down_payment && event?.deduct_down_payment !== '' ? event?.deduct_down_payment : 0,
              total: event?.total && event?.total !== '' ? event?.total : 0,
            }
          })
    },
    []
  )

  const [formReturnReceiptData, setFormReturnReceiptData] = useState<any>({
    down_payment: '', // ยอดดาวน์
    ins_amount: '', // ค่างวด
    penalty_fee: '', // ค่าดำเนินการล่าช้า
    unlock_fee: '', // ค่าปลดล็อค
    other_fee: '', // อื่น ๆ
    deduct_down_payment: '', // หักดาวน์ 50%
    total: '', // ยอดรวม
  })

  const openReturnReceiptModal = () => {
    
    fetchContractRequestDATA({
      data: { only_data: true }
    })
  }

  const calculateTotalReturnReceipt = (data: any) => {
    let total = 0
    let down = Math.ceil((data?.down_payment ?? 0) * (50 / 100))
    // ยอดดาวน์
    if (data?.down_payment && data?.down_payment !== '' && data?.down_payment > 0) {
      total = total !== 0 ? (total - data?.down_payment) : data?.down_payment
    }
    // console.log('ยอดดาวน์', total)
    // ค่างวด
    if (data?.ins_amount && data?.ins_amount !== '' && data?.ins_amount > 0) {
      total = total !== 0 ? (total - data?.ins_amount) : data?.ins_amount
    }
    // console.log('ค่างวด', total)
    // ค่าดำเนินการล่าช้า
    if (data?.penalty_fee && data?.penalty_fee !== '' && data?.penalty_fee > 0) {
      total = total !== 0 ? (total - data?.penalty_fee) : data?.penalty_fee
    }
    // console.log('ค่าดำเนินการล่าช้า', total)
    // ค่าปลดล็อค
    if (data?.unlock_fee && data?.unlock_fee !== '' && data?.unlock_fee > 0) {
      total = total !== 0 ? (total - data?.unlock_fee) : data?.unlock_fee
    }
    // console.log('ค่าปลดล็อค', total)
    // อื่น ๆ
    if (data?.other_fee && data?.other_fee !== '' && data?.other_fee > 0) {
      total = total !== 0 ? (total - data?.other_fee) : data?.other_fee
    }
    // console.log('อื่น ๆ', total)
    // หักดาวน์ 50%
    if (data?.down_payment && data?.down_payment !== '' && data?.down_payment > 0) {
      total = (total - down)
    }
    // console.log('หักดาวน์ 50%', total)
    return {
      down_payment: data?.down_payment ?? '', // ยอดดาวน์
      ins_amount: data?.ins_amount ?? '', // ค่างวด
      penalty_fee: data?.penalty_fee ?? '', // ค่าดำเนินการล่าช้า
      unlock_fee: data?.unlock_fee ?? '', // ค่าปลดล็อค
      other_fee: data?.other_fee ?? '', // อื่น ๆ
      deduct_down_payment: down ?? '', // หักดาวน์ 50%
      total: total ?? '', // ผู้เช่าซื้อยินยอมที่จะได้รับเงิน
    }
  }

  useEffect(() => {
  }, [formReturnReceiptData])

  const { mutate: fetchReturnReceiptToPDF,isLoading:loadintRTPDF } = useGlobalBlobMutation(url_api.contractReturnReceiptToPDF + contract_uuid, {
    onSuccess: (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData?.reference}_return_receipt/_${moment().utc().format('DD-MM-yyyy')}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
    },
    onError: (error: any) => {
    },
  })

  const { mutate: fetchPayload } = useGlobalMutation(url_api.contractPayload, {
    onSuccess: (res: any) => {
      setContractTypeList(
        res.data.contract_type?.map((item: any) => ({
          value: item.id,
          label: item.name,
          data: item,
        }))
      )
      //
      setContractStatusList(
        res.data.contract_status?.map((item: any) => ({
          value: item.id,
          label: item.name,
          data: item,
        }))
      )
      //
      setInsuranceTypeList(
        res.data.insurance_type?.map((item: any) => ({
          value: item.id,
          label: item.name,
          data: item,
        }))
      )

      setStatusCreditList(
        res.data.credit_status?.map((item: any) => ({
          value: item.code,
          label: item.code + ' - ' + item.name,
          data: item,
        }))
      )

      setStatusCreditListV2(
        res.data.credit_status
          ?.filter((item: any) => item.code != 40)
          .map((item: any) => ({
            value: item.code,
            label: item.code + ' - ' + item.name,
            data: item,
          }))
      )

    },
  })

  const { mutate: shopSearchContains } = useGlobalMutation(url_api.contractGetShop, {
    onSuccess: (res: any) => {
      if (id_shop) {
        const find = res.data.find((a: any) => a.id === id_shop)
        setShopDetail(find)
        const shopDetail: any = [
          {
            value: find.id,
            label: find.name,
            data: find,
          },
        ]
        setShopListData(shopDetail)
        setFormData((prev: any) => ({ ...prev, id_shop: find.id }))
        setBuListData(
          find.business_units.map((item: any) => ({
            value: item.id,
            label: item.name,
            data: item,
          }))
        )
        customerSearchContains({ data: { query: '', id_shop: find.id, page: 1, pageSize: 10 } })
        assetSearchContains({ data: { query: '', id_shop: find.id, page: 1, pageSize: 10 } })
      } else {
        setShopListData(
          res.data.map((item: any) => ({
            value: item.id,
            label: item.name,
            data: item,
          }))
        )
      }
    },
    onError: () => {
      console.error('Failed to fetch dashboard data')
    },
  })

  const { mutate: shopSearchContainsBu } = useGlobalMutation(url_api.contractGetShop, {
    onSuccess: (res: any) => {
      const find = id_shop ? res.data.find((a: any) => a.id === id_shop) : res.data.find((a: any) => a.id === shopDetail?.id)
      // setBuListData(
      //   find.business_unit.map((item: any) => ({
      //     value: item.id,
      //     label: item.name,
      //     data: item,
      //   }))
      // )
    },
    onError: () => {
      console.error('Failed to fetch dashboard data')
    },
  })

  const { mutate: contractSearchContains, isLoading: loadingRef } = useGlobalMutation(url_api.contractSearchContains, {
    onSuccess: (res: any) => {
      if (res?.data?.reference) {
        if (!res?.data?.contract_date) {
          processRefinance(res?.data?.reference, shopDetail?.id)
        } else {
          setCloneData(true)
          const { id, uuid, asset, customer, insurance_type, shop, credit, is_closed, ...filteredParam } = res.data
          setFormData({
            ...filteredParam,
            ins_pay_day: moment().date() != 31 ? moment().date() : 30,
            ins_due_at: convertDateClientToDb(moment().add(1, 'month').toISOString(true)) + 'T00:00:00.000Z',
            reference: "",
            status_id: 1,
            contract_date: convertDateClientToDb(moment().toISOString(true)) + 'T00:00:00.000Z',
            id_shop: tmpData.id_shop,
            contract_type_id: tmpData?.contract_type_id,
            insurance_type_id: tmpData?.insurance_type_id,
            is_refinance: true,
            refinance_ref: res.data.reference,
            down_payment_type: 'percent',
            has_advance_installments: false,
            // down_payment_rate:0,
            // ins_period:6,
            // rate_per_month:1
            //
          })
          //condition_contract
          setBuDetail(res.data.business_unit)

          setCustomerDetail(res.data.customer)
          setAssetDetail(res.data.asset)
          const buDetail: any = [
            {
              value: res.data.business_unit.id,
              label: res.data.business_unit.name,
              data: res.data.business_unit,
            },
          ]
          setBuListData(buDetail)
          const customerDetail: any = [
            {
              value: res.data.customer.id,
              label: res.data.customer.name,
              data: res.data.customer,
            },
          ]
          setCustomerListData(customerDetail)
          const assetDetail: any = [
            {
              value: res.data.asset.id,
              label: res.data.asset.name,
              data: res.data.asset,
            },
          ]
          setShopGroupListData(
            res.data?.shop_groups?.map((item: any) => ({
              value: item.id,
              label: item.name,
              data: item,
            }))
          )

          setTempAssetListData(assetDetail)
          setAssetListData(assetDetail)
          //setContractRate(res.data.rate_per_month)
          setIsSelectRate(true)
          fetchContractRate({
            data: {
              id_shop: res.data.id_shop,
              id_business_unit: res.data.business_unit.id,
              id_contract: res.data.uuid
            }
          })
          setLoadingClose(false)

        }

      } else {
        setLoadingClose(false)
        toast.fire({
          icon: 'error',
          title: res?.message ?? t('error_occurred'),
          padding: '10px 20px',
        })
      }

    },
    onError: () => {
      setLoadingClose(false)
      toast.fire({
        icon: 'error',
        title: t('error_occurred'),
        padding: '10px 20px',
      })
    },
  })

  const { mutate: fetchShopData } = useGlobalMutation(url_api.shopFind, {
    onSuccess: (res: any) => {
      shopSearchContains({ data: { query: res.data.name, page: 1, pageSize: 1 } })
    },
    onError: () => {
      console.error('Failed to fetch dashboard data')
    },
  })

  // const { mutate: fetchHistoryLogData } = useGlobalMutation(url_api.contractGetLogHistory, {
  //   onSuccess: (res: any) => {
  //     setHistoryLogData(res.data || [])
  //   },
  //   onError: () => {
  //     console.error('Failed to fetch historyLog data')
  //   },
  // })

  const { mutate: customerSearchContains } = useGlobalMutation(url_api.customerSearchContains, {
    onSuccess: (res: any) => {
      setCustomerListData(
        res.data.map((item: any) => ({
          value: item.id,
          label: item.name,
          data: item,
        }))
      )
    },
  })

  const { mutate: assetSearchContains } = useGlobalMutation(url_api.assetSearchContains, {
    onSuccess: (res: any) => {
      setAssetListData([
        ...tempAssetListData,
        ...res.data.map((item: any) => ({
          value: item.id,
          label: item.name,
          data: item,
        })),
      ])
    },
  })

  const { mutate: fetchContractRate } = useGlobalMutation(url_api.contractGetRate, {
    onSuccess: (res: any, variables: { props: FormikProps<Contract> }) => {
      setIsSelectRate(true)
      if (res.statusCode === 200 || res.code === 200) {
        setContractRate(res.data)
        if (variables.props) {
          variables.props.setFieldValue('id_shop_group', res.data.id_shop_group)
          if (variables.props?.values?.is_refinance == true) {
            variables.props.setFieldValue('ins_period', 6)
            variables.props.setFieldValue('rate_per_month', res.data.inr_6)
          } else {
            variables.props.setFieldValue('rate_per_month', res.data.inr_3)
          }

        }
      } else {
        toast.fire({
          icon: 'warning',
          title: res.message,
          padding: '10px 20px',
        })
        setContractRate(null)
      }
    },
  })

  const { mutate: contractCreate, isLoading: isLoadingCreate } = useGlobalMutation(url_api.contractCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        navigate('/apps/contract/' + res.data.id + '/' + res.data.uuid)
        location.reload()
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })

      }
    },
    onError: (err: any) => { },
  })

  const { mutate: contractUpdate, isLoading: isLoadingUpdate } = useGlobalMutation(url_api.contractUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        fetchContractEachTabData({})
      } else {

        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
    onError: (err: any) => { },
  })

  const { mutate: contractUpdateStatus, isLoading: isLoadingUpdateStatus } = useGlobalMutation(url_api.contractUpdateStatus, {
    onSuccess: (res: any) => {
      if (res.statusCode !== 400) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        fetchContractEachTabData({})
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutateAsync: contractUpdateStatusV2, isLoading: isLoadingUpdateStatusv2 } = useGlobalMutation(url_api.contractUpdateStatus, {
    onSuccess: (res: any) => {
      if (res.statusCode !== 400) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        setTab('contract')
        fetchContractEachTabData({})
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: contractComplete, isLoading: isLoadingComplete } = useGlobalMutation(url_api.contractPostComplete, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 && res.code === 200) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        fetchContractEachTabData({})
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    }
  })

  const { mutate: contractCancel, isLoading: isLoadingCancel } = useGlobalMutation(url_api.cancelContract, {
    onSuccess: (res: any) => {
      if (res.statusCode !== 400) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        fetchContractEachTabData({})
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: contractUpdateCredit } = useGlobalMutation(url_api.contractUpdateCredit, {
    onSuccess: (res: any) => {
      if (res.statusCode !== 400) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        fetchContractEachTabData({})
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
    onError: () => {
      console.error('Failed to fetch dashboard data')
    },
  })

  const { mutate: updateLockDevice } = useGlobalMutation(url_api.updateLockDevice, {
    onSuccess: (res: any) => {
      if (res.statusCode !== 400) {
        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        setIsLoadingLockDevice(true)
        setTimeout(() => {
          setIsLoadingLockDevice(false)
          fetchContractEachTabData({})
        }, 5000)
      } else {
        toast.fire({
          icon: 'error',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
    onError: () => {
      console.error('Failed to fetch dashboard data')
    },
  })

  const { mutateAsync: uploadFile, isLoading: isUpload } = useUploadMutation({
    onSuccess: (res: any) => {

    },
    onError: (err: any) => {

    },
  })

  const [uploadPercentage, setUploadPercentage] = useState(0)

  const uploadFileWithLoading = async (e: any) => {
    const userStore = localStorage.getItem(mode)
    const parsedUserStore = userStore ? JSON.parse(userStore) : null

    let data = new FormData()
    data.append('file', e.data.file)
    data.append('type', e.data.type)

    return await axios
      .post(process.env.BACKEND_URL + url_api.uploadfile, data, {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          // 'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${parsedUserStore?.access_token}`,
        },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadPercentage(percentCompleted)
        },
      })
      .then((response) => {
        // Reset upload percentage
        setUploadPercentage(0)
        return response.data
      })
      .catch((error) => {
        setUploadPercentage(0)
        console.error('Error uploading file:', error)
      })
  }

  const { mutate: contractUpDoc, isLoading: isLoadingUpDoc } = useGlobalMutation(url_api.contractUpDocV2, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'อัพโหลดเสร็จสิน',
          padding: '10px 20px',
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

  const { mutate: contractAddMessage, isLoading: contractAddMessageLoading } = useGlobalMutation(url_api.contractAddMessage, {
    onSuccess: () => {
      fetchContractEachTabData({})
    },
  })

  const { mutate: contractAppvRestart, isLoading: loadingRestart } = useGlobalMutation(url_api.contractAppvRestart, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {

        toast.fire({
          icon: 'success',
          title: t('save_success'),
          padding: '10px 20px',
        })
        setTimeout(() => {
          location.reload()
        }, 2000)

      } else {
        toast.fire({
          icon: 'error',
          title: res?.message,
          padding: '10px 20px',
        })
      }
    },
    onError: (error: any) => {
      toast.fire({
        icon: 'warning',
        title: error.message,
        padding: '10px 20px',
      })
    }
  })

  const { mutateAsync: addContractImage } = useGlobalMutation(url_api.contractAddImage)
  const { mutateAsync: removeContractImage } = useGlobalMutation(url_api.contractRemoveImage)

  useEffect(() => {
    if (formData?.contract_key && formData?.e_contract_status) {
      getContractSignEsign()
    } else if (formData?.e_contract_link && !formData?.e_contract_status && tab == "additional") {
      getContractEsign();
    }
  }, [formData]);

  useEffect(() => {

    if (formData.is_completed) {
      dispatch(setSidebarActive(['contract', '/apps/contract/list-complete']))
    }
    else if (statusAction === 5) {
      dispatch(setSidebarActive(['contract', '/apps/contract/list-credit']))
    }
    else if (statusAction > 5) {
      dispatch(setSidebarActive(['contract', '/apps/contract/list-cancel']))
    }
    else {
      dispatch(setSidebarActive(['contract', '/apps/contract/list']))
    }
  }, [statusAction])

  useEffect(() => {
    dispatch(setPageTitle(t('contract')))
    fetchPayload({})

    if (id_shop) {
      if (!contract_uuid) {
        fetchShopData({ id: id_shop })
      }
    }
  }, [])

  // useEffect(() => {
  //   if (contract_uuid) {
  //     fetchContractEachTabData({})
  //     // fetchContractData({ id: contract_uuid })
  //   }
  // }, [contract_uuid])

  useEffect(() => {
    if (contract_uuid) {
      fetchContractEachTabData({})

      if (tab == 'additional') {
        fetchPDFshopRC({})
      }
    }
  }, [tab])

  const handleContractUpdateStatus = (props: any, status_id: number) => {
    contractUpdateStatus({
      data: {
        id_contract: contract_uuid,
        status_id: status_id,
        memo: props.values.memo,
      },
    })
  }

  const handleContractCancel = (reason_cancel: string, password: string, status_id: number) => {
    contractCancel({
      data: {
        id_contract: contract_uuid,
        status_id: status_id,
        reason_cancel: reason_cancel,
        password: password
      },
    })
  }

  const onContractFileChange = (event: any) => {
    const file = event.target.files[0]
    setContractFile(file)
  }

  const onImgChange = async (imageList: ImageListType) => {
    const resizedImages = await resizeImage(imageList)
    setImages(resizedImages)
  }

  const upLoadDoc = async () => {
    let param: any = {}
    const deletePromises: any[] = []
    const uploadPromises = []
    if (contractFile) {
      if (!contractFile.toString().includes('http')) {
        uploadPromises.push(uploadFile({ data: { file: contractFile, type: 'contract' } }))
      } else {
        uploadPromises.push(Promise.resolve({}))
      }
    } else {
      uploadPromises.push(Promise.resolve({}))
      param.contract_pdf_url = null
    }
    if (video.length > 0) {
      if (!video.toString().includes('http')) {
        uploadPromises.push(uploadFileWithLoading({ data: { file: video[0], type: 'contract' } }))
        formData?.contract_images.forEach((item: any) => {
          if (item.type === 'video') {
            deletePromises.push(removeContractImage({ data: { id_image: item.id, id_contract: contract_id } }))
          }
        })
      } else {
        uploadPromises.push(Promise.resolve({}))
      }
    } else {
      if (isVideo === null) {
        formData?.contract_images.forEach((item: any) => {
          if (item.type === 'video') {
            deletePromises.push(removeContractImage({ data: { id_image: item.id, id_contract: contract_id } }))
          }
        })
      }
      uploadPromises.push(Promise.resolve({}))
    }


    // formData?.contract_images.forEach((item: any) => {
    //     const isDeleted = images.find((a: any) => a.id === item.id)
    //     if (_.isUndefined(isDeleted)) {
    //         if (item.type === 'images') {
    //             deletePromises.push(removeContractImage({ data: { id_image: item.id, id_contract: contract_id } }))
    //         }
    //     }
    // })

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises)
    }

    images.forEach((item: any) => {
      if (_.isUndefined(item?.id)) {
        uploadPromises.push(uploadFile({ data: { file: item.file, type: 'contract' } }))
      }
    })



    if (uploadPromises.length > 0) {
      const results = await Promise.all(uploadPromises)
      if (results[0]?.data?.file_name) {
        param.contract_pdf_url = results[0]?.data?.file_name
      }

      const addContractImg: any[] = []
      if (results[1].data?.file_name) {
        addContractImg.push(
          addContractImage({
            data: {
              id_contract: contract_id,
              name: results[1]?.data?.file_name,
              image_url: results[1]?.data?.file_name,
              extension: 'extension',
              size: results[1]?.data?.size,
              type: 'video',
            },
          })
        )
      }
      results
        .filter((_, index) => index !== 0 && index !== 1)
        .forEach((item: any) => {
          if (item?.code !== 'error') {
            addContractImg.push(
              addContractImage({
                data: {
                  id_contract: contract_id,
                  name: item.data.file_name,
                  image_url: item.data.file_name,
                  extension: 'extension',
                  size: item.data.size,
                },
              })
            )
          } else {
            toast.fire({
              icon: 'error',
              title: t('file_upload_error_image_only'),
              padding: '10px 20px',
            })
          }
        })
      if (addContractImg.length > 0) {
        await Promise.all(addContractImg)
      }
    }
    if (param?.contract_pdf_url) {
      contractUpDoc({ data: { id_contract: contract_uuid, ...param } })
    }

    if (mode == 'admin' && statusAction == 5) {
      toast.fire({
        icon: 'success',
        title: t('save_success'),
        padding: '10px 20px',
      })
    } else {
      const statusContract = await contractUpdateStatusV2({ data: { id_contract: contract_uuid, status_id: 4, memo: formData.memo } })
    }
  }

  const getStatusClassName = (status: string, is_due?: boolean) => {
    switch (status) {
      case 'complete':
        return 'btn-success'
      default:
        return statusAction < 5 ? 'btn-dark' : formData.is_closed ? 'btn-dark' : is_due ? 'btn-danger' : 'btn-dark'
    }
  }

  const getStatusLockClassName = (status: string) => {
    if (status.split(' ')[0] == 'สำเร็จ') {
      return ' px-3 py-1 rounded-[8px] text-white bg-green-500'
    } else if (status.split(' ')[0] == 'ไม่สำเร็จ') {
      return ' px-3 py-1 rounded-[8px] text-white bg-danger'
    } else {
      return
    }
  }

  const getStatusText = (status: string, is_due?: boolean, invoice_type?: string) => {
    switch (status) {
      case 'complete':
        return invoice_type == 'close_contract' ? 'ชำระแล้ว (ปิดสัญญา)' : 'ชำระแล้ว' //invoice_type
      default:
        return statusAction < 5 ? 'ยังไม่ครบกำหนด' : formData.is_closed ? 'ปิดสัญญา' : is_due ? 'ค้างชำระ' : 'ยังไม่ครบกำหนด'
    }
  }

  const getStatusAction = (item: any) => {
    let isPaymentEnabled: boolean
    if (statusAction < 5) { return "" }
    if (item.ins_no <= 1) {
      isPaymentEnabled = true
    } else {
      const prevPayment = installmentsData.find((a: any) => a.ins_no === (item.ins_no - 1))
      isPaymentEnabled = prevPayment?.status === 'complete'
    }

    switch (item.status) {
      case 'complete':
        return (
          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            style={{ display: 'block', margin: 'auto' }}
            onClick={() => goPayment(item)}
          >
            ดูข้อมูล
          </button>
        )
      default:
        return (
          (!formData.is_closed && statusAction === 5 && !lockUpdate) ? (
            <button
              type="button"
              className={`btn btn-sm ${isPaymentEnabled ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
              style={{ display: 'block', margin: 'auto', color: isPaymentEnabled ? '' : 'gray' }}
              onClick={() => isPaymentEnabled && goPayment(item)}
              disabled={!isPaymentEnabled || formData.on_payment_process === "close_contract"}
            >
              {formData.on_payment_process == "pay_installment" ? 'กำลังชำระเงิน' : 'รับชำระเงิน'}
            </button>
          ) : '-'
        )
    }
  }

  const goPayment = (item: any) => {
    if (item.invoice_type == 'close_contract' && item.status == 'complete') {
      navigate('/apps/contract/close-contract/' + contract_id + '/' + contract_uuid)
    } else {
      navigate('/apps/contract/payment/' + contract_id + '/' + contract_uuid + '/' + item.id)
    }

  }

  const submitFormPDF = () => {
    setPdfLoading(true)
    console.log(html)
    if (!pdfLoading) {
      fetchContractRequestToPayPDF({ data: { content: html ?? null } })
    }

  }

  const submitForm = useCallback(
    async (event: any) => {
      Swal.fire({
        title: t('contract_save_confirm_title'),
        text: t('contract_save_confirm_text'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: themeInit.color.themePrimary,
        cancelButtonColor: '#d33',
        confirmButtonText: t('confirm'),
        cancelButtonText: t('cancel'),
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {

          const param = {
            ...event,
            price: +event.price,
            down_payment: +event.down_payment,
            price_total: event.ins_amount * event.ins_period + parseInt(event.down_payment),
          }
          //refinance_ref
          // ไม่ต้องส่งข้อมูลที่ไม่จำเป็น
          const { contract_process_text, contract_pdf_url, contract_ref_link, created_at, prev_contract_count, prev_contract_time, reason_cancel, approved_by, approved_time, is_closed, is_completed, business_unit, asset, customer, insurance_type, shop, credit, ...filteredParam } = param
          if (pageAction) {
            contractUpdate({
              data: filteredParam,
              id: contract_uuid
            })
          } else {
            contractCreate({
              data: filteredParam,
            })
          }
        }
      })
    },
    [contractCreate, pageAction]
  )

  const submitFormCredit = useCallback(
    async (event: any) => {
      Swal.fire({
        title: t('contract_save_confirm_title'),
        text: t('contract_status_save_confirm_text'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: themeInit.color.themePrimary,
        cancelButtonColor: '#d33',
        confirmButtonText: t('confirm'),
        cancelButtonText: t('cancel'),
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const findStatusId: any = statusCreditList.find((a: any) => a.value === event.contentStatus)
          contractUpdateCredit({
            data: {
              id_contract: contract_uuid,
              credit_id: findStatusId?.data?.id,
              note: event.note
            }
          })
        }
      })
    },
    [contractUpdateCredit, contract_uuid, statusCreditList]
  )

  const submitFormLockedDevice = useCallback(
    async (event: any) => {
      Swal.fire({
        title: t('contract_save_confirm_title'),
        text: t('contract_lock_save_confirm_text'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: themeInit.color.themePrimary,
        cancelButtonColor: '#d33',
        confirmButtonText: t('confirm'),
        cancelButtonText: t('cancel'),
        reverseButtons: true,
        html:
          `<label for="password" style="display: block text-align: left font-size: 1rem margin-top: 10px color: #000000 color: #000000">${t('user_password_label')}</label>
          <input id="password" type="password" type="text" class="swal2-input" style="margin: 0 !important width: 100% font-size: 1rem color: #000000" placeholder="${t('user_password_placeholder')}">`,
        preConfirm: () => {
          const password = (document?.getElementById('password') as HTMLInputElement)?.value
          if (!password) {
            Swal.showValidationMessage(t('fill_all_fields_validation'))
            return false
          }

          return { password }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const { password } = result.value
          updateLockDevice({
            data: {
              id_contract: contract_uuid,
              is_locked: event.isLockedStatus,
              provider_applock_id: event.provider_applock_id,
              password: password
            }
          })
        }
      })
    },
    [updateLockDevice, contract_uuid]
  )

  const sendPicharana = async (props: any) => {

    contractUpdate({
      data: { ...props.values, status_id: 2 },
      id: contract_uuid
    })
  }

  const sendAnumad = async (props: any) => {
    contractUpdate({
      data: { ...props.values, status_id: 3 },
      id: contract_uuid
    })
  }

  const submitMessage = useCallback(
    async (event: any) => {
      contractAddMessage({ data: { message: event.message, id_contract: contract_uuid } })
    },
    [contractAddMessage, contract_uuid]
  )

  const handleChangeSelect = (props: FormikProps<Contract>, event: any, name: any) => {
    switch (name) {
      case 'id_shop':
        setShopDetail(event.data)
        setBuListData(
          event.data.business_units.map((item: any) => ({
            value: item.id,
            label: item.name,
            data: item,
          }))
        )
        // setShopGroupListData(
        //   event.data.business_units?.shop_groups?.map((item: any) => ({
        //     value: item.id,
        //     label: item.name,
        //     data: item,
        //   }))
        // )
        setBuDetail({})
        setCustomerListData([])
        setCustomerDetail({})
        setAssetListData([])
        setAssetDetail({})
        customerSearchContains({ data: { query: '', id_shop: event.data.id, page: 1, pageSize: 10 } })
        assetSearchContains({ data: { query: '', id_shop: event.data.id, page: 1, pageSize: 10 } })
        break
      case 'id_business_unit':
        setBuDetail(event.data)
        let shop_group_main = 0
        if (event.data?.shop_groups.length > 0) {
          shop_group_main = event.data?.shop_groups[0].id
        }
        setShopGroupListData(
          event.data?.shop_groups?.map((item: any) => ({
            value: item.id,
            label: item.name,
            data: item,
          }))
        )

        if (formData?.is_refinance) {
          props.setFieldValue('commission', event.data.commission || 0)
          props.setFieldValue('penalty_fee', event.data.penalty_fee || 0)
          props.setFieldValue('penalty_fee_limit', event.data.penalty_fee_limit || 0)
          props.setFieldValue('unlock_fee', event.data.unlock_fee || 0)
          props.setFieldValue('tracking_fee', event.data.tracking_fee || 0)
          props.setFieldValue('preliminary_credit_assessment', event.data.preliminary_credit_assessment || 0)
          props.setFieldValue('benefit', event.data.benefit)
          props.setFieldValue('fee', event.data.fee || 0)
          props.setFieldValue('condition_contract', event.data.condition_contract)
          props.setFieldValue('commission_type', event.data.commission_type)
          props.setFieldValue('down_payment_rate', 0.2)
          fetchContractRate({
            data: {
              id_shop: props.values.id_shop,
              id_business_unit: event.value,
              ...(contract_uuid && {
                id_contract: contract_uuid
              })
            }, props
          })
        } else {
          setAssetListData([])
          if (!formData?.id) {
            setAssetDetail({})
            props.setFieldValue('price', 0)
            props.setFieldValue('down_payment', 0)
            props.setFieldValue('principle', 0)
            props.setFieldValue('ins_period', null)
            props.setFieldValue('ins_pay_day', moment().date())
            props.setFieldValue('down_payment_rate', 0.2)
            props.setFieldValue('id_shop_group', shop_group_main)
            props.setFieldValue('commission', event.data.commission || 0)
            props.setFieldValue('penalty_fee', event.data.penalty_fee || 0)
            props.setFieldValue('penalty_fee_limit', event.data.penalty_fee_limit || 0)
            props.setFieldValue('unlock_fee', event.data.unlock_fee || 0)
            props.setFieldValue('tracking_fee', event.data.tracking_fee || 0)
            props.setFieldValue('preliminary_credit_assessment', event.data.preliminary_credit_assessment || 0)

            props.setFieldValue('benefit', event.data.benefit)
            props.setFieldValue('fee', event.data.fee || 0)
            props.setFieldValue('condition_contract', event.data.condition_contract)
            props.setFieldValue('commission_type', event.data.commission_type)

          }
          fetchContractRate({
            data: {
              id_shop: props.values.id_shop,
              id_business_unit: event.value,
              id_shop_group: shop_group_main,
              ...(contract_uuid && {
                id_contract: contract_uuid
              })
            }, props
          })
        }


        break
      case 'id_customer':
        setCustomerDetail(event.data)
        break
      case 'id_asset':
        setAssetDetail(event.data)
        props.setFieldValue('price', event.data.price || 0)
        props.setFieldValue('principle', event.data.price || 0)
        break
      case 'ins_period':
        if (contractRate) {
          props.setFieldValue('rate_per_month', contractRate[event.ref])
        }
        break
      case 'id_shop_group':
        fetchContractRate({
          data: {
            id_shop: props.values.id_shop,
            id_business_unit: props.values.id_business_unit,
            id_shop_group: event.value,
            ...(contract_uuid && {
              id_contract: contract_uuid
            })
          }, props
        })
        break

      default:
    }
  }

  const handleSearch = (props: any, event: any, name: any) => {
    switch (name) {
      case 'id_shop':

        shopSearchContains({ data: { query: event, page: 1, pageSize: 10, contract_type_id: props.values?.contract_type_id ?? 0, } })
        break
      case 'id_customer':
        customerSearchContains({ data: { query: event, id_shop: shopDetail.id, page: 1, pageSize: 10 } })
        break
      case 'id_asset':
        assetSearchContains({ data: { query: event, id_shop: shopDetail.id, page: 1, pageSize: 10 } })
        break
      default:
    }
  }

  const onError = () => {
    toast.fire({
      icon: 'error',
      title: t('contract_image_limit_error'),
      padding: '10px 20px',
    })
  }

  const getFileType = (url: any) => {
    // Extract the file extension from the URL
    const extensionMatch = url.match(/\.(jpg|jpeg|png|gif|pdf|jfif)(\?.*)?$/)
    if (extensionMatch) {
      const extension = extensionMatch[1].toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        return 'image'
      }
      if (extension === 'pdf') {
        return 'pdf'
      }
    }
    return 'unknown'
  }

  const closeContact = async () => {
    // TODO: อาจจะรวมกัน แล้ว clear process ทิ้งก่อนปิดสัญญา
    // if(formData.on_payment_process) {
    //     Swal.fire({
    //         title: 'ไม่สามารถดำเนินการได้ในขณะนี้',
    //         text: 'เนื่องจากมี QR Code ที่กำลังดำเนินการอยู่',
    //         confirmButtonText: 'ยืนยัน',
    //         reverseButtons: true,
    //         didOpen: () => {
    //             const confirmButton: any = Swal.getConfirmButton()
    //             confirmButton.style.backgroundColor = themeInit.color.themePrimary
    //             confirmButton.style.color = 'white'

    //         }
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             navigate('/apps/contract/close-contract/' + contract_id + '/' + contract_uuid)
    //         }
    //     })
    // } else {
    //     Swal.fire({
    //         title: 'คุณต้องทำงานการปิดสัญญาใช่หรือไม่',
    //         text: '',
    //         showCancelButton: true,
    //         confirmButtonText: 'ยืนยัน',
    //         cancelButtonText: 'ยกเลิก',
    //         reverseButtons: true,
    //         didOpen: () => {
    //             const confirmButton: any = Swal.getConfirmButton()
    //             const cancelButton: any = Swal.getCancelButton()
    //             confirmButton.style.backgroundColor = themeInit.color.themePrimary // สีเขียว
    //             confirmButton.style.color = 'white'
    //             cancelButton.style.backgroundColor = '#2196F3' // สีฟ้า
    //             cancelButton.style.color = 'white'
    //         }
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             navigate('/apps/contract/close-contract/' + contract_id + '/' + contract_uuid)
    //         }
    //     })
    // }
    if (formData.on_payment_process == "close_contract") {
      navigate('/apps/contract/close-contract/' + contract_id + '/' + contract_uuid)
    } else {
      Swal.fire({
        title: t('contract_close_confirm_text'),
        text: '',
        showCancelButton: true,
        confirmButtonText: t('confirm'),
        cancelButtonText: t('cancel'),
        reverseButtons: true,
        didOpen: () => {
          const confirmButton: any = Swal.getConfirmButton()
          const cancelButton: any = Swal.getCancelButton()
          confirmButton.style.backgroundColor = themeInit.color.themePrimary // สีเขียว
          confirmButton.style.color = 'white'
          cancelButton.style.backgroundColor = '#2196F3' // สีฟ้า
          cancelButton.style.color = 'white'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/apps/contract/close-contract/' + contract_id + '/' + contract_uuid)
        }
      })
    }


    // Swal.fire({
    //     title: 'เลือกวิธีการชำระเงิน',
    //     text: 'กรุณาเลือกวิธีการชำระเงินของคุณ',
    //     showCancelButton: true,
    //     confirmButtonText: 'เงินสด',
    //     cancelButtonText: 'QR Code',
    //     reverseButtons: true,
    //     didOpen: () => {
    //         const confirmButton: any = Swal.getConfirmButton()
    //         const cancelButton: any = Swal.getCancelButton()

    //         confirmButton.style.backgroundColor = themeInit.color.themePrimary // สีเขียว
    //         confirmButton.style.color = 'white'
    //         cancelButton.style.backgroundColor = '#2196F3' // สีฟ้า
    //         cancelButton.style.color = 'white'
    //     }
    // }).then((result) => {
    //     if (result.isConfirmed) {
    //     } else if (result.dismiss === Swal.DismissReason.cancel) {
    //     }
    // })
  }

  const uploadContent = () => {
    const fileType = getFileType(JSON.stringify(contractFile))

    return (
      <>
        <div className="upload-container">
          <div className="custom-file-container" data-upload-id="contractDoc">
            <div className="label-container">
              <p>1. สัญญา อัพโหลดได้ทั้ง pdf และ รูปภาพ </p>
              {(statusAction === 3 || (statusAction === 4 && admin_business_unit_role)) && (
                <button
                  type="button"
                  className="custom-file-container__image-clear"
                  title="Clear Image"
                  onClick={() => {
                    setContractFile(null)
                  }}
                >
                  x
                </button>
              )}
            </div>
            <p className="custom-file-container__custom-file hidden"></p>
            {(statusAction === 3 || (statusAction === 4 && admin_business_unit_role)) && <input type="file" className="" onChange={onContractFileChange} />}
            {fileType === 'pdf' ? (
              <div className="pdf-viewer-container">
                <iframe src={contractFile} width="800px" height="600px" className="block mx-auto my-8" style={{ maxWidth: '100%' }}>
                  This browser does not support PDFs. Please download the PDF to view it:
                  <a href={contractFile}>Download PDF</a>
                </iframe>
              </div>
            ) : fileType === 'image' ? (
              <img
                src={contractFile}
                alt="img"
                className={'m-auto pointer'}
                onClick={() => {
                  setPictureURL(contractFile)
                  setIsOpenPic(true)
                }}
              />
            ) : (
              ''
            )}
          </div>
        </div>
        <hr className="border-white-light dark:border-[#1b2e4b] my-6 w-full" />
        <div className="flex flex-row mt-6 gap-4">
          <div className="upload-container w-full">
            <div className="custom-file-container" data-upload-id="firstImage">
              <div className="label-container">
                <p>2. รูปภาพประกอบสัญญา </p>
                {(statusAction === 3 || (statusAction === 4 && admin_business_unit_role)) && (
                  <button
                    type="button"
                    className="custom-file-container__image-clear"
                    title="Clear Image"
                    onClick={() => {
                      setImages([])
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              <div></div>

              <input type="file" className={`custom-file-container__custom-file__custom-file-input hidden`} accept="image/*" />
              <input type="hidden" name="MAX_FILE_SIZE1" value="10485760" />
              <div>
                {statusAction !== 3 && userRole === 'shop' && (
                  <Carousel
                    items={images.map((item: any) => {
                      return { image_url: item.dataURL }
                    })}
                  />
                )}
                {(statusAction === 3 || (statusAction === 4 && admin_business_unit_role) || (statusAction === 5 && admin_business_unit_role)) && (
                  <ImageUploading multiple value={images} onChange={onImgChange} onError={onError} maxNumber={15}>
                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                      <div className="upload__image-wrapper">
                        <button className="custom-file-container__custom-file__custom-file-control" onClick={onImageUpload} type="button">
                          เลือกไฟล์...
                        </button>
                        <div className="grid gap-4 sm:grid-cols-3 grid-cols-1 pt-[70px]">
                          {imageList.map((image, index) => (
                            <div key={index} className="custom-file-container__image-preview relative">
                              {((statusAction === 3 && image?.id === undefined) || (statusAction === 4 && image?.id === undefined) || (statusAction === 5 && image?.id === undefined)) && (
                                <button
                                  type="button"
                                  className="custom-file-container__image-clear bg-dark-light dark:bg-dark dark:text-white-dark rounded-full block w-fit p-1 absolute top-0 left-0 z-10"
                                  title="Clear Image"
                                  onClick={() => {
                                    onImageRemove(index)
                                  }}
                                >
                                  ×
                                </button>
                              )}
                              {((statusAction === 3) || (statusAction === 4 && admin_business_unit_role)) && (<button
                                type="button"
                                className="custom-file-container__image-clear bg-dark-light dark:bg-dark dark:text-white-dark rounded-full block w-fit p-1 absolute top-0 left-0 z-10"
                                title="Clear Image"
                                onClick={() => {
                                  Swal.fire({
                                    title: 'ลบรูปภาพ',
                                    text: 'คุณต้องการรูปภาพนี้ใช่หรือไม่?',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: themeInit.color.themePrimary,
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'ยืนยัน',
                                    cancelButtonText: 'ยกเลิก',
                                    reverseButtons: true,
                                  }).then(async (result) => {
                                    if (result.isConfirmed) {
                                      await removeContractImage({ data: { id_image: image.id, id_contract: contract_id } })
                                      onImageRemove(index)
                                    }
                                  })
                                }}
                              >
                                ×
                              </button>)}


                              <div key={index} className="custom-file-container__image-preview relative">
                                <img
                                  src={image.dataURL}
                                  alt="img"
                                  className={'m-auto pointer'}
                                  onClick={() => {
                                    setPictureURL(image.dataURL)
                                    setIsOpenPic(true)
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </ImageUploading>
                )}


              </div>
            </div>
          </div>
        </div>
        <hr className="border-white-light dark:border-[#1b2e4b] my-6 w-full" />
        <div className="flex flex-col mt-6 gap-4">
          <div className="upload-container w-full">
            <div className="custom-file-container">
              <div className="label-container">
                <p>3. หลักฐานคลิปวิดีโอ</p>
                {(statusAction === 3 || (statusAction === 4 && admin_business_unit_role)) && (<button
                  type="button"
                  className="custom-file-container__image-clear"
                  title="Clear Video"
                  onClick={() => {
                    setVideo([])
                    setIsVideo(null)
                  }}
                >
                  ×
                </button>)}
              </div>

              {uploadPercentage > 0 && (
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${uploadPercentage}%` }}>
                    <p>กำลังอัปโหลด: {uploadPercentage}%</p>
                  </div>
                </div>
              )}
              {(statusAction === 3 || (statusAction === 4 && admin_business_unit_role)) && (
                <FilePond
                  files={video}
                  onupdatefiles={(fileItems) => {
                    setVideo(fileItems.map((fileItem) => fileItem.file))
                  }}
                  onaddfile={() => {
                    setIsVideo(null)
                  }}
                  allowMultiple={false}
                  acceptedFileTypes={['video/*']} // Accept only video files
                  labelFileTypeNotAllowed={'อัพโหลดได้แค่ไฟล์ วิดีโอเท่านั้น'}
                  maxFileSize="300MB"
                  labelIdle='ลากวางไฟล์วิดีโอ หรือ กดเพื่ออัพโหลดไฟล์ <span class="filepond--label-action">อัพโหลด</span>'
                />
              )}
              {isVideo !== null && (
                <div className="flex flex-col mt-6 items-center">


                  <video width="400" controls className="flex-1">
                    <source src={isVideo.url} type={'video/mp4'} />
                  </video>
                </div>
              )}
            </div>
          </div>
        </div>
        {(themeInit.features?.singature_rc_shop) && (
          <div className="flex flex-col mt-6 gap-4">
            <div className="upload-container w-full">
              <div className="custom-file-container">
                <div className="label-container flex items-center justify-between">
                  <p className="mb-0">
                    4. ใบเสร็จรับเงินร้านค้า
                  </p>

                  {!formData?.shop_signature_at && userRole === 'shop' && formData?.status_id >= 3 && (
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={openModalRC}
                      disabled={false}
                    >

                      ลงนามใบเสร็จรับเงิน
                    </button>
                  )}

                </div>


                <div className="mb-10">

                  {isLoadingPDFshopRC ? (
                    <div className="text-center text-gray-500 p-10 bg-gray-100 rounded-lg"><p>กำลังโหลดเอกสารสัญญา...</p></div>
                  ) : pdfObjectUrl ? (
                    <div className="pdf-viewer-container border rounded-lg overflow-hidden shadow-sm">
                      <iframe src={`${pdfObjectUrl}#toolbar=0`} width="100%" height="800px" className="border-0" title="PDF Preview"></iframe>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 p-10 bg-gray-100 rounded-lg"><p>ไม่สามารถแสดงเอกสารสัญญาได้</p></div>
                  )}
                </div>


              </div>
            </div>
          </div>
        )}
        <Transition appear show={isModalRCOpen} as={Fragment}>
          <Dialog as="div" open={isModalRCOpen} onClose={closeModal} className="relative z-50">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-black/60" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" afterEnter={handleCanvasResize}>
                  <Dialog.Panel className="panel w-full max-w-xl transform text-left transition-all shadow-xl p-6 sm:p-8">
                    <Dialog.Title as="h3" className="text-2xl font-bold mb-2 text-center">ลงลายมือชื่อของคุณ</Dialog.Title>
                    <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><IconX className="w-6 h-6" /></button>
                    <p className="mb-5 text-sm text-gray-500 text-center">กรุณาลงลายมือชื่อในกรอบด้านล่างนี้ให้ชัดเจน</p>
                    <div className="relative border-2 border-dashed rounded-lg bg-white overflow-hidden">
                      <SignatureCanvas ref={sigPad} penColor='#0000DE' canvasProps={{ className: 'w-full h-56 sigCanvas' }} />
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button type="button" className="btn btn-outline-secondary" onClick={clearSignature}><IconRefresh className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> วาดใหม่</button>
                      <button type="button" className="btn btn-primary" onClick={handleSaveSignature}>ยืนยันและส่งลายเซ็น</button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>


        {(statusAction === 4 || statusAction === 5) && admin_business_unit_role && !lockUpdate && (
          <button
            type="button"
            className="btn !mt-6 w-full border-0 btn-primary"
            onClick={() => {
              upLoadDoc()
            }}
          >
            อัพเดทไฟล์สัญญา
          </button>
        )}


      </>
    )
  }

  const wizardContent = () => {
    const statusClasses: any = {
      0: 'w-[0%]',
      1: 'w-[8%]',
      2: 'w-[30%]',
      3: 'w-[50%]',
      4: 'w-[70%]',
      5: 'w-[90%]',
    }

    const getClassNames = (status: number) => {
      return statusClasses[status] || ''
    }

    const className = `${getClassNames(statusAction)}`

    if (statusAction > 5 || !pageAction) {
      const steps = ['ร่างสัญญา', 'อยู่ระหว่างการพิจารณา', 'อนุมัติร่างสัญญา', 'รออนุมัติสัญญา', 'อนุมัติสัญญา']
      return (
        <div className="flex flex-col items-center">
          <div className="relative z-[1] flex-1 mt-4 w-[60vw]">
            <div className={`bg-[#f3f2ee] w-[100%] h-1 absolute ltr:left-0 rtl:right-0 top-[30px] m-auto -z-[1] transition-[width]`}></div>
            <ul className="mb-5 grid grid-cols-5">
              {steps.map((step) => (
                <li className="mx-auto flex flex-col items-center" key={step}>
                  <div className={`border-[3px] border-[#f3f2ee] bg-white dark:bg-[#253b5c] dark:border-[#1b2e4b] flex justify-center items-center w-16 h-16 rounded-full`}>
                    <IconChecks />
                  </div>
                  <span className="text-center block mt-2">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center">
        <div className="relative z-[1] flex-1 mt-4 w-[60vw] wizard-menu">
          <div className={`${className} bg-[#19d20c] w-[15%] h-1 absolute ltr:left-0 rtl:right-0 top-[30px] m-auto -z-[1] transition-[width]`}></div>
          <ul className="mb-5 grid grid-cols-5">
            <li className="mx-auto flex flex-col items-center">
              <div
                className={`${statusAction >= 1 ? '!border-[#19d20c] !bg-[#19d20c] text-white' : ''
                  } border-[3px] border-[#f3f2ee] bg-white dark:bg-[#253b5c] dark:border-[#1b2e4b] flex justify-center items-center w-16 h-16 rounded-full`}
              >
                <IconChecks />
              </div>
              <p className={`${statusAction >= 1 ? 'text-[#19d20c] ' : ''}text-center block mt-2`}>
                ร่าง<span className="wizard-isMobile">สัญญา</span>
              </p>
            </li>
            <li className="mx-auto flex flex-col items-center">
              <div
                className={`${statusAction >= 2 ? '!border-[#19d20c] !bg-[#19d20c] text-white' : ''
                  } border-[3px] border-[#f3f2ee] bg-white dark:bg-[#253b5c] dark:border-[#1b2e4b] flex justify-center items-center w-16 h-16 rounded-full`}
              >
                <IconChecks />
              </div>
              <p className={`${statusAction >= 2 ? 'text-[#19d20c] ' : ''}text-center block mt-2`}>
                <span className="wizard-isMobile">อยู่ระหว่างการ</span>พิจารณา
              </p>
            </li>
            <li className="mx-auto flex flex-col items-center">
              <div
                className={`${statusAction >= 3 ? '!border-[#19d20c] !bg-[#19d20c] text-white' : ''
                  } border-[3px] border-[#f3f2ee] bg-white dark:bg-[#253b5c] dark:border-[#1b2e4b] flex justify-center items-center w-16 h-16 rounded-full`}
              >
                <IconChecks />
              </div>
              <p className={`${statusAction >= 3 ? 'text-[#19d20c] ' : ''}text-center block mt-2`}>
                อนุมัติร่าง<span className="wizard-isMobile">สัญญา</span>
              </p>
            </li>
            <li className="mx-auto flex flex-col items-center">
              <div
                className={`${statusAction >= 4 ? '!border-[#19d20c] !bg-[#19d20c] text-white' : ''
                  } border-[3px] border-[#f3f2ee] bg-white dark:bg-[#253b5c] dark:border-[#1b2e4b] flex justify-center items-center w-16 h-16 rounded-full`}
              >
                <IconChecks />
              </div>
              <p className={`${statusAction >= 4 ? 'text-[#19d20c] ' : ''}text-center block mt-2`}>
                รออนุมัติ<span className="wizard-isMobile">สัญญา</span>
              </p>
            </li>
            <li className="mx-auto flex flex-col items-center">
              <div
                className={`${statusAction >= 5 ? '!border-[#19d20c] !bg-[#19d20c] text-white' : ''
                  } border-[3px] border-[#f3f2ee] bg-white dark:bg-[#253b5c] dark:border-[#1b2e4b] flex justify-center items-center w-16 h-16 rounded-full`}
              >
                <IconChecks />
              </div>
              <p className={`${statusAction >= 5 ? 'text-[#19d20c] ' : ''}text-center block mt-2`}>
                อนุมัติ<span className="wizard-isMobile">สัญญา</span>
              </p>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  const goNewCustomer = () => {
    window.open('/apps/customer/add', '_blank', 'noopener,noreferrer')
  }

  const goNewAsset = () => {
    window.open('/apps/asset/add', '_blank', 'noopener,noreferrer')
  }

  const goBuPreview = (item: any) => {
    window.open('/apps/business-unit/preview/' + item.id, '_blank', 'noopener,noreferrer')
  }

  const goShopPreview = (item: any) => {
    dispatch(setPageAction('preview'))
    window.open('/apps/shop/edit/' + item.id, '_blank', 'noopener,noreferrer')
  }

  const SubmittedForm = Yup.object().shape({
    contract_type_id: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    insurance_type_id: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    contract_date: Yup.string().nullable().required('กรุณาใส่เลือกวันที่'),
    id_shop: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_customer: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    // id_employee: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_asset: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    price: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ').matches(PRICE_REGEX, 'กรุณาใส่ราคาให้ถูกต้อง'),
    down_payment: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ').matches(PRICE_REGEX, 'กรุณาใส่ราคาให้ถูกต้อง'),
    rate_per_month: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    ins_period: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
    ins_due_at: Yup.string().nullable().required('กรุณาใส่เลือกวันที่'),
    ins_pay_day: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
  })
  const SubmittedFormReturnReceiptData= Yup.object().shape({
      down_payment: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ').matches(PRICE_REGEX, 'กรุณาใส่ราคาให้ถูกต้อง'),
      ins_amount: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ').matches(PRICE_REGEX, 'กรุณาใส่ราคาให้ถูกต้อง'),
      ...(formData?.penalty_fee_limit > 0  ? {
          penalty_fee: Yup.number().max(formData?.penalty_fee_limit, `ค่าดำเนินการล่าช้าไม่เกิน ${formData?.penalty_fee_limit} บาท/ครั้ง`).required('กรุณาใส่ข้อมูลให้ครบ'),
        } : {
          penalty_fee: Yup.number().required('กรุณาใส่ข้อมูลให้ครบ'),
        }),
      unlock_fee: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ').matches(PRICE_REGEX, 'กรุณาใส่ราคาให้ถูกต้อง'),
      other_fee: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ').matches(PRICE_REGEX, 'กรุณาใส่ราคาให้ถูกต้อง'),
      deduct_down_payment: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ').matches(PRICE_REGEX, 'กรุณาใส่ราคาให้ถูกต้อง'),
  })

  

  //  const { mutate: refinanceUpdate } = useGlobalMutation(url_api.refinanceUpdate, {
  //   onSuccess: (res: any) => {
  //     if (res.statusCode === 200 || res.code === 200) {
  //        toast.fire({
  //         icon: 'success',
  //         title: t('save_success'),
  //         padding: '10px 20px',
  //       })
  //       setTimeout(() => {
  //         location.reload()
  //       }, 2000)
  //     } else {
  //       toast.fire({
  //         icon: 'error',
  //         title: res.message,
  //         padding: '10px 20px',
  //       })
  //     }
  //   },
  //   onError: (res:any) => {
  //    toast.fire({
  //         icon: 'error',
  //         title: res.message,
  //         padding: '10px 20px',
  //       })
  //   },
  // })

  const processRefinance = (reference: string = "", shopID: any = "") => {
    Swal.fire({
      title: 'ยืนยันการนำเข้าข้อมูล',
      text: 'คุณต้องการรีไฟแนนซ์สัญญานี้ใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: themeInit.color.themePrimary,
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      html: `
        <label for="reference" style="display: block text-align: left font-size: 1rem margin-top: 10px color: #000000">สัญญาที่ต้องการ รีไฟแนนซ์:</label>
        <input id="reference" type="text" type="text" value=${reference} disabled class="swal2-input" style="margin: 0 !important width: 100% font-size: 1rem color: #000000background: #eee">
      `,
    }).then((result) => {
      if (result.isConfirmed) {
        if (admin_business_unit_role) {
          contractSearchContains({ data: { query: reference, full: true, id_shop: shopID } })
        } else {
          contractSearchContains({ data: { query: reference, full: true } })
        }
      }
    })
  }

  const { mutateAsync: createEkycGetContract, isLoading: isLoadingGetContract } = useGlobalErrorMutation(url_api.ekycCreateContact, {
        onSuccess: (res: any) => {
            if (res.statusCode == 200) {
                showNotification('สร้างลิงค์หนังสือลูกค้าสำเร็จ', 'success');
                fetchContractEachTabData({});
            }
        },
        onError: (err: any) => {
            toast.fire({
                icon: 'error',
                title: err.message,
                padding: '10px 20px',
            });
        },
    });

  const {mutateAsync: updateContractEsign} = useGlobalErrorMutation(url_api.ekycUpdateContract,{
    onSuccess: (res:any) => {
      if(res.statusCode == 200){
        showNotification('อัพเดตสถานะ ekyc สำเร็จ', 'success');
        dispatchState({ type: 'change-status', status: false });
        fetchContractEachTabData({});
      }
    },
    onError: (err: any) => {
        toast.fire({
            icon: 'error',
            title: err.message,
            padding: '10px 20px',
        });
    },
  })

  const getContractEsign = async () => {
    try {
      const response = await axios.get(`${process.env.EKYC_URL}/contracts/${formData?.contract_key}`);
      if (response.data.status == 200) {
        dispatchState({ type: 'change', status: response.data.data.contract.isSigned, link: response.data.data.downloadUrl });
      }
    } catch (error: any) {
      toast.fire({
        icon: 'error',
        title: "สัญญาลงนาม KYC หมดอายุหรือไม่พบลิ้งสัญญาลงนาม กรุณาดำเนินการใหม่",
        padding: '10px 20px',
      });
    }
  };

  const getContractSignEsign = async () => {
    try {
      const response = await axios.get(`${process.env.EKYC_URL}/contracts/signed/${formData?.contract_key}`);
      if (response.data.status == 200) {
        dispatchState({ type: 'change-signed', link: response.data.data.downloadUrl });
      }
    } catch (error: any) {
      toast.fire({
        icon: 'error',
        title: error?.response?.data?.message,
        padding: '10px 20px',
      });
    }
  }

  const downloadContractEsign = () => {
    if (state.link) {
      const link = document.createElement('a');
      link.href = state.link;
      link.download = 'contract.pdf';
      document.body.appendChild(link);
      link.click();
    }
  };

  const { mutateAsync: cancelEkyc } = useGlobalMutation(`${url_api.ekycCancelContract}${uuid}`, {
    onSuccess: (res: any) => {
      if (res.statusCode == 200) {
        setActionCancelEkyc(false)
        showNotification('ยกเลิก Ekyc สัญญานี้สำเร็จ', 'success');
        fetchContractEachTabData({})
      } else {
        showNotification(res?.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err?.message, 'error')
    }
  })

  return (
    <>
      <div className="flex flex-col gap-2.5 pb-[80px]">
        <Breadcrumbs items={breadcrumbItems} />
        {isOpenPic && <Lightbox mainSrc={pictureURL} onCloseRequest={() => setIsOpenPic(false)} />}
        {(pdfLoading || contractEachTabLoading || isLoadingCreate || isLoadingUpdate || isLoadingUpDoc || isLoadingUpdateStatusv2 || isLoadingUpdateStatus || isUpload || contractAddMessageLoading || uploadPercentage > 0 || isLoadingLockDevice || isLoadingComplete || isLoadingClone || loadingRef || loadingRestart || isLoadingShopSignPdf || loadContentPDF || loadintRTPDF || loadingRqData) && <PreLoading />}
        {formData.is_completed && <span className='text-white text-center p-4 bg-green-500 rounded-lg'>สัญญาสิ้นสุดแล้ว</span>}
        {wizardContent()}
        {(() => {
          const currentHour = new Date().getHours()
          return (userRole === 'shop' && formData?.prev_contract_count && currentHour >= 10 && currentHour < 22) ? (
            <div className='flex justify-between w-full bg-[#002a42] p-3 rounded text-[#ffffff]'>
              <div className='flex items-center flex-1'>
                <div className="bg-[#f45a02] w-8 h-8 rounded-full flex items-center justify-center text-white">
                  <IconNotesEdit className="w-4.5 h-4.5" />
                </div>
                <div className='ml-2'></div>
                สัญญาก่อนหน้า
              </div>
              <div className='flex justify-center items-center flex-1'>  จำนวน {formData?.prev_contract_count} สัญญา </div>
              <div className='flex justify-end items-center flex-1'> {formData?.prev_contract_time ? formData?.prev_contract_time : '-'} </div>
            </div>
          ) : null
        })()}
        <div className="panel flex-1">
          <Tab.Group>
            <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`${selected ? '!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''} dark:hover:border-b-black -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}
                    onClick={() => setTab('contract')}
                  >
                    ข้อมูลสัญญา
                  </button>
                )}
              </Tab>
              {statusAction >= 3 ? (
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button className={`${selected ? '!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''} dark:hover:border-b-black" -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`} onClick={() => setTab('additional')}>
                      หลักฐานประกอบ
                    </button>
                  )}
                </Tab>
              ) : (
                <Tab className="pointer-events-none -mb-[1px] block p-3.5 py-2 text-white-light outline-none dark:text-dark">หลักฐานประกอบ</Tab>
              )}
              {contract_uuid ? (
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`${selected ? '!border-white-light !border-b-white  text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black ' : ''
                        } dark:hover:border-b-black -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}
                      onClick={() => setTab('history')}
                    >
                      ประวัติการใช้งาน
                    </button>
                  )}
                </Tab>
              ) : (
                <Tab className="pointer-events-none -mb-[1px] block p-3.5 py-2 text-white-light outline-none dark:text-dark">ประวัติการใช้งาน</Tab>
              )}
              {!id_shop && (
                (contract_uuid && formData?.status_id > 3) ? (
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${selected
                          ? '!border-white-light !border-b-white text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black'
                          : ''
                          } dark:hover:border-b-black -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}
                        onClick={() => setTab('installment')}
                      >
                        ข้อมูลงวดสัญญา
                      </button>
                    )}
                  </Tab>
                ) : (
                  <Tab className="pointer-events-none -mb-[1px] block p-3.5 py-2 text-white-light outline-none dark:text-dark">
                    ข้อมูลงวดสัญญา
                  </Tab>
                )
              )}
              {!id_shop && (
                statusAction >= 5 ? (
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${selected
                          ? '!border-white-light !border-b-white text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black'
                          : ''
                          } dark:hover:border-b-black -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}
                        onClick={() => setTab('credit')}
                      >
                        สถานะสัญญา
                      </button>
                    )}
                  </Tab>
                ) : (
                  <Tab className="pointer-events-none -mb-[1px] block p-3.5 py-2 text-white-light outline-none dark:text-dark">
                    สถานะสัญญา
                  </Tab>
                )
              )}
              {(contract_uuid && admin_business_unit_role) && (
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`${selected ? '!border-white-light !border-b-white text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''} dark:hover:border-b-black -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}
                      onClick={() => setTab('note-event')}
                    >
                      บันทึกข้อความ
                    </button>
                  )}
                </Tab>
              )}
              {!id_shop && (
                statusAction >= 3 ? (
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${selected
                          ? '!border-white-light !border-b-white text-themePrimary !outline-none dark:!border-[#191e3a] dark:!border-b-black'
                          : ''
                          } dark:hover:border-b-black -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-themePrimary`}
                        onClick={() => setTab('device-lock')}
                      >
                        ล็อคเครื่อง
                      </button>
                    )}
                  </Tab>
                ) : (
                  <Tab className="pointer-events-none -mb-[1px] block p-3.5 py-2 text-white-light outline-none dark:text-dark">
                    ล็อคเครื่อง
                  </Tab>
                )
              )}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                  {(props) => {
                    useEffect(() => {

                      const commissionData = {
                        commission_type: props.values.commission_type,
                        commission: props.values.commission,
                        principle: props.values.principle,
                        price: props.values.price,
                      }
                      const commission_price = calCommission(commissionData)
                      props.setFieldValue('commission_price', commission_price)

                    }, [props.values.commission])
                    useEffect(() => {
                      if (props.values.down_payment_type === 'percent') {
                        //if (props.values?.down_payment_rate) {
                        const down_payment = props.values.price * props.values?.down_payment_rate
                        const principleValue = props.values.price - convertRoundUpNumber(down_payment)
                        props.setFieldValue('down_payment', convertRoundUpNumber(down_payment))
                        props.setFieldValue('principle', principleValue)
                        //}
                      } else {
                        const principleValue = props.values.price - props.values?.down_payment
                        props.setFieldValue('principle', principleValue)
                      }
                      const commissionData = {
                        commission_type: props.values.commission_type,
                        commission: props.values.commission,
                        principle: props.values.principle,
                        price: props.values.price,
                      }
                      const commission_price = calCommission(commissionData)
                      props.setFieldValue('commission_price', commission_price)
                    }, [props.values.price, props.values.down_payment, props.values.down_payment_rate, props.setFieldValue])
                    useEffect(() => {
                      if (props.values.principle && props.values.rate_per_month && props.values.ins_period) {
                        const insAmountValue = (props.values.principle * props.values.rate_per_month) / props.values.ins_period
                        // props.setFieldValue('ins_amount', convertRoundUpNumber(insAmountValue))
                        props.setFieldValue('ins_amount', convertRoundUpNumber(insAmountValue))
                      } else {
                        props.setFieldValue('ins_amount', 0)
                      }
                    }, [props.values.principle, props.values.rate_per_month, props.values.ins_period, props.values.ins_amount, props.setFieldValue])
                    return (
                      <>
                        {statusAction > 5 && (
                          <div className="w-full h-[auto] bg-[#fedee2] text-[#f9303e] rounded-md mt-5 mb-5">
                            <div className="p-5">
                              แจ้งเตือน !
                              {'  ' +
                                contractStatusList?.find((a: any) => {
                                  return a.data.id === statusAction
                                })?.data.name}{' '}
                              เหตุผล: {formData.reason_cancel}
                              {/* {props.values?.memo} */}
                            </div>
                          </div>
                        )}
                        {/* สำหรับสัญญาเก่า */}
                        {refinanceAction != 'none' && !isContractRefinance && (
                          <div className="w-full h-[auto] text-warning bg-warning-light dark:bg-warning-dark-light rounded-md mt-5 mb-5">
                            <div className="p-5" onClick={() => openContract(c_ref_link)} style={{ cursor: 'pointer' }}>
                              {refinanceAction == 'on_process' ? 'กำลังดำเนินการรีไฟแนนซ์' : 'สัญญานี้ได้ถูกรีไฟแนนซ์'} : {formData?.refinance_ref ?? ''}
                            </div>
                          </div>
                        )}
                        {/* สำหรับสัญญาใหม่ */}
                        {refinanceAction != 'none' && isContractRefinance && (
                          <div className="w-full h-[auto] text-warning bg-warning-light dark:bg-warning-dark-light rounded-md mt-5 mb-5">
                            <div className="p-5" onClick={() => openContract(c_ref_link)} style={{ cursor: 'pointer' }}>
                              เลขที่สัญญาที่เกี่ยวข้อง  : {formData?.refinance_ref ?? ''}
                            </div>
                          </div>
                        )}
                        {/* ค้นหาสัญญาที่ต้องการรีไฟแนนซ์ */}
                        {(props.values.contract_type_id == 5 || props.values.contract_type_id == 6) && !contract_uuid && (
                          <div className="relative border border-white-dark/20 flex flex w-[300px] float-right">
                            <input
                              type="text"
                              name='refinance_ref'
                              placeholder="ค้นหาสัญญาที่ต้องการรีไฟแนนซ์"
                              value={props.values.refinance_ref}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              disabled={cloneData || contract_uuid ? true : false}
                              className="form-input border-0 border-l rounded-none bg-white  focus:shadow-[0_0_5px_2px_rgb(194_213_255_/_62%)] dark:shadow-[#1b2e4b] placeholder:tracking-wider focus:outline-none py-3"
                            />
                            <button className="text-primary m-auto p-3 flex items-center justify-center" onClick={() => {
                              if (!cloneData && !contract_uuid) {
                                if (admin_business_unit_role) {
                                  if (props.values?.id_shop == "") {
                                    toast.fire({
                                      icon: 'error',
                                      title: 'ยังไม่ได้เลือกร้านค้า',
                                      padding: '10px 20px',
                                    })
                                    return false
                                  }
                                }
                                if (props.values.refinance_ref) {
                                  setTmpData(props.values)
                                  contractSearchContains({ data: { query: props.values.refinance_ref, full: false } })
                                }
                              }
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto w-5 h-5"><circle cx="11.5" cy="11.5" r="9.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"></circle><path d="M18.5 18.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </button>
                          </div>
                        )}
                        {/* พิมพ์ */}
                        {contract_uuid && (statusAction === 3 || statusAction === 4 || statusAction === 5) && (
                          <div className="inline-flex float-right">
                            <button className="btn btn-primary ltr:rounded-r-none rtl:rounded-l-none">
                              พิมพ์
                            </button>
                            <div className="dropdown">
                              <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn dropdown-toggle btn-primary ltr:rounded-l-none rtl:rounded-r-none border-l-[#4468fd] before:border-[5px] before:border-l-transparent before:border-r-transparent before:border-t-inherit before:border-b-0 before:inline-block before:border-t-white-light h-full"
                                button={<span className="sr-only">Toggle dropdown</span>}
                              >
                                <ul className="!min-w-[250px]">
                                  <li>
                                    <button type="button" onClick={() => { setPdfLoading(true); if (!pdfLoading) { fetchContractPDF({ data: { id: contract_uuid } }) } }}>
                                      ดาวน์โหลดเอกสารสัญญา
                                    </button>
                                  </li>
                                  <li>
                                    <button type="button" onClick={() => { setPdfLoading(true); if (!pdfLoading) { fetchContractPDPA({ data: { id: contract_uuid } }) } }}>
                                      ดาวน์โหลดเอกสาร PDPA
                                    </button>
                                  </li>
                                  <li>
                                    <button type="button" onClick={() => { setPdfLoading(true); if (!pdfLoading) { fetchContractReceipts({ data: { id: contract_uuid } }) } }}>
                                      ดาวน์โหลดใบเสร็จรับเงิน
                                    </button>
                                  </li>
                                  {themeInit.features?.signature_online && formData?.business_unit?.signature_online_type == 1 && ![2, 3, 4, 11, 16, 17, 18, 19, 34, 39].includes(formData?.credit?.id) && (
                                    <li>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const isContractRefinance = formData.contract_type_id == 5 || formData.contract_type_id == 6
                                          const url = isContractRefinance ? `/apps/contract/signature-preview/${contract_uuid}?type=refinance` : `/apps/contract/signature-preview/${contract_uuid}`
                                          window.open(url, '_blank', 'noopener,noreferrer')
                                        }}
                                      >
                                        ลงนามเอกสาร
                                      </button>
                                    </li>
                                  )}
                                  {(themeInit.features.pdf_receipts) && statusAction >= 3 && (
                                    <li>
                                      <button type="button" onClick={() => { setPdfLoading(true); if (!pdfLoading) { fetchContractGoodsReceiptPDF({}) } }}>
                                        ใบรับสินค้า
                                      </button>
                                    </li>
                                  )}
                                  {(themeInit.features.pdf_pay && mode != 'shop') && statusAction === 5 && (
                                    <li>
                                      <button type="button" onClick={() => { fetchContractRequestToPayDATA({ data: { only_content: true } }) }}>
                                        หนังสือขอใช้ชำระหนี้
                                      </button>
                                    </li>
                                  )}
                                  {(themeInit.features.pdf_close && mode != 'shop') && statusAction === 5 && (
                                    <li>
                                      <button type="button" onClick={() => { setPdfLoading(true); if (!pdfLoading) { fetchCloseContractToPDF({}) } }}>
                                        หนังสือยืนยันการปิดบัญชี
                                      </button>
                                    </li>
                                  )}
                                  {(themeInit.features.pdf_return && mode != 'shop') && statusAction === 5 && (
                                    <li>
                                      <button type="button" onClick={() => { setPdfLoading(true); if (!pdfLoading) { openReturnReceiptModal() } }}>
                                        หนังสือรับคืนเครื่อง
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              </Dropdown>
                            </div>
                          </div>
                        )}
                        {/* สัญญานี้ลงนามออนไลน์แล้ว */}
                        {formData?.customer_signature_at && (
                          <div className="inline-flex float-right" style={{ marginRight: 10 }}>
                            <span style={{ marginTop: 0, padding: 10 }} className={`badge ${formData?.customer_signature_at ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                              {formData?.customer_signature_at ? 'สัญญานี้ลงนามออนไลน์แล้ว' : ''}
                            </span>
                          </div>
                        )}
                        {formData?.e_contract_status && (
                          <div className="inline-flex float-right" style={{ marginRight: 10 }}>
                            <span style={{ marginTop: 0, padding: 10 }} className={`badge ${formData?.e_contract_status ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                              {formData?.e_contract_status ? 'สัญญานี้ลงนาม Ekyc แล้ว' : ''}
                            </span>
                          </div>
                        )}
                        {/* หนังสือสัญญาเช่าซื้อ */}
                        <Form className="space-y-5 dark:text-white custom-select mt-5">
                          <div className="text-4xl pt-4 font-semibold text-center text-themePrimary">
                            หนังสือสัญญาเช่าซื้อ
                          </div>
                          <div className="flex flex-row w-full gap-5">
                            <SelectField
                              label="ประเภทสัญญา"
                              id="contract_type_id"
                              name="contract_type_id"
                              placeholder="กรุณาเลือก"
                              options={contractTypeList}
                              disabled={(statusAction > 2 && admin_business_unit_role) || (statusAction > 1 && userRole === 'shop')}
                            />
                            <SelectField
                              label="ประเภทประกัน"
                              id="insurance_type_id"
                              name="insurance_type_id"
                              placeholder="กรุณาเลือก"
                              options={insuranceTypeList}
                              disabled={(statusAction > 2 && admin_business_unit_role) || (statusAction > 1 && userRole === 'shop')}
                            />
                          </div>
                          <div className="flex flex-row w-full gap-5">
                            <InputField label="สัญญาเลขที่" name="reference" disabled />
                            <DatePicker
                              label="วันที่สัญญา"
                              name="contract_date"
                              disabled={(statusAction > 2 && admin_business_unit_role) || (statusAction > 1 && userRole === 'shop')}
                              onChange={(value: any) => {
                                props.setFieldValue('contract_date', convertDateClientToDb(value) + 'T00:00:00.000Z')
                              }}
                            />
                          </div>
                          <div className="!mt-8 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                            <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                              <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-base font-semibold -mt-[10px] ">
                                ข้อมูลร้านค้า
                              </span>
                            </div>
                            <div className="flex flex-row p-5">
                              <div className="flex-auto w-[50%]">
                                <SelectField
                                  label="ร้านค้าผู้จัดทำสัญญา"
                                  id="id_shop"
                                  name="id_shop"
                                  placeholder="ค้นหาและเลือกร้านค้า"
                                  isSearchable={true}
                                  options={shopListData}
                                  onChange={(event: any) => handleChangeSelect(props, event, 'id_shop')}
                                  onInputChange={(event: any) => handleSearch(props, event, 'id_shop')}
                                  disabled={id_shop || statusAction > 1}
                                  handleOnMenuOpen={() => {
                                    shopSearchContains({
                                      data: {
                                        query: '',
                                        contract_type_id: props.values?.contract_type_id ?? 0,
                                        page: 1,
                                        pageSize: 10,
                                      },
                                    })
                                  }}
                                />
                                <div className="mt-3 grid grid-cols-10 justify-items-start content-center ">
                                  {!_.isEmpty(shopDetail) && (
                                    <>
                                      <div className="col-span-12 grid gap-1 pb-2">
                                        <div className="flex flex-row pointer" onClick={() => goShopPreview(shopDetail)}>
                                          <p className="text-2xl text-primary hover:underline"> {shopDetail.name}</p>
                                        </div>
                                      </div>
                                      <div className="col-span-6 grid gap-2 pb-2">
                                        <div className="flex flex-row">
                                          <IconCreditCard className="mr-2" />
                                          <p> {formatIDNumber(shopDetail?.tax_id || '-')}</p>
                                        </div>
                                      </div>
                                      <div className="col-span-6 grid gap-2 pb-2">
                                        <div className="flex flex-row">
                                          <IconMail className="mr-2" />
                                          <p> {shopDetail.email || '-'}</p>
                                        </div>
                                      </div>
                                      <div className="col-span-12 grid gap-2 pb-2">
                                        <div className="flex flex-row">
                                          <IconPhoneCall className="mr-2" />
                                          <p> {formatPhoneNumber(shopDetail.phone_number || '-')}</p>
                                        </div>
                                      </div>
                                      <div className="col-span-12 grid gap-2 pb-2">
                                        <div className="flex flex-row">
                                          <IconMapPin className="mr-2" />
                                          <p> {shopDetail?.full_address || '-'}</p>
                                        </div>
                                      </div>
                                      {shopDetail.facebook_id != null && shopDetail.facebook_id != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconFacebook className="mr-2" />
                                            {shopDetail?.facebook_id !== null && (
                                              <a
                                                href={shopDetail?.facebook_id}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 underline-offset-1 text-primary"
                                              >
                                                {shopDetail.facebook_id.slice(0, 50)}
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {shopDetail.line_id != null && shopDetail.line_id != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconLine className="mr-2" />
                                            {shopDetail?.line_id !== null && (
                                              <a
                                                href={`https://line.me/ti/p/${shopDetail?.line_id.trim().replaceAll('@', '%40')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 underline-offset-1 text-primary"
                                              >
                                                {shopDetail?.line_id}
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {shopDetail.website != null && shopDetail.website != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconLink className="mr-2" />
                                            {shopDetail?.website !== null && (
                                              <a
                                                href={shopDetail?.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 underline-offset-1 text-primary"
                                              >
                                                {shopDetail.website.slice(0, 50)}
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="!mt-8 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                            <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                              <span className="bg-white dark:bg-black dark:text-white-light
                                                          inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-base font-semibold -mt-[10px] ">
                                ข้อมูลหน่วยธุรกิจ
                              </span>
                            </div>
                            <div className="flex flex-col p-5">
                              <div className="w-full h-[auto] bg-[#fedee2] text-[#f9303e] rounded-md">
                                {isSelectRate && !contractRate && (
                                  <div className="p-5">แจ้งเตือน ! ไม่พบผลตอบแทนหน่วยธุรกิจ โปรดติดต่อแอดมิน เพื่อทำการตั้งค่าหน่วยธุรกิจให้ถูกต้อง</div>
                                )}
                              </div>
                              <div className="flex-auto flex-row w-full pt-2">
                                <SelectField
                                  label="หน่วยธุรกิจ"
                                  id="id_business_unit"
                                  name="id_business_unit"
                                  placeholder="ค้นหาและเลือกหน่วยธุรกิจ"
                                  options={buListData}
                                  onChange={(event: any) => handleChangeSelect(props, event, 'id_business_unit')}
                                  disabled={_.isEmpty(shopDetail) || (statusAction > 2 && admin_business_unit_role) || (statusAction > 1 && userRole === 'shop')}
                                  filterOption={() => true}
                                  handleOnMenuOpen={() => {
                                    // ไม่แน่ใจใช้ทำอะไร ปิดไว้ก่อน
                                    // if (shopDetail) {
                                    //   // console.log("shopDetail",shopDetail)
                                    //   // shopSearchContainsBu({
                                    //   //   data: {
                                    //   //     query: shopDetail.name,
                                    //   //     page: 1,
                                    //   //     pageSize: 10,
                                    //   //   },
                                    //   // })
                                    // }
                                  }}
                                />
                              </div>
                              {!_.isEmpty(buDetail) && (
                                <div className="flex flex-row flex-wrap mt-6">
                                  <div className="flex w-[100%] lg:w-[30%] justify-center lg:justify-start content-start">
                                    {buDetail?.logo_image_url && buDetail?.logo_image_url !== '' ? (
                                      <img className="h-[100px] w-auto" src={buDetail?.logo_image_url} alt="bu-logo" />
                                    ) : null}
                                  </div>
                                  <div className="flex w-[100%] lg:w-[70%] lg:pl-5">
                                    <div className="mt-3 justify-items-start content-center">
                                      <div className="col-span-12 grid gap-1 pb-2">
                                        <div className="flex flex-row pointer" onClick={() => goBuPreview(buDetail)}>
                                          <p className="text-lg hover:underline"> {buDetail?.name} </p>
                                        </div>
                                      </div>
                                      <div className="col-span-12 grid gap-1">
                                        <div className="flex flex-row">
                                          <IconPhoneCall className="mr-2" />
                                          <p> {formatPhoneNumber(buDetail?.phone || '-')}</p>
                                        </div>
                                        <div className="flex flex-row">
                                          <IconMapPin className="mr-2" />
                                          <p> {buDetail?.full_address} </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="!mt-8 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                            <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                              <span className="bg-white dark:bg-black dark:text-white-light
                                                          inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-base font-semibold -mt-[10px] ">
                                ข้อมูลกลุ่มร้านค้า
                              </span>
                            </div>
                            <div className="flex flex-col p-5">
                              <div className="w-full h-[auto] bg-[#fedee2] text-[#f9303e] rounded-md">
                                {isSelectRate && !contractRate && (
                                  <div className="p-5">แจ้งเตือน ! ไม่พบผลตอบแทนของกลุ่มร้านค้า โปรดติดต่อแอดมิน เพื่อทำการตั้งค่าห้ถูกต้อง</div>
                                )}
                              </div>
                              <div className="flex-auto flex-row w-full pt-2">
                                <SelectField
                                  label="กลุ่มร้านค้า"
                                  id="id_shop_group"
                                  name="id_shop_group"
                                  placeholder="ค้นหาและเลือกกลุ่มร้านค้า"
                                  options={shopGroupListData}
                                  onChange={(event: any) => handleChangeSelect(props, event, 'id_shop_group')}
                                  disabled={_.isEmpty(shopDetail) || (statusAction > 2 && admin_business_unit_role) || (statusAction > 1 && userRole === 'shop')}
                                  filterOption={() => true}
                                  handleOnMenuOpen={() => {
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="!mt-8 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                            <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                              <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-base font-semibold -mt-[10px] ">
                                ข้อมูลลูกค้า
                              </span>
                            </div>
                            <div className="flex flex-col p-5">
                              <div className="flex flex-row w-full">
                                <div className="flex-auto w-[95%]">
                                  <SelectField
                                    label="ลูกค้า"
                                    id="id_customer"
                                    name="id_customer"
                                    placeholder="ค้นหาและเลือกลูกค้า"
                                    isSearchable={true}
                                    options={customerListData}
                                    onChange={(event: any) => handleChangeSelect(props, event, 'id_customer')}
                                    onInputChange={(event: any) => handleSearch(props, event, 'id_customer')}
                                    disabled={_.isEmpty(shopDetail) || (statusAction > 2 && admin_business_unit_role) || (statusAction > 1 && userRole === 'shop')}
                                    filterOption={() => true}
                                    zIndex="z-2"
                                    handleOnMenuOpen={() => {
                                      customerSearchContains({ data: { query: '', id_shop: shopDetail.id, page: 1, pageSize: 10 } })
                                    }}
                                  />
                                </div>
                                {statusAction < 5 && (
                                  <div className="flex flex-auto w-[5%] mx-2 pt-6">
                                    <button type="button" className="btn btn-primary" onClick={goNewCustomer}>
                                      <IconPlus />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {!_.isEmpty(customerDetail) && (
                                <div className="flex flex-row flex-wrap mt-6">
                                  <div className="flex-auto w-[100%]  lg:w-[30%]">
                                    <Carousel items={[{ image_url: customerDetail?.citizen_image_url }, { image_url: customerDetail?.verification_image_url }]} />
                                  </div>
                                  <div className="flex-auto w-[100%] lg:w-[70%] lg:pl-5">
                                    <div className="mt-3 grid grid-cols-10 justify-items-start content-center">
                                      <div className="col-span-12 grid gap-1 pb-2">
                                        <div className="flex flex-row">
                                          <p className="text-lg">
                                            <a
                                              key="id_customer"
                                              href={`/apps/customer/edit/${customerDetail?.id}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex-1 content-center underline-offset-1 text-primary "
                                            >
                                              {customerDetail?.name}
                                            </a>
                                          </p>
                                        </div>
                                      </div>
                                      <div className="col-span-6 grid gap-1 pb-2">
                                        <div className="flex flex-row">
                                          <IconCreditCard className="mr-2" />
                                          <p> {formatIDNumber(customerDetail?.citizen_id ?? '-')}</p>
                                        </div>
                                      </div>
                                      <div className="col-span-6 grid gap-1 pb-2">
                                        <div className="flex flex-row">
                                          <IconMail className="mr-2" />
                                          <p> {customerDetail?.email ?? '-'}</p>
                                        </div>
                                      </div>
                                      {customerDetail.phone_number != null && customerDetail.phone_number != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconPhoneCall className="mr-2" />
                                            <p> {formatPhoneNumber(customerDetail?.phone_number || '-')}</p>
                                          </div>
                                        </div>
                                      )}
                                      {customerDetail.phone_number_ref != null && customerDetail.phone_number_ref != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconPhoneCall className="mr-2" />
                                            <p> {formatPhoneNumber(customerDetail?.phone_number_ref ?? '-')}</p>
                                          </div>
                                        </div>
                                      )}
                                      {/* <div className="col-span-12 grid gap-1 pb-2">
                                                                              <div className="flex flex-row">
                                                                              <IconCreditCard className="mr-2" />
                                                                              <p> {customerDetail?.citizen_id ?? '-'}</p>
                                                                              </div>
                                                                          </div> */}
                                      {customerDetail.full_address != null && customerDetail.full_address != '' && (
                                        <div className="col-span-12 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconMapPin className="mr-2" />
                                            <p> ที่อยู่: {customerDetail?.full_address ?? '-'}</p>
                                          </div>
                                        </div>
                                      )}
                                      {customerDetail.full_current_address != null && customerDetail.full_current_address != '' && (
                                        <div className="col-span-12 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconMapPin className="mr-2" />
                                            <p> ที่อยู่ปัจจุบัน: {customerDetail?.full_current_address ?? '-'}</p>
                                          </div>
                                        </div>
                                      )}
                                      {customerDetail.full_work_address != null && customerDetail.full_work_address != '' && (
                                        <div className="col-span-12 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconMapPin className="mr-2" />
                                            <p> ที่อยู่ที่ทำงาน: {customerDetail?.full_work_address ?? '-'}</p>
                                          </div>
                                        </div>
                                      )}
                                      {customerDetail.facebook_id != null && customerDetail.facebook_id != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconFacebook className="mr-2" />
                                            {customerDetail?.facebook_id !== null && (
                                              <a
                                                href={customerDetail?.facebook_id}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 underline-offset-1 text-primary"
                                              >
                                                {customerDetail.facebook_id.slice(0, 50)}
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {customerDetail.line_id != null && customerDetail.line_id != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconLine className="mr-2" />
                                            {customerDetail?.line_id !== null && (
                                              <a
                                                href={`https://line.me/ti/p/${customerDetail?.line_id.trim().replaceAll('@', '%40')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 underline-offset-1 text-primary"
                                              >
                                                {customerDetail?.line_id}
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {customerDetail.instagram_id != null && customerDetail.instagram_id != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconInstagram className="mr-2" />
                                            {customerDetail?.instagram_id !== null && (
                                              <a
                                                href={`https://www.instagram.com/${customerDetail?.instagram_id.trim()}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 underline-offset-1 text-primary"
                                              >
                                                {customerDetail?.instagram_id}
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {customerDetail.tiktok_id != null && customerDetail.tiktok_id != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconTiktok className="mr-2" />
                                            {customerDetail?.tiktok_id !== null && (
                                              <a
                                                href={`https://www.tiktok.com/${customerDetail?.tiktok_id.trim()}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 underline-offset-1 text-primary"
                                              >
                                                {customerDetail?.tiktok_id}
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {customerDetail.credit_level != null && customerDetail.credit_level != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconAward className="mr-2" />
                                            <p> <span className='pr-3'>ระดับเครดิต (BU)</span>  {creditLevelTypes.find(i => i.value === customerDetail.credit_level)?.label || ''}</p>
                                          </div>
                                        </div>
                                      )}
                                      {customerDetail.shop_credit_level != null && customerDetail.shop_credit_level != '' && (
                                        <div className="col-span-6 grid gap-1 pb-2">
                                          <div className="flex flex-row">
                                            <IconAward className="mr-2" />
                                            <p> <span className='pr-3'>ระดับเครดิต (ร้านค้า)</span>  {creditLevelTypes.find(i => i.value === customerDetail.shop_credit_level)?.label || ''}</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="col-span-7 grid gap-1">  <div className="flex flex-row"><IconNotesEdit className="shrink-0 mr-2" />  {formData?.contract_process_text}   </div> </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="!mt-8 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                            <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                              <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-base font-semibold -mt-[10px] ">
                                ข้อมูลสินทรัพย์
                              </span>
                            </div>
                            <div className="flex flex-col p-5">
                              <div className="flex flex-row w-full items-center">
                                <div className="flex-auto w-[95%]">
                                  <SelectField
                                    label="สินทรัพย์"
                                    id="id_asset"
                                    name="id_asset"
                                    placeholder="ค้นหาและเลือกสินทรัพย์"
                                    isSearchable={true}
                                    options={assetListData}
                                    onChange={(event: any) => handleChangeSelect(props, event, 'id_asset')}
                                    onInputChange={(event: any) => handleSearch(props, event, 'id_asset')}
                                    disabled={_.isEmpty(shopDetail) || (statusAction > 2 && admin_business_unit_role) || (statusAction > 1 && userRole === 'shop')}
                                    filterOption={() => true}
                                    zIndex="z-2"
                                    handleOnMenuOpen={() => {
                                      assetSearchContains({ data: { query: '', id_shop: shopDetail.id, page: 1, pageSize: 10 } })
                                    }}
                                  />
                                </div>
                                {statusAction < 5 && (
                                  <div className="flex flex-auto w-[5%] mx-2 pt-6">
                                    <button type="button" className="btn btn-primary" onClick={goNewAsset}>
                                      <IconPlus />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {!_.isEmpty(assetDetail) && (
                                <div className="flex flex-row flex-wrap mt-6">
                                  <div className="flex-auto w-[100%] lg:w-[30%]">
                                    <div className="">
                                      <Carousel items={assetDetail?.asset_images} />
                                    </div>
                                  </div>
                                  <div className="flex-auto w-[100%] lg:w-[70%] lg:pl-5">
                                    <div className="mt-3 grid grid-cols-10 justify-items-start content-center">
                                      <div className="col-span-12 grid gap-1 pb-4">
                                        <p className="text-lg">
                                          <a
                                            key="id_customer"
                                            href={`/apps/asset/view/${assetDetail?.id}/${shopDetail?.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 content-center underline-offset-1 text-primary"
                                          >
                                            {assetDetail?.name || '-'}
                                          </a>
                                        </p>
                                      </div>
                                      <div className="col-span-2 grid gap-1">
                                        <p className="line-break-anywhere">Serial No</p>
                                        <p className="line-break-anywhere">รหัสรุ่น</p>
                                        <p className="line-break-anywhere">สี</p>
                                        <p className="line-break-anywhere">ข้อสังเกตุ</p>
                                      </div>
                                      <div className="col-span-3 grid gap-1">
                                        <p className="line-break-anywhere"> {assetDetail?.serial_number || '-'} </p>
                                        <p className="line-break-anywhere"> {assetDetail?.model_number || '-'} </p>
                                        <p className="line-break-anywhere"> {assetDetail?.color || '-'}</p>
                                        <p className="line-break-anywhere"> {assetDetail?.note || '-'} </p>
                                      </div>
                                      <div className="col-span-2 grid gap-1">
                                        <p className="line-break-anywhere">IMEI</p>
                                        <p className="line-break-anywhere">ความจุ</p>
                                        <p className="line-break-anywhere">ราคา</p>
                                        <p className="line-break-anywhere"></p>
                                      </div>
                                      <div className="col-span-3 grid gap-1">
                                        <p className="line-break-anywhere"> {assetDetail?.imei || '-'}</p>
                                        <p className="line-break-anywhere"> {assetDetail?.capacity || '-'}</p>
                                        <p className="line-break-anywhere"> {assetDetail?.price ? assetDetail?.price?.toLocaleString('en-US') + ' บาท' : '-'} </p>
                                        <p className="line-break-anywhere"></p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {contractRate && (
                            <div className="!mt-8 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                              <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                                <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-base font-semibold -mt-[10px] ">
                                  รายละเอียดสัญญา
                                </span>
                              </div>
                              <div className="flex flex-wrap flex-row px-5 pb-5">
                                <div className="w-full lg:w-6/12 2xl:w-7/12">
                                  <div className="flex-1">
                                    <div className="input-flex-row">
                                      <InputField
                                        label="ราคาสินทรัพย์"
                                        name="price"
                                        disabled={(userRole === 'shop' && statusAction > 1) || (admin_business_unit_role && statusAction > 2)}
                                      />
                                    </div>
                                    <div className="input-flex-row gap-5">
                                      {/* {admin_business_unit_role ? ( */}
                                      <>
                                        <SelectField
                                          label="ประเภทเงินดาวน์"
                                          id="down_payment_type"
                                          name="down_payment_type"
                                          options={[
                                            {
                                              label: 'จำนวนเงินดาวน์',
                                              value: 'amount',
                                            },
                                            {
                                              label: 'เปอร์เซ็นต์เงินดาวน์',
                                              value: 'percent',
                                            },
                                          ]}
                                          disabled={statusAction > 2 || !admin_business_unit_role}
                                        />
                                        {props.values.down_payment_type === 'percent' && (
                                          <SelectField
                                            label="เปอร์เซ็นต์เงินดาวน์"
                                            id="down_payment_rate"
                                            name="down_payment_rate"
                                            options={percentageArray}
                                            isSearchable
                                            disabled={statusAction > 2 || (!admin_business_unit_role && statusAction > 1)}
                                          />
                                        )}
                                      </>
                                      {/* ) : (
                                        <SelectField
                                          label="เปอร์เซ็นต์เงินดาวน์"
                                          id="down_payment_rate"
                                          name="down_payment_rate"
                                          options={percentageArray}
                                          isSearchable
                                          disabled={statusAction > 1}
                                        />
                                      )} */}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="input-flex-row gap-5">
                                      <InputField
                                        label="เงินดาวน์"
                                        name="down_payment"
                                        disabled={
                                          (userRole === 'shop' && statusAction > 1) ||
                                          (admin_business_unit_role && statusAction > 2) ||
                                          props.values.down_payment_type === 'percent' || !admin_business_unit_role
                                        }
                                      />
                                      <SelectField
                                        label="จำนวนงวด"
                                        id="ins_period"
                                        name="ins_period"
                                        options={insPeriod}
                                        disabled={(userRole === 'shop' && statusAction > 1) || (admin_business_unit_role && statusAction > 2)}
                                        onChange={(e) => {
                                          handleChangeSelect(props, e, 'ins_period')
                                        }}
                                      />
                                      {/* <InputField label="ประเภทงวด" name="ins_period_unit" disabled /> */}
                                    </div>

                                    <div className="input-flex-row gap-5">
                                      <DatePicker
                                        label="งวดแรกเริ่มเมื่อ"
                                        name="ins_due_at"
                                        disabled={(userRole === 'shop' && statusAction > 1) || (admin_business_unit_role && [3, 4, 6, 7, 8].includes(statusAction))}
                                        onChange={(value: any) => {
                                          props.setFieldValue('ins_due_at', convertDateClientToDb(value) + 'T00:00:00.000Z')
                                        }}
                                      />
                                      <SelectField
                                        label="ชำระทุกวันที่"
                                        id="ins_pay_day"
                                        name="ins_pay_day"
                                        options={insPayDay}
                                        disabled={(userRole === 'shop' && statusAction > 1) || (admin_business_unit_role && [3, 4, 6, 7, 8].includes(statusAction))}
                                      />
                                    </div>
                                    <div >
                                      <Checkbox
                                        name="has_advance_installments"
                                        label="มีงวดล่วงหน้า"
                                        disabled={(userRole === 'shop' && statusAction > 1) || (admin_business_unit_role && statusAction > 2)}
                                      />
                                    </div>
                                    <div className="input-flex-row">
                                      {/* admin_business_unit_role */}
                                      {admin_business_unit_role && (
                                        <InputField
                                          label="อัตราผลตอบแทน"
                                          name="rate_per_month"
                                          type="number"
                                          disabled={props.values.rate_per_month === null || statusAction > 2}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="w-full lg:w-6/12 2xl:w-5/12 lg:pl-5">
                                  <div className="input-flex-row">
                                    <div className="flex flex-col flex-1 ">
                                      <label> ทุนเช่าซื้อ </label>
                                      <div className="flex-auto bg-[#eeeeee] h-[50%] w-[100%] text-center align-center leading-normal w-3/4 rounded-md mb-1 py-2">
                                        {(props.values.principle).toLocaleString('en-US')}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="input-flex-row">
                                    <div className="flex flex-col flex-1">
                                      <label> ราคาที่ทำสัญญา </label>
                                      <div className="flex-auto bg-[#eeeeee] h-[50%] w-[100%] text-center align-center leading-normal w-3/4 rounded-md mb-1 py-2">
                                        {(props.values.ins_amount * props.values.ins_period + parseInt(props.values.down_payment)).toLocaleString('en-US')}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="input-flex-row">
                                    <div className="flex flex-col flex-1">
                                      <label> ผ่อนงวดละ </label>
                                      <div className="flex-auto bg-[#eeeeee] h-[100%] w-[100%] text-3xl lg:text-7xl 2xl:text-9xl text-center align-center leading-normal w-3/4 rounded-md py-5 lg:py-9" style={{ fontSize: "10rem" }}>
                                        {props.values.ins_amount?.toLocaleString('en-US')}
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                          )}
                          {/* admin_business_unit_role */}
                          {admin_business_unit_role && (
                            <div className="!mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md pt-5 z-[-1]">
                              <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex justify-center">
                                <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-lg font-semibold -mt-[10px] ">
                                  สำหรับเจ้าหน้าที่
                                </span>
                              </div>
                              <div className="p-5">
                                <div>
                                  <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center pt-2 pb-2">ตั้งค่าจัดการร้านค้า</div>
                                  {themeInit.features?.contract_issuer && <InputField label="ชื่อผู้ออกสัญญา" name="contract_issuer" disabled={(statusAction > 5) || lockUpdate} />}
                                  <div className="input-flex-row">
                                    <InputField label="Commission ร้านค้า (%)" name="commission" type="number" disabled={(statusAction > 5) || lockUpdate} />
                                    <InputField
                                      label="ค่าตอบแทนพิเศษร้านค้า (บาท)"
                                      name="benefit"
                                      type="number"
                                      disabled={(statusAction > 5) || lockUpdate}
                                    />

                                  </div>
                                  {themeInit.features?.commission_type &&
                                    <div className="input-flex-row">
                                      <SelectField
                                        label="Commission type"
                                        id="commission_type"
                                        name="commission_type"
                                        options={[
                                          { value: 1, label: 'รูปแบบที่ 1' },
                                          { value: 2, label: 'รูปแบบที่ 2' },
                                        ]}
                                        disabled={true}
                                      />

                                      <InputField
                                        label="Commission Price"
                                        name="commission_price"
                                        type="number"
                                        disabled={true}
                                      />
                                    </div>
                                  }
                                </div>
                                <div className="pt-8">
                                  <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center pb-2">ตั้งค่าสัญญา</div>
                                  <div className="input-flex-row">
                                    <InputField label="ค่าดำเนินการล่าช้า (บาท)" name="penalty_fee" type="number" disabled={statusAction > 5 || lockUpdate} />
                                    <InputField label="ค่าดำเนินการล่าช้าไม่เกิน (บาท/ครั้ง)" name="penalty_fee_limit" type="number" disabled={statusAction > 5 || lockUpdate} />
                                  </div>
                                </div>
                                <div>
                                  <div className="input-flex-row">
                                    <InputField label="ค่าธรรมเนียมทำสัญญา (บาท)" name="fee" type="number" disabled={statusAction > 5 || lockUpdate} />
                                    <InputField label="ค่าธรรมเนียมปลดล็อค (บาท)" name="unlock_fee" type="number" disabled={statusAction > 5 || lockUpdate} />
                                  </div>
                                </div>

                                <div>
                                  <div className="input-flex-row">
                                    <InputField label="ค่าธรรมเนียมการติดตาม ครั้งละ (บาท)" name="tracking_fee" type="number" disabled={statusAction > 5 || lockUpdate} />
                                    <InputField label="ค่าบริการประเมินเครดิตเบื้องต้น (ชําระแยก)" name="preliminary_credit_assessment" type="number" disabled={statusAction > 5 || lockUpdate} />

                                  </div>
                                </div>

                                {/* <div className="pt-8">
                                                                  <div className="text-l font-semibold ltr:sm:text-left rtl:sm:text-right text-center pb-2">ตั้งค่าสัญญา</div>
                                                                  <div className="input-flex-row">
                                                                      <InputField label="ค่าปรับผิดนัด รายวัน (บาท)" name="penalty_fee" type="number" disabled={statusAction >= 5} />
                                                                      <InputField label="ค่าธรรมเนียมทำสัญญา (บาท)" name="fee" type="number" disabled={statusAction > 2} />
                                                                  </div>
                                                              </div>
                                                              <div>
                                                                  <div className="input-flex-row">
                                                                      <InputField label="ค่าธรรมเนียมการติดตาม ครั้งละ (บาท)" name="tracking_fee" type="number" disabled={statusAction >= 5} />
                                                                      {statusAction === 5 && (
                                                                          <InputField label="ค่าธรรมเนียมปลดล็อค (บาท)" name="unlock_fee" type="number" disabled={statusAction !== 5 && statusAction > 5} />
                                                                      )}
                                                                  </div>
                                                              </div> */}
                                <div className="pt-5">
                                  <InputField
                                    label="เงื่อนไขสัญญา"
                                    name="condition_contract"
                                    as="textarea"
                                    rows="10"
                                    // placeholder="แสดงข้อมูลนี้ประกอบผลการพิจารณา เช่น เครติดลูกค้าไม่ผ่าน เป็นต้น"
                                    className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                                    default-value="-"
                                    disabled={statusAction > 5 || lockUpdate}
                                  />
                                </div>
                                <div className="mt-6 z-[-1]">
                                  <InputField
                                    label="หมายเหตุประกอบสัญญา"
                                    name="memo"
                                    as="textarea"
                                    rows="5"
                                    // placeholder="แสดงข้อมูลนี้ประกอบผลการพิจารณา เช่น เครติดลูกค้าไม่ผ่าน เป็นต้น"
                                    className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                                    default-value="-"
                                    disabled={statusAction > 5 || lockUpdate}
                                  />
                                </div>
                                {statusAction === 5 && (
                                  <div className="text-themePrimary mt-5">
                                    วันที่อนุมัติ: {convertDateTimeDbToClient(props.values.approved_time)} น. อนุมัติโดย : {props.values.approved_by}
                                  </div>
                                )}


                              </div>
                            </div>
                          )}
                          {/* {(statusAction <= 5 && statusAction >= 3 && admin_business_unit_role) &&  (
                            <div className="!mt-8 border border-white-light dark:border-[#1b2e4b] group rounded-md">
                              <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex">
                                <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-base font-semibold -mt-[10px]">
                                  ตั้งค่าธรรมเนียมปลดล็อค (บาท)
                                </span>
                              </div>
                              <div className="mt-5 mx-5 py-2 text-center text-base  bg-[#b9ffbb] rounded-md">
                                  ตั้งค่าสถานะล็อคเครื่อง สำหรับการคิดทำเนียมค่าล็อคเครื่อง มีผลต่อการคำนวณยอดเงินจริง
                              </div>
                              <div className="p-5">
                                <div>
                                  <SelectField
                                    label="สถานะการล็อคเครื่อง"
                                    id="is_locked"
                                    name="is_locked"
                                    options={[
                                      { value: false, label: 'ปลดล็อค' },
                                      { value: true, label: 'ล็อค' },
                                    ]}
                                    disabled={statusAction > 5}
                                  />
                                </div>
                              </div>
                            </div>
                          )} */}

                          <div ref={ref} style={{ height: '0px' }}></div>
                          {/* test contract: IND0000017 */}

                          <>
                            <footer
                              className='main-content'
                              style={{
                                position: 'fixed',
                                left: 0,
                                bottom: 0,
                                width: '100%',
                                height: '80px',
                                textAlign: 'center',
                                backgroundColor: 'white',
                                zIndex: 0,
                              }}
                            >
                              <div className="flex flex-row gap-5">
                                <div className="flex-0 flex flex-row w-full gap-4 pr-[130px] justify-start px-5">
                                  {statusAction <= 1 && contractRate && !lockUpdate && (
                                    <button type="submit" className="btn btn-primary !mt-6 w-full border-0 bg-[#eeeeee] text-black max-w-[200px]">
                                      บันทึกร่างสัญญา
                                    </button>
                                  )}
                                  {statusAction === 1 && pageAction && contractRate && !lockUpdate && (
                                    <button
                                      type="button"
                                      className="btn-primary btn !mt-6 w-full border-0 text-white max-w-[200px]"
                                      onClick={() => {
                                        sendPicharana(props)
                                      }}
                                    >
                                      ส่งพิจารณาสัญญา
                                    </button>
                                  )}
                                  {admin_business_unit_role && (
                                    <>
                                      {(statusAction === 5 && ['11', '12', '13', '14', '15', '16', '17', '18', '19'].includes(formData?.credit?.code) && !formData.is_completed) && (
                                        <button type="button" onClick={() => {
                                          Swal.fire({
                                            title: 'สิ้นสุดสัญญา',
                                            showCancelButton: true,
                                            confirmButtonColor: themeInit.color.themePrimary,
                                            cancelButtonColor: '#d33',
                                            cancelButtonText: 'ยกเลิก',
                                            confirmButtonText: 'ยืนยัน',
                                            reverseButtons: true,
                                            html:
                                              `<label for="password" style="display: block text-align: left font-size: 1rem margin-top: 10px color: #000000">รหัสผ่านผู้ใช้งาน:</label>
                                                <input id="password" type="password" type="text" class="swal2-input" style="margin: 0 !important width: 100% font-size: 1rem color: #000000" placeholder="รหัสผ่านผู้ใช้งาน สำหรับยืนยันการยกเลิก">`,
                                            preConfirm: () => {
                                              const password = document?.getElementById('password') as HTMLInputElement

                                              if (!password?.value) {
                                                Swal.showValidationMessage('กรุณากรอกรหัสผ่าน')
                                                return false
                                              }

                                              return password?.value
                                            }
                                          }).then(result => {
                                            if (result.isConfirmed) {
                                              const params = { id_contract: formData.uuid }
                                              contractComplete({ data: params })
                                            }
                                          })
                                        }} className='btn bg-green-500 text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] max-w-[200px]'>สิ้นสุดสัญญา</button>
                                      )}
                                      {statusAction > 1 && statusAction <= 5 && !lockUpdate && (
                                        <button type="submit" className="btn !mt-6 w-full border-0 btn-primary max-w-[200px]">
                                          บันทึกข้อมูลสัญญา
                                        </button>
                                      )}

                                      {statusAction > 1 && statusAction < 5 && !lockUpdate && (
                                        <button
                                          type="button"
                                          className="btn bg-[#c80224] text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] max-w-[250px]"
                                          onClick={() => {
                                            Swal.fire({
                                              title: 'ยืนยันการยกเลิกร่างสัญญา',
                                              text: 'คุณต้องการยกเลิกร่างสัญญานี้ใช่หรือไม่?',
                                              icon: 'warning',
                                              showCancelButton: true,
                                              confirmButtonColor: themeInit.color.themePrimary,
                                              cancelButtonColor: '#d33',
                                              confirmButtonText: 'ยืนยัน',
                                              cancelButtonText: 'ยกเลิก',
                                              reverseButtons: true,
                                              html:
                                                `<label for="reason_cancel" style="display: block text-align: left margin-bottom: 10px font-size: 1rem font-size: 1rem margin-top: 10px color: #000000">เหตุผลการยกเลิก:</label>
                                                  <input id="reason_cancel" type="text" class="swal2-input" style="margin: 0 !important width: 100% color: #000000" placeholder="โปรดระบุ">
                                                  <label for="password" style="display: block text-align: left font-size: 1rem margin-top: 10px color: #000000 color: #000000">รหัสผ่านผู้ใช้งาน:</label>
                                                  <input id="password" type="password" type="text" class="swal2-input" style="margin: 0 !important width: 100% font-size: 1rem color: #000000" placeholder="รหัสผ่านผู้ใช้งาน สำหรับยืนยันการยกเลิก">`,
                                              preConfirm: () => {
                                                const reason_cancel = (document?.getElementById('reason_cancel') as HTMLInputElement)?.value
                                                const password = (document?.getElementById('password') as HTMLInputElement)?.value ?? ''

                                                if (!reason_cancel || !password) {
                                                  Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง')
                                                  return false
                                                }

                                                return { reason_cancel, password }
                                              },
                                            }).then((result) => {
                                              if (result.isConfirmed) {
                                                const status = statusAction === 2 ? 6 : 7
                                                const { reason_cancel, password } = result.value
                                                handleContractCancel(reason_cancel, password, status)
                                              }
                                            })
                                          }}
                                        >
                                          {statusAction === 2 ? 'ยกเลิกร่างสัญญา' : 'ยกเลิกร่างสัญญาที่อนุมัติแล้ว'}
                                        </button>
                                      )}
                                      {((statusAction < 5) && (statusAction !== 1) && (statusAction !== 0)) && !lockUpdate && (
                                        <button
                                          type="button"
                                          className="btn !mt-6 w-full border-0 btn-dark max-w-[200px]"
                                          onClick={() => {
                                            Swal.fire({
                                              title: 'ยืนยันการอัพเดทสถานะ',
                                              text: 'คุณต้องการส่งสัญญากลับสถานะร่างนี้ใช่หรือไม่?',
                                              icon: 'warning',
                                              showCancelButton: true,
                                              confirmButtonColor: themeInit.color.themePrimary,
                                              cancelButtonColor: '#d33',
                                              confirmButtonText: 'ยืนยัน',
                                              cancelButtonText: 'ยกเลิก',
                                              reverseButtons: true,
                                            }).then((result) => {
                                              if (result.isConfirmed) {
                                                handleContractUpdateStatus(props, 1)
                                              }
                                            })
                                          }}
                                        >
                                          ส่งกลับร่างสัญญา
                                        </button>
                                      )}
                                      {(statusAction === 2 || statusAction === 4) && !lockUpdate && (
                                        <>

                                          <button
                                            type="button"
                                            className="btn bg-[#0516af] text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] max-w-[200px]"
                                            onClick={() => {
                                              Swal.fire({
                                                title: 'ยืนยันการอัพเดทสถานะ',
                                                text: 'คุณต้องการอัพเดทสถานะสัญญานี้ใช่หรือไม่?',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: themeInit.color.themePrimary,
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'ยืนยัน',
                                                cancelButtonText: 'ยกเลิก',
                                                reverseButtons: true,
                                              }).then((result) => {
                                                if (result.isConfirmed) {
                                                  if (statusAction === 2) {
                                                    sendAnumad(props)
                                                  } else {
                                                    handleContractUpdateStatus(props, 5)
                                                  }
                                                }
                                              })
                                            }}
                                          >
                                            {statusAction === 2 ? 'อนุมัติร่างสัญญา' : 'อนุมัติสัญญา'}
                                          </button>
                                        </>
                                      )}
                                      {statusAction === 5 && !lockUpdate && (
                                        <button
                                          type="button"
                                          className="btn bg-[#ff0000] text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] max-w-[200px]"
                                          onClick={() => {
                                            Swal.fire({
                                              title: 'ยืนยันการยกเลิกสัญญา',
                                              text: 'คุณต้องการยกเลิกสัญญานี้ใช่หรือไม่?',
                                              icon: 'warning',
                                              showCancelButton: true,
                                              confirmButtonColor: themeInit.color.themePrimary,
                                              cancelButtonColor: '#d33',
                                              confirmButtonText: 'ยืนยัน',
                                              cancelButtonText: 'ยกเลิก',
                                              reverseButtons: true,
                                              html:
                                                `<label for="reason_cancel" style="display: block text-align: left margin-bottom: 10px font-size: 1rem margin-top: 10px color: #000000">เหตุผลการยกเลิก:</label>
                                                <input id="reason_cancel" type="text" class="swal2-input" style="margin: 0 !important width: 100% font-size: 1rem color: #000000" placeholder="โปรดระบุ">
                                                <label for="password" style="display: block text-align: left font-size: 1rem margin-top: 10px color: #000000">รหัสผ่านผู้ใช้งาน:</label>
                                                <input id="password" type="password" type="text" class="swal2-input" style="margin: 0 !important width: 100% font-size: 1rem color: #000000" placeholder="รหัสผ่านผู้ใช้งาน สำหรับยืนยันการยกเลิก">`,
                                              preConfirm: () => {
                                                const reason_cancel = (document?.getElementById('reason_cancel') as HTMLInputElement)?.value
                                                const password = (document?.getElementById('password') as HTMLInputElement)?.value

                                                if (!reason_cancel || !password) {
                                                  Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง')
                                                  return false
                                                }

                                                return { reason_cancel, password }
                                              },
                                            }).then((result) => {
                                              if (result.isConfirmed) {
                                                const { reason_cancel, password } = result.value
                                                handleContractCancel(reason_cancel, password, 8)
                                              }
                                            })
                                          }}
                                        >
                                          ยกเลิกสัญญา
                                        </button>
                                      )}

                                      {(statusAction === 5 && !lockUpdate && themeInit?.features?.contract_appr_restart) && (
                                        <button
                                          type="button"
                                          className="btn bg-[#b3b3b3] text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] max-w-[200px]"
                                          onClick={() => {
                                            Swal.fire({
                                              title: 'ยืนยันการกลับไปร่างสัญญา',
                                              text: 'คุณต้องการกลับไปร่างสัญญาานี้ใช่หรือไม่?',
                                              icon: 'warning',
                                              showCancelButton: true,
                                              confirmButtonColor: themeInit.color.themePrimary,
                                              cancelButtonColor: '#d33',
                                              confirmButtonText: 'ยืนยัน',
                                              cancelButtonText: 'ยกเลิก',
                                              reverseButtons: true,
                                              html:
                                                `<label for="reason" style="display: block text-align: left margin-bottom: 10px font-size: 1rem margin-top: 10px color: #000000">เหตุผล:</label>
                                                <input id="reason" type="text" class="swal2-input" style="margin: 0 !important width: 100% font-size: 1rem color: #000000" placeholder="โปรดระบุ">
                                                <label for="password" style="display: block text-align: left font-size: 1rem margin-top: 10px color: #000000">รหัสผ่านผู้ใช้งาน:</label>
                                                <input id="password" type="password" type="text" class="swal2-input" style="margin: 0 !important width: 100% font-size: 1rem color: #000000" placeholder="รหัสผ่านผู้ใช้งาน สำหรับยืนยันการยกเลิก">`,
                                              preConfirm: () => {
                                                const reason = (document?.getElementById('reason') as HTMLInputElement)?.value
                                                const password = (document?.getElementById('password') as HTMLInputElement)?.value

                                                if (!reason || !password) {
                                                  Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง')
                                                  return false
                                                }

                                                return { reason, password }
                                              },
                                            }).then((result) => {
                                              if (result.isConfirmed) {
                                                const { reason, password } = result.value
                                                contractAppvRestart({
                                                  data: {
                                                    id_contract: contract_uuid,
                                                    password: password,
                                                    reason: reason,
                                                  }
                                                })
                                              }
                                            })
                                          }}
                                        >
                                          กลับไปร่าง
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </footer>
                          </>


                        </Form>
                      </>
                    )
                  }}
                </Formik>
                {contract_id ? (
                  <ChatPopup id_contract={contract_id} />
                ) : (
                  <> </>
                )}
              </Tab.Panel>
              <Tab.Panel>
                <div className="p-6">
                  {statusAction >= 3 ? (
                    <>
                      <div className="text-lg font-semibold text-center">
                        {`หลักฐานประกอบสัญญา ${formData.reference}`} 
                      </div>
                      <div className="w-full h-[auto] bg-[#ffddab] text-[#f3831e] rounded-md mt-3">
                        <div className="p-5">
                          แจ้งเตือน! อัปโหลดหลักฐานประกอบสัญญาเมื่อผ่านการอนุมัติร่างสัญญาแล้ว เมื่ออัปโหลดแล้วจะไม่สามารถแก้ไขได้ โปรดตรวจสอบก่อนดำเนินการ
                        </div>
                      </div>
                      <div className="mt-6">{uploadContent()}</div>
                      {statusAction === 3 && (
                        <button
                          type="button"
                          className="btn !mt-6 w-full border-0 btn-primary"
                          onClick={() => {
                            upLoadDoc()
                          }}
                        >
                          ส่งอนุมัติสัญญา
                        </button>
                      )}
                      <hr className="border-white-light dark:border-[#1b2e4b] my-10 w-full" />
                      <Formik initialValues={formData} onSubmit={() => { }} enableReinitialize>
                        {(props) => {
                          return <Form>
                            {themeInit.features.e_sign_status && formData?.business_unit?.signature_online_type == 2 && contract_uuid && (statusAction === 3 || statusAction === 4 || statusAction === 5) && (
                              <div className="!mt-6 border border-white-light dark:border-[#1b2e4b] group rounded-md pt-5 z-[-1]">
                                <div className="border-b border-white-light dark:border-[#1b2e4b] p-5 pt-0 flex justify-center">
                                  <span className="bg-white dark:bg-black dark:text-white-light inline-block px-3 h-[20px] lg:h-[20px] rounded flex justify-center items-center text-lg font-semibold -mt-[10px] ">
                                    สัญญา KYC
                                  </span>
                                </div>
                                <div className="p-5">
                                  {state.status &&
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => updateContractEsign({data:{uuid:uuid,e_contract_status:true}})} type="button" className="btn bg-orange-500 text-white shadow-lg hover:shadow-none max-w-40">อัพเดตสถานะ KYC</button>
                                    </div>
                                   }
                                  {props.values.e_contract_status &&
                                    <div className="flex justify-end gap-2">
                                      {props.values.status_id != 5 && <button
                                        type="button"
                                        onClick={() => setActionCancelEkyc(true)}
                                        className="btn bg-red-600 text-white shadow-lg hover:shadow-none max-w-40"
                                      >
                                        ยกเลิก e-sign
                                      </button>}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          downloadContractEsign();
                                        }}
                                        className="btn btn-primary max-w-40"
                                      >
                                        ดาวน์โหลด e-sign
                                      </button>
                                    </div>
                                  }
                                  <div className="flex flex-col gap-2">
                                    <InputGenerateField
                                      onGenerate={async () => {
                                        await createEkycGetContract({ data: { uuid: formData.uuid } });
                                      }}
                                      loading={isLoadingGetContract}
                                      showStatus={props.values.e_contract_status}
                                      label="หนังสือสัญญาสำหรับลูกค้า"
                                      name="e_contract_link"
                                      className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                                      disabled={true}
                                      copy={true}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Form>
                        }}
                      </Formik>
                    </>
                  ) : null}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="pt-5">
                  <div className="text-lg font-semibold text-center">ประวัติการใช้งานสัญญาเลขที่ {formData?.reference}</div>
                  <div className="mb-5">
                    <div className="xl:max-w-[900px] lg:max-w-[600px] md:max-w-[550px] sm:max-w-[400px] mx-auto">
                      {(() => {
                        const showLogDetails = (details: any) => {
                          const tableContent = details
                            .map(
                              (detail: any) => `
                                  <tr>
                                  <td class="text-black">${detail.field_name}</td>
                                  <td class="text-black" style="white-space: pre-line word-wrap: break-word">${detail.prev}</td>
                                  <td class="text-black">${detail.current}</td>
                                  </tr>
                              `
                            ).join('')
                          const table = `
                                  <table class="w-full text-sm">
                                      <thead>
                                      <tr>
                                          <th style="width:10%">ชื่อฟิลด์</th>
                                          <th style="width:40%">ก่อน</th>
                                          <th style="width:40%">ปัจจุบัน</th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      ${tableContent}
                                      </tbody>
                                  </table>
                                  `
                          Swal.fire({
                            title: 'รายละเอียดการเปลี่ยนแปลง',
                            html: table,
                            confirmButtonColor: themeInit.color.themePrimary,
                            confirmButtonText: 'ปิด',
                            width: '80%',
                          })
                        }
                        return historyLogData
                          .sort((a: any, b: any) => moment.utc(b.info.update_at).valueOf() - moment.utc(a.info.update_at).valueOf())
                          .map((log: any, index: any) => {
                            const date = log.info.update_at
                            return (
                              <div className="flex" key={index}>
                                <p className="text-[#3b3f5c] dark:text-white-light min-w-[58px] max-w-[100px] text-base font-semibold py-2.5">
                                  {convertTimeDateDbToClient(date)}
                                </p>
                                <div className="relative before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[15px] before:w-2.5 before:h-2.5 before:border-2 before:border-themePrimary before:rounded-full after:absolute after:left-1/2 after:-translate-x-1/2 after:top-[25px] after:-bottom-[15px] after:w-0 after:h-auto after:border-l-2 after:border-themePrimary after:rounded-full"></div>
                                <div className="p-2.5 self-center ltr:ml-2.5 rtl:ltr:mr-2.5 rtl:ml-2.5">
                                  {admin_business_unit_role && (
                                    <p
                                      className="text-[#3b3f5c] dark:text-white-light font-semibold text-[13px] cursor-pointer hover:underline"
                                      onClick={() => showLogDetails(log.details)}
                                    >
                                      คลิกเพื่อดูข้อมูลประวัติ
                                    </p>
                                  )}
                                  <p className="text-white-dark text-xs font-bold self-center">เปลี่ยนแปลง : {log.info.chnage_by}</p>
                                </div>
                              </div>
                            )
                          })
                      })()}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="pt-5">
                  {formData.is_closed && (
                    <div className='flex w-full'>
                      <div className="flex items-center p-3.5 rounded text-success bg-success-light dark:bg-success-dark-light w-full">
                        <span className="ltr:pr-2 rtl:pl-2">
                          <strong className="ltr:mr-1 rtl:ml-1">สถานะดำเนินการ :</strong> {formData.credit.code} - {formData.credit.name}
                        </span>
                      </div>
                    </div>
                  )}
                  {statusAction === 5 ? (
                    <div className='flex'>
                      <div className='flex-1'></div>
                      <div className="flex-1 text-lg font-semibold text-center">เลขที่สัญญา {formData?.reference}</div>
                      <div className='flex flex-1 justify-end'>
                        {!formData.is_closed && !lockUpdate && (
                          <button
                            type="button"
                            className={`flex-0 btn btn-sm btn-outline-danger`}
                            onClick={() => closeContact()}
                            disabled={formData.on_payment_process === "pay_installment"}
                          >
                            ปิดสัญญา {formData.on_payment_process === "close_contract" ? "(กำลังชำระเงิน)" : ""}
                          </button>
                        )}
                      </div>

                    </div>
                  ): <div className="flex">
                        <div className="flex-1 text-lg font-semibold text-center">เลขที่สัญญา {formData?.reference}</div>
                    </div>}
                  <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                      <table className="table-striped table-hover">
                        <thead>
                          <tr>
                            <th className="text-center">งวดที่</th>
                            <th className="text-center">ผ่อนงวดละ</th>
                            <th className="text-center">วันครบกำหนด</th>
                            <th className="text-center">สถานะ</th>
                            <th className="text-center">ยอดชำระเงิน</th>
                            <th className="text-center">วันที่ชำระ</th>
                            <th className="text-center">ช่องทาง</th>
                            <th className="text-center">action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {installmentsData?.map((item: any) => (
                            <tr key={item?.id}>
                              <td className="text-center">{item?.ins_no}</td>
                              <td className="text-center"> {item?.amount}</td>
                              <td className="text-center">{convertDateDbToClient(item?.due_at)}</td>
                              <td className="text-center">
                                <span className={`badge ${getStatusClassName(item.status, item.is_due)}`}>{getStatusText(item.status, item.is_due, item.invoice_type)}</span>
                              </td>

                              {item?.status === 'complete' ? <td className="text-center"> {item?.payment.amount ?? '-'}</td> : <td className="text-center"> - </td>}
                              <td className="text-center">{item?.payed_at ? convertDateTimeDbToClient(item?.payed_at) : '-'}</td>
                              {item.payment?.payment_method && item?.status === 'complete' ? <td className="text-center"> {item.payment?.payment_method}</td> : <td className="text-center"> - </td>}
                              <td className="text-center"> {getStatusAction(item)} </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className='xl:max-w-[900px] lg:max-w-[600px] md:max-w-[550px] sm:max-w-[400px] mx-auto mt-5'>
                  <Formik initialValues={formDataContractStatus}
                    onSubmit={submitFormCredit}
                    enableReinitialize autoComplete="off"
                    validationSchema={Yup.object().shape({
                      contentStatus: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
                    })}
                  >
                    {(props) => {
                      return (<Form>
                        {!lockUpdate && (
                          <>
                            <div className='flex gap-5 flex-col'>
                              <div className="flex-1 text-lg font-semibold text-center">เลขที่สัญญา {formData?.reference}</div>
                              <div className="flex-1 text-lg font-semibold">
                                สถานะสัญญา {formData?.credit?.name}
                              </div>
                            </div>
                            {![2, 3, 4, 11, 16, 17, 18, 19, 34, 39].includes(formData?.credit?.id) && (
                              <div>
                                <div className="flex-1 text-lg font-semibold mt-5">
                                  <SelectField
                                    label="เลือกสถานะสัญญา"
                                    id="contentStatus"
                                    name="contentStatus"
                                    placeholder="กรุณาเลือก"
                                    options={statusCreditListV2}
                                  />
                                </div>
                                <div className="flex flex-1 mt-5">
                                  <InputField
                                    label="คำอธิบายประกอบสถานะ"
                                    name="note"
                                    as="textarea"
                                    rows="5"
                                  />
                                </div>

                                <button type="submit" className="btn btn-primary !my-4 w-full border-0 primary ">
                                  ตกลง
                                </button>
                              </div>
                            )}
                          </>
                        )}


                        <div>
                          <div className="flex-1 text-lg font-semibold mt-4">ประวัติสถานะสัญญา</div>
                          <div className="mt-5 panel p-0 border-0 overflow-hidden">
                            <div className="table-responsive">
                              <table className="table-striped table-hover">
                                <thead>
                                  <tr>
                                    <th className="text-center">วันที่-เวลา</th>
                                    <th className="text-center">สถานะสัญญา</th>
                                    <th className="text-center">คำอธิบายประกอบสถานะ</th>
                                    <th className="text-center">ผู้ดำเนินการ</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {statusCreditHistoryList?.map((item: any) => (
                                    <tr key={item?.id}>
                                      <td className="text-center">{item?.created_at ? convertDateTimeDbToClient(item?.created_at) : '-'}</td>
                                      <td className="text-center">{item?.credit?.code + ' - ' + item?.credit?.name}</td>
                                      <td className="text-center">{item?.note ?? '-'}</td>
                                      <td className="text-center">{item?.name ?? '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </Form>)
                    }}

                  </Formik>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                {(contract_uuid && admin_business_unit_role) && (
                  <div className="panel px-6 flex-1 py-6 z-[0]">
                    <Formik
                      initialValues={{ message: '' }}
                      onSubmit={submitMessage}
                      enableReinitialize
                      autoComplete="off"
                      validationSchema={Yup.object().shape({
                        message: Yup.string().nullable().required('กรุณาพิมพ์ข้อความแสดงความคิดเห็น'),
                      })}
                    >
                      {({ values }) => {
                        return (
                          <Form>
                            {statusAction <= 5 && (
                              <div>
                                <InputField
                                  label="แสดงความคิดเห็น"
                                  name="message"
                                  as="textarea"
                                  rows="5"
                                  placeholder=" "
                                  className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                                />
                                <div className="text-right">
                                  <button
                                    type="reset"
                                    className="btn btn btn-outline-primary !mt-2 display-inline"
                                    onClick={() => {
                                      submitMessage(values)
                                    }}
                                  >
                                    บันทึกข้อความ
                                  </button>
                                </div>
                              </div>
                            )}
                          </Form>
                        )
                      }}
                    </Formik>
                    <div className="mt-5 ">
                      {contractMessage.map((item: any) => (
                        <div key={item.name}>
                          <div className="mt-2">
                            {item.name} {convertDateTimeDbToClient(item.created_at)}
                          </div>
                          <div className="bg-[#eeeeee] py-3 px-6">{item.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel>
                <div className='xl:max-w-[1200px] lg:max-w-[600px] md:max-w-[550px] sm:max-w-[400px] mx-auto mt-5'>
                  <Formik
                    initialValues={formDataLockedDeviceStatus}
                    onSubmit={submitFormLockedDevice}
                    enableReinitialize autoComplete="off"
                    validationSchema={Yup.object().shape({
                      //isLockedStatus: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
                      provider_applock_id: Yup.string().nullable().required('กรุณาใส่ข้อมูลให้ครบ'),
                    })}
                  >
                    {(props) => {
                      return (<Form>
                        <div className='flex gap-5 flex-col'>
                          <div className="flex-1 text-lg font-semibold text-center">สถานะการล็อคเครื่อง</div>
                        </div>
                        {!lockUpdate && (
                          <>
                            {(!formData?.is_completed && ![2, 3, 4, 11, 16, 17, 18, 19, 34, 39].includes(formData?.credit?.id)) && (
                              <>
                                <div className='text-lg font-semibold'>
                                  <SelectField
                                    label="ผู้ให้บริการ"
                                    id="provider_applock_id"
                                    name="provider_applock_id"
                                    placeholder="กรุณาเลือก"
                                    options={providerList}
                                    onChange={(e) => setSelectProvider(e.value)}
                                  />
                                </div>
                                <div>
                                  <div className="flex-1 text-lg font-semibold my-5 ">
                                    <SelectField
                                      label="เลือกสถานะล็อคเครื่อง"
                                      id="isLockedStatus"
                                      name="isLockedStatus"
                                      placeholder="กรุณาเลือก"
                                      options={[
                                        {
                                          value: false,
                                          label: 'ปลดล็อคเครื่อง',
                                        },
                                        {
                                          value: true,
                                          label: 'ล็อคเครื่อง',
                                        }
                                      ]}
                                    />
                                  </div>

                                  {selectProvider == 0 && <div className="flex items-center p-3.5 rounded text-danger bg-danger-light border border-danger">
                                    <span className="ltr:pr-2 rtl:pl-2">
                                      ตั้งค่าสถานะล๊อคเครื่อง  สำหรับการคิดทำเนียมค่าล๊อคเครื่อง มีผลต่อการคำนวณยอดเงินจริง
                                    </span>
                                  </div>}
                                  <button type="submit" className="btn btn-primary !my-4 w-full border-0 primary ">
                                    ตกลง
                                  </button>
                                </div>
                              </>
                            )}
                          </>
                        )}


                        <div>
                          <div className="flex-1 text-lg font-semibold mt-4">ประวัติสถานะล็อคเครื่อง</div>
                          <div className="mt-5 panel p-0 border-0 overflow-hidden">
                            <div className="table-responsive">
                              <table className="table-striped table-hover">
                                <thead>
                                  <tr>
                                    <th className="text-center">วันที่-เวลา</th>
                                    <th className="text-center">ตั้งค่าธรรมเนียมล็อคเครื่อง</th>
                                    <th className="text-center">ผู้ให้บริการ</th>
                                    <th className="text-center">ตั้งค่าโปรแกรมล็อคเครื่อง</th>
                                    <th className="text-center min-w-[180px]">สถานะล๊อคเครื่อง(ผู้ใช้งาน)</th>
                                    <th className="text-center">ผู้ดำเนินการ</th>
                                    <th className="text-center">รายละเอียด</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {formDataLockedDeviceStatus?.history?.map((item: any) => (
                                    <tr key={item?.id}>
                                      <td className="text-center">{item?.created_at ? convertDateTimeDbToClient(item?.created_at) : '-'}</td>
                                      <td className="text-center">{item?.is_locked}</td>
                                      <td className="text-center">{item?.service_provider ?? '-'}</td>
                                      <td className="text-center">{item?.is_lock_device ?? '-'}</td>
                                      <td className="text-center">
                                        <span className={`${getStatusLockClassName(item?.device_status,)}`}>{item?.device_status ?? '-'}</span>
                                      </td>
                                      <td className="text-center">{item?.name ?? '-'}</td>
                                      <td className="text-center">{item?.note ?? '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </Form>)
                    }}

                  </Formik>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
        <Transition appear show={actionModal} as={Fragment}>
          <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-[black]/60" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center px-4 py-8">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                    <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => { setActionModal(false) }} >
                      <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">เลขที่สัญญา : #{formData?.reference}</div>
                    <div className="p-8">
                      <div className="grid grid-cols-2 content-center">
                        <div className="h-auto p-2 w-auto"> ชื่อสินทรัพย์ </div>
                        <div className="h-auto p-2 w-auto text-right">{formData?.asset?.name}</div>
                      </div>
                      <div className="grid grid-cols-2 content-center">
                        <div className="h-auto p-2 w-auto"> งวดที่ </div>
                        <div className="h-auto p-2 w-auto text-right">{installmentDetail?.ins_no}</div>
                      </div>
                      <div className="grid grid-cols-2 content-center">
                        <div className="h-auto p-2 w-auto"> วันที่ชำระ </div>
                        <div className="h-auto p-2 w-auto text-right">{installmentDetail?.payed_at ? convertDateDbToClient(installmentDetail?.payed_at) : '-'}</div>
                      </div>
                      <div className="grid grid-cols-2 content-center">
                        <div className="h-auto p-2 w-auto"> ค่างวด </div>
                        <div className="h-auto p-2 w-auto text-right">
                          {installmentDetail?.amount?.toLocaleString('en-US')}
                          บาท
                        </div>
                      </div>
                      <div className="grid grid-cols-2 content-center">
                        <div className="h-auto p-2 w-auto"> ค่าดำเนินการล่าช้า/วัน </div>
                        <div className="h-auto p-2 w-auto text-right">
                          {installmentDetail?.penalty_fee}
                          บาท
                        </div>
                      </div>
                      <div className="grid grid-cols-2 content-center">
                        <div className="h-auto p-2 w-auto"> ค่าธรรมเนียม </div>
                        <div className="h-auto p-2 w-auto text-right">
                          {installmentDetail?.fee}
                          บาท
                        </div>
                      </div>
                      <div className="grid grid-cols-2 content-center">
                        <div className="h-auto p-2 w-auto"> รวมเป็นเงิน </div>
                        <div className="h-auto p-2 w-auto text-right">
                          {(installmentDetail?.amount + installmentDetail?.penalty_fee + installmentDetail?.fee)?.toLocaleString('en-US')}
                          บาท
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
        <Transition appear show={actionReportModal} as={Fragment}>
          <Dialog as="div" open={actionReportModal} onClose={() => setActionReportModal(false)} className="relative z-[52]">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-[black]/60" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center px-4 py-8">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" >
                  <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-xl text-black dark:text-white-dark">
                    <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => { setActionReportModal(false) }}>
                      <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px] pt-7 text-center">
                      ขอให้ชำระหนี้ และบอกกล่าวเลิกสัญญา
                    </div>
                    <div className="p-8 pt-3 bg-[#fbfbfb]">
                      <div className="grid content-center">
                        <div className="h-auto p-2 w-auto">
                          <EditorProvider>
                            <Toolbar>
                              <BtnUndo />
                              <BtnRedo />
                              <Separator />
                              <BtnBold />
                              {/* <BtnItalic /> */}
                              <BtnUnderline />
                              {/* <Separator />
                              <BtnNumberedList />
                              <BtnBulletList />
                              <Separator /> */}
                              {/* <BtnLink />
                              <BtnClearFormatting />
                              <Separator />
                              <BtnStyles /> */}
                            </Toolbar>
                            <Editor
                              containerProps={{ style: { minHeight: '300px' } }}
                              value={html}
                              onChange={e => setHtml(e.target.value)}
                            />
                          </EditorProvider>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <button type="button" className="btn !mt-6 w-full border-0 btn-primary max-w-[200px]" onClick={() => submitFormPDF()}>
                          สร้างหนังสือขอชำระหนี้
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
        <Transition appear show={actionRetuenModal} as={Fragment}>
          <Dialog as="div" open={actionRetuenModal} onClose={() => setActionRetuenModal(false)} className="relative z-[52]">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-[black]/60" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center px-4 py-8">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" >
                  <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-xl text-black dark:text-white-dark">
                    <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => { setActionRetuenModal(false) }}>
                      <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px] pt-7 text-center">
                      ขอรับคืน-ซื้อเครื่อง
                    </div>
                    <div className="px-6">
                      <Formik initialValues={formReturnReceiptData} onSubmit={submitFormReturnReceiptData} enableReinitialize autoComplete="off" validationSchema={SubmittedFormReturnReceiptData}>
                        {(props: any) => (
                          <Form className="space-y-5 dark:text-white custom-select">
                            <div className="input-flex-row">
                              <div className="input-container">
                                <InputField
                                  label="ยอดดาวน์"
                                  name="down_payment"
                                  onKeyPress={(e: any) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault()
                                    }
                                  }}
                                  onKeyUp={(e: any) => {
                                    let amount: any = 0
                                    if (e?.target?.value !== '') {
                                      amount = parseInt(e?.target?.value ?? '0') ?? 0
                                    }
                                    props.setFieldValue('down_payment', amount !== 0 ? amount : '')
                                    props.values.down_payment = amount !== 0 ? amount : ''
                                    setFormReturnReceiptData(calculateTotalReturnReceipt({
                                      ...props?.values,
                                      down_payment: amount !== 0 ? amount : 0
                                    }))
                                  }}
                                  require={true}
                                />
                              </div>
                              <div className="input-container">
                                <InputField
                                  label="ค่างวด"
                                  name="ins_amount"
                                  onKeyPress={(e: any) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault()
                                    }
                                  }}
                                  onKeyUp={(e: any) => {
                                    let amount: any = 0
                                    if (e?.target?.value !== '') {
                                      amount = parseInt(e?.target?.value ?? '0') ?? 0
                                    }
                                    props.setFieldValue('ins_amount', amount !== 0 ? amount : '')
                                    props.values.ins_amount = amount !== 0 ? amount : ''
                                    setFormReturnReceiptData(calculateTotalReturnReceipt({
                                      ...props?.values,
                                      ins_amount: amount !== 0 ? amount : 0
                                    }))
                                  }}
                                  require={true}
                                />
                              </div>
                            </div>
                            <div className="input-flex-row">
                              <div className="input-container">
                                <InputField
                                  label="ค่าดำเนินการล่าช้า"
                                  name="penalty_fee"
                                  onKeyPress={(e: any) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault()
                                    }
                                  }}
                                  onKeyUp={(e: any) => {
                                    let amount: any = 0
                                    if (e?.target?.value !== '') {
                                      amount = parseInt(e?.target?.value ?? '0') ?? 0
                                    }
                                    props.setFieldValue('penalty_fee', amount)
                                    props.values.penalty_fee = amount
                                    setFormReturnReceiptData(calculateTotalReturnReceipt({
                                      ...props?.values,
                                      penalty_fee: amount
                                    }))
                                  }}
                                  require={true}
                                />
                              </div>
                              <div className="input-container">
                                <InputField
                                  label="ค่าปลดล็อค"
                                  name="unlock_fee"
                                  onKeyPress={(e: any) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault()
                                    }
                                  }}
                                  onKeyUp={(e: any) => {
                                    let amount: any = 0
                                    if (e?.target?.value !== '') {
                                      amount = parseInt(e?.target?.value ?? '0') ?? 0
                                    }
                                    props.setFieldValue('unlock_fee', amount !== 0 ? amount : '')
                                    props.values.unlock_fee = amount !== 0 ? amount : ''
                                    setFormReturnReceiptData(calculateTotalReturnReceipt({
                                      ...props?.values,
                                      unlock_fee: amount !== 0 ? amount : 0
                                    }))
                                  }}
                                  require={true}
                                />
                              </div>
                            </div>
                            <div className="input-flex-row">
                              <div className="input-container">
                                <InputField
                                  label="อื่น ๆ"
                                  name="other_fee"
                                  //value={props?.values?.other_fee && props?.values?.other_fee !== 0 ? props?.values?.other_fee : ''}
                                  onKeyPress={(e: any) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault()
                                    }
                                  }}
                                  onKeyUp={(e: any) => {
                                    let amount: any = 0
                                    if (e?.target?.value !== '') {
                                      amount = parseInt(e?.target?.value ?? '0') ?? 0
                                    }
                                    props.setFieldValue('other_fee', amount !== 0 ? amount : '')
                                    props.values.other_fee = amount !== 0 ? amount : ''
                                    setFormReturnReceiptData(calculateTotalReturnReceipt({
                                      ...props?.values,
                                      other_fee: amount !== 0 ? amount : 0
                                    }))
                                  }}
                                  require={true}
                                />
                              </div>
                              <div className="input-container">
                                <InputField
                                  label="หักดาวน์ 50%"
                                  name="deduct_down_payment"
                                  onKeyPress={(e: any) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault()
                                      return
                                    }
                                  }}
                                  require={true}
                                  disabled={true}
                                />
                              </div>
                            </div>
                            <div className="input-flex-row">
                              <div className="input-container">
                                <InputField
                                  label="ผู้เช่าซื้อยินยอมที่จะได้รับเงิน"
                                  name="total"
                                  disabled={true}
                                />
                              </div>
                              <div className="input-container">
                                &nbsp;
                              </div>
                            </div>
                            <div className="mt-1 pb-8 bg-[#fbfbfb]">
                              <div className="flex justify-center">
                                <button
                                  type="submit"
                                  className="btn !mt-6 w-full border-0 btn-primary max-w-[300px]"
                                  // onClick={() => {
                                  //   setPdfLoading(true)
                                  //   fetchReturnReceiptToPDF({
                                  //     data: {
                                  //       down_payment: props?.values?.down_payment && props?.values?.down_payment !== '' ? props?.values?.down_payment : 0,
                                  //       ins_amount: props?.values?.ins_amount && props?.values?.ins_amount !== '' ? props?.values?.ins_amount : 0,
                                  //       penalty_fee: props?.values?.penalty_fee && props?.values?.penalty_fee !== '' ? props?.values?.penalty_fee : 0,
                                  //       unlock_fee: props?.values?.unlock_fee && props?.values?.unlock_fee !== '' ? props?.values?.unlock_fee : 0,
                                  //       other_fee: props?.values?.other_fee && props?.values?.other_fee !== '' ? props?.values?.other_fee : 0,
                                  //       deduct_down_payment: props?.values?.deduct_down_payment && props?.values?.deduct_down_payment !== '' ? props?.values?.deduct_down_payment : 0,
                                  //       total: props?.values?.total && props?.values?.total !== '' ? props?.values?.total : 0,
                                  //     }
                                  //   })
                                  // }}
                                >
                                  สร้างหนังสือขอรับคืน-ซื้อเครื่อง
                                </button>
                              </div>
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
        <Transition appear show={actionCancelEkyc} as={Fragment}>
          <Dialog as="div" open={actionCancelEkyc} onClose={() => setActionCancelEkyc(false)} className="relative z-[52]">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-[black]/60" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center px-4 py-8">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" >
                  <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-xl text-black dark:text-white-dark">
                    <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => { setActionCancelEkyc(false) }}>
                      <IconX />
                    </button>
                    <div className="flex flex-col items-center justify-center py-6 px-8">
                      <h1 className='text-2xl font-bold'>ยกเลิกสัญญา Ekyc</h1>
                      <p className='text-red-500'>ต้องการยกเลิกสัญญา ใช่หรือไม่</p>
                      <div className='mt-4 flex gap-4'>
                        <button type='button' onClick={() => setActionCancelEkyc(false)} className="btn shadow-lg">ยกเลิก</button>
                        <button type='button' onClick={async() => await cancelEkyc({})} className="btn bg-red-600 text-white shadow-lg hover:shadow-none max-w-40">ตกลง</button>
                      </div>
                    </div>
                   
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  )

}

export default AddEdit