import React, { useState } from 'react';
import { BatteryParams } from './types';
import { calculateEffectivePower, calculateStandardPower, generateDischargeSimulation } from './utils/batteryMath';
import { FormulaHeader } from './components/FormulaHeader';
import { TelemetryCards } from './components/TelemetryCards';
import { ParameterControls } from './components/ParameterControls';
import { DischargeCharts } from './components/DischargeCharts';
import { AiDiagnosticModal } from './components/AiDiagnosticModal';
import { LatticeSimulator } from './components/LatticeSimulator';
import { Download, Sparkles, Battery, RefreshCw, Layers, Sliders } from 'lucide-react';

const INITIAL_PARAMS: BatteryParams = {
  ratedCapacityR: 100,
  remainingChargeC: 60,
  basePotentialB: 12.5,
  lossDeltaC: 0.167,
  dischargeRate: 3.0,
};

export default function App() {
  const [params, setParams] = useState<BatteryParams>(INITIAL_PARAMS);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'singleCell' | 'lattice'>('singleCell');

  const effectivePower = calculateEffectivePower(params);
  const standardPower = calculateStandardPower(params);

  const handleReset = () => {
    setParams(INITIAL_PARAMS);
  };

  const handleExportCsv = () => {
    const points = generateDischargeSimulation(params, 24, 50);
    if (!points.length) return;

    const headers = [
      'Time (Hours)',
      'Remaining Charge (Ah)',
      'SOC (%)',
      'Net Voltage (V)',
      'Effective Power (W)',
      'Standard Power (W)',
      'Efficiency (%)',
      'Cumulative Energy (Wh)',
    ];

    const rows = points.map((p) => [
      p.timeHours,
      p.chargeC,
      p.socPercent,
      p.effectivePotentialV,
      p.effectivePowerW,
      p.standardPowerW,
      p.efficiencyPercent,
      p.cumulativeEnergyWh,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `battery_simulation_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E2E2E2] font-sans selection:bg-[#00FF9C]/20 selection:text-[#00FF9C] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121214] border border-[#222] rounded-2xl p-5 px-6 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#00FF9C]/10 border border-[#00FF9C]/20 text-[#00FF9C]">
              <Battery className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] tracking-[0.25em] text-[#00FF9C] uppercase font-bold">
                  System Diagnostics
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] animate-pulse"></span>
                <span className="text-[10px] text-[#666] font-mono">NOMINAL</span>
              </div>
              <h1 className="text-xl font-light tracking-tight text-white">
                LithiumPulse <span className="font-semibold text-[#00FF9C]">Analyzer</span>
              </h1>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 rounded-xl border border-[#222]">
            <button
              onClick={() => setViewMode('singleCell')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'singleCell'
                  ? 'bg-[#00FF9C] text-[#0A0A0B] font-bold shadow-[0_0_12px_rgba(0,255,156,0.3)]'
                  : 'text-[#666] hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Single Cell P_eff</span>
            </button>

            <button
              onClick={() => setViewMode('lattice')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'lattice'
                  ? 'bg-[#00FF9C] text-[#0A0A0B] font-bold shadow-[0_0_12px_rgba(0,255,156,0.3)]'
                  : 'text-[#666] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ANGELL² × Nr Lattice</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="bg-[#00FF9C] hover:bg-[#00e68d] text-[#0A0A0B] font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,156,0.2)] hover:shadow-[0_0_20px_rgba(0,255,156,0.35)] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-[#0A0A0B]" />
              <span>AI Engineering Diagnostic</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="bg-[#1A1A1C] hover:bg-[#222225] border border-[#333] text-[#E2E2E2] font-medium px-3.5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Export Telemetry CSV"
            >
              <Download className="w-4 h-4 text-[#00FF9C]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-[#1A1A1C] hover:bg-[#222225] border border-[#333] text-[#666] hover:text-[#00FF9C] rounded-xl transition-colors cursor-pointer"
              title="Reset to Defaults"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* View Mode Content */}
        {viewMode === 'singleCell' ? (
          <>
            {/* Mathematical Model Interactive Display */}
            <FormulaHeader
              params={params}
              effectivePower={effectivePower}
              standardPower={standardPower}
            />

            {/* Quick Telemetry Cards */}
            <TelemetryCards
              params={params}
              effectivePower={effectivePower}
              standardPower={standardPower}
              onOpenAiDiagnostic={() => setIsAiModalOpen(true)}
            />

            {/* Controls & Sliders Section */}
            <ParameterControls
              params={params}
              onChange={setParams}
              onReset={handleReset}
            />

            {/* Dynamic Recharts Performance Curves */}
            <DischargeCharts params={params} />
          </>
        ) : (
          <LatticeSimulator />
        )}

        {/* Footer info */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#555] pt-6 border-t border-[#1A1A1C] mt-2 font-mono">
          <span>MODEL: P_eff = (C/R)(B - Δc)(-dC/dt) × ANGELL² × Nr</span>
          <span>HARDWARE ID: LP-9920-X1</span>
          <span>SYSTEM CAPACITY ANALYZER</span>
        </footer>
      </div>

      {/* AI Diagnostic Modal */}
      <AiDiagnosticModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        params={params}
        effectivePower={effectivePower}
        standardPower={standardPower}
      />
    </div>
  );
}

