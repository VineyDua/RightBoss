# Get all TypeScript and TypeScript React files in the src directory
$sourceFiles = Get-ChildItem -Path src -Recurse -File -Include *.tsx,*.ts | 
    Where-Object { $_.DirectoryName -notlike "*node_modules*" } | 
    Select-Object -ExpandProperty FullName

# Create a hashtable to track imported files
$isImported = @{}
$importedBy = @{}

# Initialize the hashtables
foreach ($file in $sourceFiles) {
    $relativePath = $file.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $isImported[$relativePath] = $false
    $importedBy[$relativePath] = @()
}

# Analyze imports in each file
foreach ($file in $sourceFiles) {
    $content = Get-Content -Path $file -Raw
    $relativePath = $file.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    
    # Find import statements using regex
    $importMatches = [regex]::Matches($content, 'import\s+(?:[\w\s{},*]+\s+from\s+)?[''"]([^''"]+)[''"]')
    
    foreach ($match in $importMatches) {
        $importPath = $match.Groups[1].Value
        
        # Handle relative imports
        if ($importPath.StartsWith('.')) {
            $sourceDir = Split-Path -Parent $file
            $potentialImportPath = Join-Path $sourceDir $importPath
            
            # Try different extensions
            $extensions = @('.ts', '.tsx', '.js', '.jsx')
            $foundFile = $null
            
            foreach ($ext in $extensions) {
                $testPath = $potentialImportPath + $ext
                if (Test-Path $testPath) {
                    $foundFile = $testPath
                    break
                }
                
                # Check for index files
                $indexPath = Join-Path $potentialImportPath "index$ext"
                if (Test-Path $indexPath) {
                    $foundFile = $indexPath
                    break
                }
            }
            
            if ($foundFile) {
                $normalizedImportPath = $foundFile.Replace((Get-Location).Path + "\", "").Replace("\", "/")
                
                # Check if this is one of our source files
                if ($isImported.ContainsKey($normalizedImportPath)) {
                    $isImported[$normalizedImportPath] = $true
                    $importedBy[$normalizedImportPath] += $relativePath
                }
            }
        }
    }
    
    # Check for component references (this is a simplification)
    $filename = [System.IO.Path]::GetFileNameWithoutExtension($file)
    if ($filename -ne "index") {
        foreach ($otherFile in $sourceFiles) {
            if ($otherFile -ne $file) {
                $otherContent = Get-Content -Path $otherFile -Raw
                $otherRelativePath = $otherFile.Replace((Get-Location).Path + "\", "").Replace("\", "/")
                
                # Look for <ComponentName pattern
                if ($otherContent -match ("<" + [regex]::Escape($filename) + "[.\s>]")) {
                    $isImported[$relativePath] = $true
                    $importedBy[$relativePath] += $otherRelativePath
                }
            }
        }
    }
}

# Consider entry points as imported
@('src/App.tsx', 'src/main.tsx') | ForEach-Object {
    if ($isImported.ContainsKey($_)) {
        $isImported[$_] = $true
    }
}

# Mark special known files
@('src/App.tsx.final', 'src/App.tsx.example') | ForEach-Object {
    if ($isImported.ContainsKey($_)) {
        $isImported[$_] = $true
    }
}

# Find unused files
$unusedFiles = $isImported.Keys | Where-Object { $isImported[$_] -eq $false }

Write-Host "Unused files:"
$unusedFiles | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "Total unused files: $($unusedFiles.Count)"
Write-Host "Total source files: $($isImported.Keys.Count)" 