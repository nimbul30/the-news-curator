const { normalizeUrl } = require('../utils/url-normalizer');

describe('URL Normalizer', () => {
  describe('HTTP and HTTPS URLs', () => {
    it('should remove http protocol', () => {
      expect(normalizeUrl('http://example.com')).toBe('example.com');
    });

    it('should remove https protocol', () => {
      expect(normalizeUrl('https://example.com')).toBe('example.com');
    });

    it('should handle mixed case protocols', () => {
      expect(normalizeUrl('HTTP://example.com')).toBe('example.com');
      expect(normalizeUrl('HTTPS://example.com')).toBe('example.com');
    });
  });

  describe('WWW prefix handling', () => {
    it('should remove www prefix', () => {
      expect(normalizeUrl('www.example.com')).toBe('example.com');
    });

    it('should remove www prefix with protocol', () => {
      expect(normalizeUrl('https://www.example.com')).toBe('example.com');
    });

    it('should handle mixed case www', () => {
      expect(normalizeUrl('WWW.example.com')).toBe('example.com');
    });
  });

  describe('Case normalization', () => {
    it('should convert to lowercase', () => {
      expect(normalizeUrl('EXAMPLE.COM')).toBe('example.com');
    });

    it('should convert mixed case to lowercase', () => {
      expect(normalizeUrl('Example.Com/Path')).toBe('example.com/path');
    });
  });

  describe('Trailing slashes', () => {
    it('should remove single trailing slash', () => {
      expect(normalizeUrl('example.com/')).toBe('example.com');
    });

    it('should remove multiple trailing slashes', () => {
      expect(normalizeUrl('example.com///')).toBe('example.com');
    });

    it('should remove trailing slash from path', () => {
      expect(normalizeUrl('example.com/path/')).toBe('example.com/path');
    });
  });

  describe('Complete URL normalization', () => {
    it('should normalize complete URL with all variations', () => {
      expect(normalizeUrl('HTTPS://WWW.Example.COM/Path/')).toBe(
        'example.com/path'
      );
    });

    it('should handle URLs with query parameters', () => {
      expect(normalizeUrl('https://www.example.com/page?id=123')).toBe(
        'example.com/page?id=123'
      );
    });

    it('should handle URLs with fragments', () => {
      expect(normalizeUrl('https://example.com/page#section')).toBe(
        'example.com/page#section'
      );
    });
  });

  describe('Non-URL strings', () => {
    it('should handle plain text without protocol', () => {
      expect(normalizeUrl('Government Report 2024')).toBe(
        'government report 2024'
      );
    });

    it('should handle document names', () => {
      expect(normalizeUrl('Annual Budget Report')).toBe('annual budget report');
    });

    it('should handle strings with special characters', () => {
      expect(normalizeUrl('Report: Q1-2024')).toBe('report: q1-2024');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(normalizeUrl('')).toBe('');
    });

    it('should handle null', () => {
      expect(normalizeUrl(null)).toBe('');
    });

    it('should handle undefined', () => {
      expect(normalizeUrl(undefined)).toBe('');
    });

    it('should handle whitespace-only string', () => {
      expect(normalizeUrl('   ')).toBe('');
    });

    it('should trim leading and trailing whitespace', () => {
      expect(normalizeUrl('  example.com  ')).toBe('example.com');
    });

    it('should handle non-string input', () => {
      expect(normalizeUrl(123)).toBe('');
    });
  });

  describe('Real-world examples', () => {
    it('should normalize variations of the same URL to identical strings', () => {
      const variations = [
        'https://www.example.com/',
        'http://www.example.com',
        'HTTPS://Example.com/',
        'www.example.com',
        'example.com',
      ];

      const normalized = variations.map(normalizeUrl);
      const allSame = normalized.every((url) => url === 'example.com');
      expect(allSame).toBe(true);
    });

    it('should handle government document URLs', () => {
      expect(
        normalizeUrl('https://www.whitehouse.gov/briefing-room/statements/')
      ).toBe('whitehouse.gov/briefing-room/statements');
    });

    it('should handle news source URLs', () => {
      expect(
        normalizeUrl(
          'https://www.reuters.com/article/us-politics-idUSKBN123456'
        )
      ).toBe('reuters.com/article/us-politics-iduskbn123456');
    });
  });
});
