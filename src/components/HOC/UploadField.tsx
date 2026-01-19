import { useField } from 'formik';
import themeInit from '../../theme.init';
import { resizeImage } from '../../helpers/helpFunction';
import { showNotification } from '../../helpers/showNotification';
import IconCopy from '../Icon/IconCopy';

interface UploadFieldProps {
    onFileSelect?: (file: File) => void;
    label: string;
    name: string;
    disabled?: boolean;
}

const UploadField: React.FC<UploadFieldProps> = ({ onFileSelect, label, name, ...props }) => {
    const [field, meta, helpers] = useField(name);
    const { setValue } = helpers;

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const blobUrl = URL.createObjectURL(file);
            const convertFile = [{ dataURL: blobUrl, file: file }];

            if (convertFile[0].file.type == 'image/png' || convertFile[0].file.type == 'image/jpeg') {
                const resizedImages: any = await resizeImage(convertFile);
                setValue(resizedImages);
            } else {
                setValue(convertFile);
            }
        }
    };

    const onClickCopy = () => {
        if (props.disabled) {
            const textToCopy = typeof field.value === 'string' ? field.value : field.value?.[0]?.file?.name;

            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
                showNotification('copy ข้อความแล้ว', 'success');
            }
        }
    };

    return (
        <div className="flex-1">
            <label className="mb-[5px]">{label}</label>
            <div className="flex items-center justify-center">
                <label
                    className={`${
                        props.disabled ? 'bg-[#eee]' : 'cursor-pointer hover:border-[#5f68af]'
                    } relative form-input w-full h-10 flex flex-col items-start justify-start border rounded-lg cursor-pointer mb-0 overflow-hidden`}
                >
                    <span className="text-gray-500 w-[95%] break-all whitespace-normal" title={typeof field.value === 'string' ? field.value : undefined}>
                        {field.value ? field.value[0]?.file?.name || field.value : 'Click to upload'}
                    </span>
                    <input type="file" disabled={props.disabled} className="hidden" onChange={handleFileChange} />
                    <span onClick={onClickCopy}>
                        <IconCopy className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white-dark hover:text-primary" />
                    </span>
                </label>
            </div>
        </div>
    );
};

export default UploadField;
