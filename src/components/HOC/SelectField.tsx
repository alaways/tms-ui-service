import Select from 'react-select';

import { ErrorMessage, useField, useFormikContext } from 'formik';
import { useMemo } from 'react';
import { debounce, isNull } from 'lodash';
import { useTranslation } from 'react-i18next';

interface SelectFieldProps {
  id: string;
  label?: string;
  name: string;
  options: any[];
  onChange?: (selectedOption: any) => void;
  isSearchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onInputChange?: (inputValue: string) => void;
  handleOnMenuOpen?: (inputValue: string) => void;
  filterOption?: () => true;
  zIndex?: string;
  require?: boolean;
  className?: string;
  isMulti?: boolean
}

const withSelectField = (Component: any) => ({ id, label, name, options, isSearchable = false, require = false, placeholder, disabled, zIndex = '', className = '',isMulti, onInputChange, ...props }: SelectFieldProps) => {

  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  const { t } = useTranslation();

  const hasError = meta.touched && meta.error;

  const handleChange = (selectedOption: any) => {
    const value = isMulti
    ? selectedOption.map((option: any) => option.value)
    : selectedOption ? selectedOption.value : '';
    setFieldValue(name, value);
    if (props.onChange) {
      props.onChange(selectedOption);
    }

    // const value = selectedOption ? selectedOption.value : '';
    // setFieldValue(name, value);
    // if (props.onChange) {
    //   props.onChange(selectedOption);
    // }
  };

  const handleOnMenuOpen = (inputValue: string) => {
    if (props.handleOnMenuOpen) {
      props.handleOnMenuOpen(inputValue);
    }
  };

  const debouncedInputChange = useMemo(
    () =>
      debounce((inputValue: string) => {
        if (onInputChange && inputValue !== "") {
          onInputChange(inputValue);
        }
        // const inputChangeHandler = onInputChange ?? (() => {});
        // if (inputValue !== '') {
        //     inputChangeHandler(inputValue);
        // } else {
        //     inputChangeHandler('');
        // }
      }, 500),
    [onInputChange]
  );

  const componentProps = useMemo(() => {
    const temp: any = {
      ...props,
      id,
      name,
      options,
      value: isMulti
        ? options.filter((option) => field.value?.includes(option.value))
        : options.find((option) => option.value === field.value) || null,
      onChange: handleChange,
      onInputChange: debouncedInputChange,
      onMenuOpen: handleOnMenuOpen,
      isSearchable,
      isMulti,
      placeholder: <div className={hasError ? 'text-danger mt-1' : ''}>{placeholder ?? t('please_select')}</div>,
      className: disabled ? 'form-select bg-[#eee] dark:bg-[#1b2e4b] text-black' : 'form-select',
      isDisabled: disabled,
    };
    return temp;
  }, [field.value, props, hasError, options, isMulti, debouncedInputChange, t]);

  return (
    <div className={`input-container ` + zIndex + ` ${className}`}>
      {label && <label htmlFor={id}>
        { label }
        { require && (<span className="text-rose-600"> * </span>) }
      </label>}
      <div className={hasError ? 'relative has-error' : 'relative text-white-dark'}>
        <Component {...componentProps} />
        <ErrorMessage name={name} component="div" className="text-danger mt-1" />
      </div>
    </div>
  );

};

const SelectField = withSelectField(Select);
export default SelectField;
