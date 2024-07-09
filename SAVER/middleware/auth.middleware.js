import AppError  from "../utils/error.utils.js";
import jwt from 'jsonwebtoken';

const isloggedIn = async (req, res, next)=> {
    const { token } = req.cookies;

    if (!token){
        return next (new AppError('Unauthenticated, please   login again ',402))

    }
    const userDetails = await jwt.verify(token,process.env.JWT_SECRET);
    req.user = userDetails;
    next();
}

const authorizedRoles = (...roles) => async (req, res, next) =>{
    const currentUserRole = req.user.role;
    if (!roles.includes(currentUserRole)) {
        return next(new AppError('you do not have permission to acess this route'))
        
    }
    next();

}
export{
    isloggedIn,
    authorizedRoles
}