import { formatDistanceToNowStrict } from "date-fns";

export function stripHash(tag){
  return String(tag||"").trim().replace(/^#/,"").toUpperCase();
}

export function fmtCompact(n){
  const x = Number(n||0);
  if(x >= 1_000_000) return (x/1_000_000).toFixed(1).replace(/\.0$/,"") + "M";
  if(x >= 1_000) return (x/1_000).toFixed(1).replace(/\.0$/,"") + "k";
  return String(x);
}

export function ago(iso){
  try{
    if(!iso) return "—";
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  }catch{ return "—"; }
}

export function battleTypeLabel(t){
  const m = { ranked:"Ranqueado", trophy:"Troféus", friendly:"Amistoso", challenge:"Desafio" };
  return m[t] || (t || "—");
}

export function buildShareTextPlayer(p, battlelog){
  const lines = [];
  lines.push(`Perfil: ${p.name} (#${p.tag})`);
  if(p.club?.name) lines.push(`Clube: ${p.club.name} (#${p.club.tag})`);
  lines.push(`Troféus: ${p.trophies} (Best ${p.bestTrophies})`);
  lines.push(`Nível: ${p.expLevel} • Vitórias 3v3: ${p["3vs3Victories"]} • Solo: ${p.soloVictories} • Dupla: ${p.duoVictories}`);
  if(Array.isArray(p.brawlers)){
    const top = [...p.brawlers].sort((a,b)=> (b.trophies||0)-(a.trophies||0)).slice(0,5);
    lines.push("");
    lines.push("Top Brawlers:");
    for(const b of top) lines.push(`- ${b.name}: ${b.trophies} (Power ${b.power})`);
  }
  if(battlelog?.items?.length){
    lines.push("");
    lines.push("Últimas partidas:");
    for(const it of battlelog.items.slice(0,5)){
      const ev = it.event || {};
      const bt = it.battle || {};
      const mode = ev.mode || bt.mode || "—";
      const map = ev.map || "—";
      const result = bt.result || bt.rank || "—";
      lines.push(`- ${mode} • ${map} • ${result}`);
    }
  }
  return lines.join("\n");
}
