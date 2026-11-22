import pybamm, numpy as np
pv=pybamm.ParameterValues("Chen2020"); model=pybamm.lithium_ion.SPMe(); Q=5.0
def run(steps,soc0): return pybamm.Simulation(model,parameter_values=pv,experiment=pybamm.Experiment(steps)).solve(initial_soc=soc0)
# calibration: slow C/20 discharge gives OCV-vs-charge curve; one 10s pulse gives R
s=run([f"Discharge at {Q/20} A until 2.5 V"],1.0)
qcal=(Q/20)*s["Time [h]"].entries; ocv=s["Voltage [V]"].entries
p=pybamm.Simulation(model,parameter_values=pv,experiment=pybamm.Experiment(["Rest for 60 seconds",f"Discharge at {Q} A for 10 seconds"],period="1 second")).solve(initial_soc=0.5)
Vp=p["Voltage [V]"].entries; R=(Vp[0]-Vp[-1])/Q
print(f"calibrated R = {R*1000:.1f} mOhm")
print("crate soc0 | real Wh | P_eff err | V·I err | OCV+R model err")
for crate in [0.2,0.5,1.0,2.0]:
  for soc0 in [1.0,0.6]:
    I=crate*Q; sol=run([f"Discharge at {I} A until 2.5 V"],soc0)
    t=sol["Time [h]"].entries; V=sol["Voltage [V]"].entries; real=np.trapezoid(V*I,t)
    C=soc0*Q-I*t; peff=np.trapezoid((C/Q)*V*I,t); std=V[0]*I*t[-1]
    # ECM prediction: walk OCV curve from start charge, subtract I*R, stop when V<2.5
    q0=(1-soc0)*Q; qs=np.linspace(q0,qcal[-1],2000); v=np.interp(qs,qcal,ocv)-I*R
    m=v>=2.5; ecm=np.trapezoid(v[m],qs[m])
    e=lambda x:f"{100*(x-real)/real:+6.1f}%"
    print(f"{crate:4} {soc0:4} | {real:6.2f} | {e(peff)} | {e(std)} | {e(ecm)}")
