import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

describe('.coderabbit.yaml Configuration Validation', () => {
  let configContent: string;
  let configData: any;
  const configPath = path.join(process.cwd(), '.coderabbit.yaml');

  beforeAll(() => {
    // Read the configuration file
    configContent = fs.readFileSync(configPath, 'utf-8');
  });

  describe('File Existence and Accessibility', () => {
    it('should exist in the repository root', () => {
      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should be readable', () => {
      expect(() => fs.readFileSync(configPath, 'utf-8')).not.toThrow();
    });

    it('should not be empty', () => {
      expect(configContent.trim().length).toBeGreaterThan(0);
    });

    it('should have .yaml extension', () => {
      expect(configPath).toMatch(/\.ya?ml$/);
    });
  });

  describe('YAML Syntax Validation', () => {
    it('should be valid YAML', () => {
      expect(() => {
        configData = yaml.parse(configContent);
      }).not.toThrow();
    });

    it('should parse to an object', () => {
      configData = yaml.parse(configContent);
      expect(typeof configData).toBe('object');
      expect(configData).not.toBeNull();
    });

    it('should not contain YAML syntax errors', () => {
      const parsed = yaml.parse(configContent);
      expect(parsed).toBeDefined();
    });
  });

  describe('Top-Level Structure', () => {
    beforeEach(() => {
      configData = yaml.parse(configContent);
    });

    it('should have a "reviews" section', () => {
      expect(configData).toHaveProperty('reviews');
    });

    it('should have reviews as an object', () => {
      expect(typeof configData.reviews).toBe('object');
      expect(configData.reviews).not.toBeNull();
    });

    it('should not have unexpected top-level keys', () => {
      const validTopLevelKeys = ['reviews', 'language', 'early_access', 'enable_free_tier'];
      const actualKeys = Object.keys(configData);
      
      actualKeys.forEach(key => {
        expect(validTopLevelKeys).toContain(key);
      });
    });
  });

  describe('Reviews Section - Required Fields', () => {
    beforeEach(() => {
      configData = yaml.parse(configContent);
    });

    it('should have a profile field', () => {
      expect(configData.reviews).toHaveProperty('profile');
    });

    it('should have profile set to a valid value', () => {
      const validProfiles = ['chill', 'assertive', 'aggressive'];
      expect(validProfiles).toContain(configData.reviews.profile);
    });

    it('should have request_changes_workflow field', () => {
      expect(configData.reviews).toHaveProperty('request_changes_workflow');
    });

    it('should have request_changes_workflow as boolean', () => {
      expect(typeof configData.reviews.request_changes_workflow).toBe('boolean');
    });

    it('should have high_level_summary field', () => {
      expect(configData.reviews).toHaveProperty('high_level_summary');
    });

    it('should have high_level_summary as boolean', () => {
      expect(typeof configData.reviews.high_level_summary).toBe('boolean');
    });
  });

  describe('Reviews Section - Current Configuration', () => {
    beforeEach(() => {
      configData = yaml.parse(configContent);
    });

    it('should have profile set to "assertive"', () => {
      expect(configData.reviews.profile).toBe('assertive');
    });

    it('should have request_changes_workflow set to true', () => {
      expect(configData.reviews.request_changes_workflow).toBe(true);
    });

    it('should have high_level_summary set to true', () => {
      expect(configData.reviews.high_level_summary).toBe(true);
    });

    it('should have poem field', () => {
      expect(configData.reviews).toHaveProperty('poem');
    });

    it('should have poem set to false', () => {
      expect(configData.reviews.poem).toBe(false);
    });

    it('should have review_status field', () => {
      expect(configData.reviews).toHaveProperty('review_status');
    });

    it('should have review_status set to true', () => {
      expect(configData.reviews.review_status).toBe(true);
    });
  });

  describe('Reviews Section - Auto Review Configuration', () => {
    beforeEach(() => {
      configData = yaml.parse(configContent);
    });

    it('should have auto_review section', () => {
      expect(configData.reviews).toHaveProperty('auto_review');
    });

    it('should have auto_review as an object', () => {
      expect(typeof configData.reviews.auto_review).toBe('object');
      expect(configData.reviews.auto_review).not.toBeNull();
    });

    it('should have auto_review.enabled field', () => {
      expect(configData.reviews.auto_review).toHaveProperty('enabled');
    });

    it('should have auto_review.enabled as boolean', () => {
      expect(typeof configData.reviews.auto_review.enabled).toBe('boolean');
    });

    it('should have auto_review.enabled set to true', () => {
      expect(configData.reviews.auto_review.enabled).toBe(true);
    });

    it('should have auto_review.drafts field', () => {
      expect(configData.reviews.auto_review).toHaveProperty('drafts');
    });

    it('should have auto_review.drafts as boolean', () => {
      expect(typeof configData.reviews.auto_review.drafts).toBe('boolean');
    });

    it('should have auto_review.drafts set to false', () => {
      expect(configData.reviews.auto_review.drafts).toBe(false);
    });
  });

  describe('Configuration Consistency', () => {
    beforeEach(() => {
      configData = yaml.parse(configContent);
    });

    it('should have consistent boolean types', () => {
      const booleanFields = [
        configData.reviews.request_changes_workflow,
        configData.reviews.high_level_summary,
        configData.reviews.poem,
        configData.reviews.review_status,
        configData.reviews.auto_review.enabled,
        configData.reviews.auto_review.drafts,
      ];

      booleanFields.forEach(field => {
        expect(typeof field).toBe('boolean');
      });
    });

    it('should have assertive profile with appropriate settings', () => {
      expect(configData.reviews.profile).toBe('assertive');
      expect(configData.reviews.request_changes_workflow).toBe(true);
    });

    it('should not have deprecated or removed fields', () => {
      // collapse_ellipsis was removed in the update
      expect(configData.reviews).not.toHaveProperty('collapse_ellipsis');
    });
  });

  describe('File Format and Style', () => {
    it('should use proper YAML indentation', () => {
      const lines = configContent.split('\n');
      const indentedLines = lines.filter(line => line.startsWith('  '));
      
      // Should have indented lines for nested structure
      expect(indentedLines.length).toBeGreaterThan(0);
    });

    it('should not have trailing whitespace on lines', () => {
      const lines = configContent.split('\n');
      lines.forEach((_line) => {
        if (_line.length > 0) {
          expect(_line).not.toMatch(/\s$/);
        }
      });
    });

    it('should use consistent key-value format', () => {
      const lines = configContent.split('\n').filter(line => line.includes(':'));
      lines.forEach(line => {
        if (!line.trim().endsWith(':')) {
          // Key-value pairs should have format "key: value"
          expect(line).toMatch(/:\s/);
        }
      });
    });

    it('should end with a newline', () => {
      expect(configContent.endsWith('\n')).toBe(true);
    });
  });

  describe('Schema Validation', () => {
    beforeEach(() => {
      configData = yaml.parse(configContent);
    });

    it('should only have valid boolean values (not string "true"/"false")', () => {
      const checkBooleans = (obj: any, path: string = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            checkBooleans(value, currentPath);
          } else if (key === 'enabled' || key === 'drafts' || 
                     key === 'request_changes_workflow' || 
                     key === 'high_level_summary' || key === 'poem' || 
                     key === 'review_status') {
            expect(typeof value).toBe('boolean');
          }
        }
      };

      checkBooleans(configData);
    });

    it('should have all required fields present', () => {
      const requiredPaths = [
        'reviews.profile',
        'reviews.request_changes_workflow',
        'reviews.high_level_summary',
        'reviews.poem',
        'reviews.review_status',
        'reviews.auto_review.enabled',
        'reviews.auto_review.drafts',
      ];

      requiredPaths.forEach(pathStr => {
        const parts = pathStr.split('.');
        let current = configData;
        
        parts.forEach(part => {
          expect(current).toHaveProperty(part);
          current = current[part];
        });
      });
    });
  });

  describe('Semantic Validation', () => {
    beforeEach(() => {
      configData = yaml.parse(configContent);
    });

    it('should enable auto_review when review features are enabled', () => {
      if (configData.reviews.high_level_summary || configData.reviews.review_status) {
        expect(configData.reviews.auto_review.enabled).toBe(true);
      }
    });

    it('should have request_changes_workflow true for assertive profile', () => {
      if (configData.reviews.profile === 'assertive') {
        expect(configData.reviews.request_changes_workflow).toBe(true);
      }
    });

    it('should not have poem enabled for assertive profile', () => {
      if (configData.reviews.profile === 'assertive') {
        expect(configData.reviews.poem).toBe(false);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle file being parsed multiple times', () => {
      expect(() => {
        yaml.parse(configContent);
        yaml.parse(configContent);
        yaml.parse(configContent);
      }).not.toThrow();
    });

    it('should not contain any malformed YAML anchors or aliases', () => {
      // YAML anchors start with & and aliases with *
      const hasAnchors = configContent.includes('&');
      const hasAliases = configContent.includes('*');

      if (hasAnchors || hasAliases) {
        // If they exist, ensure they're valid by parsing
        expect(() => yaml.parse(configContent)).not.toThrow();
      }
    });

    it('should not contain null values where not expected', () => {
      const checkNulls = (obj: any) => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null) {
            checkNulls(value);
          } else {
            // Critical fields should not be null
            if (['profile', 'enabled', 'drafts'].includes(key)) {
              expect(value).not.toBeNull();
            }
          }
        }
      };

      checkNulls(configData);
    });
  });

  describe('Diff Validation (Changes from main)', () => {
    it('should reflect the updated profile from chill to assertive', () => {
      configData = yaml.parse(configContent);
      expect(configData.reviews.profile).toBe('assertive');
      expect(configData.reviews.profile).not.toBe('chill');
    });

    it('should reflect the updated request_changes_workflow from false to true', () => {
      configData = yaml.parse(configContent);
      expect(configData.reviews.request_changes_workflow).toBe(true);
    });

    it('should reflect the updated poem from true to false', () => {
      configData = yaml.parse(configContent);
      expect(configData.reviews.poem).toBe(false);
    });

    it('should not have the removed collapse_ellipsis field', () => {
      configData = yaml.parse(configContent);
      expect(configData.reviews).not.toHaveProperty('collapse_ellipsis');
    });
  });

  describe('Integration and Compatibility', () => {
    beforeEach(() => {
      configData = yaml.parse(configContent);
    });

    it('should be compatible with CodeRabbit review system', () => {
      // Verify all fields are recognized CodeRabbit fields
      const knownReviewFields = [
        'profile',
        'request_changes_workflow',
        'high_level_summary',
        'poem',
        'review_status',
        'auto_review',
      ];

      Object.keys(configData.reviews).forEach(key => {
        expect(knownReviewFields).toContain(key);
      });
    });

    it('should have a valid configuration for CI/CD integration', () => {
      expect(configData.reviews.auto_review.enabled).toBe(true);
      expect(configData.reviews.review_status).toBe(true);
    });
  });

  describe('File Size and Performance', () => {
    it('should not be excessively large', () => {
      const stats = fs.statSync(configPath);
      // Configuration file should be under 10KB
      expect(stats.size).toBeLessThan(10 * 1024);
    });

    it('should parse quickly', () => {
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        yaml.parse(configContent);
      }
      const end = Date.now();
      const duration = end - start;

      // 100 parses should complete in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});