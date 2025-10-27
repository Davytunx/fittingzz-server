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
 *     summary: Register new user
 *     tags: [Auth]
 */
router.post('/register', validateBody(signupSchema), userController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
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
 *     summary: Verify email address with 6-digit code
 *     tags: [Auth]
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
 *     tags: [Auth]
 */
router.post('/forgot-password', verificationCodeRateLimit, validateBody(requestPasswordResetSchema), userController.requestPasswordReset);

/**
 * @swagger
 * /auth/verify-reset-code:
 *   post:
 *     summary: Verify password reset code
 *     tags: [Auth]
 */
router.post('/verify-reset-code', verificationAttemptRateLimit, validateBody(verifyResetCodeSchema), userController.verifyResetCode);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
router.post('/reset-password', verificationAttemptRateLimit, validateBody(resetPasswordSchema), userController.resetPassword);

export default router;