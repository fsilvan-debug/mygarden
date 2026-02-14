
import React, { useMemo } from 'react';
import { ObjectType, GardenObject } from './types';
import { COLORS, OBJECT_NAMES, BLOCK_LENGTH, TUFF_DEPTH, SOIL_DEPTH } from './constants';

interface ToolbarProps {
  onAddObject: (type: ObjectType, w?: number, h?: number, label?: string) => void;
  onRemoveObject: (id: string) => void;
  onUpdateObject: (obj: GardenObject) => void;
  selectedObject: GardenObject | null;
  objects: GardenObject[];
}

const Toolbar: React.FC<ToolbarProps> = React.memo(({ 
  onAddObject, 
  onRemoveObject, 
  onUpdateObject, 
  selectedObject, 
  objects
}) => {
  const handleRotate = () => {
    if (selectedObject) {
      onUpdateObject({
        ...selectedObject,
        width: selectedObject.height,
        height: selectedObject.width
      });
    }
  };

  const calculateBlocks = (obj: GardenObject) => {
    if (obj.type !== 'bed') return 0;
    const perimeter = (obj.width + obj.height) * 2;
    return Math.ceil(perimeter / BLOCK_LENGTH);
  };

  const calculateTuffVolume = (obj: GardenObject) => {
    if (obj.type !== 'deck') return 0;
    return Math.round(obj.width * obj.height * TUFF_DEPTH * 1000);
  };

  const calculateSoilVolume = (obj: GardenObject) => {
    if (obj.type !== 'bed') return 0;
    return Math.round(obj.width * obj.height * SOIL_DEPTH * 1000);
  };

  const bedObjects = useMemo(() => objects.filter(o => o.type === 'bed'), [objects]);
  const tuffObjects = useMemo(() => objects.filter(o => o.type === 'deck'), [objects]);
  const fenceObjects = useMemo(() => objects.filter(o => o.type === 'fence'), [objects]);

  const totalBlocks = useMemo(() => bedObjects.reduce((sum, obj) => sum + calculateBlocks(obj), 0), [bedObjects]);
  const totalSoilLiters = useMemo(() => bedObjects.reduce((sum, obj) => sum + calculateSoilVolume(obj), 0), [bedObjects]);
  const totalTuffLiters = useMemo(() => tuffObjects.reduce((sum, obj) => sum + calculateTuffVolume(obj), 0), [tuffObjects]);
  const totalFenceLength = useMemo(() => fenceObjects.reduce((sum, obj) => sum + Math.max(obj.width, obj.height), 0), [fenceObjects]);

  return (
    <div className="w-96 bg-white border-l-4 border-emerald-100 p-8 flex flex-col gap-6 overflow-y-auto h-full shadow-2xl z-30 font-bold" dir="rtl">
      <div>
        <h2 className="text-3xl font-black text-emerald-900 border-b-4 border-emerald-500 pb-2 mb-2">ארגז הכלים 🛠️</h2>
        <p className="text-sm text-zinc-500 italic">הוסיפו פריטים לגינה שלכם!</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => onAddObject('bed', 1.4, 0.6, 'ערוגה')}
          className="flex items-center gap-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl hover:border-emerald-500 hover:scale-[1.02] transition-all text-lg font-black text-emerald-900"
        >
          <div className="w-8 h-4 rounded-sm" style={{ backgroundColor: COLORS.bed }} />
          ערוגת ירקות
        </button>

        <button
          onClick={() => onAddObject('deck', 0.6, 0.6, 'חיפוי טוף')}
          className="flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl hover:border-amber-500 hover:scale-[1.02] transition-all text-lg font-black text-amber-900"
        >
          <div className="w-6 h-6 rounded-sm border border-amber-300" style={{ backgroundColor: COLORS.deck }} />
          חיפוי טוף (60x60)
        </button>

        <button
          onClick={() => onAddObject('fence', 1.0, 0.1, 'גדר')}
          className="flex items-center gap-4 p-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl hover:border-zinc-500 hover:scale-[1.02] transition-all text-lg font-black text-zinc-900"
        >
          <div className="w-10 h-2 rounded-sm" style={{ backgroundColor: COLORS.fence }} />
          גדר (1 מטר)
        </button>
        
        <button
          onClick={() => onAddObject('tree', 0.8, 0.8, 'עץ')}
          className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-2xl hover:border-green-500 hover:scale-[1.02] transition-all text-lg font-black text-green-900"
        >
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: COLORS.tree }} />
          עץ או שיח
        </button>

        <button
          onClick={() => onAddObject('kklTable', 1.5, 1.6, 'שולחן')}
          className="flex items-center gap-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl hover:border-orange-500 hover:scale-[1.02] transition-all text-lg font-black text-orange-900"
        >
          <div className="w-8 h-5 rounded-sm" style={{ backgroundColor: COLORS.kklTable }} />
          שולחן קק"ל
        </button>
      </div>

      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xl font-black mb-2 flex items-center gap-2 underline decoration-emerald-400">📊 דוח חומרים</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-emerald-800 p-3 rounded-xl border border-emerald-700">
            <span>אדמה לערוגות (30 ס"מ):</span>
            <span className="text-xl font-black text-emerald-400">{totalSoilLiters} ליטר</span>
          </div>
          <div className="flex justify-between items-center bg-emerald-800 p-3 rounded-xl border border-emerald-700">
            <span>טוף לחיפוי (5 ס"מ):</span>
            <span className="text-xl font-black text-amber-300">{totalTuffLiters} ליטר</span>
          </div>
          <div className="flex justify-between items-center bg-emerald-800 p-3 rounded-xl border border-emerald-700">
            <span>בלוקים לערוגות:</span>
            <span className="text-xl font-black text-zinc-300">{totalBlocks} יח'</span>
          </div>
          <div className="flex justify-between items-center bg-emerald-800 p-3 rounded-xl border border-emerald-700">
            <span>אורך גדר:</span>
            <span className="text-xl font-black text-blue-300">{totalFenceLength.toFixed(1)} מ'</span>
          </div>
        </div>
      </div>

      {selectedObject ? (
        <div className="p-6 bg-yellow-50 border-4 border-yellow-400 rounded-3xl flex flex-col gap-4 shadow-xl animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-yellow-900 text-xl italic">עריכת פריט</h3>
            <button onClick={() => onRemoveObject(selectedObject.id)} className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-700 shadow-md">
               מחיקה 🗑️
            </button>
          </div>
          
          <button onClick={handleRotate} className="w-full py-3 bg-white border-2 border-yellow-400 text-yellow-900 rounded-xl font-black hover:bg-yellow-100 flex items-center justify-center gap-2">
             🔄 סיבוב
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-yellow-800">אורך (מ')</span>
              <input type="number" step="0.1" className="p-2 border-2 border-yellow-200 rounded-xl text-center font-black" value={selectedObject.width} onChange={(e) => onUpdateObject({ ...selectedObject, width: parseFloat(e.target.value) || 0.1 })} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-yellow-800">רוחב (מ')</span>
              <input type="number" step="0.1" className="p-2 border-2 border-yellow-200 rounded-xl text-center font-black" value={selectedObject.height} onChange={(e) => onUpdateObject({ ...selectedObject, height: parseFloat(e.target.value) || 0.1 })} />
            </div>
          </div>
          <input type="text" className="p-2 border-2 border-yellow-200 rounded-xl text-center font-black mt-2" value={selectedObject.label} onChange={(e) => onUpdateObject({ ...selectedObject, label: e.target.value })} />
        </div>
      ) : (
        <div className="p-8 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-lg font-black">
          לחצו על פריט בגינה לשינוי 🖱️
        </div>
      )}
    </div>
  );
});

export default Toolbar;
