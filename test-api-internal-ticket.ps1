$body = @{
    reporter_name = "Test User"
    reporter_email = "test@example.com"
    reporter_phone = "08123456789"
    reporter_department = "Bagian Keuangan"
    reporter_position = "Staff"
    category = "it_support"
    priority = "medium"
    title = "Test Tiket dari QR Code"
    description = "Ini adalah test tiket untuk memverifikasi endpoint API"
    qr_code = "QR-MKI-Z4438"
    unit_id = "550e8400-e29b-41d4-a716-446655440004"
    source = "qr_code"
} | ConvertTo-Json

Write-Host "Testing POST /api/public/internal-tickets..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3004/api/public/internal-tickets" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
