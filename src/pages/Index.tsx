import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── Данные ───────────────────────────────────────────────────────────────────
const LOGO    = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const PHONE   = "8 (995) 645-51-25";
const PHONE_H = "tel:+79956455125";
const SMS_H   = "sms:+79956455125?body=" + encodeURIComponent("Хочу узнать стоимость поездки. Маршрут: ");
const TG      = "https://t.me/Mezhgorod1816";
const MAX     = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const IMGS = {
  road:    "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/bb98cd15-bd8b-4250-a5bb-862d1a80f09a.jpg",
  solaris: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/127f047b-28ee-4c21-b1fa-c3163c861a85.jpg",
  camry:   "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/d48194e6-00be-4078-a950-1191e7c530be.jpg",
  starex:  "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/58abbe0a-622c-4b10-bc65-0e2feaeb5648.jpg",
  mil:     "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/f980822b-31b7-41e1-a439-210af5f90f33.jpg",
  family:  "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/b702120f-a865-4d0f-aca3-9c839ddd3bf7.jpg",
  biz:     "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/f395953f-c908-4408-b355-d437272d8804.jpg",
};

type S = "intro" | "t0" | "t1" | "t2" | "perks" | "who" | "cta";
const SCENES: S[] = ["intro","t0","t1","t2","perks","who","cta"];
const BG: Record<S,string> = {
  intro: IMGS.road, t0: IMGS.solaris, t1: IMGS.camry, t2: IMGS.starex,
  perks: IMGS.road, who: IMGS.family, cta: IMGS.road,
};

const TARIFFS = [
  { id:"t0" as S, name:"СТАНДАРТ", tag:"Hyundai Solaris", color:"#F5C842",
    rows:[{d:"до 200 км",r:"35₽",n:"80₽"},{d:"до 500 км",r:"32₽",n:"75₽"},{d:"от 1000 км",r:"30₽",n:"70₽"}] },
  { id:"t1" as S, name:"КОМФОРТ+", tag:"Toyota Camry 70", color:"#5BC8FF",
    rows:[{d:"до 200 км",r:"45₽",n:"105₽"},{d:"до 500 км",r:"40₽",n:"100₽"},{d:"от 1000 км",r:"38₽",n:"90₽"}] },
  { id:"t2" as S, name:"МИНИВЭН",  tag:"Hyundai Starex",  color:"#6EE07A",
    rows:[{d:"до 200 км",r:"60₽",n:"110₽"},{d:"до 500 км",r:"55₽",n:"105₽"},{d:"от 1000 км",r:"50₽",n:"100₽"}] },
];
const PERKS = [
  {e:"⚡",t:"Подача от 30 минут",s:"кроме Москвы и СПб"},
  {e:"📋",t:"Предзаказ без предоплаты",s:"точно ко времени"},
  {e:"🔄",t:"Ожидание бесплатно",s:"при поездке туда‑обратно в один день"},
  {e:"🪑",t:"Детское кресло",s:"бесплатно"},
  {e:"🐾",t:"Животные",s:"без доплаты"},
];
const WHO = [
  {img:IMGS.mil,    t:"Бойцы СВО",      s:"Личная доставка домой"},
  {img:IMGS.family, t:"Семьи с детьми",  s:"Кресло и зверята бесплатно"},
  {img:IMGS.biz,    t:"Организации",     s:"Договор, закрывающие docs"},
];

// ─── SVG иконки (inline, без зависимостей) ───────────────────────────────────
const IcPhone = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.95a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcTG   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.25-1.97 9.29c-.14.66-.54.82-1.08.51l-3-2.21-1.45 1.39c-.16.16-.3.3-.6.3l.21-3.05 5.56-5.02c.24-.21-.05-.33-.37-.12L7.24 14.75l-2.96-.92c-.64-.2-.66-.64.14-.95l11.57-4.46c.54-.19 1.01.13.57.83z"/></svg>;
const IcChev = ({up}:{up?:boolean}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>;
const IcShare= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IcPhone2= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3"/></svg>;

// ─── Компонент ────────────────────────────────────────────────────────────────
export default function Index() {
  const [splash, setSplash]       = useState(true);
  const [splashOut, setSplashOut] = useState(false);
  const [scene, setScene]         = useState<S>("intro");
  const [leaving, setLeaving]     = useState(false);
  const [dir, setDir]             = useState<1|-1>(1);
  const [whoIdx, setWhoIdx]       = useState(0);
  const [pwaEvt, setPwaEvt]       = useState<Event|null>(null);
  const [pwaOk, setPwaOk]         = useState(false);
  const busy                      = useRef(false);
  const autoRef                   = useRef<ReturnType<typeof setTimeout>|null>(null);

  // Splash
  useEffect(()=>{
    const a = setTimeout(()=>setSplashOut(true), 2000);
    const b = setTimeout(()=>setSplash(false), 2700);
    return ()=>{clearTimeout(a);clearTimeout(b);};
  },[]);

  // PWA
  useEffect(()=>{
    const h=(e:Event)=>{e.preventDefault();setPwaEvt(e);};
    window.addEventListener("beforeinstallprompt",h);
    window.addEventListener("appinstalled",()=>setPwaOk(true));
    return ()=>window.removeEventListener("beforeinstallprompt",h);
  },[]);

  // Переход
  const go = useCallback((next:S, d:1|-1=1)=>{
    if(busy.current||next===scene) return;
    busy.current=true;
    setDir(d); setLeaving(true);
    setTimeout(()=>{setScene(next);setLeaving(false);busy.current=false;},380);
  },[scene]);

  const goNext = useCallback(()=>{
    const i=SCENES.indexOf(scene);
    if(i<SCENES.length-1) go(SCENES[i+1],1);
  },[scene,go]);
  const goPrev = useCallback(()=>{
    const i=SCENES.indexOf(scene);
    if(i>0) go(SCENES[i-1],-1);
  },[scene,go]);

  // Авто-переход
  useEffect(()=>{
    if(splash) return;
    if(autoRef.current) clearTimeout(autoRef.current);
    autoRef.current=setTimeout(goNext,7000);
    return ()=>{if(autoRef.current) clearTimeout(autoRef.current);};
  },[scene,splash,goNext]);

  // Who автослайд
  useEffect(()=>{
    if(scene!=="who") return;
    const t=setInterval(()=>setWhoIdx(w=>(w+1)%WHO.length),3500);
    return ()=>clearInterval(t);
  },[scene]);

  // Свайп + колесо
  useEffect(()=>{
    let sy=0;
    const oTS=(e:TouchEvent)=>{sy=e.touches[0].clientY;};
    const oTE=(e:TouchEvent)=>{const d=sy-e.changedTouches[0].clientY;if(Math.abs(d)>50){if(d>0)goNext();else goPrev();}};
    const oW=(e:WheelEvent)=>{e.preventDefault();if(e.deltaY>20)goNext();else if(e.deltaY<-20)goPrev();};
    const oK=(e:KeyboardEvent)=>{if(e.key==="ArrowDown"||e.key==="ArrowRight")goNext();if(e.key==="ArrowUp"||e.key==="ArrowLeft")goPrev();};
    window.addEventListener("touchstart",oTS,{passive:true});
    window.addEventListener("touchend",oTE,{passive:true});
    window.addEventListener("wheel",oW,{passive:false});
    window.addEventListener("keydown",oK);
    return ()=>{window.removeEventListener("touchstart",oTS);window.removeEventListener("touchend",oTE);window.removeEventListener("wheel",oW);window.removeEventListener("keydown",oK);};
  },[goNext,goPrev]);

  const install=async()=>{
    if(!pwaEvt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pwaEvt as any).prompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {outcome}=await (pwaEvt as any).userChoice;
    if(outcome==="accepted") setPwaOk(true);
    setPwaEvt(null);
  };
  const share=()=>{
    if(navigator.share) navigator.share({title:"Такси Дальняк",text:"Межгородное такси. Чем дальше — тем выгоднее!",url:window.location.href});
    else navigator.clipboard.writeText(window.location.href).then(()=>alert("Ссылка скопирована!"));
  };

  const si    = SCENES.indexOf(scene);
  const isFirst = si===0;
  const isLast  = si===SCENES.length-1;
  const tar   = TARIFFS.find(t=>t.id===scene)??null;
  const F     = "'Oswald','Arial Narrow',sans-serif";

  const sceneStyle: React.CSSProperties = {
    transition:"opacity .38s ease,transform .38s ease",
    opacity: leaving?0:1,
    transform: leaving
      ? `translateY(${dir>0?"-5%":"5%"}) scale(.97)`
      : "translateY(0) scale(1)",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;overflow:hidden;background:#000;-webkit-tap-highlight-color:transparent}
        @keyframes fup{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes zin{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes pr{0%{box-shadow:0 0 0 0 rgba(245,200,66,.4)}70%{box-shadow:0 0 0 10px transparent}100%{box-shadow:0 0 0 0 transparent}}
        .fup{animation:fup .5s ease forwards}
        .zin{animation:zin .45s ease forwards}
        .pf{transition:width 7s linear}
        img{content-visibility:auto}
        a,button{cursor:pointer;-webkit-user-select:none;user-select:none}
      `}</style>

      <div style={{position:"fixed",inset:0,fontFamily:F,overflow:"hidden",background:"#000"}}>

        {/* ═══ ЗАСТАВКА ═══ */}
        {splash&&(
          <div style={{
            position:"fixed",inset:0,zIndex:200,
            background:"radial-gradient(ellipse at center, #111 0%, #000 100%)",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            transition:"opacity .7s,transform .7s",
            opacity:splashOut?0:1, transform:splashOut?"scale(1.08)":"scale(1)",
            pointerEvents:splashOut?"none":"all",
          }}>
            <div style={{position:"relative",marginBottom:20}}>
              <img src={LOGO} alt="" style={{width:88,height:88,borderRadius:22,objectFit:"cover",display:"block",
                boxShadow:"0 0 40px rgba(245,200,66,.4)"}} />
              <div style={{position:"absolute",inset:-6,borderRadius:28,border:"2px solid rgba(245,200,66,.3)",
                animation:"pr 1.5s infinite"}} />
            </div>
            <div style={{fontSize:38,fontWeight:700,letterSpacing:"0.3em",color:"#fff"}}>ДАЛЬНЯК</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:5,letterSpacing:"0.5em",textTransform:"uppercase"}}>Межгородное такси</div>
            <div style={{marginTop:28,width:140,height:2,background:"rgba(255,255,255,.08)",borderRadius:2,overflow:"hidden"}}>
              <div className="pf" style={{height:"100%",background:"linear-gradient(90deg,#F5C842,#fff)",
                width:splashOut?"100%":"0%",transitionDuration:"2s"}} />
            </div>
          </div>
        )}

        {/* ═══ ФОН ═══ */}
        <div style={{position:"absolute",inset:0,zIndex:0}}>
          <img key={BG[scene]} src={BG[scene]} alt="" loading="eager" decoding="async" style={{
            width:"100%",height:"100%",objectFit:"cover",
            transition:"opacity .5s",
          }} />
          <div style={{position:"absolute",inset:0,background:
            tar ? `linear-gradient(to bottom,rgba(0,0,0,.72) 0%,rgba(0,0,0,.25) 45%,rgba(0,0,0,.85) 100%)`
                : "linear-gradient(to bottom,rgba(0,0,0,.75) 0%,rgba(0,0,0,.3) 45%,rgba(0,0,0,.88) 100%)"}} />
          {/* кино-рамки */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:34,background:"#000"}} />
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:34,background:"#000"}} />
        </div>

        {/* ═══ ШАПКА ═══ */}
        <header style={{
          position:"absolute",top:34,left:0,right:0,zIndex:100,
          padding:"4px 10px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          background:"rgba(0,0,0,.75)",
          borderBottom:"1px solid rgba(255,255,255,.06)",
        }}>
          <a href={TG} target="_blank" rel="noopener noreferrer" style={{
            display:"flex",alignItems:"center",gap:6,
            color:"#38BDF8",textDecoration:"none",fontWeight:700,fontSize:12,
            border:"1px solid rgba(56,189,248,.28)",borderRadius:11,padding:"6px 10px",
            background:"rgba(56,189,248,.07)",
          }}>
            <IcTG/> Telegram
          </a>
          <a href={PHONE_H} style={{
            display:"flex",alignItems:"center",gap:5,
            color:"#fff",textDecoration:"none",fontWeight:700,fontSize:13,
            textShadow:"0 0 12px rgba(255,255,255,.3)",
          }}>
            <span style={{color:"#F5C842"}}><IcPhone/></span>{PHONE}
          </a>
          <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
            color:"#fff",textDecoration:"none",fontWeight:700,fontSize:12,
            background:"#005FF9",borderRadius:11,padding:"6px 12px",
            boxShadow:"0 0 14px rgba(0,95,249,.35)",
          }}>MAX</a>
        </header>

        {/* ═══ СЦЕНА ═══ */}
        <div style={{
          position:"absolute",zIndex:10,
          top:78,bottom:46,left:0,right:0,
          display:"flex",alignItems:"center",justifyContent:"center",
          padding:"0 14px",overflowY:"auto",
          ...sceneStyle,
        }}>

          {/* ─ INTRO ─ */}
          {scene==="intro"&&(
            <div className="fup" style={{textAlign:"center",maxWidth:380,width:"100%"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
                <img src={LOGO} alt="" style={{width:40,height:40,borderRadius:12,objectFit:"cover"}} />
                <span style={{fontSize:18,fontWeight:700,letterSpacing:"0.28em",color:"#fff"}}>ДАЛЬНЯК</span>
              </div>

              {/* Заголовок — чистый, без glitch */}
              <h1 style={{
                fontFamily:F, fontSize:"clamp(44px,13vw,88px)",
                fontWeight:700, lineHeight:.92, color:"#fff",
                marginBottom:10, letterSpacing:"0.02em",
              }}>
                ТАКСИ<br/>
                <span style={{
                  color:"#F5C842",
                  textShadow:"0 0 14px rgba(245,200,66,.5)",
                }}>МЕЖГОРОД</span>
              </h1>

              <p style={{color:"rgba(255,255,255,.45)",fontSize:13,marginBottom:16,letterSpacing:".04em"}}>
                От 200 км · Вся Россия · Новые территории
              </p>
              <div style={{
                display:"inline-block",border:"1px solid rgba(245,200,66,.4)",borderRadius:40,
                padding:"7px 20px",marginBottom:22,
                color:"#F5C842",fontWeight:700,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",
                background:"rgba(245,200,66,.05)",
              }}>Чем дальше — тем выгоднее!</div>

              {/* Три кнопки заказа */}
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                <a href={TG} target="_blank" rel="noopener noreferrer" style={{
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  background:"rgba(56,189,248,.15)",border:"1.5px solid rgba(56,189,248,.5)",
                  color:"#38BDF8",textDecoration:"none",fontWeight:700,fontSize:16,
                  padding:"13px",borderRadius:18,transition:"background .15s",
                }}><IcTG/> Заказать в Telegram</a>

                <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:"#005FF9",color:"#fff",textDecoration:"none",
                  fontWeight:700,fontSize:16,padding:"13px",borderRadius:18,
                  boxShadow:"0 0 16px rgba(0,95,249,.3)",
                }}>Заказать в MAX</a>

                <a href={PHONE_H} style={{
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  background:"#F5C842",color:"#000",textDecoration:"none",
                  fontWeight:700,fontSize:15,padding:"13px",borderRadius:18,
                  boxShadow:"0 0 16px rgba(245,200,66,.3)",
                  textAlign:"center",lineHeight:1.2,
                }}>
                  <IcPhone/>Узнать стоимость по телефону<br/>
                  <span style={{fontSize:11,fontWeight:500,opacity:.7}}>или отправив SMS</span>
                </a>
              </div>
            </div>
          )}

          {/* ─ ТАРИФ ─ */}
          {tar&&(
            <div style={{width:"100%",maxWidth:400}}>
              <div className="fup" style={{textAlign:"center",marginBottom:10}}>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:".4em",textTransform:"uppercase",color:tar.color,opacity:.7,marginBottom:2}}>тариф</div>
                <h2 style={{
                  fontFamily:F,
                  fontSize:"clamp(38px,11vw,66px)",fontWeight:700,lineHeight:.92,
                  color:tar.color,
                  textShadow:`0 0 16px ${tar.color}80`,
                }}>{tar.name}</h2>
                <div style={{color:"rgba(255,255,255,.35)",fontSize:11,marginTop:3}}>{tar.tag}</div>
              </div>

              {/* Таблица цен */}
              <div style={{marginBottom:10,borderRadius:18,overflow:"hidden",border:"1px solid rgba(255,255,255,.08)"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px",
                  background:"rgba(0,0,0,.65)"}}>
                  {["Расстояние","Россия","Нов.терр."].map((h,i)=>(
                    <div key={i} style={{padding:"7px 8px",fontSize:9,fontWeight:700,
                      color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".05em",
                      borderBottom:"1px solid rgba(255,255,255,.06)",
                      textAlign:i===0?"left":"center"}}>{h}</div>
                  ))}
                  {tar.rows.map((r,i)=>(
                    <React.Fragment key={i}>
                      <div style={{padding:"10px 8px",fontSize:12,color:"rgba(255,255,255,.6)",
                        borderBottom:i<2?"1px solid rgba(255,255,255,.05)":"none"}}>
                        {r.d}
                        {i===2&&<span style={{display:"block",fontSize:9,color:tar.color,fontWeight:700,marginTop:2}}>🏆 выгоднее всего</span>}
                      </div>
                      <div style={{padding:"10px 4px",textAlign:"center",
                        fontSize:18,fontWeight:700,color:tar.color,
                        textShadow:`0 0 8px ${tar.color}80`,
                        borderBottom:i<2?"1px solid rgba(255,255,255,.05)":"none"}}>{r.r}<span style={{fontSize:9,fontWeight:500,opacity:.6}}>/км</span></div>
                      <div style={{padding:"10px 4px",textAlign:"center",
                        fontSize:16,fontWeight:700,color:"#FF7070",
                        borderBottom:i<2?"1px solid rgba(255,255,255,.05)":"none"}}>{r.n}<span style={{fontSize:9,fontWeight:500,opacity:.6}}>/км</span></div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{textAlign:"center",marginBottom:9}}>
                <span style={{color:"#F5C842",fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>
                  Чем дальше — тем выгоднее! ↓
                </span>
              </div>

              <a href={PHONE_H} style={{
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                background:"#F5C842",color:"#000",textDecoration:"none",
                fontWeight:700,fontSize:15,padding:"13px",borderRadius:18,
                boxShadow:"0 0 14px rgba(245,200,66,.3)",width:"100%",
                textAlign:"center",lineHeight:1.3,
              }}>
                <span>Узнать стоимость по телефону</span>
                <span style={{fontSize:11,fontWeight:500,opacity:.6,marginTop:2}}>или отправив SMS</span>
              </a>
            </div>
          )}

          {/* ─ ПРЕИМУЩЕСТВА ─ */}
          {scene==="perks"&&(
            <div className="fup" style={{width:"100%",maxWidth:400}}>
              <div style={{textAlign:"center",marginBottom:14}}>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:".4em",textTransform:"uppercase",color:"rgba(245,200,66,.65)"}}>преимущества</div>
                <h2 style={{fontFamily:F,fontSize:"clamp(28px,9vw,50px)",fontWeight:700,color:"#fff",lineHeight:.92}}>ПОЧЕМУ МЫ</h2>
              </div>
              {PERKS.map((p,i)=>(
                <div key={i} style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"10px 14px",borderRadius:15,marginBottom:7,
                  background:"rgba(0,0,0,.6)",
                  border:"1px solid rgba(255,255,255,.07)",
                  animation:`fup .4s ease ${i*.07}s forwards`,opacity:0,
                }}>
                  <span style={{fontSize:22,flexShrink:0}}>{p.e}</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{p.t}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>{p.s}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─ КОГО ВЕЗЁМ ─ */}
          {scene==="who"&&(
            <div className="fup" style={{width:"100%",maxWidth:400,textAlign:"center"}}>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:9,fontWeight:600,letterSpacing:".4em",textTransform:"uppercase",color:"rgba(245,200,66,.65)"}}>пассажиры</div>
                <h2 style={{fontFamily:F,fontSize:"clamp(28px,9vw,50px)",fontWeight:700,color:"#fff",lineHeight:.92}}>КОГО МЫ<br/>ВОЗИМ</h2>
              </div>
              <div style={{position:"relative",borderRadius:20,overflow:"hidden",marginBottom:12,height:190}}>
                <img key={whoIdx} src={WHO[whoIdx].img} alt="" className="zin"
                  style={{width:"100%",height:"100%",objectFit:"cover"}} />
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 55%)"}} />
                <div style={{position:"absolute",bottom:12,left:0,right:0}}>
                  <div style={{fontWeight:700,fontSize:18,color:"#fff"}}>{WHO[whoIdx].t}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{WHO[whoIdx].s}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:7,justifyContent:"center",marginBottom:16}}>
                {WHO.map((_,i)=>(
                  <button key={i} onClick={()=>setWhoIdx(i)} style={{
                    width:whoIdx===i?24:8,height:8,borderRadius:4,
                    background:whoIdx===i?"#F5C842":"rgba(255,255,255,.22)",
                    border:"none",transition:"all .3s",
                    boxShadow:whoIdx===i?"0 0 8px #F5C842":"none",
                  }}/>
                ))}
              </div>
              <a href={TG} target="_blank" rel="noopener noreferrer" style={{
                display:"inline-flex",alignItems:"center",gap:8,
                background:"rgba(56,189,248,.15)",border:"1.5px solid rgba(56,189,248,.45)",
                color:"#38BDF8",textDecoration:"none",fontWeight:700,fontSize:15,
                padding:"12px 28px",borderRadius:17,
              }}><IcTG/>Заказать поездку</a>
            </div>
          )}

          {/* ─ CTA ─ */}
          {scene==="cta"&&(
            <div className="zin" style={{width:"100%",maxWidth:400,textAlign:"center"}}>
              {/* Взрыв света */}
              <div style={{
                width:60,height:60,borderRadius:"50%",margin:"0 auto 14px",
                background:"radial-gradient(circle,#F5C842 0%,rgba(245,200,66,0) 70%)",
                boxShadow:"0 0 50px rgba(245,200,66,.7),0 0 100px rgba(245,200,66,.3)",
                animation:"pr 1.5s infinite",
              }}/>
              <h2 style={{
                fontFamily:F,fontSize:"clamp(24px,8vw,48px)",fontWeight:700,
                color:"#fff",lineHeight:1.05,marginBottom:6,
              }}>
                ЧЕМ ДАЛЬШЕ —<br/>
                <span style={{color:"#F5C842",textShadow:"0 0 20px rgba(245,200,66,.7)"}}>ТЕМ ВЫГОДНЕЕ!</span>
              </h2>
              <p style={{color:"rgba(255,255,255,.35)",fontSize:12,marginBottom:18}}>
                Назовите маршрут — ответим за 2 минуты
              </p>

              {/* Три кнопки заказа */}
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:13}}>
                <a href={TG} target="_blank" rel="noopener noreferrer" style={{
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  background:"rgba(56,189,248,.15)",border:"1.5px solid rgba(56,189,248,.5)",
                  color:"#38BDF8",textDecoration:"none",fontWeight:700,fontSize:17,
                  padding:"14px",borderRadius:20,
                }}><IcTG/>Написать в Telegram</a>

                <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:"#005FF9",color:"#fff",textDecoration:"none",
                  fontWeight:700,fontSize:17,padding:"14px",borderRadius:20,
                  boxShadow:"0 0 24px rgba(0,95,249,.4)",
                  animation:"pb 2s infinite",
                }}>Написать в MAX</a>

                <a href={PHONE_H} style={{
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  background:"#F5C842",color:"#000",textDecoration:"none",
                  fontWeight:700,fontSize:16,padding:"14px",borderRadius:20,
                  boxShadow:"0 0 24px rgba(245,200,66,.4)",
                  animation:"pr 2s infinite",lineHeight:1.25,textAlign:"center",
                }}>
                  <span>Узнать стоимость по телефону</span>
                  <span style={{fontSize:11,fontWeight:500,opacity:.65,marginTop:2}}>или отправив SMS</span>
                </a>

                <a href={SMS_H} style={{
                  display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                  background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",
                  color:"rgba(255,255,255,.55)",textDecoration:"none",
                  fontWeight:700,fontSize:14,padding:"12px",borderRadius:18,
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Отправить SMS с маршрутом
                </a>
              </div>

              {/* PWA + Поделиться */}
              <div style={{display:"flex",gap:8}}>
                {pwaEvt&&!pwaOk&&(
                  <button onClick={install} style={{
                    flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                    padding:"10px",borderRadius:14,
                    background:"rgba(245,200,66,.07)",border:"1px solid rgba(245,200,66,.28)",
                    color:"#F5C842",fontFamily:F,fontWeight:700,fontSize:12,
                  }}>
                    <IcPhone2/>
                    <span>На главный экран</span>
                    <span style={{fontSize:9,opacity:.6,fontWeight:400}}>Чтобы не потерять нас</span>
                  </button>
                )}
                <button onClick={share} style={{
                  flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                  padding:"10px",borderRadius:14,
                  background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",
                  color:"rgba(255,255,255,.5)",fontFamily:F,fontWeight:700,fontSize:12,
                }}>
                  <IcShare/>
                  <span>Поделиться</span>
                  <span style={{fontSize:9,opacity:.5,fontWeight:400}}>Расскажи другу</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ ТОЧКИ-НАВ ═══ */}
        <nav style={{
          position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",
          zIndex:50,display:"flex",flexDirection:"column",gap:8,
        }}>
          {SCENES.map((s,i)=>(
            <button key={s} onClick={()=>go(s,i>si?1:-1)} style={{
              width:8,height:scene===s?26:8,borderRadius:4,
              background:scene===s?"#F5C842":"rgba(255,255,255,.2)",
              border:"none",transition:"all .3s",
              boxShadow:scene===s?"0 0 8px #F5C842":"none",
              padding:0,
            }}/>
          ))}
        </nav>

        {/* ═══ СТРЕЛКИ ═══ */}
        {!isFirst&&(
          <button onClick={goPrev} style={{
            position:"absolute",top:87,left:"50%",transform:"translateX(-50%)",
            zIndex:50,width:36,height:36,borderRadius:"50%",
            background:"rgba(0,0,0,.4)",backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.4)",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}><IcChev up/></button>
        )}
        {!isLast&&(
          <button onClick={goNext} style={{
            position:"absolute",bottom:53,left:"50%",transform:"translateX(-50%)",
            zIndex:50,background:"none",border:"none",
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
          }}>
            <span style={{color:"rgba(255,255,255,.18)",fontSize:8,letterSpacing:".3em",textTransform:"uppercase",fontFamily:F}}>далее</span>
            <div style={{
              width:32,height:32,borderRadius:"50%",
              background:"rgba(0,0,0,.4)",backdropFilter:"blur(8px)",
              border:"1px solid rgba(245,200,66,.25)",
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#F5C842",animation:"bob 1.5s ease-in-out infinite",
            }}><IcChev/></div>
          </button>
        )}

        {/* ═══ ПРОГРЕСС ═══ */}
        <div style={{position:"absolute",bottom:34,left:0,right:0,height:2,background:"rgba(255,255,255,.05)",zIndex:30}}>
          <div key={`${scene}-p`} className="pf" style={{
            height:"100%",background:"linear-gradient(90deg,#F5C842,rgba(245,200,66,.3))",
            width:isLast?"0%":"100%", transitionDuration:isLast?"0s":"7s",
          }}/>
        </div>

        {/* ═══ МОБИЛЬНАЯ НИЖНЯЯ ПАНЕЛЬ ═══ */}
        <div style={{
          position:"absolute",bottom:34,left:0,right:0,zIndex:40,
          padding:"5px 8px",display:"flex",gap:6,
          background:"rgba(0,0,0,.65)",backdropFilter:"blur(14px)",
          borderTop:"1px solid rgba(255,255,255,.05)",
        }}>
          <a href={TG} target="_blank" rel="noopener noreferrer" style={{
            flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4,
            background:"rgba(56,189,248,.7)",color:"#fff",textDecoration:"none",
            fontWeight:700,fontSize:11,padding:"9px 2px",borderRadius:12,
          }}><IcTG/>TG</a>
          <a href={PHONE_H} style={{
            flex:1.7,display:"flex",alignItems:"center",justifyContent:"center",gap:4,
            background:"#F5C842",color:"#000",textDecoration:"none",
            fontWeight:700,fontSize:11,padding:"9px 2px",borderRadius:12,
          }}><IcPhone/>Звонок / SMS</a>
          <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
            flex:1,display:"flex",alignItems:"center",justifyContent:"center",
            background:"#005FF9",color:"#fff",textDecoration:"none",
            fontWeight:700,fontSize:11,padding:"9px 2px",borderRadius:12,
            boxShadow:"0 0 10px rgba(0,95,249,.35)",
          }}>MAX</a>
        </div>

      </div>
    </>
  );
}