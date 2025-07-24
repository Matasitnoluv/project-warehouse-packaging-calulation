import { TypeShelfExport } from "@/types/response/reponse.msproduct"
import { formatDate } from "@/utils/formatDate"
import { ExportButtonDialog } from "./ExportButtonDialog";
import { RestoreButtonDialog } from "./RestoreButtonDialog";
import { useEffect, useState } from "react";

export const TabsExportContent = ({
    exportData,
    exportTabs = false,
    searchKeyword,
    boxSearchKeyword
}: {
    exportData?: TypeShelfExport,
    exportTabs?: boolean,
    searchKeyword?: string,
    boxSearchKeyword?: string
}) => {
    const [search, setSearch] = useState("");
    const [boxSearch, setBoxSearch] = useState("");

    // อัพเดท search state เมื่อ searchKeyword prop เปลี่ยน
    useEffect(() => {
        setSearch(searchKeyword || "");
    }, [searchKeyword]);

    // อัพเดท boxSearch state เมื่อ boxSearchKeyword prop เปลี่ยน
    useEffect(() => {
        setBoxSearch(boxSearchKeyword || "");
    }, [boxSearchKeyword]);

    if (!exportData) {
        return (
            <div className="text-center text-gray-500 py-4">
                กรุณาเลือกคลังและโซนเพื่อแสดงข้อมูลการส่งออก
            </div>
        );
    }

    const rack = exportData.racks.find(
        (r: any) => r.master_zone_id === exportData.zone.master_zone_id
    );

    // กรองข้อมูลตาม exportTabs
    let shelfBoxStorage = exportData.shelfBoxStorage.filter((doc) => doc.export === exportTabs);
    const totalItems = shelfBoxStorage.length;

    // กรองข้อมูลตาม searchKeyword และ boxSearchKeyword
    if ((search && search.trim()) || (boxSearch && boxSearch.trim())) {
        const keyword = search.toLowerCase().trim();
        const boxKeyword = boxSearch.toLowerCase().trim();

        shelfBoxStorage = shelfBoxStorage.filter((doc) => {
            const documentProductNo = doc?.cal_box?.document_product_no?.toLowerCase() || '';
            const codeBox = doc?.cal_box?.code_box?.toLowerCase() || '';
            const codeProduct = doc?.cal_box?.code_product?.toLowerCase() || '';
            const boxNo = doc?.cal_box?.box_no?.toString().toLowerCase() || '';

            // กรองตามเลขเอกสารสินค้า
            const matchesDocumentSearch = !keyword ||
                documentProductNo.includes(keyword) ||
                codeBox.includes(keyword) ||
                codeProduct.includes(keyword);

            // กรองตามเลขที่กล่อง
            const matchesBoxSearch = !boxKeyword || boxNo.includes(boxKeyword);

            return matchesDocumentSearch && matchesBoxSearch;
        });
    }

    const filteredItems = shelfBoxStorage.length;
    console.log(shelfBoxStorage.length, "exportData");

    // สร้างข้อความแสดงผลการค้นหา
    const getSearchDisplayText = () => {
        const searchTerms = [];
        if (search && search.trim()) searchTerms.push(`เลขเอกสาร: "${search}"`);
        if (boxSearch && boxSearch.trim()) searchTerms.push(`เลขกล่อง: "${boxSearch}"`);

        if (searchTerms.length > 0) {
            return `${searchTerms.join(", ")} - พบ ${filteredItems} รายการจากทั้งหมด ${totalItems} รายการ`;
        }
        return null;
    };

    const searchDisplayText = getSearchDisplayText();

    return <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-semibold mb-1">กล่องที่พร้อมส่งออก</h2>
                <p className="text-gray-600">เลือกเอกสารเพื่อดูรายละเอียดหรือส่งออกกล่องทั้งหมดในเอกสาร</p>
            </div>
            {searchDisplayText && (
                <div className="text-sm text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-3 rounded-lg border border-blue-200 shadow-sm">
                    ค้นหา: {searchDisplayText}
                </div>
            )}
        </div>

        {shelfBoxStorage.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                            <th className="p-3 text-left font-semibold text-white">เลขที่เอกสารโปรดัก</th>
                            <th className="p-3 text-left font-semibold text-white">เลขที่เอกสาร</th>
                            <th className="p-3 text-left font-semibold text-white">ชั้นวาง</th>
                            <th className="p-3 text-left font-semibold text-white">เลขที่กล่อง</th>
                            <th className="p-3 text-left font-semibold text-white">รหัสสินค้า</th>
                            <th className="p-3 text-left font-semibold text-white">จำนวนสินค้า</th>
                            <th className="p-3 text-left font-semibold text-white">{exportTabs ? "วันที่ส่งออก" : "วันที่จัดเก็บ"}</th>
                            <th className="p-3 text-left font-semibold text-white">การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shelfBoxStorage.map((doc) => (
                            <tr key={doc.cal_box_id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                                <td className="p-3">{doc?.cal_box?.document_product_no}</td>
                                <td className="p-3">
                                    {doc?.cal_box?.code_box}
                                    {/* {doc.cal_box.count} */}
                                </td>

                                <td className="p-3">{rack?.master_rack_name}</td>
                                <td className="p-3">{doc?.cal_box?.box_no}</td>
                                <td className="p-3">{doc?.cal_box?.code_product}</td>
                                <td className="p-3">{doc?.cal_box?.count}</td>
                                <td className="p-3">{exportTabs ? formatDate(doc.export_date) : formatDate(doc.stored_date)}</td>
                                <td className="p-3 flex gap-2">
                                    {/* <button
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                                        onClick={() => handleDocumentSelect(doc)}
                                    >
                                        รายละเอียด
                                    </button> */}
                                    {exportTabs ? <RestoreButtonDialog storage_id={doc.storage_id} wareHouse={exportData.warehouse.master_warehouse_id} zone={exportData.zone.master_zone_id} /> :
                                        <ExportButtonDialog storage_id={doc.storage_id} wareHouse={exportData.warehouse.master_warehouse_id} zone={exportData.zone.master_zone_id} />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                {(search && search.trim()) || (boxSearch && boxSearch.trim()) ? (
                    <div>
                        <p className="text-lg font-medium mb-2">ไม่พบข้อมูลที่ค้นหา</p>
                        <div className="text-sm">
                            {search && search.trim() && <p>คำค้นหาเลขเอกสาร: "{search}"</p>}
                            {boxSearch && boxSearch.trim() && <p>คำค้นหาเลขกล่อง: "{boxSearch}"</p>}
                        </div>
                        <p className="text-sm mt-1">ลองค้นหาด้วยคำอื่นหรือตรวจสอบการสะกดคำ</p>
                    </div>
                ) : (
                    <p className="text-lg">ไม่มีกล่องที่พร้อมส่งออก</p>
                )}
            </div>
        )}
    </div>

}