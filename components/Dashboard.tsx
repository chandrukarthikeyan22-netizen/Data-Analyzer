import React, { useState, useMemo } from 'react';
import { DashboardConfig, DataRow, ColumnInfo } from '../types';
import ChartCard from './ChartCard';
import { calculateKPI } from '../utils';

interface DashboardProps {
  config: DashboardConfig;
  data: DataRow[];
  columns: ColumnInfo[];
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ config, data, columns, onReset }) => {
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Get string columns for filter dropdowns
  const filterableColumns = columns.filter(c => c.type === 'string' && c.uniqueValues > 1 && c.uniqueValues < 30);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(row[key]) === value;
      });
    });
  }, [data, filters]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="bg-cyan-500/10 p-2 rounded-lg">
                <span className="text-2xl">🚀</span>
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight">{config.title}</h1>
          </div>
          <p className="text-slate-400 text-sm ml-14">Domain: <span className="text-cyan-400 font-semibold">{config.domain}</span></p>
        </div>
        
        <div className="flex gap-3">
             <button 
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            Upload New File
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-900/50 transition-colors">
            Export Report
          </button>
        </div>
      </header>

      {/* Dynamic Filters Area */}
      <div className="mb-8">
        {/* Active Filters Chips */}
        {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-cyan-900/10 rounded-xl border border-cyan-500/20">
                <span className="text-xs font-bold text-cyan-400 uppercase mr-2">Active Filters:</span>
                {Object.entries(filters).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-sm animate-fadeIn">
                        <span className="font-semibold">{key}:</span> {value}
                        <button onClick={() => removeFilter(key)} className="hover:text-white ml-1 font-bold">×</button>
                    </div>
                ))}
                <button 
                    onClick={() => setFilters({})} 
                    className="text-xs text-slate-400 hover:text-white underline ml-2 transition-colors"
                >
                    Clear All
                </button>
            </div>
        )}

        {/* Dropdown Filters */}
        {filterableColumns.length > 0 && (
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 mb-3 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Data Filters
            </div>
            <div className="flex flex-wrap gap-4">
                {filterableColumns.map(col => {
                const options = Array.from(new Set(data.map(r => String(r[col.name] || '')))).sort();
                return (
                    <div key={col.name} className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-medium ml-1">{col.name}</label>
                    <select
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-40 p-2.5"
                        value={filters[col.name] || ''}
                        onChange={(e) => handleFilterChange(col.name, e.target.value)}
                    >
                        <option value="">All</option>
                        {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    </div>
                );
                })}
            </div>
            </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {config.kpis.map((kpi, idx) => (
          <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <span className="text-6xl">📊</span>
            </div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-1">{kpi.label}</p>
            <p className="text-3xl font-extrabold text-white">
              {calculateKPI(filteredData, kpi)}
            </p>
            <p className="text-xs text-slate-500 mt-2">Based on {kpi.operation} of {kpi.column}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {config.charts.map((chartConfig) => (
          <ChartCard 
            key={chartConfig.id} 
            config={chartConfig} 
            data={filteredData} 
            onFilterClick={handleFilterChange}
          />
        ))}
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistical Analysis */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
           <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
             <span className="text-purple-400">🧠</span> AI Statistical Analysis & Summary
           </h3>
           <div className="prose prose-invert max-w-none">
             <p className="text-slate-300 leading-relaxed whitespace-pre-line">{config.summary}</p>
             <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <h4 className="font-semibold text-purple-300 mb-2 text-sm uppercase">Statistical Test Results</h4>
                <p className="text-slate-400 text-sm italic">{config.statisticalAnalysis}</p>
             </div>
             {config.forecastAnalysis && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <h4 className="font-semibold text-emerald-300 mb-2 text-sm uppercase">Future Forecast</h4>
                    <p className="text-slate-400 text-sm italic">{config.forecastAnalysis}</p>
                </div>
             )}
           </div>
        </div>

        {/* Recommendations Panel */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-amber-400">💡</span> Strategic Recommendations
          </h3>
          <div className="space-y-4">
            {config.recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700 hover:border-amber-500/30 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-300">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;