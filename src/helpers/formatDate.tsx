import moment from 'moment'

// TODO: 26/08/2567
const getDateTH = (dateString: string = '') => {
  if (dateString.split('T').length !== 2) { return dateString }
  const dateThai = dateString.split('T')[0]
  const day = String(dateThai.split('-')[2]).padStart(2, '0')
  const month = String(dateThai.split('-')[1]).padStart(2, '0')
  const year = parseInt(dateThai.split('-')[0]) + 543
  return `${day}/${month}/${year}`
}

// TODO: 16:40:52
const getTime = (dateString: string = '') => {
  if (dateString.split('T').length !== 2) { return dateString }
  let timeThai = dateString.split('T')[1]
  if (timeThai.split('.').length === 2) { timeThai = timeThai.split('.')[0] }
  timeThai = timeThai.replace(/z$/i, ''); // ลบ "z" ตัวสุดท้าย (ถ้ามี)
  const hours = String(timeThai.split(':')[0]).padStart(2, '0')
  const min = String(timeThai.split(':')[1]).padStart(2, '0')
  const sec = String(timeThai.split(':')[2]).padStart(2, '0')
  return `${hours}:${min}:${sec}`
}

// TODO: 2024-08-26
const getDateEN = (dateString: string = '') => {
  if (dateString.split('T').length !== 2) { return dateString }
  const dateThai = dateString.split('T')[0]
  const day = String(dateThai.split('-')[2]).padStart(2, '0')
  const month = String(dateThai.split('-')[1]).padStart(2, '0')
  const year = parseInt(dateThai.split('-')[0])
  return `${year}-${month}-${day}`
}

// TODO: 2024-09-02T16:40:52.000Z -> 02/09/2567
export const convertDateDbToClient = (date: any) => {
  if (typeof date === 'string' && date !== null && date !== '') {
    return getDateTH(date)
  }
  return ''
}

// TODO: 2024-09-02T16:40:52.000Z -> 02/09/2567 16:40:52
export const convertDateTimeDbToClient = (date: any) => {
  if (typeof date === 'string' && date !== null && date !== '') {
    return `${getDateTH(date)} ${getTime(date)}`
  }
  return ''
}

// TODO: 2024-09-02T16:40:52.000Z -> 16:40:52 02/09/2567
export const convertTimeDateDbToClient = (date: any) => {
  if (typeof date === 'string' && date !== null && date !== '') {
    return `${getTime(date)} ${getDateTH(date)}`
  }
  return ''
}

// TODO: 2024-09-02T16:40:52.000Z -> 2024-09-02
// TODO: new Date('2024-09-02') -> 2024-09-02
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
  const isoTime = moment.tz(date, "YYYY-MM-DD HH:mm", "Asia/Bangkok") // กำหนด timezone เป็น Asia/Bangkok
    .utc() // แปลงเป็น UTC
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"); // แปลงเป็นรูปแบบ ISO 8601

  return isoTime
};

// 2025-05-20 to 20/05/2568
export function toThaiDate(input:any) {
  const date = new Date(input);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear() + 543; // Convert to Thai Buddhist year

  return `${day}/${month}/${year}`;
}