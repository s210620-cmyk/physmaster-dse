/* ============================================================
   PhysMaster DSE — app shell, router and page renderers
   All interaction uses event delegation (data-act) so the app
   works even where inline on* handlers are blocked by CSP.
   ============================================================ */
(function(){
  'use strict';
  Store.load();
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function formatAI(t){
    const e=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    let html=e(t||'');
    html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    const lines=html.split(/\r?\n/);
    let out='', listType=null;
    const close=()=>{ if(listType){ out+=(listType==='ul'?'</ul>':'</ol>'); listType=null; } };
    for(const line of lines){
      const ul=line.match(/^\s*[-*]\s+(.*)/);
      const ol=line.match(/^\s*\d+[.)]\s+(.*)/);
      const hd=line.match(/^#{1,4}\s+(.*)/);
      if(hd){ close(); out+='<h4>'+hd[1]+'</h4>'; continue; }
      if(ul){ if(listType!=='ul'){close(); out+='<ul>'; listType='ul';} out+='<li>'+ul[1]+'</li>'; continue; }
      if(ol){ if(listType!=='ol'){close(); out+='<ol>'; listType='ol';} out+='<li>'+ol[1]+'</li>'; continue; }
      if(!line.trim()){ close(); continue; }
      close(); out+='<p>'+line+'</p>';
    }
    close(); return out;
  }
  let charts=[];
  function disposeCharts(){ charts.forEach(c=>{try{c.dispose();}catch(e){}}); charts=[]; }

  const App = {
    route:'dashboard',
    render(route){
      this.route=route; disposeCharts();
      if(location.hash!=='#/'+route){ try{history.replaceState(null,'','#/'+route);}catch(e){} }
      document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.route===route));
      const fn=this['page_'+route];
      $('#main').innerHTML = fn? fn.call(this) : '<p>Page not found</p>';
      if(this['after_'+route]) this['after_'+route]();
      window.scrollTo(0,0);
      if(route!=='notes'){ try{history.replaceState(null,'','#/'+route);}catch(e){} }
    },
    routeFromHash(){
      const h=(location.hash||'').replace('#/','');
      if(h.indexOf('note/')===0){ this.render('notes'); this.viewNote(h.slice(5)); }
      else if(this['page_'+h]) this.render(h);
      else this.render('dashboard');
    },

    /* ---------- Dashboard ---------- */
    page_dashboard(){
      const s=Store.state();
      const total=s.attempts.length;
      const correct=s.attempts.filter(a=>a.correct).length;
      const acc=total?Math.round(100*correct/total):0;
      const weak=Store.weakTopics()[0];
      return `
      <div class="page-head"><h1>🏠 Dashboard</h1><p>Your HKDSE Physics command centre — practice, check answers and track weak topics.</p></div>
      <div class="grid g4 mb">
        <div class="card stat"><span class="ico">✍️</span><span class="num">${total}</span><span class="lbl">Questions Attempted</span></div>
        <div class="card stat"><span class="ico">🎯</span><span class="num">${acc}%</span><span class="lbl">Overall Accuracy</span></div>
        <div class="card stat"><span class="ico">🃏</span><span class="num">${s.knownCards.length}</span><span class="lbl">Flashcards Mastered</span></div>
        <div class="card stat"><span class="ico">📌</span><span class="num" style="font-size:18px;line-height:1.3">${weak?esc(weak.icon+' '+weak.name):'—'}</span><span class="lbl">Weakest Topic (focus here)</span></div>
      </div>
      <div class="grid g2">
        <div class="card">
          <h3>Quick actions</h3>
          <div class="grid" style="gap:10px;margin-top:8px">
            <button class="btn btn-primary" data-act="render" data-arg="practice">✍️ Generate HKDSE-style questions</button>
            <button class="btn btn-secondary" data-act="render" data-arg="checker">✅ Check my answer</button>
            <button class="btn btn-secondary" data-act="render" data-arg="qa">💬 Ask a physics question</button>
            <button class="btn btn-secondary" data-act="render" data-arg="papers">📝 Open past papers</button>
          </div>
        </div>
        <div class="card">
          <h3>Topic mastery</h3>
          <div id="dashMastery" style="margin-top:8px"></div>
        </div>
      </div>
      <div class="section-title">📚 Study workflow</div>
      <div class="grid g3">
        <div class="card"><h3>1 · Revise</h3><p class="muted small">Read printable topic notes & flip flashcards.</p><button class="btn btn-secondary btn-sm mt" data-act="render" data-arg="notes">Open notes</button></div>
        <div class="card"><h3>2 · Practise</h3><p class="muted small">Generate questions, answer them, get instant marking.</p><button class="btn btn-secondary btn-sm mt" data-act="render" data-arg="practice">Start practice</button></div>
        <div class="card"><h3>3 · Review</h3><p class="muted small">Analytics flags weak topics; revisit and retest.</p><button class="btn btn-secondary btn-sm mt" data-act="render" data-arg="analytics">See analytics</button></div>
      </div>`;
    },
    after_dashboard(){ this.renderMasteryBars('dashMastery'); },
    renderMasteryBars(elId){
      const m=Store.topicMastery(), el=document.getElementById(elId); if(!el)return;
      el.innerHTML = TOPICS.map(t=>{
        const x=m[t.id], pct=x.pct==null?0:x.pct;
        const col=x.total===0?'#cbd5e1':(x.pct>=70?'#16a34a':x.pct>=45?'#d97706':'#dc2626');
        return `<div style="margin-bottom:9px">
          <div class="flex between small" style="margin-bottom:3px"><span><b>${t.icon} ${esc(t.name)}</b></span>
          <span class="muted">${x.total===0?'not attempted':x.correct+'/'+x.total+' · '+x.pct+'%'}</span></div>
          <div class="progress-bar"><div style="width:${pct}%;background:${col}"></div></div></div>`;
      }).join('');
    },

    /* ---------- Answer checker (AI photo + quick offline) ---------- */
    page_checker(){
      const s=Store.state();
      const tab=App.ai.tab;
      return `
      <div class="page-head"><h1>✅ Answer Checker</h1><p>AI photo marking for handwritten work, graphs and diagrams — plus a quick offline numeric/keyword checker.</p></div>
      <div class="tabs">
        <button class="tab ${tab==='ai'?'active':''}" data-act="switchCheckerTab" data-arg="ai">🤖 AI photo checker</button>
        <button class="tab ${tab==='quick'?'active':''}" data-act="switchCheckerTab" data-arg="quick">⚡ Quick checker (offline)</button>
      </div>
      ${tab==='ai'? this._aiCheckerHtml() : this._quickCheckerHtml()}
      <div class="section-title">🧾 Recent checks</div>
      <div class="card">${s.checkerHistory.length? s.checkerHistory.slice().reverse().slice(0,8).map(h=>
        `<div class="check-line"><span class="badge ${h.verdict==='correct'?'easy':h.verdict==='partial'?'medium':h.verdict==='ai'?'':'hard'}">${h.verdict}</span><span>${esc(h.text)}</span></div>`).join('') : '<p class="muted small">No checks yet.</p>'}</div>`;
    },
    after_checker(){
      const fi=document.getElementById('aiFiles');
      if(fi){
        fi.addEventListener('change',async e=>{
          const files=Array.from(e.target.files||[]);
          if(!files.length)return;
          App.ai.error=null;
          const room=Math.max(0,6-App.ai.images.length);
          for(const f of files.slice(0,room)){
            try{ const im=await AIChecker.fileToImage(f); App.ai.images.push(im); }
            catch(err){ App.ai.error=(err&&err.msg)||'Could not read an image.'; }
          }
          e.target.value='';
          App.render('checker');
        });
      }
    },
    _quickCheckerHtml(){
      return `
      <div class="grid g2">
        <div class="card">
          <h3>🔢 Numeric answer</h3>
          <div class="field"><label>Topic</label><select id="ncTopic">${TOPICS.map(t=>`<option value="${t.id}">${t.icon} ${esc(t.name)}</option>`).join('')}</select></div>
          <div class="grid g2">
            <div class="field"><label>Your answer (number)</label><input id="ncUser" placeholder="e.g. 19.6"></div>
            <div class="field"><label>Accepted answer</label><input id="ncAns" placeholder="e.g. 20"></div>
          </div>
          <div class="grid g2">
            <div class="field"><label>Tolerance %</label><input id="ncTol" type="number" value="5"></div>
            <div class="field"><label>Unit (optional)</label><input id="ncUnit" placeholder="e.g. m/s"></div>
          </div>
          <button class="btn btn-primary" data-act="checkNumeric">Check numeric answer</button>
          <div id="ncOut"></div>
        </div>
        <div class="card">
          <h3>📝 Written / explain answer</h3>
          <div class="field"><label>Your written answer</label><textarea id="wcUser" placeholder="Type your explanation…"></textarea></div>
          <div class="field"><label>Required key points (comma-separated)</label><textarea id="wcKeys" placeholder="e.g. constant horizontal velocity, acceleration g downward, v=0 at peak"></textarea></div>
          <button class="btn btn-primary" data-act="checkWritten">Check key points</button>
          <div id="wcOut"></div>
        </div>
      </div>`;
    },
    _aiCheckerHtml(){
      const cfg=AIChecker.load();
      const imgs=App.ai.images;
      const noKey=!cfg.apiKey;
      return `
      ${noKey?'<div class="ai-banner warn">🤖 AI marking needs a free API key (stored only on this device). Tap ⚙️ <b>AI settings</b> to add one — Google Gemini gives a free key and works directly in the browser.</div>':''}
      ${App.ai.error?`<div class="ai-banner err">${esc(App.ai.error)}</div>`:''}
      ${App.ai.settingsMsg?`<div class="ai-banner ok">${esc(App.ai.settingsMsg)}</div>`:''}
      <div class="grid g2">
        <div class="card">
          <h3>📝 What to mark</h3>
          <div class="field"><label>Topic</label><select id="aiTopic">${TOPICS.map(t=>`<option value="${t.id}">${t.icon} ${esc(t.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Question (paste the full question)</label><textarea id="aiQuestion" rows="3" placeholder="e.g. A 2 kg block on a rough surface is pushed by 10 N; friction is 4 N. Find the acceleration."></textarea></div>
          <div class="grid g2">
            <div class="field"><label>Marks available</label><input id="aiMarks" type="number" min="1" value="5"></div>
            <div class="field"><label>Your typed answer (optional)</label><input id="aiAnswer" placeholder="e.g. 3 m/s²"></div>
          </div>
          <div class="field"><label>Marking scheme / expected answer (optional, improves marking)</label><textarea id="aiExpected" rows="2" placeholder="Paste the model answer or marking points…"></textarea></div>
        </div>
        <div class="card">
          <h3>📷 Your work / graph / diagram</h3>
          <p class="small muted">Take a photo of handwritten working, a free-body diagram, a motion graph, a circuit or ray diagram. Up to 6 images. Photos are resized on your device before sending.</p>
          <input type="file" id="aiFiles" accept="image/*" multiple style="display:none">
          <button class="btn btn-secondary" data-act="aiPickFiles">📷 Add photo / diagram</button>
          <span class="small muted" style="margin-left:8px">${imgs.length}/6 attached</span>
          <div class="thumbs">${imgs.map((im,i)=>`<div class="thumb"><img src="${im.dataUrl}" alt="attached"><button class="rm" data-act="aiRemoveImage" data-arg="${i}" title="Remove">✕</button></div>`).join('')}</div>
          <div class="flex mt" style="gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" data-act="aiCheck" ${App.ai.loading?'disabled':''}>${App.ai.loading?'⏳ Marking with AI…':'✅ Check with AI'}</button>
            <button class="btn btn-secondary" data-act="aiToggleSettings">⚙️ AI settings</button>
            ${App.ai.result?'<button class="btn btn-secondary" data-act="aiClearResult">🗑 Clear result</button>':''}
          </div>
          <div id="aiSettings" style="${App.ai.showSettings?'':'display:none'};margin-top:14px">
            <div class="card" style="box-shadow:none;border:1px solid var(--background)">
              <h4>AI settings</h4>
              <div class="grid g2">
                <div class="field"><label>Provider</label><select id="aiProvider"><option value="gemini" ${cfg.provider==='gemini'?'selected':''}>Google Gemini (recommended)</option><option value="openai" ${cfg.provider==='openai'?'selected':''}>OpenAI-compatible (OpenRouter / local)</option></select></div>
                <div class="field"><label>Model</label><input id="aiModel" value="${esc(cfg.model)}"></div>
              </div>
              <div class="field"><label>API key (saved only in this browser)</label>
                <div class="flex" style="gap:6px"><input type="password" id="aiKey" value="${esc(cfg.apiKey)}" placeholder="Paste your API key"><button class="btn btn-secondary btn-sm" data-act="aiShowKey" type="button">👁</button></div>
              </div>
              <div class="field"><label>API base URL</label><input id="aiBaseUrl" value="${esc(cfg.baseUrl)}"></div>
              <div class="flex" style="gap:10px;flex-wrap:wrap">
                <button class="btn btn-primary btn-sm" data-act="aiSaveSettings">💾 Save settings</button>
                <a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="https://aistudio.google.com/apikey">Get a free Gemini key</a>
              </div>
              <p class="small muted mt">Gemini free tier works directly in the browser. Official OpenAI blocks browser calls — use OpenRouter or a local proxy with the OpenAI-compatible option.</p>
            </div>
          </div>
        </div>
      </div>
      ${App.ai.result?`<div class="section-title">🤖 AI marking result</div><div class="ai-result">${formatAI(App.ai.result)}</div>`:''}`;
    },
    switchCheckerTab(arg){ App.ai.tab=arg; App.ai.settingsMsg=null; App.render('checker'); },
    aiPickFiles(){ const f=document.getElementById('aiFiles'); if(f)f.click(); },
    aiRemoveImage(arg){ App.ai.images.splice(Number(arg),1); App.render('checker'); },
    aiToggleSettings(){ App.ai.showSettings=!App.ai.showSettings; App.render('checker'); },
    aiShowKey(){ const k=document.getElementById('aiKey'); if(k) k.type = k.type==='password'?'text':'password'; },
    aiSaveSettings(){
      const cfg={
        provider:document.getElementById('aiProvider').value,
        model:(document.getElementById('aiModel').value||'').trim()||'gemini-1.5-flash',
        apiKey:(document.getElementById('aiKey').value||'').trim(),
        baseUrl:(document.getElementById('aiBaseUrl').value||'').trim()||'https://generativelanguage.googleapis.com/v1beta'
      };
      AIChecker.save(cfg);
      App.ai.error=null;
      App.ai.settingsMsg=cfg.apiKey?'✅ Settings saved — you can now mark answers.':'⚠️ Settings saved, but no API key yet.';
      App.render('checker');
    },
    async aiCheck(){
      const question=(document.getElementById('aiQuestion').value||'');
      const answer=(document.getElementById('aiAnswer').value||'');
      const expected=(document.getElementById('aiExpected').value||'');
      const topicEl=document.getElementById('aiTopic');
      const topic=topicEl?topicName(topicEl.value):'';
      const marks=(document.getElementById('aiMarks').value||'');
      if((!question.trim()) && App.ai.images.length===0 && (!answer.trim())){
        App.ai.error='Add the question, your answer, or at least one photo to mark.'; App.render('checker'); return;
      }
      App.ai.loading=true; App.ai.error=null; App.ai.result=null; App.ai.settingsMsg=null; App.render('checker');
      try{
        const text=await AIChecker.check({question,answer,expected,topic,marks,images:App.ai.images});
        App.ai.result=text;
        Store.state().checkerHistory.push({verdict:'ai',text:'AI: '+(question||'photo answer').slice(0,70)}); Store.save();
      }catch(err){
        App.ai.error=(err&&err.msg)||'Something went wrong calling the AI.';
      }
      App.ai.loading=false; App.render('checker');
    },
    aiClearResult(){ App.ai.result=null; App.render('checker'); },
    _verdictHtml(v){
      const icon={correct:'✅',partial:'🟡',wrong:'❌'}[v.verdict];
      return `<div class="verdict ${v.verdict}">${icon} ${esc(v.msg)}</div>`;
    },
    checkNumeric(){
      const r=AnswerChecker.numeric($('#ncUser').value,$('#ncAns').value,parseFloat($('#ncTol').value)||5);
      const unit=$('#ncUnit').value.trim();
      $('#ncOut').innerHTML=this._verdictHtml(r)+(unit?`<p class="small muted">Remember the unit: <b>${esc(unit)}</b></p>`:'');
      Store.state().checkerHistory.push({verdict:r.verdict,text:`Numeric: your ${$('#ncUser').value} vs ${$('#ncAns').value} ${unit}`}); Store.save();
    },
    checkWritten(){
      const r=AnswerChecker.written($('#wcUser').value,$('#wcKeys').value);
      let extra='';
      if(r.hits||r.miss) extra=`<div class="kvs mt">
        <div class="kv" style="grid-column:1/-1"><b>✔ Covered:</b> ${r.hits.length?esc(r.hits.join('; ')):'—'}</div>
        <div class="kv" style="grid-column:1/-1"><b>✘ Missing:</b> ${r.miss.length?esc(r.miss.join('; ')):'none'}</div></div>`;
      $('#wcOut').innerHTML=this._verdictHtml(r)+extra;
      Store.state().checkerHistory.push({verdict:r.verdict,text:'Written answer key-point check'}); Store.save();
    },

    /* ---------- Physics Q&A ---------- */
    page_qa(){
      return `
      <div class="page-head"><h1>💬 Physics Q&amp;A</h1><p>Ask any concept — a built-in HKDSE tutor explains it step by step (works offline).</p></div>
      <div class="suggest-chips">${CHAT_SUGGESTIONS.map((c,i)=>`<span class="suggest-chip" data-act="sendChat" data-arg="${i}">${esc(c)}</span>`).join('')}</div>
      <div class="chat-box" id="chatBox"></div>
      <div class="flex mt">
        <input id="chatInput" placeholder="Type your physics question…">
        <button class="btn btn-primary" data-act="sendChat">Send</button>
      </div>`;
    },
    after_qa(){
      const box=$('#chatBox');
      box.innerHTML='';
      this._addMsg('bot','Hi! I’m your HKDSE Physics tutor. Ask about any topic — mechanics, heat, waves, electricity, electromagnetism, nuclear, astronomy/medical — or tap a suggestion above.');
      $('#chatInput')&&$('#chatInput').focus();
    },
    _addMsg(who,txt){
      const box=$('#chatBox'); if(!box)return; const d=document.createElement('div'); d.className='msg '+who; d.textContent=txt; box.appendChild(d); box.scrollTop=box.scrollHeight;
    },
    sendChat(arg){
      const inp=$('#chatInput');
      let q = (arg!==undefined && !isNaN(Number(arg))) ? CHAT_SUGGESTIONS[Number(arg)] : (inp?inp.value:'');
      if(!q||!q.trim())return;
      this._addMsg('user',q); inp&&(inp.value='');
      setTimeout(()=>{ this._addMsg('bot',PhysicsQA.ask(q)); },120);
    },

    /* ---------- Study notes ---------- */
    page_notes(){
      return `
      <div class="page-head"><h1>📚 Study Notes</h1>
        <p>Printable, exam-style notes for every topic — formulas, worked examples, key points and common mistakes.</p></div>
      <div class="flex between mb wrap">
        <div class="chips" id="noteChips"><span class="chip active" data-t="all">All topics</span>${TOPICS.map(t=>`<span class="chip" data-t="${t.id}">${t.icon} ${esc(t.name)}</span>`).join('')}</div>
        <a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="${DRIVE.folderOpen(DRIVE.notesFolderId)}">📂 Open your class-notes Drive folder</a>
      </div>
      <div class="grid g2" id="noteGrid"></div>`;
    },
    after_notes(){
      const render=(f)=>{ $('#noteGrid').innerHTML=TOPICS.filter(t=>f==='all'||t.id===f).map(t=>`
        <div class="card note-card" data-act="viewNote" data-arg="${t.id}">
          <div class="nc-top"><h3>${t.icon} ${esc(t.name)}</h3><span class="tag">${NOTES[t.id].sections.filter(b=>b.t==='h').length} sections</span></div>
          <p>${esc(t.blurb)}</p><div class="small mt" style="color:var(--primary);font-weight:700">Open &amp; print →</div>
        </div>`).join('');
      };
      render('all');
      document.querySelectorAll('#noteChips .chip').forEach(c=>c.onclick=()=>{
        document.querySelectorAll('#noteChips .chip').forEach(x=>x.classList.remove('active')); c.classList.add('active'); render(c.dataset.t);
      });
    },
    viewNote(id){
      const t=topicById(id), blocks=NOTES[id].sections;
      const renderBlock=b=>{
        switch(b.t){
          case'h':return `<div class="note-section"><h3>${esc(b.x)}</h3></div>`;
          case'p':return `<p>${esc(b.x)}</p>`;
          case'ul':return `<ul>${b.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`;
          case'ol':return `<ol>${b.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ol>`;
          case'formula':return `<div class="formula-box">${esc(b.x)}</div>`;
          case'key':return `<div class="key-box">${esc(b.x)}</div>`;
          case'mistake':return `<div class="mistake-box">${esc(b.x)}</div>`;
          case'table':return `<table class="data-tbl"><thead><tr>${b.head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
          case'worked':return `<div class="worked"><div class="wq">📐 Worked example: ${esc(b.q)}</div>
              <div class="wrow"><span class="wlabel">Given:</span>${esc(b.given)}</div>
              ${b.steps.map((st,i)=>`<div class="wrow"><span class="wlabel">${i===0?'Steps:':''}</span>${esc(st)}</div>`).join('')}
              <div class="wans">Answer: ${esc(b.ans)}</div></div>`;
          default:return '';
        }
      };
      $('#main').innerHTML=`
      <div class="note-doc">
        <div class="no-print flex between mb">
          <button class="btn btn-secondary btn-sm" data-act="render" data-arg="notes">← Back to notes</button>
          <button class="btn btn-primary btn-sm" data-act="print">🖨️ Print / Save as PDF</button>
        </div>
        <div class="card">
          <h2 class="doc-title">${t.icon} ${esc(t.name)}</h2>
          <div class="doc-meta">HKDSE Physics revision notes · printable · formulas, worked examples &amp; exam traps</div>
          ${blocks.map(renderBlock).join('')}
        </div>
      </div>`;
      try{history.replaceState(null,'','#/note/'+id);}catch(e){}
      window.scrollTo(0,0);
    },
    print(){ window.print(); },

    /* ---------- Flashcards ---------- */
    fc:{idx:0,deck:[],flipped:false},
    page_flashcards(){
      return `
      <div class="page-head"><h1>🃏 Flashcards</h1><p>Flip to test recall; mark cards you know. Choose a topic below.</p></div>
      <div class="chips mb" id="fcChips"><span class="chip active" data-t="all">All</span>${TOPICS.map(t=>`<span class="chip" data-t="${t.id}">${t.icon} ${esc(t.name)}</span>`).join('')}</div>
      <div class="flash-wrap">
        <div class="flashcard" id="flashcard" data-act="flipCard">
          <div class="flash-face flash-front">
            <div class="flash-topic" id="fcTopic"></div>
            <div class="flash-q" id="fcQ"></div>
            <div class="flash-hint">Click card to reveal answer</div>
          </div>
          <div class="flash-face flash-back"><h4>Answer</h4><div class="ans" id="fcA"></div></div>
        </div>
        <div class="flash-controls">
          <button class="btn btn-secondary" data-act="fcNav" data-arg="-1">← Prev</button>
          <button class="btn btn-good" data-act="fcKnown">✓ I know this</button>
          <button class="btn btn-secondary" data-act="flipCard">Flip</button>
          <button class="btn btn-secondary" data-act="fcNav" data-arg="1">Next →</button>
        </div>
        <div class="flash-progress" id="fcProgress"></div>
      </div>`;
    },
    after_flashcards(){
      const load=(t)=>{ this.fc.deck=FLASHCARDS.filter(c=>t==='all'||c.topic===t); this.fc.idx=0; this.fc.flipped=false; this.fcRender(); };
      load('all');
      document.querySelectorAll('#fcChips .chip').forEach(c=>c.onclick=()=>{
        document.querySelectorAll('#fcChips .chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');load(c.dataset.t);
      });
    },
    fcRender(){
      const c=this.fc.deck[this.fc.idx];
      if(!c){$('#fcQ').textContent='No cards in this topic.';$('#fcA').textContent='';$('#fcTopic').textContent='';$('#fcProgress').textContent='';return;}
      const card=$('#flashcard'); card.classList.toggle('flipped',this.fc.flipped);
      $('#fcTopic').textContent=topicName(c.topic); $('#fcQ').textContent=c.q; $('#fcA').textContent=c.a;
      const known=Store.state().knownCards.includes(this._cardKey(c));
      $('#fcProgress').textContent=`Card ${this.fc.idx+1} / ${this.fc.deck.length} ${known?'· ✓ known':''}`;
    },
    _cardKey(c){return c.topic+'::'+c.q.slice(0,12);},
    flipCard(){ this.fc.flipped=!this.fc.flipped; const card=$('#flashcard'); if(card)card.classList.toggle('flipped',this.fc.flipped); },
    fcNav(d){ const n=this.fc.deck.length; if(!n)return; this.fc.idx=(this.fc.idx+Number(d)+n)%n; this.fc.flipped=false; this.fcRender(); },
    fcKnown(){ const c=this.fc.deck[this.fc.idx]; if(c){const now=Store.toggleCard(this._cardKey(c)); this.fcRender(); if(now)setTimeout(()=>this.fcNav(1),250);} },

    /* ---------- Past papers ---------- */
    page_papers(){
      return `
      <div class="page-head"><h1>📝 Past Papers (2012–2026)</h1>
        <p>Every paper from your Google Drive. Browse the folder below (organised by year), then tap a year card for its breakdown &amp; FAQ.</p></div>
      <div class="drive-note">🔗 Papers stream from <b>your shared Google Drive folder</b>. Sign in to the Google account that owns the files if a preview asks you to. For 2012–2022 &amp; 2024 the single scan contains Paper 1 + Paper 2 + Marking Scheme in order; 2023 / 2025 / 2026 already have separate files.</div>
      <div class="card mb">
        <div class="flex between wrap" style="margin-bottom:10px">
          <h3 style="margin:0">📂 All papers folder</h3>
          <div class="flex">
            <a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="${DRIVE.folderOpen(PAPERS_FOLDER)}">Open folder in new tab</a>
            <button class="btn btn-secondary btn-sm" data-act="reloadFrame" data-arg="paperFolderFrame">↻ Reload preview</button>
          </div>
        </div>
        <div class="paper-viewer"><iframe id="paperFolderFrame" src="${DRIVE.folderEmbed(PAPERS_FOLDER)}" width="100%" height="430" loading="lazy"></iframe></div>
      </div>
      <div class="section-title">Choose a year</div>
      <div class="year-grid">${PAST_PAPERS.map(p=>`<div class="year-btn" data-act="viewPaper" data-arg="${p.year}">${p.year}<small>${esc(p.difficulty)}</small></div>`).join('')}</div>
      <div id="paperDetail" class="mt"></div>`;
    },
    reloadFrame(id){const f=document.getElementById(id);if(f)f.src=f.src;},
    viewPaper(year){
      const p=PAST_PAPERS.find(x=>x.year===String(year)); if(!p)return;
      const qParts=p.faq.split('?');
      $('#paperDetail').innerHTML=`
      <div class="card paper-detail">
        <div class="note-header">
          <h3>📄 ${p.year} HKDSE Physics — paper guide</h3>
          <button class="btn btn-secondary btn-sm" data-act="closePaper">✕ Close</button>
        </div>
        <div class="paper-meta">
          <div class="paper-meta-item"><strong>Structure:</strong> ${esc(p.structure)}</div>
          <div class="paper-meta-item"><strong>Difficulty:</strong> ${esc(p.difficulty)}</div>
          <div class="paper-meta-item"><strong>Key topics:</strong> ${esc(p.topics)}</div>
        </div>
        <div class="paper-actions">
          <a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${DRIVE.folderOpen(PAPERS_FOLDER)}">📂 Open ${p.year} file in Drive folder</a>
        </div>
        <div class="note-section"><h3>📌 Key points</h3><p>${esc(p.keyPoints)}</p></div>
        <div class="note-section"><h3>⚠️ Common pitfalls</h3><p>${esc(p.pitfalls)}</p></div>
        <div class="note-section"><h3>❓ FAQ</h3>
          <div class="faq-item open" style="cursor:default"><div class="faq-q">${esc(qParts[0])}?</div>
          <div class="faq-a" style="display:block">${esc(qParts.slice(1).join('?').trim()||p.faq)}</div></div>
        </div>
      </div>`;
      const el=$('#paperDetail'); el&&el.scrollIntoView({behavior:'smooth',block:'nearest'});
    },
    closePaper(){ const el=$('#paperDetail'); if(el)el.innerHTML=''; },

    /* ---------- Practice ---------- */
    pr:{set:[],i:0,sel:null,score:0,topic:'all',level:'all'},
    page_practice(){
      return `
      <div class="page-head"><h1>✍️ Practice — HKDSE-style questions</h1><p>Generate a set, answer each, and get instant marking. Results feed your Analytics chart.</p></div>
      <div class="card" id="prSetup">
        <div class="grid g3">
          <div class="field"><label>Topic</label><select id="prTopic"><option value="all">All topics</option>${TOPICS.map(t=>`<option value="${t.id}">${t.icon} ${esc(t.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Difficulty</label><select id="prLevel"><option value="all">All levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
          <div class="field"><label>Number of questions</label><select id="prN"><option>5</option><option selected>8</option><option>10</option><option>15</option></select></div>
        </div>
        <button class="btn btn-primary" data-act="startPractice">🎲 Generate &amp; start</button>
        <p class="small muted mt">Your scope emphasises mechanics &amp; electromagnetism (no electromagnetic-induction calculations), matching your revision plan.</p>
      </div>
      <div id="prArea" class="mt"></div>`;
    },
    startPractice(){
      const topic=$('#prTopic').value,level=$('#prLevel').value,n=parseInt($('#prN').value);
      const set=QuestionGenerator.buildSet(topic,level,n);
      if(!set.length){$('#prArea').innerHTML='<div class="card empty">No questions match this filter — broaden topic/level.</div>';return;}
      this.pr={set,i:0,sel:null,score:0,topic,level}; this.prRender();
    },
    prRender(){
      const q=this.pr.set[this.pr.i], area=$('#prArea');
      const setup=$('#prSetup'); if(setup)setup.style.display='none';
      area.innerHTML=`
      <div class="card">
        <div class="flex between mb wrap">
          <div class="chips"><span class="chip active">Q ${this.pr.i+1} / ${this.pr.set.length}</span><span class="chip active">${topicById(q.topic).icon} ${esc(topicName(q.topic))}</span></div>
          <span class="badge ${q.level}">${q.level}</span>
        </div>
        <div class="progress-bar mb"><div style="width:${100*this.pr.i/this.pr.set.length}%"></div></div>
        <div class="q-stem">${esc(q.stem)}</div>
        <div id="optList">${q.opts.map((o,idx)=>`<div class="opt" data-act="chooseOpt" data-arg="${idx}"><span class="okey">${'ABCD'[idx]}.</span><span>${esc(o)}</span></div>`).join('')}</div>
        <div class="q-feedback" id="qFb"></div>
        <div class="flex mt" id="prNextWrap"></div>
      </div>`;
    },
    chooseOpt(idx){
      const q=this.pr.set[this.pr.i]; if(this.pr.sel!==null)return; this.pr.sel=Number(idx);
      const correct=Number(idx)===q.a; if(correct)this.pr.score++;
      Store.recordQuestion(q.topic,correct,q.id);
      document.querySelectorAll('#optList .opt').forEach((el,i)=>{
        el.style.pointerEvents='none';
        if(i===q.a)el.classList.add('correct-opt');
        else if(i===Number(idx))el.classList.add('wrong-opt');
      });
      const fb=$('#qFb'); fb.className='q-feedback show '+(correct?'right':'miss');
      fb.innerHTML=(correct?'✅ Correct! ':'❌ Not correct. ')+'<b>'+'ABCD'[q.a]+' is the answer.</b><br><span class="muted">'+esc(q.ex)+'</span>';
      $('#prNextWrap').innerHTML=`<button class="btn btn-primary" data-act="prNext">${this.pr.i+1<this.pr.set.length?'Next question →':'Finish & see score 🏁'}</button>`;
    },
    prNext(){
      this.pr.i++; this.pr.sel=null;
      if(this.pr.i>=this.pr.set.length){ this.prResult(); } else this.prRender();
    },
    prResult(){
      const n=this.pr.set.length,pct=Math.round(100*this.pr.score/n);
      const weak=Store.weakTopics().slice(0,3);
      const setup=$('#prSetup'); if(setup)setup.style.display='';
      $('#prArea').innerHTML=`
      <div class="card" style="text-align:center">
        <div style="font-size:46px">${pct>=70?'🏆':pct>=45?'👍':'💪'}</div>
        <h3>You scored ${this.pr.score} / ${n} (${pct}%)</h3>
        <p class="muted">Your topic chart has been updated instantly.</p>
        <div class="flex" style="justify-content:center;gap:10px;margin-top:12px">
          <button class="btn btn-primary" data-act="render" data-arg="analytics">📊 View my topic chart</button>
          <button class="btn btn-secondary" data-act="render" data-arg="practice">↻ New set</button>
        </div>
        ${weak.length?`<div class="mt" style="text-align:left"><h3>Focus next on</h3>${weak.map(w=>`<div class="kv">${w.icon} <b>${esc(w.name)}</b> — ${w.pct==null?'':w.pct+'% ('+w.correct+'/'+w.total+')'}</div>`).join('')}</div>`:''}
      </div>`;
    },

    /* ---------- Analytics ---------- */
    page_analytics(){
      return `
      <div class="page-head"><h1>📊 Analytics</h1><p>Instant topic-strength chart from every practice set you mark.</p></div>
      <div class="grid g2">
        <div class="card"><h3>Accuracy by topic (%)</h3><div id="barChart" class="chart"></div></div>
        <div class="card"><h3>Topic mastery radar</h3><div id="radarChart" class="chart"></div></div>
      </div>
      <div class="grid g2 mt">
        <div class="card"><h3>Weakest topics (revise first)</h3><div id="weakList"></div></div>
        <div class="card"><h3>Summary</h3><div id="sumStats" class="kvs"></div></div>
      </div>`;
    },
    after_analytics(){
      const m=Store.topicMastery();
      const names=TOPICS.map(t=>t.name.replace(/\s*\(.*\)/,''));
      const pcts=TOPICS.map(t=>m[t.id].pct==null?0:m[t.id].pct);
      const totals=TOPICS.map(t=>m[t.id].total);
      const bc=echarts.init(document.getElementById('barChart'));
      bc.setOption({tooltip:{trigger:'axis'},grid:{left:42,right:18,bottom:88,top:26,containLabel:false},
        xAxis:{type:'category',data:names,axisLabel:{rotate:35,fontSize:10,interval:0}},
        yAxis:{type:'value',max:100,min:0,interval:25,name:'%',nameTextStyle:{fontSize:10}},
        series:[{type:'bar',data:pcts.map(v=>({value:v,itemStyle:{color:v>=70?'#16a34a':v>=45?'#d97706':'#dc2626'}})),barWidth:'55%',label:{show:true,position:'top',formatter:'{c}%'}}]});
      charts.push(bc);
      const rc=echarts.init(document.getElementById('radarChart'));
      rc.setOption({tooltip:{},radar:{indicator:TOPICS.map(t=>({name:t.icon+' '+t.name.replace(/\s*\(.*\)/,''),max:100})),radius:'62%',axisName:{fontSize:10}},
        series:[{type:'radar',data:[{value:pcts,name:'Mastery %',areaStyle:{color:'rgba(37,99,235,.25)'},lineStyle:{color:'#2563eb'}}]}]});
      charts.push(rc);
      window.addEventListener('resize',()=>charts.forEach(c=>c.resize()));
      const weak=Store.weakTopics();
      $('#weakList').innerHTML=weak.length?weak.map(w=>`<div class="check-line"><span class="badge ${w.pct>=70?'easy':w.pct>=45?'medium':'hard'}">${w.pct}%</span><span>${w.icon} <b>${esc(w.name)}</b> — ${w.correct}/${w.total} correct</span></div>`).join(''):'<p class="muted">Do a practice set to build your chart.</p>';
      const s=Store.state(), total=s.attempts.length, correct=s.attempts.filter(a=>a.correct).length;
      $('#sumStats').innerHTML=`
        <div class="kv"><b>Questions attempted:</b> ${total}</div>
        <div class="kv"><b>Correct:</b> ${correct}</div>
        <div class="kv"><b>Overall accuracy:</b> ${total?Math.round(100*correct/total):0}%</div>
        <div class="kv"><b>Topics started:</b> ${totals.filter(x=>x>0).length} / ${TOPICS.length}</div>
        <div class="kv"><b>Cards mastered:</b> ${s.knownCards.length}</div>`;
    },

    /* ---------- Exam tips ---------- */
    page_tips(){
      return `
      <div class="page-head"><h1>🎯 Exam Tips</h1><p>Collected, high-yield HKDSE Physics exam technique — gathered from official marking practice.</p></div>
      ${EXAM_TIPS.map(c=>`
        <div class="card mb">
          <h3>${c.icon} ${esc(c.cat)}</h3>
          <ul>${c.tips.map(t=>`<li style="margin:7px 0">${esc(t)}</li>`).join('')}</ul>
        </div>`).join('')}
      <div class="card"><h3>📌 Golden rules</h3>
        <div class="key-box">State the principle, write the formula, substitute WITH units, then box the answer to 2–3 sig. fig.</div>
        <div class="mistake-box">Never leave an MCQ blank and never confuse the LEFT (motor) and RIGHT (generator) hand rules.</div>
      </div>`;
    }
  };

  window.App=App;
  App.ai={tab:'ai', images:[], loading:false, result:null, error:null, showSettings:false, settingsMsg:null};

  /* ---- mobile drawer ---- */
  const sidebar=document.getElementById('sidebar');
  const overlay=document.getElementById('navOverlay');
  function closeDrawer(){ sidebar.classList.remove('open'); overlay.classList.remove('show'); }
  document.getElementById('menuBtn').addEventListener('click',()=>{
    sidebar.classList.toggle('open'); overlay.classList.toggle('show',sidebar.classList.contains('open'));
  });
  overlay.addEventListener('click',closeDrawer);

  /* ---- global delegated interaction (CSP-safe, no inline handlers) ---- */
  document.addEventListener('click',e=>{
    const nav=e.target.closest('.nav-item');
    if(nav){ App.render(nav.dataset.route); closeDrawer(); return; }
    const actEl=e.target.closest('[data-act]');
    if(actEl){
      const m=actEl.dataset.act, arg=actEl.dataset.arg;
      if(typeof App[m]==='function') App[m](arg,actEl);
    }
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Enter' && e.target && e.target.id==='chatInput') App.sendChat();
    if(e.key==='Escape') closeDrawer();
  });
  document.getElementById('resetDataBtn').addEventListener('click',()=>{
    if(confirm('Erase all practice scores and progress?')){Store.reset();App.render(App.route);}
  });
  App.routeFromHash();
  window.addEventListener('hashchange',()=>App.routeFromHash());

  /* ---- headless self-test: load with ?selftest=1 ---- */
  if(location.search.indexOf('selftest=1')>=0){
    setTimeout(()=>{
      const log=[]; const ok=(c,m)=>log.push((c?'PASS':'FAIL')+' · '+m);
      try{
        Store.reset(); // deterministic: clear persisted progress before self-test
        const pages=['dashboard','checker','qa','notes','flashcards','papers','practice','analytics','tips'];
        pages.forEach(p=>{ App.render(p); ok(document.getElementById('main').innerHTML.length>200, 'render '+p); });
        // practice flow
        App.render('practice');
        App.startPractice();
        const n=App.pr.set.length; ok(n>0,'generated set of '+n);
        App.chooseOpt(App.pr.set[0].a); // correct answer
        ok(App.pr.score===1,'correct answer scored');
        ok(Store.state().attempts.length===1,'attempt recorded');
        App.prNext();
        ok(App.pr.i===1,'advanced to Q2');
        // QA
        App.render('qa'); App.sendChat('0');
        ok(document.querySelectorAll('#chatBox .msg').length>=2,'QA suggestion produced reply');
        // notes render
        App.viewNote('mechanics'); ok(!!document.querySelector('.formula-box'),'note formula box rendered');
        // analytics chart
        App.render('analytics'); ok(!!document.querySelector('#barChart canvas'),'bar chart drawn');
        // flashcards
        App.render('flashcards'); ok(App.fc.deck.length>0,'flashcard deck loaded'); App.flipCard(); ok(App.fc.flipped===true,'card flips');
        // AI answer checker
        App.render('checker');
        ok(!!document.getElementById('aiFiles'),'ai checker photo input');
        ok(!!document.getElementById('aiQuestion'),'ai checker question field');
        App.switchCheckerTab('quick'); ok(!!document.getElementById('ncUser'),'quick checker tab');
        App.switchCheckerTab('ai'); ok(!!document.getElementById('aiExpected'),'ai tab restored');
        ok(typeof AIChecker.fileToImage==='function','ai image resizer');
        ok(AIChecker.systemPrompt().indexOf('HKDSE')>=0,'ai marker prompt');
        const _r=AIChecker.buildGeminiRequest({provider:'gemini',apiKey:'k',model:'gemini-1.5-flash',baseUrl:'https://generativelanguage.googleapis.com/v1beta'},[{text:'hi'}]);
        ok(_r.url.indexOf('generateContent')>0,'gemini request builder');
        ok(formatAI('**bold**').indexOf('<strong>')>0,'ai result formatter');
      }catch(err){ log.push('ERROR · '+err.message); }
      const passed=log.filter(l=>l.startsWith('PASS')).length;
      const el=document.createElement('div');
      el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#0f172a;color:#fff;font:13px monospace;padding:14px;max-height:100vh;overflow:auto;white-space:pre-wrap';
      el.id='selftest'; el.textContent='SELFTEST '+passed+'/'+log.length+' passed\n\n'+log.join('\n');
      document.body.appendChild(el);
    },300);
  }
})();
