import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Define a custom type for the JWT payload if needed
interface JwtPayload {
    [key: string]: any; // Adjust this based on your actual JWT payload structure
    // For example, if your JWT payload has an `id` and `email` field, you can specify it as:
    // id: string;
    // email: string;
}
// Extend Express Request interface to include user property
declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
    }
}

interface DecodedToken {
    id: string;
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

        // Check if the decoded object has the required 'id' property
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = user;  // Attach user to req
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};


export const authorizeSalesman = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'salesman') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

