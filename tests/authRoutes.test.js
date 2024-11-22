const request = require('supertest');
const app = require('../backend/index'); // Path to your main app file
const User = require('../backend/models/user');

// Mock database functions if needed
jest.mock('../backend/models/user', () => ({
    getByEmail: jest.fn(),
    validatePassword: jest.fn(),
}));

describe('Auth Routes', () => {
    describe('POST /api/auth/login', () => {
        it('should return 400 if email or password is missing', async () => {
            const response = await request(app).post('/api/auth/login').send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email and password are required');
        });

        it('should return 404 if user is not found', async () => {
            User.getByEmail.mockImplementation((email, callback) => callback(null, null));

            const response = await request(app).post('/api/auth/login').send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('User not found');
        });

        it('should return 401 if password is invalid', async () => {
            User.getByEmail.mockImplementation((email, callback) =>
                callback(null, { id: 1, email: 'user@example.com', password: 'hashedpassword' })
            );
            User.validatePassword.mockImplementation((password, hashedPassword, callback) =>
                callback(null, false)
            );

            const response = await request(app).post('/api/auth/login').send({
                email: 'user@example.com',
                password: 'wrongpassword',
            });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });

        it('should return 200 and a token for valid credentials', async () => {
            User.getByEmail.mockImplementation((email, callback) =>
                callback(null, { id: 1, email: 'user@example.com', password: 'hashedpassword' })
            );
            User.validatePassword.mockImplementation((password, hashedPassword, callback) =>
                callback(null, true)
            );

            const response = await request(app).post('/api/auth/login').send({
                email: 'user@example.com',
                password: 'correctpassword',
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });
    });

    describe('POST /api/auth/verify-token', () => {
        it('should return 400 if token is missing', async () => {
            const response = await request(app).post('/api/auth/verify-token').send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Token is required');
        });
    });
});
