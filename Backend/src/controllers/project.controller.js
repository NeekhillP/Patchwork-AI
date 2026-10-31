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

export const getAllProjectsController = async (req, res) =>{
    try{

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        });

        if (!loggedInUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const allProjects = await projectService.getAllProjects({
            userId: loggedInUser._id
        });;

        res.status(200).json({
            message: 'Projects retrieved successfully',
            projects: allProjects
        });

    } catch(error){
        console.error(error);
        return res.status(500).json({ message: 'Could not retrieve projects. Please try again later' });
    }
}

export const addUserToProjectController = async(req, res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{

        const {projectId, users} = req.body;

        if (!isObjectIdOrHexString(req.user?.id)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const loggedInUser = await userModel.findById(req.user.id).select('_id');

        if (!loggedInUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        });

        return res.status(200).json({
            message: 'Users added to project successfully',
            project
        });

    } catch(error){
        if ([400, 403, 404].includes(error.statusCode)) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid project or user data' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Could not add user to project. Please try again later' });
    }
}
