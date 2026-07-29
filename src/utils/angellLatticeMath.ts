import { LatticeNode, LatticeState } from '../types';

/**
 * Creates an initial 2D lattice network (e.g. 3x3 or 4x4 pack grid) according to
 * ANGELL² × Nr product space P := A × Nr where p_i = (n_i, rho_i, N(i), E_i).
 */
export function initializeLattice(rows: number = 3, cols: number = 3): LatticeState {
  const nodes: LatticeNode[] = [];
  const total = rows * cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;

      // Find neighbors N(i) on a locally connected 2D grid
      const neighbors: number[] = [];
      if (r > 0) neighbors.push((r - 1) * cols + c); // Top
      if (r < rows - 1) neighbors.push((r + 1) * cols + c); // Bottom
      if (c > 0) neighbors.push(r * cols + (c - 1)); // Left
      if (c < cols - 1) neighbors.push(r * cols + (c + 1)); // Right

      // Assign initial recursive state rho_i and energy E_i
      // Add slight initial imbalance to show adiabatic redistribution
      const isCenter = r === Math.floor(rows / 2) && c === Math.floor(cols / 2);
      const initialEnergy = isCenter ? 120 : 80; // Wh center perturbation
      const targetEStar = 85; // Desired energy equilibrium E_i*

      // Base parameter c for Mandelbrot/Julia set stability
      // c = -0.1 + 0.1i (inside the stable main cardioid)
      const c_re = -0.1;
      const c_im = 0.1;

      // Initial rho state inside unit circle |rho| <= 2
      const rho_re = (c - Math.floor(cols / 2)) * 0.15;
      const rho_im = (r - Math.floor(rows / 2)) * 0.15;

      const capacityR = 100; // Ah
      const remainingC = (initialEnergy / 100) * capacityR; // Ah
      const voltage = 3.7; // V
      const lossDeltaC = 0.05; // V
      const dischargeRate = 22.2; // A (-dC/dt)

      // Peff = (C/R) * (B - deltaC) * (-dC/dt)
      const Peff = (remainingC / capacityR) * (voltage - lossDeltaC) * dischargeRate;

      nodes.push({
        id,
        row: r,
        col: c,
        n_i: id + 1,
        rho_re,
        rho_im,
        c_re,
        c_im,
        isValid: true,
        neighbors,
        energyE: initialEnergy,
        targetEnergyEStar: targetEStar,
        voltage,
        capacityR,
        remainingC,
        dischargeRate,
        effectivePowerPeff: Peff,
      });
    }
  }

  const totalEnergy = nodes.reduce((sum, n) => sum + n.energyE, 0);

  return {
    nodes,
    timeStep: 0,
    totalEnergy,
    rejectedTransitions: 0,
    isAdiabaticBalanced: false,
  };
}

/**
 * Executes one discrete step of the canonical ANGELL² × Nr algorithm:
 * Step 1: Recursive Stability Check rho_i(t+1) = rho_i(t)² + c; if |rho| > 2 REJECTED
 * Step 2: Adiabatic Energy Redistribution Delta_E = E_i(t) - E_i*; E_j += Delta_E / |N(i)|; E_i = E_i*
 */
export function stepLatticeComputation(currentState: LatticeState): LatticeState {
  // Deep clone nodes
  const nextNodes: LatticeNode[] = currentState.nodes.map((n) => ({ ...n, neighbors: [...n.neighbors] }));
  let rejections = currentState.rejectedTransitions;

  // Step 1: Recursive Stability Check for each node
  for (let i = 0; i < nextNodes.length; i++) {
    const node = nextNodes[i];

    // Complex multiplication: (a + bi)^2 + (c_re + c_im i)
    // = (a^2 - b^2 + c_re) + i*(2ab + c_im)
    const new_re = node.rho_re * node.rho_re - node.rho_im * node.rho_im + node.c_re;
    const new_im = 2 * node.rho_re * node.rho_im + node.c_im;

    const magnitudeSq = new_re * new_re + new_im * new_im;

    if (magnitudeSq <= 4.0) { // |rho| <= 2 -> magnitudeSq <= 4
      node.rho_re = new_re;
      node.rho_im = new_im;
      node.isValid = true;
    } else {
      // Escape check violated: state transition REJECTED
      node.isValid = false;
      rejections++;
      // Reset or clamp rho inside boundary to maintain stability
      const scale = 1.8 / Math.sqrt(magnitudeSq);
      node.rho_re = new_re * scale;
      node.rho_im = new_im * scale;
    }
  }

  // Step 2: Adiabatic Energy Redistribution across neighbor set N(i)
  // Process nodes with energy imbalance (E_i != E_i*)
  const energyDeltas = new Array(nextNodes.length).fill(0);

  for (let i = 0; i < nextNodes.length; i++) {
    const node = nextNodes[i];
    if (!node.isValid) continue; // Skip rejected nodes

    const deltaE = node.energyE - node.targetEnergyEStar;

    if (Math.abs(deltaE) > 0.01 && node.neighbors.length > 0) {
      // Distribute excess energy equally to all valid neighbors j in N(i)
      const validNeighbors = node.neighbors.filter((jIdx) => nextNodes[jIdx].isValid);
      const shareCount = validNeighbors.length > 0 ? validNeighbors.length : node.neighbors.length;
      const shareAmount = deltaE / shareCount;

      const targetList = validNeighbors.length > 0 ? validNeighbors : node.neighbors;
      targetList.forEach((jIdx) => {
        energyDeltas[jIdx] += shareAmount;
      });

      // Node itself drops/rises to target state E_i*
      energyDeltas[i] -= deltaE;
    }
  }

  // Apply energy deltas (Conservation Guarantee: Sum(energyDeltas) = 0)
  for (let i = 0; i < nextNodes.length; i++) {
    nextNodes[i].energyE = Math.max(0, nextNodes[i].energyE + energyDeltas[i]);

    // Update derived battery metrics based on new node energy
    nextNodes[i].remainingC = (nextNodes[i].energyE / 100) * nextNodes[i].capacityR;
    const socRatio = nextNodes[i].remainingC / nextNodes[i].capacityR;
    const netVoltage = nextNodes[i].voltage - 0.05; // (B - deltaC)
    nextNodes[i].effectivePowerPeff = socRatio * netVoltage * nextNodes[i].dischargeRate;
  }

  const newTotalEnergy = nextNodes.reduce((sum, n) => sum + n.energyE, 0);

  // Check if system is adiabatically balanced (max delta < 0.5 Wh across all nodes)
  const maxImbalance = Math.max(...nextNodes.map((n) => Math.abs(n.energyE - n.targetEnergyEStar)));
  const isAdiabaticBalanced = maxImbalance < 0.5;

  return {
    nodes: nextNodes,
    timeStep: currentState.timeStep + 1,
    totalEnergy: newTotalEnergy,
    rejectedTransitions: rejections,
    isAdiabaticBalanced,
  };
}
