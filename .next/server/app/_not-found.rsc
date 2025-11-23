1:"$Sreact.fragment"
3:I[67861,["/_next/static/chunks/488e611e30d37157.js","/_next/static/chunks/9450deb94d6c2f16.js","/_next/static/chunks/826b6e9e96cf5d20.js","/_next/static/chunks/717632e9bc7336ce.js"],"default"]
4:I[39220,["/_next/static/chunks/488e611e30d37157.js","/_next/static/chunks/9450deb94d6c2f16.js","/_next/static/chunks/826b6e9e96cf5d20.js","/_next/static/chunks/717632e9bc7336ce.js"],"default"]
5:I[34512,["/_next/static/chunks/488e611e30d37157.js","/_next/static/chunks/9450deb94d6c2f16.js","/_next/static/chunks/826b6e9e96cf5d20.js","/_next/static/chunks/717632e9bc7336ce.js"],"Analytics"]
6:I[57723,["/_next/static/chunks/488e611e30d37157.js","/_next/static/chunks/9450deb94d6c2f16.js","/_next/static/chunks/826b6e9e96cf5d20.js","/_next/static/chunks/717632e9bc7336ce.js"],"Toaster"]
b:I[8160,["/_next/static/chunks/488e611e30d37157.js","/_next/static/chunks/9450deb94d6c2f16.js","/_next/static/chunks/826b6e9e96cf5d20.js","/_next/static/chunks/717632e9bc7336ce.js"],"default"]
:HL["/_next/static/chunks/8a80e7184ad3a13f.css","style"]
:HL["/_next/static/chunks/101292b9c1ef83cc.css","style"]
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
            0:{"P":null,"b":"a16OGmeIzBD7-zdB4LSGi","c":["","_not-found"],"q":"","i":false,"f":[[["",{"children":["/_not-found",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/chunks/8a80e7184ad3a13f.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/chunks/101292b9c1ef83cc.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","script","script-0",{"src":"/_next/static/chunks/488e611e30d37157.js","async":true,"nonce":"$undefined"}],["$","script","script-1",{"src":"/_next/static/chunks/9450deb94d6c2f16.js","async":true,"nonce":"$undefined"}],["$","script","script-2",{"src":"/_next/static/chunks/826b6e9e96cf5d20.js","async":true,"nonce":"$undefined"}],["$","script","script-3",{"src":"/_next/static/chunks/717632e9bc7336ce.js","async":true,"nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":[["$","head",null,{"children":["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$2"}}]}],["$","body",null,{"className":"font-sans antialiased","children":[["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L5",null,{}],["$","$L6",null,{}]]}]]}]]}],{"children":[["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["$","$1","c",{"children":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":"$0:f:0:1:0:props:children:1:props:children:1:props:children:0:props:notFound:0:1:props:style","children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],"$L7","$L8"]}]}]],null,"$L9"]}],{},null,false,false]},null,false,false]},null,false,false],"$La",false]],"m":"$undefined","G":["$b","$undefined"],"s":false,"S":true}
c:I[30946,["/_next/static/chunks/488e611e30d37157.js","/_next/static/chunks/9450deb94d6c2f16.js","/_next/static/chunks/826b6e9e96cf5d20.js","/_next/static/chunks/717632e9bc7336ce.js"],"OutletBoundary"]
d:"$Sreact.suspense"
f:I[30946,["/_next/static/chunks/488e611e30d37157.js","/_next/static/chunks/9450deb94d6c2f16.js","/_next/static/chunks/826b6e9e96cf5d20.js","/_next/static/chunks/717632e9bc7336ce.js"],"ViewportBoundary"]
11:I[30946,["/_next/static/chunks/488e611e30d37157.js","/_next/static/chunks/9450deb94d6c2f16.js","/_next/static/chunks/826b6e9e96cf5d20.js","/_next/static/chunks/717632e9bc7336ce.js"],"MetadataBoundary"]
7:["$","h1",null,{"className":"next-error-h1","style":"$0:f:0:1:0:props:children:1:props:children:1:props:children:0:props:notFound:0:1:props:children:props:children:1:props:style","children":404}]
8:["$","div",null,{"style":"$0:f:0:1:0:props:children:1:props:children:1:props:children:0:props:notFound:0:1:props:children:props:children:2:props:style","children":["$","h2",null,{"style":"$0:f:0:1:0:props:children:1:props:children:1:props:children:0:props:notFound:0:1:props:children:props:children:2:props:children:props:style","children":"This page could not be found."}]}]
9:["$","$Lc",null,{"children":["$","$d",null,{"name":"Next.MetadataOutlet","children":"$@e"}]}]
a:["$","$1","h",{"children":[["$","meta",null,{"name":"robots","content":"noindex"}],["$","$Lf",null,{"children":"$@10"}],["$","div",null,{"hidden":true,"children":["$","$L11",null,{"children":["$","$d",null,{"name":"Next.Metadata","children":"$@12"}]}]}],["$","meta",null,{"name":"next-size-adjust","content":""}]]}]
10:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
12:[["$","title","0",{"children":"MaxPlayer IPTV Dashboard"}],["$","meta","1",{"name":"description","content":"Gestiona tu suscripción de IPTV"}],["$","meta","2",{"name":"generator","content":"v0.app"}]]
e:null
