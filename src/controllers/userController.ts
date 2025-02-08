import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import userModel, { IUser } from "../models/users_model";

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userModel.findById(req.params.id).select("-password -refreshToken");
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
            return;
        }
        res.status(StatusCodes.OK).json(user);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Error fetching user profile",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = req.body;
        const updateData: Partial<IUser> = { username };

        if (req.file) {
            updateData.profilePicture = `/uploads/${req.file.filename}`; // ✅ Handle image uploads
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
            return;
        }

        res.status(StatusCodes.OK).json(updatedUser);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Error updating profile",
            details: err instanceof Error ? err.message : "Unknown error"
        });
    }
};

