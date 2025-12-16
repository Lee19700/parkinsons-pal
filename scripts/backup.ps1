# Requires: PowerShell 5.1+, OpenSSL in PATH (optional), 7zip (optional)
# Purpose: Dump DB, encrypt, upload to NAS share and/or private GitHub repo

param(
    [string]$DbUrl = $env:DB_URL,
    [string]$DbType = $env:DB_TYPE, # postgres|sqlite
    [string]$BackupDir = $env:BACKUP_DIR, # local temp dir
    [string]$NasPath = $env:NAS_PATH,     # e.g. \\192.168.0.48\backups\parkipal
    [string]$EncKeyFile = $env:ENC_KEY_FILE, # path to encryption key file
    [string]$GitRepoDir = $env:GIT_REPO_DIR # optional local clone of private backup repo
)

function Ensure-Dir($path) {
    if (-not (Test-Path -Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupName = "db_${timestamp}"
Ensure-Dir $BackupDir

$dumpFile = Join-Path $BackupDir "$backupName.sql"
$encFile  = Join-Path $BackupDir "$backupName.enc"
$shaFile  = Join-Path $BackupDir "$backupName.sha256"

Write-Host "Starting backup: $backupName"

if ($DbType -eq 'postgres') {
    # Requires pg_dump in PATH; DB_URL like postgres://user:pass@host:port/dbname
    $env:PGPASSWORD = ([System.Uri]$DbUrl).UserInfo.Split(':')[1]
    $pgUser = ([System.Uri]$DbUrl).UserInfo.Split(':')[0]
    $pgHost = ([System.Uri]$DbUrl).Host
    $pgPort = ([System.Uri]$DbUrl).Port
    $pgDb   = ([System.Uri]$DbUrl).AbsolutePath.Trim('/')

    & pg_dump -h $pgHost -p $pgPort -U $pgUser -d $pgDb -Fc -f $dumpFile
}
elseif ($DbType -eq 'sqlite') {
    # For SQLite, copy the DB file and dump schema
    $dbPath = $DbUrl  # use file path
    Copy-Item -Path $dbPath -Destination $dumpFile
}
else {
    Write-Error "Unknown DB_TYPE: $DbType"; exit 1
}

if (-not (Test-Path $EncKeyFile)) { Write-Error "Encryption key not found: $EncKeyFile"; exit 1 }

# Encrypt with OpenSSL AES-256-CBC
& openssl enc -aes-256-cbc -salt -in $dumpFile -out $encFile -pass file:$EncKeyFile

# Checksum
(Get-FileHash -Algorithm SHA256 $encFile).Hash | Set-Content -Path $shaFile

# Upload to NAS
if ($NasPath) {
    Ensure-Dir $NasPath
    Copy-Item -Path $encFile -Destination $NasPath
    Copy-Item -Path $shaFile -Destination $NasPath
}

# Optional: commit to private Git repo clone
if ($GitRepoDir) {
    Ensure-Dir $GitRepoDir
    Copy-Item -Path $encFile -Destination (Join-Path $GitRepoDir (Split-Path $encFile -Leaf))
    Push-Location $GitRepoDir
    git add .
    git commit -m "backup: $backupName"
    git push
    Pop-Location
}

Write-Host "Backup complete: $backupName"
