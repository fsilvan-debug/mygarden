
export const SCALE = 95; // Represents the visual scale where 5 blocks = 1 meter
export const BLOCK_LENGTH = 0.2; // 20cm in meters
export const BLOCK_WIDTH = 0.1;  // 10cm in meters
export const TUFF_DEPTH = 0.05;  // 5cm depth for tuff calculation
export const SOIL_DEPTH = 0.30;  // 30cm depth for soil calculation in beds

// Orientation: East Wall at the Top
// Width (Horizontal): 14.1m (East/West)
// Height (Vertical): 8.5m (North/South)
// Recess in East-South (Top-Right) corner: 
// 2m parallel to East wall (width of cutout)
// 1.38m parallel to North wall (height of cutout)
export const GARDEN_DIMENSIONS = {
  width: 14.1,       
  height: 8.5,      
  recessX: 2.0,      
  recessY: 1.38     
};

export const COLORS = {
  bed: '#4d7c0f', // green-700
  path: '#a8a29e', // stone-400
  tree: '#15803d', // green-700
  deck: '#92400e', // Tuff color (Brownish/Reddish)
  pond: '#0ea5e9', // sky-500
  kklTable: '#78350f', // amber-900 (wood color)
  fence: '#facc15', // yellow-400
  background: '#f8fafc', // slate-50
  border: '#0f172a', // slate-900
  gridMinor: '#cbd5e1', // Light grid
  gridMajor: '#94a3b8', // Darker grid
};

export const OBJECT_NAMES: Record<string, string> = {
  bed: 'ערוגה',
  path: 'שביל',
  tree: 'עץ',
  deck: 'חיפוי טוף',
  pond: 'בריכת נוי',
  kklTable: 'שולחן קק"ל',
  fence: 'גדר'
};
