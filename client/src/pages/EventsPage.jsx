import React from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { apiGet } from "../api";
import { Card, Button, Pill, Skeleton } from "../ui.jsx";
import { showToast } from "../overlay";

function EventItem({ x }){
  const ev = x?.event || {};
  return (
    <div className="item">
      <div className="itemTop">
        <div>
          <div style={{fontWeight:900}}>{ev.map || "—"}</div>
          <div className="small">{ev.mode || "—"}</div>
        </div>
        <Pill>ID {ev.id || "—"}</Pill>
      </div>
      <div className="kv">
        <span>Start: {x?.startTime || "—"}</span>
        <span>End: {x?.endTime || "—"}</span>
      </div>
    </div>
  );
}

export function EventsPage(){
  const q = useQuery({ queryKey:["events"], queryFn: ()=>apiGet("/api/events") });

  return (
    <>
      <div id="toast" className="toast" />
      <Card className="cardPad">
        <div className="row" style={{alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <h1 className="h1">Eventos</h1>
            <div className="small">Rotação atual</div>
          </div>
          <Button className="btnGhost" onClick={()=>{ q.refetch(); showToast("Atualizando..."); }}>
            <RefreshCw size={16}/> Atualizar
          </Button>
        </div>

        <div className="sep" />

        {q.isLoading && (
          <div className="list">
            <div className="item"><Skeleton className="skelBox" /></div>
            <div className="item"><Skeleton className="skelBox" /></div>
          </div>
        )}
        {q.isError && <div className="err">{q.error?.message || "Erro"}</div>}

        <div className="list">
          {(q.data?.items || []).map((x, i)=><EventItem x={x} key={i} />)}
          {!q.isLoading && (q.data?.items || []).length === 0 && <div className="small">Sem dados.</div>}
        </div>
      </Card>
    </>
  );
}
