# Copia las dependencias visuales al proyecto para que el navegador no consulte CDN.
$destination = Join-Path $PSScriptRoot '..\src\vendor'
New-Item -ItemType Directory -Force -Path $destination | Out-Null

# Se conserva la estructura que usan las URLs relativas de Font Awesome:
# /fontawesome/css/all.min.css -> /fontawesome/webfonts/*.woff2
$fontAwesomeDestination = Join-Path $destination 'fontawesome'
if (Test-Path -LiteralPath $fontAwesomeDestination) {
    Remove-Item -LiteralPath $fontAwesomeDestination -Recurse -Force
}
New-Item -ItemType Directory -Force -Path (Join-Path $fontAwesomeDestination 'css') | Out-Null
Copy-Item -Force 'node_modules\@fortawesome\fontawesome-free\css\*' (Join-Path $fontAwesomeDestination 'css')
Copy-Item -Recurse -Force 'node_modules\@fortawesome\fontawesome-free\webfonts' (Join-Path $destination 'fontawesome')

$interDestination = Join-Path $destination 'inter'
New-Item -ItemType Directory -Force -Path (Join-Path $interDestination 'files') | Out-Null
Copy-Item -Force 'node_modules\@fontsource\inter\latin-400.css' (Join-Path $interDestination 'inter.css')
Add-Content -Path (Join-Path $interDestination 'inter.css') -Value "`n"
Get-Content 'node_modules\@fontsource\inter\latin-700.css' | Add-Content -Path (Join-Path $interDestination 'inter.css')
Copy-Item -Force 'node_modules\@fontsource\inter\files\inter-latin-400-normal.woff2' (Join-Path $interDestination 'files')
Copy-Item -Force 'node_modules\@fontsource\inter\files\inter-latin-700-normal.woff2' (Join-Path $interDestination 'files')
Copy-Item -Force 'node_modules\@fontsource\inter\files\inter-latin-400-normal.woff' (Join-Path $interDestination 'files')
Copy-Item -Force 'node_modules\@fontsource\inter\files\inter-latin-700-normal.woff' (Join-Path $interDestination 'files')
