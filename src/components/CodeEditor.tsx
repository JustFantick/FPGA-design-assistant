'use client';

import { Editor } from '@monaco-editor/react';
import { useAppStore } from '@/store/useAppStore';
import { Box } from '@mui/material';

export default function CodeEditor() {
  const { vhdlCode, setVhdlCode } = useAppStore();

  return (
    <Box sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Editor
        height="100%"
        defaultLanguage="vhdl"
        value={vhdlCode}
        onChange={(value) => setVhdlCode(value || '')}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </Box>
  );
}
