import { boolean } from 'yup';
import InputGenerateField from '../../../../components/HOC/InputGenerateField';
import { convertDateDbToClient, convertDateTimeDbToClient } from '../../../../helpers/formatDate';
import { useState } from 'react';
import { useGlobalErrorMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';
import { showNotification } from '../../../../helpers/showNotification';
import { Form, Formik } from 'formik';

interface PropsReceipt {
    reference?: string;
    image_url?: string;
    created_at?: Date;
    customer_name?: string;
    contract_receive_product?: any;
    onSubmit: () => void;
    isLoading?: any;
    formData?:any
}
const ReceiptProductPreview = ({formData, reference, image_url, customer_name, created_at, contract_receive_product, onSubmit, isLoading }: PropsReceipt) => {
    return (
        <div className="flex items-center flex-col gap-3 border border-white-light rounded-md mt-6 p-4">
            <h1 className="text-lg font-bold">ยืนยันรับสินค้า</h1>
            <Formik initialValues={formData} onSubmit={() => {}} enableReinitialize>
                <Form className='w-full'>
                    <div className="flex flex-col gap-2">
                        <InputGenerateField
                            onGenerate={onSubmit}
                            loading={isLoading}
                            showStatus={contract_receive_product}
                            label="ลิงก์ยืนยันรับสินค้าสำหรับลูกค้า"
                            name="receive_product_link"
                            className="form-textarea ltr:rounded-l-none rtl:rounded-r-none resize-none"
                            disabled={true}
                            copy={true}
                        />
                    </div>
                </Form>
            </Formik>
            {contract_receive_product && (
                <>
                    <img className="w-1/2 border rounded-xl" src={image_url} alt="" />
                    <p>
                        ลูกค้า {customer_name} ได้ยืนยันการรับสินค้าเลขที่สัญญา {reference} เมื่อวันที่ {convertDateTimeDbToClient(created_at)} พร้อมอัปโหลดภาพยืนยันการรับสินค้าแล้ว
                        ถือว่าส่งมอบสมบูรณ์
                    </p>
                </>
            )}
        </div>
    );
};

export default ReceiptProductPreview;
