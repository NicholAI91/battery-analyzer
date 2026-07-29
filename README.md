# LithiumPulse Analyzer & ANGELL² × Nr Lattice Simulator

> **Electrochemical Physical Capacity Modeling & Bounded Recursive Dynamical Lattice Network Simulation**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Framework](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4.svg)](https://tailwindcss.com/)

---

## 📌 Executive Summary

**LithiumPulse Analyzer** is an advanced electrochemical power diagnostic applet and multi-cell battery pack network simulator. It implements two core mathematical models:

1. **State-of-Charge (SOC) Weighted Working Capacity Model**:
   $$P_{\text{eff}} = \left(\frac{C}{R}\right) \cdot (B - \Delta c) \cdot \left(-\frac{dC}{dt}\right)$$
   Where:
   - $C$: Remaining available charge ($\text{Ah}$)
   - $R$: Nominal rated capacity ($\text{Ah}$)
   - $B$: Baseline open-circuit potential ($\text{V}$)
   - $\Delta c$: Ohmic loss and polarization voltage drop ($\text{V}$)
   - $-\frac{dC}{dt}$: Dynamic current discharge velocity ($\text{A}$)

2. **ANGELL² × Nr Product Space Lattice Network**:
   A bounded recursive dynamical system defined on a locally connected grid $P := A \times N_r$:
   - **Recursive Boundary Check ($N_r$)**: $z_{k+1} = z_k^2 + c$, rejecting state transitions where $|z_k| > 2$.
   - **Adiabatic Energy Redistribution ($\text{ANGELL}^2$)**: Conserves total system energy exactly ($E(t+1) = E(t)$) without heat dumping or bit flips by redistributing node excess energy $\Delta E_i = E_i(t) - E_i^*$ equally among local neighbors $j \in N(i)$.

---

## 🤖 AI Co-Assistance Attribution

This project was co-developed by **Nicholas Reid Angell** with AI engineering assistance provided by **Google DeepMind's Gemini Models** in Google AI Studio. 

- **Primary Theorist & Author**: Nicholas Reid Angell (`NicholAI91`)
- **AI Co-Assistant**: Google Gemini AI Studio Agent
- **Role**: Mathematical formalization code translation, UI component architecture, interactive charts, and Gemini API diagnostic integration.

---

## 🛠️ Key Features

- **Interactive Formula Visualizer**: Deconstruct the physical equation terms ($SOC$, Net Potential, Discharge Rate) with live bracket inspection.
- **Dynamic Parameter Sliders & Target Solver**: Real-time manipulation of battery capacity ($R$), state-of-charge ($C$), baseline voltage ($B$), internal loss ($\Delta c$), and current draw ($-dC/dt$), plus an inverse variable target solver.
- **Multi-Cell Lattice Network Simulator**: Interactive $2 \times 2$, $3 \times 3$, or $4 \times 4$ node array demonstrating adiabatic energy balancing and recursive stability validation.
- **Gemini AI Battery Engineering Diagnostic**: Real-time electrochemical health assessments, C-rate strain diagnostics, and optimization lifecycle reports powered by `@google/genai`.
- **Telemetry Export**: Export full time-series discharge data and state logs in standard CSV format.

---

## 📜 License

This project is licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for details.

```
Copyright 2026 Nicholas Reid Angell (NicholAI91)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```
