# Test Users API Script
$baseUrl = "http://localhost:5001/api"

Write-Host "Testing Users API..." -ForegroundColor Green

# Test 1: Login Admin
Write-Host "`n1. Testing Admin Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@jempol.com"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.success) {
        $token = $loginData.token
        Write-Host "Login successful! Token: $($token.Substring(0, 20))..." -ForegroundColor Green
        
        # Test 2: Get Users
        Write-Host "`n2. Testing Get Users..." -ForegroundColor Yellow
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        try {
            $usersResponse = Invoke-WebRequest -Uri "$baseUrl/users" -Method GET -Headers $headers
            $usersData = $usersResponse.Content | ConvertFrom-Json
            
            if ($usersData.success) {
                Write-Host "Get Users successful! Found $($usersData.data.Count) users" -ForegroundColor Green
                $usersData.data | ForEach-Object { 
                    Write-Host "  - $($_.full_name) ($($_.email)) - Role: $($_.role)" -ForegroundColor Cyan
                }
            } else {
                Write-Host "Get Users failed: $($usersData.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "Get Users error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 3: Get Units
        Write-Host "`n3. Testing Get Units..." -ForegroundColor Yellow
        try {
            $unitsResponse = Invoke-WebRequest -Uri "$baseUrl/users/units" -Method GET -Headers $headers
            $unitsData = $unitsResponse.Content | ConvertFrom-Json
            
            if ($unitsData.success) {
                Write-Host "Get Units successful! Found $($unitsData.data.Count) units" -ForegroundColor Green
                $unitsData.data | ForEach-Object { 
                    Write-Host "  - $($_.name) ($($_.code))" -ForegroundColor Cyan
                }
            } else {
                Write-Host "Get Units failed: $($unitsData.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "Get Units error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "Login failed: $($loginData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "Login error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Testing completed!" -ForegroundColor Green