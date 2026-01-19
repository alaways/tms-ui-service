import { useEffect, useState } from 'react';
import CameraSqure from '../../../../components/CameraSquare';
import { useGlobalErrorMutation, useGlobalMutation } from '../../../../helpers/globalApi';
import { showNotification } from '../../../../helpers/showNotification';
import { url_api } from '../../../../services/endpoints';
import { useNavigate, useParams } from 'react-router-dom';
import { useUploadCustomerMutation, useUploadMutation } from '../../../../services/mutations/useUploadMutation';
import PreLoading from '../../../../helpers/preLoading';
import ReceiveProductThankyouPage from './ReceiveThankyou';
import CameraReceive from '../../../../components/CameraReceive';
import ReceivePolicy from './receipt-policy';

const AddReceiveProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [idContract, setIdContract] = useState<any>();
    const [contract,setContract] = useState<any>()
    const [statusSuccess, setStatusSuccess] = useState<boolean>(false);
    const [statusPolicy, setStatusPolicy] = useState<boolean>(false);

    const { mutateAsync: findGenerate } = useGlobalErrorMutation(url_api.receiveProductFindoneGenerate, {
        onSuccess: (res: any) => {
            if (res.statusCode == 200) {
                setIdContract(res.data.id_contract);
                setContract(res.data.contract)
            }
        },
        onError: (err: any) => {
            navigate('/customer/timeout');
        },
    });

    const { mutateAsync: createReceiveProduct, isLoading: isLoadingCreate } = useGlobalErrorMutation(url_api.receiveProductCreate, {
        onSuccess: (res: any) => {
            if (res.statusCode == 200) {
                showNotification('อัพโหลดรูปยืนยันรับสินค้าสำเร็จ', 'success');
                setStatusSuccess(true);
            }
        },
        onError: (err: any) => {
            showNotification(err.message, 'error');
        },
    });

    const { mutateAsync: uploadFile, isLoading: isLoadingUpload } = useUploadCustomerMutation({
        onSuccess: (res: any) => {},
        onError: (err: any) => {
            showNotification('พบข้อผิดพลาด !! ระบบไม่สามารถอัพโหลดสลิดไม่สำเร็จ', 'error');
        },
    });

    const onSubmitReceive = async (data: any) => {
        const picture = await uploadFile({
            data: {
                file: data?.file,
                type: 'contract',
            },
        });
        if (picture.statusCode == 200) {
            await createReceiveProduct({ data: { id_contract: idContract, image_url: picture.data.file_name, ref: id } });
        }
    };

    useEffect(() => {
        findGenerate({ id: id });
    }, []);
    
    return (
        <>
            {(isLoadingCreate || isLoadingUpload) && <PreLoading />}
            {statusSuccess ? (
                <ReceiveProductThankyouPage />
            ) : statusPolicy ? (
                <div className="p-5 bg-neutral-500 min-h-screen h-screen">
                    <div className="bg-white rounded-xl pt-4 h-full px-6 flex flex-col justify-start gap-4">
                        <h1 className="text-2xl font-bold text-center">ถ่ายรูปยืนยันรับสินค้า</h1>
                        {idContract ? <CameraReceive onSubmit={onSubmitReceive} onCancel={() => setStatusPolicy(false)} /> : <div className="text-center text-red-500 h-[150px]">กรุณาขอลิงค์จาก Admin ใหม่</div>}
                    </div>
                </div>
            ) : (
                <ReceivePolicy data={contract} onAccept={(data: any) => setStatusPolicy(data)} />
            )}
        </>
    );
};

export default AddReceiveProduct;
