import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (isScanning && scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setIsScanning(false);
          if (onScan) onScan(decodedText);
        },
        (error) => {
          // Error de escaneo - no hacer nada, es normal
        }
      );

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [isScanning, onScan]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim() && onScan) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setIsScanning(!isScanning)}
          className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'}`}
        >
          {isScanning ? 'Cerrar Cámara' : 'Escanear QR con Cámara'}
        </button>
        
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>o ingresa manualmente:</span>
      </div>

      {isScanning && (
        <div 
          id="qr-reader" 
          ref={scannerRef}
          style={{
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '15px',
            maxWidth: '500px'
          }}
        />
      )}

      <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="TKT-XXXXXXXX o escanea el QR"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-success">
          Buscar
        </button>
      </form>
    </div>
  );
};

export default QRScanner;
