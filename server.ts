import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini AI setup
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint for Battery Diagnostic & Curve Analysis
app.post("/api/gemini/analyze-battery", async (req, res) => {
  try {
    const ai = getAiClient();
    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const {
      capacityR,
      currentChargeC,
      soc,
      basePotentialB,
      lossDeltaC,
      dischargeRate,
      effectivePower,
      standardPower,
      presetName,
    } = req.body;

    const prompt = `
You are a senior Battery Systems Engineer and Electrochemical Physicist analyzing an effective working capacity model defined by the equation:
P_eff = (C / R) * (B - Δc) * (-dC/dt)

Current Battery System Telemetry:
- Battery Type / Preset: ${presetName || "Custom Battery"}
- Rated Capacity (R): ${capacityR} Ah
- Current Charge (C): ${currentChargeC} Ah
- State of Charge (SOC): ${(soc * 100).toFixed(1)}% (Ratio C/R = ${soc.toFixed(3)})
- Base Potential (B): ${basePotentialB} V
- Internal Voltage Loss / Contradiction Loss (Δc): ${lossDeltaC} V
- Effective Voltage (B - Δc): ${(basePotentialB - lossDeltaC).toFixed(3)} V
- Dynamic Flow Rate / Discharge Current (-dC/dt): ${dischargeRate} A
- Calculated Effective Power Output (P_eff): ${effectivePower.toFixed(2)} W
- Nominal Standard Power (B * I): ${standardPower.toFixed(2)} W
- Effective Power Efficiency Ratio (P_eff / P_std): ${((effectivePower / (standardPower || 1)) * 100).toFixed(1)}%

Please provide a concise, structured engineering evaluation in JSON format with the following fields:
1. "summary": A 2-sentence summary of the battery's instantaneous working state.
2. "socScalingAnalysis": Physics insight on how the SOC factor (C/R = ${soc.toFixed(2)}) is impacting effective power delivery.
3. "effectiveVoltageHealth": Assessment of internal voltage loss Δc = ${lossDeltaC}V (whether it indicates high internal resistance, polarization, or heat loss).
4. "dischargeVelocityAssessment": Analysis of current draw -dC/dt = ${dischargeRate}A relative to total rated capacity (C-rate = ${(dischargeRate / capacityR).toFixed(2)}C).
5. "optimizationRecommendations": Array of 3 actionable engineering recommendations to optimize power throughput and lifespan.
6. "stateOfHealthEstimate": Short string rating (e.g. "Optimal (98%)", "Mild Degradation", "High Thermal Penalty").

Return ONLY raw valid JSON, no markdown backticks.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/gemini/analyze-battery:", err);
    return res.status(500).json({
      error: err?.message || "Failed to analyze battery telemetry.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Battery Simulator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
