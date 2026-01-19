import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { convertDateDbToClient } from '../../../helpers/formatDate'
import PreLoading from '../../../helpers/preLoading';
import IconNotes from '../../../components/Icon/IconNotes'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
const mode = process.env.MODE || 'admin'

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  useEffect(() => {
    if (role !== 'customer') {
      navigate('/')
    }
  }, [role, navigate])

  const [loading, setLoading] = useState(true)
  const [contract, setContracts] = useState<any[]>([])

  useEffect(() => {
    dispatch(setPageTitle('Dashboard'))
  }, [dispatch])

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

  const showErrorMessage = (message: string) => {
    showNotification(message, 'error')
  }

  const fetchPeriod = (contractData: any) => {

    if(contractData.on_payment_process == "close_contract") {
      navigate('/apps/customer-payment/invoice-cc/' + contractData.id );
    } else {
      navigate('/apps/customer-payment/checklist', {
        state: {
          contractData: contractData,
        },
      })
    }
    
  }

  const { mutate: fetchCustomerPaymentData} = useGlobalMutation(url_api.customerPaymentFindAllGuest, {
      onSuccess: (res: any) => {
        setContracts(res.data)
        setLoading(false)
      },
      onError: () => {
        showErrorMessage('Failed to fetch business units')
        setLoading(false)
    },
  });
  
  useEffect(() => {
    setLoading(true)
    fetchCustomerPaymentData({
      page: 1,
      page_size: 9999
    })
  }, [fetchCustomerPaymentData])

  return (
    <div className="py-10 px-5 animate__animated">
      <div className="flex mb-5">
        <IconNotes className="w-8 h-8 mx-2" />
        <h5 className="font-semibold text-lg dark:text-white-light text-center">
          สัญญาเช่าซื้อ
        </h5>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
                  <PreLoading />
        ) : contract.length === 0 ? (
          <div className="font-semibold text-center pb-8">
            <p className="text-lg text-white-dark my-4">
              ยังไม่พบข้อมูล
            </p>
          </div>
        ) : (
          contract.map((item) => (
            <div key={item.id} className="panel h-full">
              <div className="flex items-center justify-between border-b border-white-light dark:border-[#1b2e4b] -m-5 mb-5 p-5">
                <div className="flex flex-col w-full">
                  <div className="font-semibold">
                    <div className="flex justify-between">
                      <p className="text-md text-dark mt-1"> เลขที่สัญญา {item.reference} </p>
                      {(item.status.id == 5 && !item.is_closed) && item.is_due && (
                        <p className="text-md text-red-600 mt-1">
                          รอชำระ
                        </p>
                      )}

                      {(item.status.id == 5 && !item.is_closed) && !item.is_due && (
                        <p className="text-md text-green-600 mt-1">
                          ปกติ
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-white-dark mt-1">
                      {item.business_unit.name}
                    </p>
                    <p className="text-sm text-white-dark mt-1">
                      {item.asset.name}
                    </p>
                    <p className="text-sm text-white-dark mt-1">
                      งวดที่: {item.ins_now}
                    </p>
                    <p className="text-sm text-white-dark mt-1">
                      วันที่ครบกำหนด {convertDateDbToClient(item?.due_at)}
                    </p>
                  </div>
                </div>
              </div>
              {item.status.id == 8 ? (
                <div className="font-semibold text-center pb-0 flex justify-center items-center p-0 h-[125px]">
                  <p className="text-md text-gray-400 mt-3 mb-5">
                    อยุ่ระหว่างดำเนินการ
                  </p>
                </div>
              ) : item.status.id == 5 && item.is_closed ? (
                <div className="font-semibold text-center pb-0 flex justify-center items-center p-0 h-[125px]">
                  <p className="text-md text-gray-400 mt-3 mb-5">
                    ปิดสัญญา
                  </p>
                </div>
              ) : (
                <div className="font-semibold text-center pb-8">
                  {/* {item.is_due && ( */}
                    <>
                      <p className="text-lg text-white-dark my-4">
                        ยอดที่ต้องชำระ
                      </p>
                      <p className="text-2xl text-red-600 mt-3 mb-5">
                        {item.preview?.amount ? item.preview.total.toLocaleString() : '0'} บาท
                      </p>
                    </>
                  {/* )} */}
                  <div className="w-full absolute bottom-0 flex items-center justify-between p-5 -mx-5">
                    <button type="button" className="btn btn-secondary btn-lg w-full border-0 bg-gradient-to-r from-[#3d38e1] to-[#1e9afe]" onClick={() => fetchPeriod(item)}>
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )

}

export default Dashboard
