import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import VisitorRegistrationForm from '../VisitorRegistrationForm';
import * as visitorService from '../../../services/visitorService';

// Mock the visitor service
vi.mock('../../../services/visitorService');

beforeEach(() => {
  vi.clearAllMocks();
});

// **Feature: innovation-landing-page, Property 1: Valid visitor data persistence**
describe('Property: Valid visitor data persistence', () => {
  it('should persist and submit any valid visitor data', async () => {
    // Mock successful API response
    vi.mocked(visitorService.registerVisitor).mockResolvedValue({
      success: true,
      data: { id: '123', registeredAt: new Date() },
    });

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          nama: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
          instansi: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length >= 1),
          jabatan: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length >= 1),
          noHandphone: fc.constantFrom('081234567890', '082123456789', '+6281234567890'),
        }),
        async (visitorData) => {
          const { container } = render(<VisitorRegistrationForm />);

          // Fill form
          const namaInput = container.querySelector('input[name="nama"]') as HTMLInputElement;
          const instansiInput = container.querySelector('input[name="instansi"]') as HTMLInputElement;
          const jabatanInput = container.querySelector('input[name="jabatan"]') as HTMLInputElement;
          const noHandphoneInput = container.querySelector('input[name="noHandphone"]') as HTMLInputElement;

          if (namaInput && instansiInput && jabatanInput && noHandphoneInput) {
            fireEvent.change(namaInput, { target: { value: visitorData.nama } });
            fireEvent.change(instansiInput, { target: { value: visitorData.instansi } });
            fireEvent.change(jabatanInput, { target: { value: visitorData.jabatan } });
            fireEvent.change(noHandphoneInput, { target: { value: visitorData.noHandphone } });

            // Submit form
            const submitButton = screen.getByText(/Daftar Sekarang/i);
            fireEvent.click(submitButton);

            // Wait for API call
            await waitFor(() => {
              expect(visitorService.registerVisitor).toHaveBeenCalledWith(
                expect.objectContaining({
                  nama: visitorData.nama,
                  instansi: visitorData.instansi,
                  jabatan: visitorData.jabatan,
                  noHandphone: visitorData.noHandphone,
                })
              );
            });
          }
        }
      ),
      { numRuns: 20 } // Reduced for async operations
    );
  });
});

// **Feature: innovation-landing-page, Property 4: Form reset after successful submission**
describe('Property: Form reset after successful submission', () => {
  it('should clear all form fields after any successful submission', async () => {
    vi.mocked(visitorService.registerVisitor).mockResolvedValue({
      success: true,
      data: { id: '123', registeredAt: new Date() },
    });

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          nama: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
          instansi: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length >= 1),
          jabatan: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length >= 1),
          noHandphone: fc.constantFrom('081234567890', '082123456789'),
        }),
        async (visitorData) => {
          const { container } = render(<VisitorRegistrationForm />);

          // Fill and submit form
          const namaInput = container.querySelector('input[name="nama"]') as HTMLInputElement;
          const instansiInput = container.querySelector('input[name="instansi"]') as HTMLInputElement;
          const jabatanInput = container.querySelector('input[name="jabatan"]') as HTMLInputElement;
          const noHandphoneInput = container.querySelector('input[name="noHandphone"]') as HTMLInputElement;

          if (namaInput && instansiInput && jabatanInput && noHandphoneInput) {
            fireEvent.change(namaInput, { target: { value: visitorData.nama } });
            fireEvent.change(instansiInput, { target: { value: visitorData.instansi } });
            fireEvent.change(jabatanInput, { target: { value: visitorData.jabatan } });
            fireEvent.change(noHandphoneInput, { target: { value: visitorData.noHandphone } });

            const submitButton = screen.getByText(/Daftar Sekarang/i);
            fireEvent.click(submitButton);

            // Wait for form to be cleared
            await waitFor(() => {
              expect(namaInput.value).toBe('');
              expect(instansiInput.value).toBe('');
              expect(jabatanInput.value).toBe('');
              expect(noHandphoneInput.value).toBe('');
            });
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});

describe('Form validation display', () => {
  it('should display validation errors for empty fields', async () => {
    const { container } = render(<VisitorRegistrationForm />);

    const submitButton = screen.getByText(/Daftar Sekarang/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errors = container.querySelectorAll('.text-red-600');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('should display success message after successful submission', async () => {
    vi.mocked(visitorService.registerVisitor).mockResolvedValue({
      success: true,
      data: { id: '123', registeredAt: new Date() },
    });

    const { container } = render(<VisitorRegistrationForm />);

    // Fill form with valid data
    const namaInput = container.querySelector('input[name="nama"]') as HTMLInputElement;
    const instansiInput = container.querySelector('input[name="instansi"]') as HTMLInputElement;
    const jabatanInput = container.querySelector('input[name="jabatan"]') as HTMLInputElement;
    const noHandphoneInput = container.querySelector('input[name="noHandphone"]') as HTMLInputElement;

    fireEvent.change(namaInput, { target: { value: 'John Doe' } });
    fireEvent.change(instansiInput, { target: { value: 'Test Company' } });
    fireEvent.change(jabatanInput, { target: { value: 'Manager' } });
    fireEvent.change(noHandphoneInput, { target: { value: '081234567890' } });

    const submitButton = screen.getByText(/Daftar Sekarang/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Pendaftaran Berhasil/i)).toBeInTheDocument();
    });
  });
});
