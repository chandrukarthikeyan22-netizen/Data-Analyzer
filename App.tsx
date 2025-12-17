import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { parseCSV, getColumnInfo } from './utils';
import { analyzeData } from './services/geminiService';
import { DashboardConfig, DataRow, ColumnInfo } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<DataRow[] | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataLoaded = async (rawText: string, fileName: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Parse CSV
      const parsedData = parseCSV(rawText);
      if (parsedData.length === 0) {
        throw new Error("Parsed data is empty. Please check the file format.");
      }

      // 2. Extract Columns Info
      const cols = getColumnInfo(parsedData);
      setData(parsedData);
      setColumns(cols);

      // 3. Send sample to Gemini for analysis
      const config = await analyzeData(cols, parsedData); // slice handled in service
      setDashboardConfig(config);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setDashboardConfig(null);
    setColumns([]);
    setError(null);
  };

  // If no API key is present (for dev safety, though environment variable is expected)
  if (!process.env.API_KEY) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
         <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">API Key Missing</h2>
            <p className="text-slate-400">Please provide a valid `process.env.API_KEY` to run Universal Data Analyzer.</p>
         </div>
       </div>
     )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 backdrop-blur-md">
           <span className="text-xl">⚠️</span>
           <div>
             <h4 className="font-bold text-sm">Analysis Failed</h4>
             <p className="text-xs opacity-80">{error}</p>
           </div>
           <button onClick={() => setError(null)} className="ml-4 hover:text-white">✕</button>
        </div>
      )}

      {!data || !dashboardConfig ? (
        <FileUpload onDataLoaded={handleDataLoaded} isLoading={loading} />
      ) : (
        <Dashboard 
          config={dashboardConfig} 
          data={data} 
          columns={columns} 
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default App;