import React, { useState, useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, 
    Trash2, 
    Layers, 
    ChevronLeft,
    Zap,
    Wand2,
    CheckCircle2,
    Box,
    X,
    RotateCcw,
    Sparkles,
    Eye,
    Plus
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import GiftBoxAnimation from '../../components/ui/GiftBoxAnimation';

const ASSETS = {
    boxes: [
        { id: 'box-1', name: 'Obsidian Velvet Box', url: '/assets/studio/luxury_box.png' },
    ],
    items: [
        { id: 'choc-1', category: 'Chocolates', name: 'Golden Pralines', url: '/assets/studio/chocolates.png', type: 'item' },
        { id: 'flower-1', category: 'Flowers', name: 'Artisan Roses', url: '/assets/studio/flowers.png', type: 'item' },
        { id: 'light-1', category: 'Lighting', name: 'Fairy String Lights', url: '/assets/studio/lights.png', type: 'light' },
    ],
    ribbons: [
        { id: 'rib-red', name: 'Ruby Silk', color: '#ef4444' },
        { id: 'rib-gold', name: 'Royal Gold', color: '#fbbf24' },
        { id: 'rib-emerald', name: 'Emerald Green', color: '#10b981' },
        { id: 'rib-pink', name: 'Blush Pink', color: '#f472b6' }
    ]
};

const DesignCanvas = () => {
    const navigate = useNavigate();
    const { conceptId } = useParams();
    const { success, error, info } = useToast();
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const containerRef = useRef(null);
    
    const [selectedCategory, setSelectedCategory] = useState('Chocolates');
    const [activeObject, setActiveObject] = useState(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [enhancedPreview, setEnhancedPreview] = useState(null);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 800,
            backgroundColor: '#050505',
            preserveObjectStacking: true,
            enableRetinaScaling: true
        });
        fabricCanvas.current = canvas;

        canvas.on('selection:created', (e) => setActiveObject(e.selected[0]));
        canvas.on('selection:updated', (e) => setActiveObject(e.selected[0]));
        canvas.on('selection:cleared', () => setActiveObject(null));

        const draft = sessionStorage.getItem('artisan_studio_draft');
        if (draft && fabricCanvas.current) {
            try {
                fabricCanvas.current.loadFromJSON(JSON.parse(draft)).then(() => {
                    if (fabricCanvas.current) {
                        fabricCanvas.current.renderAll();
                        info?.("Restored your latest craft draft.");
                    }
                });
            } catch (err) {
                console.warn("Draft restoration skipped: Canvas not ready.");
            }
        } else if (!draft) {
            loadBox(ASSETS.boxes[0].url);
        }

        const container = containerRef.current;
        container.addEventListener('dragover', (e) => e.preventDefault());
        container.addEventListener('drop', handleDrop);

        return () => {
            canvas.dispose();
            container.removeEventListener('drop', handleDrop);
        };
    }, []);

    const loadBox = (url) => {
        fabric.Image.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
            img.set({
                selectable: false, evented: false, originX: 'center', originY: 'center',
                left: 400, top: 400, scaleX: 0.8, scaleY: 0.8
            });
            fabricCanvas.current.add(img);
            if (fabricCanvas.current.sendObjectToBack) fabricCanvas.current.sendObjectToBack(img);
            fabricCanvas.current.renderAll();
        });
    };

    const applyRemoveBackground = (img) => {
        // Advanced Remove Background Filter for Artisan Studio
        const filter = new fabric.filters.RemoveColor({ 
            color: '#ffffff', 
            distance: 0.12 // Adjusted for better edge detection
        });
        img.filters.push(filter);
        img.applyFilters();
    };

    const addItemToCanvas = (asset, x = 400, y = 400) => {
        fabric.Image.fromURL(asset.url, { crossOrigin: 'anonymous' }).then((img) => {
            // Re-activating Background Removal Engine
            applyRemoveBackground(img);
            
            const shadow = asset.type === 'light' 
                ? new fabric.Shadow({ color: 'rgba(251, 191, 36, 0.4)', blur: 40, offsetX: 0, offsetY: 0 })
                : new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 30, offsetX: 10, offsetY: 15 });

            img.set({
                left: x, top: y, originX: 'center', originY: 'center', shadow: shadow,
                cornerColor: '#fbbf24', cornerStrokeColor: 'white', transparentCorners: false, cornerSize: 12,
            });
            img.scale(asset.type === 'light' ? 0.6 : 0.45);
            fabricCanvas.current.add(img);
            fabricCanvas.current.setActiveObject(img);
            fabricCanvas.current.renderAll();
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const assetData = e.dataTransfer.getData('artisan-item');
        if (!assetData) return;
        const asset = JSON.parse(assetData);
        const rect = canvasRef.current.getBoundingClientRect();
        addItemToCanvas(asset, e.clientX - rect.left, e.clientY - rect.top);
    };

    const enhanceAI = async () => {
        setIsEnhancing(true);
        info?.("AI Artisan Engine: Rendering Realistic Masterpiece...");
        
        setTimeout(() => {
            const canvas = fabricCanvas.current;
            // Apply depth-based studio shadows
            canvas.getObjects().forEach(obj => {
                if (obj.selectable) {
                    obj.set({ 
                        shadow: new fabric.Shadow({ 
                            color: 'rgba(0,0,0,0.9)', 
                            blur: 60, 
                            offsetX: 20, 
                            offsetY: 25 
                        }) 
                    });
                }
            });

            const bloom = new fabric.Rect({
                left: 0, top: 0, width: 800, height: 800, selectable: false, evented: false,
                fill: new fabric.Gradient({
                    type: 'radial', coords: { x1: 400, y1: 400, r1: 50, x2: 400, y2: 400, r2: 700 },
                    colorStops: [
                        { offset: 0, color: 'rgba(251, 191, 36, 0.08)' },
                        { offset: 0.6, color: 'rgba(0,0,0,0.3)' },
                        { offset: 1, color: 'rgba(0,0,0,0.8)' }
                    ]
                })
            });
            canvas.add(bloom);
            canvas.renderAll();

            const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.95, multiplier: 1.5 });
            setEnhancedPreview(dataUrl);
            setShowPreview(true);
            setIsEnhancing(false);
            canvas.remove(bloom);
            success?.("Photorealistic Render Complete!");
        }, 3000);
    };

    const finalizeDesign = async () => {
        if (!conceptId) {
            info?.("Sandbox Finalize: Celebratory Mode.");
            setShowAnimation(true);
            return;
        }

        setIsSaving(true);
        try {
            const designData = fabricCanvas.current.toJSON();
            await axios.post(`/api/creator-dashboard/save-design/${conceptId}`, { 
                elements: designData.objects,
                previewUrl: enhancedPreview || fabricCanvas.current.toDataURL({ format: 'jpeg', quality: 0.9 })
            });

            sessionStorage.removeItem('artisan_studio_draft');
            setShowPreview(false);
            setShowAnimation(true);
        } catch (err) {
            error?.("Sync Failure: Artisan Cloud Unreachable.");
            setIsSaving(false);
        }
    };

    const handleAction = (action) => {
        const canvas = fabricCanvas.current;
        const obj = canvas.getActiveObject();
        if (!obj) return;
        if (action === 'delete') canvas.remove(obj);
        else if (action === 'front') {
            if (canvas.bringObjectToFront) canvas.bringObjectToFront(obj);
            else canvas.bringToFront(obj);
        }
        else if (action === 'back') {
            if (canvas.sendObjectToBack) canvas.sendObjectToBack(obj);
            else canvas.sendToBack(obj);
            const box = canvas.getObjects().find(o => !o.selectable);
            if (box) if (canvas.sendObjectToBack) canvas.sendObjectToBack(box);
        }
        canvas.renderAll();
    };

    return (
        <div className="hamper-studio">
            {/* Celebration Animation - BOOSTED Z-INDEX 9999 */}
            {showAnimation && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
                    <GiftBoxAnimation onComplete={() => navigate('/creator-dashboard')} />
                </div>
            )}
            
            <AnimatePresence>
                {showPreview && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="preview-overlay">
                        <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} className="preview-modal">
                            <div className="preview-header">
                                <h3><Sparkles size={20} color="#fbbf24" /> Masterpiece Proof</h3>
                                <button onClick={() => setShowPreview(false)} className="close-preview"><X size={20} /></button>
                            </div>
                            <div className="preview-content">
                                <img src={enhancedPreview} alt="Realistic Preview" className="realistic-img" />
                                <div className="preview-stamp">ARTISAN CERTIFIED</div>
                            </div>
                            <div className="preview-footer">
                                <button onClick={() => setShowPreview(false)} className="btn-modify"><RotateCcw size={18} /> Re-Edit Canvas</button>
                                <button onClick={finalizeDesign} disabled={isSaving} className="btn-confirm">
                                    {isSaving ? 'MINTING MASTERPIECE...' : 'CONFIRM & MINT'} <CheckCircle2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Navbar />
            <div className="studio-main">
                <aside className="studio-sidebar">
                    <div className="sidebar-header"><Package size={18} color="#fbbf24" /><span>MATERIAL BIN</span></div>
                    <div className="category-tabs">
                        {['Chocolates', 'Flowers', 'Lighting', 'Ribbons'].map(cat => (
                            <button key={cat} className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
                        ))}
                    </div>
                    <div className="assets-grid">
                        {ASSETS.items.filter(i => i.category === selectedCategory).map(asset => (
                            <div key={asset.id} className="asset-card" draggable onDragStart={(e) => {e.dataTransfer.setData('artisan-item', JSON.stringify(asset))}} onClick={() => addItemToCanvas(asset)}>
                                <div className="card-inner">
                                    <img src={asset.url} alt={asset.name} />
                                    <div className="add-indicator"><Plus size={12} /></div>
                                </div>
                                <div className="asset-label">{asset.name}</div>
                            </div>
                        ))}
                    </div>
                </aside>

                <main className="studio-workspace">
                    <div className="workspace-header">
                        <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft size={18} /> WORKBENCH</button>
                        <div className="center-actions">
                            <button className={`ai-enhance-btn ${isEnhancing ? 'animating' : ''}`} onClick={enhanceAI}>
                                <Wand2 size={16} /> {isEnhancing ? 'RENDERING REALISM...' : 'AI STUDIO ENHANCE'}
                            </button>
                        </div>
                        <button className="btn-finalize" onClick={() => setShowPreview(true)}><Eye size={16} /> PREVIEW MASTERPIECE</button>
                    </div>
                    <div className="canvas-stage" ref={containerRef}>
                        <div className="canvas-glow"></div>
                        <canvas ref={canvasRef} id="artisan-canvas" />
                        <AnimatePresence>
                            {activeObject && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="object-controls">
                                    <div className="control-section"><label>LAYERING</label>
                                        <div className="control-row">
                                            <button onClick={() => handleAction('front')} title="Bring to Front"><Layers size={16} /></button>
                                            <button onClick={() => handleAction('back')} title="Send to Back"><Box size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="control-section"><label>ACTIONS</label>
                                        <button onClick={() => handleAction('delete')} className="delete-btn"><Trash2 size={16} /></button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            <style>{`
                .hamper-studio { height: 100vh; background: #020202; color: white; display: flex; flex-direction: column; overflow: hidden; font-family: 'Outfit', sans-serif; }
                .studio-main { flex: 1; display: flex; margin-top: 64px; }
                .studio-sidebar { width: 320px; background: #080808; border-right: 1px solid rgba(255,255,255,0.03); padding: 2rem; display: flex; flex-direction: column; }
                .sidebar-header { display: flex; align-items: center; gap: 0.75rem; font-weight: 900; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 2.5rem; color: #fbbf24; }
                .category-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }
                .cat-tab { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 0.5rem 0.8rem; border-radius: 8px; color: #71717a; font-size: 0.65rem; font-weight: 700; cursor: pointer; transition: 0.3s; }
                .cat-tab.active { background: #fbbf24; color: black; border-color: #fbbf24; }
                .assets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; overflow-y: auto; flex: 1; padding-right: 0.5rem; }
                .asset-card { display: flex; flex-direction: column; gap: 0.6rem; cursor: grab; }
                .card-inner { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; position: relative; transition: 0.3s; overflow: hidden; }
                .asset-card:hover .card-inner { border-color: #fbbf24; background: rgba(251, 191, 36, 0.05); transform: translateY(-5px); }
                .card-inner img { width: 75%; height: 75%; object-fit: contain; }
                .add-indicator { position: absolute; bottom: 0.5rem; right: 0.5rem; width: 24px; height: 24px; background: #fbbf24; color: black; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transform: translateY(10px); transition: 0.3s; }
                .asset-card:hover .add-indicator { opacity: 1; transform: translateY(0); }
                .asset-label { font-size: 0.65rem; color: #52525b; font-weight: 700; text-align: center; }
                
                .studio-workspace { flex: 1; background: #000; display: flex; flex-direction: column; position: relative; }
                .workspace-header { height: 72px; background: #080808; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .back-btn { background: none; border: none; color: #71717a; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.1em; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
                .ai-enhance-btn { background: #fbbf24; color: black; border: none; padding: 0.75rem 1.8rem; border-radius: 100px; font-weight: 900; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 15px 30px rgba(251,191,36,0.25); transition: 0.3s; }
                .ai-enhance-btn:hover { transform: scale(1.05); box-shadow: 0 20px 40px rgba(251,191,36,0.3); }
                .btn-finalize { background: rgba(255,255,255,0.02); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0.75rem 1.5rem; border-radius: 14px; font-weight: 800; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; transition: 0.3s; }
                .btn-finalize:hover { background: rgba(255,255,255,0.05); border-color: white; }
                
                .canvas-stage { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
                .canvas-glow { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(251, 191, 36, 0.05) 0%, transparent 70%); filter: blur(50px); pointer-events: none; }
                #artisan-canvas { border-radius: 12px; box-shadow: 0 60px 120px rgba(0,0,0,1); border: 1px solid rgba(255,255,255,0.05); }
                
                .object-controls { position: absolute; right: 2.5rem; top: 50%; transform: translateY(-50%); background: rgba(15, 15, 15, 0.85); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 1.8rem; display: flex; flex-direction: column; gap: 2rem; z-index: 500; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
                .control-section label { display: block; font-size: 0.55rem; color: #52525b; margin-bottom: 0.8rem; font-weight: 900; letter-spacing: 0.1em; }
                .control-row { display: flex; gap: 0.8rem; }
                .control-row button { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.05); color: #71717a; width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
                .control-row button:hover { color: white; background: #262626; border-color: #fbbf24; }
                .delete-btn { width: 100% !important; background: rgba(239, 68, 68, 0.05) !important; color: #ef4444 !important; border-color: rgba(239, 68, 68, 0.1) !important; }
                .delete-btn:hover { background: #ef4444 !important; color: white !important; }

                /* Premium Preview */
                .preview-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.92); backdrop-filter: blur(40px); display: flex; align-items: center; justify-content: center; padding: 2rem; }
                .preview-modal { background: #080808; border: 1px solid rgba(255,255,255,0.1); border-radius: 48px; width: 100%; max-width: 960px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 50px 100px rgba(0,0,0,1); }
                .preview-header { padding: 1.8rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .preview-content { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; padding: 2.5rem; background: #000; }
                .realistic-img { max-width: 100%; max-height: 520px; border-radius: 24px; box-shadow: 0 40px 80px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.05); }
                .preview-stamp { position: absolute; bottom: 4rem; right: 4rem; background: #fbbf24; color: black; font-weight: 900; font-size: 0.65rem; padding: 0.5rem 1rem; border-radius: 6px; letter-spacing: 0.05em; }
                .preview-footer { padding: 2.5rem; display: flex; justify-content: center; gap: 1.2rem; border-top: 1px solid rgba(255,255,255,0.03); }
                .btn-modify { background: #1a1a1a; color: #71717a; border: 1px solid rgba(255,255,255,0.08); padding: 1rem 2rem; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; transition: 0.3s; }
                .btn-confirm { background: #fbbf24; color: black; border: none; padding: 1rem 3rem; border-radius: 16px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 0.7rem; transition: 0.3s; box-shadow: 0 10px 20px rgba(251,191,36,0.2); }
                .btn-confirm:hover { transform: scale(1.05); box-shadow: 0 15px 30px rgba(251,191,36,0.3); }
            `}</style>
        </div>
    );
};

export default DesignCanvas;
