import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { Activity, Waves, Sigma, BrainCircuit, Atom, Zap } from 'lucide-react';

export const QuantumDissipationModel: React.FC = () => {
  const [kc, setKc] = useState<number>(0.85); // Medium coupling factor
  const [mGap, setMGap] = useState<number>(1.2); // Spectral gap m_gap (normalized)
  
  // New Oscillatory Potential Parameters
  const [tauU, setTauU] = useState<number>(2.0); // Potential relaxation time
  const [amplitude, setAmplitude] = useState<number>(0.5); // A
  const [omega, setOmega] = useState<number>(5.0); // omega

  // Constants
  const u0 = 1.0;
  const hBarProxy = 1.0; 
  const gamma = mGap / hBarProxy;
  const tHalf = Math.log(2) / gamma;
  const alpha = (1 / tauU) + gamma;

  // Generate time series data
  const chartData = useMemo(() => {
    const data = [];
    const timeLimit = 10; // seconds
    const steps = 250;
    const dt = timeLimit / steps;
    
    let accumulatedLambda = 0;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      
      // Φ(t) = exp(-gamma * t)
      const phi = Math.exp(-gamma * t);
      
      // U(t) = U_0 * exp(-t / tau_U) * (1 + A * sin(omega * t))
      const u = u0 * Math.exp(-t / tauU) * (1 + amplitude * Math.sin(omega * t));

      // -dU/dt = U_0 * exp(-t / tau_U) * [ (1 / tau_U)*(1 + A * sin(omega * t)) - A * omega * cos(omega * t) ]
      const negDudt = u0 * Math.exp(-t / tauU) * ( (1 / tauU) * (1 + amplitude * Math.sin(omega * t)) - amplitude * omega * Math.cos(omega * t) );
      
      // dLambda = Kc * U_0 * exp(-alpha * t) * [ (1 / tau_U)*(1 + A * sin(omega * t)) - A * omega * cos(omega * t) ] * dt
      // which is equivalent to: Kc * phi * negDudt * dt
      const dLambda = kc * phi * negDudt * dt;
      accumulatedLambda += dLambda;

      data.push({
        time: Number(t.toFixed(2)),
        phi: Number(phi.toFixed(4)),
        u: Number(u.toFixed(4)),
        negDudt: Number(negDudt.toFixed(4)),
        lambda: Number(accumulatedLambda.toFixed(4)),
      });
    }
    return data;
  }, [kc, gamma, tauU, amplitude, omega]);

  const maxLambda = chartData[chartData.length - 1].lambda;

  return (
    <div className="bg-[#121214] border border-[#222] rounded-2xl p-6 shadow-2xl text-[#E2E2E2] flex flex-col gap-6">
      {/* Header */}
      <div className="border-b border-[#222] pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
            Unified Gap-Dissipation
          </span>
          <span className="text-xs text-[#888] font-mono">Quantum Origin of Memory Loss</span>
        </div>
        <h2 className="text-2xl font-light tracking-tight text-white flex items-center gap-3">
          <Atom className="w-6 h-6 text-purple-400" />
          Quantum Spectral Gap & <span className="font-semibold text-purple-400">Continuous Dissipation Calculus</span>
        </h2>
        <p className="text-xs text-[#888] mt-2 max-w-3xl leading-relaxed">
          The continuous dissipation calculus provides a phenomenological description of memory loss, while the spectral-gap relation supplies a microscopic quantum-mechanical origin for the retention time. By integrating an oscillatory transient potential <code className="text-purple-400">U(t)</code>, we observe the unified effective decay rate <code className="text-purple-400">α = 1/τ_U + m_gap/ℏ</code>.
        </p>
      </div>

      {/* Equations Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Oscillatory Potential */}
        <div className="bg-[#0A0A0B] border border-[#222] p-5 rounded-xl flex flex-col">
          <div className="flex items-center gap-2 mb-3 border-b border-[#222] pb-2 text-[10px] uppercase font-bold text-purple-400 tracking-wider">
            <Activity className="w-4 h-4" />
            1. Oscillatory Transient
          </div>
          <div className="font-mono text-[11px] text-white bg-[#121214] p-3 rounded-lg border border-[#333] mb-3 break-words">
            U(t) = U₀e^(-t/τ_U)[1 + A·sin(ωt)]
          </div>
          <ul className="text-[11px] text-[#888] space-y-1 font-mono mt-auto">
            <li><strong className="text-[#E2E2E2]">τ_U:</strong> Potential relaxation ({tauU.toFixed(1)}s)</li>
            <li><strong className="text-[#E2E2E2]">A:</strong> Amplitude ({amplitude.toFixed(2)})</li>
            <li><strong className="text-[#E2E2E2]">ω:</strong> Frequency ({omega.toFixed(1)} rad/s)</li>
          </ul>
        </div>

        {/* Quantum Spectral Gap */}
        <div className="bg-[#0A0A0B] border border-[#222] p-5 rounded-xl flex flex-col">
          <div className="flex items-center gap-2 mb-3 border-b border-[#222] pb-2 text-[10px] uppercase font-bold text-purple-400 tracking-wider">
            <Waves className="w-4 h-4" />
            2. Quantum Spectral Gap
          </div>
          <div className="font-mono text-[11px] text-white bg-[#121214] p-3 rounded-lg border border-[#333] mb-3 break-words">
            Δ ≥ m_gap &gt; 0 <br/>
            γ ∝ m_gap / ℏ
          </div>
          <ul className="text-[11px] text-[#888] space-y-1 font-mono mt-auto">
            <li><strong className="text-[#E2E2E2]">m_gap:</strong> Spectral gap ({mGap.toFixed(2)} eV)</li>
            <li><strong className="text-[#E2E2E2]">γ:</strong> Decay rate ({gamma.toFixed(2)} s⁻¹)</li>
            <li><strong className="text-[#E2E2E2]">T_½:</strong> ln(2)/γ = {tHalf.toFixed(3)}s</li>
          </ul>
        </div>
        
        {/* Unified Dissipation */}
        <div className="bg-[#0A0A0B] border border-[#222] p-5 rounded-xl flex flex-col">
          <div className="flex items-center gap-2 mb-3 border-b border-[#222] pb-2 text-[10px] uppercase font-bold text-purple-400 tracking-wider">
            <Sigma className="w-4 h-4" />
            3. Unified Gap-Dissipation
          </div>
          <div className="font-mono text-[10px] leading-tight text-white bg-[#121214] p-3 rounded-lg border border-[#333] mb-3 break-words">
            Λ(T) = K_c U₀ ∫ e^(-αt) [(-dU/dt)/U₀] dt <br/><br/>
            α = 1/τ_U + γ ≈ 1/τ_U + m_gap/ℏ
          </div>
          <ul className="text-[11px] text-[#888] space-y-1 font-mono mt-auto">
            <li><strong className="text-[#E2E2E2]">α:</strong> Combined decay ({alpha.toFixed(2)} s⁻¹)</li>
            <li><strong className="text-[#E2E2E2]">K_c:</strong> Coupling ({kc.toFixed(2)})</li>
            <li><strong className="text-[#E2E2E2]">Λ(∞):</strong> {maxLambda.toFixed(4)}</li>
          </ul>
        </div>
      </div>

      {/* Interactive Controls & Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="xl:col-span-4 bg-[#0A0A0B] p-5 rounded-xl border border-[#222] flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-1 border-b border-[#222] pb-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            System Parameters
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <label className="text-[#888]">Coupling (K_c)</label>
                <span className="text-purple-400 font-bold">{kc.toFixed(2)}</span>
              </div>
              <input type="range" min="0.1" max="2.0" step="0.05" value={kc} onChange={(e) => setKc(Number(e.target.value))} className="accent-purple-500 w-full" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <label className="text-[#888]">Spectral Gap (m_gap)</label>
                <span className="text-purple-400 font-bold">{mGap.toFixed(2)} eV</span>
              </div>
              <input type="range" min="0.1" max="5.0" step="0.1" value={mGap} onChange={(e) => setMGap(Number(e.target.value))} className="accent-purple-500 w-full" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <label className="text-[#888]">Relaxation Time (τ_U)</label>
                <span className="text-purple-400 font-bold">{tauU.toFixed(1)} s</span>
              </div>
              <input type="range" min="0.5" max="10.0" step="0.5" value={tauU} onChange={(e) => setTauU(Number(e.target.value))} className="accent-purple-500 w-full" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <label className="text-[#888]">Oscillation Amp (A)</label>
                <span className="text-purple-400 font-bold">{amplitude.toFixed(2)}</span>
              </div>
              <input type="range" min="0.0" max="2.0" step="0.1" value={amplitude} onChange={(e) => setAmplitude(Number(e.target.value))} className="accent-purple-500 w-full" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <label className="text-[#888]">Frequency (ω)</label>
                <span className="text-purple-400 font-bold">{omega.toFixed(1)} rad/s</span>
              </div>
              <input type="range" min="0.5" max="20.0" step="0.5" value={omega} onChange={(e) => setOmega(Number(e.target.value))} className="accent-purple-500 w-full" />
            </div>
          </div>

          <div className="mt-auto bg-[#121214] border border-[#333] rounded-lg p-3">
            <div className="text-[10px] text-[#666] uppercase font-bold tracking-widest mb-1 flex items-center justify-between">
              <span>Combined Decay (α)</span>
              <span className="text-purple-400">{alpha.toFixed(3)} s⁻¹</span>
            </div>
            <div className="text-[10px] text-[#666] uppercase font-bold tracking-widest flex items-center justify-between mt-2">
              <span>Accumulated Dissipation Λ(∞)</span>
              <span className="text-white text-sm">{maxLambda.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="xl:col-span-8 bg-[#0A0A0B] p-5 rounded-xl border border-[#222]">
           <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
             <div className="text-xs font-bold text-white uppercase tracking-wider">
               Transient & Dissipation Dynamics
             </div>
             <div className="flex flex-wrap gap-4 font-mono text-[10px]">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#00FF9C]"></div> U(t)</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div> -dU/dt</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Λ(t)</div>
             </div>
           </div>
           
           <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="lambdaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                
                {/* Left Axis for U(t) and -dU/dt */}
                <YAxis yAxisId="left" stroke="#888" tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                
                {/* Right Axis for Lambda */}
                <YAxis yAxisId="right" orientation="right" stroke="#A855F7" tick={{ fill: '#A855F7', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                
                <Tooltip
                  contentStyle={{ backgroundColor: '#121214', border: '1px solid #333', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#E2E2E2' }}
                  labelStyle={{ color: '#888', marginBottom: '4px' }}
                />
                
                <Line yAxisId="left" type="monotone" dataKey="u" stroke="#00FF9C" strokeWidth={2} dot={false} name="U(t)" />
                <Line yAxisId="left" type="monotone" dataKey="negDudt" stroke="#60A5FA" strokeWidth={1.5} dot={false} name="-dU/dt" />
                
                <Area yAxisId="right" type="monotone" dataKey="lambda" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#lambdaGradient)" name="Λ(t)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

