[CmdletBinding(SupportsShouldProcess)]
param(
  [switch]$Force,
  [switch]$IncludeClaude
)

$ErrorActionPreference = "Stop"

$Repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$SkillBuckets = @(
  (Join-Path $Repo "skills\engineering"),
  (Join-Path $Repo "skills\productivity")
)

$Destinations = @((Join-Path $HOME ".agents\skills"))
if ($IncludeClaude) {
  $Destinations += (Join-Path $HOME ".claude\skills")
}

$BackupStamp = Get-Date -Format "yyyyMMdd-HHmmss"

$Skills = foreach ($Bucket in $SkillBuckets) {
  if (-not (Test-Path -LiteralPath $Bucket)) {
    continue
  }

  Get-ChildItem -LiteralPath $Bucket -Directory | Where-Object {
    Test-Path -LiteralPath (Join-Path $_.FullName "SKILL.md")
  }
}

foreach ($Destination in $Destinations) {
  New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  $HarnessRoot = Split-Path -Parent $Destination
  $BackupRoot = Join-Path $HarnessRoot ("skill-backups\" + $BackupStamp)

  foreach ($Skill in $Skills) {
    $Target = Join-Path $Destination $Skill.Name
    $Existing = Get-Item -LiteralPath $Target -Force -ErrorAction SilentlyContinue

    if ($Existing) {
      $ResolvedTarget = @($Existing.Target) -join ""
      if ($Existing.LinkType -eq "Junction" -and $ResolvedTarget -eq $Skill.FullName) {
        Write-Host "already linked $($Skill.Name) -> $($Skill.FullName)"
        continue
      }

      if (-not $Force) {
        Write-Warning "$Target already exists and does not point to this fork. Re-run with -Force to replace it."
        continue
      }

      if ($Existing.LinkType -in @("Junction", "SymbolicLink")) {
        if ($PSCmdlet.ShouldProcess($Target, "remove existing link")) {
          Remove-Item -LiteralPath $Target -Force
        }
      } else {
        $BackupTarget = Join-Path $BackupRoot $Skill.Name
        if ($PSCmdlet.ShouldProcess($Target, "move existing skill directory to $BackupTarget")) {
          New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
          Move-Item -LiteralPath $Target -Destination $BackupTarget
        }
      }
    }

    if ($PSCmdlet.ShouldProcess($Target, "create junction to $($Skill.FullName)")) {
      New-Item -ItemType Junction -Path $Target -Target $Skill.FullName | Out-Null
      Write-Host "linked $($Skill.Name) -> $($Skill.FullName)"
    }
  }
}
