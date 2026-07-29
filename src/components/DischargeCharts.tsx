import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BatteryParams } from '../types';
import { generateDischargeSimulation, generateSocPowerCurves } from '../utils/batteryMath';
import { Activity, LineChart as LineChartIcon, BarChart2, ShieldAlert } from 'lucide-react';

interface DischargeChartsProps {
  params: BatteryParams;
}

export const DischargeCharts: React.FC<DischargeChartsProps> = ({ params }) => {
  const [activeTab, setActiveTab] = useState<'timeSeries' | 'socCurve' | 'lossProfile'>('timeSeries');

  const simulationData = generateDischargeSimulation(params, 24, 40);
  const socCurveData = generateSocPowerCurves(params);

  return (
    <div className="bg-[#121214] border border-[#222] rounded-2xl p-6 shadow-2xl text-[#E2E2E2] flex flex-col gap-6">
      {/* Chart Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-lg font-light text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00FF9C]" />
            Discharge Analytics <span className="font-semibold">& Curves</span>
          </h2>
          <p className="text-xs text-[#666] mt-0.5">
            Real-time numerical simulation of P<sub>eff</sub>(t) = (C(t)/R) · (B − Δc) · (-dC/dt)
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 rounded-xl border border-[#222] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('timeSeries')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timeSeries'
                ? 'bg-[#00FF9C] text-[#0A0A0B] font-bold shadow-[0_0_12px_rgba(0,255,156,0.3)]'
                : 'text-[#666] hover:text-white hover:bg-[#121214]'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Power Over Time</span>
          </button>

          <button
            onClick={() => setActiveTab('socCurve')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'socCurve'
                ? 'bg-[#00FF9C] text-[#0A0A0B] font-bold shadow-[0_0_12px_rgba(0,255,156,0.3)]'
                : 'text-[#666] hover:text-white hover:bg-[#121214]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>P<sub>eff</sub> vs SOC %</span>
          </button>

          <button
            onClick={() => setActiveTab('lossProfile')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lossProfile'
                ? 'bg-[#00FF9C] text-[#0A0A0B] font-bold shadow-[0_0_12px_rgba(0,255,156,0.3)]'
                : 'text-[#666] hover:text-white hover:bg-[#121214]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Voltage Loss Profile</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Power & Capacity Over Time */}
      {activeTab === 'timeSeries' && (
        <div className="flex flex-col gap-4">
          <div className="h-[360px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="effPowerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF9C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00FF9C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="stdPowerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#888888" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#888888" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.8} />
                <XAxis
                  dataKey="timeHours"
                  stroke="#666"
                  fontSize={11}
                  unit="h"
                  label={{ value: 'Discharge Duration (Hours)', position: 'insideBottom', offset: -10, fill: '#666', fontSize: 11 }}
                />
                <YAxis stroke="#666" fontSize={11} unit="W" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0B', borderColor: '#222', borderRadius: '0.75rem', color: '#E2E2E2' }}
                  formatter={(val: any, name: any) => [
                    `${Number(val).toFixed(2)} W`,
                    name === 'effectivePowerW' ? 'Effective Power (P_eff)' : 'Standard Power (P_std)',
                  ]}
                  labelFormatter={(lbl) => `Time: ${lbl} Hours`}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#AAA' }} />
                <Area
                  type="monotone"
                  dataKey="effectivePowerW"
                  name="Effective Power (P_eff)"
                  stroke="#00FF9C"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#effPowerGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="standardPowerW"
                  name="Standard Unweighted Power (P_std)"
                  stroke="#888888"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#stdPowerGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-[#0A0A0B] p-4 rounded-xl border border-[#222]">
            <div>
              <span className="text-[#666] uppercase text-[10px] font-bold tracking-wider block mb-1">Non-Linear SOC Decay</span>
              <p className="text-[#AAA]">
                Effective Power decays non-linearly because available charge ratio (C/R) depletes simultaneously alongside current drain.
              </p>
            </div>
            <div>
              <span className="text-[#666] uppercase text-[10px] font-bold tracking-wider block mb-1">Cumulative Energy</span>
              <p className="text-[#00FF9C] font-mono font-bold text-sm">
                {simulationData[simulationData.length - 1]?.cumulativeEnergyWh.toFixed(1) || 0} Wh
              </p>
              <span className="text-[#555] font-mono">Effective energy integral over cycle</span>
            </div>
            <div>
              <span className="text-[#666] uppercase text-[10px] font-bold tracking-wider block mb-1">Terminal SOC</span>
              <p className="text-[#00FF9C] font-mono font-bold text-sm">
                {simulationData[simulationData.length - 1]?.socPercent || 0}%
              </p>
              <span className="text-[#555] font-mono">Remaining charge at simulation cutoff</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Effective Power vs State of Charge (%) Across C-Rates */}
      {activeTab === 'socCurve' && (
        <div className="flex flex-col gap-4">
          <div className="h-[360px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={socCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.8} />
                <XAxis
                  dataKey="soc"
                  stroke="#666"
                  fontSize={11}
                  unit="%"
                  reversed={true}
                  label={{ value: 'State of Charge (SOC % from 100% to 0%)', position: 'insideBottom', offset: -10, fill: '#666', fontSize: 11 }}
                />
                <YAxis stroke="#666" fontSize={11} unit="W" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0B', borderColor: '#222', borderRadius: '0.75rem', color: '#E2E2E2' }}
                  formatter={(val: any, name: any) => [`${val} W`, name]}
                  labelFormatter={(lbl) => `State of Charge: ${lbl}%`}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#AAA' }} />
                <Line type="monotone" dataKey="rate_0.2C" name="0.2 C Rate" stroke="#888888" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="rate_0.5C" name="0.5 C Rate" stroke="#AAA" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="rate_1C" name="1.0 C Rate (Nominal)" stroke="#00FF9C" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="rate_2C" name="2.0 C Rate (High Strain)" stroke="#FF4D4D" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-[#AAA] bg-[#0A0A0B] p-3.5 rounded-xl border border-[#222]">
            <strong className="text-[#00FF9C]">C-Rate Sensitivity Insight:</strong> Higher discharge currents scale baseline electrical work upward, but accelerate SOC decay and increase resistive polarization voltage drop (Δc).
          </p>
        </div>
      )}

      {/* TAB 3: Voltage & Contradiction Loss Breakdown */}
      {activeTab === 'lossProfile' && (
        <div className="flex flex-col gap-4">
          <div className="h-[360px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.8} />
                <XAxis
                  dataKey="timeHours"
                  stroke="#666"
                  fontSize={11}
                  unit="h"
                  label={{ value: 'Discharge Duration (Hours)', position: 'insideBottom', offset: -10, fill: '#666', fontSize: 11 }}
                />
                <YAxis stroke="#666" fontSize={11} unit="V" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0B', borderColor: '#222', borderRadius: '0.75rem', color: '#E2E2E2' }}
                  formatter={(val: any, name: any) => [`${val} V`, name]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#AAA' }} />
                <Area
                  type="monotone"
                  dataKey="effectivePotentialV"
                  name="Effective Terminal Voltage (B - Δc)"
                  stroke="#00FF9C"
                  fill="#00FF9C"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222] text-xs text-[#AAA]">
            <span className="text-red-400 font-bold uppercase tracking-wider block mb-1">Polarization Loss (Δc = {params.lossDeltaC} V)</span>
            Internal cell impedance causes terminal voltage to drop below open-circuit potential B = {params.basePotentialB} V during current draw.
          </div>
        </div>
      )}
    </div>
  );
};
