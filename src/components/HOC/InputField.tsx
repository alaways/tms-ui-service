import { Field, ErrorMessage, useField } from 'formik';

interface InputFieldProps  {
  label: string;
  name: string;
  maxLength?: number;
  [key: string]: any;
  row? :boolean
}

const withInputField = (Component: any) => ({ label, name, placeholder, require = false, hidden = false,row, ...props }: InputFieldProps) => {

  const [field, meta] = useField(name);
  const hasError = meta.touched && meta.error;

  return (
    <div className={`${hidden ? "hidden" : "input-container"} ${row ? 'flex flex-row items-center gap-3':''}`}>
      <label htmlFor={name} className={`${row ? 'mb-0': null}`}>
        { label }
        { require && (<span className="text-rose-600"> * </span>) }
      </label>
      <div className={hasError ? 'relative has-error' : 'relative text-white-dark'}>
        <Component 
          {...props} 
          id={name} 
          name={name} 
          placeholder={!props.disabled ? placeholder ?? 'กรุณาใส่ข้อมูล' : '-'} 
          className={props.disabled ? "form-input disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b]" : "form-input placeholder:text-white-dark"}
          autoComplete="off"
        />
        <ErrorMessage name={name} component="div" className={"text-danger mt-1"} />
      </div>
    </div>
  );

};

const InputField = withInputField(Field);
export default InputField;