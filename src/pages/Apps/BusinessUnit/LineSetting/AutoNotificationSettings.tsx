import { useState, useEffect, useCallback } from 'react'
import { Form, Formik } from 'formik'
import Swal from 'sweetalert2'
import InputField from '../../../../components/HOC/InputField'
import SelectField from '../../../../components/HOC/SelectField'
import IconEdit from '../../../../components/Icon/IconEdit'
import { toastAlert } from '../../../../helpers/constant'
import { url_api } from '../../../../services/endpoints'
import { useGlobalMutation } from '../../../../helpers/globalApi'

interface AutoNotificationSettingsProps {
  id_bu: number
}

interface AutoNotifyData {
  id?: number
  type: string
  send_to: string
  line_uuid: string
  message: string
  is_active: boolean
}

const defaultNotifyData = {
  unlock: {
    type: 'unlock',
    send_to: 'admin',
    line_uuid: '',
    message: '',
    is_active: false
  },
  pay_all: {
    type: 'pay_all',
    send_to: 'customer',
    line_uuid: '',
    message: '',
    is_active: false
  },
  contract_complete: {
    type: 'contract_complete',
    send_to: 'customer',
    line_uuid: '',
    message: '',
    is_active: false
  }
}

const toast = Swal.mixin(toastAlert)

const AutoNotificationSettings = ({ id_bu }: AutoNotificationSettingsProps) => {
  // Auto Notification States
  const [autoNotifyUnlock, setAutoNotifyUnlock] = useState<AutoNotifyData>(defaultNotifyData.unlock)
  const [autoNotifyPaymentComplete, setAutoNotifyPaymentComplete] = useState<AutoNotifyData>(defaultNotifyData.pay_all)
  const [autoNotifyContractEnd, setAutoNotifyContractEnd] = useState<AutoNotifyData>(defaultNotifyData.contract_complete)

  // Edit mode states
  const [editModeUnlock, setEditModeUnlock] = useState(false)
  const [editModePaymentComplete, setEditModePaymentComplete] = useState(false)
  const [editModeContractEnd, setEditModeContractEnd] = useState(false)

  // Original values for cancel/restore
  const [originalUnlock, setOriginalUnlock] = useState<AutoNotifyData>(defaultNotifyData.unlock)
  const [originalPaymentComplete, setOriginalPaymentComplete] = useState<AutoNotifyData>(defaultNotifyData.pay_all)
  const [originalContractEnd, setOriginalContractEnd] = useState<AutoNotifyData>(defaultNotifyData.contract_complete)

  const { mutate: fetchMessageData } = useGlobalMutation(url_api.buMessageGet, {
    onSuccess: (res: any) => {
      if (res.code === 200 && res.data) {
        const data = res.data
        // Find each type from response
        const unlockData = data.find((item: any) => item.type === 'unlock')
        const payAllData = data.find((item: any) => item.type === 'pay_all')
        const contractCompleteData = data.find((item: any) => item.type === 'contract_complete')

        if (unlockData) {
          const unlockState = {
            id: unlockData.id,
            type: 'unlock',
            send_to: unlockData.send_to || 'admin',
            line_uuid: unlockData.line_uuid || '',
            message: unlockData.message || '',
            is_active: unlockData.is_active || false
          }
          setAutoNotifyUnlock(unlockState)
          setOriginalUnlock(unlockState)
        }

        if (payAllData) {
          const payAllState = {
            id: payAllData.id,
            type: 'pay_all',
            send_to: payAllData.send_to || 'customer',
            line_uuid: payAllData.line_uuid || '',
            message: payAllData.message || '',
            is_active: payAllData.is_active || false
          }
          setAutoNotifyPaymentComplete(payAllState)
          setOriginalPaymentComplete(payAllState)
        }

        if (contractCompleteData) {
          const contractState = {
            id: contractCompleteData.id,
            type: 'contract_complete',
            send_to: contractCompleteData.send_to || 'customer',
            line_uuid: contractCompleteData.line_uuid || '',
            message: contractCompleteData.message || '',
            is_active: contractCompleteData.is_active || false
          }
          setAutoNotifyContractEnd(contractState)
          setOriginalContractEnd(contractState)
        }
      }
    },
  })

  const { mutate: updateMessage } = useGlobalMutation(url_api.buMessageUpdate, {
    onSuccess: (res: any) => {
      if (res.statusCode === 200 || res.code === 200) {
        toast.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          padding: '10px 20px',
        })
        // Refresh data after save
        fetchMessageData({ data: { id_business_unit: id_bu } })
      } else {
        toast.fire({
          icon: 'error',
          title: res.message || 'เกิดข้อผิดพลาด',
          padding: '10px 20px',
        })
      }
    },
    onError: (err: any) => {
      toast.fire({
        icon: 'error',
        title: err.message || 'เกิดข้อผิดพลาด',
        padding: '10px 20px',
      })
    },
  })

  useEffect(() => {
    fetchMessageData({ data: { id_business_unit: id_bu } })
  }, [id_bu])

  const handleSaveUnlock = useCallback(() => {
    updateMessage({
      data: {
        id_business_unit: id_bu,
        ...autoNotifyUnlock
      }
    })
    setEditModeUnlock(false)
  }, [updateMessage, id_bu, autoNotifyUnlock])

  const handleSavePaymentComplete = useCallback(() => {
    updateMessage({
      data: {
        id_business_unit: id_bu,
        ...autoNotifyPaymentComplete
      }
    })
    setEditModePaymentComplete(false)
  }, [updateMessage, id_bu, autoNotifyPaymentComplete])

  const handleSaveContractEnd = useCallback(() => {
    updateMessage({
      data: {
        id_business_unit: id_bu,
        ...autoNotifyContractEnd
      }
    })
    setEditModeContractEnd(false)
  }, [updateMessage, id_bu, autoNotifyContractEnd])

  return (
    <div className="pt-4 space-y-6">
      {/* Form 1: แจ้งเตือนสัญญาที่ต้องการปลดล็อค */}
      <Formik
        initialValues={autoNotifyUnlock}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ setFieldValue }) => (
          <Form className="border border-white-light dark:border-[#1b2e4b] rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-base font-semibold">แจ้งเตือนสัญญาที่ต้องการปลดล็อค (แจ้งเตือนแอดมิน)</div>
              <div className="flex items-center gap-3">
                {editModeUnlock ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveUnlock}
                      className="flex items-center text-success hover:text-green-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoNotifyUnlock(originalUnlock)
                        setEditModeUnlock(false)
                      }}
                      className="flex items-center text-danger hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalUnlock(autoNotifyUnlock)
                      setEditModeUnlock(true)
                    }}
                    className="flex items-center gap-1 text-primary hover:text-primary-dark"
                  >
                    <IconEdit className="w-4 h-4" />
                    <span>แก้ไข</span>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Line UUID"
                name="line_uuid"
                type="text"
                placeholder="กรุณาใส่ Line UUID"
                disabled={!editModeUnlock}
                onChange={(e: any) => {
                  setFieldValue('line_uuid', e.target.value)
                  setAutoNotifyUnlock({ ...autoNotifyUnlock, line_uuid: e.target.value })
                }}
              />
              <SelectField
                label="สถานะ"
                id="is_active_unlock"
                name="is_active"
                disabled={!editModeUnlock}
                options={[
                  { value: true, label: 'เปิดใช้งาน' },
                  { value: false, label: 'ปิดใช้งาน' },
                ]}
                onChange={(e: any) => {
                  setFieldValue('is_active', e.value)
                  setAutoNotifyUnlock({ ...autoNotifyUnlock, is_active: e.value })
                }}
              />
              {/* <div className="md:col-span-2">
                <InputField
                  label="ข้อความแจ้งเตือน"
                  name="message"
                  as="textarea"
                  rows="3"
                  placeholder="กรุณาใส่ข้อความแจ้งเตือน"
                  disabled={!editModeUnlock}
                  onChange={(e: any) => {
                    setFieldValue('message', e.target.value)
                    setAutoNotifyUnlock({ ...autoNotifyUnlock, message: e.target.value })
                  }}
                />
              </div> */}
            </div>
          </Form>
        )}
      </Formik>

      {/* Form 2: แจ้งเตือนชำระครบแล้ว */}
      <Formik
        initialValues={autoNotifyPaymentComplete}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ setFieldValue }) => (
          <Form className="border border-white-light dark:border-[#1b2e4b] rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-base font-semibold">แจ้งเตือนชำระครบแล้ว (แจ้งเตือนลูกค้า)</div>
              <div className="flex items-center gap-3">
                {editModePaymentComplete ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSavePaymentComplete}
                      className="flex items-center text-success hover:text-green-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoNotifyPaymentComplete(originalPaymentComplete)
                        setEditModePaymentComplete(false)
                      }}
                      className="flex items-center text-danger hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalPaymentComplete(autoNotifyPaymentComplete)
                      setEditModePaymentComplete(true)
                    }}
                    className="flex items-center gap-1 text-primary hover:text-primary-dark"
                  >
                    <IconEdit className="w-4 h-4" />
                    <span>แก้ไข</span>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="สถานะ"
                id="is_active_payment"
                name="is_active"
                disabled={!editModePaymentComplete}
                options={[
                  { value: true, label: 'เปิดใช้งาน' },
                  { value: false, label: 'ปิดใช้งาน' },
                ]}
                onChange={(e: any) => {
                  setFieldValue('is_active', e.value)
                  setAutoNotifyPaymentComplete({ ...autoNotifyPaymentComplete, is_active: e.value })
                }}
              />
              <div></div>
              <div className="md:col-span-2">
                <InputField
                  label="ข้อความแจ้งเตือน"
                  name="message"
                  as="textarea"
                  rows="3"
                  placeholder="กรุณาใส่ข้อความแจ้งเตือน"
                  disabled={!editModePaymentComplete}
                  onChange={(e: any) => {
                    setFieldValue('message', e.target.value)
                    setAutoNotifyPaymentComplete({ ...autoNotifyPaymentComplete, message: e.target.value })
                  }}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/* Form 3: แจ้งเตือนสัญญาที่สิ้นสุด */}
      <Formik
        initialValues={autoNotifyContractEnd}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ setFieldValue }) => (
          <Form className="border border-white-light dark:border-[#1b2e4b] rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-base font-semibold">แจ้งเตือนสัญญาที่สิ้นสุด (แจ้งเตือนลูกค้า)</div>
              <div className="flex items-center gap-3">
                {editModeContractEnd ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveContractEnd}
                      className="flex items-center text-success hover:text-green-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoNotifyContractEnd(originalContractEnd)
                        setEditModeContractEnd(false)
                      }}
                      className="flex items-center text-danger hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalContractEnd(autoNotifyContractEnd)
                      setEditModeContractEnd(true)
                    }}
                    className="flex items-center gap-1 text-primary hover:text-primary-dark"
                  >
                    <IconEdit className="w-4 h-4" />
                    <span>แก้ไข</span>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="สถานะ"
                id="is_active_contract_end"
                name="is_active"
                disabled={!editModeContractEnd}
                options={[
                  { value: true, label: 'เปิดใช้งาน' },
                  { value: false, label: 'ปิดใช้งาน' },
                ]}
                onChange={(e: any) => {
                  setFieldValue('is_active', e.value)
                  setAutoNotifyContractEnd({ ...autoNotifyContractEnd, is_active: e.value })
                }}
              />
              <div></div>
              <div className="md:col-span-2">
                <InputField
                  label="ข้อความแจ้งเตือน"
                  name="message"
                  as="textarea"
                  rows="3"
                  placeholder="กรุณาใส่ข้อความแจ้งเตือน"
                  disabled={!editModeContractEnd}
                  onChange={(e: any) => {
                    setFieldValue('message', e.target.value)
                    setAutoNotifyContractEnd({ ...autoNotifyContractEnd, message: e.target.value })
                  }}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default AutoNotificationSettings
