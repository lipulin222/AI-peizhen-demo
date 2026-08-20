$client = New-Object System.Net.WebClient
$js = $client.DownloadString('http://127.0.0.1:8000/script.js')
if ($js -match '一次性显示完整内容') { Write-Host "[OK] script.js 流式输出已取消" } else { Write-Host "[FAIL] script.js 未修改" }

$css = $client.DownloadString('http://127.0.0.1:8000/styles.css')
if ($css -match 'height: 720px') { Write-Host "[OK] 弹框高度已固定为 720px" } else { Write-Host "[FAIL] 弹框高度未固定" }
if ($css -match 'min-height: 64px') { Write-Host "[OK] AI 方案页头部已抬高（min-height: 64px）" } else { Write-Host "[FAIL] AI 方案页头部样式未修改" }

$html = $client.DownloadString('http://127.0.0.1:8000/index.html')
if ($html -notmatch 'id="aiPlanClose"') { Write-Host "[OK] HTML 中 aiPlanClose 按钮已移除" } else { Write-Host "[FAIL] aiPlanClose 按钮未移除" }
