import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js"

export const createUserController = async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try{
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT();

        res.status(201).json({
            message: "User created successfully",
            user: { id: user._id, email: user.email },
            token
        })
    } catch(error){
        res.status(500).json({
            message: error.message
        })
    }
}

export const loginUserController = async (req, res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try{
        const {email , password} = req.body;

        const user = await userModel.findOne({email}).select('+password');

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await user.comparePassword(password);

       if(!isMatch){
            return res.status(400).json({
                message: "Invalid credentials"
            });
       }
       
       const token = await user.generateJWT();

       res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                email: user.email
            },
            token
       })
    } catch(error){
        res.status(500).json({
            message: error.message
        })
    }
}

export const getUserProfileController = async (req, res) => {
    res.status(200).json({
        message: "User profile fetched successfully",
        user: req.user
    })
}

export const logoutUserController = async (req, res) =>{
    try{
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        await redisClient.set(token, "logout", "EX", 60 * 60 * 24);

        res.status(200).json({
            message: "User logged out successfully"
        })

    } catch(error){
        res.status(400).json({
            message: error.message
        })
    }
}
