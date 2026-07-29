import React, { useState } from 'react';
import { BatteryParams, AiAnalysisResult } from '../types';
import { Sparkles, X, Loader2, CheckCircle, AlertTriangle, Cpu, Lightbulb, Activity } from 'lucide-react';

interface AiDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: BatteryParams;
  effectivePower: number;
  standardPower: number;
}

export const AiDiagnosticModal: React.FC<AiDiagnosticModalProps> = ({
  isOpen,
  onClose,
  params,
  effectivePower,
  standardPower,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const soc = params.ratedCapacityR > 0 ? params.remainingChargeC / params.ratedCapacityR : 0;

  const handleRunDiagnostic = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/analyze-battery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capacityR: params.ratedCapacityR,
          currentChargeC: params.remainingChargeC,
          soc,
          basePotentialB: params.basePotentialB,
          lossDeltaC: params.lossDeltaC,
          dischargeRate: params.dischargeRate,
          effectivePower,
          standardPower,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze battery.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error executing Gemini AI diagnostic.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121214] border border-[#222] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-[#E2E2E2] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#222] flex items-center justify-between sticky top-0 bg-[#121214]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00FF9C]/10 border border-[#00FF9C]/20 text-[#00FF9C]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-light tracking-tight text-white flex items-center gap-2">
                Gemini AI <span className="font-semibold text-[#00FF9C]">Battery Diagnostic</span>
              </h2>
              <p className="text-xs text-[#666]">
                Electrochemical state assessment & optimization report
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#666] hover:text-white rounded-lg hover:bg-[#1A1A1C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Current State Summary Card */}
          <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div>
              <span className="text-[#666] block text-[10px] uppercase font-bold tracking-wider">P_eff</span>
              <span className="text-[#00FF9C] text-base font-bold">{effectivePower.toFixed(2)} W</span>
            </div>
            <div>
              <span className="text-[#666] block text-[10px] uppercase font-bold tracking-wider">SOC Ratio (C/R)</span>
              <span className="text-white text-base font-bold">{(soc * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[#666] block text-[10px] uppercase font-bold tracking-wider">Net Potential</span>
              <span className="text-white text-base font-bold">{(params.basePotentialB - params.lossDeltaC).toFixed(3)} V</span>
            </div>
            <div>
              <span className="text-[#666] block text-[10px] uppercase font-bold tracking-wider">Current (-dC/dt)</span>
              <span className="text-[#00FF9C] text-base font-bold">{params.dischargeRate.toFixed(1)} A</span>
            </div>

            {!result && !loading && (
              <button
                onClick={handleRunDiagnostic}
                className="bg-[#00FF9C] hover:bg-[#00e68d] text-[#0A0A0B] font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,156,0.2)] cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 fill-[#0A0A0B]" />
                <span>Run Diagnostic</span>
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#888]">
              <Loader2 className="w-8 h-8 text-[#00FF9C] animate-spin" />
              <p className="text-xs font-mono text-[#00FF9C] animate-pulse">Evaluating battery telemetry with Gemini AI...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <strong className="block text-red-200">Analysis Request Error</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {result && !loading && (
            <div className="flex flex-col gap-5">
              {/* SOH Badge */}
              <div className="flex items-center justify-between p-4 bg-[#0A0A0B] rounded-xl border border-[#222]">
                <div className="flex items-center gap-2 text-xs text-[#AAA]">
                  <Activity className="w-4 h-4 text-[#00FF9C]" />
                  <span>State of Health & Efficiency Rating:</span>
                </div>
                <span className="px-3 py-1 bg-[#00FF9C]/10 border border-[#00FF9C]/30 text-[#00FF9C] text-xs font-bold rounded-full font-mono">
                  {result.stateOfHealthEstimate}
                </span>
              </div>

              {/* Summary */}
              <div className="p-4 bg-[#0A0A0B] rounded-xl border border-[#222] text-xs text-[#E2E2E2] leading-relaxed">
                <strong className="text-[#00FF9C] block text-[10px] uppercase tracking-widest mb-1 font-bold">Executive Summary</strong>
                {result.summary}
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0A0A0B] rounded-xl border border-[#222]">
                  <div className="flex items-center gap-2 text-[#00FF9C] font-bold text-xs mb-2">
                    <Cpu className="w-4 h-4" />
                    <span>SOC Penalty Analysis</span>
                  </div>
                  <p className="text-xs text-[#AAA] leading-relaxed">{result.socScalingAnalysis}</p>
                </div>

                <div className="p-4 bg-[#0A0A0B] rounded-xl border border-[#222]">
                  <div className="flex items-center gap-2 text-white font-bold text-xs mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Voltage & Health</span>
                  </div>
                  <p className="text-xs text-[#AAA] leading-relaxed">{result.effectiveVoltageHealth}</p>
                </div>

                <div className="p-4 bg-[#0A0A0B] rounded-xl border border-[#222]">
                  <div className="flex items-center gap-2 text-[#00FF9C] font-bold text-xs mb-2">
                    <Activity className="w-4 h-4" />
                    <span>Discharge Velocity Strain</span>
                  </div>
                  <p className="text-xs text-[#AAA] leading-relaxed">{result.dischargeVelocityAssessment}</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-[#0A0A0B] rounded-xl border border-[#222]">
                <div className="flex items-center gap-2 text-[#00FF9C] font-bold text-xs mb-3">
                  <Lightbulb className="w-4 h-4" />
                  <span>Optimization & Lifecycle Action Plan</span>
                </div>
                <ul className="flex flex-col gap-2 text-xs text-[#E2E2E2]">
                  {result.optimizationRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#00FF9C] font-bold font-mono shrink-0">{i + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Re-run button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRunDiagnostic}
                  className="px-4 py-2 bg-[#1A1A1C] hover:bg-[#222225] border border-[#333] text-xs font-semibold rounded-xl text-[#E2E2E2] hover:text-[#00FF9C] transition-colors cursor-pointer"
                >
                  Re-run AI Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
