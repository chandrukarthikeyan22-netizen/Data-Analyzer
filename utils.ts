import { DataRow, ColumnInfo, ChartConfig, KPIConfig } from './types';

// Simple CSV Parser
export const parseCSV = (text: string): DataRow[] => {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle split by comma but ignore commas inside quotes
    const rowRaw = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Fallback for simple split if regex fails or simple CSV
    const rowValues = rowRaw || lines[i].split(','); 
    
    if (rowValues.length !== headers.length) continue; // Skip malformed rows

    const row: DataRow = {};
    headers.forEach((header, index) => {
      let val: string | number | boolean = rowValues[index]?.replace(/^"|"$/g, '').trim() || '';
      
      // Type inference
      if (!isNaN(Number(val)) && val !== '') {
        val = Number(val);
      } else if (val.toLowerCase() === 'true') {
        val = true;
      } else if (val.toLowerCase() === 'false') {
        val = false;
      }
      row[header] = val;
    });
    data.push(row);
  }
  return data;
};

export const getColumnInfo = (data: DataRow[]): ColumnInfo[] => {
  if (data.length === 0) return [];
  const headers = Object.keys(data[0]);
  
  return headers.map(name => {
    const sample = data.find(row => row[name] !== null && row[name] !== '');
    const val = sample ? sample[name] : '';
    let type: ColumnInfo['type'] = 'string';
    
    if (typeof val === 'number') type = 'number';
    else if (typeof val === 'boolean') type = 'boolean';
    else if (!isNaN(Date.parse(String(val)))) type = 'date';

    const uniqueValues = new Set(data.map(r => String(r[name]))).size;

    return { name, type, uniqueValues };
  });
};

// Aggregation logic for charts
export const processChartData = (data: DataRow[], config: ChartConfig) => {
  if (config.aggregation === 'raw') {
    // For scatter plots, return limited raw data to avoid performance hits
    return data.slice(0, 500).map(row => ({
      [config.xAxisKey]: row[config.xAxisKey],
      [config.dataKey]: row[config.dataKey],
      name: row[config.xAxisKey] // Label for tooltips
    }));
  }

  // Grouping and Aggregation
  const grouped: Record<string, number[]> = {};

  data.forEach(row => {
    const key = String(row[config.xAxisKey] || 'Unknown');
    const val = Number(row[config.dataKey]) || 0;
    
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(val);
  });

  return Object.keys(grouped).map(key => {
    const values = grouped[key];
    let result = 0;
    
    switch (config.aggregation) {
      case 'sum': result = values.reduce((a, b) => a + b, 0); break;
      case 'avg': result = values.reduce((a, b) => a + b, 0) / values.length; break;
      case 'max': result = Math.max(...values); break;
      case 'min': result = Math.min(...values); break;
      case 'count': result = values.length; break;
    }

    return {
      [config.xAxisKey]: key,
      [config.dataKey]: parseFloat(result.toFixed(2)),
      name: key
    };
  }).sort((a, b) => (b[config.dataKey] as number) - (a[config.dataKey] as number)).slice(0, 20); // Top 20 for readability
};

export const calculateKPI = (data: DataRow[], kpi: KPIConfig): string => {
  const values = data.map(r => Number(r[kpi.column]) || 0);
  if (values.length === 0) return '0';

  let result = 0;
  switch (kpi.operation) {
    case 'sum': result = values.reduce((a, b) => a + b, 0); break;
    case 'avg': result = values.reduce((a, b) => a + b, 0) / values.length; break;
    case 'max': result = Math.max(...values); break;
    case 'min': result = Math.min(...values); break;
    case 'count': result = values.length; break;
  }

  if (kpi.format === 'currency') return `$${result.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (kpi.format === 'percentage') return `${result.toFixed(1)}%`;
  return result.toLocaleString(undefined, { maximumFractionDigits: 1 });
};
