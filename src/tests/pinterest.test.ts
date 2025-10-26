import { describe, it, expect } from '@jest/globals';
import { PinterestAuthDto } from '../modules/user/user.dto.js';

describe('Pinterest Authentication', () => {

  it('should validate Pinterest auth data structure', () => {
    const pinterestAuthData: PinterestAuthDto = {
      businessName: 'Test Fashion Studio',
      email: 'test@example.com',
      pinterestId: 'pinterest123',
      pinterestUsername: 'testuser',
      accessToken: 'pinterest_access_token',
      contactNumber: '1234567890',
      address: '123 Fashion Street',
    };

    expect(pinterestAuthData.businessName).toBe('Test Fashion Studio');
    expect(pinterestAuthData.email).toBe('test@example.com');
    expect(pinterestAuthData.pinterestId).toBe('pinterest123');
    expect(pinterestAuthData.accessToken).toBe('pinterest_access_token');
  });

  it('should handle optional fields in Pinterest auth', () => {
    const minimalPinterestAuth: PinterestAuthDto = {
      businessName: 'Test Studio',
      email: 'test@example.com',
      pinterestId: 'pinterest123',
      pinterestUsername: 'testuser',
      accessToken: 'token',
    };

    expect(minimalPinterestAuth.contactNumber).toBeUndefined();
    expect(minimalPinterestAuth.address).toBeUndefined();
  });
});