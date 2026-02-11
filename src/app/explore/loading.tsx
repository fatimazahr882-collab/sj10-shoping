export default function Loading() {
  return (
    <div className="explore-loading-container">
      <div className="sk-header">
        <div className="sk-title"></div>
        <div className="sk-search"></div>
      </div>
      <div className="sk-grid">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="sk-card"></div>
        ))}
      </div>
      <style>{`
        .explore-loading-container { padding-top: 130px; max-width: 1400px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
        .sk-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .sk-title { width: 200px; height: 40px; background: #eee; border-radius: 8px; }
        .sk-search { width: 300px; height: 40px; background: #eee; border-radius: 8px; }
        .sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        .sk-card { aspect-ratio: 4/5; background: #eee; border-radius: 12px; animation: pulse 1.5s infinite ease-in-out; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        @media (max-width: 768px) {
           .sk-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
           .sk-header { flex-direction: column; gap: 10px; }
           .sk-search { width: 100%; }
        }
      `}</style>
    </div>
  );
}