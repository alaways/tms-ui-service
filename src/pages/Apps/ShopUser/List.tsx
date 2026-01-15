import { Link, useNavigate, useParams } from 'react-router-dom'
import { DataTable, DataTableSortStatus } from 'mantine-datatable'
import { useState, useEffect, useCallback, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../store/themeConfigSlice'
import { setEmployee } from '../../../store/dataStore'
import IconPlus from '../../../components/Icon/IconPlus'
import IconEdit from '../../../components/Icon/IconEdit'
import IconEye from '../../../components/Icon/IconEye'
import { Employees } from '../../../types/index'
import { formatPhoneNumber } from '../../../helpers/formatNumeric'
import { accessLevelTypes, roleTypes, toastAlert } from '../../../helpers/constant'
import { useGlobalMutation } from '../../../helpers/globalApi'
import { url_api } from '../../../services/endpoints'
import { PAGE_SIZES } from '../../../helpers/config'
import { Field, Form, Formik, FormikProps } from 'formik';
import { Tab, Dialog, Transition } from '@headlessui/react'
import InputField from '../../../components/HOC/InputField'
import IconX from '../../../components/Icon/IconX'
import SelectField from '../../../components/HOC/SelectField'
import * as Yup from 'yup'
import { NUMBER_REGEX } from '../../../helpers/regex'
import Swal from 'sweetalert2'
import PreLoading from '../../../helpers/preLoading'

const List = () => {
  const mode = process.env.MODE || 'admin'
  let { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null
  
  if(role == 'shop') {
     id = storedUser ? JSON.parse(storedUser).id_shop : null
  }

  useEffect(() => {
    dispatch(setPageTitle('รายการพนักงาน'))
  })

   const [defaultForm, setDefaultFormData] = useState<any>({
      name:'',
      username: '',
      password: '',
      phone_number:'',
      email:'',
      is_active:true
   })
  const toast = Swal.mixin(toastAlert)
  const [shopUserForm, setshopUserForm] = useState<any>(defaultForm)
  const [employeeLists, setEmployeeLists] = useState<Employees[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: '',
    direction: 'asc',
  })

  const goPreview = (item: any) => {
    setshopUserForm({
       id:item?.id,
       name:item?.name,
       username:item?.username,
       phone_number:item?.phone_number,
       email:item?.email,
       line_id:item?.line_id,
       is_active:item?.is_active
    })
    setActionModal(true)
    // dispatch(setEmployee(item))
    // navigate('/apps/employee/preview/' + item.id)
  }

  type filterParams = {
      query?: string;
  };
  const validateForm = Yup.object().shape({
   
      name: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
      username: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
      ...(!shopUserForm?.id && {
          password: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ'),
      }),
      phone_number: Yup.string().required('กรุณาใส่ข้อมูลให้ครบ').length(10, 'กรุณาใส่ข้อมูลให้ครบ 10 เลข'),
      email: Yup.string().email('กรุณาใส่อีเมลที่ถูกต้อง').required('กรุณาใส่ข้อมูลให้ครบ'),
     
    })
  const [filter, setFilter] = useState<filterParams>({})
  const { mutate: fetchShopUser, isLoading} = useGlobalMutation(url_api.shopUserFindAll, {
    onSuccess: (res: any) => {
      setEmployeeLists(res.data.list)
      setTotalItems(res.data.total)
    },
    onError: () => {
      console.error('Failed to fetch bu data')
    },
  })

  useEffect(() => {
    fetchShopUser({
      data: {
        id_shop:id,
        page: page,
        page_size: pageSize,
      },
    })
  }, [page, pageSize])

  useEffect(() => {
    //fetchShopUser({data: {id_shop:id,page:1, page_size: pageSize}})
  }, [pageSize])

  useEffect(() => {
   // fetchShopUser({data: {id_shop:id,page:page, page_size: pageSize,...filter}})
  }, [page])
    
  const [actionModal, setActionModal] = useState(false)

  const submitShopUserForm = useCallback(
    (event: any) => {
      if (event?.id) {
        shopUserUpdate({data:{...event,id_shop:id}})
      } else {
        shopUserCreate({data:{...event,id_shop:id}})
      }
      setActionModal(false)
    },
    []
  )
  
  const { mutate: shopUserCreate,isLoading:isLoadingCreate  } = useGlobalMutation(url_api.shopUserCreate, {
      onSuccess: (res: any) => {
        if (res.statusCode === 200 || res.code === 200) {
          toast.fire({
            icon: 'success',
            title: 'เพิ่มข้อมูลสำเร็จ',
            padding: '10px 20px',
          })
          setPage(1)
          fetchShopUser({data: {
            page:1,
            page_size: pageSize,
            query:'',
            id_shop:id,
          }})
          setFilter({query:''})
        } else {
          toast.fire({
            icon: 'error',
            title: res.message,
            padding: '10px 20px',
          })
        }
      },
  })

  const { mutate: shopUserUpdate,isLoading:isLoadingUpdate } = useGlobalMutation(url_api.shopUserUpdate, {
      onSuccess: (res: any) => {
        if (res.statusCode === 200 || res.code === 200) {
          toast.fire({
            icon: 'success',
            title: 'แก้ไขข้อมูลสำเร็จ',
            padding: '10px 20px',
          })
          setPage(1)
          fetchShopUser({data: {
            page:1,
            page_size: pageSize,
            query:'',
            id_shop:id,
          }})
          setFilter({query:''})
        } else {
          toast.fire({
            icon: 'error',
            title: res.message,
            padding: '10px 20px',
          })
        }
      },
  })
  // const accessLevel = accessLevelTypes.reduce((currentValue: any, nowValue: any) => {
  //   currentValue[`${nowValue.value}`] = nowValue.label
  //   return currentValue
  // }, {})

  // const roleName = roleTypes.reduce((currentValue: any, nowValue: any) => {
  //   currentValue[`${nowValue.value}`] = nowValue.label
  //   return currentValue
  // }, {})

  return (
    <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
      {(isLoading || isLoadingCreate || isLoadingUpdate) && <PreLoading />}
      <div className="invoice-table ">
        <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
          <div className="flex items-center gap-2">
             <button type="button" className="btn bg-[#002a42] text-white w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" onClick={() => {
                 setActionModal(true)
              }}>
                 <IconPlus />
                เพิ่มพนักงาน
              </button>
              
          </div>
          <div className="flex flex-row ltr:ml-auto rtl:mr-auto gap-5">
          <Formik initialValues={{query:''}} 
          onSubmit={(values:any)=>{
            setPage(1)
            fetchShopUser({data: {
              page:1,
              page_size: pageSize,
              query:values.query,
              id_shop:id,
            }})
            setFilter({...values})
          }}>
            {({ setFieldValue, handleReset, values }) => (
                  <Form>
                    <div className="flex flex-wrap sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                        
                        <div className="flex gap-4">
                          <div className="relative">
                            <input type="text" 
                              id="query" 
                              name="query" 
                              placeholder="ค้นหา" 
                              className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" 
                              value={values.query}
                              onChange={(e) => {
                                setFieldValue('query', e.target.value);
                              }}
                            />
                          </div>
                          <button type="submit" className="btn btn-primary w-[100px] gap-2">ค้นหา</button>
                          <button
                            type="reset"
                            className="btn btn-info gap-2 w-[100px]"
                            onClick={() => {
                              const resetValues:filterParams = {
                              query:'',
                              }
                              setPage(1)
                              setFilter({...resetValues})
                              fetchShopUser({data: {id_shop:id,page:1, page_size: pageSize,...resetValues}})
                            }}
                          >
                            ล้างค่า
                          </button>
                        </div>
                      </div>
                    
                  </Form>
              )}
          </Formik>
          </div>
        </div>
        <div className="datatables pagination-padding">
          <DataTable
            className="whitespace-nowrap table-hover invoice-table"
            records={employeeLists}
            columns={[
              {
                accessor: 'id',
                title: 'ลำดับ',
                sortable: false,
                textAlignment: 'center',
                render: (row, index) => (
                  <div>{index + 1}</div>
                ),
              },
              {
                accessor: 'name',
                title: 'ชื่อพนักงาน',
                sortable: false,
                render: (item) => (
                  <div className="flex items-center justify-start font-normal">
                    <div>{item.name}</div>
                  </div>
                ),
              },
              {
                accessor: 'email',
                title: 'อีเมล',
                sortable: false,
                render: (item: any) => (
                  <div className="flex items-center justify-start font-normal">
                    <div>{item.email}</div>
                  </div>
                ),
              },
              {
                accessor: 'phone_number',
                title: 'เบอร์โทรศัพท์',
                sortable: false,
                render: ({ phone_number }) => (
                  <div className="flex items-center justify-start font-normal">
                    <div>{phone_number ? formatPhoneNumber(phone_number) : '-'}</div>
                  </div>
                ),
              },
              {
                accessor: 'line_id',
                title: 'Line ID',
                sortable: false,
                render: ({line_id}) => (
                  <div className="flex items-center justify-start font-normal">
                    <div>{line_id ? line_id  :'-' }</div>
                  </div>
                ),
              },
              // {
              //   accessor: 'role',
              //   title: 'ตำแหน่ง',
              //   textAlignment: 'center',
              //   sortable: false,
              //   render: (item: any) => (
              //     <div className="flex items-center justify-center font-normal">
              //       <div>{roleName[item.role] || '-'}</div>
              //     </div>
              //   ),
              // },
              // {
              //   accessor: 'access_level',
              //   title: 'ระดับสิทธิ์',
              //   textAlignment: 'center',
              //   sortable: false,
              //   render: (item: any) => (
              //     <div className="flex items-center justify-center font-normal">
              //       <div>{accessLevel[item.access_level] || '-'}</div>
              //     </div>
              //   ),
              // },
              {
                accessor: 'is_active',
                title: 'เปิดปิดการใช้งาน',
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
                    <a className="flex cursor-pointer active" onClick={() => goPreview(item)} >
                      <IconEdit />
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
              `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`
            )}
          />
        </div>
      </div>

       <Transition appear show={actionModal} as={Fragment}>
        <Dialog as="div" open={actionModal} className="relative z-[51]" onClose={() => {
           setshopUserForm(defaultForm)
           setActionModal(false) 
        }}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-[black]/60" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95" >
                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark" style={{ minHeight: '500px' }}>
                  <button type="button" className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none" onClick={() => setActionModal(false)}>
                    <IconX />
                  </button>
                  <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                    {shopUserForm?.id ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงาน'}
                  </div>
                  <div className="p-5">
                    <Formik initialValues={shopUserForm} onSubmit={submitShopUserForm} enableReinitialize autoComplete="off" validationSchema={validateForm}>
                      {(props) => (
                        <Form className="space-y-5 dark:text-white custom-select">
  
                           <InputField
                            require={true}
                            label="ชื่อผู้ใช้งาน"
                            name="username"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                            disabled={shopUserForm?.id ? true : false}
                          />

                          <InputField
                            require={shopUserForm?.id ? false : true}
                            label="รหัสผ่าน"
                            name="password"
                            type="password"
                            placeholder="กรุณาใส่ข้อมูล"
                          />

                          <InputField
                            require={true}
                            label="ชื่อ-นามสกุล"
                            name="name"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                            
                          />

                          <InputField
                            require={true}
                            label="เบอร์โทรติดต่อ"
                            name="phone_number"
                            type="text"
                            maxLength={10}
                            onKeyPress={(e: any) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault()
                              }
                            }}
                          />

                          <InputField
                            require={true}
                            label="E-mail"
                            name="email"
                            type="email"
                            placeholder="กรุณาใส่ข้อมูล"
                          />

                          <InputField
                            label="LINE ID"
                            name="line_id"
                            type="text"
                            placeholder="กรุณาใส่ข้อมูล"
                          />


                         <SelectField
                            label="สถานะการใช้งาน"
                            id="is_active"
                            name="is_active"
                            options={[
                              { label: 'เปิด', value: true },
                              { label: 'ปิด', value: false }
                            ]}
                            placeholder="กรุณาเลือก"
                          />
                         
                          <div className="flex justify-center items-center mt-8">
                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                             บันทึกข้อมูล
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

export default List