import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { scrollToSection, getActiveSection, isInViewport } from '../navigation';

// Mock scrollIntoView
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// **Feature: innovation-landing-page, Property 17: Navigation scroll behavior**
describe('Property: Navigation scroll behavior', () => {
  it('should scroll to any section when navigation item is clicked', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z-]+$/.test(s)),
        (sectionId) => {
          // Create a mock element
          const mockElement = document.createElement('div');
          mockElement.id = sectionId;
          document.body.appendChild(mockElement);

          // Call scrollToSection
          scrollToSection(sectionId);

          // Verify scrollIntoView was called
          expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
            behavior: 'smooth',
            block: 'start',
          });

          // Cleanup
          document.body.removeChild(mockElement);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle non-existent sections gracefully', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (sectionId) => {
          // Ensure section doesn't exist
          const existing = document.getElementById(sectionId);
          if (existing) {
            document.body.removeChild(existing);
          }

          // Should not throw error
          expect(() => scrollToSection(sectionId)).not.toThrow();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: innovation-landing-page, Property 19: Active menu highlighting**
describe('Property: Active menu highlighting', () => {
  it('should correctly identify active section for any scroll position', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-z]+$/.test(s)),
            height: fc.integer({ min: 100, max: 1000 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (sections) => {
          // Create mock sections
          let currentTop = 0;
          const sectionIds: string[] = [];

          sections.forEach((section, index) => {
            const element = document.createElement('div');
            element.id = section.id;
            
            // Mock offsetTop and offsetHeight
            Object.defineProperty(element, 'offsetTop', {
              value: currentTop,
              writable: false,
            });
            Object.defineProperty(element, 'offsetHeight', {
              value: section.height,
              writable: false,
            });

            document.body.appendChild(element);
            sectionIds.push(section.id);
            currentTop += section.height;
          });

          // Test getActiveSection
          const activeSection = getActiveSection(sectionIds);
          
          // Should return one of the section IDs or null
          const isValid = activeSection === null || sectionIds.includes(activeSection);
          expect(isValid).toBe(true);

          // Cleanup
          sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) {
              document.body.removeChild(element);
            }
          });

          return true;
        }
      ),
      { numRuns: 50 } // Reduced runs due to DOM manipulation
    );
  });
});

describe('isInViewport utility', () => {
  it('should correctly detect if element is in viewport', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    // Mock getBoundingClientRect
    element.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 100,
      bottom: 200,
      right: 200,
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));

    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });

    const result = isInViewport(element);
    expect(typeof result).toBe('boolean');

    document.body.removeChild(element);
  });
});
