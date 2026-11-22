# faithful port of src/utils/angellLatticeMath.ts
def init(rows,cols):
    nodes=[]
    for r in range(rows):
        for c in range(cols):
            nb=[]
            if r>0: nb.append((r-1)*cols+c)
            if r<rows-1: nb.append((r+1)*cols+c)
            if c>0: nb.append(r*cols+c-1)
            if c<cols-1: nb.append(r*cols+c+1)
            center = r==rows//2 and c==cols//2
            nodes.append(dict(E=120.0 if center else 80.0,Es=85.0,re=(c-cols//2)*.15,im=(r-rows//2)*.15,cr=-.1,ci=.1,ok=True,nb=nb))
    return nodes
def step(nodes):
    rej=0
    for n in nodes:
        a,b=n['re'],n['im']; nr=a*a-b*b+n['cr']; ni=2*a*b+n['ci']; m=nr*nr+ni*ni
        if m<=4: n['re'],n['im'],n['ok']=nr,ni,True
        else: n['ok']=False; rej+=1; s=1.8/m**.5; n['re'],n['im']=nr*s,ni*s
    d=[0.0]*len(nodes)
    for i,n in enumerate(nodes):
        if not n['ok']: continue
        dE=n['E']-n['Es']
        if abs(dE)>0.01 and n['nb']:
            v=[j for j in n['nb'] if nodes[j]['ok']] or n['nb']
            for j in v: d[j]+=dE/len(v)
            d[i]-=dE
    for i,n in enumerate(nodes): n['E']=max(0,n['E']+d[i])
    return rej
for size in [2,3,4]:
    N=init(size,size); E0=sum(n['E'] for n in N); rej=0; hist=[]
    for k in range(200):
        rej+=step(N); hist.append(max(abs(n['E']-n['Es']) for n in N))
    print(f"{size}x{size}: total E start {E0:.1f}, after 200 steps {sum(n['E'] for n in N):.1f}; "
          f"sum of targets {85*size*size}; max imbalance at steps 1,10,50,200: "
          f"{hist[0]:.2f},{hist[9]:.2f},{hist[49]:.2f},{hist[199]:.2f}; balanced? {hist[-1]<0.5}; stability rejections {rej}")
