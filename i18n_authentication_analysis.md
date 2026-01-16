# i18n Authentication Module Analysis

## Date: January 16, 2026

## Overview
Analysis of 14 Authentication module files for i18n internationalization implementation.

---

## FILES ANALYZED

### Login Files (6 files)
1. **Login.tsx** - Admin login (Thai text)
2. **LoginBoxed.tsx** - Boxed layout login (English text)
3. **LoginBusiness.tsx** - Business unit login (Thai text)
4. **LoginCover.tsx** - Cover layout login (English text)
5. **LoginCustomer.tsx** - Customer login (Thai text)
6. **LoginShop.tsx** - Shop login (Thai text)

### Register Files (4 files)
7. **Register.tsx** - Shop registration form (Thai text)
8. **RegisterBoxed.tsx** - Boxed layout registration (English text)
9. **RegisterCover.tsx** - Cover layout registration (English text)

### Recovery/Unlock Files (4 files)
10. **RecoverIdBox.tsx** - Password recovery boxed (English text)
11. **RecoverIdCover.tsx** - Password recovery cover (English text)
12. **UnlockBox.tsx** - Unlock screen boxed (English text)
13. **UnlockCover.tsx** - Unlock screen cover (English text)

### Menu Files (1 file)
14. **MenuSystem.tsx** - System selection menu (Thai/English mixed)

---

## CURRENT STATE ANALYSIS

### Files Already in English (No i18n needed for EN)
- LoginBoxed.tsx
- LoginCover.tsx
- RegisterBoxed.tsx
- RegisterCover.tsx
- RecoverIdBox.tsx
- RecoverIdCover.tsx
- UnlockBox.tsx
- UnlockCover.tsx

### Files in Thai (Need full i18n)
- Login.tsx
- LoginBusiness.tsx
- LoginCustomer.tsx
- LoginShop.tsx
- Register.tsx
- MenuSystem.tsx

---

## TRANSLATION KEYS NEEDED

### Common Login Keys
```json
{
  "login": "Login",
  "sign_in": "Sign In",
  "sign_up": "Sign Up",
  "email": "Email",
  "password": "Password",
  "username": "Username",
  "phone_number": "Phone Number",
  "remember_me": "Remember Me",
  "remember_password": "Remember Password",
  "enter_email": "Enter Email",
  "enter_password": "Enter Password",
  "enter_username": "Enter Username",
  "enter_phone": "Enter Phone Number",
  "login_button": "Login",
  "sign_in_button": "Sign In",
  "sign_up_button": "Sign Up",
  "use_email_password": "Use email and password to login",
  "use_username_password": "Use username and password to login",
  "use_phone_password": "Use phone number and password to login",
  "please_enter_email_password": "Please enter email and password!",
  "please_enter_username_password": "Please enter username and password!",
  "please_enter_phone_password": "Please enter phone number and password!",
  "incorrect_credentials": "Incorrect credentials, please try again!",
  "dont_have_account": "Don't have an account?",
  "already_have_account": "Already have an account?",
  "for_customer": "For Customer?",
  "register_shop_account": "Register Shop Account"
}
```

### Register Keys
```json
{
  "register_shop": "Register Shop",
  "shop_registration": "Shop Registration",
  "fill_complete_info": "Fill in complete information",
  "shop_name": "Shop Name",
  "shop_group": "Shop Group",
  "business_unit": "Business Unit",
  "confirm_password": "Confirm Password",
  "main_contact_name": "Main Contact Name",
  "shop_phone": "Shop Phone",
  "line_id": "Line ID",
  "facebook_id": "Facebook ID",
  "website": "Website",
  "address": "Address",
  "province": "Province",
  "shop_bank_account": "Shop Bank Account",
  "latitude": "Latitude",
  "longitude": "Longitude",
  "add": "Add",
  "please_select": "Please Select",
  "enter_data": "Enter Data",
  "password_mismatch": "Passwords do not match",
  "registration_successful": "Registration successful, please wait for staff approval",
  "invalid_email": "Please enter a valid email"
}
```

### Recovery/Unlock Keys
```json
{
  "password_reset": "Password Reset",
  "recover_id": "Recover ID",
  "enter_email_recover": "Enter your email to recover your ID",
  "recover": "RECOVER",
  "unlock": "UNLOCK",
  "enter_password_unlock": "Enter your password to unlock your ID"
}
```

### Menu System Keys
```json
{
  "select_system": "Please select the system you want to use",
  "tms_system": "TMS System",
  "pawn_system": "Pawn System",
  "logout": "Logout"
}
```

### Common Keys
```json
{
  "or": "or",
  "subscribe_newsletter": "Subscribe to weekly newsletter",
  "loading": "Loading..."
}
```

---

## IMPLEMENTATION PRIORITY

### HIGH PRIORITY (Active Login Pages)
1. ✅ Login.tsx - Main admin login
2. ✅ LoginBusiness.tsx - Business unit login
3. ✅ LoginCustomer.tsx - Customer login
4. ✅ LoginShop.tsx - Shop login
5. ✅ MenuSystem.tsx - System selection

### MEDIUM PRIORITY (Registration)
6. ⏳ Register.tsx - Shop registration

### LOW PRIORITY (Template/Demo Pages)
7-14. LoginBoxed, LoginCover, RegisterBoxed, RegisterCover, RecoverIdBox, RecoverIdCover, UnlockBox, UnlockCover
- These appear to be template/demo pages with English text
- May not be actively used in production
- Can be implemented if needed

---

## RECOMMENDATION

**Focus on HIGH PRIORITY files first** as these are the actively used authentication pages:
- Login.tsx (Admin)
- LoginBusiness.tsx (Business Unit)
- LoginCustomer.tsx (Customer)
- LoginShop.tsx (Shop)
- MenuSystem.tsx (System Selection)
- Register.tsx (Shop Registration)

The template pages (Boxed/Cover variants) can be implemented later if they are actually used in production.

---

## ESTIMATED EFFORT

- **High Priority Files**: 6 files × 15 minutes = 90 minutes
- **Translation Keys**: 60+ keys to add to 3 language files = 30 minutes
- **Testing & Verification**: 30 minutes

**Total Estimated Time**: ~2.5 hours

---

## NOTES

- All login pages follow similar patterns
- Most validation messages are already using toast notifications
- Page titles use `dispatch(setPageTitle())` which needs i18n
- Form labels and placeholders need translation
- Button text needs translation
- Error/success messages need translation
- Some files have mixed Thai/English text that needs standardization
