import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import debounce from 'lodash/debounce'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { url_api } from '../../../services/endpoints'
import { InterestRate, Shop } from '../../../types/index'
import { Form, Formik } from 'formik'
import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'
import { useGlobalMutation } from '../../../helpers/globalApi'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import { useTranslation } from 'react-i18next'

const mode = process.env.MODE || 'admin'

const SettingBU = () => {
  const { t } = useTranslation()

  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // const toast = Swal.mixin(toastAlert)
  const id_business_unit = searchParams.get('business_id') || ''

  const dataBusinessUnits = useSelector((state: IRootState) => state.dataStore.businessUnits)
  const shopGroupBuConfig = useSelector((state: IRootState) => state.dataStore.shopGroupBuConfig)

  const pageAction = useSelector((state: IRootState) => state.pageStore.pageAction) === 'edit'

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  if (role != 'admin' && role != 'business_unit') {
    navigate('/')
  }

  const breadcrumbItems = [
    { to: '/apps/business-unit/list', label: t('business_unit') },
    { to: '/apps/business-unit/preview/' + id_business_unit, label: t('business_unit_info') },
    { label: t('business_unit_setting'), isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle(t('partner_shop')))
    dispatch(setSidebarActive(['bu', '/apps/business-unit/list']))
  })


  const [shopGroupShopRecords, setShopGroupShopRecords] = useState<Shop[]>([])
  const [originalShopGroupShopRecords, setOriginalShopGroupShopRecords] = useState<Shop[]>([])

  const [selectShops, setSelectShops] = useState<any>([])
  const [shopGroupList, setShopGroupList] = useState<any>([])

  const [search, setSearch] = useState('')

  useEffect(() => {
    setShopGroupList(
      [
        {
          value: shopGroupBuConfig.id,
          label: shopGroupBuConfig.name
        }
      ]
    )
  }, [])

  const [formData, setFormData] = useState<any>({
    id: null,
    name: shopGroupBuConfig.name,
    id_shop_group: shopGroupBuConfig.id,
    inr_1: 0,
    inr_2: 0,
    inr_3: 0,
    inr_4: 0,
    inr_5: 0,
    inr_6: 0,
    inr_7: 0,
    inr_8: 0,
    inr_9: 0,
    inr_10: 0,
    inr_11: 0,
    inr_12: 0,
    inr_13: 0,
    inr_14: 0,
    inr_15: 0,
    inr_16: 0,
    inr_17: 0,
    inr_18: 0,
    inr_19: 0,
    inr_20: 0,
    inr_21: 0,
    inr_22: 0,
    inr_23: 0,
    inr_24: 0,
    is_active: true,
  })

  const { mutate: fetchModelData, isLoading: isLoading } = useGlobalMutation(url_api.businessUnitGetRate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        setFormData(res.data)
      }
    },
    onError: () => {
      console.error('Failed to fetch asset model data')
    },
  })

  const { mutate: fetchShopData } = useGlobalMutation(url_api.shopReadyToAddBu, {
    onSuccess: (res: any) => {
      const shopOptions = res.data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }))
      setSelectShops(shopOptions)
    },
  })

  const { mutate: buGetShop } = useGlobalMutation(url_api.buGetShop, {
    onSuccess: (res: any) => {
      const uniqueRecords = res.data.filter((item: any, index: number, self: any[]) => index === self.findIndex((t) => t.id === item.id)).map((item: any) => item)
      setShopGroupShopRecords(uniqueRecords)
      setOriginalShopGroupShopRecords(uniqueRecords)
    },
    onError: () => {
      showErrorMessage(t('shop_not_found_in_group'))
      setShopGroupShopRecords([])
      setOriginalShopGroupShopRecords([])
    },
  })

  const fetchData = useCallback(() => {
    fetchShopData({
      data: {
        id_business_unit: dataBusinessUnits.id
      }
    })
    fetchModelData({
      data: {
        id_shop_group: shopGroupBuConfig.id
      }
    })
    buGetShop({
      data: {
        id_business_unit: dataBusinessUnits.id
      }
    })
  }, [fetchShopData, fetchModelData, buGetShop])

  useEffect(() => {
    fetchData()
  }, [ fetchData ])

  const { mutate: interestRateCreate } = useGlobalMutation(url_api.interestRateCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification(t('add_success'), 'success')
        fetchModelData({ data: { id_shop_group: shopGroupBuConfig.id } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const handleChangeSelect = (props: any, event: any, name: any) => {
    props.setFieldValue(name, event.value)
  }

  const { mutate: interestRateUpdate } = useGlobalMutation(url_api.interestRateUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification(t('edit_success'), 'success')
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const showErrorMessage = (message: string) => {
    showNotification(message, 'error')
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    const toast = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
    })
    toast.fire({
      icon: type,
      title: message,
      padding: '10px 20px',
    })
  }

  const submitForm = useCallback((values: InterestRate) => {
    const data = { ...values, active: values.is_active }
    if (values.id) {
      interestRateUpdate({ data, id: values.id })
    } else {
      interestRateCreate({ data })
    }
  }, [interestRateCreate, interestRateUpdate])

  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required(t('required_field')),
    id_shop_group: Yup.string().nullable().required(t('required_field')),
    inr_1: Yup.number().required(t('required_field')),
    inr_2: Yup.number().required(t('required_field')),
    inr_3: Yup.number().required(t('required_field')),
    inr_4: Yup.number().required(t('required_field')),
    inr_5: Yup.number().required(t('required_field')),
    inr_6: Yup.number().required(t('required_field')),
    inr_7: Yup.number().required(t('required_field')),
    inr_8: Yup.number().required(t('required_field')),
    inr_9: Yup.number().required(t('required_field')),
    inr_10: Yup.number().required(t('required_field')),
    inr_11: Yup.number().required(t('required_field')),
    inr_12: Yup.number().required(t('required_field')),
    inr_13: Yup.number().required(t('required_field')),
    inr_14: Yup.number().required(t('required_field')),
    inr_15: Yup.number().required(t('required_field')),
    inr_16: Yup.number().required(t('required_field')),
    inr_17: Yup.number().required(t('required_field')),
    inr_18: Yup.number().required(t('required_field')),
    inr_19: Yup.number().required(t('required_field')),
    inr_20: Yup.number().required(t('required_field')),
    inr_21: Yup.number().required(t('required_field')),
    inr_22: Yup.number().required(t('required_field')),
    inr_23: Yup.number().required(t('required_field')),
    inr_24: Yup.number().required(t('required_field')),
  })

  // const goAddPartner = () => {
  //   dispatch(setShop(dataBusinessUnits))
  //   navigate('/apps/business-unit/partner')
  // }

  useEffect(() => {
    const handleSearch = debounce((query: string) => {
      if (query.trim() === '') {
        setShopGroupShopRecords(originalShopGroupShopRecords)
      } else {
        const filteredRecords = originalShopGroupShopRecords.filter((item) =>
          item.name && item.name.toLowerCase().includes(query.toLowerCase())
        )
        setShopGroupShopRecords(filteredRecords)
      }
    }, 200)
    handleSearch(search)
    return () => {
      handleSearch.cancel()
    }
  }, [search, originalShopGroupShopRecords])

  if (isLoading) return <div>{t('loading')}</div>

  return (
    <div className="flex xl:flex-col flex-col gap-2.5">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <Formik initialValues={formData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
          {(props) => (
            <Form className="space-y-5 dark:text-white">
              <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                {t('set_return')}
              </div>
              <div className="input-flex-row">
                {/* <div className="input-container">
                  <InputField label="ชื่อดอกเบี้ย" name="name" type="text" />
                  </div> */}
                {/* TODO: list group */}
                <div className="input-container">
                  <SelectField
                    label={t('shop_group')}
                    id="id_shop_group"
                    name="id_shop_group"
                    options={shopGroupList}
                    placeholder={t('please_select')}
                    onChange={(e: any) => handleChangeSelect(props, e, 'id_shop_group')}
                    isSearchable={true}
                    disabled={true}
                  />
                </div>
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`1 ${t('month')}`} name="inr_1" type="number" />
                    <InputField label={`2 ${t('months')}`} name="inr_2" type="number" />
                  </div>
                </div>
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`3 ${t('months')}`} name="inr_3" type="number" />
                    <InputField label={`4 ${t('months')}`} name="inr_4" type="number" />
                  </div>
                </div>
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`5 ${t('months')}`} name="inr_5" type="number" />
                    <InputField label={`6 ${t('months')}`} name="inr_6" type="number" />
                  </div>
                </div>
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`7 ${t('months')}`} name="inr_7" type="number" />
                    <InputField label={`8 ${t('months')}`} name="inr_8" type="number" />
                  </div>
                </div>
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`9 ${t('months')}`} name="inr_9" type="number" />
                    <InputField label={`10 ${t('months')}`} name="inr_10" type="number" />
                  </div>
                </div>
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`11 ${t('months')}`} name="inr_11" type="number" />
                    <InputField label={`12 ${t('months')}`} name="inr_12" type="number" />
                  </div>
                </div>
              </div>

              <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`13 ${t('months')}`} name="inr_13" type="number" />
                    <InputField label={`14 ${t('months')}`} name="inr_14" type="number" />
                  </div>
                </div>
              </div>
               <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`15 ${t('months')}`} name="inr_15" type="number" />
                    <InputField label={`16 ${t('months')}`} name="inr_16" type="number" />
                  </div>
                </div>
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`17 ${t('months')}`} name="inr_17" type="number" />
                    <InputField label={`18 ${t('months')}`} name="inr_18" type="number" />
                  </div>
                </div>
              </div>
               <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`19 ${t('months')}`} name="inr_19" type="number" />
                    <InputField label={`20 ${t('months')}`} name="inr_20" type="number" />
                  </div>
                </div>
              </div>
              <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`21 ${t('months')}`} name="inr_21" type="number" />
                    <InputField label={`22 ${t('months')}`} name="inr_22" type="number" />
                  </div>
                </div>
              </div>
               <div className="input-flex-row">
                <div className="input-container">
                  <div className="input-flex-row">
                    <InputField label={`23 ${t('months')}`} name="inr_23" type="number" />
                    <InputField label={`24 ${t('months')}`} name="inr_24" type="number" />
                  </div>
                </div>
              </div>
              
              <div className="input-flex-row"></div>
              <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                {isLoading && <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>}
                {t('save')}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )

}

export default SettingBU