1:"$Sreact.fragment"
3:I[67861,["/_next/static/chunks/5786c99dd67d8728.js","/_next/static/chunks/826b6e9e96cf5d20.js"],"default"]
4:I[39220,["/_next/static/chunks/5786c99dd67d8728.js","/_next/static/chunks/826b6e9e96cf5d20.js"],"default"]
5:I[34512,["/_next/static/chunks/0ac1bff4aa791b7d.js","/_next/static/chunks/717632e9bc7336ce.js","/_next/static/chunks/9450deb94d6c2f16.js"],"Analytics"]
6:I[57723,["/_next/static/chunks/0ac1bff4aa791b7d.js","/_next/static/chunks/717632e9bc7336ce.js","/_next/static/chunks/9450deb94d6c2f16.js"],"Toaster"]
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
            0:{"buildId":"a16OGmeIzBD7-zdB4LSGi","rsc":["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/chunks/8a80e7184ad3a13f.css","precedence":"next"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/chunks/101292b9c1ef83cc.css","precedence":"next"}],["$","script","script-0",{"src":"/_next/static/chunks/0ac1bff4aa791b7d.js","async":true}],["$","script","script-1",{"src":"/_next/static/chunks/717632e9bc7336ce.js","async":true}],["$","script","script-2",{"src":"/_next/static/chunks/9450deb94d6c2f16.js","async":true}]],["$","html",null,{"lang":"en","children":[["$","head",null,{"children":["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$2"}}]}],["$","body",null,{"className":"font-sans antialiased","children":[["$","$L3",null,{"parallelRouterKey":"children","template":["$","$L4",null,{}],"notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]]}],["$","$L5",null,{}],["$","$L6",null,{}]]}]]}]]}],"loading":null,"isPartial":false}
