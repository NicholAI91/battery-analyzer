# Validation Report: Testing the LithiumPulse Models

Date: 2026-11-22. All tests can be re-run with `pip install sympy scipy pybamm` and then `python3 validation/<script>.py`.

"Ground truth" for the battery tests is PyBaMM's SPMe electrochemical model of an LG M50 21700 cell (5 Ah, Chen2020 parameters). That is a peer-reviewed physics model, not a real cell. A real-data test (NASA or CALCE datasets) is the recommended next step.

## 1. Dissipation formula: `01_dissipation_formula.py`
- The closed form for Λ(∞) shown in the app **is derived correctly**. Symbolic integration matches it exactly.
- But when the gap closes (γ → 0), Λ(∞) → **K_c·U₀, a finite number**. With the app's defaults: 0.159 at γ=1.2, 0.700 at γ=0.1, 0.850 at γ=0.
- Dissipation is capped because the total potential drop is only U₀. **The "gap closes ⇒ dissipation diverges" step is not supported by this formula.** This confirms the Gemini critique.

## 2. Does P_eff describe the energy a battery delivers? `02_peff_energy.py`
Delivered energy (∫V·I dt) compared with what P_eff integrates to:

| C-rate | start SOC | real Wh | P_eff Wh | P_eff / real |
|---|---|---|---|---|
| 0.2C | 100% | 18.41 | 9.69 | 0.53 |
| 0.2C | 60% | 10.38 | 3.27 | 0.31 |
| 1C | 100% | 17.48 | 9.19 | 0.53 |
| 2C | 60% | 8.69 | 2.92 | 0.34 |

P_eff undercounts delivered energy by **46–69%**. The size of the error depends on the starting charge, not on any battery physics. The reason: at a fixed current, a battery delivers roughly the full V·I right down to empty. It does not deliver V·I × SOC. This also explains why the app's "efficiency" chart is identical to its SOC chart.

## 3. Does P_eff predict remaining peak power? `03_peak_power.py`
Real 10-second pulse power capability (HPPC method), compared with P_eff's SOC scaling:

| SOC | real (normalized) | P_eff predicts |
|---|---|---|
| 80% | 1.01 | 0.84 |
| 60% | 0.93 | 0.63 |
| 40% | 0.81 | 0.42 |
| 20% | 0.64 | 0.21 |

No. Real power capability stays high until low charge, then falls off. P_eff's straight-line drop is wrong at every level.

## 4. ANGELL² × Nr lattice: `04_lattice.py` (a direct port of `angellLatticeMath.ts`)
- **Energy conservation holds**, but only because the code moves numbers between cells with no loss. Real cell balancing either burns the excess as heat (passive) or loses about 5–15% in converters (active).
- **It never reaches balance.** The starting energy total never equals the sum of the targets: 360 vs 340 (2×2), 760 vs 765 (3×3), 1320 vs 1360 (4×4). So the "balanced" condition can't be met, and the imbalance stays stuck at 5–15 Wh forever.
- **The stability check never rejects anything** (0 in 200 steps at every size). The z²+c iteration doesn't use any battery data (voltage, temperature, energy), so it can't detect anything about the cells.

## 5. A method that does work: `05_ocv_r_model.py`
A standard equivalent-circuit approach takes one slow discharge to get the open-circuit-voltage curve and one 10-second pulse to get resistance (29 mΩ). Energy prediction error:

| C-rate | start SOC | P_eff | plain V·I | OCV + R model |
|---|---|---|---|---|
| 0.2C | 100% | −47.4% | +15.5% | **+0.2%** |
| 0.2C | 60% | −68.5% | +12.2% | **+1.1%** |
| 1C | 60% | −68.1% | +12.2% | **+0.4%** |
| 2C | 60% | −66.4% | +15.6% | **+2.2%** |

## Summary and limits
- The formulas in the code compute what they say they compute. The dissipation closed form matches exact integration, and the lattice keeps its energy total.
- Tests 2, 3 and 5 compare against a **physics simulation (PyBaMM), not a real battery**. They show how P_eff compares with that simulation. They do not show how it performs on real hardware.
- These tests read P_eff as a prediction of delivered energy and of burst power, which is how the app labels it. If P_eff is meant to measure something else, these tests don't cover it.
- Not yet tested: real measured battery data (for example the public NASA or CALCE cycling datasets).
