import { IUser } from '../models/User';  // Adjust the path as necessary

declare global {
    namespace Express {
        interface Request {
            user?: IUser;  // Extend the Request interface to include the `user` property
        }
    }
}
