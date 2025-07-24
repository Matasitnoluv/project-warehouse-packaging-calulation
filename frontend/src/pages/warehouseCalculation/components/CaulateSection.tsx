import { Button } from "@radix-ui/themes";
import { useState, useRef } from "react";
import { useCalculateContext } from "../context/useCalculateCotext";
import { TypeShelfBoxStorage } from "@/types/response/reponse.msproduct";
import { CalculateManage } from "./CalculateManage";
import { postShelfBoxStorage, updateManyStoredBox } from "@/services/shelfBoxStorage.services";
import { TypeCalWarehouse } from "@/types/response/reponse.cal_warehouse";
import DialogSaveCalwarehouse from "./modals/dialogSave";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const CaulateSection = ({ calwarehouse }: { calwarehouse: TypeCalWarehouse }) => {
  const { showCalculateDialog, setShowCalculateDialog, dataCompile, boxs, warehouseId, warehouseNo } = useCalculateContext();
  const [shelflStorage, setShelflStorage] = useState<TypeShelfBoxStorage[]>([]);
  const navigate = useNavigate();
  const actionEdit = !!calwarehouse?.master_warehouse_id;
  const queryClient = useQueryClient();

  // เพิ่ม state สำหรับ Undo
  const [canUndo, setCanUndo] = useState(false);
  const undoRef = useRef<(() => void) | null>(null);

  // ฟังก์ชันสำหรับจัดการ Undo
  const handleUndo = () => {
    if (undoRef.current) {
      undoRef.current();
    }
  };

  // ฟังก์ชันสำหรับรับ Undo function จาก CalculateManage
  const handleUndoAvailable = (canUndo: boolean, undoFunction: () => void) => {
    setCanUndo(canUndo);
    undoRef.current = undoFunction;
  };

  async function handleSave() {
    if (shelflStorage) {
      if (!actionEdit) {
        await postShelfBoxStorage(shelflStorage).then(async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["calwarehouse", warehouseNo] }),
            queryClient.invalidateQueries({ queryKey: ['storage', warehouseId] }),

          ]);
          window.location.replace('/calwarehouseTable')
        });
      }
      else {
        await updateManyStoredBox(shelflStorage).then(async () => {
          navigate('/calwarehouseTable')
        });
      }
    }


  }

  return <div className={`bg-white  w-full h-[80vh] lg:h-[90vh]  lg:p-5 absolute  transition-opacity  opacity-0 top-0 ${showCalculateDialog ? 'opacity-100 z-30 ' : '-z-10'}`}>
    <div className=" relative flex flex-col size-full">
      <div className="flex-none ">
        <div className="text-xl font-bold mb-4">
          {/* Calculation Summary {saveStatus ? '✅' : '❌'} */}
        </div>
      </div>
      <div className="grow relative">
        {dataCompile && boxs && (
          <CalculateManage
            onCompiles={setShelflStorage}
            storage={dataCompile}
            boxs={boxs}
            cal_warehouse_id={calwarehouse.cal_warehouse_id}
            master_warehouse_id={warehouseId}
            onUndoAvailable={handleUndoAvailable}
          />
        )}
      </div>
      <div className="flex-none  mt-6 flex justify-end gap-4 border-t pt-4">
        {/* Undo Button */}
        {canUndo && (
          <Button
            onClick={handleUndo}
            color="orange"
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Undo
          </Button>
        )}

        <DialogSaveCalwarehouse onConfirm={handleSave} color={actionEdit ? 'purple' : 'green'}>
          {shelflStorage ? actionEdit ? 'Modifield' : 'Save' : 'Not Save'}
        </DialogSaveCalwarehouse>
        <Button
          onClick={() => actionEdit ? navigate('/calwarehouseTable') : setShowCalculateDialog(false)}
          color='gray'
        >
          {actionEdit ? 'Back' : 'Close'}
        </Button>
      </div>
    </div>
  </div>
}

export default CaulateSection;