
import { GoogleGenAI, Type } from "@google/genai";
import type { FullAnalysisResponse } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const applianceSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      appliance: { type: Type.STRING, description: "Name of the appliance, e.g., 'Old Refrigerator' or 'HVAC System'." },
      estimatedConsumption: { type: Type.NUMBER, description: "Estimated monthly power consumption in kWh." },
      recommendation: { type: Type.STRING, description: "Recommendation for an energy-efficient replacement, e.g., 'ENERGY STAR certified inverter refrigerator'." },
      potentialSavings: {
        type: Type.OBJECT,
        properties: {
          kWh: { type: Type.NUMBER, description: "Potential monthly energy savings in kWh." },
          cost: { type: Type.NUMBER, description: "Estimated monthly cost savings in USD, assuming $0.15/kWh." },
        },
        required: ["kWh", "cost"],
      },
    },
    required: ["appliance", "estimatedConsumption", "recommendation", "potentialSavings"],
  },
};

const renewableSchema = {
    type: Type.OBJECT,
    properties: {
        bestOption: {
            type: Type.STRING,
            enum: ["solar", "wind"],
            description: "The most suitable renewable energy source for the location."
        },
        forecast: {
            type: Type.ARRAY,
            description: "A 48-hour availability forecast, with one entry per hour.",
            items: {
                type: Type.OBJECT,
                properties: {
                    hour: { type: Type.INTEGER, description: "The hour of the day (0-47)." },
                    outputPercentage: { type: Type.NUMBER, description: "The estimated power output as a percentage of maximum capacity (0-100)." },
                },
                required: ["hour", "outputPercentage"]
            }
        },
        recommendations: {
            type: Type.ARRAY,
            description: "A list of actionable recommendations for energy usage based on the forecast.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["bestOption", "forecast", "recommendations"]
};

const actionPlanSchema = {
    type: Type.ARRAY,
    description: "A concise, actionable summary of 3-5 key steps the user should take to reduce their bills and use energy more efficiently, based on all the above findings.",
    items: {
        type: Type.STRING
    }
};

const fullAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        applianceAnalysis: applianceSchema,
        renewableAnalysis: renewableSchema,
        actionPlan: actionPlanSchema,
    },
    required: ["applianceAnalysis", "renewableAnalysis", "actionPlan"],
};

export const getFullEnergyAnalysis = async (
  consumptionData: { type: 'csv'; data: string } | { type: 'image'; data: string; mimeType: string },
  location: string
): Promise<FullAnalysisResponse> => {
  
  const consumptionPrompt = consumptionData.type === 'csv'
    ? `Analyze the following hourly power consumption data (in kWh) from a smart meter. The data represents one week of usage. Extrapolate to a full month (30 days) for monthly estimates.\n\nCSV Data:\n${consumptionData.data}`
    : `Analyze the electricity bill in the provided image. From the bill, identify the total monthly power consumption in kWh. If the bill shows daily or average usage, extrapolate to a full month (30 days).`;

  const prompt = `
    Act as an AI Energy Advisor named E-Power.
    ${consumptionPrompt}
    
    In addition, consider the user's location: "${location}".

    Based on a complete analysis of both the consumption data and the location, provide a single JSON response containing three distinct sections:
    1. 'applianceAnalysis': Identify the 3 most power-hungry appliances. For each, provide its name, estimated monthly consumption, a recommendation for an efficient replacement, and the potential monthly savings in kWh and USD (assume an electricity rate of $0.15/kWh).
    2. 'renewableAnalysis': Determine the best renewable option (solar or wind) for the location, generate a 48-hour energy availability forecast, and provide simple recommendations on when to use renewables versus the grid.
    3. 'actionPlan': Create a concise, actionable summary of 3-5 key steps the user should take to reduce their bills and use energy more efficiently, combining insights from both the appliance and renewable analyses.
  `;

  try {
    let contents;
    if (consumptionData.type === 'image') {
      contents = {
        parts: [
          { inlineData: { mimeType: consumptionData.mimeType, data: consumptionData.data } },
          { text: prompt }
        ]
      };
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: fullAnalysisSchema,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as FullAnalysisResponse;
  } catch (error) {
    console.error("Error in getFullEnergyAnalysis:", error);
    throw new Error("Failed to generate the full energy analysis. The model may have returned an unexpected format or could not process the provided data.");
  }
};
