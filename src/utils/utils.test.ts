import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cn, generateWhatsAppSummary, copyToClipboard } from './index';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Utilities', () => {
  describe('cn', () => {
    it('should merge classes correctly', () => {
      expect(cn('a', 'b')).toBe('a b');
      expect(cn('a', { b: true, c: false })).toBe('a b');
      expect(cn('a', undefined, null, 'd')).toBe('a d');
    });
  });

  describe('generateWhatsAppSummary', () => {
    it('should generate an empty string for no categories', () => {
      expect(generateWhatsAppSummary([])).toBe('');
    });

    it('should generate summary for categories with items and persons', () => {
      const categories = [
        {
          id: '1',
          title: 'Grocery',
          items: [
            { id: 'i1', name: 'Apples', qty: 2, unit: 'kg', person: 'Alice', price: 0 },
            { id: 'i2', name: 'Bananas', qty: 1, unit: 'bunch', person: 'Bob', price: 0 },
            { id: 'i3', name: 'Milk', qty: 1, unit: 'L', person: '', price: 0 },
          ],
        },
      ];
      const summary = generateWhatsAppSummary(categories as any);
      expect(summary).toContain('🛒 📍 *Grocery*');
      expect(summary).toContain('*Alice*');
      expect(summary).toContain('• Apples - 2 kg');
      expect(summary).toContain('*Bob*');
      expect(summary).toContain('• Bananas - 1 bunch');
      expect(summary).toContain('*Unassigned*');
      expect(summary).toContain('• Milk - 1 L');
    });

    it('should sort items by person and then name', () => {
      const categories = [
        {
          id: '1',
          title: 'Mixed',
          items: [
            { id: 'i1', name: 'Zebra', qty: 1, unit: 'pc', person: 'Alice', price: 0 },
            { id: 'i2', name: 'Apple', qty: 1, unit: 'pc', person: 'Alice', price: 0 },
          ],
        },
      ];
      const summary = generateWhatsAppSummary(categories as any);
      const aliceIdx = summary.indexOf('*Alice*');
      const appleIdx = summary.indexOf('Apple');
      const zebraIdx = summary.indexOf('Zebra');
      expect(aliceIdx).toBeLessThan(appleIdx);
      expect(appleIdx).toBeLessThan(zebraIdx);
    });

    it('should skip categories with no items', () => {
      const categories = [
        { id: '1', title: 'Empty', items: [] },
        { id: '2', title: 'Full', items: [{ id: 'i1', name: 'Item', qty: 1, unit: 'pc', person: 'Alice' }] },
      ];
      const summary = generateWhatsAppSummary(categories as any);
      expect(summary).not.toContain('Empty');
      expect(summary).toContain('Full');
    });

    it('should add separator between persons', () => {
      const categories = [
        {
          id: '1',
          title: 'Grocery',
          items: [
            { id: 'i1', name: 'Apple', qty: 1, unit: 'pc', person: 'Alice' },
            { id: 'i2', name: 'Banana', qty: 1, unit: 'pc', person: 'Bob' },
          ],
        },
      ];
      const summary = generateWhatsAppSummary(categories as any);
      expect(summary).toContain('-------');
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Mock navigator.clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockImplementation(() => Promise.resolve()),
        },
      });
    });

    it('should copy text and show success toast', async () => {
      await copyToClipboard('test text', 'Success!');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
      expect(toast.success).toHaveBeenCalledWith('Success!');
    });

    it('should show error toast if copying fails', async () => {
      (navigator.clipboard.writeText as any).mockImplementationOnce(() => Promise.reject('error'));
      await copyToClipboard('test text');
      expect(toast.error).toHaveBeenCalledWith('Failed to copy');
    });
  });
});
