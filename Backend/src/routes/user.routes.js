import {Router} from 'express';
import * as userController from '../controllers/user.controller.js';
import {body} from 'express-validator';
import { authUserMiddleware } from '../middleware/auth.middleware.js';

const router = Router();


/**
 * @route POST /users/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', 
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    userController.createUserController);

/**
 * @route POST /users/login
 * @desc Login a user
 * @access Public
 */
router.post('/login',
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    userController.loginUserController
)

/**
 * @route GET /users/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authUserMiddleware, userController.getUserProfileController);


export default router;