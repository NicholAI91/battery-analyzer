import pybamm, numpy as np
pv=pybamm.ParameterValues("Chen2020"); model=pybamm.lithium_ion.SPMe()
Q=5.0; Vmin=2.5; I=5.0
print(" SOC |  OCV  | R_10s mOhm | Pmax W (true) | Pmax norm | SOC*Pmax(100%) norm")
rows=[]
for soc in [0.95,0.8,0.6,0.4,0.2,0.1]:
    exp=pybamm.Experiment(["Rest for 60 seconds",f"Discharge at {I} A for 10 seconds"],period="1 second")
    sol=pybamm.Simulation(model,parameter_values=pv,experiment=exp).solve(initial_soc=soc)
    V=sol["Voltage [V]"].entries; ocv=V[0]; v10=V[-1]
    R=(ocv-v10)/I
    pmax=Vmin*(ocv-Vmin)/R   # standard HPPC power capability
    rows.append((soc,ocv,R,pmax))
p0=rows[0][3]
for soc,ocv,R,p in rows:
    print(f"{soc:4} | {ocv:.3f} | {R*1000:8.1f} | {p:8.1f} | {p/p0:5.2f} | {soc/0.95:5.2f}")
