1:"$Sreact.fragment"
3:I[67861,["/_next/static/chunks/5786c99dd67d8728.js","/_next/static/chunks/826b6e9e96cf5d20.js"],"default"]
4:I[39220,["/_next/static/chunks/5786c99dd67d8728.js","/_next/static/chunks/826b6e9e96cf5d20.js"],"default"]
5:I[34512,["/_next/static/chunks/0ac1bff4aa791b7d.js","/_next/static/chunks/717632e9bc7336ce.js","/_next/static/chunks/9450deb94d6c2f16.js"],"Analytics"]
6:I[57723,["/_next/static/chunks/0ac1bff4aa791b7d.js","/_next/static/chunks/717632e9bc7336ce.js","/_next/static/chunks/9450deb94d6c2f16.js"],"Toaster"]
7:I[24888,["/_next/static/chunks/5786c99dd67d8728.js","/_next/static/chunks/826b6e9e96cf5d20.js"],"ClientPageRoot"]
8:I[64463,["/_next/static/chunks/0ac1bff4aa791b7d.js","/_next/static/chunks/717632e9bc7336ce.js","/_next/static/chunks/9450deb94d6c2f16.js","/_next/static/chunks/57ceb45f3c366c4a.js"],"default"]
b:I[30946,["/_next/static/chunks/5786c99dd67d8728.js","/_next/static/chunks/826b6e9e96cf5d20.js"],"OutletBoundary"]
c:"$Sreact.suspense"
f:I[8160,["/_next/static/chunks/5786c99dd67d8728.js","/_next/static/chunks/826b6e9e96cf5d20.js"],"default"]
:HL["/_next/static/chunks/8a80e7184ad3a13f.css","style"]
:HL["/_next/static/chunks/101292b9c1ef83cc.css","style"]
:HL["/_next/static/media/797e433ab948586e-s.p.dbea232f.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/media/caa3a2e1cccd8315-s.p.853070df.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
2:T460,
              // Suprimir error de ResizeObserver
              const debounce = (fn, delay) => {
                let timeoutId;
                return (...args) => {
                  clearTimeout(timeoutId);
                  timeoutId = setTimeout(() => fn(...args), delay);
                };
              };

              window.addEventListener('error', (e) => {
                if (e.message && (
                  e.message.includes('ResizeObserver') ||
                  e.message === 'ResizeObserver loop completed with undelivered notifications.'
                )) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  return false;
                }
              });

              // También interceptar a nivel de consola
              const originalError = console.error;
              console.error = function(...args) {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
                  return;
                }
                originalError.apply(console, args);
              };
            0:{"P":null,"b":"a16OGmeIzBD7-zdB4LSGi","c":["","auth","sign-up"],"q":"","i":false,"f":[[["",{"children":["auth",{"children":["sign-up",{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/chunks/8a80e7184ad3a13f.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/chunks/101292b9c1ef83cc.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","script","script-0",{"src":"/_next/static/chunks/0ac1bff4aa791b7d.js","async":true,"nonce":"$undefined"}],["$","script","script-1",{"src":"/_next/static/chunks/717632e9bc7336ce.js","async":true,"nonce":"$undefined"}],["$","script","script-2",{"src":"/_next/static/chunks/9450deb94d6c2f16.js","async":true,"nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":[["$","head",null,{"children":["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$2"}}]}],["$","body",null,{"className":"font-sans antialiased","children":[["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L5",null,{}],["$","$L6",null,{}]]}]]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[["$","$L7",null,{"Component":"$8","serverProvidedParams":{"searchParams":{},"params":{},"promises":["$@9","$@a"]}}],[["$","script","script-0",{"src":"/_next/static/chunks/57ceb45f3c366c4a.js","async":true,"nonce":"$undefined"}]],["$","$Lb",null,{"children":["$","$c",null,{"name":"Next.MetadataOutlet","children":"$@d"}]}]]}],{},null,false,false]},null,false,false]},null,false,false]},null,false,false],"$Le",false]],"m":"$undefined","G":["$f",[]],"s":false,"S":true}
10:I[30946,["/_next/static/chunks/5786c99dd67d8728.js","/_next/static/chunks/826b6e9e96cf5d20.js"],"ViewportBoundary"]
12:I[30946,["/_next/static/chunks/5786c99dd67d8728.js","/_next/static/chunks/826b6e9e96cf5d20.js"],"MetadataBoundary"]
e:["$","$1","h",{"children":[null,["$","$L10",null,{"children":"$@11"}],["$","div",null,{"hidden":true,"children":["$","$L12",null,{"children":["$","$c",null,{"name":"Next.Metadata","children":"$@13"}]}]}],["$","meta",null,{"name":"next-size-adjust","content":""}]]}]
9:{}
a:"$0:f:0:1:1:children:1:children:1:children:0:props:children:0:props:serverProvidedParams:params"
11:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
13:[["$","title","0",{"children":"MaxPlayer IPTV Dashboard"}],["$","meta","1",{"name":"description","content":"Gestiona tu suscripción de IPTV"}],["$","meta","2",{"name":"generator","content":"v0.app"}]]
d:null
