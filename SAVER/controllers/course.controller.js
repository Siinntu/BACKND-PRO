import course from "../models/course.model.js";
import AppError from "../utils/error.utils.js";
import fs from 'fs/promises';
import cloudinary  from 'cloudinary';



const  getAllcourses = async function(req, res, next) {
  try {
    const courses = await course.find({}).select('-lectures')
    res.status(200).json({
        success: true,
        message: 'all courses',
        courses,
    })
  } catch (e) {
    return next(new AppError('course is not get',400))
    
  }
}
const getlectureBycourseId = async function (req, res, next){
  try {
    
  } catch (error) {
    return next(new AppError('course is not get',400))
  }
}

const createCourse = async(req,res,next) => {
 const { title, description, category, createdBy} = req.body;
 if (!title || !description || !category || !createdBy) {
   return next(new AppError('ALL ARE required',400))
   
 }
 const course = await course.create({
  title,
  description,
  category,
  createdBy,
  thumbnail: {
    public_id: {
        type: 'dummy',
        
    },
    secure_url: {
        type: 'dummy',
  
    }
},
   });
    if (!course) {
      return next(new AppError('COURSE DOES NOT CREATE',401))
      
    }

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path,{
        folder: 'lms'
      });

      if (result) { 
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
        
      }
      fs.rm(`uploads/${req.file.filename}`);
      course.save ();
      res.status(200).json({
        success: true,
        message: 'coursde is created successsfuly',
        course,
      })
    }

}
const updateCourse = async(req,res,next) => {
  try {
    const { id } = req.params;
    const course = await course.findByIdAndUpdate(
      id,{
        $set: req.body
      },
      {
        runValidators: true
      }
    );

    if (!course) {
      return next(new AppError('COURSE DOES NOT CREATE',401))
      
    }
    res.status(200).json({
      success: true,
      message: 'course upload successfully',
      course,
    })
  } catch (e) {
    return next(new AppError('e.message',401))
  }
    
}
const removeCourse = async(req,res,next) => {
  try {
    const { id } = req.params;
  const course = await course.findById(id);
  if (!course) {
    return next(new AppError('COURSE DOES NOT CREATE',401))
    
  }
  await course.remove();

  res.status(200).json({
    success: true,
    message: 'course delete succefully'
  })
  } catch (e) {
    return next(new AppError('e.message',401))
  }
}
export{
    getAllcourses,
    getlectureBycourseId,
    createCourse,
    updateCourse,
    removeCourse
}
