import { useQuery } from "@tanstack/react-query";
import { useCalculateContext } from "../context/useCalculateCotext";
import { ButtonCalculate } from "./ButtonCalculate";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { useCalMsProductQuery, useZoneQuery } from "@/services/queriesHook";
import { Layers } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { TypeMswarehouse } from "@/types/response/reponse.mswarehouse";



interface ZoneDocumentSelectorProps {
    className?: string,
    setZoneNames?: React.Dispatch<React.SetStateAction<string>>,
    selectedZone: string,
    setSelectedZone: (zones: string) => void
    master_warehouse_id?: string
}


export const SelectZone = ({ selectedZone, setSelectedZone, className, setZoneNames, master_warehouse_id }: ZoneDocumentSelectorProps) => {
    const { data: zones, status } = useZoneQuery()
    useEffect(() => {
        if (selectedZone && setZoneNames) {
            const zoneName = zones?.responseObject?.find(zone => zone.master_zone_id === selectedZone)?.master_zone_name || ""
            setZoneNames(zoneName)
        }
    }, [selectedZone, setZoneNames, zones])

    if (status === 'pending') return "load";
    const zonesData = zones?.responseObject;
    return (
        <div className={className}>
            <label className="block text-xl font-bold text-gray-800 mb-2 items-center gap-2">
                <Layers className="text-blue-500 w-5 h-5" /> Select Zone
            </label>
            <select
                disabled={!master_warehouse_id}
                className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg shadow-sm transition-all duration-200 hover:border-blue-400"
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
            >
                <option value="">-- Select Zone --</option>
                {zonesData?.filter(m => m.master_warehouse_id === master_warehouse_id)?.map(zone => (
                    <option key={zone.master_zone_id} value={zone.master_zone_id}>
                        {zone.master_zone_name}
                    </option>
                ))}
            </select>
        </div>
    )
}
export const SelectProducts = ({ document, setDocument, className, disabled, setDocumentId: setIdDocument }: { className?: string, document: string | undefined, setDocument: (document: string) => void, disabled?: boolean, setDocumentId?: (documentId: string) => void }) => {
    const { data: products, status } = useCalMsProductQuery()
    const [documentIdToNo, setDocumentIdToNo] = useState<string | undefined>("")
    const productsData = products?.responseObject;
    useLayoutEffect(() => {
        if (disabled) {
            if (document && productsData && !documentIdToNo) {
                const No = productsData?.find(product => product?.document_product_id === document)?.document_product_no
                setDocumentIdToNo(No);

            }
        }
    }, [document, disabled, productsData, setDocument, documentIdToNo])

    useLayoutEffect(() => {
        if (setIdDocument) {
            const Id = productsData?.find(product => product?.document_product_no === document)?.document_product_id
            setIdDocument(Id ?? '')
        }
    }, [setIdDocument, documentIdToNo, document, disabled, productsData])
    useEffect(() => {
        if (documentIdToNo) {
            setDocument(documentIdToNo)
        }
    }, [documentIdToNo, setDocument])


    if (status === 'pending') return "load";

    return (
        <div className={className}>
            <label className="block text-xl font-bold text-gray-800 mb-2 items-center gap-2">
                <Layers className="text-blue-500 w-5 h-5" /> Select Products
            </label>
            <select
                className="w-full px-5 py-3 rounded-lg  border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg shadow-sm transition-all duration-200 hover:border-blue-400"
                value={document}
                onChange={e => setDocument(e.target.value)}
                disabled={disabled}
            >
                {documentIdToNo ? <option value={documentIdToNo} key={documentIdToNo}>{documentIdToNo}</option> : <option value="" key={'select-products'}>-- Select products --</option>}
                {productsData?.filter(product => !product.status).map((product) => (
                    <option key={product.document_product_no} value={product.document_product_no}>
                        {product.document_product_no}
                    </option>
                ))}
            </select>
        </div>
    )
}

export const SelectWarehouse = ({ warehouseId, className, setWarehouseId, setWarehouse }: { setWarehouse?: React.Dispatch<React.SetStateAction<TypeMswarehouse | null>>, className?: string, warehouseId: string, setWarehouseId: (warehouseId: string) => void }) => {
    const { data: warehouses, status } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => getMswarehouse(),
    });
    const warehousesData = useMemo(() => {
        return warehouses?.responseObject || []
    }, [warehouses?.responseObject]);
    useEffect(() => {
        if (warehousesData.length > 0 && warehouseId) {
            const foundWarehouse = warehousesData.find(
                (m) => m.master_warehouse_id === warehouseId
            );
            setWarehouse?.(foundWarehouse!);
        }
    }, [setWarehouse, warehouseId, warehousesData]);


    if (status === "pending") return "load";
    return (
        <div className={`flex-1 ${className}`}>
            <label className="block text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Layers className="text-blue-500 w-5 h-5" /> Select Warehouse
            </label>
            <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base shadow-sm transition-all duration-200 hover:border-blue-400"
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
            >
                <option value="">-- Select Warehouse --</option>
                {warehousesData?.map((warehouse) => (
                    <option key={warehouse.master_warehouse_id} value={warehouse.master_warehouse_id}>
                        {warehouse.master_warehouse_name}
                    </option>
                ))}
            </select>
        </div>
    )
}

const ZoneDocumentSelector = ({ disables }: { disables?: { selectProduct?: boolean, selectZone?: boolean } }) => {
    const {
        document,
        setDocument,
        setWarehouse,
        setDocumentId,
        setWarehouseId,
        warehouseId,
    } = useCalculateContext();


    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-10 mt-8 border border-gray-100">
            <hr className="my-6 border-gray-200" />
            <SelectWarehouse warehouseId={warehouseId} setWarehouseId={setWarehouseId} setWarehouse={setWarehouse} />
            <hr className="my-4 border-gray-200" />
            <div className="space-y-4 mt-8">
                {<SelectProducts document={document} setDocument={setDocument} disabled={disables?.selectProduct} setDocumentId={setDocumentId} />}
                <div className="flex justify-end">
                    <ButtonCalculate disabled={!document || !warehouseId} />
                </div>
            </div>
        </div>
    );
};

export default ZoneDocumentSelector; 