module.exports = [
"[project]/iptv/app/actions/auth-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a15500937badc253a416b685bb0c413bf92444d8":"registerUser"},"",""] */ __turbopack_context__.s([
    "registerUser",
    ()=>registerUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/iptv/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$83$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/iptv/node_modules/.pnpm/@supabase+supabase-js@2.83.0/node_modules/@supabase/supabase-js/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/iptv/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function registerUser(data) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$83$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://eelxeotkfnfvjvwvaubc.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        // 1. Crear usuario en Auth con auto-confirmación
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
                first_name: data.first_name,
                last_name: data.last_name,
                full_name: `${data.first_name} ${data.last_name}`.trim()
            }
        });
        if (authError) return {
            success: false,
            error: authError.message
        };
        if (!authUser.user) return {
            success: false,
            error: 'No se pudo crear el usuario'
        };
        // Force confirm email explicitly
        await supabase.auth.admin.updateUserById(authUser.user.id, {
            email_confirm: true
        });
        // 2. Crear perfil
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: authUser.user.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            whatsapp: data.whatsapp,
            role: 'user'
        });
        if (profileError) {
            console.error('Error creando perfil:', profileError);
        }
        return {
            success: true
        };
    } catch (error) {
        console.error('Error en registerUser:', error);
        return {
            success: false,
            error: 'Error interno del servidor'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    registerUser
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(registerUser, "40a15500937badc253a416b685bb0c413bf92444d8", null);
}),
"[project]/iptv/.next-internal/server/app/auth/sign-up/page/actions.js { ACTIONS_MODULE0 => \"[project]/iptv/app/actions/auth-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$app$2f$actions$2f$auth$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/iptv/app/actions/auth-actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/iptv/.next-internal/server/app/auth/sign-up/page/actions.js { ACTIONS_MODULE0 => \"[project]/iptv/app/actions/auth-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40a15500937badc253a416b685bb0c413bf92444d8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$app$2f$actions$2f$auth$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerUser"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f2e$next$2d$internal$2f$server$2f$app$2f$auth$2f$sign$2d$up$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$iptv$2f$app$2f$actions$2f$auth$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/iptv/.next-internal/server/app/auth/sign-up/page/actions.js { ACTIONS_MODULE0 => "[project]/iptv/app/actions/auth-actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$app$2f$actions$2f$auth$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/iptv/app/actions/auth-actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=iptv_3fe4ae98._.js.map