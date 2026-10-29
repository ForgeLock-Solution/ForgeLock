# Mantiene compatibilidad con la entrada PowerShell usando el creador multiplataforma.
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Push-Location $root
try {
    node ./scripts/create-dist.mjs
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar dist/.' }
}
finally {
    Pop-Location
}
