
import React, { useState, useCallback, useEffect, useRef } from 'react';
import GardenCanvas from './components/GardenCanvas';
import Toolbar from './components/Toolbar';
import { GardenObject, ObjectType } from './types';
import { COLORS, OBJECT_NAMES, GARDEN_DIMENSIONS, SCALE } from './constants';
import { getGardenSuggestions } from './services/geminiService';

const STORAGE_KEY = 'garden_plan_data';

const App: React.FC = () => {
  const [objects, setObjects] = useState<GardenObject[]>([]);
  const [history, setHistory] = useState<GardenObject[][]>([]);
  const [redoStack, setRedoStack] = useState<GardenObject[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setObjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load plan", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (objects.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(objects));
    }
  }, [objects]);

  const saveState = useCallback((currentObjects: GardenObject[]) => {
    setHistory(prev => [...prev, [...currentObjects]]);
    setRedoStack([]);
  }, []);

  const addObject = useCallback((type: ObjectType, customWidth?: number, customHeight?: number, customLabel?: string) => {
    saveState(objects);
    const newObj: GardenObject = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 1, 
      y: 1,
      width: customWidth ?? (type === 'tree' ? 1.0 : (type === 'path' ? 1.0 : 2)),
      height: customHeight ?? (type === 'tree' ? 1.0 : (type === 'path' ? 3.0 : 1.2)),
      color: COLORS[type],
      label: customLabel ?? OBJECT_NAMES[type]
    };
    setObjects(prev => [...prev, newObj]);
    setSelectedId(newObj.id);
  }, [objects, saveState]);

  const removeObject = useCallback((id: string) => {
    saveState(objects);
    setObjects(prev => prev.filter(o => o.id !== id));
    setSelectedId(null);
  }, [objects, saveState]);

  const updateObject = useCallback((updated: GardenObject) => {
    setObjects(prev => prev.map(o => o.id === updated.id ? updated : o));
  }, []);

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setRedoStack(prev => [objects, ...prev]);
    setObjects(previous);
    setHistory(newHistory);
    setSelectedId(null);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    const newRedoStack = redoStack.slice(1);
    setHistory(prev => [...prev, objects]);
    setObjects(next);
    setRedoStack(newRedoStack);
    setSelectedId(null);
  };

  const clearAll = () => {
    if(confirm('בטוח שרוצים למחוק הכל ולהתחיל מחדש?')) {
      saveState(objects);
      setObjects([]);
      setSelectedId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const exportImage = () => {
    if (!canvasRef.current) return;
    const svg = canvasRef.current;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    
    // Ensure XML declaration
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadLink.href = url;
    downloadLink.download = `garden_plan_${timestamp}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSuggest = async () => {
    setIsLoading(true);
    try {
      const suggestions = await getGardenSuggestions(GARDEN_DIMENSIONS);
      saveState(objects);
      const newObjects: GardenObject[] = suggestions.map((s: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        type: s.type as ObjectType,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        label: s.label,
        color: COLORS[s.type as ObjectType] || '#ccc'
      }));
      setObjects(newObjects);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedObject = objects.find(o => o.id === selectedId) || null;

  return (
    <div className="flex h-screen bg-zinc-100 overflow-hidden font-sans select-none text-lg" dir="rtl">
      <Toolbar 
        onAddObject={addObject} 
        onRemoveObject={removeObject}
        onUpdateObject={updateObject}
        selectedObject={selectedObject}
        objects={objects}
        onSuggest={handleSuggest}
        isLoading={isLoading}
      />
      
      <div className="flex-1 flex flex-col relative overflow-hidden bg-zinc-300">
        <header className="bg-white border-b-4 border-emerald-100 px-8 py-4 flex justify-between items-center shadow-lg z-20">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-emerald-950 flex items-center gap-3">
              מתכנן הגינה שלי 
              <span className="text-lg font-bold bg-zinc-200 px-3 py-1 rounded-lg border border-zinc-300">5 משבצות = 1 מטר</span>
            </h1>
            <p className="text-sm text-emerald-700 font-bold">כל משבצת קטנה היא 20 ס"מ | התוכנית נשמרת אוטומטית ✨</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 p-1 rounded-2xl border-2 border-zinc-200">
              <button onClick={undo} disabled={history.length === 0} className="p-2 hover:bg-white rounded-xl disabled:opacity-30 transition-all flex flex-col items-center" title="אחורה">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </button>
              <button onClick={redo} disabled={redoStack.length === 0} className="p-2 hover:bg-white rounded-xl disabled:opacity-30 transition-all flex flex-col items-center" title="קדימה">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
              </button>
            </div>

            <button 
              onClick={exportImage}
              className="px-6 py-3 text-lg font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              שמירת תמונה
            </button>

            <button 
              onClick={clearAll}
              className="px-6 py-3 text-lg font-black text-white bg-red-500 rounded-2xl hover:bg-red-600 shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              איפוס
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <GardenCanvas 
            canvasRef={canvasRef}
            objects={objects} 
            onSelectObject={setSelectedId} 
            onUpdateObject={updateObject}
            selectedId={selectedId}
          />
        </main>
        
        <footer className="bg-white border-t-4 border-emerald-50 px-8 py-3 text-base font-bold text-zinc-500 flex justify-between items-center z-20">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm" style={{ backgroundColor: COLORS.bed }} /> ערוגות</span>
            <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: COLORS.tree }} /> עצים</span>
            <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-md shadow-sm" style={{ backgroundColor: COLORS.deck }} /> טוף</span>
            <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-sm shadow-sm" style={{ backgroundColor: COLORS.fence }} /> גדר</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-emerald-950 bg-emerald-100 px-4 py-1 rounded-xl font-black border border-emerald-200">פריטים: {objects.length}</div>
            <div className="text-zinc-400 italic">מוכן להעלאה ל-GitHub</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
