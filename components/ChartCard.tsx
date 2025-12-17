import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area
} from 'recharts';
import { ChartConfig, DataRow } from '../types';
import { processChartData } from '../utils';

interface ChartCardProps {
  config: ChartConfig;
  data: DataRow[];
  onFilterClick?: (column: string, value: string) => void;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl z-50">
        <p className="font-semibold text-slate-200 mb-1">{label}</p>
        {payload.map((p: any, idx: number) => (
           <p key={idx} className="text-sm" style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{
              typeof p.value === 'number' ? p.value.toLocaleString() : p.value
            }</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard: React.FC<ChartCardProps> = ({ config, data, onFilterClick }) => {
  const chartData = React.useMemo(() => processChartData(data, config), [data, config]);
  
  // Handler for direct element clicks (Bar, Pie, Scatter)
  const handleElementClick = (data: any) => {
    if (!onFilterClick) return;
    
    // Recharts usually passes the data object or payload
    const item = data.payload || data;
    if (item && item[config.xAxisKey] !== undefined) {
      onFilterClick(config.xAxisKey, String(item[config.xAxisKey]));
    }
  };

  // Handler for Chart wrapper clicks (Line, Area) which use activePayload
  const handleChartClick = (state: any) => {
    if (!onFilterClick || !state || !state.activePayload || state.activePayload.length === 0) return;
    
    const item = state.activePayload[0].payload;
    if (item && item[config.xAxisKey] !== undefined) {
      onFilterClick(config.xAxisKey, String(item[config.xAxisKey]));
    }
  };

  const cursorStyle = onFilterClick ? { cursor: 'pointer' } : {};

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={config.dataKey} 
                fill="#06b6d4" 
                radius={[4, 4, 0, 0]} 
                onClick={handleElementClick}
                cursor={onFilterClick ? "pointer" : "default"}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} onClick={handleChartClick} style={cursorStyle}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                dot={{ fill: '#8b5cf6', r: 4 }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={handleChartClick} style={cursorStyle}>
              <defs>
                <linearGradient id={`color${config.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey={config.xAxisKey} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke="#10b981" 
                fillOpacity={1} 
                fill={`url(#color${config.id})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey={config.dataKey}
                onClick={handleElementClick}
                cursor={onFilterClick ? "pointer" : "default"}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis type="category" dataKey={config.xAxisKey} name={config.xAxisKey} stroke="#94a3b8" fontSize={12} />
              <YAxis type="number" dataKey={config.dataKey} name={config.dataKey} stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name={config.title} 
                data={chartData} 
                fill="#ec4899" 
                onClick={handleElementClick}
                cursor={onFilterClick ? "pointer" : "default"}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg hover:shadow-cyan-900/10 transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-100">{config.title}</h3>
        <p className="text-xs text-slate-400">{config.description}</p>
      </div>
      <div className="h-64 w-full">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartCard;