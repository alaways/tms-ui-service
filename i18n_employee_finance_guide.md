# i18n Implementation Guide - Employee & Finance/Payment

## Date: 2026-01-15

## Translation Keys Added

Added 60+ new translation keys to all three language files (en, th, zh) for Employee and Finance/Payment modules.

### New Keys Added:
- `employee_list`, `add_employee_btn`, `edit_employee`, `employee_details`
- `edit`, `details`, `order_number`, `phone_number`
- `active_status`, `active`, `inactive`, `actions`
- `select_all`, `update_status`, `update_data`, `usage_status`, `ok`
- `pin_label`, `pin_length_error`
- `payment_history`, `start_date`, `end_date`
- `payment_status`, `payment_channel`, `operation_status`
- `payment_date`, `operation_date`, `reference_number`
- `installment_number`, `installment_fee`, `late_fee`, `payment_amount`
- `success`, `pending`, `failed`, `channel`, `export`, `no_data`, `total_sum`
- `check_payment`, `check_payment_amount`
- `payment_status_paysolution`, `payment_status_label`
- `amount_label`, `status_label`, `payment_date_label`
- `paid`, `unpaid`, `update_info`, `update_info_success`
- `please_select_date_download`, `please_select_date_search`
- `clear_values`, `showing`, `to`, `of`, `total_pages`
- `role_label`, `access_level_label`

## Files to Update

### 1. src/pages/Apps/Employee/Edit.tsx
**Implementation Steps:**
1. Add `import { useTranslation } from 'react-i18next'`
2. Add `const { t } = useTranslation()` in component
3. Update breadcrumbs: `{ to: '/apps/employee/list', label: t('employee') }`, `{ label: t('edit'), isCurrent: true }`
4. Update page title: `dispatch(setPageTitle(t('edit_employee')))`
5. Update validation schema messages:
   - `t('please_fill_all_fields')`
   - `t('please_enter_valid_email')`
   - `t('password_not_match')`
6. Update form labels:
   - `t('title_prefix')`, `t('employee_name')`, `t('position')`, `t('access_level')`
   - `t('employee_phone')`, `t('business_unit')`, `t('password')`, `t('confirm_password')`
   - `t('active')`, `t('inactive')`, `t('pin_label')`
7. Update toast messages:
   - `t('edit_success')` or `t('save_success')`
   - `t('pin_length_error')`
8. Update button: `t('save')`

### 2. src/pages/Apps/Employee/List.tsx
**Implementation Steps:**
1. Add `import { useTranslation } from 'react-i18next'`
2. Add `const { t } = useTranslation()` in component
3. Update page title: `dispatch(setPageTitle(t('employee_list')))`
4. Update buttons:
   - `t('add_employee_btn')`
   - `t('update_status')`
   - `t('search')`, `t('clear_values')`
5. Update form labels:
   - `t('business_unit')`, `t('search')`
6. Update DataTable columns:
   - `t('order_number')`, `t('employee_name')`, `t('email')`, `t('phone_number')`
   - `t('business_unit')`, `t('position')`, `t('access_level')`
   - `t('active_status')`, `t('actions')`
7. Update status badges:
   - `t('active')`, `t('inactive')`
8. Update pagination text:
   - `t('showing')`, `t('to')`, `t('of')`, `t('total_pages')`
9. Update modal:
   - `t('update_data')`, `t('usage_status')`, `t('ok')`
10. Update toast messages:
    - `t('save_success')`

### 3. src/pages/Apps/Employee/Preview.tsx
**Implementation Steps:**
1. Add `import { useTranslation } from 'react-i18next'`
2. Add `const { t } = useTranslation()` in component
3. Update breadcrumbs: `{ to: '/apps/employee/list', label: t('employee') }`, `{ label: t('details'), isCurrent: true }`
4. Update page title: `dispatch(setPageTitle(t('employee_details')))`
5. Update button: `t('edit')`
6. Update labels:
   - `t('employee_name')`, `t('employee_phone')`, `t('email')`
   - `t('role_label')`, `t('access_level_label')`, `t('business_unit')`

### 4. src/pages/Apps/Finance/Payment/#BusinessUnit.tsx
**Implementation Steps:**
1. Add `import { useTranslation } from 'react-i18next'`
2. Add `const { t } = useTranslation()` in component
3. Update page title: `dispatch(setPageTitle(t('payment_history')))`
4. Update main heading: `t('payment_history')`
5. Update form labels:
   - `t('business_unit')`, `t('payment_status')`, `t('payment_channel')`
   - `t('start_date')`, `t('end_date')`, `t('search')`
   - `t('clear_values')`, `t('export')`
6. Update DataTable columns:
   - `t('order_number')`, `t('contract_number')`, `t('business_unit')`
   - `t('customer_name')`, `t('payment_channel')`, `t('installment_number')`
   - `t('installment_fee')`, `t('late_fee')`, `t('tracking_fee')`
   - `t('unlock_fee')`, `t('discount')`, `t('payment_amount')`
   - `t('payment_status')`, `t('channel')`, `t('payment_date')`
   - `t('reference_number')`, `t('actions')`
7. Update status badges:
   - `t('success')`, `t('pending')`, `t('failed')`
8. Update "no data" message: `t('no_data')`
9. Update total row: `t('total_sum')`, `t('baht')`
10. Update pagination: `t('showing')`, `t('to')`, `t('of')`, `t('total_pages')`
11. Update modal:
    - `t('payment_status_paysolution')`
    - `t('amount_label')`, `t('status_label')`, `t('payment_date_label')`
    - `t('paid')`, `t('unpaid')`, `t('update_info')`
12. Update toast messages:
    - `t('update_info_success')`
    - `t('please_select_date_download')`

### 5. src/pages/Apps/Finance/Payment/Admin.tsx
**Implementation Steps:**
1. Add `import { useTranslation } from 'react-i18next'`
2. Add `const { t } = useTranslation()` in component
3. Update page title: `dispatch(setPageTitle(t('payment_history')))`
4. Update main heading: `t('payment_history')`
5. Update form labels (same as #BusinessUnit.tsx):
   - `t('business_unit')`, `t('payment_status')`, `t('payment_channel')`
   - `t('operation_status')`, `t('payment_date')`, `t('search')`
   - `t('clear_values')`, `t('export')`
6. Update DataTable columns (similar to #BusinessUnit.tsx plus):
   - `t('operation_status')`, `t('operation_date')`
7. Update status badges:
   - `t('success')`, `t('pending')`, `t('failed')`
8. Update "no data" message: `t('no_data')`
9. Update total row: `t('total_sum')`, `t('baht')`
10. Update pagination: `t('showing')`, `t('to')`, `t('of')`, `t('total_pages')`
11. Update modal:
    - `t('payment_status_label')`
    - `t('amount_label')`, `t('status_label')`, `t('payment_date_label')`
    - `t('paid')`, `t('unpaid')`, `t('update_info')`
12. Update toast messages:
    - `t('update_info_success')`
    - `t('please_select_date_download')`
    - `t('please_select_business_unit')`

## Common Patterns

### Import Statement:
```typescript
import { useTranslation } from 'react-i18next'
```

### Hook Usage:
```typescript
const { t } = useTranslation()
```

### Page Title:
```typescript
dispatch(setPageTitle(t('key_name')))
```

### Breadcrumbs:
```typescript
const breadcrumbItems = [
  { to: '/path', label: t('key_name') },
  { label: t('key_name'), isCurrent: true },
]
```

### Form Labels:
```typescript
<InputField label={t('key_name')} ... />
<SelectField label={t('key_name')} ... />
```

### Buttons:
```typescript
<button>{t('key_name')}</button>
```

### Toast Messages:
```typescript
toast.fire({
  icon: 'success',
  title: t('key_name'),
  padding: '10px 20px',
})
```

### DataTable Columns:
```typescript
{
  accessor: 'field',
  title: t('key_name'),
  ...
}
```

### Pagination Text:
```typescript
paginationText={({ from, to, totalRecords }) => (
  `${t('showing')} ${from} ${t('to')} ${to} ${t('of')} ${totalRecords} ${t('total_pages')}`
)}
```

## Verification Steps

After implementing i18n for each file:
1. Run `getDiagnostics` to check for compilation errors
2. Verify all translation keys exist in all three language files
3. Test the UI in all three languages (if possible)
4. Ensure no hardcoded Thai text remains

## Summary

All translation keys have been added to the three language files (en, th, zh). The implementation follows the same patterns used in previous i18n implementations. Each file needs to:
1. Import useTranslation hook
2. Initialize the hook
3. Replace all hardcoded text with t('key_name')
4. Update page titles, breadcrumbs, form labels, buttons, table columns, status badges, and toast messages

The files are ready for i18n implementation following the patterns documented above.
