export const formatNumeric = (value: string, maxLength: number): string => {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

export const numberCommas = (value: any): string => {
  if (value === undefined || value === null || isNaN(value)) { return '0'}
  if (value === '0') { value = 0 }
  const formatNumber = (num: any) => {
    return Math.floor(num)
  }
  value = formatNumber(value).toString()
  var pattern = /(-?\d+)(\d{3})/
  while (pattern.test(value)) {
    value = value.replace(pattern, '$1,$2')
  }
  return value
}

export const numberWithCommas = (value: any, decimal: number = 2): string => {
  if (value === undefined) { return ((0).toFixed(decimal)) }
  if (value === '0') { value = 0 }
  if (value === '0.00') { value = 0 }
  if (value === '-') { value = 0 }
  const formatNumber = (num: any) => {
    return num ? num.toFixed(decimal) : ((0).toFixed(decimal))
  }
  value = formatNumber(value).toString()
  var pattern = /(-?\d+)(\d{3})/
  while (pattern.test(value))
    value = value?.replace(pattern, "$1,$2")
  return value
}

export const formatIDNumber = (value: any): string => {
  const cleaned = value?.replace(/\D/g, '')
  if (cleaned?.length < 10) {
    return String(value).padStart(13, '0').replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5')
  }
  if (cleaned?.length === 13) {
    return cleaned?.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5')
  } else if (cleaned?.length === 12) {
    return cleaned?.replace(/(\d{1})(\d{4})(\d{5})(\d{2})/, '$1-$2-$3-$4-x')
  } else if (cleaned?.length === 11) {
    return cleaned?.replace(/(\d{1})(\d{4})(\d{5})(\d{1})/, '$1-$2-$3-$4x-x')
  } else if (cleaned?.length === 10) {
    return cleaned?.replace(/(\d{3})(\d{7})(\d{1})/, '$1-$2-$3')
  }
  return value
}

export const formatPhoneNumber = (value: any): string => {
  const cleaned = value?.replace(/\D/g, '')
  if (cleaned?.length < 9) {
    return String(value).padStart(10, '0').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  if (cleaned?.length > 10) {
    value = value.substring(0, 10)
    return String(value).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  if (cleaned?.length === 10) {
    return cleaned?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  } else if (cleaned?.length === 9) {
    return cleaned?.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  return value
}

export const formatBankAccountNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned?.length === 10) {
    return cleaned?.replace(/(\d{3})(\d{1})(\d{5})(\d{1})/, '$1-$2-$3-$4')
  }
  return value
}

export const convertRoundUpNumber = (number: any,type: 'normal' | 'uptozero' = 'uptozero'): number => {
  if(type == 'normal'){
    return +number.toFixed(0)
  }else if(type == 'uptozero'){
    if (isNaN(number)) { return number }
    return Math.round(Math.round(+number / 10) * 10)
  }
  return 0
}