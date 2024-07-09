import user from '../models/user.model.js';
import User from '../models/user.model.js';
import AppError from "../utils/error.utils.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import crypto from 'crypto';

const cookiOptions = {
    maxAge: 7 * 24 * 60 * 1000, //7 days
    httpOnly: true,
    secure: true
}

const register = async(req, res, next) => {
    const { fullName, email, password } = req.body;
  
    if(!fullName || !email || !password){
      return next( new AppError('all fields are required', 400));
    }

    const userExists = await User.findOne({ email });
  
//      // If user exists send the reponse
  if (userExists) {
    return next(new AppError('Email already exists', 400));
  }

//   // Create new user with the given necessary data and save to DB
  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url:
        'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
    },
  });

//   // If user not created send message response
  if (!user) {
    return next(
      new AppError('User registration failed, please try again later', 400)
    );
  }

//     //TODO: FILE UPLOAD

if (req.file){
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path,{
      folder: 'lms',
      width: 250,
      height: 250,
      gravity: 'faces',
      crop: 'fill'
    });
    if (result) {
      user.avatar.public_id = result.public_id;
      user.avatar.secure_url = result.secure_url;

      //remove file from server
      fs.rm(`uploads/${req.file.filename}`)
    }
  } catch (error) {
    return next( new AppError('FILE NOT UPLOAD ,PLEASE TRY AGAIN',501)
    )
  }
}
    await user.save();

    user.password = undefined;
    const token = await user.generateJWTToken();

    res.cookie('token', token, cookiOptions)

    res.status(201).json({
      success: true,
      message: 'user registered successfully',
      user,
    })
  };
  const login = async(req, res, next) => {
    try {
        const { email,password } = req.body;

    if (!email || !password){
        return next( new AppError('All fields are required',400))
    }
    const userExists = await user.findOne({
         email 
        }).select('+password');
        if (!user || !user.comparepassword(password)){
            return next(new AppError('email or password does not match',400))
        }

        const token = await user.generateJWTToken();
        user.password = undefined;
        res.cookie('token', token, cookiOptions);

        res.status(200).json({
            success: true,
            message: 'user loggedin successfully',
            user,
        });

    } catch (e) {
        return next(new AppError(e.mesage,500))
    }
  
  };
  const logout = (req,res) => {
   res.cookie('token', null,{
    secure: true,
    maxAge:0,
    httpOnly: true,
   });
   res.status(200).json({
    success: true,
    message: 'user logged out succesfully'
   })
  };
  const getProfile = async (req,res) => {
      try {
        const userId = req.user.id;
        const user = await user.findById(userId);

        res.status(200).json({
            success: true,
            mesage: 'user details',
            user
        });
      } catch (error) {
        return next (new AppError('failed to fetch data',500))
      }

  };
  const forgotpassword = async(req, res, next)=>{
    const {email} = req.body;
    if (!email) {
      return next(new AppError('email is required',400));
    }
    const user = await user.findOne({email});
    if (!user) {
      return next(new AppError('email is not registered',400));
    }
    const resetToken = await user.generatePasswordResetToken();
     await user.save();
     const resetpasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const message = `${resetpasswordURL}`;
     try {
      await sendEmail(email,subject,message);
      res.status(200).json({
        success: true,
        message: 'Reset password token has been sent to ${email} succesfully '

      })
     } catch (e) {
      user.forgotpasswordExpiry = undefined;
      user.forgotpasswordToken = undefined;
      return next(new AppError('e.message',400));
     }
  }
  const resetpassword = async ()=>{
    const { resetToken } = req.params;
    const { password } = req.body;

    const forgotpasswordToken = Crypto
    .createhash('sha256')
    .update(resetToken)
    .digest('hex');
      
    const user = await user.findOne({
      forgotpasswordToken,
      forgotpasswordExpiry: { $gt: Date.now()}
    });

    if (!user){
      return next(
        new AppError('token is invalid or expired, please try again ',400))

    }
     user.password = password;
     user.forgotpasswordToken = undefined;
     user.forgotpasswordExpiry = undefined;

     user.save();
     res.status(200).json({
      success: true,
      message: 'password changed successfully!'
     })
  }
  const changepassword = async() =>{
 const { oldpassword, newpassword } = req.body;
  const {id} = req.user;

  if (!oldpassword || !newpassword) {
    return next(new AppError('all field are required',400))

  }
  const user =await user.findById(id).select('+password');

  if (!user) {
    return next(new AppError('user is not registered',400))

    
  }
  const ispasswordvalid = await user.comparepassword(oldpassword);
  if (!ispasswordvalid) {
    return next (new AppError('invalid old password',400))
  }
  user.password = newpassword;
  await user.save();
  user.password = undefined;
  res.status(200).json({
    success: true,
    message: 'password changed successfully!'
  });


  }
  const updateuser = async () => {
   const { fullName } = req.body;
   const { id } = req.user.id;

   const user = await user.findById(id);
   if (!user) {
    return next(new AppError('user does not exist',400));
   }
   if (req.fullName) {
    user.fullName = fullName;

    
   }
   if (req.file) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);


    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path,{
        folder: 'lms',
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill'
      });
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
  
        //remove file from server
        fs.rm(`uploads/${req.file.filename}`)
      }
    } catch (error) {
      return next( new AppError('FILE NOT UPLOAD ,PLEASE TRY AGAIN',501))
    }
  }
  await user.save();
  res.status(200).json({
    success: true,
    mesage: 'all are done'
  })
    
}
  
  
  
  export {
      register,
      login,
      logout,
      getProfile,
      forgotpassword,
      resetpassword,
      changepassword,
      updateuser
  }