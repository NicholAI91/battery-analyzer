import React, { useState } from 'react';
import { BatteryParams } from '../types';
import { HelpCircle, Zap, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

interface FormulaHeaderProps {
  params: BatteryParams;
  effectivePower: number;
  standardPower: number;
}

export const FormulaHeader: React.FC<FormulaHeaderProps> = ({
  params,
  effectivePower,
  standardPower,
}) => {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  const socRatio = params.ratedCapacityR > 0 ? params.remainingChargeC / params.ratedCapacityR : 0;
  const effectivePotential = params.basePotentialB - params.lossDeltaC;

  return (
    <div className="bg-[#121214] border border-[#222] rounded-2xl p-6 shadow-2xl text-[#E2E2E2]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222] pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[0.25em] bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20 font-mono">
              Electrochemical Physical Model
            </span>
            <span className="text-xs text-[#666]">State-of-Charge Weighted Capacity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#E2E2E2] flex items-center gap-3">
            <Zap className="w-6 h-6 text-[#00FF9C]" />
            Effective Working Capacity <span className="font-semibold text-white">(P<sub>eff</sub>)</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-[#0A0A0B] px-5 py-3 rounded-xl border border-[#222]">
          <div className="text-right">
            <div className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-bold">Working Capacity (P<sub>eff</sub>)</div>
            <div className="text-2xl font-mono font-bold text-[#00FF9C]">
              {effectivePower.toFixed(2)} <span className="text-xs font-sans font-normal text-[#666]">WATTS</span>
            </div>
          </div>
          <div className="h-8 w-px bg-[#222] mx-1" />
          <div>
            <div className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-bold">Unweighted P<sub>std</sub></div>
            <div className="text-lg font-mono font-medium text-[#AAA]">
              {standardPower.toFixed(2)} <span className="text-xs text-[#666]">W</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Formula Visualizer */}
      <div className="bg-[#0A0A0B] rounded-xl p-5 border border-[#222]">
        <div className="text-[10px] text-[#666] uppercase tracking-[0.25em] font-bold mb-3 flex items-center justify-between">
          <span>Physical Model Equation Breakdown</span>
          <span className="text-[#555] font-mono text-[10px] font-normal">(CLICK BRACKETS TO INSPECT)</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 text-lg sm:text-2xl font-mono text-white min-w-[580px]">
            {/* Term 1: SOC Scaling */}
            <button
              onClick={() => setActiveTerm(activeTerm === 'soc' ? null : 'soc')}
              className={`px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                activeTerm === 'soc'
                  ? 'bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C] shadow-[0_0_15px_rgba(0,255,156,0.25)]'
                  : 'bg-[#121214] border-[#222] hover:border-[#00FF9C]/40 text-[#00FF9C]'
              }`}
            >
              <span className="text-[10px] tracking-[0.2em] uppercase block text-[#666] font-sans font-bold text-center mb-0.5">SOC Scaling</span>
              <span>
                ( <span className="text-[#00FF9C]">{params.remainingChargeC}</span> /{' '}
                <span className="text-[#00FF9C]">{params.ratedCapacityR}</span> )
              </span>
            </button>

            <span className="text-[#444]">×</span>

            {/* Term 2: Effective Potential */}
            <button
              onClick={() => setActiveTerm(activeTerm === 'potential' ? null : 'potential')}
              className={`px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                activeTerm === 'potential'
                  ? 'bg-[#00FF9C]/20 border-[#00FF9C] text-white shadow-[0_0_15px_rgba(0,255,156,0.25)]'
                  : 'bg-[#121214] border-[#222] hover:border-[#00FF9C]/40 text-white'
              }`}
            >
              <span className="text-[10px] tracking-[0.2em] uppercase block text-[#666] font-sans font-bold text-center mb-0.5">Net Potential</span>
              <span>
                ( <span className="text-white">{params.basePotentialB}</span> −{' '}
                <span className="text-red-400">{params.lossDeltaC}</span> )
              </span>
            </button>

            <span className="text-[#444]">×</span>

            {/* Term 3: Discharge Velocity */}
            <button
              onClick={() => setActiveTerm(activeTerm === 'flow' ? null : 'flow')}
              className={`px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                activeTerm === 'flow'
                  ? 'bg-[#00FF9C]/20 border-[#00FF9C] text-[#00FF9C] shadow-[0_0_15px_rgba(0,255,156,0.25)]'
                  : 'bg-[#121214] border-[#222] hover:border-[#00FF9C]/40 text-[#00FF9C]'
              }`}
            >
              <span className="text-[10px] tracking-[0.2em] uppercase block text-[#666] font-sans font-bold text-center mb-0.5">Flow Rate (-dC/dt)</span>
              <span>( {params.dischargeRate.toFixed(2)} A )</span>
            </button>

            <span className="text-[#444]">=</span>

            {/* Result */}
            <div className="px-4 py-2.5 rounded-xl bg-[#00FF9C]/10 border border-[#00FF9C]/30 text-[#00FF9C] font-mono shadow-[0_0_15px_rgba(0,255,156,0.15)]">
              <span className="text-[10px] tracking-[0.2em] uppercase block text-[#00FF9C]/80 font-sans font-bold text-center mb-0.5">Effective Power</span>
              <span>{effectivePower.toFixed(1)} W</span>
            </div>
          </div>
        </div>

        {/* Term Explanations */}
        <div className="mt-4 pt-4 border-t border-[#222] text-xs">
          {activeTerm === 'soc' && (
            <div className="bg-[#121214] border border-[#00FF9C]/30 p-3.5 rounded-xl text-[#E2E2E2] flex items-start gap-3">
              <Activity className="w-5 h-5 text-[#00FF9C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#00FF9C] block mb-0.5 uppercase tracking-wider text-[11px] font-mono">
                  State-of-Charge Scaling Factor (C / R = {socRatio.toFixed(3)})
                </strong>
                Scales core electrical work by available charge ratio ({params.remainingChargeC} Ah / {params.ratedCapacityR} Ah = {(socRatio * 100).toFixed(1)}%).
                A full battery (1.0) delivers full potential, whereas a partially drained cell penalizes overall throughput as chemical reactant density diminishes.
              </div>
            </div>
          )}

          {activeTerm === 'potential' && (
            <div className="bg-[#121214] border border-[#222] p-3.5 rounded-xl text-[#E2E2E2] flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5 uppercase tracking-wider text-[11px] font-mono">
                  Effective Potential (B − Δc = {effectivePotential.toFixed(3)} V)
                </strong>
                Net available terminal voltage after subtracting internal polarization and drop loss (Δc = {params.lossDeltaC} V) from baseline open-circuit potential (B = {params.basePotentialB} V).
              </div>
            </div>
          )}

          {activeTerm === 'flow' && (
            <div className="bg-[#121214] border border-[#00FF9C]/30 p-3.5 rounded-xl text-[#E2E2E2] flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#00FF9C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#00FF9C] block mb-0.5 uppercase tracking-wider text-[11px] font-mono">
                  Dynamic Discharge Velocity (-dC/dt = {params.dischargeRate} A)
                </strong>
                Active instantaneous electrical current extraction rate. Current C-rate velocity is {(params.dischargeRate / params.ratedCapacityR).toFixed(2)}C.
              </div>
            </div>
          )}

          {!activeTerm && (
            <div className="text-[#666] flex items-center gap-2 text-xs">
              <HelpCircle className="w-4 h-4 text-[#00FF9C]" />
              <span>
                Select any equation bracket above to decompose its physical role in scaling effective power capacity.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
