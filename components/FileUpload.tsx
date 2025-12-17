import React, { useState } from 'react';

interface FileUploadProps {
  onDataLoaded: (raw: string, fileName: string) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onDataLoaded(text, file.name);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8 space-y-4">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          Universal Data Analyzer
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          The Universal Data Analyzer. Drop any CSV dataset to instantly generate a professional, AI-powered BI dashboard with insights, forecasts, and recommendations.
        </p>
      </div>

      <div 
        className={`relative w-full max-w-2xl p-12 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out bg-slate-800/50 backdrop-blur-sm
          ${dragActive ? 'border-cyan-400 bg-slate-800 scale-105 shadow-2xl shadow-cyan-900/50' : 'border-slate-600 hover:border-slate-500'}
          ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".csv" 
          onChange={handleChange} 
        />
        
        {isLoading ? (
           <div className="flex flex-col items-center space-y-4">
             <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-lg font-semibold text-cyan-400 animate-pulse">Analyzing Data Universe...</p>
           </div>
        ) : (
          <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
            <svg className={`w-20 h-20 mb-4 transition-colors ${dragActive ? 'text-cyan-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-2xl font-bold text-slate-200">Drop your CSV file here</span>
            <span className="mt-2 text-sm text-slate-400">or click to browse</span>
            <div className="mt-6 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-semibold transition-colors shadow-lg shadow-cyan-900/30">
              Select File
            </div>
          </label>
        )}
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl">
        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3">
             <span className="text-cyan-400 text-xl">📊</span>
          </div>
          <h3 className="font-semibold text-slate-200">Auto Visualization</h3>
          <p className="text-sm text-slate-500 mt-1">Automatically selects the best charts for your specific data structure.</p>
        </div>
        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
           <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
             <span className="text-purple-400 text-xl">🧠</span>
          </div>
          <h3 className="font-semibold text-slate-200">AI Insights</h3>
          <p className="text-sm text-slate-500 mt-1">Deep learning analysis to find hidden patterns and anomalies.</p>
        </div>
        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
           <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-3">
             <span className="text-emerald-400 text-xl">🔮</span>
          </div>
          <h3 className="font-semibold text-slate-200">Forecasting</h3>
          <p className="text-sm text-slate-500 mt-1">Predictive analytics to see future trends based on history.</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;