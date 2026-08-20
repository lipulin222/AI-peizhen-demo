# 简易静态文件 HTTP 服务器（纯 PowerShell，无需 Python/Node）
# 用法: powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 8765]

param(
    [int]$Port = 8765
)

$Root = $PSScriptRoot

Add-Type -AssemblyName System.Web

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  本地服务器已启动" -ForegroundColor Green
Write-Host "  地址: http://localhost:$Port/" -ForegroundColor Yellow
Write-Host "  目录: $Root" -ForegroundColor Gray
Write-Host "  按 Ctrl+C 停止" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.AbsolutePath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }

        $filePath = [System.IO.Path]::Combine($Root, $urlPath.TrimStart("/"))
        # 处理中文文件名：路径本身已经是正确的字符串
        $filePath = [System.Web.HttpUtility]::UrlDecode($filePath)

        if (Test-Path -LiteralPath $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = [System.Web.MimeMapping]::GetMimeMapping($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[200] $($request.HttpMethod) $urlPath" -ForegroundColor Green
        }
        else {
            $response.StatusCode = 404
            $body = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>$urlPath</p>")
            $response.ContentLength64 = $body.Length
            $response.OutputStream.Write($body, 0, $body.Length)
            Write-Host "[404] $($request.HttpMethod) $urlPath" -ForegroundColor Red
        }

        $response.Close()
    }
}
finally {
    $listener.Stop()
    Write-Host "服务器已停止" -ForegroundColor Yellow
}
