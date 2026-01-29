# Brawl Meta Profile Project

## Rodar local
1) Backend
```bash
cd server
npm i
BRAWLSTARS_TOKEN="SEU_TOKEN" node index.js
```

2) Frontend
```bash
cd ../client
npm i
VITE_API_BASE=http://localhost:5179 npm run dev
```

Nota: token só no server (.env).


## Deploy no Render (onrender)
1) Suba este projeto para um repositório (GitHub/GitLab) com o `render.yaml` na raiz.
2) No Render Dashboard: **New > Blueprint** e selecione o repo.
3) Na criação, o Render vai pedir:
   - `BRAWLSTARS_TOKEN` (no serviço **brawl-proxy**)
   - `VITE_API_BASE` (no serviço **brawl-meta-ui**) → use a URL pública do proxy, exemplo: `https://brawl-proxy.onrender.com`
4) Depois do deploy:
   - Abra o serviço **brawl-proxy** e confirme `/api/health` OK.
   - Abra o **brawl-meta-ui** e teste a busca.

SPA/React Router: já está configurado com rewrite `/* -> /index.html`.


IP (allowlist):
- Abra /meuip no site, ou chame /api/egress-ip no proxy.
- No Render, prefira allowlistar os *Outbound IP ranges* da região no Dashboard.


## Se o Render estiver rodando na raiz do repo
O erro `Could not read package.json /opt/render/project/src/package.json` acontece quando o serviço foi criado apontando para a raiz do repo.
Este repo agora tem `package.json` na raiz com `npm start` que sobe o backend em `server/index.js`.
Recomendado mesmo assim: usar o `render.yaml` (Blueprint) pra subir 2 serviços (proxy + static).
