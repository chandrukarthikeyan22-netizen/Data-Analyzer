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

// --- New ML/Advanced Analytics Types ---

export interface MLForecast {
  suitable: boolean;
  label: string; // "Revenue Forecast", etc.
  data: { date: string; value: number; type: 'historical' | 'forecast' }[];
  insight: string;
}

export interface MLRegression {
  suitable: boolean;
  label: string;
  xAxis: string;
  yAxis: string;
  data: { x: number; y: number; regressionLine: number }[];
  rSquared: number;
  insight: string;
}

export interface MLClustering {
  suitable: boolean;
  label: string;
  xAxis: string;
  yAxis: string;
  data: { x: number; y: number; cluster: string; name: string }[];
  insight: string;
}

export interface MLDistribution {
  suitable: boolean;
  label: string;
  column: string;
  data: { range: string; count: number }[]; // Histogram bins
  insight: string;
}

export interface AdvancedAnalyticsResult {
  forecast: MLForecast;
  regression: MLRegression;
  clustering: MLClustering;
  distribution: MLDistribution;
}
