# OJT E-commerce Lambda Deployment Script
# Usage:
#    powershell -ExecutionPolicy Bypass -File deploy.ps1 -SkipLayer
#   .\deploy.ps1              # Deploy full (layer + all modules)
#   .\deploy.ps1 -SkipLayer   # Deploy modules only (skip layer)
#   .\deploy.ps1 -BuildOnly   # Build only (no deploy)
#   .\deploy.ps1 -Module auth # Deploy specific module
#   .\deploy.ps1 -LayerOnly   # Deploy layer only
#   .\deploy.ps1 -Help        # Show help

param(
    [switch]$SkipLayer,
    [switch]$BuildOnly,
    [switch]$LayerOnly,
    [string]$Module = "",
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Color($text, $color) {
    Write-Host $text -ForegroundColor $color
}

function Show-Help {
    Write-Host ""
    Write-Color "OJT E-commerce Lambda Deployment" "Cyan"
    Write-Host "=================================="
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  (no options)     Deploy full (layer + all modules)"
    Write-Host "  -SkipLayer       Deploy modules only, skip layer"
    Write-Host "  -BuildOnly       Build ZIP files only, no deploy"
    Write-Host "  -LayerOnly       Deploy layer only"
    Write-Host "  -Module <name>   Deploy specific module"
    Write-Host "                   (auth, products, cart, orders, etc.)"
    Write-Host "  -Help            Show this help"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1                    # Full deploy"
    Write-Host "  .\deploy.ps1 -SkipLayer         # Modules only"
    Write-Host "  .\deploy.ps1 -Module auth       # Auth module only"
    Write-Host "  .\deploy.ps1 -BuildOnly         # Build only"
    Write-Host "  .\deploy.ps1 -Module auth -BuildOnly  # Build auth only"
    Write-Host ""
    Write-Host "Available modules:"
    Write-Host "  auth, products, product-details, cart, orders,"
    Write-Host "  categories, brands, banners, ratings, users, images,"
    Write-Host "  home-sections, sale-products, wishlist, notifications,"
    Write-Host "  bedrock, bedrock-agent"
    Write-Host ""
}

function Check-Prerequisites {
    Write-Color "`nChecking prerequisites..." "Yellow"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "  Node.js: $nodeVersion"
    } catch {
        Write-Color "  ERROR: Node.js not found. Install from https://nodejs.org" "Red"
        exit 1
    }
    
    # Check AWS CLI
    try {
        $awsVersion = aws --version 2>&1
        Write-Host "  AWS CLI: $($awsVersion.Split(' ')[0])"
    } catch {
        Write-Color "  ERROR: AWS CLI not found. Install from https://aws.amazon.com/cli/" "Red"
        exit 1
    }
    
    # Check AWS credentials
    try {
        $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
        Write-Host "  AWS Account: $($identity.Account)"
    } catch {
        Write-Color "  ERROR: AWS credentials not configured. Run: aws configure" "Red"
        exit 1
    }
    
    # Check npm dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Color "  Installing npm dependencies..." "Yellow"
        npm install
    }
    
    Write-Color "  All prerequisites OK!" "Green"
}

function Deploy-Layer {
    Write-Color "`n[1/2] Deploying Lambda Layer..." "Cyan"
    node deploy-layer.js
    if ($LASTEXITCODE -ne 0) {
        Write-Color "Layer deployment failed!" "Red"
        exit 1
    }
}

function Deploy-Modules {
    param([string]$targetModule, [switch]$skipLayerConfig)
    
    $step = if ($SkipLayer -or $LayerOnly) { "[1/1]" } else { "[2/2]" }
    
    if ($targetModule) {
        Write-Color "`n$step Deploying module: $targetModule..." "Cyan"
        $args = @($targetModule)
    } else {
        Write-Color "`n$step Deploying all modules..." "Cyan"
        $args = @()
    }
    
    if ($skipLayerConfig) {
        $args += "--no-layer"
    }
    
    node deploy-modules.js @args
    if ($LASTEXITCODE -ne 0) {
        Write-Color "Module deployment failed!" "Red"
        exit 1
    }
}

function Build-Only {
    param([string]$targetModule)
    
    Write-Color "`nBuilding ZIP files (no deploy)..." "Cyan"
    
    # Temporarily modify deploy script to skip AWS calls
    $env:BUILD_ONLY = "true"
    
    if ($targetModule) {
        Write-Host "Building module: $targetModule"
        node -e "
            const fs = require('fs');
            const path = require('path');
            const config = require('./config');
            
            const BUILD_DIR = path.join(__dirname, config.paths.buildDir);
            const LAMBDA_ROOT = path.join(__dirname, config.paths.lambdaRoot);
            
            function copyDirRecursive(src, dest) {
                if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
                fs.readdirSync(src).forEach(file => {
                    const srcPath = path.join(src, file);
                    const destPath = path.join(dest, file);
                    if (fs.statSync(srcPath).isDirectory()) {
                        copyDirRecursive(srcPath, destPath);
                    } else if (file.endsWith('.js')) {
                        fs.copyFileSync(srcPath, destPath);
                    }
                });
            }
            
            const name = '$targetModule';
            const moduleConfig = config.modules[name];
            if (!moduleConfig) { console.error('Unknown module:', name); process.exit(1); }
            
            const moduleDir = path.join(LAMBDA_ROOT, moduleConfig.folder);
            const sharedDir = path.join(LAMBDA_ROOT, 'shared');
            const moduleBuildDir = path.join(BUILD_DIR, 'modules', name);
            const zipPath = path.join(moduleBuildDir, name + '.zip');
            
            if (fs.existsSync(moduleBuildDir)) fs.rmSync(moduleBuildDir, { recursive: true });
            fs.mkdirSync(moduleBuildDir, { recursive: true });
            
            const tempDir = path.join(moduleBuildDir, 'temp');
            fs.mkdirSync(tempDir, { recursive: true });
            
            fs.readdirSync(moduleDir).forEach(file => {
                if (file.endsWith('.js')) fs.copyFileSync(path.join(moduleDir, file), path.join(tempDir, file));
            });
            
            if (fs.existsSync(sharedDir)) copyDirRecursive(sharedDir, path.join(tempDir, 'shared'));
            
            require('child_process').execSync(
                'powershell -Command \"Compress-Archive -Path ''' + tempDir + '\\*'' -DestinationPath ''' + zipPath + ''' -Force\"',
                { stdio: 'pipe' }
            );
            
            fs.rmSync(tempDir, { recursive: true });
            console.log('Built:', zipPath);
        "
    } else {
        # Build all modules
        foreach ($mod in @('auth', 'products', 'product-details', 'cart', 'orders', 'categories', 'brands', 'banners', 'ratings', 'users', 'images', 'home-sections', 'sale-products', 'wishlist', 'notifications', 'bedrock', 'bedrock-agent')) {
            Build-Only -targetModule $mod
        }
    }
    
    Write-Color "`nBuild complete! ZIP files in: deploy/build/modules/" "Green"
}

# Main
Write-Host ""
Write-Color "========================================" "Cyan"
Write-Color "  OJT E-commerce Lambda Deployment" "Cyan"
Write-Color "========================================" "Cyan"

if ($Help) {
    Show-Help
    exit 0
}

# Show mode
Write-Host ""
if ($BuildOnly) {
    Write-Color "Mode: BUILD ONLY" "Yellow"
} elseif ($LayerOnly) {
    Write-Color "Mode: LAYER ONLY" "Yellow"
} elseif ($SkipLayer) {
    Write-Color "Mode: MODULES ONLY (skip layer)" "Yellow"
} elseif ($Module) {
    Write-Color "Mode: SINGLE MODULE ($Module)" "Yellow"
} else {
    Write-Color "Mode: FULL DEPLOY (layer + modules)" "Yellow"
}

Check-Prerequisites

$startTime = Get-Date

if ($BuildOnly) {
    Build-Only -targetModule $Module
} elseif ($LayerOnly) {
    Deploy-Layer
} elseif ($SkipLayer) {
    Deploy-Modules -targetModule $Module -skipLayerConfig
} elseif ($Module) {
    Deploy-Modules -targetModule $Module
} else {
    # Full deploy
    Deploy-Layer
    Deploy-Modules
}

$elapsed = (Get-Date) - $startTime
Write-Host ""
Write-Color "========================================" "Green"
Write-Color "  Deployment Complete!" "Green"
Write-Color "  Time: $($elapsed.ToString('mm\:ss'))" "Green"
Write-Color "========================================" "Green"
Write-Host ""
