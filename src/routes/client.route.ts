import { Router } from 'express';
import { clientController } from '../modules/client/client.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *         adminId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateClientRequest:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - email
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           maxLength: 20
 *           example: "1234567890"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           example: "john.doe@example.com"
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *           example: "Male"
 */

/**
 * @swagger
 * /api/v1/clients:
 *   post:
 *     summary: Create a new client with performance tracking
 *     description: Creates a new client with sub-400ms response time and background analytics
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClientRequest'
 *     responses:
 *       201:
 *         description: Client created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, clientController.createClient.bind(clientController));

/**
 * @swagger
 * /api/v1/clients/stats:
 *   get:
 *     summary: Get comprehensive client statistics
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticate, clientController.getClientStats.bind(clientController));

/**
 * @swagger
 * /api/v1/clients:
 *   get:
 *     summary: Get all clients with pagination and search
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, clientController.getClients.bind(clientController));

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   get:
 *     summary: Get a client by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, clientController.getClientById.bind(clientController));

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   put:
 *     summary: Update a client by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticate, clientController.updateClient.bind(clientController));

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   delete:
 *     summary: Delete a client by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, clientController.deleteClient.bind(clientController));

export default router;