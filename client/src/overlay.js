let toastTimer = null;

export function showToast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.textContent = msg;
  el.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.style.display = "none"; }, 2200);
}

export function openModal({ title, text }){
  const back = document.getElementById("modalBack");
  const t = document.getElementById("modalTitle");
  const ta = document.getElementById("modalText");
  if(!back || !t || !ta) return;

  t.textContent = title || "Texto";
  ta.value = text || "";

  back.style.display = "flex";
  requestAnimationFrame(()=>{
    ta.focus();
    ta.select();
  });
}

export function closeModal(){
  const back = document.getElementById("modalBack");
  if(!back) return;
  back.style.display = "none";
}
