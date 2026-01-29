import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Users, Download } from "lucide-react";
import { apiGet } from "../api";
import { Card, Button, Input, Pill, Skeleton } from "../ui.jsx";
import { copyText } from "../share";
import { showToast, openModal, closeModal } from "../overlay";

function exportCSV(rows, filename){
  const esc = (s)=> `"${String(s ?? "").replaceAll('"','""')}"`;
  const csv = rows.map(r=>r.map(esc).join(",")).join("\n");
  try{
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("CSV exportado.");
  }catch{
    openModal({ title:"CSV (copiar)", text: csv });
  }
}

export function RankingsPage(){
  const [scope, setScope] = useState("global");
  const [type, setType] = useState("players");

  const q = useQuery({
    queryKey:["rankings", scope, type],
    queryFn: ()=> apiGet(`/api/rankings/${encodeURIComponent(scope)}/${encodeURIComponent(type)}?limit=50`)
  });

  const rows = useMemo(()=>{
    const items = q.data?.items || [];
    if(type === "players"){
      return items.map((x,i)=>[String(i+1), x.name, x.tag, String(x.trophies)]);
    }
    return items.map((x,i)=>[String(i+1), x.name, x.tag, String(x.trophies), String(x.members)]);
  }, [q.data, type]);

  return (
    <>
      <div id="toast" className="toast" />
      <div id="modalBack" className="modalBack" onClick={(e)=>{ if(e.target?.id==="modalBack") closeModal(); }}>
        <div className="modal" onClick={(e)=>e.stopPropagation()}>
          <div className="modalTop">
            <div id="modalTitle" className="modalTitle">Texto</div>
            <Button className="btnIcon" onClick={closeModal}>Fechar</Button>
          </div>
          <textarea id="modalText" spellCheck="false" />
          <div className="row" style={{padding:"10px 6px 4px"}}>
            <Button onClick={()=>copyText(document.getElementById("modalText")?.value || "")}>Copiar</Button>
          </div>
        </div>
      </div>

      <Card className="cardPad">
        <div className="row" style={{alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <h1 className="h1">Rankings</h1>
            <div className="small">Top 50</div>
          </div>
          <Pill>{type}</Pill>
        </div>

        <div className="sep" />

        <div className="row">
          <div style={{flex:"1 1 200px"}}>
            <div className="small">Scope (global ou país, ex: BR)</div>
            <Input value={scope} onChange={(e)=>setScope(e.target.value.trim() || "global")} />
          </div>

          <div style={{flex:"1 1 240px"}}>
            <div className="small">Tipo</div>
            <div className="row" style={{marginTop:6}}>
              <Button className={type==="players" ? "btnPrimary" : ""} onClick={()=>setType("players")}><Trophy size={16}/> Players</Button>
              <Button className={type==="clubs" ? "btnPrimary" : ""} onClick={()=>setType("clubs")}><Users size={16}/> Clubs</Button>
            </div>
          </div>

          <div style={{flex:"1 1 260px", alignSelf:"end"}}>
            <div className="row">
              <Button onClick={()=>copyText(rows.map(r=>r.join(" | ")).join("\n"))}>Copiar</Button>
              <Button className="btnPrimary" onClick={()=>exportCSV([type==="players" ? ["pos","name","tag","trophies"] : ["pos","name","tag","trophies","members"], ...rows], `ranking_${scope}_${type}.csv`)}>
                <Download size={16}/> CSV
              </Button>
            </div>
          </div>
        </div>

        <div className="sep" />

        {q.isLoading && (
          <div className="list">
            <div className="item"><Skeleton className="skelLine" /><div style={{height:8}} /><Skeleton className="skelLine2" /></div>
            <div className="item"><Skeleton className="skelLine" /><div style={{height:8}} /><Skeleton className="skelLine2" /></div>
          </div>
        )}
        {q.isError && <div className="err">{q.error?.message || "Erro"}</div>}

        <div className="list">
          {rows.map((r,i)=>(
            <div className="item" key={i}>
              <div className="itemTop">
                <div style={{fontWeight:900}}>#{r[0]} {r[1]}</div>
                <Pill>{r[3]} troféus</Pill>
              </div>
              <div className="kv">
                <span>Tag: #{r[2]}</span>
                {type==="clubs" && <span>Membros: {r[4]}</span>}
              </div>
            </div>
          ))}
          {!q.isLoading && rows.length===0 && <div className="small">Sem dados.</div>}
        </div>
      </Card>
    </>
  );
}
