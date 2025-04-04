param(
    [Parameter(Position = 0)]
    [ValidateSet("encrypt", "decrypt")]
    [string]$Action
)

Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

$encrypt = if ([string]::IsNullOrEmpty($Action)) { 
    $false 
} elseif ($Action -eq "encrypt") { 
    $true 
} else { 
    $false 
}

$securePassword = Read-Host -AsSecureString -Prompt "Enter password for $($encrypt ? 'encryption' : 'decryption')"
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

try {
    if ($encrypt) {
        $password | openssl aes-256-cbc -a -salt -pbkdf2 -in ../.env.local -out ../.env.local.enc -pass stdin
    } else {
        $password | openssl aes-256-cbc -d -a -salt -pbkdf2 -in ../.env.local.enc -out ../.env.local -pass stdin
    }
} catch {
    Write-Error "Error occurred during $($encrypt ? 'encryption' : 'decryption'): $_"
    exit 1
} finally {
    $password = $null
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}