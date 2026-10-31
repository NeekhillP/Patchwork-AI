import {Router} from 'express';
import {body} from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import {authUserMiddleware} from '../middleware/auth.middleware.js';
import { PROJECT_NAME_MAX_LENGTH } from '../constants/project.constants.js';

const router = Router();


/**
 * @route POST /projects/create
 * @desc Create a new project
 * @access Private
 */
router.post('/create', 
    authUserMiddleware,
    body('name')
        .isString().withMessage('Name must be a string')
        .bail()
        .trim()
        .notEmpty().withMessage('Name is required')
        .bail()
        .custom((name) => name.length <= PROJECT_NAME_MAX_LENGTH)
        .withMessage(`Name must be at most ${PROJECT_NAME_MAX_LENGTH} characters long`),
    projectController.createProjectController
)
    
/**
 * @route GET /projects/all
 * @desc Get all projects for the logged-in user
 * @access Private
 */
router.get('/all', authUserMiddleware, projectController.getAllProjectsController)

/**
 * @route PUT /projects/add-users
 * @desc Add users to a project
 * @access Private
 */
router.put('/add-users',
    authUserMiddleware,
    body('projectId')
        .isString().withMessage('Project ID must be a string')
        .bail()
        .isMongoId().withMessage('A valid project ID is required')
        .bail(),
    body('users')
        .isArray({ min: 1 }).withMessage('Users must be a non-empty array')
        .bail(),
    body('users.*')
        .isString().withMessage('Each user ID must be a string')
        .bail()
        .isMongoId().withMessage('Each user ID must be a valid MongoDB ID'),
    projectController.addUserToProjectController
);


router.get('/:projectId',
    authUserMiddleware,
    projectController.getProjectByIdController
)

export default router;
