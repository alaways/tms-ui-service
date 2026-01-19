import { DataTable } from 'mantine-datatable';
import IconEye from '../../../../components/Icon/IconEye';
import { convertDateTimeDbToClient } from '../../../../helpers/formatDate';
import { useEffect, useState } from 'react';
import { useGlobalMutation } from '../../../../helpers/globalApi';
import { url_api } from '../../../../services/endpoints';
import { useParams } from 'react-router-dom';

const ListHistoryCustomer = () => {
    const {id} = useParams()
    const [history,setHistory] = useState<any>([])

    const {mutateAsync: fetchHistory} = useGlobalMutation(url_api.findallHistoryCustomer, {
        onSuccess: (res:any) => {
            if (res.code == 200 && res.statusCode == 200) {
                setHistory(res.data)
            }
        },
        onError: (err:any) => {
            console.error('Failed to fetch data');
        }
    })

    useEffect(() => {
        fetchHistory({data:{uuid:id}})
    },[])
    
    return (
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="px-5 mb-4 flex justify-between items-center">
                <h5 className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">ประวัติการบันทึก</h5>
            </div>
            <div className="datatables pagination-padding">
                <DataTable
                    className="whitespace-nowrap table-hover invoice-table"
                    records={history}
                    columns={[
                        {
                            accessor: 'id',
                            title: 'ลำดับ',
                            sortable: false,
                            textAlignment: 'center',
                            render: (row, index) => <div>{index + 1}</div>,
                        },
                        {
                            accessor: 'created_at',
                            title: 'วันที่ - เวลา',
                            sortable: false,
                            render: (item: any) => <p>{convertDateTimeDbToClient(item?.updated_at)}</p>,
                        },
                        {
                            accessor: 'slug',
                            title: 'เลขที่ slug',
                            sortable: false,
                            render: (item: any) => <p>{item?.prescreen_ref}</p>,
                        },
                        {
                            accessor: 'user_type',
                            title: 'ประเภทผู้ดำเนินการ',
                            sortable: false,
                            render: (item: any) => <p>{item?.user_type}</p>,
                        },
                        {
                            accessor: 'action',
                            title: 'Actions',
                            sortable: false,
                            textAlignment: 'center',
                            render: (item) => (
                                <div className="flex gap-4 items-center w-max mx-auto">
                                    <a href={`/apps/customer/history/${id}/${item.id}`} className="flex cursor-pointer items-center relative group">
                                        <IconEye className="w-4.5 h-4.5 flex items-center transition-opacity duration-200 group-hover:opacity-0" />
                                        <p className="absolute left-[-10px] text-center text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">ดูข้อมูล</p>
                                    </a>
                                </div>
                            ),
                        },
                    ]}
                    minHeight={160}
                    highlightOnHover
                    // page={page}
                    // totalRecords={totalItems}
                    // recordsPerPage={pageSize}
                    // onPageChange={(p) => setPage(p)}
                    // recordsPerPageOptions={PAGE_SIZES}
                    // onRecordsPerPageChange={(p) => {
                    //     setPage(1);
                    //     setPageSize(p);
                    // }}
                    // paginationText={({ from, to, totalRecords }) => `โชว์ ${from} ถึง ${to} ของ ${totalRecords} หน้าทั้งหมด`}
                />
            </div>
        </div>
    );
};

export default ListHistoryCustomer;
