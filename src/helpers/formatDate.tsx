import moment from 'moment'

// 日期格式: 26/08/2567
const getDateTH = (dateString: string = '') => {
  if (dateString.split('T').length !== 2) { return dateString }
  const dateThai = dateString.split('T')[0]
  const day = String(dateThai.split('-')[2]).padStart(2, '0')
  const month = String(dateThai.split('-')[1]).padStart(2, '0')
  const year = parseInt(dateThai.split('-')[0]) + 543
  return `${day}/${month}/${year}`
}

// 时间格式: 16:40:52
const getTime = (dateString: string = '') => {
  if (dateString.split('T').length !== 2) { return dateString }
  let timeThai = dateString.split('T')[1]
  if (timeThai.split('.').length === 2) { timeThai = timeThai.split('.')[0] }
  timeThai = timeThai.replace(/z$/i, ''); // 删除末尾的 "z" (如果有)
  const hours = String(timeThai.split(':')[0]).padStart(2, '0')
  const min = String(timeThai.split(':')[1]).padStart(2, '0')
  const sec = String(timeThai.split(':')[2]).padStart(2, '0')
  return `${hours}:${min}:${sec}`
}

// 转换为英文日期格式: 2024-08-26
const getDateEN = (dateString: string = '') => {
  if (dateString.split('T').length !== 2) { return dateString }
  const dateThai = dateString.split('T')[0]
  const day = String(dateThai.split('-')[2]).padStart(2, '0')
  const month = String(dateThai.split('-')[1]).padStart(2, '0')
  const year = parseInt(dateThai.split('-')[0])
  return `${year}-${month}-${day}`
}

// 将数据库日期时间转换为客户端格式: 2024-09-02T16:40:52.000Z -> 02/09/2567
export const convertDateDbToClient = (date: any) => {
  if (typeof date === 'string' && date !== null && date !== '') {
    return getDateTH(date)
  }
  return ''
}

// 将数据库日期时间转换为客户端格式（含时间）: 2024-09-02T16:40:52.000Z -> 02/09/2567 16:40:52
export const convertDateTimeDbToClient = (date: any) => {
  if (typeof date === 'string' && date !== null && date !== '') {
    return `${getDateTH(date)} ${getTime(date)}`
  }
  return ''
}

// 将数据库日期时间转换为客户端格式（时间在前）: 2024-09-02T16:40:52.000Z -> 16:40:52 02/09/2567
export const convertTimeDateDbToClient = (date: any) => {
  if (typeof date === 'string' && date !== null && date !== '') {
    return `${getTime(date)} ${getDateTH(date)}`
  }
  return ''
}

// 将客户端日期转换为数据库格式: 2024-09-02T16:40:52.000Z -> 2024-09-02 或 new Date('2024-09-02') -> 2024-09-02
export const convertDateClientToDb = (date: any) => {
  if (typeof date === 'string' && date !== null && date !== '') {
    return getDateEN(date)
  }
  if (typeof date === 'object' && date !== null && date.length === 1) {
    const day = String(date[0].getDate()).padStart(2, '0')
    const month = String(date[0].getMonth() + 1).padStart(2, '0')
    const year = parseInt(date[0].getFullYear())
    return `${year}-${month}-${day}`
  }
  return ''
}

export const convertDateTimeOnUTC = (date: any) => {
  if (typeof date === 'object' && date !== null && date.length === 1) {
    const isoString = moment.tz(date[0], 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)', 'Asia/Bangkok').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    return isoString
  }
  return ''
}

export const convertDateTimeToApiByBangkok = (date: any) => {
  if (typeof date === 'string' && date !== null && date !== '') {
    const bangkokTime = moment.tz(date, 'UTC')
      .tz('Asia/Bangkok')
      .format('YYYY-MM-DD HH:mm');
    return bangkokTime
  }
  return ''
}

export const convertToISO = (date: any) => {
  // 将日期时间转换为 UTC 时区下的 ISO 8601 格式
  const isoTime = moment.tz(date, "YYYY-MM-DD HH:mm", "Asia/Bangkok") // 设置时区为 Asia/Bangkok
    .utc() // 转换为 UTC
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"); // 转换为 ISO 8601 格式

  return isoTime
};

// 将日期转换为泰国佛历日期格式: 2025-05-20 -> 20/05/2568
export function toThaiDate(input:any) {
  const date = new Date(input);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份基数为 0
  const year = date.getFullYear() + 543; // 转换为泰国佛历年份

  return `${day}/${month}/${year}`;
}
