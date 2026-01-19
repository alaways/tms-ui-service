import { useState, useEffect, useCallback, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import Tippy from '@tippyjs/react'
import debounce from 'lodash/debounce'
import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setBusinessUnits } from '../../../store/dataStore'
import { setShopGroupBuConfig, setShop } from '../../../store/dataStore'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'
import { BusinessUnits, Shop } from '../../../types/index'
import { url_api } from '../../../services/endpoints'
import { toastAlert } from '../../../helpers/constant'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { formatIDNumber, formatPhoneNumber } from '../../../helpers/formatNumeric'
import { useDistrictMutation, useSubDistrictMutation } from '../../../services/mutations/useProvincesMutation'
import { useBusinessUnitFindMutation } from '../../../services/mutations/useBusinessUnitMutation'
import { Form, Formik } from 'formik'
import { Dialog, Transition } from '@headlessui/react'
import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import IconX from '../../../components/Icon/IconX'
import IconEye from '../../../components/Icon/IconEye'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEdit from '../../../components/Icon/IconEdit'
import IconLink from '../../../components/Icon/IconLink'
import IconMail from '../../../components/Icon/IconMail'
import IconLine from '../../../components/Icon/IconLine'
import IconMapPin from '../../../components/Icon/IconMapPin'
import IconSettings from '../../../components/Icon/IconSettings'
import IconPhoneCall from '../../../components/Icon/IconPhoneCall'
import IconCreditCard from '../../../components/Icon/IconCreditCard'
import IconTrashLines from '../../../components/Icon/IconTrashLines'
import IconChecks from '../../../components/Icon/IconChecks'
import 'tippy.js/dist/tippy.css'
import { DataTable } from 'mantine-datatable'

const mode = process.env.MODE || 'admin'
const Preview = () => {

  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = Swal.mixin(toastAlert)
  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  const dataBusinessUnits = useSelector((state: IRootState) => state.dataStore.businessUnits)
  const breadcrumbItems = [
    { to: '/apps/business-unit/list', label: 'หน่วยธุรกิจ' },
    { label: 'ข้อมูลหน่วยธุรกิจ', isCurrent: true },
  ]

  if (role !== 'admin' && role !== 'business_unit') {
    navigate('/')
  }
  useEffect(() => {
    dispatch(setPageTitle('ข้อมูลหน่วยธุรกิจ'))
    dispatch(setSidebarActive(['bu', '/apps/business-unit/list']))
  }, [])

  const [shopGroupList, setShopGroupList] = useState<any>([])
  const [shopGroupRecords, setShopGroupRecords] = useState<Shop[]>([])
  const [listData, setListData] = useState<any[]>([])
  const [listDataFiltered, setListDataFiltered] = useState<any[]>([])
  const [shopList, setshopList] = useState<any>([])
  const [originalShopGroupRecords, setOriginalShopGroupRecords] = useState<Shop[]>([])
  const [search, setSearch] = useState('')
  const [searchBU, setSearchBU] = useState('')
  const [statusAction, setStatusAction] = useState<any>([])
  const [businessUnitFormData, setBusinessUnitFormData] = useState<BusinessUnits>({
    name: '',
    tax_id: '',
    phone: '',
    full_address: '',
    id_province: '',
    id_district: '',
    id_subdistrict: '',
    email: '',
    website: '',
    zip_code: '',
    logo_image_url: ''
  })
  const SubmittedFormSG = Yup.object().shape({
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  })
  

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim() !== "") {
        searchListData();
      } else {
        if (listData) {
          setListDataFiltered(listData);
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search, listData]); 

  const searchListData = () => {
    if (search.trim() !== "") {
      const lowerSearch = search.toLowerCase();

      const filteredData = listData?.filter(item => {
        const taxId = item.tax_id ?? "";
        const name = item.name ?? "";
        const groupName = item.shop_group_name ?? "";

        return (
          taxId.toString().toLowerCase().includes(lowerSearch) ||
          name.toLowerCase().includes(lowerSearch) ||
          groupName.toLowerCase().includes(lowerSearch)
        );
      });

      setListDataFiltered(filteredData);
    } else {
      setListDataFiltered(listData);
    }
  };

  
  
  const { mutate: fetchBusinessUnitsData, isLoading: isLoadingBusinessUnitsData } = useBusinessUnitFindMutation({
    async onSuccess(res: any) {
      const setFormValue = res.data
      setBusinessUnitFormData(setFormValue)
      dispatch(setBusinessUnits(setFormValue))

    },
    onError(error: any) { },
  })

  const { mutate: shopGroupRelationUpdate } = useGlobalMutation(url_api.buRelationUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        setSearch('')
        showNotification('แก้ไขข้อมูลสำเร็จ', 'success')
        setActionModal2(false)
        buGetShopV2({ data: { id_business_unit: dataBusinessUnits.id } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })


  const { mutate: buGetShopGroup,isLoading: isShopGroupBuLoading } = useGlobalMutation(url_api.buGetShopGroup, {
    onSuccess: (res: any) => {
      const uniqueRecords = res.data.filter((item: any, index: number, self: any[]) => index === self.findIndex((t) => t.id === item.id)).map((item: any) => item)
      
      setShopGroupRecords(uniqueRecords)
      setShopGroupList(
        uniqueRecords.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
      )
      setOriginalShopGroupRecords(uniqueRecords)
    },
    onError: () => {
      showErrorMessage('ไม่พบข้อมูล กลุ่มร้านในหน่วยธุรกิจ')
      setShopGroupRecords([])
      setOriginalShopGroupRecords([])
    },
  })

   const { mutate: buGetShopV2 } = useGlobalMutation(url_api.buGetShopV2, {
    onSuccess: (res: any) => {
      const uniqueRecords = res.data
      setListData(uniqueRecords)
      setListDataFiltered(uniqueRecords)
    },
    onError: () => {
      showErrorMessage('ไม่พบข้อมูล ร้านค้าในกลุ่มร้าน')
      setListData([])
      setListDataFiltered([])
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
  const { mutate: buCheckList } = useGlobalMutation(url_api.buCheckList, {
    onSuccess: (res: any) => {
      setStatusAction(res.data)
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  useEffect(() => {
    buCheckList({data: {id_business_unit: Number(id) || +(dataBusinessUnits?.id ?? 0)}})
    fetchBusinessUnitsData({ data: { id: id || dataBusinessUnits.id}})
    buGetShopGroup({data: {id_business_unit: dataBusinessUnits.id}})
    buGetShopV2({data: { id_business_unit: dataBusinessUnits.id}})
  }, [dataBusinessUnits.id, buGetShopGroup, buGetShopV2])


  useEffect(() => {
    const handleSearchBU = debounce((query: string) => {
      if (query.trim() === '') {
        setShopGroupRecords(originalShopGroupRecords)
      } else {
        setShopGroupRecords(originalShopGroupRecords.filter((item) => item.name && item.name.toLowerCase().includes(query.toLowerCase())))
      }
    }, 200)
    handleSearchBU(searchBU)
    return () => {
      handleSearchBU.cancel()
    }
  }, [searchBU, originalShopGroupRecords])

  const goSetting = (item: any) => {
    dispatch(setShopGroupBuConfig(item))
    navigate('/apps/business-unit/setting/' + item.id + '?business_id=' + id)
  }


  const defaultsForm = {
    id: '',
    name: '',
    id_business_unit: null,
    is_active: true,
  }

  const defaultsFormShop = {
    id: '',
    name: '',
    id_shop_group: 0,
    is_active: true,
  }

  const [formSGData, setFormSGData] = useState<any>(defaultsForm)
  const [formShopData, setFormShopData] = useState<any>(defaultsFormShop)

  const [actionModal, setActionModal] = useState(false)
  const [actionModal2, setActionModal2] = useState(false)

  const addEditShopGroup = (item: any = null) => {
    setFormSGData(item ? { ...item, id_business_unit: item.business_unit.id } : defaultsForm)
    setActionModal(true)
  }

  const editShop = (item: any = null) => {
    setFormShopData({ ...item, id_shop_group: item.id_shop_group })
    setActionModal2(true)
  }

  const { mutate: shopGroupCreate } = useGlobalMutation(url_api.shopGroupCreate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification('เพิ่มข้อมูลสำเร็จ', 'success')
        setActionModal(false)
        buGetShopGroup({ data: { id_business_unit: dataBusinessUnits.id } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const { mutate: shopGroupUpdate } = useGlobalMutation(url_api.shopGroupUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        showNotification('แก้ไขข้อมูลสำเร็จ', 'success')
        setActionModal(false)
        buGetShopGroup({ data: { id_business_unit: dataBusinessUnits.id } })
      } else {
        showNotification(res.message, 'error')
      }
    },
    onError: (err: any) => {
      showNotification(err.message, 'error')
    },
  })

  const { mutate: shopRelationUpdate,isLoading } = useGlobalMutation(url_api.shopRelation, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        })
        // buGetShopV2({
        //   data: {
        //     id_business_unit: dataBusinessUnits.id,
        //   }
        // })
        // setPartnerFormData((old: any) => ({
        //   ...old,
        //   id_shop_group: '',
        //   id_shop: '',
        // }))

        //setListData(uniqueRecords)
        setTimeout(() => {
            location.reload()
        }, 1000);
      } else {
        toast.fire({
          icon: 'warning',
          title: res.message,
          padding: '10px 20px',
        })
      }
    },
  })

  const { mutate: fetchShopData,isLoading:isShopLoading } = useGlobalMutation(url_api.shopReadyToAddBu, {
    onSuccess: (res: any) => {
      setshopList(
        res.data.map((relation: any) => ({
          value: relation.id,
          label: relation.name,
        }))
      )
    },
  })

  const handleChangeSelect = (props: any, event: any, name: any) => {
    props.setFieldValue(name, event.value)
    if (name === 'id_shop_group' && id !== undefined) {
      fetchShopData({
        data: {
          id_shop_group: event.value,
          id_business_unit: id !== undefined ? parseInt(id) : '',
        }
      })
    }
  }

  const [partnerFormData, setPartnerFormData] = useState<any>({
    id_business_unit: id !== undefined ? parseInt(id) : '',
    id_shop_group: '',
    id_shop: '',
  })

  const submitFormSG = useCallback(
    (values: Shop) => {
      if (values.id) {
        shopGroupUpdate({
          id: values.id,
          data: {
            id_business_unit: dataBusinessUnits.id,
            name: values.name,
            is_active: values.is_active
          }
        })
      } else {
        const data = { ...values, active: values.is_active, id_business_unit: dataBusinessUnits.id }
        shopGroupCreate({ data })
      }
    },
    [shopGroupCreate, shopGroupUpdate, dataBusinessUnits.id]
  )

  const submitFormShop = useCallback(
    (values: any) => {
      shopGroupRelationUpdate({
        data: {
          id_business_unit: dataBusinessUnits.id,
          id_shop: values.id,
          id_shop_group:values.id_shop_group,
          is_active: values.is_active,
          is_main:values.is_main
        }
      })
    },
    [dataBusinessUnits.id]
  )



  const submitPartnerForm = useCallback((values: any) => {
    shopRelationUpdate({ data: values })
  }, [])

  const SubmitPartnerForm = Yup.object().shape({
    id_shop_group: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_shop: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const goEditPreview = () => {
    dispatch(setBusinessUnits(dataBusinessUnits))
    navigate('/apps/business-unit/edit/' + id)
  }

  const goShopInterestRate = () => {
    dispatch(setShopGroupBuConfig(dataBusinessUnits))
    navigate('/apps/shop-group/shop-bu-interestrate/' + id)
  }

  type StatusKeys = 'shop_group' | 'partner' | 'business_unit'

  const wizardContent = (statusAction: Record<StatusKeys, boolean>) => {

    const steps: { label: string, key: StatusKeys }[] = [
      { label: 'กลุ่มร้าน', key: 'shop_group' },
      { label: 'ร้านค้าพาร์ทเนอร์', key: 'partner' },
      { label: 'การตั้งค่าหน่วยธุรกิจ', key: 'business_unit' }
    ]

    const completedSteps = steps.filter(step => statusAction[step.key]).length
    const progressWidth = `${(completedSteps / steps.length) * 100}%`

    const allCompleted = completedSteps === steps.length

    return (
      <div className="flex flex-col items-center">
        <div className="relative z-[1] flex-1 mt-4 w-[60vw]">
          <div className={`w-[100%] h-1 absolute ltr:left-0 rtl:right-0 top-[30px] m-auto -z-[1] transition-[width] ${allCompleted ? 'bg-[#19d20c]' : 'bg-[#f3f2ee]'}`}></div>
          <ul className="mb-5 grid grid-cols-3">
            {steps.map((step, index) => (
              <li className="mx-auto flex flex-col items-center" key={index}>
                <div className={`${statusAction[step.key] ? '!border-[#19d20c] !bg-[#19d20c] text-white' : ''} border-[3px] border-[#f3f2ee] bg-white dark:bg-[#253b5c] dark:border-[#1b2e4b] flex justify-center items-center w-16 h-16 rounded-full`}>
                  <IconChecks />
                </div>
                <span className="text-center block mt-2">{step.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-1">
      <div className="flex items-center justify-between flex-wrap">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex">
          <a className="cursor-pointer btn btn-sm btn-primary mr-1" onClick={() => goEditPreview()}>
            <IconEdit className="w-4.5 h-4.5" /> &nbsp;
            แก้ไข
          </a>
          <a className="cursor-pointer btn btn-sm btn-primary" onClick={() => goShopInterestRate()}>
            <IconSettings /> &nbsp;
            ตั้งค่า
          </a>
        </div>
      </div>
      {wizardContent(statusAction)}
      <div className="grid lg:grid-cols-1 gap-6 mb-6 pt-5">
        <div className="p-0 lg:col-span-2">
          <div className="flex flex-col gap-2.5">
            <div className="panel px-12 flex-1 py-12 rtl:xl:ml-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="col-span-1">
                  {businessUnitFormData?.logo_image_url &&  <img src={businessUnitFormData?.logo_image_url ?? ''} alt="img" style={{ width: '100%', maxWidth: '250px' }} />}
                </div>
                <div className="col-span-2">
                  <div className="grid grid-cols-1 gap-3 mt-5">
                    <div className="text-2xl font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                      {businessUnitFormData?.name ?? '-'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 px-2 py-3">
                    <div className="col-span-1 flex items-center">
                      <IconCreditCard className="mr-2" />
                      {formatIDNumber(businessUnitFormData?.tax_id) ?? '-'}
                    </div>
                    <div className="col-span-1 flex items-center">
                      <IconPhoneCall className="mr-2" />
                      {formatPhoneNumber(businessUnitFormData?.phone) ?? '-'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2 py-3">
                    <div className="col-span-1 flex items-center">
                      <IconMail className="mr-2" />
                      {businessUnitFormData?.email ?? '-'}
                    </div>
                    <div className="col-span-1 flex items-center">
                      <IconLink className="mr-2" />
                      {businessUnitFormData?.website ?? '-'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 px-2 py-3">
                    <div className="col-span-2 flex items-center">
                      <IconMapPin className="mr-2" />
                      {businessUnitFormData?.full_address ?? '-'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 px-2 py-3">
                    <div className="col-span-2 flex items-center">
                      <IconLine className="mr-2" />
                      {businessUnitFormData?.line_id ?? '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br />
          <div className="flex xl:flex-row flex-col gap-2.5">
            <div className="panel px-6 flex-1 py-6 rtl:xl:ml-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                  กลุ่มร้าน
                </div>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                  <div className="flex gap-3">
                    <div>
                      <button type="button" className="btn btn-primary" onClick={() => addEditShopGroup()}>
                        <IconPlus className="ltr:mr-2 rtl:ml-2" />
                        เพิ่มกลุ่มร้าน
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <br />
              <div className="table-responsive">
                <table className="table-striped table-hover">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '100px' }}>
                        ลำดับ
                      </th>
                      <th>ชื่อกลุ่มร้าน</th>
                      <th>ตั้งค่า</th>
                      <th className="!text-center" style={{ width: '200px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopGroupRecords.map((item: any, index) => (
                      <tr key={item.id}>
                        <td className="text-center">
                          <div className="flex inline-flex items-center w-max">
                            <div>{index + 1}</div>
                          </div>
                        </td>
                        <td>{item.name}</td>
                        <td><span className={`badge ${item.is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                          {item.is_active ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
                        </span></td>
                        <td>
                          <div className="flex gap-4 items-center w-max mx-auto">
                            <Tippy content="ดูข้อมูล" theme="Primary">
                              <a className="flex hover:text-info cursor-pointer" onClick={() => goSetting(item)}>
                                <IconEye className="w-4.5 h-4.5" />
                              </a>
                            </Tippy>
                            <Tippy content="แก้ไข" theme="Primary">
                              <a className="flex hover:text-info cursor-pointer" onClick={() => addEditShopGroup(item)}>
                                <IconEdit className="w-4.5 h-4.5" />
                              </a>
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
          <br />
          <div className="flex xl:flex-row flex-col gap-2.5">
            <div className="panel px-6 flex-1 py-6 rtl:xl:ml-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
                  ร้านค้าพาร์ทเนอร์
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="text"
                    placeholder="ค้นหา..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded p-2"
                  />
                </div>
              </div>
              <Formik initialValues={partnerFormData} onSubmit={submitPartnerForm} enableReinitialize autoComplete="off" validationSchema={SubmitPartnerForm}>
                {(props) => (
                  <Form className="space-y-5 dark:text-white ">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="w-4/6" style={{ width: 'calc(100% - 210px)' }}>
                        <div className="input-flex-row">
                          <SelectField
                            label="กลุ่มร้าน"
                            id="id_shop_group"
                            name="id_shop_group"
                            placeholder="กรุณาเลือก"
                            options={shopGroupList}
                            isSearchable={true}
                            onChange={(e: any) => {
                              handleChangeSelect(props, e, 'id_shop_group')
                            }}
                          />
                          <SelectField
                            label="ร้านค้า"
                            id="id_shop"
                            name="id_shop"
                            placeholder="กรุณาเลือก"
                            options={shopList}
                            isSearchable={true}
                            disabled={props.values.id_shop_group ? false : true}
                            onChange={(e: any) => {
                              handleChangeSelect(props, e, 'id_shop')
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end w-2/6" style={{ width: '200px' }}>
                        <div className="pt-10">
                          <button type="submit" className="btn btn-primary">
                            <IconPlus /> &nbsp;
                            เพิ่มร้านค้าพาร์ทเนอร์
                          </button>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
              <br />
              <div className='overflow-x-scroll'> 
                <div className="table-responsive ">
                  <table className="table-striped table-hover">
                    <thead>
                      <tr>
                        <th className="text-center" style={{ width: '100px' }}>ลำดับ</th>
                        <th style={{ minWidth: '180px' }}>เลขผู้เสียภาษี</th>
                        <th style={{ minWidth: '150px' }}>ชื่อร้าน</th>
                        <th style={{ minWidth: '90px' }}>กลุ่มร้าน</th>
                        <th style={{ minWidth: '130px' }}>สถานะ</th>
                        <th style={{ minWidth: '130px' }}>กลุ่มหลัก</th>
                        <th className="!text-center" style={{ width: '200px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listDataFiltered.map((item: any, index) => (
                       <tr key={`${item.id}-${index}`}>
                          <td className="text-center">
                            <div className="flex inline-flex items-center w-max">
                              <div>{index + 1}</div>
                            </div>
                          </td>
                          <td>{formatIDNumber(item?.tax_id) ?? '-'}</td>
                          <td>{item.name}</td>
                          <td>{item?.shop_group_name}</td>
                          <td><span className={`badge ${item.is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                            {item.is_active ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
                          </span></td>
                          <td className="text-center text-green">
                            {item?.is_main == true ? <IconChecks /> : ''}
                          </td>
                          <td>
                            <div className="flex gap-4 items-center w-max mx-auto">
                              <Tippy content="แก้ไข" theme="Primary">
                                <a className="flex hover:text-info cursor-pointer" onClick={() => editShop(item)}>
                                  <IconEdit className="w-4.5 h-4.5" />
                                </a>
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
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {formSGData.id ? 'แก้ไข' : 'เพิ่ม'}
                  </div>
                  <div className="p-5">
                    <Formik initialValues={formSGData} onSubmit={submitFormSG} enableReinitialize autoComplete="off" validationSchema={SubmittedFormSG}>
                      {(props) => (
                        <Form className="space-y-5 mb-7 dark:text-white custom-select">
                          <InputField
                            label="ชื่อกลุ่มร้าน"
                            name="name"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
                          <SelectField
                            label="สถานะ *"
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
                            <button type="button" className="btn btn-outline-danger" onClick={() => setActionModal(false)}>
                              ยกเลิก
                            </button>
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                              {formSGData.id ? 'บันทึก' : 'เพิ่ม'}
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
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal2(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    แก้ไข
                  </div>
                  <div className="p-5">
                    <Formik initialValues={formShopData} onSubmit={submitFormShop} enableReinitialize autoComplete="off">
                      {(props) => (
                        <Form className="space-y-5 mb-7 dark:text-white custom-select">
                          <InputField
                            label="ชื่อร้านค้า"
                            name="name"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                            disabled
                          />
                         {/* todo */}
                          <SelectField
                            label="กลุ่มร้าน"
                            id="id_shop_group"
                            name="id_shop_group"
                            placeholder="กรุณาเลือก"
                            options={shopGroupList}
                            isSearchable={true}
                            disabled
                          />
                          <SelectField
                            label="กลุ่มหลัก"
                            id="is_main"
                            name="is_main"
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

                          <SelectField
                            label="สถานะ *"
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
                              บันทึก
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

export default Preview
