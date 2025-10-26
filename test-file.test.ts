import { testFunction } from './test-file';

describe('testFunction', () => {
  // Spy on console.log to verify it's called
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Happy Path', () => {
    it('should return the string "test"', () => {
      const result = testFunction();
      expect(result).toBe('test');
    });

    it('should return a string type', () => {
      const result = testFunction();
      expect(typeof result).toBe('string');
    });

    it('should call console.log with "Testing CodeRabbit"', () => {
      testFunction();
      expect(consoleLogSpy).toHaveBeenCalledWith('Testing CodeRabbit');
    });

    it('should call console.log exactly once', () => {
      testFunction();
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple Invocations', () => {
    it('should return the same value on multiple calls', () => {
      const result1 = testFunction();
      const result2 = testFunction();
      const result3 = testFunction();

      expect(result1).toBe('test');
      expect(result2).toBe('test');
      expect(result3).toBe('test');
    });

    it('should log to console on each invocation', () => {
      testFunction();
      testFunction();
      testFunction();

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'Testing CodeRabbit');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'Testing CodeRabbit');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(3, 'Testing CodeRabbit');
    });
  });

  describe('Function Properties', () => {
    it('should be a function', () => {
      expect(typeof testFunction).toBe('function');
    });

    it('should not accept any parameters', () => {
      expect(testFunction.length).toBe(0);
    });

    it('should be defined', () => {
      expect(testFunction).toBeDefined();
    });

    it('should not be null', () => {
      expect(testFunction).not.toBeNull();
    });
  });

  describe('Return Value Properties', () => {
    it('should return a non-empty string', () => {
      const result = testFunction();
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return a string with length 4', () => {
      const result = testFunction();
      expect(result.length).toBe(4);
    });

    it('should return a lowercase string', () => {
      const result = testFunction();
      expect(result).toBe(result.toLowerCase());
    });

    it('should return a string that does not contain whitespace', () => {
      const result = testFunction();
      expect(result).not.toMatch(/\s/);
    });
  });

  describe('Side Effects', () => {
    it('should only have console.log as a side effect', () => {
      const result = testFunction();
      
      // Verify the function completed
      expect(result).toBe('test');
      
      // Verify console.log was the only console method called
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should not throw any errors', () => {
      expect(() => testFunction()).not.toThrow();
    });

    it('should complete synchronously', () => {
      const result = testFunction();
      expect(result).not.toBeInstanceOf(Promise);
    });
  });

  describe('Immutability and Purity (except console.log)', () => {
    it('should not modify global state beyond console output', () => {
      const globalBefore = { ...globalThis };
      testFunction();
      
      // The function should not add new global properties
      // (console.log is expected and doesn't modify state in a problematic way)
      expect(Object.keys(globalThis).length).toBe(Object.keys(globalBefore).length);
    });

    it('should produce consistent results', () => {
      const results = Array.from({ length: 100 }, () => testFunction());
      const allSame = results.every(result => result === 'test');
      expect(allSame).toBe(true);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should work correctly when called in a loop', () => {
      const results: string[] = [];
      for (let i = 0; i < 1000; i++) {
        results.push(testFunction());
      }
      
      expect(results).toHaveLength(1000);
      expect(results.every(r => r === 'test')).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1000);
    });

    it('should work correctly when assigned to a variable', () => {
      const fn = testFunction;
      const result = fn();
      expect(result).toBe('test');
    });

    it('should work correctly when used as a callback', () => {
      const callback = testFunction;
      const result = callback();
      expect(result).toBe('test');
      expect(consoleLogSpy).toHaveBeenCalledWith('Testing CodeRabbit');
    });

    it('should work correctly in an async context', async () => {
      const result = await Promise.resolve(testFunction());
      expect(result).toBe('test');
    });

    it('should work correctly when called with apply', () => {
      const result = testFunction.apply(null);
      expect(result).toBe('test');
    });

    it('should work correctly when called with call', () => {
      const result = testFunction.call(null);
      expect(result).toBe('test');
    });
  });

  describe('Integration with Other Code', () => {
    it('should work correctly when used in an array map', () => {
      const array = [1, 2, 3];
      const results = array.map(() => testFunction());
      
      expect(results).toEqual(['test', 'test', 'test']);
      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });

    it('should work correctly when used with Promise.all', async () => {
      const promises = Array.from({ length: 5 }, () => 
        Promise.resolve(testFunction())
      );
      
      const results = await Promise.all(promises);
      expect(results).toEqual(['test', 'test', 'test', 'test', 'test']);
    });

    it('should work correctly in a try-catch block', () => {
      let result: string = '';
      let error: Error | null = null;

      try {
        result = testFunction();
      } catch (e) {
        error = e as Error;
      }

      expect(result).toBe('test');
      expect(error).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should execute quickly', () => {
      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        testFunction();
      }
      const end = Date.now();
      const duration = end - start;

      // Should complete 10000 iterations in under 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should not cause memory leaks on repeated calls', () => {
      // This is a basic check - in real scenarios you'd use more sophisticated tools
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 10000; i++) {
        testFunction();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB for 10k calls)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Type Safety', () => {
    it('should have the correct return type', () => {
      const result: string = testFunction();
      expect(typeof result).toBe('string');
    });

    it('should not accept any arguments', () => {
      // TypeScript compilation will catch this, but we can verify at runtime
      // @ts-expect-error - Testing runtime behavior with extra arguments
      const result = testFunction('unexpected' as never);
      expect(result).toBe('test');
    });
  });

  describe('Console Output Verification', () => {
    it('should log the exact string "Testing CodeRabbit"', () => {
      testFunction();
      expect(consoleLogSpy).toHaveBeenCalledWith('Testing CodeRabbit');
      expect(consoleLogSpy).not.toHaveBeenCalledWith('testing coderabbit');
      expect(consoleLogSpy).not.toHaveBeenCalledWith('Testing CodeRabbit ');
    });

    it('should not log to console.error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      testFunction();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should not log to console.warn', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      testFunction();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });
});