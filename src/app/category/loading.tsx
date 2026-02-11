export default function CategoryPageLoading() {
  return (
    <div className="sk-container">
      {/* GLOBAL SKELETON STYLES */}
      <style>{`
        .sk-container { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; overflow: hidden; }
        .sk-header { height: 50px; border-bottom: 1px solid #e2e8f0; background: #fff; padding: 0 16px; display: flex; align-items: center; }
        .sk-layout { display: flex; flex: 1; height: calc(100vh - 50px); }
        
        /* Sidebar Skeleton */
        .sk-sidebar { width: 85px; background: #fff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; padding-top: 10px; }
        .sk-cat-item { height: 90px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-bottom: 1px solid #f8fafc; }
        .sk-circle { width: 45px; height: 45px; border-radius: 50%; }
        .sk-text-mini { width: 50px; height: 8px; border-radius: 2px; }

        /* Content Skeleton */
        .sk-content { flex: 1; padding: 16px; overflow: hidden; }
        .sk-group { margin-bottom: 30px; }
        .sk-title-row { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
        .sk-pill { width: 4px; height: 20px; border-radius: 2px; }
        .sk-title { width: 120px; height: 16px; border-radius: 4px; }
        
        .sk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (min-width: 768px) { .sk-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); } }
        
        .sk-sub-item { height: 120px; background: #fff; border-radius: 12px; padding: 10px; border: 1px solid #e2e8f0; }
        .sk-box { width: 100%; aspect-ratio: 1; border-radius: 8px; margin-bottom: 8px; }
        .sk-line { width: 80%; height: 10px; border-radius: 2px; margin: 0 auto; }

        /* SHIMMER ANIMATION */
        .shimmer {
          background: #f1f5f9;
          background-image: linear-gradient(to right, #f1f5f9 0%, #e2e8f0 20%, #f1f5f9 40%, #f1f5f9 100%);
          background-repeat: no-repeat;
          background-size: 800px 100%; 
          animation: shimmer 1.5s infinite linear forwards;
        }
        @keyframes shimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }
      `}</style>

      <div className="sk-header">
        <div className="sk-title shimmer" style={{width: '100px'}}></div>
      </div>

      <div className="sk-layout">
        {/* Sidebar */}
        <div className="sk-sidebar">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="sk-cat-item">
              <div className="sk-circle shimmer"></div>
              <div className="sk-text-mini shimmer"></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="sk-content">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="sk-group">
              <div className="sk-title-row">
                <div className="sk-pill shimmer" style={{background:'#cbd5e1'}}></div>
                <div className="sk-title shimmer"></div>
              </div>
              <div className="sk-grid">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="sk-sub-item">
                    <div className="sk-box shimmer"></div>
                    <div className="sk-line shimmer"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}