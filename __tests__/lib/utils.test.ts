import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const result = cn('bg-red-500', false && 'text-blue-500', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle undefined and null values', () => {
    const result = cn('bg-red-500', undefined, null, 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle empty strings', () => {
    const result = cn('bg-red-500', '', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle conflicting Tailwind classes by keeping the last one', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['bg-red-500', 'text-white'], 'font-bold');
    expect(result).toBe('bg-red-500 text-white font-bold');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'bg-red-500': true,
      'text-blue-500': false,
      'text-white': true,
    });
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should return empty string for no inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should return empty string for empty array', () => {
    const result = cn([]);
    expect(result).toBe('');
  });

  it('should handle complex combinations', () => {
    const isActive = true;
    const size = 'large';

    const result = cn(
      'base-class',
      isActive && 'active',
      size === 'large' && 'text-lg',
      ['flex', 'items-center'],
      {
        'font-bold': true,
        'font-thin': false,
      }
    );

    expect(result).toBe('base-class active text-lg flex items-center font-bold');
  });
});