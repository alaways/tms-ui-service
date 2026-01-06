import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'
import { IRootState } from '../../../store'
import { setEmployee } from '../../../store/dataStore'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'

import { Employees } from '../../../types/index'

import { formatPhoneNumber } from '../../../helpers/formatNumeric'
import { roleTypes, accessLevelTypes } from '../../../helpers/constant'

import LabelContent from '../../../components/HOC/Label'
import IconEdit from '../../../components/Icon/IconEdit'

import Breadcrumbs from '../../../helpers/breadcrumbs'

const mode = process.env.MODE || 'admin'

const Preview = () => {

  const { id } = useParams()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  if (role !== 'admin' && role !== 'business_unit') {
    navigate('/')
  }

  const breadcrumbItems = [
    { to: '/apps/employee/list', label: 'พนักงาน' },
    { label: 'รายละเอียด', isCurrent: true },
  ]

  useEffect(() => {
    dispatch(setPageTitle('รายละเอียดพนักงาน'))
    dispatch(setSidebarActive(['employee', '/apps/employee/list']))
  })

  const [employeeData, setEmployeeData] = useState<any | null>(null)
  const dataStoredEmployee = useSelector((state: IRootState) => state.dataStore.employees)


  useEffect(() => {
    setEmployeeData(dataStoredEmployee)
  }, [dataStoredEmployee])

  const goEdit = () => {
    setEmployee(dataStoredEmployee)
    navigate('/apps/employee/edit/' + dataStoredEmployee.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center lg:justify-end justify-center flex-wrap gap-4 mb-6 pt-5">
          <a className="btn btn-primary gap-2 cursor-pointer" onClick={() => goEdit()}>
            <IconEdit />
            แก้ไข
          </a>
        </div>
      </div>
      <div className="panel px-6 flex-1 py-6 rtl:xl:ml-6">
        <div className="space-y-5 dark:text-white">
          <div className="input-flex-row">
            <LabelContent label="ชื่อพนักงาน">
              {employeeData?.title + ' ' + employeeData?.name}
            </LabelContent>
            <LabelContent label="เบอร์โทรศัพท์พนักงาน">
              {formatPhoneNumber(employeeData?.phone_number ?? '-')}
            </LabelContent>
            <LabelContent label="Line ID">
              {employeeData?.line_id}
            </LabelContent>
          </div>
          <div className="input-flex-row">
            <LabelContent label="Email">
              {employeeData?.email}
            </LabelContent>
            <LabelContent label="Role">
              {roleTypes.reduce((data: any, item: any) => {
                if (item.value === employeeData?.role) { return item.label }
                return data
              }, '')}
            </LabelContent>
            <LabelContent label="Access Level">
              {accessLevelTypes.reduce((data: any, item: any) => {
                if (item.value === employeeData?.access_level) { return item.label }
                return data
              }, '')}
            </LabelContent>
          </div>
          <div className="input-flex-row">
          <LabelContent label="หน่วยธุรกิจ">
              {employeeData?.business_unit?.name || 'TMS'}
            </LabelContent>
          </div>
        </div>
      </div>
    </div>
  )

}

export default Preview
