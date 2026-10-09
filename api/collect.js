import {timingSafeEqual} from 'node:crypto';
import {configuredIds,games} from '../lib/roblox.js';
import {enabled,record} from '../lib/history.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Use GET.'});
 const expected=Buffer.from(`Bearer ${process.env.CRON_SECRET||''}`);const actual=Buffer.from(req.headers.authorization||'');
 if(!process.env.CRON_SECRET||expected.length!==actual.length||!timingSafeEqual(expected,actual))return res.status(401).json({error:'Unauthorized.'});
 if(!enabled())return res.status(503).json({error:'Configure Upstash Redis to collect background history.'});
 try{const data=await games(await configuredIds());if(!data.length)throw new Error('No configured games found.');await record(data,Date.now());res.status(200).json({collected:data.length,time:Date.now()});}catch(e){res.status(502).json({error:e.message});}
}
