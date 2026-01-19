import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../../store/themeConfigSlice'
import { url_api } from '../../../../services/endpoints'
import { Form, Formik } from 'formik'
import InputField from '../../../../components/HOC/InputField'
import SelectField from '../../../../components/HOC/SelectField'
import { useGlobalMutation } from '../../../../helpers/globalApi'
import { toastAlert } from '../../../../helpers/constant'
import { useUploadMutation } from '../../../../services/mutations/useUploadMutation'
import PreLoading from '../../../../helpers/preLoading'

const mode = process.env.MODE || 'admin'
const toast = Swal.mixin(toastAlert)

const defaultForm = {
  toc_file: '',
  version: '',
  is_active: true,
}

const SettingToc = () => {
  const { id } = useParams()
  const dispatch = useDispatch()

  const storedUser = localStorage.getItem(mode)
  const user = storedUser ? JSON.parse(storedUser) : null
  const role = user ? user?.role : null

  let id_bu = Number(id)
  if (role == 'business_unit') {
    id_bu = user?.id_business_unit
  }

  const [formData, setFormData] = useState<any>(defaultForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')

  // Helper function to get full URL from file_name
  const getFileUrl = (fileName: string) => {
    if (!fileName) return ''
    // If already a full URL, return as is
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
      return fileName
    }
    // Otherwise, prepend BACKEND_URL
    return `${process.env.BACKEND_URL}/storage/${fileName}`
  }

  const { mutate: fetchData,isLoading:fetchLoading} = useGlobalMutation(url_api.buGetTocSetting, {
        onSuccess: (res: any) => {
            // Check multiple possible response structures
            const data = res?.data || res
            const tocFile = data?.toc_file || ''
            const version = data?.version || ''
            const isActive = data?.is_active !== undefined ? data.is_active : true

            setFormData({
              toc_file: tocFile,
              version: version,
              is_active: isActive,
            })

            // Check file type from file name
            if (tocFile) {
              const fileName = tocFile.toLowerCase()
              // Check if file contains .pdf (with or without query params)
              if (fileName.includes('.pdf')) {
                setFileType('pdf')
              } else if (fileName.includes('.doc')) {
                setFileType('doc')
              } else {
                // Default to pdf if file exists but no extension detected
                setFileType('pdf')
              }
            }
        },
        onError: (err: any) => {
            toast.fire({
                icon: 'error',
                title: err?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
                padding: '10px 20px',
            });
        },
  })

  const { mutateAsync: uploadFile, isLoading: isUploading } = useUploadMutation()


  const { mutate: updateData,isLoading: updateLoading} = useGlobalMutation(url_api.buUpdateTocSetting, {
        onSuccess: (res: any) => {
            // Get updated data from response
            const data = res?.data || res
            const tocFile = data?.toc_file || ''
            const version = data?.version || ''
            const isActive = data?.is_active !== undefined ? data.is_active : true

            setFormData({
              toc_file: tocFile,
              version: version,
              is_active: isActive,
            })

            // Check file type from file name after update
            if (tocFile) {
              const fileName = tocFile.toLowerCase()
              if (fileName.includes('.pdf')) {
                setFileType('pdf')
              } else if (fileName.includes('.doc')) {
                setFileType('doc')
              } else {
                setFileType('pdf') // Default to pdf
              }
            }

            toast.fire({
              icon: 'success',
              title: 'บันทึกข้อมูลสำเร็จ',
              padding: '2em',
            })
        },
        onError: () => {
          toast.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
            padding: '2em',
          })
        },
  })

  useEffect(() => {
    dispatch(setPageTitle('ตั้งค่า TOC'))
    fetchData({
      data: {
        id_business_unit: id_bu
      }
    })

    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [])

  // Cleanup preview URL when it changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Revoke old preview URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      setSelectedFile(file)

      // Check file type
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('.pdf')) {
        setFileType('pdf')
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        setFileType('doc')
      } else {
        setFileType('')
      }

      // Create preview URL for local file
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  const submitForm = async (values: any) => {
    try {
      let toc_file_name = values.toc_file

      // If there's a new file selected, upload it first
      if (selectedFile) {
        const uploadResult = await uploadFile({
          data: {
            file: selectedFile,
            type: 'business_unit'
          }
        })

        if (uploadResult?.data?.file_name) {
          toc_file_name = uploadResult.data.file_name
        } else {
          toast.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด: ไม่พบชื่อไฟล์จากการอัพโหลด',
            padding: '2em',
          })
          return
        }
      }

      // Prepare payload
      const payload: any = {
        version: values.version,
        is_active: values.is_active,
        id_business_unit: id_bu,
      }

      // Only include toc_file if it's a file_name (not a full URL)
      // If toc_file starts with http/https, it means it's already saved and we don't need to send it
      if (toc_file_name && !toc_file_name.startsWith('http://') && !toc_file_name.startsWith('https://')) {
        payload.toc_file = toc_file_name
      }

      updateData({ data: payload })

      // Clear selected file and preview after successful submission
      if (selectedFile) {
        setSelectedFile(null)
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl('')
      }
    } catch (err: any) {
      toast.fire({
        icon: 'error',
        title: err?.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์',
        padding: '2em',
      })
    }
  }

  const SubmittedForm = Yup.object().shape({
    version: Yup.string().required('กรุณากรอกเวอร์ชัน'),
  })

  return (
    <div>
      {(fetchLoading || updateLoading || isUploading) && <PreLoading />}
      <Formik
        initialValues={formData}
        onSubmit={submitForm}
        enableReinitialize
        autoComplete="off"
        validationSchema={SubmittedForm}
      >
        {(props) => (
          <Form className="panel space-y-5 dark:text-white">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="toc_file">ไฟล์ TOC</label>
                <div className="mt-2">
                  <label className="btn btn-primary gap-2 cursor-pointer">
                    {isUploading ? 'กำลังอัพโหลด...' : 'เลือกไฟล์'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>

                  {/* Show selected file name */}
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="text-sm text-gray-600">
                        ไฟล์ที่เลือก: <span className="font-semibold">{selectedFile.name}</span>
                        <span className="ml-2 text-orange-600">(ยังไม่ได้บันทึก)</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelectedFile(null)
                          if (previewUrl) {
                            URL.revokeObjectURL(previewUrl)
                          }
                          setPreviewUrl('')
                          setFileType(formData.toc_file ? (formData.toc_file.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc') : '')
                        }}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  )}
                </div>

                {/* PDF Preview - Show preview for selected file OR saved file */}
                {fileType === 'pdf' && (previewUrl || formData.toc_file) && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">ตัวอย่างไฟล์ PDF</h3>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <iframe
                        src={previewUrl || getFileUrl(formData.toc_file)}
                        width="100%"
                        height="600px"
                        className="block"
                        style={{ maxWidth: '100%' }}
                        title="PDF Preview"
                      >
                        เบราว์เซอร์นี้ไม่รองรับการแสดง PDF กรุณา{' '}
                        <a href={previewUrl || getFileUrl(formData.toc_file)} target="_blank" rel="noopener noreferrer">
                          ดาวน์โหลดไฟล์ PDF
                        </a>
                      </iframe>
                    </div>
                  </div>
                )}

                {/* Document file message */}
                {fileType === 'doc' && (selectedFile || formData.toc_file) && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ไฟล์ .doc/.docx ไม่สามารถแสดงตัวอย่างได้ กรุณาคลิกปุ่มบันทึกเพื่ออัพโหลดไฟล์
                    </p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="เวอร์ชัน"
                  name="version"
                  type="text"
                  placeholder="กรอกเวอร์ชัน"
                  value={props.values.version}
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  error={props.errors.version}
                  touched={props.touched.version}
                />
              </div>

              <div className="md:col-span-2">
                <SelectField
                  label="สถานะ"
                  id="is_active"
                  name="is_active"
                  placeholder="กรุณาเลือก"
                  options={[
                    {
                      value: true,
                      label: 'เปิดใช้งาน'
                    },
                    {
                      value: false,
                      label: 'ปิดใช้งาน'
                    }
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button type="submit" className="btn btn-primary" disabled={updateLoading || isUploading}>
                {updateLoading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default SettingToc
