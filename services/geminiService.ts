import { GoogleGenAI, Type } from "@google/genai";
import { DashboardConfig, ColumnInfo, DataRow, AdvancedAnalyticsResult } from '../types';

const getModel = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const analyzeData = async (
  columns: ColumnInfo[], 
  sampleData: DataRow[]
): Promise<DashboardConfig> => {
  const ai = getModel();

  const prompt = `
    You are an expert Chief Data Officer and Data Scientist. 
    I have a dataset with the following columns: ${JSON.stringify(columns)}.
    Here is a sample of the first 20 rows: ${JSON.stringify(sampleData.slice(0, 20))}.

    Your goal is to create a configuration for a "PowerBI-style" dashboard to visualize this data effectively.
    
    1. **Domain Detection**: Identify the business or scientific domain.
    2. **KPIs**: Suggest 3-4 Key Performance Indicators (KPIs) to display at the top (e.g., Total Revenue, Avg Age). Specify the column and the operation (sum, avg, count).
    3. **Charts**: Suggest 4-6 different charts (bar, pie, line, scatter, area). 
       - Ensure you select valid numerical columns for the 'dataKey' (Y-axis) and categorical or time columns for 'xAxisKey'.
       - For scatter plots, both axes should usually be numerical.
    4. **Recommendations**: Give 3 specific, actionable business or domain recommendations based on typical patterns in this type of data.
    5. **Analysis**: Provide a brief paragraph of statistical analysis/summary.
    6. **Forecast**: Provide a text-based forecast analysis if time-series data is present, otherwise provide a general trend prediction.

    Return the response strictly as a JSON object matching this schema. Do not use Markdown code blocks.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A catchy title for the dashboard" },
      domain: { type: Type.STRING, description: "The detected domain of the data" },
      summary: { type: Type.STRING, description: "Executive summary of the data" },
      kpis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            column: { type: Type.STRING },
            operation: { type: Type.STRING, enum: ["sum", "avg", "count", "max", "min"] },
            format: { type: Type.STRING, enum: ["currency", "number", "percentage"] }
          },
          required: ["label", "column", "operation"]
        }
      },
      charts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["bar", "pie", "line", "area", "scatter"] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            xAxisKey: { type: Type.STRING },
            dataKey: { type: Type.STRING },
            aggregation: { type: Type.STRING, enum: ["sum", "avg", "count", "raw", "max", "min"] }
          },
          required: ["id", "type", "title", "xAxisKey", "dataKey", "aggregation"]
        }
      },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      statisticalAnalysis: { type: Type.STRING },
      forecastAnalysis: { type: Type.STRING }
    },
    required: ["title", "summary", "kpis", "charts", "recommendations", "statisticalAnalysis"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DashboardConfig;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const performAdvancedAnalysis = async (
  columns: ColumnInfo[],
  sampleData: DataRow[]
): Promise<AdvancedAnalyticsResult> => {
  const ai = getModel();

  // We increase the sample size slightly for ML if possible, but limit token usage
  const dataContext = JSON.stringify(sampleData.slice(0, 50)); 

  const prompt = `
    You are an expert Data Scientist running advanced Machine Learning algorithms.
    Columns: ${JSON.stringify(columns)}
    Data Sample: ${dataContext}

    Perform the following 4 analyses. If the data is not suitable for a specific analysis (e.g., no time series for forecast), set "suitable" to false.

    1. **Forecast (Time Series)**: 
       - Identify a date column and a value column. 
       - Return 10-15 historical points and 5-10 PREDICTED future points based on the trend (Linear or Exponential Smoothing).
    
    2. **Regression (Linear/Logistic)**: 
       - Identify two highly correlated numerical variables (X and Y).
       - Generate a series of points representing the actual data.
       - Calculate a regression line (y = mx + b) and provide points for that line.
       - Estimate R-Squared.

    3. **Clustering (K-Means/KNN style)**:
       - Identify 2 numerical dimensions suitable for clustering.
       - "Simulate" a clustering algorithm to group the sample data into 3 distinct clusters (e.g., "High Value", "Low Value", "Outliers").
       - Assign a cluster name to each point.

    4. **Distribution (Histogram)**:
       - Pick the most important numerical distribution column.
       - Create 5-8 histogram bins (range strings) and count the frequency.

    Return valid JSON matching the schema.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      forecast: {
        type: Type.OBJECT,
        properties: {
          suitable: { type: Type.BOOLEAN },
          label: { type: Type.STRING },
          insight: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                value: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ["historical", "forecast"] }
              }
            }
          }
        },
        required: ["suitable", "data", "insight"]
      },
      regression: {
        type: Type.OBJECT,
        properties: {
          suitable: { type: Type.BOOLEAN },
          label: { type: Type.STRING },
          xAxis: { type: Type.STRING },
          yAxis: { type: Type.STRING },
          rSquared: { type: Type.NUMBER },
          insight: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                regressionLine: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["suitable", "data", "insight", "rSquared"]
      },
      clustering: {
        type: Type.OBJECT,
        properties: {
          suitable: { type: Type.BOOLEAN },
          label: { type: Type.STRING },
          xAxis: { type: Type.STRING },
          yAxis: { type: Type.STRING },
          insight: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                cluster: { type: Type.STRING },
                name: { type: Type.STRING }
              }
            }
          }
        },
        required: ["suitable", "data", "insight"]
      },
      distribution: {
        type: Type.OBJECT,
        properties: {
          suitable: { type: Type.BOOLEAN },
          label: { type: Type.STRING },
          column: { type: Type.STRING },
          insight: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                range: { type: Type.STRING },
                count: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["suitable", "data", "insight"]
      }
    },
    required: ["forecast", "regression", "clustering", "distribution"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Using flash for speed on larger context
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.3, 
    }
  });

  const text = response.text;
  if (!text) throw new Error("No ML response from AI");
  
  return JSON.parse(text) as AdvancedAnalyticsResult;
};
