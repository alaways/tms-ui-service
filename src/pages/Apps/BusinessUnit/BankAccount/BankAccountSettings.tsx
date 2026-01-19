import { Fragment, useState, useEffect, useCallback } from 'react'
import { Form, Formik } from 'formik'
import { Dialog, Transition } from '@headlessui/react'
import Tippy from '@tippyjs/react'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import InputField from '../../../../components/HOC/InputField'
import SelectField from '../../../../components/HOC/SelectField'
import IconX from '../../../../components/Icon/IconX'
import IconEdit from '../../../../components/Icon/IconEdit'
import IconTrashLines from '../../../../components/Icon/IconTrashLines'
import { NUMBER_REGEX } from '../../../../helpers/regex'
import { formatBankAccountNumber } from '../../../../helpers/formatNumeric'
import { toastAlert } from '../../../../helpers/constant'
import { useGlobalMutation } from '../../../../helpers/globalApi'
import { url_api } from '../../../../services/endpoints'
import themeInit from '../../../../theme.init'

interface BankAccountSettingsProps {
  id_bu: number
}

const defaultBankForm = {
  id_bank: '',
  id_business_unit: '',
  bank_account_name: '',
  bank_account_number: '',
  is_main_account: false,
}

const SubmittedBankForm = Yup.object().shape({
  bank_account_name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  id_bank: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
  bank_account_number: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').matches(NUMBER_REGEX, 'ใส่ได้เฉพาะตัวเลข'),
  is_main_account: Yup.boolean().required('กรุณาใส่ข้อมูลให้ครบ'),
})

const toast = Swal.mixin(toastAlert)

const BankAccountSettings = ({ id_bu }: BankAccountSettingsProps) => {
  const [bankList, setBankList] = useState<any>([])
  const [masterDataBankList, setMasterDataBankList] = useState<any>([])
  const [bankFormData, setBankFormData] = useState<any>(defaultBankForm)
  const [actionModal, setActionModal] = useState(false)

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

  const { mutate: fetchBuDataBank } = useGlobalMutation(url_api.buGetBankList, {
    onSuccess: (res: any) => {
      const setFormValue = res.data
      setBankList(setFormValue ?? [])
    },
    onError: () => {
      console.error('Failed to fetch bank data')
    },
  })

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

  useEffect(() => {
    bankFindAll({ data: { page: 1, pageSize: -1 } })
    fetchBuDataBank({
      data: {
        id_business_unit: id_bu,
      },
    })
  }, [id_bu])

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
    [BuUpdateBank, BuAddBank, id_bu]
  )

  return (
    <>
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
                                    confirmButtonColor: themeInit.color.themePrimary,
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
                      {() => (
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
    </>
  )
}

export default BankAccountSettings
