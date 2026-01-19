import { Field, ErrorMessage, useField } from 'formik';
import IconCopy from '../Icon/IconCopy';
import { showNotification } from '../../helpers/showNotification';

import IconXCircle from '../Icon/IconXCircle';
import IconChecks from '../Icon/IconChecks';

interface InputFieldProps {
    label: string;
    name: string;
    maxLength?: number;
    [key: string]: any;
    row?: boolean;
    copy?: boolean;
    onGenerate?: () => void;
    loading?: boolean;
    showStatus?: boolean;
}

const withInputField =
    (Component: any) =>
    ({ label, name, placeholder, require = false, hidden = false, row, ...props }: InputFieldProps) => {
        const [field, meta] = useField(name);
        const hasError = meta.touched && meta.error;

        const copyValue = () => {
            const textToCopy = field.value;

            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
                showNotification('copy ข้อความแล้ว', 'success');
            }
        };

        return (
            <div className={`${hidden ? 'hidden' : 'input-container'} ${row ? 'flex flex-row items-center gap-3' : ''}`}>
                <label htmlFor={name} className={`${row ? 'mb-0' : null}`}>
                    {label}
                    {require && <span className="text-rose-600"> * </span>}
                </label>
                <div className={hasError ? 'relative has-error' : 'relative text-white-dark'}>
                    <div
                        className={`${
                            props.disabled ? 'bg-[#eee]' : 'hover:border-[#5f68af]'
                        } relative form-input w-full h-10 flex gap-0 pl-0 pr-16 py-0 items-center justify-start border rounded-lg mb-0 overflow-hidden`}
                    >
                        <button
                            type="button"
                            onClick={!props.showStatus ? props.onGenerate : undefined}
                            className={`rounded-l-lg h-full outline-none min-w-32 text-sm text-primary  ${
                                !props.showStatus ? 'bg-dark  hover:underline' : 'bg-gray-300 cursor-default'
                            }  text-white h-full`}
                        >
                            {props.loading && <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>}
                            สร้างลิ้งค์
                        </button>
                        <span className="pl-2 text-black overflow-hidden whitespace-nowrap" title={typeof field.value === 'string' ? field.value : undefined}>
                            {field.value ? field.value[0]?.file?.name || field.value : '-'}
                        </span>
                    </div>
                    {props.showStatus && field.value ? (
                        <IconChecks className="text-green-500 absolute right-10 top-1/2 -translate-y-1/2" />
                    ) : field.value ? (
                        <IconXCircle className="text-red-500 absolute right-10 top-1/2 -translate-y-1/2" />
                    ) : undefined}
                    {props.copy && (
                        <span onClick={copyValue}>
                            <IconCopy className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary" />
                        </span>
                    )}
                    <ErrorMessage name={name} component="div" className={'text-danger mt-1'} />
                </div>
            </div>
        );
    };

const InputGenerateField = withInputField(Field);
export default InputGenerateField;
