describe("Validation", () => {
    const { validation } = require('../src/controllers/authController');
    test('should return null for valid email and password', () => {
        const result = validation('test@example.com', 'ValidPass123!');
        expect(result).toBeNull();
    }); 
});

describe('Validation - Registration', () => {
    const { validation } = require('../src/controllers/authController');
    test('should return errors for invalid registration password', () => {

        const result = validation('test@example.com', 'weakpass', { isRegistration: true });
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
});