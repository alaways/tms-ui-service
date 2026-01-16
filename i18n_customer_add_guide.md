# i18n Translation Guide - Customer/Add.tsx

## File Information
- **File**: `src/pages/Apps/Customer/Add.tsx`
- **Size**: 1214 lines
- **Complexity**: High - Large form with multiple sections, validation, image upload, OCR functionality

## Status
⚠️ **PENDING IMPLEMENTATION** - Due to file size and complexity, this requires careful implementation

## Required Translation Keys

### Page & Navigation
```typescript
"add_customer": "Add Customer" / "เพิ่มข้อมูลลูกค้า" / "添加客户"
"customer": "Customer" / "ลูกค้า" / "客户"
"add": "Add" / "เพิ่ม" / "添加"
```

### Form Labels - Basic Information
```typescript
"title": "Title" / "คำนำหน้า" / "称谓"
"name": "Name" / "ชื่อ" / "姓名"
"citizen_id": "Citizen ID" / "เลขบัตรประชาชน" / "身份证号"
"phone_number": "Phone Number" / "เบอร์โทรศัพท์" / "电话号码"
"phone_number_ref": "Reference Phone" / "เบอร์โทรศัพท์อ้างอิง" / "参考电话"
"line_id": "Line ID" / "Line ID" / "Line ID"
"facebook_id": "Facebook ID" / "Facebook ID" / "Facebook ID"
"email": "Email" / "อีเมล" / "电子邮件"
"tiktok_id": "TikTok ID" / "TikTok ID" / "TikTok ID"
"instagram_id": "Instagram ID" / "Instagram ID" / "Instagram ID"
```

### Address Fields
```typescript
"address": "Address" / "ที่อยู่" / "地址"
"province": "Province" / "จังหวัด" / "省份"
"district": "District" / "อำเภอ" / "区"
"subdistrict": "Subdistrict" / "ตำบล" / "街道"
"zip_code": "Zip Code" / "รหัสไปรษณีย์" / "邮政编码"
"current_address": "Current Address" / "ที่อยู่ปัจจุบัน" / "当前地址"
"work_address": "Work Address" / "ที่อยู่ที่ทำงาน" / "工作地址"
"copy_address": "Copy Address" / "คัดลอกที่อยู่" / "复制地址"
```

### Images & Documents
```typescript
"citizen_image": "Citizen ID Image" / "รูปบัตรประชาชน" / "身份证图片"
"verification_image": "Verification Image" / "รูปภาพยืนยันบุคคล" / "验证图片"
"upload_image": "Upload Image" / "อัปโหลดรูปภาพ" / "上传图片"
"select_file": "Choose file..." / "เลือกไฟล์..." / "选择文件..."
```

### Buttons & Actions
```typescript
"save": "Save" / "บันทึก" / "保存"
"cancel": "Cancel" / "ยกเลิก" / "取消"
"search": "Search" / "ค้นหา" / "搜索"
"ocr_scan": "OCR Scan" / "สแกน OCR" / "OCR扫描"
```

### Validation Messages
```typescript
"please_fill_all_fields": "Please fill in all required fields" / "กรุณาใส่ข้อมูลให้ครบ" / "请填写所有必填字段"
"phone_10_digits": "Please enter 10 digits" / "กรุณาใส่ข้อมูลให้ครบ 10 เลข" / "请输入10位数字"
"citizen_id_13_digits": "Please enter 13 digits" / "กรุณาใส่ข้อมูลให้ครบ 13 หลัก" / "请输入13位数字"
"email_english_only": "Please use English letters, numbers, and symbols (. _ @) only" / "กรุณาใช้ตัวอักษรภาษาอังกฤษ ตัวเลข เครื่องหมายมหัพภาค(.) _ และ @ เท่านั้น" / "请仅使用英文字母、数字和符号（. _ @）"
"invalid_email": "Please enter a valid email" / "กรุณาใส่อีเมลที่ถูกต้อง" / "请输入有效的电子邮件"
```

### Success/Error Messages
```typescript
"save_success": "Saved successfully" / "บันทึกสำเร็จ" / "保存成功"
"citizen_image_not_found": "Citizen ID image not found" / "ไม่พบข้อมูลรูปบัตรประชาชน" / "未找到身份证图片"
"verification_image_not_found": "Verification image not found" / "ไม่พบข้อมูลรูปภาพยืนยันบุคคล" / "未找到验证图片"
```

### Other Fields
```typescript
"shop": "Shop" / "ร้านค้า" / "店铺"
"credit_level": "Credit Level" / "ระดับเครดิต" / "信用等级"
"approval_status": "Approval Status" / "สถานะการอนุมัติ" / "审批状态"
```

## Implementation Steps

### 1. Add Translation Keys
Add all the above keys to:
- `public/locales/en/translation.json`
- `public/locales/th/translation.json`
- `public/locales/zh/translation.json`

### 2. Import useTranslation Hook
```typescript
import { useTranslation } from 'react-i18next';

const Add = () => {
  const { t } = useTranslation();
  // ... rest of code
}
```

### 3. Update Page Title
```typescript
useEffect(() => {
  dispatch(setPageTitle(t('add_customer')))
})
```

### 4. Update Breadcrumbs
```typescript
const breadcrumbItems = [
  { to: '/apps/customer/list', label: t('customer') },
  { label: t('add'), isCurrent: true },
]
```

### 5. Update Validation Schema
Replace all hardcoded Thai validation messages with `t()` calls:
```typescript
const SubmittedForm = Yup.object().shape({
  title: Yup.string().required(t('please_fill_all_fields')),
  name: Yup.string().required(t('please_fill_all_fields')),
  phone_number: Yup.string().length(10, t('phone_10_digits')),
  citizen_id: Yup.string()
    .required(t('please_fill_all_fields'))
    .length(13, t('citizen_id_13_digits')),
  email: Yup.string()
    .required(t('please_fill_all_fields'))
    .matches(/^[A-Za-z0-9@._]+$/, t('email_english_only'))
    .email(t('invalid_email')),
  // ... continue for all fields
})
```

### 6. Update Toast Messages
```typescript
toast.fire({
  icon: 'success',
  title: t('save_success'),
  padding: '10px 20px',
})

toast.fire({
  icon: 'warning',
  title: t('citizen_image_not_found'),
  padding: '10px 20px',
})
```

### 7. Update Form Labels
Replace all hardcoded labels in InputField and SelectField components:
```typescript
<InputField
  label={t('name')}
  name="name"
  // ... other props
/>

<SelectField
  label={t('province')}
  name="id_province"
  // ... other props
/>
```

### 8. Update Button Labels
```typescript
<button type="submit" className="btn btn-primary">
  {t('save')}
</button>

<button type="button" className="btn btn-outline-danger">
  {t('cancel')}
</button>
```

## Sections to Update

### Main Form Sections
1. **Basic Information** (Lines ~540-650)
   - Title, Name, Citizen ID
   - Phone numbers
   - Email, Line ID, Facebook ID, etc.

2. **ID Card Address** (Lines ~650-750)
   - Address, Province, District, Subdistrict, Zip Code

3. **Current Address** (Lines ~750-850)
   - Current address fields
   - Copy address checkbox

4. **Work Address** (Lines ~850-950)
   - Work address fields

5. **Images** (Lines ~950-1100)
   - Citizen ID image upload
   - Verification image upload
   - OCR functionality

6. **Additional Information** (Lines ~1100-1200)
   - Shop selection
   - Credit level
   - Approval status

## Testing Checklist

- [ ] Page title translates correctly
- [ ] Breadcrumbs translate correctly
- [ ] All form labels translate
- [ ] All validation messages translate
- [ ] Success/error toasts translate
- [ ] Button labels translate
- [ ] Placeholder texts translate
- [ ] Language switching works smoothly
- [ ] Form submission works in all languages
- [ ] OCR functionality still works
- [ ] Image upload still works

## Notes

- This is a complex form with ~100+ translatable strings
- The file uses Formik for form management
- OCR functionality reads Thai ID cards
- Multiple address sections (ID card, current, work)
- Image upload with preview functionality
- Province/District/Subdistrict cascading dropdowns
- Requires careful testing after implementation

## Estimated Effort

- **Translation Keys**: ~60-80 keys
- **Code Changes**: ~150-200 locations
- **Testing Time**: 2-3 hours
- **Total Effort**: 4-6 hours

## Recommendation

Due to the complexity and size of this file, consider:
1. Implementing in phases (one section at a time)
2. Testing each section before moving to the next
3. Creating a separate branch for this work
4. Having thorough QA testing before merging
