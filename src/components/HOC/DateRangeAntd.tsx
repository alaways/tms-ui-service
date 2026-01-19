import React, { useEffect } from 'react';
import { DatePicker, Space } from 'antd';
import { Field, ErrorMessage, useField, useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import dayjs from 'dayjs';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import th from 'antd/es/date-picker/locale/th_TH';
import en from 'antd/es/date-picker/locale/en_US';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import dayTh from 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

const { RangePicker } = DatePicker;

interface DateRangeField {
    name: string;
    label?: string;
    placeholder?: [string, string];
}

const DateRangeAntd = ({ name, label, placeholder }: DateRangeField) => {
    const [field, meta] = useField(name);
    const { setFieldValue, setFieldTouched, values } = useFormikContext();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const onChange = (value: any, date_string: any) => {
        if (value) {
            const formatted = value.map((v: dayjs.Dayjs) => v.locale('en').format('YYYY-MM-DD'));
            setFieldValue(name, formatted);
        } else {
            setFieldValue(name, null);
        }
    };

    dayjs.extend(buddhistEra);

    // 根据当前语言设置 dayjs 语言
    const dayjsLocaleMap: Record<string, string> = {
        zh: 'zh-cn',
        en: 'en',
        th: 'th',
    };
    dayjs.locale(dayjsLocaleMap[themeConfig.locale] || 'en');

    const rangeValue = field.value && Array.isArray(field.value) ? (field.value.map((d: string | null) => (d ? dayjs(d) : null)) as [dayjs.Dayjs | null, dayjs.Dayjs | null]) : null;

    // 根据当前语言选择相应的 locale
    const localeMap: Record<string, any> = {
        th: th,
        en: en,
        zh: zhCN,
    };

    let locale = localeMap[themeConfig.locale] || en;

    // 如果是泰文，使用佛历格式
    if (themeConfig.locale === 'th') {
        locale = {
            ...th,
            lang: {
                ...th.lang,
                fieldDateFormat: 'BBBB-MM-DD',
                fieldDateTimeFormat: 'BBBB-MM-DD HH:mm:ss',
                yearFormat: 'BBBB',
                cellYearFormat: 'BBBB',
            },
        };
    }

    return (
        <div className="flex flex-col flex-1">
            {label && <label>{label}</label>}
            <RangePicker value={rangeValue} {...(placeholder ? { placeholder: placeholder } : {})} className="h-[38px]" name={name} onChange={onChange} locale={locale} />
        </div>
    );
};

export default DateRangeAntd;
