param(
    [string]$BaseUrl = "https://parkipal.com",
    [string]$Username = "testuser",
    [string]$Password = "TestPass123!"
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "[SMOKE] $msg" }

$api = "$BaseUrl/api"

Write-Step "Health check"
$health = Invoke-RestMethod -Method Get -Uri "$api/health"
Write-Host ($health | ConvertTo-Json -Depth 5)

Write-Step "Register (will skip on duplicate)"
$registerBody = @{ username=$Username; password=$Password; display_name=$Username } | ConvertTo-Json
try {
    $reg = Invoke-RestMethod -Method Post -Uri "$api/auth/register" -ContentType "application/json" -Body $registerBody
    Write-Host ("Registered user id: " + $reg.user.id)
} catch {
    Write-Host "Register likely failed due to existing user; continuing"
}

Write-Step "Login"
$loginBody = @{ username=$Username; password=$Password } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$api/auth/login" -ContentType "application/json" -Body $loginBody
$token = $login.token
Write-Host ("Token acquired (length): " + $token.Length)

$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

Write-Step "List symptoms"
$slist = Invoke-RestMethod -Method Get -Uri "$api/symptoms" -Headers $headers
Write-Host ("Symptoms count: " + $slist.Count)

Write-Step "Add symptom"
$sb = @{ tremor=1; bradykinesia=1; rigidity=1; gait=1; dyskinesia=0; sleep=5; mood=5; cognition=5; notes="smoke test" } | ConvertTo-Json
$sadd = Invoke-RestMethod -Method Post -Uri "$api/symptoms" -Headers $headers -Body $sb
Write-Host ("Added symptom id: " + $sadd.id)

Write-Step "Verify symptoms again"
$slist2 = Invoke-RestMethod -Method Get -Uri "$api/symptoms" -Headers $headers
Write-Host ("Symptoms count after add: " + $slist2.Count)

Write-Step "Done"
