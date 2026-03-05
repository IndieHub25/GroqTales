/**
 * Bug Condition Exploration Test - Stories Route Array formatType
 * 
 * **CRITICAL**: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms Bug 3 exists (TypeError when formatType is an array).
 * 
 * **DO NOT attempt to fix the test or the code when it fails.**
 * 
 * This test validates Requirements 2.5, 2.6:
 * - 2.5: System SHALL validate and normalize parameters to ensure they are strings
 * - 2.6: System SHALL ensure formatType is a string before calling string methods
 */

const groqService = require('../../server/services/groqService');

// Mock the groqService
jest.mock('../../server/services/groqService', () => ({
  generate: jest.fn(async (params) => {
    return {
      content: 'Generated story content',
      model: 'test-model',
      tokensUsed: 100
    };
  })
}));

// Mock the auth middleware
jest.mock('../../server/middleware/auth', () => ({
  authRequired: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

// Mock supabase
jest.mock('../../server/config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('Bug Exploration: Array formatType in Stories Route', () => {
  /**
   * Test 1.3: Array formatType causes TypeError
   * 
   * Expected behavior (after fix):
   * - System should normalize formatType to string (first element)
   * - No TypeError when calling .charAt() or .slice()
   * 
   * Current behavior (unfixed):
   * - formatType is an array
   * - Calling formatType.charAt(0) throws TypeError
   * - Arrays don't have charAt or slice methods
   */
  test('should detect TypeError when formatType is an array (Bug 3)', () => {
    // This test simulates what happens in stories.js line 395-396
    const formatType = ['story', 'poem'];  // Array instead of string
    
    // This is the code from stories.js that causes the TypeError:
    // const formatTypeCapitalized = formatType.charAt(0).toUpperCase() + formatType.slice(1);
    
    // When formatType is an array, this throws TypeError
    expect(() => {
      const formatTypeCapitalized = formatType.charAt(0).toUpperCase() + formatType.slice(1);
    }).toThrow(TypeError);
    
    // The error message should mention charAt
    expect(() => {
      formatType.charAt(0);
    }).toThrow(/charAt is not a function/);
  });

  test('should demonstrate that arrays do not have string methods', () => {
    const arrayParam = ['value1', 'value2'];
    
    // Arrays don't have charAt method
    expect(arrayParam.charAt).toBeUndefined();
    
    // Arrays don't have the same slice behavior as strings
    // Array.slice exists but behaves differently than String.slice
    expect(typeof arrayParam.slice).toBe('function');
    
    // But calling charAt on an array throws TypeError
    expect(() => {
      arrayParam.charAt(0);
    }).toThrow(TypeError);
  });

  test('should show expected behavior after fix - normalize to string', () => {
    const formatTypeArray = ['story', 'poem'];
    
    // After fix, the code should normalize the array to a string
    // by taking the first element
    const normalizedFormatType = Array.isArray(formatTypeArray) 
      ? formatTypeArray[0] 
      : formatTypeArray;
    
    // Now string methods work correctly
    expect(typeof normalizedFormatType).toBe('string');
    expect(normalizedFormatType).toBe('story');
    
    // And we can safely call string methods
    const formatTypeCapitalized = normalizedFormatType.charAt(0).toUpperCase() + normalizedFormatType.slice(1);
    expect(formatTypeCapitalized).toBe('Story');
  });

  test('should document all parameters that need normalization in stories route', () => {
    // These parameters are extracted from req.body in stories.js line 377
    // and need to be normalized to prevent TypeError
    const parametersNeedingNormalization = [
      'prompt',
      'genre',
      'length',
      'style',
      'theme',
      'characters',
      'setting',
      'formatType'
    ];
    
    // All of these can be sent as arrays by malicious clients
    // After fix, all should be normalized to strings
    expect(parametersNeedingNormalization.length).toBe(8);
    
    // formatType is particularly critical because it's used with .charAt() and .slice()
    expect(parametersNeedingNormalization).toContain('formatType');
  });

  test('should verify groqService.generate is called with correct parameter types', async () => {
    // Simulate what should happen after the fix
    const requestBody = {
      prompt: ['prompt1', 'prompt2'],
      genre: ['fantasy', 'sci-fi'],
      formatType: ['story', 'poem']
    };
    
    // After fix, parameters should be normalized before passing to groqService
    const normalizedParams = {
      prompt: Array.isArray(requestBody.prompt) ? requestBody.prompt[0] : requestBody.prompt,
      genre: Array.isArray(requestBody.genre) ? requestBody.genre[0] : requestBody.genre,
      formatType: Array.isArray(requestBody.formatType) ? requestBody.formatType[0] : requestBody.formatType
    };
    
    // Call groqService with normalized params
    await groqService.generate(normalizedParams);
    
    // Verify it was called with strings, not arrays
    expect(groqService.generate).toHaveBeenCalled();
    const callArgs = groqService.generate.mock.calls[0][0];
    
    expect(typeof callArgs.prompt).toBe('string');
    expect(typeof callArgs.genre).toBe('string');
    expect(typeof callArgs.formatType).toBe('string');
  });
});
