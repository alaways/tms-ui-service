import { boolean } from 'yup';
import InputGenerateField from '../../../../components/HOC/InputGenerateField';
import { convertDateDbToClient, convertDateTimeDbToClient } from '../../../../helpers/formatDate';
import { useState } from 'react';
import { Form, Formik } from 'formik';
import Lightbox from 'react-18-image-lightbox';

interface PropsReceipt {
    reference?: string;
    image_url?: string;
    created_at?: Date;
    customer_name?: string;
    contract_receive_product?: any;
    onSubmit: () => void;
    onCancel?: () => void;
    isLoading?: any;
    formData?: any;
}
const ReceiptProductPreviewNew = ({ formData, reference, image_url, customer_name, created_at, contract_receive_product, onSubmit, isLoading, onCancel }: PropsReceipt) => {
    const [isOpen,setIsOpen] = useState<boolean>(false)

    return (
        <div className="flex flex-col items-center gap-2">
            {(contract_receive_product && formData.status_id < 5) && (
                <div className='w-full flex justify-end'>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn bg-red-600 text-white active:scale-98 max-w-45"
                    >
                        ยกเลิกยืนยันรับสินค้า
                    </button>
                </div>
            )}
            <Formik initialValues={formData} onSubmit={() => {}} enableReinitialize>
                <Form className="w-full">
                    <div className="flex flex-col gap-2">
                        <InputGenerateField
                            onGenerate={onSubmit}
                            loading={isLoading}
                            showStatus={contract_receive_product}
                            label="3. ยืนยันรับสินค้า"
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
                    <img onClick={() => setIsOpen(true)} className="w-1/4 border rounded-xl cursor-pointer" src={image_url} alt="" />
                    <p>
                        ลูกค้า {customer_name} ได้ยืนยันการรับสินค้าเลขที่สัญญา {reference} เมื่อวันที่ {convertDateTimeDbToClient(created_at)} พร้อมอัปโหลดภาพยืนยันการรับสินค้าแล้ว
                        ถือว่าส่งมอบสมบูรณ์
                    </p>
                </>
            )}
            {isOpen && (
                <Lightbox mainSrc={image_url ?? ""} onCloseRequest={() => setIsOpen(false)}/>
            )}
        </div>
    );
};

export default ReceiptProductPreviewNew;
