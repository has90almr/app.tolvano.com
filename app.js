"use strict";
const CFG=Object.freeze({
  url:"https://tldrrrnwbmgbfnxyomwn.supabase.co",
  key:"sb_publishable_rbRheDbB12zcq4T9torQUQ_p8Dpdci0",
  control:"https://tldrrrnwbmgbfnxyomwn.supabase.co/functions/v1/tolvano-wcc-control"
});
const TOKEN="tolvano_wcc_access_token";
const LOCALE="tolvano_wcc_locale";
let snap=null,tab="home",lang=localStorage.getItem(LOCALE)==="en"?"en":"ar";
const q=(s)=>document.querySelector(s);
const C={
  ar:{home:"الرئيسية",work:"العمل",workforce:"الموظفون",results:"النتائج",control:"التحكم",title:"شركة TOLVANO أمامك في شاشة واحدة.",desc:"حالة الوكلاء والمهام والتشغيل كما هي مثبتة في Runtime Control، بدون تخمين.",loginTitle:"TOLVANO Command Center",loginDesc:"دخول خاص بمالك TOLVANO. كلمة المرور تذهب مباشرة إلى Supabase Auth ولا تمر عبر ChatGPT.",email:"البريد الإلكتروني",password:"كلمة المرور",login:"دخول",create:"إنشاء حساب خاص",logout:"تسجيل الخروج",refresh:"تحديث",readonly:"قراءة فقط",binding:"تم تسجيل الدخول، لكن هذا الحساب لم يُربط بعد كمالك WCC. الربط الإداري يتم مرة واحدة.",noData:"لا توجد بيانات.",company:"حالة الشركة",agents:"الوكلاء",running:"مهام جارية",blocked:"متوقفة",failed:"فاشلة",workTitle:"المهام",workforceTitle:"قوة العمل",resultsTitle:"آخر التنفيذ",controlTitle:"التحكم والحوكمة",locked:"أوامر التحكم مقفولة حتى اجتياز Full Executable والمراجعة المستقلة."},
  en:{home:"Home",work:"Work",workforce:"Workforce",results:"Results",control:"Control",title:"Your TOLVANO company in one view.",desc:"Agent, mission, and runtime state exactly as persisted in Runtime Control—no inferred success.",loginTitle:"TOLVANO Command Center",loginDesc:"Private owner access. Your password goes directly to Supabase Auth and never through ChatGPT.",email:"Email",password:"Password",login:"Sign in",create:"Create private account",logout:"Sign out",refresh:"Refresh",readonly:"READ ONLY",binding:"Signed in, but this account is not yet bound as the WCC owner. Owner binding is a one-time administrative step.",noData:"No data available.",company:"Company state",agents:"Agents",running:"Running tasks",blocked:"Blocked",failed:"Failed",workTitle:"Missions",workforceTitle:"Workforce",resultsTitle:"Recent execution",controlTitle:"Control & governance",locked:"Control actions remain locked until Full Executable closure and independent review pass."}
};
const t=(k)=>C[lang][k]||k;
const token=()=>sessionStorage.getItem(TOKEN)||"";
const setToken=(v)=>v?sessionStorage.setItem(TOKEN,v):sessionStorage.removeItem(TOKEN);
function notice(msg,type=""){const e=q("#notice");e.textContent=msg||"";e.className="notice"+(type?" "+type:"")+(msg?"":" hidden")}
async function auth(path,body,access=""){
  const h={apikey:CFG.key,"Content-Type":"application/json"};
  if(access)h.Authorization="Bearer "+access;
  const r=await fetch(CFG.url+path,{method:"POST",headers:h,body:body?JSON.stringify(body):undefined});
  let d={};try{d=await r.json()}catch{}
  return{ok:r.ok,status:r.status,data:d};
}
const signIn=(email,password)=>auth("/auth/v1/token?grant_type=password",{email,password});
const signUp=(email,password)=>auth("/auth/v1/signup",{email,password});
async function signOut(){const a=token();if(a)try{await auth("/auth/v1/logout",null,a)}catch{}setToken("");snap=null;render()}
function cls(s){s=String(s||"");if(/PASS|ACTIVE|WORKING|RUNNING|COMPLETED|READY|CONFIRMED/.test(s))return"ok";if(/FAIL|OFFLINE|ERROR/.test(s))return"bad";if(/BLOCK|WAIT|SAFE|QUEUED|PREPARED|RECONCILIATION/.test(s))return"warn";return"muted"}
function E(tag,cl,txt){const e=document.createElement(tag);if(cl)e.className=cl;if(txt!==undefined)e.textContent=String(txt);return e}
function clear(e){while(e.firstChild)e.removeChild(e.firstChild)}
function card(title,state,rows=[]){const c=E("article","card");c.append(E("h3","",title));if(state)c.append(E("span","pill "+cls(state),state));for(const r of rows){const d=E("div","row");d.append(E("span","muted",r[0]),E("span","",r[1]??"—"));c.append(d)}return c}
function setView(){q("#loginView").classList.toggle("hidden",!!token());q("#appView").classList.toggle("hidden",!token())}
async function load(){
  const a=token();if(!a){render();return}
  notice(lang==="ar"?"جارٍ تحميل حالة الشركة…":"Loading company state…");
  const r=await fetch(CFG.control,{headers:{apikey:CFG.key,Authorization:"Bearer "+a}});
  let d={};try{d=await r.json()}catch{}
  if(r.status===401){setToken("");snap=null;notice(lang==="ar"?"انتهت الجلسة. سجل الدخول من جديد.":"Session expired. Sign in again.","error");render();return}
  if(r.status===403&&d.state==="OWNER_BINDING_REQUIRED"){snap=null;setView();notice(t("binding"),"error");return}
  if(!r.ok||!d.snapshot){snap=null;setView();notice((lang==="ar"?"تعذر تحميل WCC: ":"WCC load failed: ")+(d.state||r.status),"error");return}
  snap=d.snapshot;notice("");setView();draw();
}
function nav(){const n=q("#nav");clear(n);for(const k of["home","work","workforce","results","control"]){const b=E("button",tab===k?"active":"",t(k));b.type="button";b.onclick=()=>{tab=k;draw()};n.append(b)}}
function draw(){
  if(!snap)return;
  document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  q("#heroTitle").textContent=t("title");q("#heroDesc").textContent=t("desc");q("#readChip").textContent=t("readonly");q("#logoutBtn").textContent=t("logout");q("#refreshBtn").textContent=t("refresh");nav();
  const v=q("#view");clear(v);const c=snap.counts||{},r=snap.runtime||{},s=snap.safe_mode||{};
  q("#heroState").textContent=(s.active?"SAFE MODE":"OPERATING")+" · "+(r.provider_binding_state||"UNBOUND");q("#heroState").className="state "+(s.active?"warn":"ok");
  if(tab==="home"){const g=E("div","grid4");for(const x of[[t("agents"),c.agents_total??0],[t("running"),c.tasks_running??0],[t("blocked"),c.tasks_blocked??0],[t("failed"),c.tasks_failed??0]]){const k=E("div","card kpi");k.append(E("small","",x[0]),E("strong","",x[1]));g.append(k)}v.append(g);const sec=E("section","section");sec.append(E("h2","",t("company")));const gg=E("div","grid");gg.append(card("Safe Mode",s.active?"ACTIVE":"INACTIVE",[["Scope",s.scope_type?s.scope_type+":"+s.scope_value:"—"],["Reason",s.reason||"—"]]));gg.append(card("Runtime",r.external_effects_enabled?"EFFECTS_ON":"FAIL_CLOSED",[["Model calls",r.model_calls_enabled?"ON":"OFF"],["External effects",r.external_effects_enabled?"ON":"OFF"],["Provider",r.provider_binding_state||"UNBOUND"],["Authority",r.max_authority||"—"]]));sec.append(gg);v.append(sec)}
  if(tab==="work"){const sec=E("section","section");sec.append(E("h2","",t("workTitle")));const g=E("div","grid");const a=Array.isArray(snap.missions)?snap.missions:[];if(!a.length)g.append(E("div","empty",t("noData")));for(const m of a)g.append(card(m.objective||m.mission_id,m.goal_status||"MISSION",[["Tasks",m.task_count],["Running",m.running_tasks],["Completed",m.completed_tasks],["Agents",(m.agent_ids||[]).join(", ")]]));sec.append(g);v.append(sec)}
  if(tab==="workforce"){const sec=E("section","section");sec.append(E("h2","",t("workforceTitle")));const g=E("div","grid");const a=Array.isArray(snap.agents)?snap.agents:[];if(!a.length)g.append(E("div","empty",t("noData")));for(const x of a)g.append(card((x.name||x.agent_id)+" · "+(x.role||""),x.lifecycle_state,[["ID",x.agent_id],["Mode",x.operating_mode],["Version",x.version],[t("running"),x.running_tasks],[t("blocked"),x.blocked_tasks],["Latest task",x.latest_task?.objective||"—"]]));sec.append(g);v.append(sec)}
  if(tab==="results"){const sec=E("section","section");sec.append(E("h2","",t("resultsTitle")));const g=E("div","grid");const a=Array.isArray(snap.runs)?snap.runs:[];if(!a.length)g.append(E("div","empty",t("noData")));for(const x of a)g.append(card((x.agent_id||"Agent")+" · "+(x.run_id||""),x.result_state,[["Execution",x.execution_class],["Cognition",x.cognition_source],["Provenance",x.provenance_record_present?"YES":"NO"],["Estimated cost",x.estimated_cost_usd??"—"]]));sec.append(g);v.append(sec)}
  if(tab==="control"){const sec=E("section","section");sec.append(E("h2","",t("controlTitle")));const g=E("div","grid");g.append(card("Release Gate",snap.controls_enabled?"ENABLED":"LOCKED",[["Mutation",snap.authorizes_mutation?"AUTHORIZED":"BLOCKED"],["External effects",snap.authorizes_external_effect?"AUTHORIZED":"BLOCKED"],["Commercial action",snap.authorizes_commercial_action?"AUTHORIZED":"BLOCKED"]]));g.append(card("Runtime Policy",r.provider_binding_state||"UNBOUND",[["Model calls",r.model_calls_enabled?"ON":"OFF"],["External effects",r.external_effects_enabled?"ON":"OFF"],["Active cron",c.active_cron_jobs??"—"]]));sec.append(g,E("div","notice",t("locked")));v.append(sec)}
  q("#generated").textContent=(lang==="ar"?"آخر لقطة: ":"Snapshot: ")+(snap.generated_at?new Date(snap.generated_at).toLocaleString(lang==="ar"?"ar-LY":"en-GB"):"—");
}
function render(){
  document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  q("#loginTitle").textContent=t("loginTitle");q("#loginDesc").textContent=t("loginDesc");q("#emailLabel").textContent=t("email");q("#passwordLabel").textContent=t("password");q("#loginBtn").textContent=t("login");q("#createBtn").textContent=t("create");q("#localeBtn").textContent=lang==="ar"?"EN":"عربي";setView();if(snap)draw();
}
q("#authForm").addEventListener("submit",async(e)=>{e.preventDefault();const email=q("#email").value.trim(),password=q("#password").value;if(!email||password.length<12){notice(lang==="ar"?"استخدم بريدًا صحيحًا وكلمة مرور من 12 حرفًا على الأقل.":"Use a valid email and a password of at least 12 characters.","error");return}notice(lang==="ar"?"جارٍ تسجيل الدخول…":"Signing in…");const x=await signIn(email,password);if(!x.ok){notice(x.data?.msg||x.data?.message||(lang==="ar"?"تعذر تسجيل الدخول.":"Sign-in failed."),"error");return}if(!x.data?.access_token){notice(lang==="ar"?"لم تُنشأ جلسة صالحة.":"No valid session returned.","error");return}setToken(x.data.access_token);await load()});
q("#createBtn").addEventListener("click",async()=>{const email=q("#email").value.trim(),password=q("#password").value;if(!email||password.length<12){notice(lang==="ar"?"استخدم بريدًا صحيحًا وكلمة مرور من 12 حرفًا على الأقل.":"Use a valid email and a password of at least 12 characters.","error");return}notice(lang==="ar"?"جارٍ إنشاء الحساب…":"Creating account…");const x=await signUp(email,password);if(!x.ok){notice(x.data?.msg||x.data?.message||(lang==="ar"?"تعذر إنشاء الحساب.":"Account creation failed."),"error");return}if(x.data?.access_token){setToken(x.data.access_token);await load();return}notice(lang==="ar"?"تم إنشاء الطلب. إذا طُلب تأكيد البريد، أكد الرسالة ثم عد وسجل الدخول.":"Account request created. Confirm the email if requested, then sign in.","success")});
q("#logoutBtn").onclick=signOut;q("#refreshBtn").onclick=load;q("#localeBtn").onclick=()=>{lang=lang==="ar"?"en":"ar";localStorage.setItem(LOCALE,lang);render()};render();if(token())load();
