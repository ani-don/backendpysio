import multer from 'multer';
import path from 'path';
import express from 'express';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});



const app = express();

// Serve the 'uploads' folder as a static resource
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

export const upload = multer({ storage, fileFilter });
