/**
 * Tests for utility functions
 */

import {
  sleep,
  retry,
  debounce,
  throttle,
  chunk,
  uuid,
  isBrowser,
  isNode,
  deepMerge,
  formatBytes,
  parseQueryString,
  buildQueryString
} from '../src/utils';

// Mock timers
jest.useFakeTimers();

describe('Utils', () => {
  describe('sleep', () => {
    it('should resolve after specified milliseconds', async () => {
      const promise = sleep(1000);
      jest.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    });

    it('should handle zero milliseconds', async () => {
      const promise = sleep(0);
      jest.advanceTimersByTime(0);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('retry', () => {
    beforeEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');

      const onRetry = jest.fn();
      const result = await retry(fn, { onRetry, initialDelay: 10 });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it('should fail after max attempts', async () => {
      const error = new Error('persistent failure');
      const fn = jest.fn().mockRejectedValue(error);
      
      await expect(retry(fn, { maxAttempts: 2, initialDelay: 1 }))
        .rejects.toThrow('persistent failure');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should respect max delay', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      const startTime = Date.now();
      
      const promise = retry(fn, { 
        maxAttempts: 3, 
        initialDelay: 1000,
        maxDelay: 100,
        factor: 10
      });
      
      // Should use maxDelay instead of exponential
      setTimeout(() => {
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(500); // Much less than 1000ms * 10
      }, 150);

      await expect(promise).rejects.toThrow('fail');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');
      
      expect(fn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('arg3');
    });

    it('should reset timer on subsequent calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn('arg1');
      jest.advanceTimersByTime(50);
      debouncedFn('arg2');
      jest.advanceTimersByTime(50);
      
      expect(fn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('arg2');
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 100);
      
      throttledFn('arg1');
      throttledFn('arg2');
      throttledFn('arg3');
      
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('arg1');
      
      jest.advanceTimersByTime(100);
      throttledFn('arg4');
      
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith('arg4');
    });
  });

  describe('chunk', () => {
    it('should chunk array into smaller arrays', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const chunks = chunk(array, 3);
      
      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    });

    it('should handle remainder elements', () => {
      const array = [1, 2, 3, 4, 5];
      const chunks = chunk(array, 2);
      
      expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle empty arrays', () => {
      const chunks = chunk([], 3);
      expect(chunks).toEqual([]);
    });

    it('should handle chunk size larger than array', () => {
      const array = [1, 2, 3];
      const chunks = chunk(array, 5);
      
      expect(chunks).toEqual([[1, 2, 3]]);
    });
  });

  describe('uuid', () => {
    it('should generate valid UUID v4', () => {
      const id = uuid();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const id1 = uuid();
      const id2 = uuid();
      expect(id1).not.toBe(id2);
    });
  });

  describe('isBrowser', () => {
    it('should return false in Node.js environment', () => {
      expect(isBrowser()).toBe(false);
    });

    it('should detect browser environment', () => {
      // Mock window object
      (global as any).window = { document: {} };
      expect(isBrowser()).toBe(true);
      
      // Cleanup
      delete (global as any).window;
    });
  });

  describe('isNode', () => {
    it('should return true in Node.js environment', () => {
      expect(isNode()).toBe(true);
    });

    it('should return false in browser environment', () => {
      // Mock browser-like environment
      const originalProcess = global.process;
      delete (global as any).process;
      
      expect(isNode()).toBe(false);
      
      // Restore
      global.process = originalProcess;
    });
  });

  describe('deepMerge', () => {
    it('should merge objects deeply', () => {
      const target = {
        a: 1,
        b: { c: 2, d: 3 }
      };
      
      const source = {
        b: { c: 4, e: 5 },
        f: 6
      };
      
      const result = deepMerge(target, source);
      
      expect(result).toEqual({
        a: 1,
        b: { c: 4, d: 3, e: 5 },
        f: 6
      });
    });

    it('should handle multiple sources', () => {
      const target = { a: 1 };
      const source1 = { b: 2 };
      const source2 = { c: 3 };
      
      const result = deepMerge(target, source1, source2);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should return target if no sources', () => {
      const target = { a: 1 };
      const result = deepMerge(target);
      expect(result).toBe(target);
    });

    it('should handle non-object values', () => {
      const result = deepMerge({ a: 1 }, { a: 'string' });
      expect(result).toEqual({ a: 'string' });
    });

    it('should not merge arrays', () => {
      const target = { a: [1, 2] };
      const source = { a: [3, 4] };
      
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: [3, 4] });
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });

    it('should handle decimal places', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1536, 0)).toBe('2 KB');
    });

    it('should handle negative decimals', () => {
      expect(formatBytes(1536, -1)).toBe('2 KB');
    });
  });

  describe('parseQueryString', () => {
    it('should parse query string to object', () => {
      const result = parseQueryString('name=john&age=30&active=true');
      expect(result).toEqual({
        name: 'john',
        age: '30',
        active: 'true'
      });
    });

    it('should handle empty query string', () => {
      const result = parseQueryString('');
      expect(result).toEqual({});
    });

    it('should handle URL encoded values', () => {
      const result = parseQueryString('name=john%20doe&message=hello%20world');
      expect(result).toEqual({
        name: 'john doe',
        message: 'hello world'
      });
    });

    it('should handle duplicate keys', () => {
      const result = parseQueryString('tag=red&tag=blue');
      expect(result.tag).toBe('blue'); // URLSearchParams behavior - last value wins
    });
  });

  describe('buildQueryString', () => {
    it('should build query string from object', () => {
      const params = {
        name: 'john',
        age: 30,
        active: true
      };
      
      const result = buildQueryString(params);
      expect(result).toBe('name=john&age=30&active=true');
    });

    it('should handle empty object', () => {
      const result = buildQueryString({});
      expect(result).toBe('');
    });

    it('should skip undefined and null values', () => {
      const params = {
        name: 'john',
        age: undefined,
        city: null,
        active: true
      };
      
      const result = buildQueryString(params);
      expect(result).toBe('name=john&active=true');
    });

    it('should handle special characters', () => {
      const params = {
        message: 'hello world',
        symbol: '&=?'
      };
      
      const result = buildQueryString(params);
      expect(result).toBe('message=hello+world&symbol=%26%3D%3F');
    });

    it('should handle zero values', () => {
      const params = {
        count: 0,
        enabled: false
      };
      
      const result = buildQueryString(params);
      expect(result).toBe('count=0&enabled=false');
    });
  });
});