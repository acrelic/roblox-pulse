export function ids(value) {
 const parts=String(value||'').split(',').filter(Boolean);
 if (!parts.length || parts.length>20 || parts.some(x=>!/^\d{1,16}$/.test(x) || !Number.isSafeInteger(Number(x)) || Number(x)<=0)) throw new Error('Enter 1–20 valid game IDs.');
 return [...new Set(parts)];
}
export async function json(url) {
 const r=await fetch(url,{signal:AbortSignal.timeout(10000)});
 if(!r.ok) throw new Error(r.status===429?'Roblox is rate limiting requests. Try again shortly.':'Roblox could not provide this data.');
 return r.json();
}
export async function resolve(placeId) {
 const data=await json(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
 if(!data.universeId) throw new Error('Game not found. Check the Roblox game link.');
 return String(data.universeId);
}
export async function games(universeIds) {
 const query=universeIds.join(',');
 const [details,votes,images]=await Promise.all([
 json(`https://games.roblox.com/v1/games?universeIds=${query}`),
 json(`https://games.roblox.com/v1/games/votes?universeIds=${query}`).catch(()=>null),
 json(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${query}&size=150x150&format=Png&isCircular=false`).catch(()=>null)
 ]);
 return (details.data||[]).map(g=>{const v=votes?.data?.find(x=>x.id===g.id); const image=images?.data?.find(x=>x.targetId===g.id); return {id:String(g.id),name:g.name,placeId:String(g.rootPlaceId),ccu:g.playing,visits:g.visits,favourites:g.favoritedCount,upVotes:v?.upVotes??null,downVotes:v?.downVotes??null,icon:image?.state==='Completed'?image.imageUrl:null,creator:g.creator?.name,updated:g.updated};});
}
export async function configuredIds() {
 const places=ids(process.env.TRACKED_PLACE_IDS||'86560821736864');
 return Promise.all(places.map(resolve));
}
