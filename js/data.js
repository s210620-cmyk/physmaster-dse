/* ============================================================
   PhysMaster DSE — seed data
   All study content lives here. Pure data, no logic.
   ============================================================ */

const DRIVE = {
  papersFolderId: '1-ROqwwXo_FdysuZ7KxDkJtTFBg__DBND', // past papers (year subfolders)
  notesFolderId:  '1O0Ut6Xz-wlx27JJxEyApwEdrDDi934tz', // class notes / topic materials
  folderEmbed(id){ return 'https://drive.google.com/embeddedfolderview?id=' + id + '#list'; },
  folderOpen(id){ return 'https://drive.google.com/drive/folders/' + id; }
};

const TOPICS = [
  {id:'heat',      name:'Heat & Gases',                icon:'🔥', color:'#f97316', blurb:'Temperature, internal energy, change of state and gas laws.'},
  {id:'mechanics', name:'Force & Motion (Mechanics)',  icon:'🚀', color:'#2563eb', blurb:'Kinematics, dynamics, work-energy, momentum, projectiles and gravitation.'},
  {id:'waves',     name:'Wave Motion, Light & Sound',  icon:'🌊', color:'#0ea5e9', blurb:'Wave properties, reflection/refraction, optics and sound.'},
  {id:'electricity',name:'Electricity',                icon:'🔌', color:'#7c3aed', blurb:'Electrostatics, circuits, resistance, power and domestic electricity.'},
  {id:'magnetism', name:'Electromagnetism',            icon:'🧲', color:'#db2777', blurb:'Magnetic force, motors, generators, transformers and transmission.'},
  {id:'nuclear',   name:'Radioactivity & Nuclear',     icon:'☢️', color:'#16a34a', blurb:'Atomic structure, decay, half-life, fission/fusion and safety.'},
  {id:'astronomy', name:'Astronomy, Energy & Medical', icon:'🛰️', color:'#0891b2', blurb:'Space science, energy sources/use and medical imaging physics.'}
];
const topicById = id => TOPICS.find(t=>t.id===id) || TOPICS[0];
const topicName = id => (topicById(id)||{}).name || id;

/* ---------- Printable notes: block-based document ----------
   block types: h,p,ul,ol,formula,key,mistake,worked,table            */
const NOTES = {
heat:{
  sections:[
    {t:'h',x:'1. Temperature, Heat and Internal Energy'},
    {t:'p',x:'Temperature measures the average kinetic energy of particles; heat is energy transferred due to a temperature difference. Internal energy = total kinetic + potential energy of all particles.'},
    {t:'formula',x:'T / K = θ / °C + 273.15'},
    {t:'ul',items:[
      'Energy transfer processes: conduction, convection, radiation.',
      'Specific heat capacity c: energy needed to raise 1 kg by 1 °C (or 1 K).',
      'Heat capacity C = m·c (energy to raise the whole object by 1 °C).']},
    {t:'formula',x:'Q = m c ΔT'},
    {t:'key',x:'During a change of state temperature stays constant even though heat is added/removed — the energy changes potential energy, not kinetic energy.'},
    {t:'formula',x:'Q = m lₓ   (l = specific latent heat; l_f fusion, l_v vaporisation)'},
    {t:'mistake',x:'Do not use Q=mcΔT across melting/boiling. Split the problem into warming steps (mcΔT) and plateau steps (ml).'},
    {t:'worked',q:'0.5 kg of water at 20 °C is heated to 100 °C. c = 4200 J kg⁻¹ °C⁻¹. Find the heat supplied.',
     given:'m=0.5 kg, c=4200, ΔT=100−20=80 °C',
     steps:['Q = m c ΔT','Q = 0.5 × 4200 × 80','Q = 168 000 J'],ans:'1.68 × 10⁵ J (168 kJ)'},
    {t:'h',x:'2. Gases and Gas Laws'},
    {t:'ul',items:[
      'Boyle’s law (constant T): pV = constant.',
      'Charles’/pressure law (constant V): p/T = constant (T in kelvin).',
      'General gas law for a fixed mass.']},
    {t:'formula',x:'(p₁V₁)/T₁ = (p₂V₂)/T₂        pV = NkT'},
    {t:'key',x:'Always convert temperature to kelvin in gas-law calculations; °C gives wrong answers.'},
    {t:'table',head:['Process','Constant','Relation'],rows:[
      ['Isothermal','T','pV = const'],['Isobaric','p','V/T = const'],['Isochoric','V','p/T = const']]}
  ]
},
mechanics:{
  sections:[
    {t:'h',x:'1. Kinematics — Equations of Uniform Motion'},
    {t:'formula',x:'v = u + at ;   s = ut + ½at² ;   v² = u² + 2as ;   s = (u+v)t/2'},
    {t:'ul',items:[
      'Take a sign direction (e.g. upward +); keep signs consistent for vectors.',
      'For free fall near Earth, a = g ≈ 9.81 m s⁻² downward (10 m s⁻² if instructed).',
      'A projectile has constant horizontal velocity and constant vertical acceleration g.']},
    {t:'mistake',x:'At maximum height of a vertical throw v = 0, but acceleration is still g downward — it is NOT zero.'},
    {t:'worked',q:'A ball is dropped from rest and falls for 2.0 s. Find its speed and distance (g = 9.81).',
     given:'u=0, t=2.0 s, a=9.81',
     steps:['v = u + at = 0 + 9.81×2 = 19.62 m s⁻¹','s = ½at² = 0.5×9.81×4 = 19.62 m'],ans:'v ≈ 19.6 m s⁻¹ downward ; s ≈ 19.6 m'},
    {t:'h',x:'2. Dynamics — Newton’s Laws'},
    {t:'ul',items:[
      '1st law: no net force ⇒ constant velocity (or rest).',
      '2nd law: net force = rate of change of momentum; F = ma for constant mass.',
      '3rd law: action and reaction are equal, opposite and act on DIFFERENT bodies.']},
    {t:'formula',x:'F = m a ;   F = Δ(mv)/Δt ;   W = m g'},
    {t:'key',x:'Draw a free-body diagram for EVERY body. Only forces acting ON the chosen body appear in its equation.'},
    {t:'h',x:'3. Work, Energy and Power'},
    {t:'formula',x:'W = Fs cosθ ;  KE = ½mv² ;  PE = mgh ;  P = W/t = Fv'},
    {t:'p',x:'Work done by the net force equals the change in kinetic energy (work–energy theorem). In the absence of friction, total mechanical energy is conserved.'},
    {t:'h',x:'4. Momentum'},
    {t:'formula',x:'p = mv ;   F = Δp/Δt ;   m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂ (closed system)'},
    {t:'ul',items:['Elastic collision: KE conserved.','Inelastic collision: KE not conserved; perfectly inelastic ⇒ bodies stick.','Impulse = FΔt = Δp = area under F–t graph.']},
    {t:'mistake',x:'Momentum is conserved for the SYSTEM with no external force — a single body can change momentum due to an external force.'},
    {t:'h',x:'5. Circular Motion & Gravitation'},
    {t:'formula',x:'a = v²/r = ω²r ;  F = mv²/r ;  v = ωr ;  F = GMm/r² ;  g = GM/r²'},
    {t:'key',x:'Centripetal force is not a new force — it is supplied by tension, friction, gravity or normal reaction. It always points to the centre.'}
  ]
},
waves:{
  sections:[
    {t:'h',x:'1. Wave Basics'},
    {t:'ul',items:[
      'Transverse: oscillation ⟂ travel (light, waves on a string). Longitudinal: ∥ travel (sound).',
      'Wavelength λ: distance between two in-phase points; period T: one cycle; frequency f = 1/T.']},
    {t:'formula',x:'v = f λ'},
    {t:'formula',x:'I ∝ A² (intensity ∝ amplitude²)'},
    {t:'h',x:'2. Reflection, Refraction & Diffraction'},
    {t:'formula',x:'n = sin i / sin r = c / v_medium ;   n₁ sinθ₁ = n₂ sinθ₂ (Snell’s law)'},
    {t:'ul',items:['Critical angle: sin C = 1/n (light dense→less dense); beyond C, total internal reflection.','Diffraction is strongest when gap width ≈ wavelength.']},
    {t:'key',x:'Refraction changes speed and wavelength but NOT frequency — colour (f) is unchanged across a boundary.'},
    {t:'mistake',x:'When entering a denser medium light bends TOWARD the normal and slows down; do not reverse this.'},
    {t:'h',x:'3. Lenses and the Eye / Optical Instruments'},
    {t:'formula',x:'1/f = 1/u + 1/v ;  magnification m = v/u'},
    {t:'h',x:'4. Sound'},
    {t:'ul',items:['Sound needs a medium — no sound in a vacuum.','Pitch ↔ frequency; loudness ↔ amplitude; quality ↔ waveform.','Ultrasound used in medical imaging and distance measurement (s = vt/2 for echo).']},
    {t:'worked',q:'An echo returns 0.20 s after a sound is sent toward a wall. Speed of sound 340 m s⁻¹. How far is the wall?',
     given:'t(round trip)=0.20 s, v=340',
     steps:['One-way time = 0.10 s','d = v × t = 340 × 0.10'],ans:'d = 34 m'},
    {t:'table',head:['Wave property','Depends on'],rows:[['Pitch','frequency'],['Loudness','amplitude / intensity'],['Colour of light','frequency/wavelength']]}
  ]
},
electricity:{
  sections:[
    {t:'h',x:'1. Electrostatics'},
    {t:'ul',items:['Charge is quantised: Q = ne, e = 1.6×10⁻¹⁹ C.','Like charges repel, unlike attract; field lines go + → −.','Coulomb’s law and electric field E = F/q.']},
    {t:'formula',x:'F = kQ₁Q₂/r² ;   E = F/q ;   V = E d (uniform field) ;   E = V/d'},
    {t:'h',x:'2. Current, Voltage and Resistance'},
    {t:'formula',x:'Q = It ;   V = IR ;   R = ρL/A'},
    {t:'ul',items:['Series: same current; R = R₁+R₂+…; voltages add.','Parallel: same voltage; 1/R = 1/R₁+1/R₂+…; currents add.','Ohmic conductor: V–I graph straight through origin.']},
    {t:'mistake',x:'Adding more resistors in PARALLEL lowers total resistance (more paths), it does not raise it.'},
    {t:'h',x:'3. Electrical Energy and Power'},
    {t:'formula',x:'P = VI = I²R = V²/R ;   E = Pt = VIt'},
    {t:'worked',q:'A 220 V kettle draws 5 A. Find its power and energy used in 3 minutes.',
     given:'V=220, I=5, t=180 s',
     steps:['P = VI = 220×5 = 1100 W','E = Pt = 1100×180 = 198 000 J'],ans:'P = 1.1 kW ; E = 1.98×10⁵ J'},
    {t:'h',x:'4. Domestic Electricity & Safety'},
    {t:'ul',items:['Live (carries alternating voltage), neutral (≈0 V), earth (safety).','Fuse melts when current exceeds rating; circuit breaker / earth wire protect against fault.','Choose fuse rating just above normal current.']},
    {t:'key',x:'A fuse and switch must be placed on the LIVE wire so the appliance is isolated when switched off / fused.'}
  ]
},
magnetism:{
  sections:[
    {t:'h',x:'1. Magnetic Fields and Force on a Current'},
    {t:'ul',items:['Field lines run N → S outside a magnet; closer lines = stronger field.','A current-carrying wire in a magnetic field experiences a force (motor effect).']},
    {t:'formula',x:'F = B I L sinθ   (θ = angle between current and field)'},
    {t:'p',x:'Use Fleming’s LEFT-hand rule for the motor force: Field (First finger), Current (seCond finger), Motion/Force (Thumb) — all mutually perpendicular.'},
    {t:'h',x:'2. DC Motor'},
    {t:'ul',items:['Current in coil + magnetic field ⇒ turning couple.','Commutator reverses current every half-turn so rotation continues one way.','More turns / stronger B / larger current ⇒ greater torque.']},
    {t:'h',x:'3. Electromagnetic Induction (concept awareness)*'},
    {t:'p',x:'*Your generated-question scope excludes induction calculations, but recognise the principle: a changing magnetic flux through a coil induces an e.m.f. (generator effect, Fleming’s RIGHT-hand rule). Induced e.m.f. ∝ rate of flux cutting.'},
    {t:'formula',x:'ε ∝ ΔΦ/Δt'},
    {t:'key',x:'Motor effect uses LEFT-hand rule (force from supplied current); generator/induction uses RIGHT-hand rule (current induced by motion). Do not mix them up.'},
    {t:'h',x:'4. Transformers & Transmission'},
    {t:'formula',x:'Vₚ/Vₛ = Nₚ/Nₛ ;   ideal: VₚIₚ = VₛIₛ ;   P_loss = I²R'},
    {t:'ul',items:['Step-up: Nₛ>Nₚ raises V; step-down lowers V.','Electricity is transmitted at HIGH voltage to reduce current and hence I²R heat loss.','Real transformer is <100% efficient due to resistance, eddy currents and flux leakage.']},
    {t:'mistake',x:'A transformer only works with a.c. — d.c. gives no continuously changing flux, so no induced secondary voltage.'}
  ]
},
nuclear:{
  sections:[
    {t:'h',x:'1. Atomic Structure and Radiation'},
    {t:'ul',items:['Atom = nucleus (protons + neutrons) surrounded by electrons.','Isotopes: same proton number Z, different neutron/mass number A.']},
    {t:'table',head:['Radiation','Nature','Ionising','Penetration','Stopped by'],rows:[
      ['Alpha α','helium nucleus, ⁴₂He','Very high','Low','paper / few cm air'],
      ['Beta β','fast electron/positron','Medium','Medium','few mm aluminium'],
      ['Gamma γ','high-freq EM wave','Low','High','thick lead / concrete']]},
    {t:'h',x:'2. Decay Equations and Half-life'},
    {t:'ul',items:['Conserve mass number A and charge Z across the equation.','α decay: A−4, Z−2. β⁻ decay: A unchanged, Z+1. γ: no change in A or Z.']},
    {t:'formula',x:'N = N₀ (½)^n ,  n = t / t½'},
    {t:'worked',q:'A sample has activity 800 Bq and half-life 6 days. Activity after 18 days?',
     given:'N₀=800, t½=6, t=18 ⇒ n=3',
     steps:['N = 800×(½)³','N = 800/8'],ans:'100 Bq'},
    {t:'key',x:'Half-life is constant and unaffected by temperature, pressure or chemical state — it is a nuclear, random process.'},
    {t:'h',x:'3. Fission, Fusion and Energy'},
    {t:'formula',x:'E = mc² (mass defect → binding energy)'},
    {t:'ul',items:['Fission: heavy nucleus splits (chain reaction, reactors/atomic bomb).','Fusion: light nuclei join (stars, hydrogen bomb); needs very high temperature.','Safety: time, distance, shielding; background radiation is always present.']},
    {t:'mistake',x:'Mass number and charge must BOTH balance in a decay equation — checking only one is a common lost mark.'}
  ]
},
astronomy:{
  sections:[
    {t:'h',x:'1. Astronomy and Space Science'},
    {t:'ul',items:['Universe: planets → stars → galaxies → universe; 1 light-year = distance light travels in a year.','Ptolemy (geocentric) vs Copernicus (heliocentric); retrograde motion explained by relative orbital motion.']},
    {t:'formula',x:'Kepler: T² ∝ r³ ;   orbital v = √(GM/r) ;   escape v = √(2GM/r)'},
    {t:'key',x:'Doubling launch speed changes kinetic energy by ×4; escape speed depends only on the central mass and radius.'},
    {t:'h',x:'2. Energy and Use of Energy'},
    {t:'ul',items:['Energy forms and conversions; Sankey diagrams show useful vs wasted energy.','Efficiency = useful output / total input.','Renewable (solar, wind, hydro) vs non-renewable (fossil, nuclear).']},
    {t:'formula',x:'η = E_useful / E_input × 100%'},
    {t:'h',x:'3. Medical Physics (imaging principles)'},
    {t:'ul',items:['Ultrasound: reflection at tissue boundaries; axial resolution ∝ wavelength.','X-rays: attenuation I = I₀e^(−μx); denser tissue absorbs more.','CT builds a 3-D image from many X-ray projections; RNI uses ingested radioisotopes (functional image).']},
    {t:'formula',x:'I = I₀ e^(−μx) ;   acoustic impedance Z = ρc ;   reflection depends on Z mismatch'},
    {t:'mistake',x:'A CT scan shows STRUCTURE (X-ray absorption); a radionuclide scan shows FUNCTION (where tracer accumulates) — don’t confuse what each image reveals.'}
  ]
}};

/* ---------- Flashcards (per topic) ---------- */
const FLASHCARDS = [
  {topic:'heat',q:'What is the difference between heat and temperature?',a:'Heat is energy transferred due to a temperature difference (J). Temperature measures the average kinetic energy of particles (°C or K).'},
  {topic:'heat',q:'Why does temperature stay constant during melting/boiling?',a:'Supplied energy changes the potential energy (bonds/separation), not the average kinetic energy, so temperature is constant. Use Q=ml.'},
  {topic:'heat',q:'State the general gas law and the temperature unit required.',a:'p₁V₁/T₁ = p₂V₂/T₂ for a fixed mass; temperature MUST be in kelvin (K = °C + 273.15).'},
  {topic:'mechanics',q:'Write the four equations of uniform acceleration.',a:'v=u+at; s=ut+½at²; v²=u²+2as; s=(u+v)t/2.'},
  {topic:'mechanics',q:'At the top of a vertical throw, what is the velocity and acceleration?',a:'Velocity = 0 instantaneously; acceleration = g downward (9.81 m s⁻²), NOT zero.'},
  {topic:'mechanics',q:'State Newton’s three laws.',a:'1: no net force ⇒ constant velocity. 2: F=ma (=Δp/Δt). 3: equal & opposite action/reaction acting on different bodies.'},
  {topic:'mechanics',q:'What is impulse and how is it found from an F–t graph?',a:'Impulse = FΔt = change in momentum Δp; it equals the area under an F–t graph.'},
  {topic:'mechanics',q:'What supplies the centripetal force for a satellite, and which way does it point?',a:'Gravitational attraction supplies it; the force always points to the centre of the circular path. F=mv²/r.'},
  {topic:'waves',q:'What changes and what stays constant when light enters a denser medium?',a:'Speed and wavelength decrease; frequency (and colour) stays constant. It bends toward the normal.'},
  {topic:'waves',q:'Define critical angle and total internal reflection.',a:'sin C = 1/n. For light going dense→less dense at incidence > C, all light is reflected internally.'},
  {topic:'waves',q:'How do you calculate distance from an echo?',a:'Sound travels there and back: d = v×(total time)/2.'},
  {topic:'electricity',q:'Compare series and parallel circuits for current and voltage.',a:'Series: same current, voltages add, R=ΣR. Parallel: same voltage, currents add, 1/R=Σ1/R.'},
  {topic:'electricity',q:'Give the three electrical power formulas.',a:'P=VI=I²R=V²/R. Choose by the quantities known.'},
  {topic:'electricity',q:'Why must the fuse/switch be on the live wire?',a:'So when off or blown, the appliance is disconnected from the high (alternating) live potential and is safe to touch.'},
  {topic:'magnetism',q:'Which hand rule for the motor effect and which for induction?',a:'Motor (force from supplied current): LEFT hand. Generator/induction (induced current): RIGHT hand.'},
  {topic:'magnetism',q:'Why transmit electricity at very high voltage?',a:'Higher V ⇒ lower I for the same power; heat loss P_loss=I²R is then much smaller.'},
  {topic:'magnetism',q:'Why won’t a transformer work on d.c.?',a:'d.c. produces a constant, unchanging flux, so no e.m.f. is induced in the secondary coil. Transformers need a.c.'},
  {topic:'nuclear',q:'Compare penetration of alpha, beta, gamma.',a:'α stopped by paper; β by a few mm aluminium; γ needs thick lead/concrete. Ionising strength is the reverse order.'},
  {topic:'nuclear',q:'How does activity change with half-life?',a:'N = N₀(½)^n where n = t/t½. Half-life is unaffected by temperature, pressure or chemistry.'},
  {topic:'nuclear',q:'In a decay equation, what must balance?',a:'Both total mass number A and total charge/atomic number Z on each side.'},
  {topic:'astronomy',q:'State Kepler’s third law and escape speed.',a:'T² ∝ r³ for orbiting one body; escape speed v=√(2GM/r).'},
  {topic:'astronomy',q:'Difference between a CT and a radionuclide (RNI) image?',a:'CT = structure from X-ray absorption; RNI = function from where an ingested radioisotope accumulates.'},
  {topic:'astronomy',q:'How is efficiency calculated from a Sankey diagram?',a:'η = useful energy output ÷ total energy input ×100%; the rest is wasted (often heat).'}
];

/* ---------- Question bank (HKDSE-style MCQ) ---------- */
const QUESTIONS = [
 // Mechanics
 {id:'m1',topic:'mechanics',level:'easy',stem:'A car accelerates uniformly from 10 m s⁻¹ to 30 m s⁻¹ in 5 s. Its acceleration is',opts:['2 m s⁻²','4 m s⁻²','6 m s⁻²','8 m s⁻²'],a:1,ex:'a=(v−u)/t=(30−10)/5=4 m s⁻².'},
 {id:'m2',topic:'mechanics',level:'easy',stem:'An object in free fall (ignore air resistance) has constant',opts:['velocity','acceleration','momentum','potential energy'],a:1,ex:'Only gravitational acceleration g is constant; velocity and momentum increase.'},
 {id:'m3',topic:'mechanics',level:'medium',stem:'A 2 kg block is pushed by a 10 N horizontal force on a rough surface with 4 N friction. The acceleration is',opts:['2 m s⁻²','3 m s⁻²','5 m s⁻²','7 m s⁻²'],a:1,ex:'Net force=10−4=6 N; a=F/m=6/2=3 m s⁻².'},
 {id:'m4',topic:'mechanics',level:'medium',stem:'A ball thrown vertically upward has, at its highest point,',opts:['v=0, a=0','v=0, a=g upward','v=0, a=g downward','v=g, a=0'],a:2,ex:'Instantaneously stationary but gravity still acts downward.'},
 {id:'m5',topic:'mechanics',level:'medium',stem:'A 0.5 kg ball moving at 6 m s⁻¹ has kinetic energy',opts:['3 J','6 J','9 J','18 J'],a:2,ex:'KE=½mv²=0.5×0.5×36=9 J.'},
 {id:'m6',topic:'mechanics',level:'hard',stem:'A 1 kg trolley at rest is hit by a 2 kg trolley moving at 3 m s⁻¹; they stick. Their common speed is',opts:['1 m s⁻¹','2 m s⁻¹','3 m s⁻¹','6 m s⁻¹'],a:1,ex:'Momentum: 2×3=(1+2)v ⇒ v=2 m s⁻¹.'},
 {id:'m7',topic:'mechanics',level:'hard',stem:'For uniform circular motion at constant speed, which quantity is constant?',opts:['velocity','acceleration vector','kinetic energy','net force direction'],a:2,ex:'Speed (hence KE) is constant; velocity, force and acceleration vectors keep changing direction.'},
 {id:'m8',topic:'mechanics',level:'medium',stem:'A stone dropped from a tower takes 3 s to reach the ground (g=10). The tower height is',opts:['15 m','30 m','45 m','90 m'],a:2,ex:'s=½gt²=0.5×10×9=45 m.'},
 // Heat
 {id:'h1',topic:'heat',level:'easy',stem:'27 °C expressed in kelvin is',opts:['246 K','273 K','300 K','327 K'],a:2,ex:'K=°C+273=300 K.'},
 {id:'h2',topic:'heat',level:'medium',stem:'The heat to raise 2 kg of water by 15 °C (c=4200) is',opts:['31.5 kJ','63 kJ','126 kJ','252 kJ'],a:2,ex:'Q=mcΔT=2×4200×15=126 000 J.'},
 {id:'h3',topic:'heat',level:'medium',stem:'During boiling at constant pressure, the temperature remains constant because',opts:['no heat is absorbed','energy breaks bonds / increases PE','molecules stop moving','the liquid loses energy'],a:1,ex:'Latent heat increases potential energy while KE (temperature) is constant.'},
 {id:'h4',topic:'heat',level:'hard',stem:'A fixed mass of gas at constant pressure has its absolute temperature doubled. Its volume becomes',opts:['half','double','4×','unchanged'],a:1,ex:'V/T=const at constant p, so doubling T doubles V.'},
 // Waves
 {id:'w1',topic:'waves',level:'easy',stem:'A wave of frequency 50 Hz has wavelength 6.8 m in air (sound). Its speed is',opts:['7.4 m s⁻¹','56.8 m s⁻¹','340 m s⁻¹','3400 m s⁻¹'],a:2,ex:'v=fλ=50×6.8=340 m s⁻¹.'},
 {id:'w2',topic:'waves',level:'medium',stem:'Light entering glass from air will',opts:['speed up and bend away','slow down and bend toward normal','keep same speed','increase in frequency'],a:1,ex:'Denser medium: slower, wavelength shorter, bends toward normal; frequency unchanged.'},
 {id:'w3',topic:'waves',level:'medium',stem:'An echo is heard 0.4 s after clap; wall distance (v=340) is',opts:['34 m','68 m','136 m','272 m'],a:1,ex:'One-way time 0.2 s; d=340×0.2=68 m.'},
 {id:'w4',topic:'waves',level:'easy',stem:'Diffraction through a gap is greatest when',opts:['gap ≫ λ','gap ≈ λ','gap is closed','wave is longitudinal only'],a:1,ex:'Strongest spreading when gap width is about one wavelength.'},
 // Electricity
 {id:'e1',topic:'electricity',level:'easy',stem:'Two 6 Ω resistors in parallel give total resistance',opts:['3 Ω','6 Ω','12 Ω','0.33 Ω'],a:0,ex:'1/R=1/6+1/6=2/6 ⇒ R=3 Ω.'},
 {id:'e2',topic:'electricity',level:'medium',stem:'A device rated 200 V, 4 A has power',opts:['50 W','200 W','800 W','8000 W'],a:2,ex:'P=VI=200×4=800 W.'},
 {id:'e3',topic:'electricity',level:'medium',stem:'In a series circuit the quantity that is the same through every component is',opts:['voltage','current','resistance','power'],a:1,ex:'Series: same current; parallel: same voltage.'},
 {id:'e4',topic:'electricity',level:'hard',stem:'A 100 W, 200 V lamp has resistance',opts:['100 Ω','200 Ω','400 Ω','800 Ω'],a:2,ex:'R=V²/P=40000/100=400 Ω.'},
 {id:'e5',topic:'electricity',level:'easy',stem:'The correct wire for a fuse is the',opts:['neutral wire','earth wire','live wire','any wire'],a:2,ex:'Fuse/switch on live isolates the appliance from high potential.'},
 // Magnetism
 {id:'g1',topic:'magnetism',level:'easy',stem:'The rule giving the force direction on a current-carrying wire is Fleming’s',opts:['right-hand grip','left-hand rule','right-hand rule','none'],a:1,ex:'Motor effect = left-hand rule.'},
 {id:'g2',topic:'magnetism',level:'medium',stem:'A transformer has 200 primary and 1000 secondary turns with 12 V input. Output is',opts:['2.4 V','12 V','60 V','600 V'],a:2,ex:'Vs=Vp×Ns/Np=12×1000/200=60 V (step-up).'},
 {id:'g3',topic:'magnetism',level:'medium',stem:'Electricity is transmitted at high voltage mainly to',opts:['increase current','reduce I²R heat loss','make cables thicker','increase resistance'],a:1,ex:'Higher V lowers I for fixed power, cutting I²R losses.'},
 {id:'g4',topic:'magnetism',level:'easy',stem:'The commutator in a d.c. motor serves to',opts:['increase field','reverse coil current each half turn','store charge','measure current'],a:1,ex:'It keeps rotation in one direction by reversing current every half-turn.'},
 // Nuclear
 {id:'n1',topic:'nuclear',level:'easy',stem:'Which radiation is stopped by a sheet of paper?',opts:['alpha','beta','gamma','X-ray'],a:0,ex:'Alpha has the lowest penetration, stopped by paper/few cm of air.'},
 {id:'n2',topic:'nuclear',level:'medium',stem:'Activity falls from 640 to 80 Bq with half-life 5 min. Time elapsed is',opts:['10 min','15 min','20 min','40 min'],a:1,ex:'640→320→160→80 = 3 half-lives = 15 min.'},
 {id:'n3',topic:'nuclear',level:'medium',stem:'In β⁻ decay the nucleus has',opts:['A−4, Z−2','A same, Z+1','A same, Z−1','A+1, Z same'],a:1,ex:'A neutron→proton: mass number unchanged, atomic number +1.'},
 {id:'n4',topic:'nuclear',level:'easy',stem:'Half-life of a radioisotope can be changed by',opts:['heating it','chemical combination','pressure','none of these'],a:3,ex:'Half-life is a nuclear property, unaffected by external conditions.'},
 // Astronomy / energy / medical
 {id:'a1',topic:'astronomy',level:'medium',stem:'If a planet’s orbital radius is 4× larger, its period (T²∝r³) changes by a factor',opts:['4','8','16','64'],a:1,ex:'T∝r^1.5=4^1.5=8.'},
 {id:'a2',topic:'astronomy',level:'easy',stem:'A machine takes 1000 J and gives 250 J useful output. Its efficiency is',opts:['20%','25%','40%','75%'],a:1,ex:'250/1000=25%.'},
 {id:'a3',topic:'astronomy',level:'medium',stem:'In X-ray imaging, I=I₀e^(−μx). Bone appears white because it',opts:['emits X-rays','absorbs/attenuates more X-rays','transmits all X-rays','is radioactive'],a:1,ex:'Denser bone attenuates more X-rays, so fewer reach the detector (appears light).'},
 {id:'a4',topic:'astronomy',level:'medium',stem:'A radionuclide image primarily shows',opts:['dense structure','organ function/tracer uptake','bone fractures only','optical colour'],a:1,ex:'RNI maps where the ingested isotope accumulates = functional information.'}
];

/* ---------- Past papers: per-year study summaries ----------
   PDFs live in the shared Drive folder (organised in year subfolders).
   The app embeds that folder so every paper is reachable.            */
const PAPERS_FOLDER = DRIVE.papersFolderId;
const PAST_PAPERS = [
 {year:'2012',structure:'P1 (Sec A MCQ + Sec B structured) & P2 (MCQ elective sections)',difficulty:'Medium',topics:'Mechanics, Heat, Electricity, Waves',keyPoints:'First DSE cohort; emphasis on graph interpretation and standard structured problems; formula sheet fully provided.',pitfalls:'Units and significant figures; showing M (method) marks step by step.',faq:'How are method marks awarded? Each correct substitution / physical principle earns an M mark even if the final number is slightly off.'},
 {year:'2013',structure:'P1 & P2 + combined marking scheme',difficulty:'Medium',topics:'Mechanics, E&M, Heat',keyPoints:'Strong momentum/energy questions; circuit calculation in Section B.',pitfalls:'Confusing elastic vs inelastic collision; parallel-circuit total resistance.',faq:'Do I lose marks for g=10 vs 9.81? No — follow the value stated in the paper; both accepted within tolerance.'},
 {year:'2014',structure:'P1 & P2 + MS',difficulty:'Medium-Hard',topics:'Waves, Mechanics, Electricity',keyPoints:'Optics/refraction and lens question; projectile motion.',pitfalls:'Refraction direction; forgetting horizontal velocity is constant in projectiles.',faq:'How precise should numerical answers be? Usually 2–3 significant figures matching the data.'},
 {year:'2015',structure:'P1 & P2 + MS',difficulty:'Medium',topics:'Heat/Gases, Mechanics, Magnetism',keyPoints:'Gas law calculation; motor effect and force on conductor.',pitfalls:'Using °C instead of K in gas laws; left/right hand rule mix-up.',faq:'What if two methods both work? Any valid method earns the marks (alternative answers accepted).'},
 {year:'2016',structure:'P1 & P2 + MS',difficulty:'Medium',topics:'Electricity, Waves, Nuclear',keyPoints:'Domestic electricity safety; half-life calculation.',pitfalls:'Live-wire fuse placement; half-life number of cycles n=t/t½.',faq:'Is spelling/grammar marked? No, only physics meaning in science papers.'},
 {year:'2017',structure:'P1 & P2 + MS',difficulty:'Hard',topics:'Mechanics, E&M, Astronomy',keyPoints:'Longer structured mechanics; circular motion; transformer.',pitfalls:'Centripetal force is not an extra force; transformer only on a.c.',faq:'How to score full marks on structured Q? State principle → formula → substitution with units → answer.'},
 {year:'2018',structure:'P1 & P2 + MS',difficulty:'Medium-Hard',topics:'Medical physics, Mechanics, Heat',keyPoints:'Ultrasound/resolution; energy conservation; latent heat.',pitfalls:'Echo uses half the round-trip time; split heating vs phase-change steps.',faq:'Can I use equations not on the sheet? Derived relationships are fine if correct and defined.'},
 {year:'2019',structure:'P1 & P2 + MS',difficulty:'Medium',topics:'Heat, Mechanics, Electricity',keyPoints:'Internal energy & gas; lift/elevator dynamics; circuits.',pitfalls:'Apparent weight in an accelerating lift; direction of net force.',faq:'How are M and A marks different? M = method step, A = correct answer/result.'},
 {year:'2020',structure:'P1 & P2 + MS (large high-resolution scan)',difficulty:'Hard',topics:'Full syllabus mix',keyPoints:'Comprehensive coverage; data-response and experimental questions.',pitfalls:'Reading graph scales carefully; experimental control/variables wording.',faq:'How to answer experimental “suggest” questions? Identify variable to change, measure and control, plus repeats for reliability.'},
 {year:'2021',structure:'P1 & P2 + MS',difficulty:'Medium',topics:'Mechanics, E&M, Nuclear',keyPoints:'Momentum/impulse; electromagnetic force; decay equations.',pitfalls:'Balancing BOTH A and Z in decay; impulse = area under F–t.',faq:'Do I need full sentences? Concise bullet physics is accepted; symbols must be defined.'},
 {year:'2022',structure:'P1 & P2 + MS',difficulty:'Medium-Hard',topics:'Waves, Electricity, Energy',keyPoints:'Wave properties; power/energy; efficiency/Sankey.',pitfalls:'Intensity ∝ amplitude²; efficiency as a fraction then ×100%.',faq:'How is “explain” marked? Link cause → mechanism → outcome for the full mark.'},
 {year:'2023',structure:'Separate CP / P1 / P2 / MS files in Drive',difficulty:'Medium',topics:'Full syllabus',keyPoints:'Already separated into individual files in your Drive folder.',pitfalls:'Time management: don’t over-spend on one MCQ.',faq:'Pacing? About 1.5–2 min per MCQ; leave time to check structured answers.'},
 {year:'2024',structure:'P1 & P2 + MS (two-page-per-sheet scan)',difficulty:'Medium-Hard',topics:'Atomic, Energy, Medical, Astronomy',keyPoints:'P2 elective MCQs across astronomy/energy/medical; RNI vs CT distinction.',pitfalls:'CT shows structure, RNI shows function; attenuation I=I₀e^(−μx).',faq:'How to choose P2 sections? Attempt the TWO sections you revised; all MCQ + one structured per chosen section.'},
 {year:'2025',structure:'Separate P1 / P1 Ans / P2 / P2 Ans / CP in Drive',difficulty:'Medium',topics:'Full syllabus',keyPoints:'Separate question and answer files provided in Drive.',pitfalls:'Use the answer files to self-mark against the marking scheme wording.',faq:'Best revision use? Sit the paper timed, then mark strictly with the answer file.'},
 {year:'2026',structure:'Separate P1A / P1B / P2 in Drive (latest)',difficulty:'Recent style',topics:'Current syllabus emphasis',keyPoints:'Most recent paper — closest guide to current style and emphasis.',pitfalls:'Practise the latest format and command words.',faq:'Which paper should I do last in revision? The most recent (2026) as a final timed mock.'}
];

/* ---------- Exam tips ---------- */
const EXAM_TIPS = [
 {cat:'Time Management',icon:'⏱️',tips:[
   'Paper 1: divide time by marks — roughly 1 minute per mark; do not stall on one MCQ.',
   'Paper 2: you only attempt TWO elective sections — decide them in advance and practise only those.',
   'Wear a watch; if stuck, mark a provisional answer and move on, return at the end.']},
 {cat:'MCQ Technique',icon:'🔤',tips:[
   'Read whether the question asks for the CORRECT or INCORRECT statement.',
   'Eliminate two obviously wrong options first; watch for absolute words (always/never).',
   'For calculation MCQs, estimate the order of magnitude before exact working.',
   'Never leave an MCQ blank — there is no negative marking.']},
 {cat:'Structured Questions',icon:'📝',tips:[
   'Use the chain: principle/definition → formula → substitution (with units) → final answer.',
   'Show every step to earn method (M) marks even if the final value is wrong.',
   'Give numerical answers to 2–3 sig. fig. and ALWAYS include the unit.',
   'For “explain”, write cause → physical mechanism → effect/outcome.']},
 {cat:'Graphs & Experiments',icon:'📈',tips:[
   'Label axes with quantity AND unit; choose linear scales that use over half the grid.',
   'Draw a single best-fit straight line/curve; identify gradient and intercept meaning.',
   'Experiments: state the independent variable (change), dependent (measure) and controls.',
   'Mention repeats and averaging for reliability; note the main source of error.']},
 {cat:'Common Concept Traps',icon:'⚠️',tips:[
   'At projectile/vertical-throw peak v=0 but a=g; centripetal force is not an extra force.',
   'Refraction changes v and λ but not f; bends TOWARD normal in a denser medium.',
   'More parallel resistors ⇒ LOWER total resistance.',
   'Transformers need a.c.; fuse/switch on the LIVE wire.',
   'In decay balance both A and Z; half-life is unaffected by external conditions.']},
 {cat:'Last-mile Checklist',icon:'✅',tips:[
   'Memorise what is NOT on the data sheet (e.g. typical circuit symbols, hand rules).',
   'Check sign/direction in mechanics and that vectors are consistent.',
   'Re-read the command word: state / describe / explain / calculate require different depth.',
   'Keep working legible — markers cannot award marks they cannot read.']}
];

const CHAT_SUGGESTIONS = [
 'Explain centripetal force simply',
 'How do I use Fleming’s rules?',
 'Difference between series and parallel?',
 'When do I use Q=mcΔT vs Q=ml?',
 'How to balance a decay equation?',
 'Tips for projectile motion questions'
];
