import { Router } from 'express';
import { userController } from '../modules/user/user.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificationCodeRateLimit, verificationAttemptRateLimit } from '../middleware/verification.middleware.js';
import { signupSchema, loginSchema, updateProfileSchema, resendVerificationSchema, verifyEmailSchema, requestPasswordResetSchema, verifyResetCodeSchema, resetPasswordSchema } from '../modules/user/user.validation.js';

const router: Router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new fashion designer
 *     description: Create a new user account for fashion designers. Sends email verification code.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - email
 *               - password
 *               - contactNumber
 *               - address
 *             properties:
 *               businessName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Fashion business name
 *                 example: "Elegant Designs Studio"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Business email address
 *                 example: "designer@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
 *                 description: Strong password with uppercase, lowercase, and number
 *                 example: "SecurePass123"
 *               contactNumber:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 20
 *                 description: Business contact number
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 minLength: 10
 *                 description: Business address
 *                 example: "123 Fashion Street, Design City"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateBody(signupSchema), userController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login fashion designer
 *     description: Authenticate user with email and password. Requires email verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "designer@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "SecurePass123"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only authentication cookie
 *             schema:
 *               type: string
 *               example: "auth_token=jwt_token_here; HttpOnly; Secure; SameSite=Strict"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         requiresVerification:
 *                           type: boolean
 *                           example: true
 *                         email:
 *                           type: string
 *                           example: "designer@example.com"
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateBody(loginSchema), userController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 */
router.post('/logout', userController.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile', authenticate, validateBody(updateProfileSchema), userController.updateProfile);

/**
 * @swagger
 * /auth/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/account', authenticate, userController.deleteAccount);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email with 6-digit code
 *     description: Verify user email address using 6-digit code sent via email
 *     tags: [Email Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "designer@example.com"
 *               code:
 *                 type: string
 *                 pattern: "^\\d{6}$"
 *                 description: 6-digit verification code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid or expired code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many verification attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify-email', verificationAttemptRateLimit, validateBody(verifyEmailSchema), userController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 */
router.post('/resend-verification', verificationCodeRateLimit, validateBody(resendVerificationSchema), userController.resendVerificationEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset code
 *     description: Send 6-digit password reset code to user email
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "designer@example.com"
 *     responses:
 *       200:
 *         description: Reset code sent (or email doesn't exist)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "Password reset code sent to your email"
 *       429:
 *         description: Too many reset requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', verificationCodeRateLimit, validateBody(requestPasswordResetSchema), userController.requestPasswordReset);

/**
 * @swagger
 * /auth/verify-reset-code:
 *   post:
 *     summary: Verify password reset code
 *     description: Verify 6-digit reset code and get temporary reset token
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "designer@example.com"
 *               code:
 *                 type: string
 *                 pattern: "^\\d{6}$"
 *                 description: 6-digit reset code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Reset code verified, token provided
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         resetToken:
 *                           type: string
 *                           description: Temporary reset token (5 minutes)
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid or expired reset code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many verification attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify-reset-code', verificationAttemptRateLimit, validateBody(verifyResetCodeSchema), userController.verifyResetCode);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     description: Set new password using temporary reset token from verification step
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: Temporary reset token from verify-reset-code step
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
 *                 description: New strong password
 *                 example: "NewSecurePass123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Password validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-password', verificationAttemptRateLimit, validateBody(resetPasswordSchema), userController.resetPassword);

export default router;