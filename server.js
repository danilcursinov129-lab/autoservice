const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,EM=(process.env.OWNER_EMAIL||'owner@autoforge.pro').toLowerCase(),PW=process.env.OWNER_PASS||'Forge#2026!x7';
const DD=process.env.DATA_DIR||path.join(__dirname,'data'),DBF=path.join(DD,'db.json'),SF=path.join(DD,'.secret'),PUB=path.join(__dirname,'public');
fs.mkdirSync(DD,{recursive:true});
const SEC=process.env.SECRET||(fs.existsSync(SF)?fs.readFileSync(SF,'utf8'):(()=>{const s=crypto.randomBytes(32).toString('hex');fs.writeFileSync(SF,s);return s})());
let D={config:null,requests:[]};try{D=JSON.parse(fs.readFileSync(DBF,'utf8'))}catch{}
const save=()=>{fs.writeFileSync(DBF+'.tmp',JSON.stringify(D));fs.renameSync(DBF+'.tmp',DBF)};
const sig=x=>crypto.createHmac('sha256',SEC).update(x).digest('hex'),H=v=>crypto.createHash('sha256').update(String(v)).digest();
const eq=(a,b)=>crypto.timingSafeEqual(H(a),H(b));
const mk=()=>{const x=Date.now()+6048e5;return x+'.'+sig(''+x)};
const ok=r=>{const[x,s]=(r.headers.authorization||'').slice(7).split('.');return !!(x&&s&&+x>Date.now()&&eq(sig(x),s))};
const hit={},lim=(k,n,ms)=>{const t=Date.now(),a=(hit[k]=(hit[k]||[]).filter(v=>t-v<ms));a.push(t);return a.length>n};
const MIME={'.html':'text/html;charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png','.json':'application/json'};
const body=r=>new Promise((res,rej)=>{let b='';r.on('data',c=>{b+=c;if(b.length>8e6){rej();r.destroy()}});r.on('end',()=>{try{res(JSON.parse(b||'{}'))}catch{rej()}})});
http.createServer(async(q,s)=>{const send=(c,o)=>{s.writeHead(c,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'});s.end(JSON.stringify(o))};
try{const p=new URL(q.url,'http://x').pathname,ip=(q.headers['x-forwarded-for']||q.socket.remoteAddress||'').split(',')[0].trim(),m=q.method;
if(p.startsWith('/api/')){const a=p.slice(5).split('/');if(m==='OPTIONS')return send(200,{});
if(a[0]==='config'&&m==='GET')return send(200,Object.assign({},D.config||{},{ok:1,srv:'af'}));
if(a[0]==='config'&&m==='POST'){if(!ok(q))return send(401,{});const c=await body(q);if(!Array.isArray(c.services))return send(400,{});D.config=c;save();return send(200,{ok:1})}
if(a[0]==='login'&&m==='POST'){if(lim('l'+ip,10,9e5))return send(429,{});const r=await body(q),g=eq(String(r.e||'').toLowerCase(),EM),w=eq(r.p||'',PW);return g&&w?send(200,{token:mk()}):send(401,{})}
if(a[0]==='request'&&m==='POST'&&!a[1]){if(lim('r'+ip,20,36e5)||D.requests.length>5000)return send(429,{});const r=await body(q),n=v=>String(v||'').slice(0,500);
if(!n(r.name).trim()||n(r.phone).replace(/\D/g,'').length<10)return send(400,{});D.requests.unshift({id:crypto.randomUUID(),name:n(r.name),phone:n(r.phone),car:n(r.car),svc:n(r.svc),note:n(r.note),date:n(r.date),ts:Date.now(),st:'new'});save();return send(200,{ok:1})}
if(a[0]==='requests'&&m==='GET'){if(!ok(q))return send(401,{});return send(200,D.requests)}
if(a[0]==='request'&&a[1]){if(!ok(q))return send(401,{});const i=D.requests.findIndex(v=>v.id===a[1]);if(i<0)return send(404,{});
if(m==='PATCH'){const r=await body(q);D.requests[i].st=r.st==='done'?'done':'new'}else if(m==='DELETE')D.requests.splice(i,1);else return send(405,{});save();return send(200,{ok:1})}
return send(404,{})}
const f=path.join(PUB,p==='/'?'index.html':p);if(!f.startsWith(PUB)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){s.writeHead(404);return s.end('Not found')}
s.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':p==='/sw.js'?'no-cache':'public,max-age=300'});fs.createReadStream(f).pipe(s)}
catch{try{send(400,{})}catch{}}}).listen(PORT,()=>console.log('AUTOFORGE: http://localhost:'+PORT));
