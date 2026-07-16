"use strict";(()=>{var e={};e.id=433,e.ids=[433],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5894:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>u,patchFetch:()=>m,requestAsyncStorage:()=>g,routeModule:()=>c,serverHooks:()=>f,staticGenerationAsyncStorage:()=>x});var r={};a.r(r),a.d(r,{POST:()=>l,dynamic:()=>d});var o=a(9303),i=a(8716),n=a(670),s=a(7070);let d="force-dynamic";function p(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")}async function l(e){let t;let a=process.env.RESEND_API_KEY;if(!a)return s.NextResponse.json({error:"RESEND_API_KEY not configured"},{status:500});try{t=await e.json()}catch{return s.NextResponse.json({error:"Invalid JSON"},{status:400})}let{type:r,to:o,name:i,clinicName:n,plano:d}=t;if(!o||!r)return s.NextResponse.json({error:"Missing to or type"},{status:400});if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(o)))return s.NextResponse.json({error:"Endere\xe7o de email inv\xe1lido"},{status:400});let l=process.env.APP_URL??"https://to-plataforma.vercel.app",c=p(i),g=p(n),x=p(d),f=c?c.split(" ")[0]:"terapeuta",u={welcome:{subject:`Bem-vindo(a) \xe0 T.O Plataforma, ${f}! 🎉`,html:`<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0D1526;color:#fff;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:32px 28px;text-align:center">
          <div style="font-size:28px;font-weight:900;letter-spacing:-1px">T.O Plataforma</div>
          <div style="font-size:13px;opacity:.8;margin-top:4px">Software para Terapia ABA</div>
        </div>
        <div style="padding:32px 28px">
          <h2 style="font-size:22px;font-weight:800;margin:0 0 12px">Ol\xe1, ${f}! 👋</h2>
          <p style="color:rgba(255,255,255,.75);line-height:1.6;margin:0 0 20px">Sua conta em <strong>${g||"sua cl\xednica"}</strong> foi criada com sucesso. Voc\xea tem <strong>14 dias gr\xe1tis</strong> para explorar tudo que o sistema oferece.</p>
          <div style="background:rgba(255,255,255,.06);border-radius:12px;padding:16px;margin-bottom:24px">
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:10px">O que voc\xea pode fazer agora</div>
            <div style="font-size:14px;color:rgba(255,255,255,.85);line-height:2">✅ Cadastrar pacientes e fam\xedlias<br>✅ Agendar sess\xf5es e atendimentos<br>✅ Registrar evolu\xe7\xf5es e avalia\xe7\xf5es<br>✅ Controle financeiro e contratos<br>✅ Relat\xf3rios e BI cl\xednico</div>
          </div>
          <a href="${l}" style="display:block;background:linear-gradient(135deg,#2563EB,#7C3AED);color:#fff;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">Acessar o sistema →</a>
        </div>
        <div style="padding:20px 28px;border-top:1px solid rgba(255,255,255,.08);font-size:12px;color:rgba(255,255,255,.4);text-align:center">T.O Plataforma \xb7 Suporte: suporte@vero.app</div>
      </div>`},trial_ending:{subject:`Seu trial acaba em 3 dias — garanta seu plano, ${f}`,html:`<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0D1526;color:#fff;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px 28px;text-align:center">
          <div style="font-size:28px;font-weight:900">⏰ 3 dias restantes</div>
          <div style="font-size:13px;opacity:.8;margin-top:4px">Seu trial gratuito est\xe1 acabando</div>
        </div>
        <div style="padding:32px 28px">
          <h2 style="font-size:20px;font-weight:800;margin:0 0 12px">N\xe3o perca o acesso ao sistema</h2>
          <p style="color:rgba(255,255,255,.75);line-height:1.6;margin:0 0 24px">Seu trial de 14 dias termina em breve. Para continuar acessando todos os recursos e dados de seus pacientes, escolha um plano.</p>
          <a href="${l}/#upgrade" style="display:block;background:linear-gradient(135deg,#2563EB,#7C3AED);color:#fff;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">Ver planos e pre\xe7os →</a>
        </div>
      </div>`},payment_confirmed:{subject:`Pagamento confirmado! Bem-vindo ao plano ${x} 🎊`,html:`<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0D1526;color:#fff;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#10b981,#2563EB);padding:32px 28px;text-align:center">
          <div style="font-size:48px">✅</div>
          <div style="font-size:22px;font-weight:900;margin-top:8px">Pagamento confirmado!</div>
        </div>
        <div style="padding:32px 28px">
          <p style="color:rgba(255,255,255,.75);line-height:1.6;margin:0 0 20px">Obrigado por assinar o plano <strong>${x}</strong>. Sua assinatura est\xe1 ativa e voc\xea tem acesso completo \xe0 plataforma.</p>
          <a href="${l}" style="display:block;background:linear-gradient(135deg,#10b981,#2563EB);color:#fff;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">Acessar o sistema →</a>
        </div>
      </div>`}}[String(r)];if(!u)return s.NextResponse.json({error:`Unknown email type: ${r}`},{status:400});try{let e=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${a}`,"Content-Type":"application/json"},body:JSON.stringify({from:"T.O Plataforma <noreply@vero.app>",to:[o],subject:u.subject,html:u.html})}),t=await e.json();if(!e.ok)throw Error(t.message??"Resend error");return s.NextResponse.json({ok:!0,id:t.id})}catch(t){let e=t instanceof Error?t.message:"Email error";return console.error("Email error:",e),s.NextResponse.json({error:e},{status:500})}}let c=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/email/route",pathname:"/api/email",filename:"route",bundlePath:"app/api/email/route"},resolvedPagePath:"C:\\Users\\compu\\OneDrive\\\xc1rea de Trabalho\\T.O_final\\app\\api\\email\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:g,staticGenerationAsyncStorage:x,serverHooks:f}=c,u="/api/email/route";function m(){return(0,n.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:x})}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[276,972],()=>a(5894));module.exports=r})();