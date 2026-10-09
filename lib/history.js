export function enabled(){return Boolean(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN);}
async function command(args){
 const r=await fetch(process.env.UPSTASH_REDIS_REST_URL,{method:'POST',headers:{Authorization:`Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});
 if(!r.ok) throw new Error('History storage unavailable.'); const data=await r.json(); if(data.error) throw new Error('History storage unavailable.');return data.result;
}
export async function record(games,time){
 if(!enabled()) return;
 for(const g of games){
 const key=`pulse:history:${g.id}`; const bucket=Math.floor(time/60000)*60000;
 await command(['ZADD',key,bucket,JSON.stringify({time:bucket,ccu:g.ccu,visits:g.visits,favourites:g.favourites})]);
 await command(['ZREMRANGEBYSCORE',key,'-inf',time-30*86400000]);
 await command(['EXPIRE',key,31*86400]);
 }
}
export async function history(id){if(!enabled())return [];return (await command(['ZRANGEBYSCORE',`pulse:history:${id}`,Date.now()-30*86400000,'+inf'])).map(x=>JSON.parse(x));}
