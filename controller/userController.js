import users from "../model/userModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'

export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        //check if email already exist with user
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json(`User already registered`);
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new users({ name, email, password: hashedPassword });

        //saving new user
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json(`User creation failed: ${error.message}`)
    }
}

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        //check if email is already in database
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: `Invalid Email` });
        }

        //check if the pasword is matching with the database
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(400).json({ message: `Invalid password` });
        }

        //create a token for authentication
        const token = jwt.sign({ id: user.id, }, process.env.JWT_SECRETKEY, { expiresIn: '1h' })
        return res.status(200).json({ message: `User login successful` , token,user: { id: user._id, name: user.name, email: user.email }})
    } catch (error) {
        return res.status(400).json({ error: `User login failed` })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        //check if email already in database
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: `User not found` });
        }

        //updating username
        if (name) {
            user.name = name;
        }

        //hashing for newpassword
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        //saving updated user
        const updatedUser = await user.save();
        res.status(200).json({ message: 'User updated successfully', user: updatedUser })
    } catch (error) {
        res.status(400).json({ message: `User update failed: ${error.message}` })
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        //check id is exist in database
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:'Invalid user Id'})
        }

        // Check if user exists
        const user = await users.findById( id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete user
        const deletedUser = await users.findByIdAndDelete(id);
        console.log("Deleted User:", deletedUser);
        
        // Send success response
        return res.status(200).json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
        // Always send a response for errors
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};