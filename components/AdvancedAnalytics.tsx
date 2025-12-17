import React, { useState } from 'react';
import { 
  ComposedChart, LineChart, Line, BarChart, Bar, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Cell 
} from 'recharts';
import { AdvancedAnalyticsResult } from '../types';

interface AdvancedAnalyticsProps {
  data: AdvancedAnalyticsResult;
  onClose: () => void;
}

type TabType = 'forecast' | 'regression' | 'clustering' | 'distribution';

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('forecast');

  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  const renderContent = () => {
    switch (activeTab) {
      case 'forecast':
        if (!data.forecast.suitable) return <NotSuitable message="No time-series data detected for forecasting." />;
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
               <h3 className="text-xl font-bold text-emerald-400 mb-1">{data.forecast.label}</h3>
               <p className="text-slate-400 text-sm">{data.forecast.insight}</p>
            </div>
            <div className="flex-grow min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.forecast.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.type === 'forecast') return <circle cx={cx} cy={cy} r={4} fill="#fbbf24" stroke="none" />;
                        return <circle cx={cx} cy={cy} r={0} />;
                    }}
                    name="Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-4 text-sm justify-center">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Historical
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-400 rounded-full"></span> Predicted
                </div>
            </div>
          </div>
        );

      case 'regression':
        if (!data.regression.suitable) return <NotSuitable message="Insufficient correlation found for regression analysis." />;
        return (
          <div className="h-full flex flex-col">
             <div className="mb-4">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-400 mb-1">{data.regression.label}</h3>
                    <p className="text-slate-400 text-sm">{data.regression.insight}</p>
                  </div>
                  <div className="bg-slate-700 px-3 py-1 rounded text-xs font-mono text-cyan-300">
                    R² = {data.regression.rSquared.toFixed(3)}
                  </div>
               </div>
            </div>
            <div className="flex-grow min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.regression.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis 
                    dataKey="x" 
                    type="number" 
                    name={data.regression.xAxis} 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    domain={['auto', 'auto']}
                    label={{ value: data.regression.xAxis, position: 'insideBottom', offset: -5, fill: '#64748b' }}
                  />
                  <YAxis 
                    type="number" 
                    name={data.regression.yAxis} 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    label={{ value: data.regression.yAxis, angle: -90, position: 'insideLeft', fill: '#64748b' }}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                  <Legend />
                  <Scatter name="Actual Data" dataKey="y" fill="#06b6d4" fillOpacity={0.6} />
                  <Line 
                    type="monotone" 
                    dataKey="regressionLine" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={false} 
                    name="Regression Line" 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'clustering':
        if (!data.clustering.suitable) return <NotSuitable message="Could not identify distinct clusters in the data." />;
        
        // Group data by cluster for color assignment
        return (
          <div className="h-full flex flex-col">
             <div className="mb-4">
               <h3 className="text-xl font-bold text-purple-400 mb-1">{data.clustering.label}</h3>
               <p className="text-slate-400 text-sm">{data.clustering.insight}</p>
            </div>
            <div className="flex-grow min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis type="number" dataKey="x" name={data.clustering.xAxis} stroke="#94a3b8" fontSize={12} />
                  <YAxis type="number" dataKey="y" name={data.clustering.yAxis} stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const pt = payload[0].payload;
                            return (
                                <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-xl text-sm">
                                    <p className="font-bold text-white mb-1">{pt.name}</p>
                                    <p style={{color: '#a78bfa'}}>Cluster: {pt.cluster}</p>
                                    <p className="text-slate-400">X: {pt.x}, Y: {pt.y}</p>
                                </div>
                            )
                        }
                        return null;
                    }}
                  />
                  <Legend />
                  {/* We can map clusters manually if we pre-processed, but for dynamic we use cell */}
                  <Scatter name="Clusters" data={data.clustering.data} fill="#8884d8">
                    {data.clustering.data.map((entry, index) => {
                       // Simple hash for color consistency based on cluster name
                       const colorIdx = entry.cluster.length % COLORS.length;
                       return <Cell key={`cell-${index}`} fill={COLORS[colorIdx]} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'distribution':
        if (!data.distribution.suitable) return <NotSuitable message="Data not suitable for distribution analysis." />;
        return (
          <div className="h-full flex flex-col">
             <div className="mb-4">
               <h3 className="text-xl font-bold text-amber-400 mb-1">{data.distribution.label}</h3>
               <p className="text-slate-400 text-sm">{data.distribution.insight}</p>
            </div>
            <div className="flex-grow min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.distribution.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                   />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {data.distribution.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      
      default: return null;
    }
  };

  const NotSuitable = ({ message }: { message: string }) => (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
        <span className="text-4xl mb-4">⚠️</span>
        <p>{message}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  Advanced AI Analytics
              </h2>
              <p className="text-sm text-slate-400">Deep Learning & Machine Learning Models</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex flex-grow overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-slate-800/30 border-r border-slate-800 p-4 flex flex-col gap-2">
                <NavButton 
                    active={activeTab === 'forecast'} 
                    onClick={() => setActiveTab('forecast')} 
                    icon="📈" 
                    label="Forecast" 
                    desc="Time-Series Prediction"
                />
                <NavButton 
                    active={activeTab === 'regression'} 
                    onClick={() => setActiveTab('regression')} 
                    icon="📉" 
                    label="Regression" 
                    desc="Linear/Logistic Models"
                />
                <NavButton 
                    active={activeTab === 'clustering'} 
                    onClick={() => setActiveTab('clustering')} 
                    icon="🧩" 
                    label="Clustering" 
                    desc="K-Means / KNN"
                />
                <NavButton 
                    active={activeTab === 'distribution'} 
                    onClick={() => setActiveTab('distribution')} 
                    icon="📊" 
                    label="Distribution" 
                    desc="Histogram Analysis"
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-grow p-8 bg-slate-900 overflow-y-auto">
                {renderContent()}
            </div>
        </div>

      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, desc }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 border ${
            active 
            ? 'bg-slate-700/50 border-cyan-500/30 shadow-lg shadow-cyan-900/20' 
            : 'hover:bg-slate-800 border-transparent hover:border-slate-700'
        }`}
    >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
            active ? 'bg-cyan-500/20' : 'bg-slate-800'
        }`}>
            {icon}
        </div>
        <div>
            <p className={`font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>{label}</p>
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
    </button>
);

export default AdvancedAnalytics;
