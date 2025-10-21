// src/components/DebugPanel.jsx
import React, { useState } from 'react';
import { runDiagnostics } from 'utils/diagnostics';

export default function DebugPanel() {
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);

  const onRun = async () => {
    setBusy(true);
    try {
      const res = await runDiagnostics();
      setOut(res);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        padding: '12px 14px',
        background: '#111',
        color: '#fff',
        borderRadius: 8,
        fontSize: 12,
        zIndex: 9999,
        maxWidth: 420,
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 700 }}>Diagnostics (temp)</div>
      <button
        onClick={onRun}
        disabled={busy}
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {busy ? 'Running…' : 'Run checks'}
      </button>
      {out && (
        <pre
          style={{
            marginTop: 10,
            maxHeight: 260,
            overflow: 'auto',
            background: '#1b1b1b',
            padding: 8,
            borderRadius: 6,
          }}
        >
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </div>
  );
}
