# i18n Translation Implementation - Customer/AddV2.tsx

## Status: ✅ COMPLETED

## Implementation Date
January 15, 2026

## File Information
- **File**: `src/pages/Apps/Customer/AddV2.tsx`
- **Lines**: 1232 lines
- **Complexity**: High - Large form with multiple sections, validation, image upload, OCR functionality, and Camera OCR feature

## Key Differences from Add.tsx
AddV2.tsx includes all features from Add.tsx PLUS:
- **CameraOCR Component**: Allows users to take photos directly using device camera
- **Take Photo Button** (`ถ่ายรูป`): New button to activate camera for ID card scanning
- **Camera State Management**: `isCameraOcr` state to toggle camera view
- **handleCameraSubmit**: Function to handle camera photo submission

## Changes Made

### 1. Import Statement
Added `useTranslation` hook from 'react-i18next':
```typescript
import { useTranslation } from 'react-i18next'
```

### 2. Translation Hook Initialization
```typescript
const { t } = useTranslation()
```

### 3. Page Title & Breadcrumbs
- Updated page title: `dispatch(setPageTitle(t('add_customer')))`
- Updated breadcrumbs:
  - Customer: `t('customer')`
  - Add: `t('add')`

### 4. Validation Schema (Yup)
Updated all validation messages in `SubmittedForm` and `SubmittedFormCitizen`:
- `t('please_fill_all_fields')` - for required fields
- `t('phone_10_digits')` - for phone number validation
- `t('citizen_id_13_digits')` - for citizen ID validation
- `t('email_english_only')` - for email character validation
- `t('invalid_email')` - for email format validation

### 5. Toast Messages
Updated all Swal toast messages:
- `t('save_success')` - save success message
- `t('cannot_read_citizen_id')` - OCR error message
- `t('citizen_id_not_found')` - citizen image not found
- `t('verification_image_not_found')` - verification image not found
- `t('citizen_id_search_required')` - search validation message

### 6. Form Labels - Personal Information Section
- `t('citizen_id_label')` - Citizen ID Number
- `t('check')` - Check button
- `t('personal_information')` - Section header
- `t('shop')` - Shop field
- `t('title')` - Title field
- `t('name_surname')` - Name-Surname field
- `t('phone_contact')` - Contact phone
- `t('phone_reference')` - Reference phone
- `t('facebook_id')` - Facebook ID
- `t('line_id')` - Line ID
- `t('tiktok_id')` - TikTok ID
- `t('instagram_id')` - Instagram ID
- `t('email')` - Email field
- `t('please_select')` - Placeholder text

### 7. Form Labels - Address Section
- `t('address_information')` - Section header
- `t('id_card_address')` - ID card address section
- `t('current_address')` - Current address section
- `t('work_address')` - Work address section
- `t('address_label')` - Address field
- `t('province')` - Province field
- `t('district_label')` - District field
- `t('subdistrict_label')` - Subdistrict field
- `t('zip_code')` - Zip code field
- `t('same_as_id_card')` - Checkbox label

### 8. Form Labels - Credit & Images
- `t('credit_level_shop')` - Credit level (Shop)
- `t('citizen_image')` - Citizen ID image
- `t('verification_image')` - Verification image
- `t('select_file')` - File selection button
- `t('verify_citizen_id')` - Verify button
- **`t('take_photo')`** - Take photo button (NEW in V2)

### 9. Form Submission
- `t('customer_account')` - Form header
- `t('add_to_shop')` - Add to shop button (existing customer)
- `t('add_data')` - Add data button (new customer)

### 10. Modal Content
- `t('citizen_id_data')` - Modal title
- `t('citizen_id_label')` - Citizen ID label
- `t('name_surname_label')` - Name label
- `t('address_detail')` - Address label
- `t('subdistrict')` - Subdistrict label
- `t('district')` - District label
- `t('province')` - Province label
- `t('cancel')` - Cancel button
- `t('confirm')` - Confirm button

## Translation Keys Added

### New Translation Key for V2
Added 1 new translation key for camera functionality:

#### English (en/translation.json)
```json
"take_photo": "Take Photo"
```

#### Thai (th/translation.json)
```json
"take_photo": "ถ่ายรูป"
```

#### Chinese (zh/translation.json)
```json
"take_photo": "拍照"
```

### Reused Translation Keys
All other translation keys (40+) were already added for Add.tsx and are reused in AddV2.tsx:
- `add_customer`, `citizen_id`, `citizen_id_label`, `check`
- `citizen_image`, `verification_image`, `select_file`, `verify_citizen_id`
- `personal_information`, `title`, `name_surname`, `phone_contact`, `phone_reference`
- `facebook_id`, `tiktok_id`, `instagram_id`
- `address_information`, `id_card_address`, `current_address`, `work_address`
- `address_label`, `district_label`, `subdistrict_label`
- `credit_level_shop`, `customer_account`, `add_to_shop`, `add_data`
- `citizen_id_data`, `name_surname_label`, `address_detail`, `confirm`
- `cannot_read_citizen_id`, `citizen_id_not_found`, `verification_image_not_found`
- `citizen_id_13_digits`, `phone_10_digits`, `email_english_only`, `invalid_email`
- `citizen_id_search_required`, `same_as_id_card`

## Sections Translated

1. ✅ **Page Title & Breadcrumbs**
2. ✅ **Citizen ID Search Section**
3. ✅ **Citizen ID Image Upload**
4. ✅ **Camera OCR Button** (NEW in V2)
5. ✅ **Personal Information Form**
   - Title, Name, Phone numbers
   - Social media IDs (Facebook, Line, TikTok, Instagram)
   - Email
6. ✅ **Address Sections**
   - ID Card Address
   - Current Address (with checkbox)
   - Work Address (with checkbox)
   - All address fields (Province, District, Subdistrict, Zip Code)
7. ✅ **Credit Level Selection**
8. ✅ **Verification Image Upload**
9. ✅ **Form Submission Buttons**
10. ✅ **OCR Modal Dialog**
11. ✅ **All Validation Messages**
12. ✅ **All Toast Notifications**

## Testing Checklist

- ✅ No TypeScript/compilation errors
- ✅ All hardcoded Thai text replaced with translation keys
- ✅ Translation keys added to all three language files (en/th/zh)
- ✅ Page title translates correctly
- ✅ Breadcrumbs translate correctly
- ✅ All form labels translate
- ✅ All validation messages translate
- ✅ Success/error toasts translate
- ✅ Button labels translate (including new "Take Photo" button)
- ✅ Modal content translates
- ✅ Placeholder texts translate
- ✅ Checkbox labels translate

## Files Modified

1. `src/pages/Apps/Customer/AddV2.tsx` - Main component file
2. `public/locales/en/translation.json` - English translations (added "take_photo")
3. `public/locales/th/translation.json` - Thai translations (added "take_photo")
4. `public/locales/zh/translation.json` - Chinese translations (added "take_photo")

## Notes

- This implementation builds upon the Add.tsx i18n work
- All OCR functionality preserved and working
- Camera OCR functionality preserved and working
- Image upload functionality preserved
- Province/District/Subdistrict cascading dropdowns preserved
- Form validation with Yup schema fully translated
- All toast notifications (success, warning, error) translated
- Modal dialog for OCR results fully translated
- Checkbox labels for address copying fully translated

## V2-Specific Features

### Camera OCR Integration
The AddV2 component includes a camera feature that allows users to:
1. Click the "Take Photo" button (`t('take_photo')`)
2. Use device camera to capture ID card image
3. Automatically process the image with OCR
4. Fill form fields with extracted data

The camera functionality is managed through:
- `isCameraOcr` state: Controls camera view visibility
- `setIsCameraOcr(true)`: Opens camera interface
- `handleCameraSubmit`: Processes captured image
- `CameraOCR` component: Renders camera interface

## Language Support

The component now fully supports three languages:
- 🇬🇧 English (en)
- 🇹🇭 Thai (th)
- 🇨🇳 Chinese (zh)

Users can switch between languages using the language selector, and all text in the Customer/AddV2 form will update accordingly, including the new camera feature button.

## Implementation Complete ✅

The Customer/AddV2 component is now fully internationalized with camera OCR support and ready for multi-language use!
