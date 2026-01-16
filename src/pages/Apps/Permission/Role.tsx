import { useState, useEffect, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import * as Yup from 'yup'
import Swal from 'sweetalert2'

import { toastAlert } from '../../../helpers/constant'
import { PAGE_SIZES } from '../../../helpers/config'

import { useDispatch } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'

import { Dialog, Transition } from '@headlessui/react'
import { Form, Formik } from 'formik'

import { DataTable, DataTableSortStatus } from 'mantine-datatable'

import Breadcrumbs from '../../../helpers/breadcrumbs'
import InputField from '../../../components/HOC/InputField'

import IconX from '../../../components/Icon/IconX'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEye from '../../../components/Icon/IconEye'

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const PermissionRole = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);

  const storedUser = localStorage.getItem(mode)

  const role = storedUser ? JSON.parse(storedUser).role : null
  const access_level = storedUser ? JSON.parse(storedUser ?? '{}').access_level : null

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[2])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [actionModal, setActionModal] = useState(false)

  const breadcrumbItems = [
    { to: '/apps/employee/list', label: t('permission_employee_label') },
    { to: '/apps/permission/check', label: t('permission_manage_rights') },
    { label: t('permission_role_list'), isCurrent: true }
  ]

  if (role != 'admin' && role != 'business_unit') {
    navigate('/')
  }

  const [defaultForm, setDefaultFormData] = useState({
    action: 'add',
    key: '',
    title: '',
  })

  const [roleLists, setRoleLists] = useState<any[]>([
    {
      key: 'menu_count',
      title: t('permission_menu_count'),
    },
    {
      key: 'design_slide',
      title: t('permission_design_homepage'),
    },
    {
      key: 'design_cover',
      title: t('permission_design_inner_page'),
    },
    {
      key: 'limit_editor',
      title: t('permission_edit_design'),
    },
    {
      key: 'support_mobile',
      title: t('permission_responsive'),
    },
    {
      key: 'add_data',
      title: t('permission_data_entry'),
    },
    {
      key: 'add_product',
      title: t('permission_product_article'),
    },
    {
      key: 'contact_form',
      title: t('permission_contact_form'),
    },
    {
      key: 'support_language',
      title: t('permission_language_support'),
    },
    {
      key: 'free_domain',
      title: t('permission_free_domain_hosting'),
    },
    {
      key: 'free_ssl',
      title: t('permission_free_ssl'),
    },
  ])

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: '',
    direction: 'asc',
  })

  const [formData, setFormData] = useState<any>(defaultForm)

  const SubmittedForm = Yup.object().shape({
    key: Yup.string().required(t('please_fill_all_required_fields')),
    title: Yup.string().required(t('please_fill_all_required_fields')),
  })

  const submitForm = useCallback((event: any) => {
    console.log(event)
  }, [ defaultForm ])

  const goEdit = (item: any) => {
    setActionModal(true)
    setDefaultFormData({
      action: 'edit',
      key: item.key,
      title: item.title,
    })
  }

  useEffect(() => {
    dispatch(setPageTitle(t('permission_add_role')))
    dispatch(setSidebarActive(['employee', '/apps/permission/check']))
  }, [])

  useEffect(() => {
    setTotalItems(roleLists.length)
  }, [ defaultForm, actionModal ])

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="panel px-0 mt-5 border-white-light dark:border-[#1b2e4b]">
        <div className="invoice-table ">
          <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
            <div className="flex items-center gap-2">
              <a className="btn btn-primary gap-2" onClick={() => setActionModal(true)}>
                <IconPlus />
                {t('permission_add_role')}
              </a>
            </div>
          </div>
          <div className="datatables pagination-padding">
            <DataTable
              className="whitespace-nowrap table-hover invoice-table"
              records={roleLists}
              columns={[
                {
                  accessor: 'id',
                  title: t('order'),
                  sortable: false,
                  textAlignment: 'center',
                  render: (row, index) => (
                    <div>{index + 1}</div>
                  ),
                },
                {
                  accessor: 'title',
                  title: t('permission_title'),
                  sortable: false,
                  render: (item) => (
                    <div className="flex items-center justify-start font-normal">
                      <a className="flex cursor-pointer active" onClick={() => goEdit(item)} >
                        <div>{item.title}</div>
                      </a>
                    </div>
                  ),
                },
                {
                  accessor: 'key',
                  title: t('permission_key'),
                  sortable: false,
                  render: (item) => (
                    <div className="flex items-center justify-start font-normal">
                      <div>{item.key}</div>
                    </div>
                  ),
                },
                {
                  accessor: 'action',
                  title: 'Actions',
                  textAlignment: 'center',
                  sortable: false,
                  render: (item) => (
                    <div className="flex gap-4 items-center w-max mx-auto">
                      <a className="flex cursor-pointer active" onClick={() => goEdit(item)} >
                        <IconEye />
                      </a>
                    </div>
                  ),
                },
              ]}
              page={page}
              totalRecords={totalItems}
              recordsPerPage={pageSize}
              highlightOnHover
              onPageChange={(p) => setPage(p)}
              recordsPerPageOptions={PAGE_SIZES}
              onRecordsPerPageChange={(p) => {
                setPage(1)
                setPageSize(p)
              }}
              sortStatus={sortStatus}
              onSortStatusChange={setSortStatus}
              paginationText={({ from, to, totalRecords }) => (
                `${t('pagination_showing')} ${from} ${t('pagination_to')} ${to} ${t('pagination_of')} ${totalRecords} ${t('pagination_total_pages')}`
              )}
            />
          </div>
        </div>
        <Transition appear show={actionModal} as={Fragment}>
          <Dialog as="div" open={actionModal} onClose={() => setActionModal(false)} className="relative z-[51]">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-[black]/60" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center px-4 py-8">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark" >
                    <button
                      type="button"
                      onClick={() => setActionModal(false)}
                      className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                    >
                      <IconX />
                    </button>
                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                      {defaultForm.action == 'add' ? t('add') : t('edit')}{t('permission_role_list')}
                    </div>
                    <div className="p-5">
                      <Formik
                        initialValues={formData}
                        onSubmit={submitForm}
                        enableReinitialize
                        autoComplete="off"
                        validationSchema={SubmittedForm}
                      >
                        {(props) => (
                          <Form className="space-y-5 mb-2 dark:text-white custom-select">
                            <InputField
                              label={t('permission_title')}
                              name="title"
                              placeholder={t('please_fill_in_data')}
                              value={props.values.title !== '' ? props.values.title : defaultForm.title}
                              onChange={(e: any) => {
                                props.setFieldValue("title", e.target.value)
                                setDefaultFormData((prev) => ({ ...prev, title: e.target.value }))
                              }}
                            />
                            <InputField
                              label={t('permission_key')}
                              name="key"
                              placeholder={t('please_fill_in_data')}
                              value={props.values.key !== '' ? props.values.key : defaultForm.key}
                              onChange={(e: any) => {
                                props.setFieldValue("title", e.target.value)
                                setDefaultFormData((prev) => ({ ...prev, title: e.target.value }))
                              }}
                              onKeyPress={(e: any) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  return
                                }
                              }}
                            />
                            <div className="flex justify-center items-center mt-5">
                              <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                {defaultForm.action == 'add' ? t('permission_save') : t('permission_update')}
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
    </>
  )

}

export default PermissionRole
