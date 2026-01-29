import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, RefreshCw } from "lucide-react";
import { apiGet } from "../api";
import { Card, Button, Pill, Skeleton } from "../ui.jsx";
import { copyText } from "../share";
import { showToast } from "../overlay";

export function MeuIpPage(){
  const q = useQuery({
    queryKey: ["egress-ip"],
    queryFn: () => apiGet("/api/egress-ip"),
    refetchOnWindowFocus: false
  });

  const egress = q.data?.egressIp || "—";
  const client = q.data?.clientIp || "—";

  return (
    <>
      <div id="toast" className="toast" />
      <Card className="cardPad">
        <div className="row" style={{alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <h1 className="h1">Meu IP (Render)</h1>
            <div className="small">Pra allowlist do token</div>
          </div>
          <Button className="btnGhost" onClick={()=>{ q.refetch(); showToast("Atualizando..."); }}>
            <RefreshCw size={16}/> Atualizar
          </Button>
        </div>

        <div className="sep" />

        {q.isLoading && (
          <div className="list">
            <div className="item"><Skeleton className="skelLine" /><div style={{height:8}} /><Skeleton className="skelLine2" /></div>
          </div>
        )}
        {q.isError && <div className="err">{q.error?.message || "Erro"}</div>}

        <div className="list">
          <div className="item">
            <div className="itemTop">
              <div>
                <div style={{fontWeight:900}}>Egress IP</div>
                <div className="small">IP público de saída do serviço</div>
              </div>
              <Pill>{egress}</Pill>
            </div>
            <div className="row" style={{marginTop:10}}>
              <Button className="btnPrimary" onClick={()=>copyText(egress)} disabled={egress==="—"}>
                <Copy size={16}/> Copiar egress
              </Button>
            </div>
          </div>

          <div className="item">
            <div className="itemTop">
              <div>
                <div style={{fontWeight:900}}>Client IP</div>
                <div className="small">Seu IP visto pelo proxy</div>
              </div>
              <Pill>{client}</Pill>
            </div>
            <div className="row" style={{marginTop:10}}>
              <Button onClick={()=>copyText(client)} disabled={client==="—"}>
                <Copy size={16}/> Copiar client
              </Button>
            </div>
          </div>

          <div className="small" style={{lineHeight:"1.35rem"}}>
            Importante: no Render, o recomendado é allowlistar o <b>range</b> de outbound IPs da região no Dashboard (não é sempre 1 IP fixo).
          </div>
        </div>
      </Card>
    </>
  );
}
