"use client";
interface Props {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageViewerModal({ imageUrl, onClose }: Props) {
  const styles: { [key: string]: React.CSSProperties } = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, cursor: 'pointer', animation: 'fadeIn 0.2s ease-in-out' },
    image: { maxHeight: '90%', maxWidth: '90%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },
    closeButton: { position: 'absolute', top: '20px', right: '20px', color: 'white', fontSize: '2rem', border: 'none', background: 'none' }
  };

  return (
    <>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div style={styles.overlay} onClick={onClose}>
        <button style={styles.closeButton}>&times;</button>
        <img src={imageUrl} alt="Profile full view" style={styles.image} />
      </div>
    </>
  );
}