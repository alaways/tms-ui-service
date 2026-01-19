import React, { useState, useEffect } from 'react';

import Flatpickr from 'react-flatpickr';
import * as moment from 'moment-timezone'

import { Field, ErrorMessage, useField, useFormikContext } from 'formik';

import 'flatpickr/dist/flatpickr.css';

const withInputField = (Component: any) => ({ label, name, placeholder, require = false, enableTime = false, rows = false, isRange = false, ...props }: any) => {

  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched, values } = useFormikContext();
  
  const [date, setDate] = useState<Date | Date[] | null>(field.value || (isRange ? [] : null));
  const hasError = meta.touched && meta.error;

  useEffect(() => {
    if (
      (isRange && JSON.stringify(date) !== JSON.stringify(field.value)) ||
      (!isRange && date !== field.value)
    ) {
      setFieldValue(name, date);
      setFieldTouched(name, true);
    }
  }, [date, setFieldValue, setFieldTouched, name, isRange]);
  
  useEffect(() => {
    if (
      (isRange && JSON.stringify(field.value) !== JSON.stringify(date)) ||
      (!isRange && field.value !== date)
    ) {
      setDate(field.value || (isRange ? [] : null));
    }
  }, [field.value, isRange]);
  

  return (
    <div className={`input-container ${rows ? 'flex flex-row gap-3 items-center' : ''}`}>
      {label && <label htmlFor={name}>
        {label}
        {require && (<span className="text-rose-600"> * </span>)}
      </label>}
      <div className={`${hasError ? 'relative has-error' : 'relative text-white-dark'} ${rows ? 'flex-1' : ''}`}>
        {/* <Flatpickr
          value={date}
          onChange={(selectedDates) => setDate(selectedDates[0] || null)}
          placeholder={placeholder ?? 'เลือกวันที่'}
          className={props.disabled ? "form-input disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b]" : "form-input placeholder:text-white-dark"}
          options={{
            formatDate: function (date: any, format: any, locale: any) {
              let newDate = moment.tz(new Date(date), 'Asia/Bangkok')
              if (enableTime) {
                return `${newDate.format('DD/MM')}/${parseInt(newDate.format('YYYY')) + 543} ${newDate.format('HH:mm')}`;
              }
              return `${newDate.format('DD/MM')}/${parseInt(newDate.format('YYYY')) + 543}`;

            },
          }}
          {...(enableTime ? { 'data-enable-time': true } : {})}
          {...props}
        /> */}
        <Flatpickr
          value={date}
          onChange={(selectedDates) => setDate(isRange ? selectedDates : selectedDates[0] || null)}
          placeholder={placeholder ?? 'เลือกวันที่'}
          className={props.disabled ? "form-input disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b]" : "form-input placeholder:text-white-dark"}
          options={{
            mode: isRange ? "range" : "single",
            enableTime: enableTime,
            formatDate: (date: any) => {
              let newDate = moment.tz(new Date(date), 'Asia/Bangkok');
              if (enableTime) {
                return `${newDate.format('DD/MM')}/${parseInt(newDate.format('YYYY')) + 543} ${newDate.format('HH:mm')}`;
              }
              return `${newDate.format('DD/MM')}/${parseInt(newDate.format('YYYY')) + 543}`;
            }
          }}
          {...props}
        />
        <ErrorMessage name={name} component="div" className="text-danger mt-1" />
      </div>
    </div>
  );

};

const FlatpickrField = withInputField(Field);
export default FlatpickrField;
