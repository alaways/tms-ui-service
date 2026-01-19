import { useField } from 'formik';
import themeConfig from '../../theme.config';

const Checkbox = ({ label, onCheck, ...props }: any) => {
  const [field, meta, helpers] = useField(props);
  const handleChange = (e: any) => {
    helpers.setValue(e.target.checked);
    if (onCheck) {
      onCheck(e.target.checked);
    }
  };
  return (
    <label className={`flex cursor-pointer items-center ${label && label !== '' ? 'mt-6' : 'mt-1'}`}>
      <input
        type="checkbox"
        {...field}
        {...props}
        checked={field.value}
        onChange={handleChange}
        className={`form-checkbox checked:bg-themePrimary focus:checked:bg-themePrimary checked:hover:bg-themePrimary bg-white dark:bg-black`}
      />
      <span className="text-white-dark">{label}</span>
    </label>
  );
};

export default Checkbox;