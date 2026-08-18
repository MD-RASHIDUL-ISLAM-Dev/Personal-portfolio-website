import json, glob, os
for path in sorted(glob.glob('/home/ubuntu/workspace/portfolio-upgrade/*-v33.4.json')):
    try:
        value=json.load(open(path,encoding='utf-8'))
    except Exception as exc:
        print(os.path.basename(path), 'parse error', exc); continue
    print('\n'+os.path.basename(path))
    def walk(v, prefix=''):
        if isinstance(v, dict):
            for k,x in v.items():
                key=f'{prefix}.{k}' if prefix else k
                if isinstance(x,(str,int,float,bool)) or x is None:
                    if any(term in k.lower() for term in ('error','fail','overflow','visible','hidden','count','pass','ok','width','focus','image','open','loaded','working','message')):
                        print(key, '=', repr(x)[:220])
                elif isinstance(x, list) and len(x) <= 8 and all(isinstance(i,(str,int,float,bool)) or i is None for i in x):
                    print(key, '=', repr(x)[:220])
                elif isinstance(x,(dict,list)):
                    walk(x,key)
        elif isinstance(v,list) and len(v) <= 8:
            for i,x in enumerate(v): walk(x,f'{prefix}[{i}]')
    walk(value)
