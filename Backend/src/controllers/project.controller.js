import { isObjectIdOrHexString } from 'mongoose';
import * as projectService from '../services/project.service.js';
import { validationResult } from 'express-validator';
import userModel from '../models/user.model.js';

export const createProjectController = async (req, res)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        if (!isObjectIdOrHexString(req.user?.id)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const loggedInUser = await userModel.findById(req.user.id).select('_id');
        if (!loggedInUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    
        const newProject = await projectService.createProject({
            name: req.body.name,
            userId: loggedInUser._id
        })
        
        return res.status(201).json({
            message: 'Project created successfully',
            project: newProject
        });

    } catch(error){
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A project with this name already exists' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid project data' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Could not create project. Please try again later' });
    }
}
