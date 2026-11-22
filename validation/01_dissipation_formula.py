import sympy as sp
t,g,tau,A,w,K,U0=sp.symbols('t gamma tau_U A omega K_c U_0',positive=True)
U=U0*sp.exp(-t/tau)*(1+A*sp.sin(w*t))
integrand=K*sp.exp(-g*t)*(-sp.diff(U,t))
L=sp.simplify(sp.integrate(integrand,(t,0,sp.oo),conds='none'))
print("Exact Lambda(inf) =",L)
a=1/tau+g
author=K*U0*(1/(a*tau) - A*w*g/(a**2+w**2))
print("Author formula matches exact?", sp.simplify(L-author)==0)
print("At gamma=0 exact:", sp.simplify(L.subs(g,0)))
print("Limit gamma->0:", sp.limit(L,g,0))
# numeric check vs app slider defaults
import numpy as np
vals={K:0.85,tau:2.0,A:0.5,w:5.0,U0:1.0}
for gv in [1.2,0.1,0.01,0.0]:
    print(f"gamma={gv}: Lambda={float(L.subs(vals).subs(g,gv)):.4f}")
