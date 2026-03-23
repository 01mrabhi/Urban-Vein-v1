'use client';
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { 
  Plus, 
  Upload, 
  RotateCcw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  Shirt,
  Disc,
  Type,
  Image as ImageIcon,
  ChevronDown,
  Skull,
  Zap,
  Star,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = [
  { id: 'black', value: '#000000', label: 'Jet Black' },
  { id: 'white', value: '#FFFFFF', label: 'Crystal White' },
  { id: 'blue', value: '#4A5568', label: 'Steel Blue' },
  { id: 'maroon', value: '#4A0E0E', label: 'Deep Maroon' },
];

const FONTS = [
  'Spline Sans',
  'Inter',
  'Oswald',
  'Roboto Mono'
];

const GRAPHICS = [
  { icon: Skull, label: 'Skull' },
  { icon: Zap, label: 'Bolt' },
  { icon: Star, label: 'Star' },
  { icon: MoreHorizontal, label: 'More' },
];

export default function CustomizerPage() {
  const [product, setProduct] = useState<'tee' | 'hoodie'>('tee');
  const [view, setView] = useState<'front' | 'back'>('front');
  const [baseColor, setBaseColor] = useState(COLORS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [fontFamily, setFontFamily] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState(24);
  const [zoom, setZoom] = useState(1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600/30">
      <Navbar />
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
        {/* Main Preview Area */}
        <section className="flex-1 relative p-8 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(161,161,170,0.05)_0%,transparent_70%)]">
          <div className="absolute top-8 left-8">
            <h1 className="text-3xl font-black uppercase tracking-tight">Studio Preview</h1>
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time 3D visualization</p>
          </div>

          <div className="absolute top-8 right-8 flex gap-2">
            <button 
              onClick={() => setView('front')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === 'front' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              Front
            </button>
            <button 
              onClick={() => setView('back')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === 'back' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              Back
            </button>
          </div>

          {/* 3D Model Placeholder with Grid Background */}
          <div className="relative w-full max-w-2xl aspect-square rounded-3xl overflow-hidden border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm shadow-2xl group">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <motion.div 
              style={{ scale: zoom }}
              className="relative w-full h-full flex items-center justify-center p-12"
              animate={{ rotateY: view === 'back' ? 180 : 0 }}
              transition={{ duration: 0.8, ease: "circOut" }}
            >
              <div className="relative w-full aspect-square">
                 {/* Product Image Mockup */}
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-colors duration-500"
                  style={{ 
                    backgroundImage: `url('${product === 'tee' ? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop'}')`,
                    filter: baseColor.id === 'white' ? 'none' : 'grayscale(100%) brightness(0.5)',
                    backgroundColor: baseColor.id === 'white' ? 'transparent' : baseColor.value,
                    mixBlendMode: baseColor.id === 'white' ? 'normal' : 'multiply',
                  }}
                />
                
                {/* Design Print Area Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 border-2 border-dashed border-red-500/30 rounded-lg flex items-center justify-center relative group-hover:border-red-500/50 transition-colors">
                    <span className="text-[8px] uppercase font-bold text-red-500/40 absolute -top-4">Print Area</span>
                    
                    {/* Uploaded Content */}
                    {uploadedImage && (
                      <img src={uploadedImage} alt="Design" className="max-w-[80%] max-h-[80%] object-contain" />
                    )}
                    
                    {/* Custom Text Content */}
                    {customText && (
                      <div 
                        style={{ fontFamily, fontSize: `${fontSize}px` }}
                        className="text-white drop-shadow-lg text-center break-words max-w-full"
                      >
                        {customText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* View Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-950/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-zinc-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-zinc-400 hover:text-white transition-colors"><ZoomOut size={18} /></button>
               <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="text-zinc-400 hover:text-white transition-colors"><ZoomIn size={18} /></button>
               <div className="w-px h-4 bg-zinc-800 mx-2"></div>
               <button onClick={() => setZoom(1)} className="text-zinc-400 hover:text-white transition-colors"><RotateCcw size={18} /></button>
               <button className="text-zinc-400 hover:text-white transition-colors"><Maximize2 size={18} /></button>
            </div>
          </div>
        </section>

        {/* Sidebar Controls */}
        <aside className="w-full lg:w-[400px] bg-zinc-900/50 backdrop-blur-xl border-l border-zinc-900 p-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-10 pb-20">
            
            {/* Product Select */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Shirt className="text-red-500" size={20} />
                <h2 className="text-lg font-bold uppercase tracking-tight">Product Select</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setProduct('tee')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${product === 'tee' ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  <Shirt size={28} className={product === 'tee' ? 'text-white' : 'text-zinc-600'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Classic Tee</span>
                </button>
                <button 
                  onClick={() => setProduct('hoodie')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${product === 'hoodie' ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  <Disc size={28} className={product === 'hoodie' ? 'text-white' : 'text-zinc-600'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Oversize Hoodie</span>
                </button>
              </div>
            </section>

            {/* Base Color Selection */}
            <section>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Base Color</h3>
              <div className="flex gap-4">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setBaseColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 ${baseColor.id === color.id ? 'border-red-500 scale-110' : 'border-transparent hover:scale-105'}`}
                  >
                    <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: color.value }}></div>
                  </button>
                ))}
              </div>
            </section>

            <div className="h-px bg-zinc-900"></div>

            {/* Design Upload */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ImageIcon className="text-red-500" size={20} />
                  <h2 className="text-lg font-bold uppercase tracking-tight">Design Upload</h2>
                </div>
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">PNG, SVG</span>
              </div>
              
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-10 flex flex-col items-center text-center gap-4 group-hover:border-red-600/50 transition-colors bg-zinc-900/30">
                  <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Drag & Drop your artwork</p>
                    <p className="text-xs text-zinc-500 mt-1">or click to browse files</p>
                  </div>
                  <button className="mt-2 bg-red-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all">
                    Upload Image
                  </button>
                </div>
              </div>
            </section>

            <div className="h-px bg-zinc-900"></div>

            {/* Add Elements */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Type className="text-red-500" size={20} />
                <h2 className="text-lg font-bold uppercase tracking-tight">Add Elements</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Custom Text</h3>
                  <div className="relative">
                    <input 
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Type here..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 hover:scale-110 transition-transform">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Font Family</h3>
                    <div className="relative">
                      <select 
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-red-600 transition-colors pr-10"
                      >
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Font Size</h3>
                    <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
                      <Type size={14} className="text-zinc-600" />
                      <input 
                        type="range" 
                        min="12" 
                        max="72" 
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Graphics Library</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {GRAPHICS.map((g, idx) => (
                      <button 
                        key={idx}
                        className="flex items-center justify-center p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-red-600 hover:text-red-500 transition-all shadow-sm"
                      >
                        <g.icon size={20} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

             <button className="w-full bg-red-600 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-600/30 hover:bg-red-500 transition-all flex items-center justify-center gap-3 group translate-y-4">
                Finish Design <Plus size={18} className="group-hover:rotate-90 transition-transform" />
             </button>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </main>
  );
}
