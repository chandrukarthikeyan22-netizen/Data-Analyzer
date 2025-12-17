export type DataValue = string | number | boolean | null;
export type DataRow = Record<string, DataValue>;

export interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  uniqueValues: number;
}

export interface KPIConfig {
  label: string;
  column: string;
  operation: 'sum' | 'avg' | 'count' | 'max' | 'min';
  format?: 'currency' | 'number' | 'percentage';
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'pie' | 'line' | 'area' | 'scatter';
  title: string;
  description: string;
  xAxisKey: string;
  dataKey: string; // Y-axis or Value
  aggregation: 'sum' | 'avg' | 'count' | 'raw' | 'max' | 'min'; // 'raw' for scatter
  color?: string;
}

export interface DashboardConfig {
  title: string;
  domain: string;
  summary: string;
  kpis: KPIConfig[];
  charts: ChartConfig[];
  recommendations: string[];
  statisticalAnalysis: string;
  forecastAnalysis?: string;
}

export interface Filter {
  column: string;
  value: string;
}