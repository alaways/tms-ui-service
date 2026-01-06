import { useState, useEffect, useCallback, Fragment, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import * as Yup from 'yup'

import Swal from 'sweetalert2'
import Tippy from '@tippyjs/react'

import debounce from 'lodash/debounce'

import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setPageTitle } from '../../../store/themeConfigSlice'

import { DataTable } from 'mantine-datatable'

import { Formik, Form } from 'formik'
import { Dialog, Transition } from '@headlessui/react'

import Select from 'react-select'

import InputField from '../../../components/HOC/InputField'
import SelectField from '../../../components/HOC/SelectField'

import { url_api } from '../../../services/endpoints'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { AssetsNames, AssetsColors, AssetsModels, AssetsCapacitys } from '../../../types/index'

import { PAGE_SIZES } from '../../../helpers/config'
import { showNotification } from '../../../helpers/showNotification'

import IconX from '../../../components/Icon/IconX'
import IconMenu from '../../../components/Icon/IconMenu'
import IconEdit from '../../../components/Icon/IconEdit'
import IconPlus from '../../../components/Icon/IconPlus'
import IconSearch from '../../../components/Icon/IconSearch'
import IconSettings from '../../../components/Icon/IconSettings'
import IconTrashLines from '../../../components/Icon/IconTrashLines'

import Breadcrumbs from '../../../helpers/breadcrumbs'

import 'tippy.js/dist/tippy.css'

const mode = process.env.MODE || 'admin'

type AssetRecord = AssetsNames | AssetsColors | AssetsModels | AssetsCapacitys

const ColorModelCapacity = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { id, type_name } = useParams()
  const type_id = id ? Number(id) : undefined

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  if (role !== 'admin') {
    navigate('/')
  }

  const defaultsForm = {
    id: '',
    name: '',
    id_asset_type: id,
    id_asset_name: '',
    is_active: true,
  }
  

  const settingType = [
    { id: 1, title: 'สินทรัพย์' },
    { id: 2, title: 'ประเภท สี' },
    { id: 3, title: 'ประเภท รุ่น' },
  ]

  const [currentSettingType, setCurrentSettingType] = useState(settingType[0])
  const [isShowSettingMenu, setIsShowSettingMenu] = useState(false)

  const [assetsNamesLists, setAssetsNamesLists] = useState<AssetsNames[]>([])
  const [formDataNames, setFormDataNames] = useState<any>(defaultsForm)

  const [assetsColorsLists, setAssetsColorsLists] = useState<AssetsColors[]>([])
  const [formDataColors, setFormDataColors] = useState<any>(defaultsForm)

  const [assetsModelsLists, setAssetsModelsLists] = useState<AssetsModels[]>([])
  const [formDataModels, setFormDataModels] = useState<any>(defaultsForm)

  const [assetsCapacitysLists, setAssetCapacitysLists] = useState<AssetsCapacitys[]>([])
  const [formDataCapacitys, setFormDataCapacitys] = useState<any>(defaultsForm)

  const [actionModal, setActionModal] = useState<any>(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[4])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [search, setSearch] = useState('')
  const [selectAssetsNames, setSelectAssetsNames] = useState<any>([])
  const [assetsNames, setAssetsNames] = useState<any>([])
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null) // New state for selected asset ID

  const { mutate: fetchNameData } = useGlobalMutation(url_api.nameFindAll, {
    onSuccess: (res: any) => {
      dispatch(setPageTitle(`ตั้งค่าประเภทสินทรัพย์` + type_name))
      setAssetsNamesLists(res.data.list)
      setTotalItems(res.data.total)
      setSelectAssetsNames([
        { value: null, label: 'ทั้งหมด' },
        ...res.data.list.map((item: any) => ({
          value: item.id,
          label: item.name,
        })),
      ])
      setAssetsNames([
        ...res.data.list.map((item: any) => ({
          value: item.id,
          label: item.name,
        })),
      ])
    },
    onError: () => {
      console.error('Failed to fetch asset name data')
    },
  })

  const { mutate: fetchColorData } = useGlobalMutation(url_api.colorFindAll, {
    onSuccess: (res: any) => {
      setAssetsColorsLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch asset color data')
    },
  })

  const { mutate: fetchModelData } = useGlobalMutation(url_api.modelFindAll, {
    onSuccess: (res: any) => {
      setAssetsModelsLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch asset model data')
    },
  })

  const { mutate: fetchCapacityData } = useGlobalMutation(url_api.capacityFindAll, {
    onSuccess: (res: any) => {
      setAssetCapacitysLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch asset capacity data')
    },
  })

  const fetchData = useCallback(() => {
    if (currentSettingType.id === 1) {
      fetchNameData({
        data: {
          page,
          page_size: pageSize,
          query: search,
          id_asset_type: type_id,
        },
      })
    } else if (currentSettingType.id === 2) {
      const requestData: any = {
        page,
        page_size: pageSize,
        query: search,
        id_asset_type: type_id,
      }
      if (selectedAssetId !== null) {
        requestData.id_asset_name = selectedAssetId
      } else {
        null
      }
      fetchColorData({
        data: requestData,
      })
    } else if (currentSettingType.id === 3) {
      const requestData: any = {
        page,
        page_size: pageSize,
        query: search,
        id_asset_type: type_id,
      }
      if (selectedAssetId !== null) {
        requestData.id_asset_name = selectedAssetId
      } else {
        null
      }
      fetchModelData({
        data: requestData,
      })
    } else if (currentSettingType.id === 4) {
      fetchCapacityData({
        data: {
          page,
          page_size: pageSize,
          query: search,
          id_asset_type: type_id,
        },
      })
    }
  }, [currentSettingType, page, pageSize, search, selectedAssetId, fetchNameData, fetchColorData, fetchModelData, fetchCapacityData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const { mutate: assetCreate } = useGlobalMutation(
    currentSettingType.id === 1 ? url_api.nameCreate : currentSettingType.id === 2 ? url_api.colorCreate : currentSettingType.id === 3 ? url_api.modelCreate : url_api.capacityCreate,
    {
      onSuccess: (res: any) => {
        if (res.statusCode === 200 || res.code === 200) {
          showNotification('เพิ่มข้อมูลสำเร็จ', 'success')
          setActionModal(false)
          fetchData()
        } else {
          showNotification(res.message, 'error')
        }
      },
      onError: (err: any) => {
        showNotification(err.message, 'error')
      },
    }
  )

  const { mutate: assetUpdate } = useGlobalMutation(
    currentSettingType.id === 1 ? url_api.nameUpdate : currentSettingType.id === 2 ? url_api.colorUpdate : currentSettingType.id === 3 ? url_api.modelUpdate : url_api.capacityUpdate,
    {
      onSuccess: (res: any) => {
        if (res.statusCode === 200 || res.code === 200) {
          showNotification('แก้ไขข้อมูลสำเร็จ', 'success')
          setActionModal(false)
          fetchData()
        } else {
          showNotification(res.message, 'error')
        }
      },
      onError: (err: any) => {
        showNotification(err.message, 'error')
      },
    }
  )

  const { mutate: assetDelete } = useGlobalMutation(
    currentSettingType.id === 1 ? url_api.nameDelete : currentSettingType.id === 2 ? url_api.colorDelete : currentSettingType.id === 3 ? url_api.modelDelete : url_api.capacityDelete,
    {
      onSuccess: (res: any) => {
        if (res.statusCode === 200 || res.code === 200) {
          showNotification('ลบข้อมูลสำเร็จ', 'success')
          fetchData()
        } else {
          showNotification(res.message, 'error')
        }
      },
      onError: (err: any) => {
        showNotification(err.message, 'error')
      },
    }
  )

  const addEditData = (item: any = null) => {
    if (item) {
      const json1 = JSON.parse(JSON.stringify(item))
      if (currentSettingType.id === 1) {
        setFormDataNames(json1)
      } else if (currentSettingType.id === 2) {
        setFormDataColors(json1)
      } else if (currentSettingType.id === 3) {
        setFormDataModels(json1)
      }
    } else {
      if (currentSettingType.id === 1) {
        setFormDataNames(defaultsForm)
      } else if (currentSettingType.id === 2) {
        setFormDataColors(defaultsForm)
      } else if (currentSettingType.id === 3) {
        setFormDataModels(defaultsForm)
      }
    }
    setActionModal(true)
  }

  const SubmittedForm = Yup.object().shape({
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    is_active: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const SubmittedFormAssetName = Yup.object().shape({
    name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    id_asset_name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
    is_active: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  })

  const submitForm = useCallback(
    (values: any) => {
      const data = { ...values, active: values.is_active }
      if (values.id) {
        assetUpdate({ data, id: values.id })
      } else {
        assetCreate({ data: { ...data, id_asset_type: type_id } })
      }
    },
    [assetCreate, assetUpdate, id]
  )

  const confirmDelete = (data: any) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        assetDelete({ data, id: data.id })
      }
    })
  }

  const debouncedFetchAssetData = useMemo(
    () =>
      debounce(() => {
        fetchData()
      }, 500),
    [fetchData]
  )

  useEffect(() => {
    debouncedFetchAssetData()
    return () => {
      debouncedFetchAssetData.cancel()
    }
  }, [search, debouncedFetchAssetData])

  return (
    <>
      <div className="my-2">
        <Breadcrumbs
          items={[
            { to: '/apps/asset-type/list', label: 'ประเภทสินทรัพย์' },
            { label: 'ตั้งค่า', isCurrent: true },
          ]}
        />
      </div>
      <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
        <div className="flex items-center justify-between flex-wrap gap-4 px-5 ">
          <p className="text-lg">
            ตั้งค่าประเภทสินทรัพย์: {type_name}
          </p>
        </div>
      </div>
      <div className="flex flex-col xl:flex-row gap-5 relative mt-5">
        <div className={`${isShowSettingMenu ? '!block h-full xl:h-auto' : ''} panel absolute xl:relative p-0 flex-none w-80 border-0 overflow-y-auto z-10 xl:block divide-y divide-[#ebedf2] dark:divide-[#191e3a] hidden`}>
          {settingType.map((item) => (
            <div key={item.id}>
              <button
                type="button"
                className={`${item.id === currentSettingType.id ? 'bg-gray-100 dark:bg-[#192A3A]' : ''} w-full flex items-center p-4 hover:bg-gray-100 dark:hover:bg-[#192A3A]`}
                onClick={() => {
                  setCurrentSettingType(item)
                  setIsShowSettingMenu(!isShowSettingMenu)
                }}
              >
                <div className="ltr:pr-4 rtl:pl-4">
                  <div className={'flex items-center mt-2 font-semibold'}>
                    <div className="flex items-center font-normal mr-3">
                      <IconSettings />
                      <div className="font-medium text-sm"></div>
                    </div>
                    <div className="min-w-20 text-base ltr:mr-3 rtl:ml-3 ">
                      {item.title}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
        <div className={`bg-black/60 z-[5] w-full h-full absolute rounded-md hidden ${isShowSettingMenu ? '!block xl:!hidden' : ''}`} onClick={() => setIsShowSettingMenu(!isShowSettingMenu)}></div>
        <div className="panel p-0 flex-1">
          <div className="flex items-center justify-between flex-wrap gap-4 p-4  border-b border-[#ebedf2] dark:border-[#191e3a]">
            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
              <button type="button" className="xl:hidden hover:text-primary block ltr:mr-5 rtl:ml-5" onClick={() => setIsShowSettingMenu(!isShowSettingMenu)}>
                <IconMenu />
              </button>
              <p className="text-lg">{currentSettingType.title}</p>
            </div>
            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
            </div>
          </div>
          <div className="flex justify-between py-2 px-4 pt-5">
            <div className="flex flex-row items-center gap-3">
              <button type="button" className="btn btn-primary" onClick={() => addEditData()}>
                <IconPlus className="ltr:mr-2 rtl:ml-2" />
                เพิ่ม
              </button>
            </div>
           <div className="flex flex-row gap-3">
            {currentSettingType.id === 2 || currentSettingType.id === 3 ? (
              <Select
                placeholder="สินทรัพย์"
                className="pr-6 z-10 w-[200px]"
                options={selectAssetsNames}
                isSearchable={true}
                onChange={(e: any) => {
                  setSelectedAssetId(e.value)
                  fetchData()
                }}
              />
            ) : null}
            <div className="relative">
              <input type="text" placeholder="ค้นหา" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                <IconSearch className="mx-auto" />
              </button>
            </div>
           </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="datatables pagination-padding">
              <DataTable
                className="whitespace-nowrap table-hover invoice-table"
                records={currentSettingType.id === 1 ? (assetsNamesLists as AssetRecord[]) : currentSettingType.id === 2 ? (assetsColorsLists as AssetRecord[]) : currentSettingType.id === 3 ? (assetsModelsLists as AssetRecord[]) : (assetsCapacitysLists as AssetRecord[])}
                columns={[
                  {
                    accessor: 'id',
                    title: 'ลำดับ',
                    sortable: false,
                    render: (row: AssetRecord, index: number) => (
                      <div>{index + 1}</div>
                    ),
                  },
                  ...(currentSettingType.id === 2 || currentSettingType.id === 3
                    ? [
                      {
                        accessor: 'asset_name',
                        title: 'ชื่อสินทรัพย์',
                        sortable: false,
                        render: ({ asset_name }: { asset_name: { name: string } }) => (
                          <div className="flex items-center font-normal">
                            <div>{asset_name ? asset_name.name : '-'}</div>
                          </div>
                        ),
                      },
                    ]
                    : []),
                  {
                    accessor: 'name',
                    title: currentSettingType.id === 1 ? 'ชื่อสินทรัพย์' : (currentSettingType.id === 2 ? 'สี' : (currentSettingType.id === 3 ? 'รุ่น' : 'ความจุ')),
                    sortable: false,
                    render: ({ name }: { name: string }) => (
                      <div className="flex items-center font-normal">
                        <div>{name}</div>
                      </div>
                    ),
                  },
                  {
                    accessor: 'is_active',
                    title: 'เปิดปิดการใช้งาน',
                    sortable: false,
                    render: ({ is_active }: { is_active: boolean }) => (
                      <span className={`badge ${is_active ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                        {is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    ),
                  },
                  {
                    accessor: 'action',
                    title: 'Actions',
                    sortable: false,
                    textAlignment: 'center',
                    render: (item: any) => (
                      <div className="flex gap-4 items-center w-max mx-auto">
                        <Tippy content="แก้ไข" theme="Primary">
                          <a className="flex hover:text-info cursor-pointer" onClick={() => addEditData(item) }>
                            <IconEdit className="w-4.5 h-4.5" />
                          </a>
                        </Tippy>
                        <Tippy content="ลบ" theme="Primary">
                          <a className="flex hover:text-danger" onClick={(e) => confirmDelete(item)}>
                            <IconTrashLines />
                          </a>
                        </Tippy>
                      </div>
                    ),
                  },
                ]}
                highlightOnHover
                totalRecords={totalItems}
                recordsPerPage={pageSize}
                page={page}
                onPageChange={(p) => setPage(p)}
                recordsPerPageOptions={PAGE_SIZES}
                onRecordsPerPageChange={(p) => {
                  setPage(1)
                  setPageSize(p)
                }}
                paginationText={({ from, to, totalRecords }) => `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`}
              />
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
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" >
                <Dialog.Panel className="panel border-0 p-0 pb-3 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {formDataNames.id || formDataColors.id || formDataModels.id || formDataCapacitys.id ? 'แก้ไข' : 'เพิ่ม'}
                  </div>
                  <div className="p-5">
                    <Formik
                      enableReinitialize
                      autoComplete="off"
                      onSubmit={submitForm}
                      initialValues={currentSettingType.id === 1 ? formDataNames : (currentSettingType.id === 2 ? formDataColors : (currentSettingType.id === 3 ? formDataModels : formDataCapacitys))}
                      validationSchema={currentSettingType.id === 2 || currentSettingType.id === 3 ? SubmittedFormAssetName : SubmittedForm}
                    >
                      {(props) => (
                        <Form className="space-y-5  mb-7 dark:text-white custom-select">
                          {currentSettingType.id === 2 || currentSettingType.id === 3 ? (
                            <SelectField
                              require={true}
                              id="id_asset_name"
                              label="สินทรัพย์"
                              name="id_asset_name"
                              options={assetsNames}
                              onChange={(e: any) => {
                                props.setFieldValue('id_asset_name', e.value)
                              }}
                            />
                          ) : null}
                          <InputField
                            require={true}
                            label="ชื่อ"
                            name="name"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                          />
                          <SelectField
                            require={true}
                            label="สถานะ"
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
                              {formDataNames.id || formDataColors.id || formDataModels.id || formDataCapacitys.id ? 'บันทึก' : 'เพิ่ม'}
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
    </>
  )

}

export default ColorModelCapacity