export interface BatteryParams {
  ratedCapacityR: number; // Ah
  remainingChargeC: number; // Ah
  basePotentialB: number; // V
  lossDeltaC: number; // V
  dischargeRate: number; // A (-dC/dt)
}

export interface BatteryPreset {
  id: string;
  name: string;
  description: string;
  chemistry: string;
  ratedCapacityR: number;
  remainingChargeC: number;
  basePotentialB: number;
  lossDeltaC: number;
  dischargeRate: number;
}

export interface SimulationDataPoint {
  timeHours: number;
  timeMinutes: number;
  chargeC: number; // Ah
  socPercent: number; // %
  effectivePotentialV: number; // V
  effectivePowerW: number; // W
  standardPowerW: number; // W
  efficiencyPercent: number; // %
  cumulativeEnergyWh: number; // Wh
}

export interface AiAnalysisResult {
  summary: string;
  socScalingAnalysis: string;
  effectiveVoltageHealth: string;
  dischargeVelocityAssessment: string;
  optimizationRecommendations: string[];
  stateOfHealthEstimate: string;
}

export interface LatticeNode {
  id: number;
  row: number;
  col: number;
  n_i: number;
  rho_re: number; // real part of recursive state rho
  rho_im: number; // imag part of recursive state rho
  c_re: number;   // parameter c real
  c_im: number;   // parameter c imag
  isValid: boolean; // |rho| <= 2 stability condition
  neighbors: number[]; // neighbor indices N(i)
  energyE: number; // current energy E_i
  targetEnergyEStar: number; // desired equilibrium state E_i*
  voltage: number; // node baseline potential B_i
  capacityR: number; // Ah rated capacity
  remainingC: number; // Ah remaining charge
  dischargeRate: number; // A flow rate
  effectivePowerPeff: number; // P_eff = (C/R)*(B-deltaC)*(-dC/dt)
}

export interface LatticeState {
  nodes: LatticeNode[];
  timeStep: number;
  totalEnergy: number;
  rejectedTransitions: number;
  isAdiabaticBalanced: boolean;
}
