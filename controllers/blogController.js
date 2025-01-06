import Blog from '../models/blogSchema.js';



export const createBlog = async (req, res) => {
    console.log('Request Body:', req.body);  // Log the body (should include title and content)
    console.log('Uploaded File:', req.file);  // Log the uploaded file (should not be undefined)
  
    const { title, content } = req.body;
  
    // Check if title and content are present
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
  
    try {
      // Save the image URL from Cloudinary if uploaded
      const imageUrl = req.file ? req.file.path : ' ';
  
      // Create a new blog post
      const blog = new Blog({
        title,
        content,
        image: imageUrl,  // Save the image URL (if available)
      });
  
      await blog.save();  // Save the blog to the database
      res.status(201).json(blog);  // Return the saved blog as a response
    } catch (error) {
      console.error('Error creating blog:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  // Controller to fetch all blogs
  export const getBlogs = async (req, res) => {
    try {
      const blogs = await Blog.find().sort({ createdAt: -1 }); // Sort by newest first
      res.status(200).json(blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
















// Update a blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params; // Get blog ID from URL
    const { title, content } = req.body; // Extract data from request body
    const image = req.file ? `/uploads/${req.file.filename}` : undefined; // Check for updated image

    // Prepare the update object
    const updateData = { title, content };
    if (image) updateData.image = image;

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,                  // Find blog by ID
      updateData,          // Update fields
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Failed to update blog' });
  }
};


// Delete a blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Failed to delete blog' });
  }
};
