import React, { useState, useEffect } from 'react';
import { LatticeState } from '../types';
import { initializeLattice, stepLatticeComputation } from '../utils/angellLatticeMath';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  Maximize2,
  Info,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';

export const LatticeSimulator: React.FC = () => {
  const [gridDim, setGridDim] = useState<number>(3); // 3x3 default
  const [latticeState, setLatticeState] = useState<LatticeState>(() => initializeLattice(3, 3));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(4); // Center node default
  const [activeTab, setActiveTab] = useState<'grid' | 'figures' | 'formalism'>('grid');

  // Re-initialize when grid dimensions change
  useEffect(() => {
    setLatticeState(initializeLattice(gridDim, gridDim));
    setSelectedNodeId(Math.floor((gridDim * gridDim) / 2));
    setIsPlaying(false);
  }, [gridDim]);

  // Auto-step loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setLatticeState((prev) => stepLatticeComputation(prev));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStep = () => {
    setLatticeState((prev) => stepLatticeComputation(prev));
  };

  const handleReset = () => {
    setLatticeState(initializeLattice(gridDim, gridDim));
    setIsPlaying(false);
  };

  const handleInjectPerturbation = (nodeId: number) => {
    setLatticeState((prev) => {
      const newNodes = prev.nodes.map((n) => {
        if (n.id === nodeId) {
          const newE = n.energyE + 50; // Inject +50 Wh thermal/voltage spike
          const newC = (newE / 100) * n.capacityR;
          return {
            ...n,
            energyE: newE,
            remainingC: newC,
            effectivePowerPeff: (newC / n.capacityR) * (n.voltage - 0.05) * n.dischargeRate,
          };
        }
        return n;
      });
      const newTotal = newNodes.reduce((sum, n) => sum + n.energyE, 0);
      return {
        ...prev,
        nodes: newNodes,
        totalEnergy: newTotal,
        isAdiabaticBalanced: false,
      };
    });
  };

  const aggregatePower = latticeState.nodes.reduce((sum, n) => sum + n.effectivePowerPeff, 0);
  const selectedNode = selectedNodeId !== null ? latticeState.nodes.find((n) => n.id === selectedNodeId) : null;

  return (
    <div className="bg-[#121214] border border-[#222] rounded-2xl p-6 shadow-2xl text-[#E2E2E2] flex flex-col gap-6">
      {/* Top Banner: ANGELL² × Nr Canonical Blueprint Header */}
      <div className="border-b border-[#222] pb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20 font-mono">
              ANGELL² × Nr Formalism
            </span>
            <span className="text-xs text-[#888] font-mono">Product Space P = A × Nr</span>
            <span className="text-xs text-[#00FF9C] font-mono font-bold bg-[#00FF9C]/5 px-2 py-0.5 rounded border border-[#00FF9C]/10">
              {gridDim}×{gridDim} Local Lattice
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-white flex items-center gap-3">
            <Layers className="w-6 h-6 text-[#00FF9C]" />
            Multi-Cell <span className="font-semibold text-[#00FF9C]">Lattice Network Simulator</span>
          </h2>
          <p className="text-xs text-[#888] mt-1 max-w-3xl leading-relaxed">
            Bounded recursive dynamical system where state transitions are validated by recursive stability (<code className="text-[#00FF9C]">|ρ| ≤ 2</code>) and executed through adiabatic energy redistribution without heat loss.
          </p>
        </div>

        {/* Global Telemetry Card */}
        <div className="flex items-center gap-4 bg-[#0A0A0B] px-5 py-3 rounded-xl border border-[#222] shrink-0">
          <div>
            <div className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-bold">Pack Energy (E_total)</div>
            <div className="text-xl font-mono font-bold text-[#00FF9C] flex items-center gap-1">
              {latticeState.totalEnergy.toFixed(1)} <span className="text-xs text-[#666] font-normal">Wh</span>
            </div>
            <div className="text-[10px] text-[#00FF9C]/80 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#00FF9C]" /> Adiabatic (Exact Conserv.)
            </div>
          </div>

          <div className="h-10 w-px bg-[#222]" />

          <div>
            <div className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-bold">Total Pack P_eff</div>
            <div className="text-xl font-mono font-bold text-white">
              {aggregatePower.toFixed(1)} <span className="text-xs text-[#666] font-normal">W</span>
            </div>
            <div className="text-[10px] text-[#888] font-mono">
              {latticeState.nodes.length} Active Nodes
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0A0B] p-3 rounded-xl border border-[#222]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'grid'
                ? 'bg-[#00FF9C] text-[#0A0A0B] font-bold shadow-[0_0_12px_rgba(0,255,156,0.3)]'
                : 'text-[#888] hover:text-white hover:bg-[#121214]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Interactive Lattice Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('figures')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'figures'
                ? 'bg-[#00FF9C] text-[#0A0A0B] font-bold shadow-[0_0_12px_rgba(0,255,156,0.3)]'
                : 'text-[#888] hover:text-white hover:bg-[#121214]'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>Blueprint Figures (1-12)</span>
          </button>

          <button
            onClick={() => setActiveTab('formalism')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'formalism'
                ? 'bg-[#00FF9C] text-[#0A0A0B] font-bold shadow-[0_0_12px_rgba(0,255,156,0.3)]'
                : 'text-[#888] hover:text-white hover:bg-[#121214]'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Mathematical Formalism</span>
          </button>
        </div>

        {/* Execution Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#121214] px-2.5 py-1.5 rounded-lg border border-[#333] text-xs">
            <span className="text-[#666] text-[10px] font-bold uppercase tracking-wider">Lattice Size:</span>
            <select
              value={gridDim}
              onChange={(e) => setGridDim(Number(e.target.value))}
              className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer"
            >
              <option value={2} className="bg-[#121214]">2×2 (4 Cells)</option>
              <option value={3} className="bg-[#121214]">3×3 (9 Cells)</option>
              <option value={4} className="bg-[#121214]">4×4 (16 Cells)</option>
            </select>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-[#0A0A0B]'
                : 'bg-[#00FF9C] hover:bg-[#00e68d] text-[#0A0A0B] shadow-[0_0_12px_rgba(0,255,156,0.25)]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause Loop' : 'Run Cycle Loop'}</span>
          </button>

          <button
            onClick={handleStep}
            disabled={isPlaying}
            className="px-3 py-2 bg-[#1A1A1C] hover:bg-[#222225] border border-[#333] text-xs text-[#E2E2E2] font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <SkipForward className="w-4 h-4 text-[#00FF9C]" />
            <span>Step</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-[#1A1A1C] hover:bg-[#222225] border border-[#333] text-[#666] hover:text-[#00FF9C] rounded-xl transition-colors cursor-pointer"
            title="Reset Imbalance & State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE LATTICE GRID */}
      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Lattice Canvas Grid */}
          <div className="lg:col-span-2 bg-[#0A0A0B] p-6 rounded-2xl border border-[#222] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#00FF9C]">
                  Lattice Topology Node Array
                </span>
                <span className="text-xs text-[#666] font-mono">
                  Time Step: t = {latticeState.timeStep}
                </span>
              </div>
              <div className="text-[10px] text-[#888] font-mono">
                Click node to select or inject perturbation
              </div>
            </div>

            {/* Dynamic CSS Grid based on gridDim */}
            <div
              className="grid gap-3 my-2"
              style={{
                gridTemplateColumns: `repeat(${gridDim}, minmax(0, 1fr))`,
              }}
            >
              {latticeState.nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isImbalanced = Math.abs(node.energyE - node.targetEnergyEStar) > 1.0;
                const socPct = ((node.remainingC / node.capacityR) * 100).toFixed(0);

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                      isSelected
                        ? 'bg-[#18181B] border-[#00FF9C] shadow-[0_0_20px_rgba(0,255,156,0.2)]'
                        : isImbalanced
                        ? 'bg-[#151214] border-amber-500/40 hover:border-amber-400'
                        : 'bg-[#121214] border-[#222] hover:border-[#333]'
                    }`}
                  >
                    {/* Node Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#888] uppercase">
                        Node p_{node.n_i}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                          node.isValid
                            ? 'bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {node.isValid ? '|ρ|≤2' : 'REJECTED'}
                      </span>
                    </div>

                    {/* Energy & Power Stats */}
                    <div>
                      <div className="text-xl font-mono font-bold text-white flex items-baseline justify-between">
                        <span>{node.energyE.toFixed(1)} <span className="text-xs text-[#666]">Wh</span></span>
                        <span className="text-xs text-[#00FF9C] font-mono">{node.effectivePowerPeff.toFixed(1)} W</span>
                      </div>
                      <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-[#00FF9C] h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Number(socPct))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-[#666] mt-1">
                        <span>SOC {socPct}%</span>
                        <span>N(i): {node.neighbors.length} links</span>
                      </div>
                    </div>

                    {/* Quick Inject Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInjectPerturbation(node.id);
                      }}
                      className="w-full py-1 rounded bg-[#1A1A1C] hover:bg-[#00FF9C]/20 text-[#888] hover:text-[#00FF9C] text-[10px] font-mono transition-colors border border-[#222] hover:border-[#00FF9C]/30"
                    >
                      + Perturb (+50 Wh)
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Balancing Status Footer */}
            <div className="flex items-center justify-between bg-[#121214] p-3 rounded-xl border border-[#222] text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00FF9C]" />
                <span>
                  Lattice Status:{' '}
                  {latticeState.isAdiabaticBalanced ? (
                    <span className="text-[#00FF9C] font-bold">Adiabatic Equilibrium Achieved</span>
                  ) : (
                    <span className="text-amber-400 font-bold">Energy Redistribution Active</span>
                  )}
                </span>
              </div>
              <div className="text-[#888]">
                Rejections: <span className="text-white font-bold">{latticeState.rejectedTransitions}</span>
              </div>
            </div>
          </div>

          {/* Selected Node Detailed Inspector */}
          <div className="bg-[#0A0A0B] p-6 rounded-2xl border border-[#222] flex flex-col gap-5">
            <div className="border-b border-[#222] pb-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#00FF9C]">
                Product Space Element Detail
              </span>
              <h3 className="text-lg font-light text-white font-mono mt-0.5">
                p_{selectedNode ? selectedNode.n_i : '?'} = (n_i, ρ_i, N(i), E_i)
              </h3>
            </div>

            {selectedNode ? (
              <div className="flex flex-col gap-4 text-xs font-mono">
                {/* 1. Recursive State rho */}
                <div className="bg-[#121214] p-3.5 rounded-xl border border-[#222]">
                  <div className="text-[10px] uppercase text-[#666] font-bold mb-1">
                    1. Recursive State Envelope (Nr)
                  </div>
                  <div className="text-sm font-bold text-[#00FF9C]">
                    ρ = {selectedNode.rho_re.toFixed(3)} + {selectedNode.rho_im.toFixed(3)}i
                  </div>
                  <div className="text-[11px] text-[#888] mt-1">
                    |ρ| = {Math.sqrt(selectedNode.rho_re ** 2 + selectedNode.rho_im ** 2).toFixed(3)}{' '}
                    {selectedNode.isValid ? '≤ 2 (Valid)' : '> 2 (Transition Rejected)'}
                  </div>
                </div>

                {/* 2. Neighbor Adjacency Operator */}
                <div className="bg-[#121214] p-3.5 rounded-xl border border-[#222]">
                  <div className="text-[10px] uppercase text-[#666] font-bold mb-1">
                    2. Neighbor Adjacency N(i) & Weights
                  </div>
                  <div className="text-white font-bold">
                    Connected Neighbors: [{selectedNode.neighbors.map((id) => `p_${id + 1}`).join(', ')}]
                  </div>
                  <div className="text-[11px] text-[#888] mt-1">
                    Equal Weighting: w_ij = 1/{selectedNode.neighbors.length} = {(1 / selectedNode.neighbors.length).toFixed(3)}{' '}
                    (Σ w_ij = 1.0)
                  </div>
                </div>

                {/* 3. Energy Balance E_i */}
                <div className="bg-[#121214] p-3.5 rounded-xl border border-[#222]">
                  <div className="text-[10px] uppercase text-[#666] font-bold mb-1">
                    3. Adiabatic Energy Well & Target
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-white">Current E_i: {selectedNode.energyE.toFixed(1)} Wh</span>
                    <span className="text-[#00FF9C]">Target E_i*: {selectedNode.targetEnergyEStar} Wh</span>
                  </div>
                  <div className="text-[11px] text-[#888] mt-1">
                    ΔE_i = {(selectedNode.energyE - selectedNode.targetEnergyEStar).toFixed(2)} Wh redistributed to N(i)
                  </div>
                </div>

                {/* 4. Cell Effective Working Capacity */}
                <div className="bg-[#121214] p-3.5 rounded-xl border border-[#222]">
                  <div className="text-[10px] uppercase text-[#666] font-bold mb-1">
                    4. Cell Effective Power (P_eff,i)
                  </div>
                  <div className="text-base font-bold text-[#00FF9C]">
                    {selectedNode.effectivePowerPeff.toFixed(2)} W
                  </div>
                  <div className="text-[11px] text-[#888] mt-1">
                    P_eff = ({selectedNode.remainingC.toFixed(1)} Ah / {selectedNode.capacityR} Ah) × (3.7V - 0.05V) × 22.2A
                  </div>
                </div>

                <button
                  onClick={() => handleInjectPerturbation(selectedNode.id)}
                  className="w-full py-2.5 rounded-xl bg-[#00FF9C] hover:bg-[#00e68d] text-[#0A0A0B] font-bold text-xs transition-all shadow-[0_0_12px_rgba(0,255,156,0.2)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Perturb Cell p_{selectedNode.n_i} (+50 Wh)</span>
                </button>
              </div>
            ) : (
              <div className="text-[#666] text-xs font-mono">Select a node from the grid above.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BLUEPRINT CATALOG FIGURES (1 to 12) */}
      {activeTab === 'figures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#0A0A0B] p-5 rounded-2xl border border-[#222] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest font-mono">Figure 1</div>
              <h3 className="text-base font-semibold text-white mt-1">Bounded State Capsule</h3>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                Nr recursive envelope keeping all convergent states strictly within the bounded domain <code className="text-[#00FF9C]">|ρ_n(k)| ≤ 2</code>.
              </p>
            </div>
            <div className="mt-4 p-3 bg-[#121214] rounded-xl border border-[#222] text-[11px] text-[#00FF9C] font-mono">
              Convergence condition: sup_k |ρ_n(k)| &lt; ∞
            </div>
          </div>

          <div className="bg-[#0A0A0B] p-5 rounded-2xl border border-[#222] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest font-mono">Figure 2</div>
              <h3 className="text-base font-semibold text-white mt-1">Neighbor Distribution Node</h3>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                ANGELL² adjacency operator distributing energy equally to all local neighbors <code className="text-[#00FF9C]">j ∈ N(i)</code> with <code className="text-[#00FF9C]">Σ w_ij = 1</code>.
              </p>
            </div>
            <div className="mt-4 p-3 bg-[#121214] rounded-xl border border-[#222] text-[11px] text-[#00FF9C] font-mono">
              Axiom 2: Conservation of Adjacency
            </div>
          </div>

          <div className="bg-[#0A0A0B] p-5 rounded-2xl border border-[#222] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest font-mono">Figure 6 & 9</div>
              <h3 className="text-base font-semibold text-white mt-1">Constant Energy Sphere</h3>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                Global conservation across all transitions: <code className="text-[#00FF9C]">E(t+1) = E(t)</code>. Purely adiabatic without heat dissipation or bit flips.
              </p>
            </div>
            <div className="mt-4 p-3 bg-[#121214] rounded-xl border border-[#222] text-[11px] text-[#00FF9C] font-mono">
              Axiom 3: Exact Adiabatic Energy Balance
            </div>
          </div>

          <div className="bg-[#0A0A0B] p-5 rounded-2xl border border-[#222] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest font-mono">Figure 10</div>
              <h3 className="text-base font-semibold text-white mt-1">Operator Compass</h3>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                Four canonical operators (Gate → Brake → Phase → Growth cycle transition) governing state progression across the product space.
              </p>
            </div>
            <div className="mt-4 p-3 bg-[#121214] rounded-xl border border-[#222] text-[11px] text-[#00FF9C] font-mono">
              Unified Operator Form: A : S → S
            </div>
          </div>

          <div className="bg-[#0A0A0B] p-5 rounded-2xl border border-[#222] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest font-mono">Figure 12</div>
              <h3 className="text-base font-semibold text-white mt-1">Energy Well Redistribution</h3>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                Desired state <code className="text-[#00FF9C]">E_i*</code> where surplus <code className="text-[#00FF9C]">ΔE_i = E_i(t) - E_i*</code> flows outward equally to adjacent neighbors.
              </p>
            </div>
            <div className="mt-4 p-3 bg-[#121214] rounded-xl border border-[#222] text-[11px] text-[#00FF9C] font-mono">
              E_j(t+1) = E_j(t) + ΔE / |N(i)|
            </div>
          </div>

          <div className="bg-[#0A0A0B] p-5 rounded-2xl border border-[#222] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest font-mono">Figure 13</div>
              <h3 className="text-base font-semibold text-white mt-1">Full Conceptual Model</h3>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                Combined pipeline: 1. Iterate ρ_n(k+1) → 2. Check |ρ| ≤ 2 → 3. Redistribute ΔE → N(i) → 4. Update E_i → E_i*.
              </p>
            </div>
            <div className="mt-4 p-3 bg-[#121214] rounded-xl border border-[#222] text-[11px] text-[#00FF9C] font-mono">
              Deterministic, locally computable, globally stable
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATHEMATICAL FORMALISM */}
      {activeTab === 'formalism' && (
        <div className="bg-[#0A0A0B] p-6 rounded-2xl border border-[#222] flex flex-col gap-6 font-mono text-xs">
          <div>
            <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest mb-1">
              1. Formal Definition of Nr
            </div>
            <div className="p-4 bg-[#121214] rounded-xl border border-[#222] text-[#E2E2E2]">
              <code>Nr := &#123; (n, ρ_n) | n ∈ ℕ, ρ_n : ℕ → ℝ, ρ_n bounded &#125;</code>
              <p className="text-[#888] text-[11px] mt-2">
                Each natural cell index n carries a recursive state function ρ_n with <code>sup_k |ρ_n(k)| &lt; ∞</code>.
              </p>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest mb-1">
              2. State Evolution (Canonical Update)
            </div>
            <div className="p-4 bg-[#121214] rounded-xl border border-[#222] text-[#E2E2E2] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[#888] text-[10px] uppercase font-bold block mb-1">Recursive Update:</span>
                <code>ρ_n(k+1) = f(ρ_n(k), c)</code>
                <div className="text-[#00FF9C] mt-1">Canonical: f(z, c) = z² + c</div>
              </div>
              <div>
                <span className="text-[#888] text-[10px] uppercase font-bold block mb-1">Stability Condition:</span>
                <code>|ρ_n(k)| ≤ 2 for all k ≤ K</code>
                <div className="text-red-400 mt-1">If violated → state transition rejected</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#00FF9C] uppercase font-bold tracking-widest mb-1">
              3. The Product Space P := ANGELL² × Nr
            </div>
            <div className="p-4 bg-[#121214] rounded-xl border border-[#222] text-[#E2E2E2]">
              <code>An element: p_i = (n_i, ρ_i, N(i), E_i)</code>
              <p className="text-[#888] text-[11px] mt-2">
                Combines local cell identity n_i, recursive boundary state ρ_i, neighbor set N(i), and adiabatic cell energy E_i.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
