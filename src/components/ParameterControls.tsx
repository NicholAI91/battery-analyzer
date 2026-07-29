import React, { useState } from 'react';
import { BatteryParams } from '../types';
import { BATTERY_PRESETS } from '../data/presets';
import { solveForParameter } from '../utils/batteryMath';
import { Sliders, RotateCcw, Calculator, Zap, Bookmark } from 'lucide-react';

interface ParameterControlsProps {
  params: BatteryParams;
  onChange: (newParams: BatteryParams) => void;
  onReset: () => void;
}

type SolveTarget = 'dischargeRate' | 'remainingChargeC' | 'lossDeltaC' | 'basePotentialB' | 'ratedCapacityR';

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  params,
  onChange,
  onReset,
}) => {
  const [solverMode, setSolverMode] = useState<boolean>(false);
  const [solveTarget, setSolveTarget] = useState<SolveTarget>('dischargeRate');
  const [targetPowerInput, setTargetPowerInput] = useState<number>(22.2);

  const handleSliderChange = (key: keyof BatteryParams, value: number) => {
    const updated = { ...params, [key]: value };
    // Maintain C <= R guard if R changes or C changes
    if (key === 'ratedCapacityR' && updated.remainingChargeC > value) {
      updated.remainingChargeC = value;
    }
    onChange(updated);
  };

  const handleApplyPreset = (presetId: string) => {
    const found = BATTERY_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChange({
        ratedCapacityR: found.ratedCapacityR,
        remainingChargeC: found.remainingChargeC,
        basePotentialB: found.basePotentialB,
        lossDeltaC: found.lossDeltaC,
        dischargeRate: found.dischargeRate,
      });
    }
  };

  const handleExecuteSolve = () => {
    const solvedValue = solveForParameter(params, targetPowerInput, solveTarget);
    if (Number.isNaN(solvedValue) || !Number.isFinite(solvedValue)) return;

    let updatedValue = Math.max(0, solvedValue);
    if (solveTarget === 'remainingChargeC' && updatedValue > params.ratedCapacityR) {
      updatedValue = params.ratedCapacityR;
    }

    onChange({
      ...params,
      [solveTarget]: updatedValue,
    });
  };

  const socPercent = params.ratedCapacityR > 0 ? (params.remainingChargeC / params.ratedCapacityR) * 100 : 0;

  return (
    <div className="bg-[#121214] border border-[#222] rounded-2xl p-6 shadow-2xl text-[#E2E2E2] flex flex-col gap-6">
      {/* Header with Preset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#00FF9C]" />
          <h2 className="text-lg font-light text-white">System Controls <span className="font-semibold">& Sliders</span></h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#0A0A0B] px-3 py-1.5 rounded-xl border border-[#222] text-xs">
            <Bookmark className="w-3.5 h-3.5 text-[#00FF9C]" />
            <span className="text-[#666] uppercase text-[10px] font-bold tracking-wider">Preset:</span>
            <select
              onChange={(e) => handleApplyPreset(e.target.value)}
              className="bg-transparent text-[#E2E2E2] font-medium focus:outline-none cursor-pointer"
            >
              {BATTERY_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-[#121214] text-[#E2E2E2]">
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSolverMode(!solverMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              solverMode
                ? 'bg-[#00FF9C] text-[#0A0A0B] font-bold shadow-[0_0_12px_rgba(0,255,156,0.3)]'
                : 'bg-[#1A1A1C] text-[#E2E2E2] hover:bg-[#222225] border border-[#333]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{solverMode ? 'Exit Solver' : 'Equation Solver'}</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded-xl bg-[#1A1A1C] text-[#666] hover:text-[#00FF9C] hover:bg-[#222225] border border-[#333] transition-colors cursor-pointer"
            title="Reset to 22.2 W User Model Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Solver Tool Mode */}
      {solverMode && (
        <div className="bg-[#0A0A0B] border border-[#00FF9C]/30 rounded-xl p-4 text-[#E2E2E2] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Zap className="w-5 h-5 text-[#00FF9C] shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#00FF9C]">Target Power Solver</div>
              <p className="text-xs text-[#AAA]">Solve for any variable given target P<sub>eff</sub></p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 bg-[#121214] px-3 py-1.5 rounded-lg border border-[#333] text-xs">
              <span className="text-[#666]">Target P<sub>eff</sub>:</span>
              <input
                type="number"
                step="0.1"
                value={targetPowerInput}
                onChange={(e) => setTargetPowerInput(parseFloat(e.target.value) || 0)}
                className="w-20 bg-[#0A0A0B] border border-[#444] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#00FF9C]"
              />
              <span className="text-[#666]">W</span>
            </div>

            <div className="flex items-center gap-2 bg-[#121214] px-3 py-1.5 rounded-lg border border-[#333] text-xs">
              <span className="text-[#666]">Solve:</span>
              <select
                value={solveTarget}
                onChange={(e) => setSolveTarget(e.target.value as SolveTarget)}
                className="bg-transparent text-[#00FF9C] font-mono focus:outline-none cursor-pointer"
              >
                <option value="dischargeRate" className="bg-[#121214]">Discharge Current (-dC/dt)</option>
                <option value="remainingChargeC" className="bg-[#121214]">Remaining Charge (C)</option>
                <option value="lossDeltaC" className="bg-[#121214]">Voltage Drop (Δc)</option>
                <option value="basePotentialB" className="bg-[#121214]">Base Potential (B)</option>
                <option value="ratedCapacityR" className="bg-[#121214]">Rated Capacity (R)</option>
              </select>
            </div>

            <button
              onClick={handleExecuteSolve}
              className="bg-[#00FF9C] hover:bg-[#00e68d] text-[#0A0A0B] font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
            >
              Solve Variable
            </button>
          </div>
        </div>
      )}

      {/* Main Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rated Capacity (R) */}
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest">
              Rated Capacity (R)
            </label>
            <span className="font-mono text-sm font-bold text-[#00FF9C]">{params.ratedCapacityR} Ah</span>
          </div>
          <input
            type="range"
            min="1"
            max="500"
            step="1"
            value={params.ratedCapacityR}
            onChange={(e) => handleSliderChange('ratedCapacityR', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#555] mt-1">
            <span>1 Ah</span>
            <span>250 Ah</span>
            <span>500 Ah</span>
          </div>
        </div>

        {/* Remaining Charge (C) */}
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest">
              Remaining Charge (C)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#00FF9C] font-mono font-bold bg-[#00FF9C]/10 px-2 py-0.5 rounded border border-[#00FF9C]/20">
                SOC {socPercent.toFixed(1)}%
              </span>
              <span className="font-mono text-sm font-bold text-[#00FF9C]">{params.remainingChargeC} Ah</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={params.ratedCapacityR}
            step="1"
            value={params.remainingChargeC}
            onChange={(e) => handleSliderChange('remainingChargeC', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#555] mt-1">
            <span>0 Ah (0%)</span>
            <span>{(params.ratedCapacityR / 2).toFixed(0)} Ah (50%)</span>
            <span>{params.ratedCapacityR} Ah (100%)</span>
          </div>
        </div>

        {/* Base Potential (B) */}
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest">
              Base Potential (B)
            </label>
            <span className="font-mono text-sm font-bold text-white">{params.basePotentialB} V</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="600.0"
            step="0.1"
            value={params.basePotentialB}
            onChange={(e) => handleSliderChange('basePotentialB', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#555] mt-1">
            <span>1 V</span>
            <span>300 V</span>
            <span>600 V</span>
          </div>
        </div>

        {/* Internal Loss / Voltage Drop (Δc) */}
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest">
              Drop Loss (Δc)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white font-mono font-bold bg-[#1A1A1C] px-2 py-0.5 rounded border border-[#333]">
                Net {(params.basePotentialB - params.lossDeltaC).toFixed(3)} V
              </span>
              <span className="font-mono text-sm font-bold text-red-400">{params.lossDeltaC} V</span>
            </div>
          </div>
          <input
            type="range"
            min="0.0"
            max={Math.min(params.basePotentialB * 0.5, 30.0)}
            step="0.001"
            value={params.lossDeltaC}
            onChange={(e) => handleSliderChange('lossDeltaC', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#555] mt-1">
            <span>0.00 V</span>
            <span>{(Math.min(params.basePotentialB * 0.5, 30.0) / 2).toFixed(2)} V</span>
            <span>{Math.min(params.basePotentialB * 0.5, 30.0).toFixed(2)} V</span>
          </div>
        </div>

        {/* Dynamic Flow Rate (-dC/dt) */}
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222]">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest">
              Flow Rate (-dC/dt)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#00FF9C] font-mono font-bold bg-[#00FF9C]/10 px-2 py-0.5 rounded border border-[#00FF9C]/20">
                {(params.dischargeRate / (params.ratedCapacityR || 1)).toFixed(2)} C
              </span>
              <span className="font-mono text-sm font-bold text-[#00FF9C]">{params.dischargeRate.toFixed(2)} A</span>
            </div>
          </div>
          <input
            type="range"
            min="0.1"
            max="300.0"
            step="0.1"
            value={params.dischargeRate}
            onChange={(e) => handleSliderChange('dischargeRate', parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#555] mt-1">
            <span>0.1 A</span>
            <span>150 A</span>
            <span>300 A</span>
          </div>
        </div>

        {/* Direct Entry */}
        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222] flex flex-col justify-between">
          <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2 block">
            Direct Value Entry
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#666] block text-[10px] font-mono">C (Ah)</span>
              <input
                type="number"
                value={params.remainingChargeC}
                onChange={(e) => handleSliderChange('remainingChargeC', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121214] border border-[#333] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#00FF9C]"
              />
            </div>
            <div>
              <span className="text-[#666] block text-[10px] font-mono">Δc (V)</span>
              <input
                type="number"
                step="0.001"
                value={params.lossDeltaC}
                onChange={(e) => handleSliderChange('lossDeltaC', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121214] border border-[#333] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-red-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
