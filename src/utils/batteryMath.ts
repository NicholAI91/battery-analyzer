import { BatteryParams, SimulationDataPoint } from '../types';

/**
 * Calculates Effective SOC-Weighted Power Output (P_eff)
 * P_eff = (C / R) * (B - Δc) * (-dC/dt)
 */
export function calculateEffectivePower(params: BatteryParams): number {
  const { ratedCapacityR, remainingChargeC, basePotentialB, lossDeltaC, dischargeRate } = params;
  if (ratedCapacityR <= 0) return 0;
  const socRatio = remainingChargeC / ratedCapacityR;
  const effectiveVoltage = basePotentialB - lossDeltaC;
  return socRatio * effectiveVoltage * dischargeRate;
}

/**
 * Calculates Standard Nominal Power (P_std = Voltage * Current)
 */
export function calculateStandardPower(params: BatteryParams): number {
  const { basePotentialB, lossDeltaC, dischargeRate } = params;
  const effectiveVoltage = basePotentialB - lossDeltaC;
  return effectiveVoltage * dischargeRate;
}

/**
 * Solves for any parameter given a target Effective Power (P_eff)
 */
export function solveForParameter(
  params: BatteryParams,
  targetPower: number,
  solveTarget: 'dischargeRate' | 'remainingChargeC' | 'lossDeltaC' | 'basePotentialB' | 'ratedCapacityR'
): number {
  const { ratedCapacityR, remainingChargeC, basePotentialB, lossDeltaC, dischargeRate } = params;

  switch (solveTarget) {
    case 'dischargeRate': {
      // (-dC/dt) = P_eff / [ (C/R) * (B - Δc) ]
      const soc = remainingChargeC / ratedCapacityR;
      const vEff = basePotentialB - lossDeltaC;
      const denom = soc * vEff;
      return denom > 0 ? targetPower / denom : 0;
    }
    case 'remainingChargeC': {
      // C = [ P_eff * R ] / [ (B - Δc) * (-dC/dt) ]
      const vEff = basePotentialB - lossDeltaC;
      const denom = vEff * dischargeRate;
      return denom > 0 ? (targetPower * ratedCapacityR) / denom : 0;
    }
    case 'lossDeltaC': {
      // Δc = B - [ P_eff / ( (C/R) * (-dC/dt) ) ]
      const soc = remainingChargeC / ratedCapacityR;
      const denom = soc * dischargeRate;
      return denom > 0 ? basePotentialB - targetPower / denom : 0;
    }
    case 'basePotentialB': {
      // B = Δc + [ P_eff / ( (C/R) * (-dC/dt) ) ]
      const soc = remainingChargeC / ratedCapacityR;
      const denom = soc * dischargeRate;
      return denom > 0 ? lossDeltaC + targetPower / denom : 0;
    }
    case 'ratedCapacityR': {
      // R = [ C * (B - Δc) * (-dC/dt) ] / P_eff
      const vEff = basePotentialB - lossDeltaC;
      const numerator = remainingChargeC * vEff * dischargeRate;
      return targetPower > 0 ? numerator / targetPower : ratedCapacityR;
    }
    default:
      return 0;
  }
}

/**
 * Generates dynamic time-series simulation points as the battery discharges over time
 * assumes constant current discharge (-dC/dt = constant) or variable polarization
 */
export function generateDischargeSimulation(
  params: BatteryParams,
  durationHoursLimit: number = 20,
  stepsCount: number = 50
): SimulationDataPoint[] {
  const { ratedCapacityR, remainingChargeC, basePotentialB, lossDeltaC, dischargeRate } = params;

  if (dischargeRate <= 0 || remainingChargeC <= 0 || ratedCapacityR <= 0) {
    return [];
  }

  // Total time to complete discharge from remaining C to 0 Ah
  const totalHoursToEmpty = remainingChargeC / dischargeRate;
  const simTimeMaxHours = Math.min(totalHoursToEmpty, durationHoursLimit);
  const timeStep = simTimeMaxHours / stepsCount;

  const points: SimulationDataPoint[] = [];
  let cumulativeEnergyWh = 0;

  for (let i = 0; i <= stepsCount; i++) {
    const tHours = i * timeStep;
    const currentCharge = Math.max(0, remainingChargeC - dischargeRate * tHours);
    const socFraction = currentCharge / ratedCapacityR;
    const socPercent = Math.max(0, socFraction * 100);

    // Polarization / voltage loss increases slightly as SOC drops below 20%
    const internalResistanceMultiplier = socFraction < 0.2 ? 1 + (0.2 - socFraction) * 2.5 : 1;
    const currentLossDelta = lossDeltaC * internalResistanceMultiplier;

    const vEff = Math.max(0, basePotentialB - currentLossDelta);
    const pEff = socFraction * vEff * dischargeRate;
    const pStd = vEff * dischargeRate;
    const efficiency = pStd > 0 ? (pEff / pStd) * 100 : 0;

    // Approximate trapezoidal integration for Wh energy
    if (i > 0) {
      const prevPoint = points[i - 1];
      const avgPower = (prevPoint.effectivePowerW + pEff) / 2;
      cumulativeEnergyWh += avgPower * timeStep;
    }

    points.push({
      timeHours: Number(tHours.toFixed(2)),
      timeMinutes: Math.round(tHours * 60),
      chargeC: Number(currentCharge.toFixed(2)),
      socPercent: Number(socPercent.toFixed(1)),
      effectivePotentialV: Number(vEff.toFixed(3)),
      effectivePowerW: Number(pEff.toFixed(2)),
      standardPowerW: Number(pStd.toFixed(2)),
      efficiencyPercent: Number(efficiency.toFixed(1)),
      cumulativeEnergyWh: Number(cumulativeEnergyWh.toFixed(2)),
    });

    if (currentCharge <= 0) break;
  }

  return points;
}

/**
 * Generates SOC vs Power Curves across different Discharge C-Rates (0.2C, 0.5C, 1.0C, 2.0C)
 */
export function generateSocPowerCurves(params: BatteryParams) {
  const { ratedCapacityR, basePotentialB, lossDeltaC } = params;
  const cRates = [0.2, 0.5, 1.0, 2.0];
  
  const socSteps = [];
  for (let soc = 100; soc >= 5; soc -= 5) {
    const socFraction = soc / 100;
    const chargeC = socFraction * ratedCapacityR;
    
    const row: Record<string, number> = {
      soc,
      chargeC,
    };

    cRates.forEach((cRate) => {
      const currentA = cRate * ratedCapacityR;
      // Loss scales with C-rate (I^2 * R loss effect)
      const dynamicLoss = lossDeltaC * (1 + (cRate - 1) * 0.4);
      const vEff = Math.max(0, basePotentialB - dynamicLoss);
      const pEff = socFraction * vEff * currentA;
      row[`rate_${cRate}C`] = Number(pEff.toFixed(2));
    });

    socSteps.push(row);
  }

  return socSteps;
}
