import { Category } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';

export const cn = (...inputs: ClassValue[]) => {
  return clsx(inputs);
};

export const generateWhatsAppSummary = (categories: Category[]) => {
  // 1. Sort all items inside their categories globally like requested
  const sortedCategories = categories.map(cat => ({
    ...cat,
    items: [...cat.items].sort((a, b) => {
      const personA = a.person || 'Unassigned';
      const personB = b.person || 'Unassigned';
      if (personA !== personB) return personA.localeCompare(personB);
      return a.name.localeCompare(b.name);
    })
  }));

  let summary = '';
  
  sortedCategories.forEach(cat => {
    if (cat.items.length === 0) return;
    
    summary += `🛒 📍 *${cat.title}*\n\n`;
    
    const byPerson: Record<string, typeof cat.items> = {};
    
    cat.items.forEach(item => {
      const p = item.person || 'Unassigned';
      if (!byPerson[p]) byPerson[p] = [];
      byPerson[p].push(item);
    });
    
    Object.keys(byPerson).sort().forEach((person, index, arr) => {
      summary += `*${person}*\n`;
      byPerson[person].forEach(item => {
        summary += `• ${item.name} - ${item.qty} ${item.unit}\n`;
      });
      if (index < arr.length - 1) {
        summary += `\n-------\n`;
      }
    });
    
    summary += `\n\n`;
  });

  return summary.trim();
};

export const copyToClipboard = async (text: string, successMessage = 'Copied to clipboard!') => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch (err) {
    toast.error('Failed to copy');
  }
};
