# i18n Translation Implementation - Customer/Add.tsx

## Status: ✅ COMPLETED

## Implementation Date
January 15, 2026

## File Information
- **File**: `src/pages/Apps/Customer/Add.tsx`
- **Lines**: 1215 lines
- **Complexity**: High - Large form with multiple sections, validation, image upload, OCR functionality

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
- `t('same_as_id_card')` - Checkbox label (commented out)

### 8. Form Labels - Credit & Images
- `t('credit_level_shop')` - Credit level (Shop)
- `t('citizen_image')` - Citizen ID image
- `t('verification_image')` - Verification image
- `t('select_file')` - File selection button
- `t('verify_citizen_id')` - Verify button

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

### English (en/translation.json)
Added 40+ new translation keys including:
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

### Thai (th/translation.json)
All keys translated to Thai with proper Thai language equivalents.

### Chinese (zh/translation.json)
All keys translated to Simplified Chinese with proper Chinese equivalents.

## Sections Translated

1. ✅ **Page Title & Breadcrumbs**
2. ✅ **Citizen ID Search Section**
3. ✅ **Citizen ID Image Upload**
4. ✅ **Personal Information Form**
   - Title, Name, Phone numbers
   - Social media IDs (Facebook, Line, TikTok, Instagram)
   - Email
5. ✅ **Address Sections**
   - ID Card Address
   - Current Address
   - Work Address
   - All address fields (Province, District, Subdistrict, Zip Code)
6. ✅ **Credit Level Selection**
7. ✅ **Verification Image Upload**
8. ✅ **Form Submission Buttons**
9. ✅ **OCR Modal Dialog**
10. ✅ **All Validation Messages**
11. ✅ **All Toast Notifications**

## Testing Checklist

- ✅ No TypeScript/compilation errors
- ✅ All hardcoded Thai text replaced with translation keys
- ✅ Translation keys added to all three language files (en/th/zh)
- ✅ Page title translates correctly
- ✅ Breadcrumbs translate correctly
- ✅ All form labels translate
- ✅ All validation messages translate
- ✅ Success/error toasts translate
- ✅ Button labels translate
- ✅ Modal content translates
- ✅ Placeholder texts translate

## Files Modified

1. `src/pages/Apps/Customer/Add.tsx` - Main component file
2. `public/locales/en/translation.json` - English translations
3. `public/locales/th/translation.json` - Thai translations
4. `public/locales/zh/translation.json` - Chinese translations

## Notes

- This was a complex implementation due to the file size (1215 lines) and multiple form sections
- All OCR functionality preserved and working
- Image upload functionality preserved
- Province/District/Subdistrict cascading dropdowns preserved
- Form validation with Yup schema fully translated
- All toast notifications (success, warning, error) translated
- Modal dialog for OCR results fully translated

## Language Support

The component now fully supports three languages:
- 🇬🇧 English (en)
- 🇹🇭 Thai (th)
- 🇨🇳 Chinese (zh)

Users can switch between languages using the language selector, and all text in the Customer/Add form will update accordingly.

## Implementation Complete ✅

The Customer/Add component is now fully internationalized and ready for multi-language support!
