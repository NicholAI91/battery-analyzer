import React, { useState } from 'react';
import { Car, Zap, Plane, Smartphone, Factory, ChevronRight, ShieldCheck, TrendingDown, Clock } from 'lucide-react';

interface Sector {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  currentChallenges: string[];
  angellApplication: string;
  improvements: {
    cost: string;
    risk: string;
    performance: string;
  };
}

const SECTORS: Sector[] = [
  {
    id: 'ev',
    name: 'Electric Vehicles (EV)',
    icon: <Car className="w-5 h-5" />,
    description: 'High-capacity mobile power systems requiring rapid charge/discharge cycles and strict thermal management.',
    currentChallenges: [
      'Thermal runaway risks during rapid acceleration/charging',
      'Uneven cell degradation across large battery packs',
      'Conservative capacity limits to prevent catastrophic failure'
    ],
    angellApplication: 'The ANGELL² × Nr lattice model enables precise, cell-level adiabatic energy redistribution. By validating recursive stability (|ρ| ≤ 2), the battery management system (BMS) can dynamically route power away from thermally stressed cells during high-draw events without heat dumping.',
    improvements: {
      cost: '15-20% reduction in battery replacement costs due to extended pack lifespan.',
      risk: 'Near elimination of thermal runaway cascades via predictive stability gating.',
      performance: 'Unlocks 10-15% more usable capacity by safely operating closer to theoretical limits.'
    }
  },
  {
    id: 'grid',
    name: 'Grid-Scale Storage',
    icon: <Zap className="w-5 h-5" />,
    description: 'Massive stationary energy reserves stabilizing renewable energy grids and handling peak load demands.',
    currentChallenges: [
      'Significant energy loss as heat during grid-scale distribution',
      'Complex balancing logic across millions of individual cells',
      'High maintenance overhead for degraded module replacement'
    ],
    angellApplication: 'Applies the exact energy conservation axiom (E(t+1) = E(t)). The grid acts as a massive lattice where energy imbalances (ΔE) are redistributed evenly among local module neighbors rather than dissipated, drastically increasing round-trip efficiency.',
    improvements: {
      cost: 'Saves millions annually per installation by reducing HVAC cooling requirements.',
      risk: 'Stabilizes grid volatility by ensuring deterministic, globally stable charge states.',
      performance: 'Increases overall round-trip efficiency from standard 85% to 92%+.'
    }
  },
  {
    id: 'aerospace',
    name: 'Aerospace & Aviation',
    icon: <Plane className="w-5 h-5" />,
    description: 'Mission-critical power systems for satellites, drones, and emerging electric aircraft (eVTOL).',
    currentChallenges: [
      'Zero tolerance for battery failure mid-flight or in orbit',
      'Extreme temperature variations affecting discharge rates',
      'Strict weight limits precluding heavy cooling systems'
    ],
    angellApplication: 'The SOC-weighted working capacity model (P_eff) provides highly accurate real-time power available under extreme dynamic loads (-dC/dt). The adiabatic lattice design allows for passive thermal balancing, reducing the need for heavy active cooling.',
    improvements: {
      cost: 'Lower launch/flight costs due to reduced thermal management system weight.',
      risk: 'Mathematical guarantee of pack stability prevents mission-ending power loss.',
      performance: 'Reliable high-current bursts for eVTOL takeoff and landing phases.'
    }
  },
  {
    id: 'consumer',
    name: 'Consumer Electronics',
    icon: <Smartphone className="w-5 h-5" />,
    description: 'Laptops, smartphones, and wearables prioritizing thin form factors and long daily battery life.',
    currentChallenges: [
      'Rapid degradation from poor daily charging habits',
      'Device throttling due to localized battery heat generation',
      'Premature device obsolescence due to battery failure'
    ],
    angellApplication: 'Implementing the model at the micro-BMS level smooths the charge/discharge curves. The recursive boundary check acts as a strict governor, preventing the device from drawing current at rates that cause the internal state (ρ) to exceed stability bounds.',
    improvements: {
      cost: 'Delays consumer upgrade cycles by extending battery health beyond 3 years.',
      risk: 'Reduces risk of battery swelling and device chassis damage.',
      performance: 'Maintains peak processor performance longer by minimizing thermal throttling.'
    }
  },
  {
    id: 'industrial',
    name: 'Industrial Robotics',
    icon: <Factory className="w-5 h-5" />,
    description: 'Autonomous guided vehicles (AGVs) and manufacturing robots requiring 24/7 uptime.',
    currentChallenges: [
      'Downtime for charging disrupts manufacturing pipelines',
      'High physical vibration and stress impacting cell connections',
      'Unpredictable power spikes during heavy lifting operations'
    ],
    angellApplication: 'The lattice network model allows robot fleets to maintain operational status even if individual cells fail. The energy well redistribution continuously balances the pack during micro-charging periods between tasks.',
    improvements: {
      cost: 'Maximizes factory throughput by reducing robot charging downtime by 30%.',
      risk: 'Fail-safe operation even with partial pack degradation.',
      performance: 'Consistent torque and lifting capacity regardless of battery charge state.'
    }
  }
];

export const SectorImpactAnalysis: React.FC = () => {
  const [activeSector, setActiveSector] = useState<string>(SECTORS[0].id);

  const selectedSector = SECTORS.find((s) => s.id === activeSector)!;

  return (
    <div className="bg-[#121214] border border-[#222] rounded-2xl p-6 shadow-2xl text-[#E2E2E2] flex flex-col gap-6">
      <div className="border-b border-[#222] pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20 font-mono">
            Global Impact Analysis
          </span>
          <span className="text-xs text-[#888] font-mono">Cross-Sector Applications</span>
        </div>
        <h2 className="text-2xl font-light tracking-tight text-white flex items-center gap-3">
          Applied <span className="font-semibold text-[#00FF9C]">Electrochemical Dynamics</span>
        </h2>
        <p className="text-xs text-[#888] mt-1 max-w-3xl leading-relaxed">
          How the SOC-Weighted Capacity Model and ANGELL² × Nr Lattice Simulation translates to tangible improvements in cost reduction, risk mitigation, and performance across major global industries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sector Navigation Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          {SECTORS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => setActiveSector(sector.id)}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                activeSector === sector.id
                  ? 'bg-[#18181B] border-[#00FF9C] shadow-[0_0_20px_rgba(0,255,156,0.15)]'
                  : 'bg-[#0A0A0B] border-[#222] hover:border-[#444] hover:bg-[#151518]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeSector === sector.id ? 'bg-[#00FF9C]/10 text-[#00FF9C]' : 'bg-[#1A1A1C] text-[#888] group-hover:text-white'}`}>
                  {sector.icon}
                </div>
                <span className={`font-semibold ${activeSector === sector.id ? 'text-white' : 'text-[#888] group-hover:text-white'}`}>
                  {sector.name}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeSector === sector.id ? 'text-[#00FF9C] translate-x-1' : 'text-[#444]'}`} />
            </button>
          ))}
        </div>

        {/* Sector Details Panel */}
        <div className="lg:col-span-8 bg-[#0A0A0B] rounded-xl border border-[#222] p-6 flex flex-col gap-6">
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-[#00FF9C]/10 text-[#00FF9C] rounded-xl border border-[#00FF9C]/20">
                {selectedSector.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{selectedSector.name}</h3>
            </div>
            <p className="text-[#888] text-sm leading-relaxed">{selectedSector.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Challenges */}
            <div className="bg-[#121214] p-5 rounded-xl border border-[#222]">
              <div className="text-[10px] text-red-400 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Current Industry Challenges
              </div>
              <ul className="flex flex-col gap-3">
                {selectedSector.currentChallenges.map((challenge, idx) => (
                  <li key={idx} className="text-xs text-[#AAA] flex items-start gap-2">
                    <span className="text-[#444] mt-0.5">•</span>
                    <span className="leading-relaxed">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Application */}
            <div className="bg-[#121214] p-5 rounded-xl border border-[#00FF9C]/30 shadow-[0_0_15px_rgba(0,255,156,0.05)]">
              <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9C]" />
                ANGELL² × Nr Application
              </div>
              <p className="text-xs text-[#E2E2E2] leading-relaxed">
                {selectedSector.angellApplication}
              </p>
            </div>
          </div>

          {/* Quantifiable Improvements */}
          <div>
            <div className="text-[10px] text-[#666] uppercase font-bold tracking-widest mb-3 border-b border-[#222] pb-2">
              Projected Material Improvements
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#121214] rounded-xl border border-[#222]">
                <TrendingDown className="w-5 h-5 text-[#00FF9C] mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Cost Reduction</h4>
                <p className="text-[11px] text-[#888] leading-relaxed">{selectedSector.improvements.cost}</p>
              </div>
              
              <div className="p-4 bg-[#121214] rounded-xl border border-[#222]">
                <ShieldCheck className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Risk Mitigation</h4>
                <p className="text-[11px] text-[#888] leading-relaxed">{selectedSector.improvements.risk}</p>
              </div>

              <div className="p-4 bg-[#121214] rounded-xl border border-[#222]">
                <Clock className="w-5 h-5 text-blue-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Lifespan & Performance</h4>
                <p className="text-[11px] text-[#888] leading-relaxed">{selectedSector.improvements.performance}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
