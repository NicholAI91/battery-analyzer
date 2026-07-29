import React from 'react';
import { BatteryParams } from '../types';
import { Zap, Gauge, Flame, Clock, BatteryCharging, Percent } from 'lucide-react';

interface TelemetryCardsProps {
  params: BatteryParams;
  effectivePower: number;
  standardPower: number;
  onOpenAiDiagnostic: () => void;
}

export const TelemetryCards: React.FC<TelemetryCardsProps> = ({
  params,
  effectivePower,
  standardPower,
  onOpenAiDiagnostic,
}) => {
  const socRatio = params.ratedCapacityR > 0 ? params.remainingChargeC / params.ratedCapacityR : 0;
  const socPercent = socRatio * 100;
  const effectiveVoltage = params.basePotentialB - params.lossDeltaC;
  const cRate = params.ratedCapacityR > 0 ? params.dischargeRate / params.ratedCapacityR : 0;
  const estimatedHoursLeft = params.dischargeRate > 0 ? params.remainingChargeC / params.dischargeRate : 0;

  const hours = Math.floor(estimatedHoursLeft);
  const minutes = Math.round((estimatedHoursLeft - hours) * 60);

  const powerPenaltyPercent = standardPower > 0 ? ((1 - effectivePower / standardPower) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. Effective Power */}
      <div className="bg-[#121214] border border-[#222] rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-[#00FF9C]/40 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Effective Power</span>
          <Zap className="w-4 h-4 text-[#00FF9C]" />
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-[#00FF9C]">
            {effectivePower.toFixed(2)} <span className="text-xs text-[#666] font-sans font-normal">W</span>
          </div>
          <p className="text-[11px] text-[#00FF9C]/80 mt-1 flex items-center gap-1 font-mono">
            SOC Weighted
          </p>
        </div>
      </div>

      {/* 2. Standard Electrical Power */}
      <div className="bg-[#121214] border border-[#222] rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-[#333] transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Standard P<sub>std</sub></span>
          <Gauge className="w-4 h-4 text-[#AAA]" />
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-[#E2E2E2]">
            {standardPower.toFixed(2)} <span className="text-xs text-[#666] font-sans font-normal">W</span>
          </div>
          <p className="text-[11px] text-[#666] mt-1 font-mono">
            V<sub>eff</sub> × Current
          </p>
        </div>
      </div>

      {/* 3. SOC Penalty / Efficiency */}
      <div className="bg-[#121214] border border-[#222] rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-red-500/30 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">SOC Penalty</span>
          <Percent className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-red-400">
            -{powerPenaltyPercent.toFixed(1)}%
          </div>
          <p className="text-[11px] text-[#666] mt-1 font-mono">
            {(100 - powerPenaltyPercent).toFixed(1)}% Working
          </p>
        </div>
      </div>

      {/* 4. Net Terminal Voltage */}
      <div className="bg-[#121214] border border-[#222] rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-[#00FF9C]/30 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Net Potential</span>
          <BatteryCharging className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-white">
            {effectiveVoltage.toFixed(3)} <span className="text-xs text-[#666] font-sans font-normal">V</span>
          </div>
          <p className="text-[11px] text-[#666] mt-1 font-mono">
            Drop Δc = {params.lossDeltaC.toFixed(3)} V
          </p>
        </div>
      </div>

      {/* 5. C-Rate Strain */}
      <div className="bg-[#121214] border border-[#222] rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-[#00FF9C]/30 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">C-Rate Rate</span>
          <Flame className="w-4 h-4 text-[#00FF9C]" />
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-[#00FF9C]">
            {cRate.toFixed(2)}C
          </div>
          <p className="text-[11px] text-[#666] mt-1 font-mono">
            {params.dischargeRate.toFixed(1)} A / {params.ratedCapacityR} Ah
          </p>
        </div>
      </div>

      {/* 6. Run Time to Empty */}
      <div className="bg-[#121214] border border-[#222] rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-[#00FF9C]/40 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Run Time</span>
          <Clock className="w-4 h-4 text-[#00FF9C]" />
        </div>
        <div>
          <div className="text-xl font-mono font-bold text-[#E2E2E2]">
            {hours}h {minutes}m
          </div>
          <button
            onClick={onOpenAiDiagnostic}
            className="text-[11px] text-[#00FF9C] hover:underline mt-1 font-bold font-mono text-left block cursor-pointer"
          >
            AI Diagnostic →
          </button>
        </div>
      </div>
    </div>
  );
};
