import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import fc from 'fast-check';
import Header from '../Header';
import Footer from '../Footer';
import Container from '../Container';

// Helper to set viewport width
const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

// **Feature: innovation-landing-page, Property 13: No horizontal overflow on mobile**
describe('Property: No horizontal overflow on mobile', () => {
  it('should have no horizontal overflow for any mobile viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        (viewportWidth) => {
          setViewportWidth(viewportWidth);
          
          const { container } = render(
            <BrowserRouter>
              <Header />
              <Container>
                <div style={{ width: '100%' }}>Test Content</div>
              </Container>
              <Footer />
            </BrowserRouter>
          );

          // Check that no element exceeds viewport width
          const allElements = container.querySelectorAll('*');
          let hasOverflow = false;

          allElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.width > viewportWidth) {
              hasOverflow = true;
            }
          });

          expect(hasOverflow).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: innovation-landing-page, Property 14: No horizontal overflow on tablet**
describe('Property: No horizontal overflow on tablet', () => {
  it('should have no horizontal overflow for any tablet viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 1023 }),
        (viewportWidth) => {
          setViewportWidth(viewportWidth);
          
          const { container } = render(
            <BrowserRouter>
              <Header />
              <Container>
                <div style={{ width: '100%' }}>Test Content</div>
              </Container>
              <Footer />
            </BrowserRouter>
          );

          const allElements = container.querySelectorAll('*');
          let hasOverflow = false;

          allElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.width > viewportWidth) {
              hasOverflow = true;
            }
          });

          expect(hasOverflow).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: innovation-landing-page, Property 15: No horizontal overflow on desktop**
describe('Property: No horizontal overflow on desktop', () => {
  it('should have no horizontal overflow for any desktop viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1024, max: 2560 }),
        (viewportWidth) => {
          setViewportWidth(viewportWidth);
          
          const { container } = render(
            <BrowserRouter>
              <Header />
              <Container>
                <div style={{ width: '100%' }}>Test Content</div>
              </Container>
              <Footer />
            </BrowserRouter>
          );

          const allElements = container.querySelectorAll('*');
          let hasOverflow = false;

          allElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.width > viewportWidth) {
              hasOverflow = true;
            }
          });

          expect(hasOverflow).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: innovation-landing-page, Property 16: Media responsiveness**
describe('Property: Media responsiveness', () => {
  it('should scale media proportionally for any viewport size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (viewportWidth) => {
          setViewportWidth(viewportWidth);
          
          const { container } = render(
            <Container>
              <img 
                src="test.jpg" 
                alt="test" 
                className="w-full h-auto max-w-full"
              />
              <video 
                src="test.mp4" 
                className="w-full h-auto max-w-full"
              />
            </Container>
          );

          const images = container.querySelectorAll('img');
          const videos = container.querySelectorAll('video');

          [...images, ...videos].forEach((media) => {
            const rect = media.getBoundingClientRect();
            // Media should not exceed viewport width
            expect(rect.width).toBeLessThanOrEqual(viewportWidth);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
