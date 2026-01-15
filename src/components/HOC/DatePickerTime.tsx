import React, { useState, useEffect } from 'react';

import Flatpickr from 'react-flatpickr';
import * as moment from 'moment-timezone'

import { Field, ErrorMessage, useField, useFormikContext } from 'formik';

import 'flatpickr/dist/flatpickr.css';

const withInputField = (Component: any) => ({ label, name, placeholder, require = false, ...props }: any) => {

  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched, values } = useFormikContext();

  const [date, setDate] = useState<Date | null>(field.value || null);
  const hasError = meta.touched && meta.error;

  useEffect(() => {
    setFieldValue(name, date);
    setFieldTouched(name, true);
  }, [date, setFieldValue, setFieldTouched, name]);

  useEffect(() => {
    setDate(field.value || null);
  }, [field.value]);

  return (
      <div className="input-container">
          <label htmlFor={name}>
              {label}
              {require && <span className="text-rose-600"> * </span>}
          </label>
          <div className={hasError ? 'relative has-error' : 'relative text-white-dark'}>
              <Flatpickr
                  value={date}
                  onChange={(selectedDates) => setDate(selectedDates[0] || null)}
                  placeholder={placeholder ?? 'เลือกวันที่'}
                  className={props.disabled ? 'form-input disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b]' : 'form-input placeholder:text-white-dark'}
                  options={{
                      enableTime: true,
                      dateFormat: 'd/m/Y H:i',
                      time_24hr: true,
                      formatDate: function (date: any, format: any, locale: any) {
                          let newDate = moment.tz(new Date(date), 'Asia/Bangkok')
                                return `${newDate.format('DD/MM')}/${parseInt(newDate.format('YYYY')) + 543} ${newDate.format('HH:mm')}`;
                      },

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
