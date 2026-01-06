import { useEffect, useState, useCallback, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import * as Yup from 'yup'
import Swal from 'sweetalert2'

import themeInit from '../../../theme.init'

import { toastAlert } from '../../../helpers/constant'

import { useDispatch, useSelector } from 'react-redux'
import { setPageTitle, setSidebarActive } from '../../../store/themeConfigSlice'

import { Form, Formik } from 'formik'

import Checkbox from '../../../components/HOC/CheckboxField'
import Breadcrumbs from '../../../helpers/breadcrumbs'
import IconPlus from '../../../components/Icon/IconPlus'

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const PermissionCheck = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const breadcrumbItems = [
    { to: '/apps/employee/list', label: 'พนักงาน' },
    { label: 'จัดการสิทธิ์ผู้ใช้งาน', isCurrent: true }
  ]

  useEffect(() => {
    dispatch(setPageTitle('จัดการสิทธิ์ผู้ใช้งาน'))
    // dispatch(setSidebarActive(['employee', '/apps/permission/check']))
  }, [])

  const storedUser = localStorage.getItem(mode)
  const role = storedUser ? JSON.parse(storedUser).role : null

  if (role !== 'admin' && role !== 'business_unit') {
    navigate('/')
  }

  const [defaultForm, setDefaultFormData] = useState({
    superAdmin: {
      menu_count: true,
      design_slide: true,
      design_cover: true,
      limit_editor: true,
      support_mobile: true,
      add_data: true,
      add_product: true,
      contact_form: true,
      support_language: true,
      free_domain: true,
      free_ssl: true,
    },
    admin: {
      menu_count: false,
      design_slide: false,
      design_cover: false,
      limit_editor: false,
      support_mobile: true,
      add_data: false,
      add_product: false,
      contact_form: true,
      support_language: false,
      free_domain: true,
      free_ssl: true,
    },
    iTSupport: {
      menu_count: false,
      design_slide: false,
      design_cover: false,
      limit_editor: false,
      support_mobile: true,
      add_data: false,
      add_product: false,
      contact_form: true,
      support_language: false,
      free_domain: true,
      free_ssl: true,
    },
    standardUser: {
      menu_count: false,
      design_slide: false,
      design_cover: false,
      limit_editor: false,
      support_mobile: true,
      add_data: false,
      add_product: false,
      contact_form: false,
      support_language: false,
      free_domain: true,
      free_ssl: true,
    },
  })

  const [shopFormData, setShopFormData] = useState<any>(defaultForm)

  const submitForm = useCallback((event: any) => {
  }, [])

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex xl:flex-row flex-col gap-2.5 mt-3">
        <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
          <div className="space-y-5 dark:text-white">
            <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">
              จัดการสิทธิ์ผู้ใช้งาน
            </div>
            <div className="flex items-center">
              <div className="flex justify-start gap-2">
                <Link to="/apps/permission/user" className="btn btn-primary">
                  <IconPlus /> &nbsp;
                  จัดการผู้ใช้งาน
                </Link>
                <Link to="/apps/permission/role" className="btn btn-primary">
                  <IconPlus /> &nbsp;
                  จัดการสิทธิ์ผู้ใช้งาน
                </Link>
              </div>
              <div className="flex flex-row ltr:ml-auto rtl:mr-auto gap-5">
                <button type="submit" className="btn btn-success w-[150px]">
                  บันทึกข้อมูล
                </button>
              </div>
            </div>
            <Formik initialValues={shopFormData} onSubmit={submitForm} enableReinitialize={true} autoComplete="off">
              {(props) => (
                <Form>
                  <table> 
                    <thead>
                      <tr>
                        <th style={{ minWidth: '350px' }}>สิทธิ์ / ผู้ใช้งาน</th>
                        <th className="text-center">Super Admin</th>
                        <th className="text-center">Admin</th>
                        <th className="text-center">IT Support</th>
                        <th className="text-center">Standard User</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>จำนวนเมนู (เมนูหลัก)</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.menu_count"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.menu_count"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.menu_count"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.menu_count"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>ออกแบบภาพสไลด์หน้าแรก</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.design_slide"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.design_slide"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.design_slide"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.design_slide"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>ออกแบบภาพนิ่งหน้าใน</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.design_cover"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.design_cover"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.design_cover"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.design_cover"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>ปรับแก้แบบดีไซน์</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.limit_editor"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.limit_editor"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.limit_editor"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.limit_editor"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>รองรับ Desktop, Mobile, Tablet</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.support_mobile"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.support_mobile"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.support_mobile"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.support_mobile"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>ลงข้อมูล</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.add_data"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.add_data"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.add_data"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.add_data"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>ลงข้อมูลสินค้า/บทความ</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.add_product"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.add_product"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.add_product"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.add_product"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>ฟอร์มติดต่อ (Contract Form)</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.contact_form"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.contact_form"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.contact_form"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.contact_form"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>รองรับภาษา</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.support_language"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.support_language"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.support_language"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.support_language"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>ฟรี จดโดเมนเว็บไซต์ + โฮสติ้ง</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.free_domain"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="admin.free_domain"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.free_domain"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.free_domain"
                            label=""
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>ฟรี ตืดตั้ง SSL</td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="superAdmin.free_ssl"
                            label=""
                          />
                        </td>
                       <td className="checkbox-center">
                          <Checkbox
                            name="admin.free_ssl"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="iTSupport.free_ssl"
                            label=""
                          />
                        </td>
                        <td className="checkbox-center">
                          <Checkbox
                            name="standardUser.free_ssl"
                            label=""
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  )

}

export default PermissionCheck