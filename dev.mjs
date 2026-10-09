import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';
const root=path.resolve('public');
http.createServer(async(req,res)=>{
 res.status=code=>{res.statusCode=code;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
 try {const url=new URL(req.url,'http://localhost');if(['/api/stats','/api/collect'].includes(url.pathname)){const mod=await import(`.${url.pathname}.js`);return await mod.default(req,res);}
 const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep))return res.status(403).json({error:'Forbidden'});
 res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));
 }catch{res.status(404).json({error:'Not found'});}
}).listen(3000,()=>console.log('Roblox Pulse: http://localhost:3000'));
