const list=document.querySelector('#activity-list'),loading=document.querySelector('#loading'),more=document.querySelector('#more');
    let items=[],shown=0; const batch=3;
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function render(){const next=items.slice(shown,shown+batch);next.forEach(x=>{const el=document.createElement('article');el.className='card activity-card';el.dataset.id=x.id;el.innerHTML=`<p class="meta">${esc(x.start_date)}〜${esc(x.end_date)}</p><h2>${esc(x.title)}</h2><p class="price" data-price="${x.price_yen}">${x.price_yen.toLocaleString('ja-JP')}円</p><p class="status">${esc(x.status)}</p><p>${esc(x.conditions)}</p><p class="meta">更新：${esc(x.updated_at)}</p>`;list.appendChild(el)});shown+=next.length;more.classList.toggle('hidden',shown>=items.length)}
    fetch('activities.json').then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}).then(d=>{items=d.items;loading.remove();render()}).catch(e=>{loading.textContent=`読み込み失敗：${e.message}。HTTPサーバー経由で開いてください。`});
    more.addEventListener('click',render);
