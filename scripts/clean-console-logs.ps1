# Script para limpiar console.logs de desarrollo

# Archivos a limpiar
$files = @(
    "hooks/use-auth.ts",
    "hooks/use-subscription.ts",
    "hooks/use-settings.ts",
    "app/dashboard/page.tsx"
)

foreach ($file in $files) {
    $fullPath = "c:\Users\Home\Documents\GitHub\tv-store\$file"
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Remover líneas con console.log que contengan [useAuth], [useSubscription], [DashboardPage], [v0]
        $content = $content -replace ".*console\.log\('\[useAuth\].*\r?\n", ""
        $content = $content -replace ".*console\.log\('\[useSubscription\].*\r?\n", ""
        $content = $content -replace ".*console\.log\('\[DashboardPage\].*\r?\n", ""
        $content = $content -replace ".*console\.log\(`"\[v0\].*\r?\n", ""
        $content = $content -replace ".*console\.log\(\`\[v0\].*\r?\n", ""
        
        # Guardar archivo
        Set-Content -Path $fullPath -Value $content -NoNewline
        
        Write-Host "Limpiado: $file"
    }
}

Write-Host "`nConsole.logs de desarrollo eliminados exitosamente!"
