import pybamm, numpy as np
pv0=pybamm.ParameterValues("Chen2020")   # LG M50 21700 cell, ~5 Ah
model=pybamm.lithium_ion.SPMe()
Q=pv0["Nominal cell capacity [A.h]"]
def discharge(crate, soc0, Vmin=2.5):
    pv=pv0.copy(); I=crate*Q
    exp=pybamm.Experiment([f"Discharge at {I} A until {Vmin} V"])
    sim=pybamm.Simulation(model,parameter_values=pv,experiment=exp)
    sol=sim.solve(initial_soc=soc0)
    t=sol["Time [h]"].entries; V=sol["Voltage [V]"].entries
    return t,V,I
print(f"cell capacity {Q} Ah")
print("crate  soc0 | real Wh (∫V·I) | std app V·I·t | P_eff app Wh | P_eff/real")
for crate in [0.2,0.5,1.0,2.0]:
  for soc0 in [1.0,0.6]:
    t,V,I=discharge(crate,soc0)
    real=np.trapezoid(V*I,t)
    Ah=I*t[-1]
    V0=V[0]
    std=V0*I*t[-1]
    # app: P_eff = (C/R) V I with C falling linearly from soc0*Q
    C=soc0*Q - I*t
    peff=np.trapezoid((C/Q)*V*I,t)
    print(f"{crate:4} {soc0:5} | {real:8.2f} | {std:8.2f} | {peff:8.2f} | {peff/real:5.2f}   (delivered {Ah:.2f} Ah)")
