import express from 'express';
import { getBlogs, updateBlog, deleteBlog } from '../controllers/blogController.js';

import { upload } from '../middlewares/uploadMiddleware.js';
import Blog from '../models/blogSchema.js';

const blogRoute = express.Router();






blogRoute.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Get the image URL

    const newBlog = new Blog({
      title,
      content,
      image: imageUrl, // Store the image URL
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating blog post' });
  }
});


blogRoute.get('/', getBlogs); // Get all blogs


blogRoute.put('/:id', upload.single('image'), updateBlog); // Update a blog
blogRoute.delete('/:id', deleteBlog);// Delete a blog







export default blogRoute;
