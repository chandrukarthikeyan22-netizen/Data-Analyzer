import { GoogleGenAI, Type } from "@google/genai";
import { DashboardConfig, ColumnInfo, DataRow } from '../types';

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

  // Schema for structured output
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
        temperature: 0.4, // Lower temperature for more consistent structural output
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DashboardConfig;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback or re-throw
    throw error;
  }
};