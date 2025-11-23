module.exports=[81066,a=>{a.v({className:"geist_a7695b8e-module__Entzca__className"})},94064,a=>{a.v({className:"geist_mono_354fc78-module__zrY5Sa__className"})},1541,a=>{"use strict";let b=(0,a.i(7937).registerClientReference)(function(){throw Error("Attempted to call Analytics() from the server but Analytics is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/iptv/node_modules/.pnpm/@vercel+analytics@1.5.0_nex_fd1c62a01a88d101918d2ba8c2873e44/node_modules/@vercel/analytics/dist/next/index.mjs <module evaluation>","Analytics");a.s(["Analytics",0,b])},44939,a=>{"use strict";let b=(0,a.i(7937).registerClientReference)(function(){throw Error("Attempted to call Analytics() from the server but Analytics is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/iptv/node_modules/.pnpm/@vercel+analytics@1.5.0_nex_fd1c62a01a88d101918d2ba8c2873e44/node_modules/@vercel/analytics/dist/next/index.mjs","Analytics");a.s(["Analytics",0,b])},74219,a=>{"use strict";a.i(1541);var b=a.i(44939);a.n(b)},85157,a=>{"use strict";let b=(0,a.i(7937).registerClientReference)(function(){throw Error("Attempted to call Toaster() from the server but Toaster is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/iptv/components/ui/toaster.tsx <module evaluation>","Toaster");a.s(["Toaster",0,b])},66811,a=>{"use strict";let b=(0,a.i(7937).registerClientReference)(function(){throw Error("Attempted to call Toaster() from the server but Toaster is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/iptv/components/ui/toaster.tsx","Toaster");a.s(["Toaster",0,b])},91710,a=>{"use strict";a.i(85157);var b=a.i(66811);a.n(b)},1604,a=>{"use strict";var b=a.i(99405),c=a.i(81066);let d={className:c.default.className,style:{fontFamily:"'Geist', 'Geist Fallback'",fontStyle:"normal"}};null!=c.default.variable&&(d.variable=c.default.variable);var e=a.i(94064);let f={className:e.default.className,style:{fontFamily:"'Geist Mono', 'Geist Mono Fallback'",fontStyle:"normal"}};null!=e.default.variable&&(f.variable=e.default.variable);var g=a.i(74219),h=a.i(91710);function i({children:a}){return(0,b.jsxs)("html",{lang:"en",children:[(0,b.jsx)("head",{children:(0,b.jsx)("script",{dangerouslySetInnerHTML:{__html:`
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

              // Tambi\xe9n interceptar a nivel de consola
              const originalError = console.error;
              console.error = function(...args) {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
                  return;
                }
                originalError.apply(console, args);
              };
            `}})}),(0,b.jsxs)("body",{className:"font-sans antialiased",children:[a,(0,b.jsx)(g.Analytics,{}),(0,b.jsx)(h.Toaster,{})]})]})}a.s(["default",()=>i,"metadata",0,{title:"MaxPlayer IPTV Dashboard",description:"Gestiona tu suscripción de IPTV",generator:"v0.app"}],1604)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__aae9ab99._.js.map