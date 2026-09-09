/* ============================================================
   PhysMaster DSE — engine (no DOM rendering here)
   Store | PhysicsQA | AnswerChecker | QuestionGenerator
   ============================================================ */
(function(global){
  'use strict';

  /* ---------------- Store (localStorage) ---------------- */
  const KEY = 'physmaster_dse_v1';
  const defaultState = {
    topicStats:{},      // topicId -> {correct,total}
    attempts:[],        // {id,topic,correct,ts}
    knownCards:[],      // flashcard ids marked known
    chat:[],
    checkerHistory:[],
    papers:{}           // year -> {p1,p2,ms,full} file IDs
  };
  const Store = {
    _state:null,
    _mergeDefaults(s){
      if(typeof DEFAULT_PAPERS !== 'undefined'){
        if(!s.papers) s.papers = {};
        for(const [year, def] of Object.entries(DEFAULT_PAPERS)){
          if(!s.papers[year]) s.papers[year] = {};
          for(const key of ['p1','p2','ms','full']){
            if(!s.papers[year][key] && def[key]) s.papers[year][key] = def[key];
          }
          if(def.combined && s.papers[year].combined===undefined) s.papers[year].combined = true;
          if(def.extras && !s.papers[year].extras) s.papers[year].extras = def.extras;
        }
      }
      return s;
    },
    load(){
      try{
        const raw = (typeof localStorage!=='undefined') ? localStorage.getItem(KEY) : null;
        this._state = raw ? Object.assign({}, defaultState, JSON.parse(raw)) : JSON.parse(JSON.stringify(defaultState));
      }catch(e){ this._state = JSON.parse(JSON.stringify(defaultState)); }
      this._mergeDefaults(this._state);
      return this._state;
    },
    save(){
      try{ if(typeof localStorage!=='undefined') localStorage.setItem(KEY, JSON.stringify(this._state)); }catch(e){}
    },
    state(){ return this._state || this.load(); },
    recordQuestion(topic, correct, id){
      const s=this.state();
      if(!s.topicStats[topic]) s.topicStats[topic]={correct:0,total:0};
      s.topicStats[topic].total++;
      if(correct) s.topicStats[topic].correct++;
      s.attempts.push({id:id||null,topic,correct:!!correct,ts:Date.now()});
      this.save();
    },
    topicMastery(){
      const s=this.state(), out={};
      TOPICS.forEach(t=>{
        const st=s.topicStats[t.id]||{correct:0,total:0};
        out[t.id]={name:t.name,icon:t.icon,correct:st.correct,total:st.total,
          pct: st.total? Math.round(100*st.correct/st.total):null};
      });
      return out;
    },
    weakTopics(){
      return Object.values(this.topicMastery())
        .filter(x=>x.total>0)
        .sort((a,b)=>(a.pct??101)-(b.pct??101));
    },
    reset(){ this._state=JSON.parse(JSON.stringify(defaultState)); this._mergeDefaults(this._state); this.save(); },
    toggleCard(id){
      const s=this.state(), i=s.knownCards.indexOf(id);
      if(i>=0) s.knownCards.splice(i,1); else s.knownCards.push(id);
      this.save(); return i<0;
    }
  };

  /* ---------------- Physics Q&A (rule-based tutor) ---------------- */
  const QA_RULES = [
    {keys:['centripetal','circular motion','circle'], a:'Centripetal force keeps an object in uniform circular motion and ALWAYS points to the centre: F = mv²/r = mω²r. It is not a new/extra force — tension, friction, gravity or the normal reaction supplies it. Speed (and KE) stays constant, but velocity & acceleration vectors keep changing direction.'},
    {keys:['fleming','left hand','right hand','motor effect','hand rule'], a:'Motor effect (force on a supplied current) → Fleming’s LEFT-hand rule. Generator/induction (motion induces a current) → RIGHT-hand rule. Fingers: First=Field, seCond=Current, Thumb=motion/force, all at right angles.'},
    {keys:['series','parallel','circuit'], a:'Series: same current everywhere, voltages add, R=R₁+R₂+…. Parallel: same voltage across each branch, currents add, 1/R=1/R₁+1/R₂+…. Adding a resistor in parallel LOWERS total resistance.'},
    {keys:['latent','melt','boil','phase','change of state','mct','mcδt','q=ml'], a:'Use Q=mcΔT only while temperature changes. During melting/boiling/freezing T is constant, so use Q=ml (specific latent heat). For a full heating curve split it into warming steps and plateau steps and add them.'},
    {keys:['decay','half-life','half life','alpha','beta','gamma','radioactiv'], a:'Half-life: N=N₀(½)^n with n=t/t½; it is unaffected by temperature/pressure/chemistry. In decay equations balance BOTH mass number A and charge Z. α: A−4,Z−2; β⁻: A same,Z+1; γ: no change. Penetration α<β<γ; ionisation α>β>γ.'},
    {keys:['projectile','projectile motion'], a:'Split into horizontal and vertical. Horizontal: no acceleration ⇒ constant horizontal velocity. Vertical: acceleration g downward, use the kinematic equations. At the peak vertical velocity = 0 but acceleration is still g. Time of flight is set by the vertical motion.'},
    {keys:['momentum','collision','impulse'], a:'Momentum p=mv is conserved for a system with no external force. Impulse FΔt=Δp=area under an F–t graph. Elastic: KE conserved; inelastic: KE lost; perfectly inelastic: bodies stick and move together.'},
    {keys:['refract','refraction','critical angle','total internal','snell'], a:'n=sin i/sin r=c/v. Entering a denser medium light slows, wavelength shortens, bends TOWARD the normal; frequency (colour) is unchanged. Critical angle sin C=1/n; beyond it (dense→less dense) total internal reflection occurs.'},
    {keys:['transformer','transmission','step-up','step-down'], a:'Vp/Vs=Np/Ns; for an ideal transformer power is conserved VpIp=VsIs. Transformers need a.c. (changing flux). Mains is sent at HIGH voltage to lower current and reduce I²R heat loss in cables.'},
    {keys:['power','electrical power','watt'], a:'Electrical power: P=VI=I²R=V²/R (pick the form matching known quantities). Energy E=Pt=VIt; convert minutes to seconds.'},
    {keys:['gas','boyle','kelvin','charles'], a:'Gas laws need absolute temperature in KELVIN (K=°C+273). Fixed mass: p₁V₁/T₁=p₂V₂/T₂. Constant T: pV=const; constant V: p/T=const; constant p: V/T=const.'},
    {keys:['energy','kinetic','potential','conservation of energy','work'], a:'Work W=Fs cosθ; KE=½mv²; gravitational PE=mgh; power P=W/t=Fv. With no friction, total mechanical energy is conserved; the work done by the net force = change in KE.'},
    {keys:['wave','wavelength','frequency','sound','echo'], a:'v=fλ, f=1/T. Sound is longitudinal and needs a medium (none in vacuum). Pitch↔frequency, loudness↔amplitude, intensity∝amplitude². For an echo remember the sound travels there AND back: d=vt/2.'},
    {keys:['fuse','live','neutral','earth','domestic','safety'], a:'Fuse and switch go on the LIVE wire so an appliance is isolated when off/blown. Earth wire + fuse protect against a live-to-case fault. Choose a fuse rating just above normal operating current.'},
    {keys:['efficiency','sankey','renewable'], a:'Efficiency η=useful output/total input (×100%). A Sankey diagram shows useful vs wasted (often heat) energy. Renewable sources replenish naturally; fossil/nuclear are non-renewable.'},
    {keys:['ct','x-ray','ultrasound','medical','rni','radionuclide','imaging'], a:'Ultrasound images use echoes at tissue boundaries (Z=ρc). X-rays attenuate as I=I₀e^(−μx); CT gives structural 3-D images. RNI uses an ingested radioisotope and shows FUNCTION/tracer uptake, not just structure.'},
    {keys:['newton','force','inertia','f=ma'], a:'Newton 1: no net force ⇒ constant velocity. Newton 2: F=ma=Δp/Δt. Newton 3: action/reaction are equal, opposite and act on DIFFERENT bodies. Always draw a free-body diagram of the chosen body.'},
    {keys:['escape','kepler','orbit','astronom','gravity','gravitation'], a:'Kepler: T²∝r³; orbital speed v=√(GM/r); escape speed v=√(2GM/r); gravitational field g=GM/r². Doubling launch speed quadruples the kinetic energy.'}
  ];
  const PhysicsQA = {
    ask(q){
      const s=q.toLowerCase().trim();
      if(!s) return 'Ask me any HKDSE physics concept, e.g. “explain centripetal force”.';
      let best=null,bestScore=0;
      for(const rule of QA_RULES){
        let score=0;
        rule.keys.forEach(k=>{ if(s.includes(k)) score += k.length; });
        if(score>bestScore){bestScore=score;best=rule;}
      }
      if(best) return best.a;
      return 'I can help with HKDSE Physics topics: mechanics, heat & gases, waves/light/sound, electricity, electromagnetism, radioactivity, astronomy/energy/medical imaging. Try naming the concept (e.g. “half-life”, “parallel circuits”, “projectile motion”), or tell me the exact question and I’ll work through it step by step.';
    }
  };

  /* ---------------- Answer checker ---------------- */
  const AnswerChecker = {
    // numeric check
    numeric(user, accepted, tolPct){
      const u=parseFloat(String(user).replace(/[^0-9.\-eE]/g,''));
      const a=parseFloat(String(accepted).replace(/[^0-9.\-eE]/g,''));
      if(isNaN(u)) return {ok:false,verdict:'wrong',msg:'I couldn’t read a number from your answer — enter a numeric value.'};
      const tol=Math.abs(a)*(tolPct/100);
      const diff=Math.abs(u-a);
      if(diff<=Math.max(tol,1e-9)){
        return {ok:true,verdict:'correct',msg:`Correct — your value ${u} matches ${a} within ${tolPct}% tolerance.`,pctErr:a?Math.abs((u-a)/a*100):0};
      }
      return {ok:false,verdict: diff<=Math.abs(a)*((tolPct*2)/100)?'partial':'wrong',
        msg:`Off by ${diff.toPrecision(3)}. Your ${u} vs accepted ${a} (${Math.abs((u-a)/a*100).toFixed(1)}% difference). Check your formula, unit conversion and significant figures.`,
        pctErr:a?Math.abs((u-a)/a*100):0};
    },
    // written / keyword check
    written(userText, keyPoints){
      const u=userText.toLowerCase();
      const kps=keyPoints.split(',').map(s=>s.trim()).filter(Boolean);
      const hits=[],miss=[];
      kps.forEach(kp=>{ if(u.includes(kp.toLowerCase())) hits.push(kp); else miss.push(kp); });
      const ratio=kps.length? hits.length/kps.length:0;
      const verdict= ratio>=0.8?'correct': ratio>=0.4?'partial':'wrong';
      return {ok:verdict!=='wrong',verdict,hits,miss,
        msg:verdict==='correct'?'All key points covered — full-mark answer.':
            verdict==='partial'?'Partial: add the missing key point(s) to gain the remaining marks.':
            'Missing most key points — restructure around the physical principle, formula and outcome.'};
    }
  };

  /* ---------------- Question generator ---------------- */
  function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  const QuestionGenerator = {
    pool(topic,level){
      return QUESTIONS.filter(q=>(!topic||topic==='all'||q.topic===topic)&&(!level||level==='all'||q.level===level));
    },
    buildSet(topic,level,n){
      return shuffle(this.pool(topic,level)).slice(0, n||10);
    },
    single(topic,level){
      const p=this.pool(topic,level); return p.length?shuffle(p)[0]:null;
    }
  };

  /* ---------------- AI Answer Checker (vision LLM) ---------------- */
  const AI_KEY='physmaster_ai_v1';
  const AI_DEFAULTS={provider:'gemini', apiKey:'', model:'gemini-1.5-flash',
    baseUrl:'https://generativelanguage.googleapis.com/v1beta'};
  const AIChecker={
    load(){ try{ const raw=(typeof localStorage!=='undefined')?localStorage.getItem(AI_KEY):null;
      return raw?Object.assign({},AI_DEFAULTS,JSON.parse(raw)):Object.assign({},AI_DEFAULTS);
    }catch(e){ return Object.assign({},AI_DEFAULTS);} },
    save(cfg){ const c=Object.assign({},this.load(),cfg||{});
      try{ if(typeof localStorage!=='undefined') localStorage.setItem(AI_KEY,JSON.stringify(c)); }catch(e){} return c; },
    systemPrompt(){
      return `You are a senior HKDSE Physics examiner. Mark the student's answer carefully and act as a helpful tutor.

The student's answer may be typed text, a photo of handwritten working, a graph, a diagram (free-body / force, circuit, ray, field line, motion graph), or any mix. Read photos thoroughly.

For ANY diagram or graph in an image, explicitly inspect and comment on:
- Free-body / force diagrams: is every force shown? correct direction? labelled? magnitude given?
- Motion graphs (s-t, v-t, a-t): axes labelled with quantity AND unit? correct shape? gradient interpreted correctly? area interpreted correctly?
- Circuit diagrams: correct symbols? series/parallel correct? ammeter in series, voltmeter in parallel?
- Ray diagrams: normal line drawn? incident/reflected/refracted rays correct? arrows present? angles sensible?
- Field / other sketches: direction, spacing, labels.

Marking rules (HKDSE style):
- Award marks for: correct physical principle, correct formula, correct substitution WITH units, correct final answer to 2-3 significant figures.
- Give method (M) marks even if the final number is slightly wrong.
- Point out EACH mistake specifically and say exactly how to fix it.
- If handwriting in a photo is illegible, say which part cannot be read.
- Be encouraging but strict — this is exam marking.

Output in this exact structure (use markdown):
**Verdict:** estimated score /N and one-line overall comment.
**What is correct:** bullet list.
**Mistakes and missing marks:** bullet list, each with how to fix.
**Diagram & graph check:** detailed comments, or "No diagram/graph provided."
**Model answer / how to get full marks:** step-by-step.
**Tip for next time:** one concise exam-technique tip.`;
    },
    buildContext({question,expected,answer,topic,marks}){
      const L=[];
      L.push('=== MARKING TASK ===');
      if(topic) L.push('Topic: '+topic);
      if(marks) L.push('Marks available: '+marks);
      L.push('Question: '+(question&&question.trim()?question.trim():'(not provided — infer it from the student answer / photo)'));
      if(expected&&expected.trim()) L.push('Marking scheme / expected answer: '+expected.trim());
      L.push('Student answer (typed): '+(answer&&answer.trim()?answer.trim():'(no typed answer — see attached photo(s))'));
      L.push('Now mark it following your instructions.');
      return L.join('\n');
    },
    // read + resize an image File -> {name,mime,b64,dataUrl}
    async fileToImage(file, maxDim, quality){
      maxDim=maxDim||1560; quality=quality==null?0.82:quality;
      if(!file||!file.type||!file.type.startsWith('image/')) throw {code:'BAD_FILE',msg:'Only image files are supported.'};
      const dataUrl=await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
      return await new Promise((res,rej)=>{
        const img=new Image();
        img.onload=()=>{
          let w=img.width,h=img.height;
          if(Math.max(w,h)>maxDim){ const s=maxDim/Math.max(w,h); w=Math.round(w*s); h=Math.round(h*s); }
          const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
          cv.getContext('2d').drawImage(img,0,0,w,h);
          cv.toBlob(blob=>{
            const r=new FileReader();
            r.onload=()=>{ const du=r.result; res({name:file.name,mime:(blob&&blob.type)||'image/jpeg',b64:du.split(',')[1],dataUrl:du}); };
            r.onerror=()=>rej({code:'BAD_IMG',msg:'Could not read this image.'});
            r.readAsDataURL(blob);
          },'image/jpeg',quality);
        };
        img.onerror=()=>rej({code:'BAD_IMG',msg:'Could not read this image.'});
        img.src=dataUrl;
      });
    },
    buildGeminiRequest(cfg, parts){
      return { url: cfg.baseUrl.replace(/\/+$/,'')+'/models/'+encodeURIComponent(cfg.model)+':generateContent?key='+encodeURIComponent(cfg.apiKey),
        options:{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({contents:[{role:'user',parts}]})} };
    },
    buildOpenAIRequest(cfg, instruction, images){
      const content=[{type:'text',text:instruction}];
      images.forEach(im=>content.push({type:'image_url',image_url:{url:'data:'+im.mime+';base64,'+im.b64}}));
      return { url: cfg.baseUrl.replace(/\/+$/,'')+'/chat/completions',
        options:{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.apiKey},
          body:JSON.stringify({model:cfg.model,messages:[{role:'user',content}],temperature:0.3})} };
    },
    async check(opts){
      const cfg=this.load();
      if(!cfg.apiKey||!String(cfg.apiKey).trim()) throw {code:'NO_KEY',msg:'No API key. Open ⚙️ AI settings and add a free Gemini key.'};
      const images=opts.images||[];
      const instruction=this.systemPrompt()+'\n\n'+this.buildContext(opts);
      let req;
      if(cfg.provider==='openai') req=this.buildOpenAIRequest(cfg,instruction,images);
      else req=this.buildGeminiRequest(cfg,[{text:instruction}].concat(images.map(im=>({inline_data:{mime_type:im.mime,data:im.b64}}))));
      let resp;
      try{ resp=await fetch(req.url,req.options); }
      catch(e){ throw {code:'NETWORK',msg:'Could not reach the AI service. Check internet and the API base URL.'}; }
      if(!resp.ok){
        let detail='';
        try{ const j=await resp.json(); detail=(j.error&&j.error.message)||JSON.stringify(j).slice(0,200); }catch(e){}
        if(resp.status===401||resp.status===403) throw {code:'AUTH',msg:'API key rejected (HTTP '+resp.status+'). '+detail};
        if(resp.status===429) throw {code:'RATE',msg:'Rate limit / quota reached (HTTP 429). Wait or check your quota. '+detail};
        throw {code:'HTTP',msg:'AI service error (HTTP '+resp.status+'). '+detail};
      }
      const j=await resp.json();
      let text='';
      if(cfg.provider==='openai'){ try{ text=j.choices[0].message.content||''; }catch(e){} }
      else{ try{ text=j.candidates[0].content.parts.map(p=>p.text||'').join(''); }catch(e){ text=JSON.stringify(j).slice(0,500); } }
      if(!text||!text.trim()) throw {code:'EMPTY',msg:'The AI returned an empty response. Try again with a clearer question or photo.'};
      return text;
    }
  };

  /* ---------------- Google Drive file-ID parser ---------------- */
  function parseDriveId(input){
    if(!input) return null;
    const s=String(input).trim();
    if(!s) return null;
    // /file/d/ID  (also /file/d/ID/view, /file/d/ID/edit)
    let m=s.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
    if(m) return m[1];
    // ?id=ID or &id=ID  (open?id=, uc?id=, etc.)
    m=s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if(m) return m[1];
    // /open?id=ID
    m=s.match(/\/open\?[^>]*?id=([a-zA-Z0-9_-]{10,})/);
    if(m) return m[1];
    // raw file ID (alphanumeric + -_, at least 20 chars)
    if(/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s;
    return null;
  }

  global.Store=Store; global.PhysicsQA=PhysicsQA; global.AnswerChecker=AnswerChecker;
  global.QuestionGenerator=QuestionGenerator; global.shuffle=shuffle; global.AIChecker=AIChecker;
  global.parseDriveId=parseDriveId;
})(typeof window!=='undefined'?window:globalThis);
