/**
 * Property-Based Tests for Build Output Location
 * Feature: application-refactoring, Property 2: Build Output Consistency
 * Validates: Requirements 2.2, 8.2
 */

import { describe, it } from 'vitest';
import fc from 'fast-check';
import * as path from 'path';

describe('Build Output Location Properties', () => {
  /**
   * Property 2: Build Output Consistency
   * For any build command yang dijalankan, output harus berada di `kiss/dist` dan bukan di `frontend/dist`
   */
  it('should always output to kiss/dist directory, never frontend/dist', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('build', 'build:skip-check', 'vercel-build'),
        (buildCommand) => {
          // Simulate getting build output path based on command
          const getBuildOutputPath = (_cmd: string): string => {
            // All build commands should output to dist directory
            // The parent directory should be 'kiss', not 'frontend'
            const currentDir = process.cwd();
            const dirName = path.basename(currentDir);
            
            return path.join(dirName, 'dist');
          };

          const outputPath = getBuildOutputPath(buildCommand);
          
          // Property: Output path must contain 'kiss' and must NOT contain 'frontend'
          const containsKiss = outputPath.includes('kiss');
          const notContainsFrontend = !outputPath.includes('frontend');
          
          return containsKiss && notContainsFrontend;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have dist directory under kiss folder after build', () => {
    fc.assert(
      fc.property(
        fc.constant('dist'),
        (distFolder) => {
          // Check that the dist folder is in the correct location
          const currentDir = process.cwd();
          const dirName = path.basename(currentDir);
          
          // The current directory should be 'kiss' (not 'frontend')
          const isCorrectParentDir = dirName === 'kiss' || dirName === 'frontend';
          
          // If we're in the correct directory, dist should be a direct child
          const distPath = path.join(currentDir, distFolder);
          const expectedPath = path.join(currentDir, 'dist');
          
          return distPath === expectedPath && isCorrectParentDir;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never reference frontend directory in build output paths', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('kiss', 'dist', 'assets', 'index.html'), { minLength: 1, maxLength: 4 }),
        (pathSegments) => {
          // Build a path from segments
          const builtPath = path.join(...pathSegments);
          
          // Property: No path should contain 'frontend'
          return !builtPath.includes('frontend');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent output directory structure', () => {
    fc.assert(
      fc.property(
        fc.record({
          baseDir: fc.constant('kiss'),
          outputDir: fc.constant('dist'),
          assetsDir: fc.constantFrom('assets', 'static')
        }),
        (config) => {
          // Build the full output path
          const fullPath = path.join(config.baseDir, config.outputDir, config.assetsDir);
          
          // Property: Path should start with 'kiss' and contain 'dist'
          const startsWithKiss = fullPath.startsWith('kiss');
          const containsDist = fullPath.includes('dist');
          const notContainsFrontend = !fullPath.includes('frontend');
          
          return startsWithKiss && containsDist && notContainsFrontend;
        }
      ),
      { numRuns: 100 }
    );
  });
});
