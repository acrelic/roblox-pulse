import {ids,resolve,games,configuredIds} from '../lib/roblox.js';
import {enabled,record,history} from '../lib/history.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Use GET.'});
 try {
 const url=new URL(req.url,'http://localhost');let list;
 try{list=ids(url.searchParams.get('ids'));}catch(e){return res.status(400).json({error:e.message});}
 const type=url.searchParams.get('type')||'universe';
 if(!['place','universe'].includes(type))return res.status(400).json({error:'Invalid ID type.'});
 if(type==='place')list=await Promise.all(list.map(resolve));
 const data=await games(list); const time=Date.now(); let historyError=false;let histories={};
 if(enabled()){
 try{const configured=await configuredIds();await record(data.filter(g=>configured.includes(g.id)),time);histories=Object.fromEntries(await Promise.all(data.map(async g=>[g.id,await history(g.id)])));}catch{historyError=true;}
 }
 return res.status(200).json({games:data,time,histories,storage:enabled(),historyError,missing:list.filter(id=>!data.some(g=>g.id===id))});
 }catch(e){return res.status(502).json({error:e.message});}
}
