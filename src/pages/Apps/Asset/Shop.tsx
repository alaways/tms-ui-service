import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { IRootState } from '../../../store';
import { Form, Formik } from 'formik';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import InputField from '../../../components/HOC/InputField';
import SelectField from '../../../components/HOC/SelectField';
import { toastAlert } from '../../../helpers/constant';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { Assets } from '../../../types/index';
import { useAssetAddtoShopMutation, useAssetFindMutation } from '../../../services/mutations/useAssetMutation';
import { url_api } from '../../../services/endpoints';
import { useGlobalMutation } from '../../../helpers/globalApi';
import { useTranslation } from 'react-i18next';

const AssetShop = () => {
    const { t } = useTranslation();
    const toast = Swal.mixin(toastAlert);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(t('shop_assets')));
    }, [dispatch, t]);

    const dataStoredAsset = useSelector((state: IRootState) => state.dataStore.assets);
    const [shopList, setShopList] = useState<any>([]);
    const [relationList, setRelationList] = useState<any>([]);

    const [assetShopFormData, setAssetShopFormData] = useState<Assets>({
        id_shop: '',
        id: dataStoredAsset.id,
        name: dataStoredAsset.name,
    });

    // TODO: global mutate
    const { mutate: fetchAssetData, isLoading: isAssetLoading } = useAssetFindMutation({
        onSuccess: (res: any) => {
            // if (res.code === 200 || res.statusCode === 200) {
               // setRelationList(res.data.shop_assets);
            // }
        },
    });
    
    const { mutate: fetchShopListData, isLoading: isShopListLoading } = useGlobalMutation(url_api.shopFindAll, {
            onSuccess: (res: any) => {
                setShopList(
                    res.data.map((item: any) => ({
                        value: item.id,
                        label: item.name,
                    }))
                );
            },
            onError: () => {
            },
    })
    // TODO: global mutate
    const { mutate: assetShopCreate, isLoading } = useAssetAddtoShopMutation({
        onSuccess: (res: any) => {
            if (res.code === 200 || res.statusCode === 200) {
                toast.fire({
                    icon: 'success',
                    title: t('save_success'),
                    padding: '10px 20px',
                });
                fetchAssetData({ data: { id: dataStoredAsset.id } });
            } else {
                toast.fire({
                    icon: 'warning',
                    title: res.message,
                    padding: '10px 20px',
                });
            }
        },
    });

    useEffect(() => {
        fetchShopListData({ data: { page: 1, page_size: -1 } });
        fetchAssetData({ data: { id: dataStoredAsset.id } });
        // fetchShopGroupData({ data: { page: 1, pageSize: -1 } });
        // fetchBusinessUnitData({ data: { page: 1, pageSize: -1 } });
    }, []);

    // const handleChangeSelect = (props: any, event: any, name: any) => {
    //     props.setFieldValue(name, event.value);
    // };

    const submitForm = useCallback(
        (event: any) => {
            if (!isLoading) {
                assetShopCreate({ data: { id_asset: dataStoredAsset.id, id_shop: event.id_shop } });
            }
        },
        [assetShopCreate, dataStoredAsset]
    );

    const SubmittedForm = Yup.object().shape({
        id_shop: Yup.string().required(t('required_field')),
    });

    if (isShopListLoading || isAssetLoading) return <div>Loading...</div>;

    return (
        <div className="flex xl:flex-col flex-col gap-2.5">
            <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <Formik initialValues={assetShopFormData} onSubmit={submitForm} enableReinitialize autoComplete="off" validationSchema={SubmittedForm}>
                    {(props) => (
                        <Form className="space-y-5 dark:text-white ">
                            <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">{t('business_shop_partner')}</div>
                            <div className="input-flex-row">
                                <InputField label={t('asset_name')} name="name" type="text" disabled={true} />
                            </div>
                            <div className="input-flex-row">
                                <SelectField label={t('shop')} id="id_shop" name="id_shop" options={shopList} placeholder={t('please_select')} isSearchable={true} />
                            </div>
                            <div className="input-flex-row">
                                <p className="text-[11px] text-white-dark">{t('shop_group_description')}</p>
                            </div>
                            <button type="submit" className="btn !mt-6 w-full border-0 btn-primary">
                                {isLoading && <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 ltr:mr-4 rtl:ml-4 inline-block align-middle"></span>}
                                {t('save')}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
            <div className="panel px-6 flex-1 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>{t('group_no')}</th>
                                    <th>{t('shop_name')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relationList.map((item: any, index: any) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.shop.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetShop;
