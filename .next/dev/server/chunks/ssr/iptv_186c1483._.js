module.exports = [
"[project]/iptv/app/actions/admin-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"406818131b6f3e4ce9e3d9d10335154be68436dde8":"createSubscription","40c088d894e31615d9e0988719ee5b15b073856c07":"createUser","40e2f6226fd60f4309c44cd8c2ebc1921b80368b36":"deleteUsers","60857e9a2208ac027c8b6bf46806efc59e148114e5":"updateUserPassword"},"",""] */ __turbopack_context__.s([
    "createSubscription",
    ()=>createSubscription,
    "createUser",
    ()=>createUser,
    "deleteUsers",
    ()=>deleteUsers,
    "updateUserPassword",
    ()=>updateUserPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/iptv/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$83$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/iptv/node_modules/.pnpm/@supabase+supabase-js@2.83.0/node_modules/@supabase/supabase-js/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/iptv/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/iptv/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function deleteUsers(userIds) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$83$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://eelxeotkfnfvjvwvaubc.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
        // Supabase admin deleteUser only takes one ID. We need to loop.
        const results = await Promise.all(userIds.map((id)=>supabase.auth.admin.deleteUser(id)));
        const errors = results.filter((r)=>r.error).map((r)=>r.error?.message);
        if (errors.length > 0) {
            return {
                success: false,
                error: `Errores al eliminar: ${errors.join(', ')}`
            };
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
        return {
            success: true
        };
    } catch (error) {
        return {
            success: false,
            error: 'Error interno del servidor'
        };
    }
}
async function updateUserPassword(userId, password) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$83$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://eelxeotkfnfvjvwvaubc.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: password
    });
    if (error) {
        return {
            success: false,
            error: error.message
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
    return {
        success: true
    };
}
async function createSubscription(data) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$83$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://eelxeotkfnfvjvwvaubc.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    // Calcular fechas (30 días por defecto)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 30);
    const { error } = await supabase.from('subscriptions').insert({
        user_id: data.user_id,
        plan_id: data.plan_id,
        plan_name: data.plan_name,
        price: parseFloat(data.price),
        status: 'active',
        next_billing_date: endDate.toISOString()
    });
    if (error) {
        return {
            success: false,
            error: error.message
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
    return {
        success: true
    };
}
async function createUser(data) {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return {
                success: false,
                error: "Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing"
            };
        }
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$83$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://eelxeotkfnfvjvwvaubc.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        // Validate input
        if (!data.email || !data.password) {
            return {
                success: false,
                error: "Email y contraseña son obligatorios"
            };
        }
        if (data.password.length < 6) {
            return {
                success: false,
                error: "La contraseña debe tener al menos 6 caracteres"
            };
        }
        // 1. Crear usuario en Auth
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
            error: `Auth Error: ${authError.message}`
        };
        if (!authUser.user) return {
            success: false,
            error: 'No se pudo crear el usuario (No user returned)'
        };
        // Force confirm email explicitly
        const { data: updateData, error: confirmError } = await supabase.auth.admin.updateUserById(authUser.user.id, {
            email_confirm: true
        });
        if (confirmError) {
            console.error('Error forcing email confirmation:', confirmError);
            return {
                success: false,
                error: `User created but email confirmation failed: ${confirmError.message}`
            };
        }
        // Verify confirmation stuck
        if (!updateData.user?.email_confirmed_at) {
            return {
                success: false,
                error: `User created but email_confirmed_at is still null. Update returned: ${JSON.stringify(updateData.user)}`
            };
        }
        const userId = authUser.user.id;
        // 2. Actualizar perfil
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            whatsapp: data.whatsapp,
            role: 'user'
        });
        if (profileError) {
            return {
                success: false,
                error: `Usuario creado pero error en perfil: ${profileError.message}`
            };
        }
        // 3. Crear suscripción si hay plan seleccionado
        if (data.plan_id) {
            // Calcular fecha de fin (30 días por defecto)
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 30);
            const { error: subError } = await supabase.from('subscriptions').insert({
                user_id: userId,
                plan_id: data.plan_id,
                plan_name: data.plan_name,
                price: parseFloat(data.price),
                status: 'active',
                next_billing_date: endDate.toISOString()
            });
            if (subError) console.error('Error creando suscripción:', subError);
        }
        // 4. Crear credenciales IPTV si se proporcionaron
        if (data.iptv_username && data.iptv_password) {
            const { error: credError } = await supabase.from('credentials').insert({
                user_id: userId,
                username: data.iptv_username,
                password: data.iptv_password
            });
            if (credError) console.error('Error creando credenciales:', credError);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/admin');
        return {
            success: true,
            userId
        };
    } catch (error) {
        console.error('Error en createUser:', error);
        return {
            success: false,
            error: 'Error interno del servidor al crear usuario'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    deleteUsers,
    updateUserPassword,
    createSubscription,
    createUser
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteUsers, "40e2f6226fd60f4309c44cd8c2ebc1921b80368b36", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateUserPassword, "60857e9a2208ac027c8b6bf46806efc59e148114e5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createSubscription, "406818131b6f3e4ce9e3d9d10335154be68436dde8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createUser, "40c088d894e31615d9e0988719ee5b15b073856c07", null);
}),
"[project]/iptv/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/iptv/app/actions/admin-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$app$2f$actions$2f$admin$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/iptv/app/actions/admin-actions.ts [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/iptv/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/iptv/app/actions/admin-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "406818131b6f3e4ce9e3d9d10335154be68436dde8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$app$2f$actions$2f$admin$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createSubscription"],
    "40c088d894e31615d9e0988719ee5b15b073856c07",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$app$2f$actions$2f$admin$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createUser"],
    "40e2f6226fd60f4309c44cd8c2ebc1921b80368b36",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$app$2f$actions$2f$admin$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteUsers"],
    "60857e9a2208ac027c8b6bf46806efc59e148114e5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$app$2f$actions$2f$admin$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateUserPassword"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$iptv$2f$app$2f$actions$2f$admin$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/iptv/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => "[project]/iptv/app/actions/admin-actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$iptv$2f$app$2f$actions$2f$admin$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/iptv/app/actions/admin-actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=iptv_186c1483._.js.map