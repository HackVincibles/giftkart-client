import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Sparkles, 
  Zap, 
  Move, 
  Layers, 
  Hammer, 
  PenTool, 
  ChevronRight, 
  Activity,
  Maximize2,
  Image as ImageIcon,
  Clock,
  ExternalLink,
  Target
} from 'lucide-react';
import axios from 'axios';

const CreatorDashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/creator-dashboard');
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      setData({
        pendingOrders: 5,
        activeProducts: 12,
        totalEarnings: '45,000',
        rating: 4.9,
        orderQueue: [
            { _id: '1', order: { products: [{ name: 'Nebula Resin Desk' }] }, status: 'in-progress', userInputs: { description: 'Needs more gold leaf in the center' } },
            { _id: '2', order: { products: [{ name: 'Lunar Hand-Carved Lamp' }] }, status: 'new', userInputs: { description: 'Engrave "For Astra" on the base' } }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishMasterpiece = async (id) => {
      try {
          await axios.post(`/api/creator-dashboard/request-publication/${id}`);
          success?.("Publication request sent! Waiting for approval.");
          fetchDashboardData();
      } catch (err) {
          error?.("Failed to send publication request.");
      }
  };

  if (loading) return <div className="studio-loading">Initialising Artisan Studio...</div>;

  return (
    <div className="studio-container animate-fade-in">
      {/* Top Navigation / Status */}
      <header className="studio-header">
        <div className="header-left">
          <div className="status-indicator">
            <span className="pulse"></span>
            Studio Online
          </div>
          <h1 className="studio-title">Workbench: {user?.displayName || 'Artisan'}</h1>
        </div>
        
        <div className="header-actions">
          <div className="quick-stats">
            <div className="q-stat"><Clock size={14} /> <span>4h remaining in shift</span></div>
            <div className="q-stat"><Target size={14} /> <span>{data.pendingOrders} Tasks Pending</span></div>
          </div>
          <button className="studio-btn primary" onClick={() => navigate('/creator-dashboard/products/add')}>
            <PenTool size={16} /> <span>New Prototype</span>
          </button>
        </div>
      </header>

      {/* Main Studio Layout */}
      <div className="workbench-layout">
        
        {/* Left Side: Navigation / Tools (Rack) */}
        <aside className="studio-rack">
            <div className="rack-section">
                <h4 className="rack-label">Primary Tools</h4>
                <div className="rack-item" onClick={() => navigate('/creator-dashboard')}><Hammer size={20} /><span>Workshop</span></div>
                <div className="rack-item" onClick={() => navigate('/creator-dashboard/products')}><Layers size={20} /><span>Material Bin</span></div>
                <div className="rack-item" onClick={() => navigate('/creator-dashboard/canvas')}><Maximize2 size={20} /><span>Canvas UI</span></div>
                <div className="rack-item" onClick={() => navigate('/vibe-coder')}><PenTool size={20} /><span>Design Hub</span></div>
            </div>

            <div className="rack-section mt-8">
                <h4 className="rack-label">Business</h4>
                <div className="rack-item" onClick={() => navigate('/creator-dashboard/revenue')}><Activity size={20} /><span>Yields</span></div>
                <div className="rack-item" onClick={() => navigate('/inspiration')}><ImageIcon size={20} /><span>Gallery</span></div>
            </div>
        </aside>

        {/* Center Section: Main Content (Filling the Gap) */}
        <main className="studio-main">
            
            {/* Row 1: Featured "Masterpiece" + Inspiration Moodboard */}
            <div className="studio-top-row">
                <div className="masterpiece-card">
                    <div className="master-badge">CURRENT FOCUS</div>
                    <div className="master-preview">
                        <div className="abstract-art">
                            <div className="circle-grad"></div>
                            <Box size={48} strokeWidth={1} className="floating-box" />
                        </div>
                    </div>
                    <div className="master-details">
                        <h2>Nebula Resin Desk #04</h2>
                        <p>Phase: <strong>Material Setting</strong></p>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: '65%' }}></div>
                        </div>
                        <button 
                            className="studio-btn secondary small-btn" 
                            onClick={() => navigate('/creator-dashboard/canvas')}
                        >
                            Resume Crafting <ExternalLink size={12} />
                        </button>
                    </div>
                </div>

                <div className="moodboard-card">
                    <h3>Aesthetic Moodboard</h3>
                    <div className="mood-grid">
                        <div className="mood-item" style={{ background: '#1a1a1a' }}></div>
                        <div className="mood-item" style={{ background: 'var(--accent)', opacity: 0.3 }}></div>
                        <div className="mood-item" style={{ background: '#2d2d2d' }}></div>
                        <div className="mood-item" style={{ background: 'linear-gradient(45deg, #1e1b4b, #312e81)' }}></div>
                    </div>
                    <p className="mood-caption">Collection: "Midnight Celestial"</p>
                    <button className="text-btn">Update Moodboard (Pro)</button>
                </div>
            </div>

            {/* Row 2: Artisan Vault (My Creations) */}
            <div className="vault-section">
                <div className="section-header">
                    <h2>Artisan Vault</h2>
                    <span className="count-pill">{data.masterpieces?.length || 0} MASTERPIECES</span>
                </div>
                <div className="vault-grid">
                    {data.masterpieces?.map((piece, idx) => (
                        <div key={idx} className="vault-card animate-fade-in">
                            <div className="vault-preview">
                                <img src={piece.previewUrl} alt="Masterpiece" />
                                <div className="vault-overlay">
                                    <button className="view-btn"><ImageIcon size={14} /> View Render</button>
                                </div>
                            </div>
                            <div className="vault-info">
                                <h4>{piece.order?.products[0]?.name || piece.blueprint?.prototypeName || "Custom Masterpiece"}</h4>
                                <div className="vault-meta">
                                    <span>{new Date(piece.updatedAt).toLocaleDateString()}</span>
                                    <span className={`status-badge ${piece.status}`}>{piece.status.replace('_', ' ')}</span>
                                </div>
                                {piece.status === 'finalized' && (
                                    <button 
                                        className="publish-btn-mini" 
                                        onClick={() => handlePublishMasterpiece(piece._id)}
                                    >
                                        <Zap size={12} /> Publish to Market
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!data.masterpieces || data.masterpieces.length === 0) && (
                        <div className="empty-vault">
                            <Box size={40} opacity={0.2} />
                            <p>No masterpieces minted yet. Launch the studio to begin.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 3: Detailed Queue List */}
            <div className="queue-section">
                <div className="section-header">
                    <h2>Creation Pipeline</h2>
                    <span className="count-pill">{data.orderQueue?.length || 0} ACTIVE</span>
                </div>
                
                <div className="queue-grid">
                    {/* Render Real Vibe-Requests from Buyers */}
                    {data.vibeRequests?.map((item, idx) => (
                        <div key={idx} className="queue-node animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="node-status" style={{ background: 'var(--accent)' }}></div>
                            <div className="node-main">
                                <div className="node-head">
                                    <h4>{item.blueprint?.prototypeName}</h4>
                                    <span className="node-time">New Vibe</span>
                                </div>
                                <p className="node-desc">"{item.vibeInput}"</p>
                                <div className="node-foot">
                                    <div className="buyer-tag">Requested by {item.buyer?.displayName || 'Anonymous'}</div>
                                    <div className="node-actions">
                                        <button className="icon-action" onClick={() => navigate(`/creator-dashboard/canvas/${item._id}`)}><Zap size={14} /></button>
                                        <button className="primary-action" onClick={() => navigate(`/creator-dashboard/canvas/${item._id}`)}>Realize Design</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Render Traditional Order Queue */}
                    {data.orderQueue?.map((item, idx) => (
                        <div key={`ord-${idx}`} className="queue-node">
                            <div className="node-status" style={{ background: item.status === 'in-progress' ? '#3b82f6' : '#f59e0b' }}></div>
                            <div className="node-main">
                                <div className="node-head">
                                    <h4>{item.order?.products[0]?.name}</h4>
                                    <span className="node-time">Order #{item._id.slice(-4)}</span>
                                </div>
                                <p className="node-desc">Standard Customization Request</p>
                                <div className="node-foot">
                                    <div className="buyer-tag">Ordered by {item.order?.buyer?.displayName || 'Buyer'}</div>
                                    <div className="node-actions">
                                        <button className="icon-action" onClick={() => navigate('/creator-dashboard/canvas')}><Zap size={14} /></button>
                                        <button className="primary-action" onClick={() => navigate('/creator-dashboard/canvas')}>Realize</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </main>

        {/* Right Side: AI & Analytics (The Intel Panel) */}
        <aside className="studio-intel">
            <div className="intel-block ai-insight">
                <div className="intel-header">
                    <Sparkles size={16} color="var(--accent)" />
                    <span>AI STUDIO INSIGHT</span>
                </div>
                <h3>Artisan Trend Alert</h3>
                <p>Minimalist marble-resin fusions are gaining <strong>24% more engagement</strong> this month.</p>
                <div className="trend-visual">
                    <div className="wave-container">
                        <div className="wave"></div>
                    </div>
                </div>
                <button className="studio-btn secondary full-width" onClick={() => navigate('/vibe-coder')}>
                    Generate Blueprints
                </button>
            </div>

            <div className="intel-block yield-card">
                <span className="label">Monthly Yield</span>
                <h2>₹{data.totalEarnings}</h2>
                <div className="mini-chart">
                    {[30, 50, 40, 70, 90, 60, 85].map((h, i) => (
                        <div key={i} className="m-bar" style={{ height: `${h}%` }}></div>
                    ))}
                </div>
            </div>
        </aside>

      </div>

      <style>{`
        .studio-container {
          padding: 2rem 3rem;
          background: var(--bg);
          min-height: 100vh;
        }

        .studio-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3.5rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-light);
          font-weight: 800;
          margin-bottom: 0.8rem;
        }

        .studio-title {
          font-size: 2.8rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .quick-stats {
          display: flex;
          gap: 1.5rem;
        }

        .q-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* Layout Grid */
        .workbench-layout {
          display: grid;
          grid-template-columns: 200px 1fr 300px;
          gap: 3.5rem;
        }

        /* Sidebar Rack */
        .vault-section { margin-bottom: 3.5rem; }
        .vault-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .vault-card { background: rgba(255,255,255,0.015); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; transition: all 0.3s; }
        .vault-card:hover { transform: scale(1.02); border-color: var(--accent); }
        .vault-preview { position: relative; aspect-ratio: 1; background: #000; overflow: hidden; }
        .vault-preview img { width: 100%; height: 100%; object-fit: cover; }
        .vault-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; }
        .vault-card:hover .vault-overlay { opacity: 1; }
        .view-btn { background: white; color: black; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 800; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
        .vault-info { padding: 1.2rem; }
        .vault-info h4 { font-size: 0.9rem; margin-bottom: 0.5rem; }
        .vault-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; color: var(--text-muted); }
        .status-badge { color: #71717a; font-weight: 800; text-transform: uppercase; font-size: 0.6rem; }
        .status-badge.finalized { color: #fbbf24; }
        .status-badge.pending_publication { color: #3b82f6; }
        .status-badge.published { color: #10b981; }
        
        .publish-btn-mini { width: 100%; margin-top: 1rem; background: #fbbf24; color: black; border: none; padding: 0.5rem; border-radius: 8px; font-weight: 800; font-size: 0.65rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem; transition: 0.2s; }
        .publish-btn-mini:hover { transform: scale(1.02); box-shadow: 0 5px 15px rgba(251,191,36,0.2); }
        
        .empty-vault { grid-column: 1 / -1; padding: 4rem; text-align: center; background: rgba(255,255,255,0.01); border: 2px dashed var(--border); border-radius: 32px; color: var(--text-muted); }
        
        .queue-section {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .rack-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          padding-left: 1rem;
        }

        .rack-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1.2rem;
          border-radius: 12px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .rack-item:hover, .rack-item.active {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text);
          box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.02);
        }

        .rack-item.active {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Main Content Stage */
        .studio-main {
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
        }

        .studio-top-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2.5rem;
        }

        .masterpiece-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 2.5rem;
          display: flex;
          gap: 2rem;
          position: relative;
          overflow: hidden;
        }

        .master-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          font-size: 0.6rem;
          font-weight: 900;
          color: var(--accent);
          background: rgba(139, 92, 246, 0.1);
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
        }

        .master-preview {
          width: 160px;
          height: 160px;
          background: #0a0a0a;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }

        .abstract-art {
          position: relative;
        }

        .circle-grad {
          position: absolute;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
          filter: blur(20px);
          opacity: 0.4;
        }

        .master-details h2 {
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .master-details p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .progress-bar-container {
          height: 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          margin-bottom: 2rem;
        }

        .progress-bar {
          height: 100%;
          background: var(--accent);
          box-shadow: 0 0 10px var(--accent);
          border-radius: 3px;
        }

        .moodboard-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 2rem;
        }

        .moodboard-card h3 {
          font-size: 1rem;
          font-weight: 800;
          margin-bottom: 1.2rem;
        }

        .mood-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          height: 80px;
          margin-bottom: 1rem;
        }

        .mood-item {
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .mood-caption {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-bottom: 1rem;
        }

        /* Creation Pipeline Section */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .count-pill {
          font-size: 0.65rem;
          font-weight: 900;
          background: var(--bg-tertiary);
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          color: var(--text-muted);
        }

        .queue-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .queue-node {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 1.5rem;
          display: flex;
          gap: 1.2rem;
          transition: transform 0.3s;
        }

        .queue-node:hover {
          transform: translateY(-5px);
          border-color: var(--text-light);
        }

        .node-status {
          width: 4px;
          height: 60px;
          border-radius: 2px;
          margin-top: 5px;
        }

        .node-main { flex: 1; }

        .node-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .node-head h4 { font-size: 0.95rem; font-weight: 800; margin: 0; }
        .node-time { font-size: 0.7rem; color: var(--text-muted); }

        .node-desc {
          font-size: 0.8rem;
          color: var(--accent);
          font-style: italic;
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }

        .node-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .buyer-tag { font-size: 0.7rem; color: var(--text-light); }

        .node-actions { display: flex; gap: 0.5rem; }

        .icon-action {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .primary-action {
          padding: 0.4rem 1rem;
          background: var(--text);
          color: var(--bg);
          border: none;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
        }

        /* Intel Panel */
        .intel-block {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .intel-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.65rem;
          font-weight: 900;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-bottom: 1.2rem;
        }

        .yield-card .label { font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem; display: block; }
        .yield-card h2 { font-size: 2rem; font-weight: 900; margin-bottom: 1.5rem; }

        .mini-chart {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 50px;
        }

        .m-bar {
          flex: 1;
          background: var(--border);
          border-radius: 3px;
        }

        .studio-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          font-size: 0.85rem;
        }

        .studio-btn.primary { background: var(--text); color: var(--bg); }
        .studio-btn.secondary { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); }
        .full-width { width: 100%; }
        .mt-8 { margin-top: 2rem; }

        .text-btn { background: none; border: none; color: var(--text-muted); font-size: 0.75rem; font-weight: 700; cursor: pointer; padding: 0; }
        .text-btn:hover { color: var(--text); }

        @media (max-width: 1280px) {
          .workbench-layout { grid-template-columns: 200px 1fr; }
          .studio-intel { display: none; }
        }

        @media (max-width: 1024px) {
          .studio-top-row { grid-template-columns: 1fr; }
          .queue-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default CreatorDashboardHome;
