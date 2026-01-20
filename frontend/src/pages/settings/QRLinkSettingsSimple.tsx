import React, { useState, useEffect } from 'react';

const QRLinkSettingsSimple: React.FC = () => {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('✅ QRLinkSettingsSimple mounted');
    setStatus('Component berhasil dimuat!');
    
    // Test API
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Ada' : 'Tidak ada');
      
      const response = await fetch('http://localhost:3003/api/qr-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        setError(`API Error: ${response.status} - ${JSON.stringify(data)}`);
      } else {
        setStatus(`API berhasil! Total QR: ${data.qr_codes?.length || 0}`);
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(`Network Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#333' }}>QR Link Settings - Simple Test</h1>
      
      <div style={{ 
        padding: '15px', 
        margin: '10px 0', 
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '5px'
      }}>
        <h3>Status: {status}</h3>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          margin: '10px 0', 
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '5px',
          color: '#c62828'
        }}>
          <h3>Error:</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={testAPI}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test API Lagi
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Jika halaman ini tampil, berarti:</p>
        <ul>
          <li>✅ React component berfungsi</li>
          <li>✅ Routing berfungsi</li>
          <li>✅ Tidak ada error fatal</li>
        </ul>
        <p>Jika ada error API, kemungkinan:</p>
        <ul>
          <li>❌ Token tidak valid (login ulang)</li>
          <li>❌ Backend tidak berjalan</li>
          <li>❌ CORS issue</li>
        </ul>
      </div>
    </div>
  );
};

export default QRLinkSettingsSimple;
