import { openModal, showToast } from "./overlay";

function legacyCopy(text){
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly","");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  let ok = false;
  try{ ok = document.execCommand("copy"); }catch{}
  ta.remove();
  return ok;
}

export async function copyText(text){
  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
      showToast("Copiado.");
      return true;
    }
  }catch{}
  if(legacyCopy(text)){
    showToast("Copiado.");
    return true;
  }
  openModal({ title: "Copiar (manual)", text });
  showToast("Cópia automática bloqueada.");
  return false;
}

export async function shareWhatsApp(text){
  try{
    if(navigator.share){
      await navigator.share({ text });
      return true;
    }
  }catch{}
  try{
    window.location.href = "https://wa.me/?text=" + encodeURIComponent(text);
    return true;
  }catch{}
  openModal({ title: "WhatsApp (manual)", text });
  showToast("Não deu pra abrir o WhatsApp.");
  return false;
}
