const fs = require('fs');
const path = require('path');

console.log('🔍 Mengidentifikasi halaman yang belum terintegrasi dengan backend...\n');

// Daftar halaman frontend yang perlu dicek
const pagesToCheck = [
  'frontend/src/pages/settings/PatientTypes.tsx',
  'frontend/src/pages/settings/UnitTypes.tsx',
  'frontend/src/pages/settings/ServiceCategories.tsx',
  'frontend/src/pages/settings/TicketTypes.tsx',
  'frontend/src/pages/settings/TicketClassifications.tsx',
  'frontend/src/pages/settings/TicketStatuses.tsx',
  'frontend/src/pages/settings/SLASettings.tsx',
  'frontend/src/pages/settings/RolesPermissions.tsx',
  'frontend/src/pages/settings/ResponseTemplates.tsx',
  'frontend/src/pages/settings/AITrustSettings.tsx',
  'frontend/src/pages/settings/UnitsManagement.tsx',
  'frontend/src/pages/Dashboard.tsx',
  'frontend/src/pages/tickets/TicketList.tsx',
  'frontend/src/pages/tickets/CreateInternalTicket.tsx',
  'frontend/src/pages/tickets/TicketDetail.tsx',
  'frontend/src/pages/Reports.tsx',
  'frontend/src/pages/users/UserManagement.tsx',
  'frontend/src/pages/survey/SurveyForm.tsx',
  'frontend/src/pages/survey/SurveyReport.tsx',
  'frontend/src/pages/NotificationSettings.tsx'
];

// Services yang perlu dicek
const servicesToCheck = [
  'frontend/src/services/masterDataService.ts',
  'frontend/src/services/userService.ts',
  'frontend/src/services/complaintService.ts',
  'frontend/src/services/reportService.ts',
  'frontend/src/services/escalationService.ts',
  'frontend/src/services/qrCodeService.ts',
  'frontend/src/services/externalTicketService.ts',
  'frontend/src/services/aiEscalationService.ts'
];

// Backend endpoints yang perlu dicek
const backendEndpoints = [
  'backend/src/routes/masterDataRoutes.ts',
  'backend/src/routes/userRoutes.ts',
  'backend/src/routes/complaintRoutes.ts',
  'backend/src/routes/reportRoutes.ts',
  'backend/src/routes/escalationRoutes.ts',
  'backend/src/routes/qrCodeRoutes.ts',
  'backend/src/routes/publicRoutes.ts',
  'backend/src/routes/appSettingsRoutes.ts'
];

const integrationIssues = [];
const workingIntegrations = [];

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function analyzeFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common integration patterns
    const hasApiCalls = content.includes('api.get') || content.includes('api.post') || content.includes('api.put') || content.includes('api.delete');
    const hasServiceImports = content.includes('Service') && content.includes('import');
    const hasErrorHandling = content.includes('catch') || content.includes('error');
    const hasLoadingStates = content.includes('loading') || content.includes('Loading');
    const hasDataFetching = content.includes('useEffect') || content.includes('useState');
    
    // Check for hardcoded data (potential issue)
    const hasHardcodedData = content.includes('const data = [') || content.includes('const mockData');
    
    // Check for TODO or FIXME comments
    const hasTodos = content.includes('TODO') || content.includes('FIXME') || content.includes('BUG');
    
    return {
      hasApiCalls,
      hasServiceImports,
      hasErrorHandling,
      hasLoadingStates,
      hasDataFetching,
      hasHardcodedData,
      hasTodos,
      integrationScore: [hasApiCalls, hasServiceImports, hasErrorHandling, hasLoadingStates, hasDataFetching].filter(Boolean).length
    };
    
  } catch (error) {
    return null;
  }
}

console.log('📋 Checking frontend pages...\n');

pagesToCheck.forEach(pagePath => {
  if (checkFileExists(pagePath)) {
    const analysis = analyzeFileContent(pagePath);
    const fileName = path.basename(pagePath);
    
    if (analysis) {
      console.log(`📄 ${fileName}:`);
      console.log(`   Integration Score: ${analysis.integrationScore}/5`);
      console.log(`   API Calls: ${analysis.hasApiCalls ? '✅' : '❌'}`);
      console.log(`   Service Imports: ${analysis.hasServiceImports ? '✅' : '❌'}`);
      console.log(`   Error Handling: ${analysis.hasErrorHandling ? '✅' : '❌'}`);
      console.log(`   Loading States: ${analysis.hasLoadingStates ? '✅' : '❌'}`);
      console.log(`   Data Fetching: ${analysis.hasDataFetching ? '✅' : '❌'}`);
      
      if (analysis.hasHardcodedData) {
        console.log(`   ⚠️  Has hardcoded data`);
      }
      
      if (analysis.hasTodos) {
        console.log(`   ⚠️  Has TODO/FIXME comments`);
      }
      
      if (analysis.integrationScore < 3) {
        integrationIssues.push({
          file: fileName,
          path: pagePath,
          score: analysis.integrationScore,
          issues: []
        });
        
        if (!analysis.hasApiCalls) integrationIssues[integrationIssues.length - 1].issues.push('No API calls');
        if (!analysis.hasServiceImports) integrationIssues[integrationIssues.length - 1].issues.push('No service imports');
        if (!analysis.hasErrorHandling) integrationIssues[integrationIssues.length - 1].issues.push('No error handling');
      } else {
        workingIntegrations.push({
          file: fileName,
          path: pagePath,
          score: analysis.integrationScore
        });
      }
      
      console.log('');
    } else {
      console.log(`❌ ${fileName}: Could not analyze`);
      integrationIssues.push({
        file: fileName,
        path: pagePath,
        score: 0,
        issues: ['Could not analyze file']
      });
    }
  } else {
    console.log(`❌ ${path.basename(pagePath)}: File not found`);
    integrationIssues.push({
      file: path.basename(pagePath),
      path: pagePath,
      score: 0,
      issues: ['File not found']
    });
  }
});

console.log('📋 Checking services...\n');

servicesToCheck.forEach(servicePath => {
  if (checkFileExists(servicePath)) {
    const analysis = analyzeFileContent(servicePath);
    const fileName = path.basename(servicePath);
    
    if (analysis) {
      console.log(`🔧 ${fileName}:`);
      console.log(`   API Integration: ${analysis.hasApiCalls ? '✅' : '❌'}`);
      console.log(`   Error Handling: ${analysis.hasErrorHandling ? '✅' : '❌'}`);
      
      if (analysis.hasTodos) {
        console.log(`   ⚠️  Has TODO/FIXME comments`);
      }
      
      console.log('');
    }
  } else {
    console.log(`❌ ${path.basename(servicePath)}: Service not found`);
  }
});

console.log('📋 Checking backend endpoints...\n');

backendEndpoints.forEach(endpointPath => {
  if (checkFileExists(endpointPath)) {
    const analysis = analyzeFileContent(endpointPath);
    const fileName = path.basename(endpointPath);
    
    if (analysis) {
      console.log(`🔗 ${fileName}:`);
      console.log(`   Has Routes: ${analysis.hasApiCalls || analysis.hasServiceImports ? '✅' : '❌'}`);
      console.log(`   Error Handling: ${analysis.hasErrorHandling ? '✅' : '❌'}`);
      console.log('');
    }
  } else {
    console.log(`❌ ${path.basename(endpointPath)}: Endpoint not found`);
  }
});

// Generate summary report
console.log('🎯 SUMMARY REPORT\n');

console.log('❌ PAGES WITH INTEGRATION ISSUES:');
if (integrationIssues.length === 0) {
  console.log('   None found! 🎉');
} else {
  integrationIssues.forEach(issue => {
    console.log(`   📄 ${issue.file} (Score: ${issue.score}/5)`);
    console.log(`      Path: ${issue.path}`);
    console.log(`      Issues: ${issue.issues.join(', ')}`);
    console.log('');
  });
}

console.log('✅ WELL-INTEGRATED PAGES:');
if (workingIntegrations.length === 0) {
  console.log('   None found');
} else {
  workingIntegrations.forEach(working => {
    console.log(`   📄 ${working.file} (Score: ${working.score}/5)`);
  });
}

console.log('\n🔧 RECOMMENDED ACTIONS:');

if (integrationIssues.length > 0) {
  console.log('1. Focus on pages with integration score < 3');
  console.log('2. Add proper API calls and error handling');
  console.log('3. Implement loading states for better UX');
  console.log('4. Remove hardcoded data and replace with API calls');
  console.log('5. Test each page after integration fixes');
} else {
  console.log('1. All pages appear to be well-integrated!');
  console.log('2. Focus on testing and bug fixes');
  console.log('3. Optimize performance and user experience');
}

// Write detailed report to file
const reportContent = `# Integration Analysis Report
Generated: ${new Date().toISOString()}

## Pages with Integration Issues (${integrationIssues.length})
${integrationIssues.map(issue => `
### ${issue.file}
- **Path**: ${issue.path}
- **Score**: ${issue.score}/5
- **Issues**: ${issue.issues.join(', ')}
`).join('')}

## Well-Integrated Pages (${workingIntegrations.length})
${workingIntegrations.map(working => `
- **${working.file}**: Score ${working.score}/5
`).join('')}

## Next Steps
${integrationIssues.length > 0 ? `
1. Fix integration issues in low-scoring pages
2. Add proper error handling and loading states
3. Replace hardcoded data with API calls
4. Test each page thoroughly
` : `
1. All pages appear well-integrated
2. Focus on testing and optimization
3. Monitor for runtime errors
`}
`;

fs.writeFileSync('integration-analysis-report.md', reportContent);
console.log('\n📄 Detailed report saved to: integration-analysis-report.md');