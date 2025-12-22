#!/usr/bin/env pwsh
# Parkipal Railway Deployment Test Suite
# Run this after deploying to Railway to verify everything works

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayDomain,
    
    [string]$TestUsername = "railwaytest_$(Get-Random -Minimum 1000 -Maximum 9999)",
    [string]$TestPassword = "RailwayTest@12345"
)

# Color utilities
function Write-Success { param([string]$msg); Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error_ { param([string]$msg); Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param([string]$msg); Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Header { param([string]$msg); Write-Host "`n════════════════════════════════════════" -ForegroundColor Yellow; Write-Host "   $msg" -ForegroundColor Yellow; Write-Host "════════════════════════════════════════`n" -ForegroundColor Yellow }

$baseUrl = "https://$RailwayDomain"
$api = "$baseUrl/api"
$testsPassed = 0
$testsFailed = 0
$token = ""
$userId = ""

Write-Host "🚀 Parkipal Railway Deployment Test Suite`n" -ForegroundColor Cyan
Write-Info "Target: $baseUrl"
Write-Info "Test User: $TestUsername"

# ==================== TEST 1: Health Check ====================
Write-Header "TEST 1: Health Check"

try {
    $health = Invoke-RestMethod -Method Get -Uri "$api/health" -UseBasicParsing -ErrorAction Stop
    Write-Success "Backend is responding"
    Write-Info "Status: $($health.status)"
    Write-Info "Timestamp: $($health.timestamp)"
    $testsPassed++
} catch {
    Write-Error_ "Health check failed: $($_.Exception.Message)"
    $testsFailed++
    exit 1
}

# ==================== TEST 2: User Registration ====================
Write-Header "TEST 2: User Registration"

try {
    $registerBody = @{
        username = $TestUsername
        password = $TestPassword
        display_name = "Railway Test User"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Method Post -Uri "$api/auth/register" -ContentType "application/json" -Body $registerBody -UseBasicParsing -ErrorAction Stop
    
    if ($response.user.id) {
        $userId = $response.user.id
        $token = $response.token
        Write-Success "User registered successfully"
        Write-Info "User ID: $userId"
        Write-Info "Token acquired (length): $($token.Length) chars"
        $testsPassed++
    } else {
        Write-Error_ "Registration returned but no user ID"
        $testsFailed++
    }
} catch {
    Write-Error_ "Registration failed: $($_.Exception.Message)"
    $testsFailed++
}

# ==================== TEST 3: User Login ====================
Write-Header "TEST 3: User Login"

try {
    $loginBody = @{
        username = $TestUsername
        password = $TestPassword
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Method Post -Uri "$api/auth/login" -ContentType "application/json" -Body $loginBody -UseBasicParsing -ErrorAction Stop
    
    if ($response.token) {
        $token = $response.token
        Write-Success "Login successful"
        Write-Info "Token: $($response.token.Substring(0, 20))..."
        $testsPassed++
    } else {
        Write-Error_ "Login returned but no token"
        $testsFailed++
    }
} catch {
    Write-Error_ "Login failed: $($_.Exception.Message)"
    $testsFailed++
}

# ==================== TEST 4: Add Medication ====================
Write-Header "TEST 4: Add Medication"

try {
    $headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
    $medBody = @{
        name = "Levodopa"
        dosage = "250mg"
        times = "8am,2pm,8pm"
        stock = 60
        notes = "Test medication from Railway deployment"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Method Post -Uri "$api/medications" -Headers $headers -Body $medBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    
    if ($response.id -or $response.ok) {
        Write-Success "Medication added successfully"
        Write-Info "Response: $($response | ConvertTo-Json -Depth 2)"
        $testsPassed++
    } else {
        Write-Error_ "Medication creation returned unexpected response"
        $testsFailed++
    }
} catch {
    Write-Error_ "Add medication failed: $($_.Exception.Message)"
    $testsFailed++
}

# ==================== TEST 5: List Medications ====================
Write-Header "TEST 5: List Medications"

try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $response = Invoke-RestMethod -Method Get -Uri "$api/medications" -Headers $headers -UseBasicParsing -ErrorAction Stop
    
    if ($response -is [array] -or $response.Count -ge 0) {
        Write-Success "Medications retrieved successfully"
        Write-Info "Medication count: $($response.Count)"
        if ($response.Count -gt 0) {
            Write-Info "First medication: $($response[0].name)"
        }
        $testsPassed++
    } else {
        Write-Error_ "Invalid medications response"
        $testsFailed++
    }
} catch {
    Write-Error_ "List medications failed: $($_.Exception.Message)"
    $testsFailed++
}

# ==================== TEST 6: Add Symptom Log ====================
Write-Header "TEST 6: Add Symptom Log"

try {
    $headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
    $symptomBody = @{
        tremor = 2
        bradykinesia = 1
        rigidity = 1
        gait = 2
        dyskinesia = 0
        sleep = 4
        mood = 4
        cognition = 4
        notes = "Test symptom log from Railway deployment"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Method Post -Uri "$api/symptoms" -Headers $headers -Body $symptomBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    
    if ($response.id -or $response.ok) {
        Write-Success "Symptom log added successfully"
        Write-Info "Response: $($response | ConvertTo-Json -Depth 2)"
        $testsPassed++
    } else {
        Write-Error_ "Symptom log returned unexpected response"
        $testsFailed++
    }
} catch {
    Write-Error_ "Add symptom log failed: $($_.Exception.Message)"
    $testsFailed++
}

# ==================== TEST 7: List Symptoms ====================
Write-Header "TEST 7: List Symptoms"

try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $response = Invoke-RestMethod -Method Get -Uri "$api/symptoms" -Headers $headers -UseBasicParsing -ErrorAction Stop
    
    if ($response -is [array] -or $response.Count -ge 0) {
        Write-Success "Symptoms retrieved successfully"
        Write-Info "Symptom count: $($response.Count)"
        if ($response.Count -gt 0) {
            Write-Info "Latest symptom: tremor=$($response[0].tremor), mood=$($response[0].mood)"
        }
        $testsPassed++
    } else {
        Write-Error_ "Invalid symptoms response"
        $testsFailed++
    }
} catch {
    Write-Error_ "List symptoms failed: $($_.Exception.Message)"
    $testsFailed++
}

# ==================== TEST 8: Add Vital Signs ====================
Write-Header "TEST 8: Add Vital Signs"

try {
    $headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
    $vitalBody = @{
        systolic = 120
        diastolic = 80
        heart_rate = 72
        temperature = 98.6
        oxygen = 98
        respiratory_rate = 16
        consciousness = "alert"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Method Post -Uri "$api/vitals" -Headers $headers -Body $vitalBody -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    
    if ($response.id -or $response.ok) {
        Write-Success "Vital signs added successfully"
        Write-Info "Response: $($response | ConvertTo-Json -Depth 2)"
        $testsPassed++
    } else {
        Write-Error_ "Vitals returned unexpected response"
        $testsFailed++
    }
} catch {
    Write-Error_ "Add vitals failed: $($_.Exception.Message)"
    $testsFailed++
}

# ==================== TEST 9: List Vitals ====================
Write-Header "TEST 9: List Vitals"

try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $response = Invoke-RestMethod -Method Get -Uri "$api/vitals" -Headers $headers -UseBasicParsing -ErrorAction Stop
    
    if ($response -is [array] -or $response.Count -ge 0) {
        Write-Success "Vitals retrieved successfully"
        Write-Info "Vital count: $($response.Count)"
        if ($response.Count -gt 0) {
            Write-Info "Latest vitals: BP=$($response[0].systolic)/$($response[0].diastolic), HR=$($response[0].heart_rate)"
        }
        $testsPassed++
    } else {
        Write-Error_ "Invalid vitals response"
        $testsFailed++
    }
} catch {
    Write-Error_ "List vitals failed: $($_.Exception.Message)"
    $testsFailed++
}

# ==================== TEST 10: Data Persistence ====================
Write-Header "TEST 10: Data Persistence Check"

try {
    # Log out and log back in
    Write-Info "Logging out and back in to test session..."
    
    # Wait a moment
    Start-Sleep -Seconds 2
    
    # Login again
    $loginBody = @{
        username = $TestUsername
        password = $TestPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Method Post -Uri "$api/auth/login" -ContentType "application/json" -Body $loginBody -UseBasicParsing -ErrorAction Stop
    $newToken = $loginResponse.token
    
    # Fetch medications with new session
    $headers = @{ "Authorization" = "Bearer $newToken" }
    $medsResponse = Invoke-RestMethod -Method Get -Uri "$api/medications" -Headers $headers -UseBasicParsing -ErrorAction Stop
    
    if ($medsResponse.Count -gt 0) {
        Write-Success "Data persisted across sessions!"
        Write-Info "Medications still exist: $($medsResponse.Count)"
        $testsPassed++
    } else {
        Write-Error_ "Data was lost after logout/login"
        $testsFailed++
    }
} catch {
    Write-Error_ "Data persistence test failed: $($_.Exception.Message)"
    $testsFailed++
}

# ==================== SUMMARY ====================
Write-Header "TEST SUMMARY"

$totalTests = $testsPassed + $testsFailed
Write-Info "Total Tests: $totalTests"
Write-Success "Passed: $testsPassed"
if ($testsFailed -gt 0) {
    Write-Error_ "Failed: $testsFailed"
} else {
    Write-Success "Failed: $testsFailed"
}

if ($testsFailed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! Your Parkipal deployment is working perfectly!`n" -ForegroundColor Green -BackgroundColor Black
    exit 0
} else {
    Write-Host "`n⚠️  Some tests failed. Check Railway logs for errors.`n" -ForegroundColor Yellow
    exit 1
}
