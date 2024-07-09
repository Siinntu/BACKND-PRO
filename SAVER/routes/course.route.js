import { Router } from 'express';
import { getAllcourses, getlectureBycourseId, createCourse, removeCourse,updateCourse } from '../controllers/course.controller.js';
import upload from '../middleware/multer.middleware.js';
import { authorizedRoles, isloggedIn } from '../middleware/auth.middleware.js';
 const router = Router();

 router.route('/')
.get(getAllcourses)
.post( 
    isloggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
);

 router.route('/:id')
 . get(isloggedIn,getlectureBycourseId)
 .put(
    isloggedIn,
    authorizedRoles('ADMIN'),
    updateCourse)
 .delete(
    isloggedIn,
    authorizedRoles('ADMIN'),
    removeCourse);

 export default router;

 
