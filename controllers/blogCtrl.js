const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asynchandler = require("express-async-handler");
const fs = require("fs");
const validateMongoDbId = require("../utils/validateMongodbId");

const createBlog = asynchandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const updateBlog = asynchandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const getBlog = asynchandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getBlog = await Blog.findById(id).populate("disLikes");
    await Blog.findByIdAndUpdate(
      id,
      {
        $inc: {
          numViews: 1,
        },
      },
      {
        new: true,
      }
    );
    res.json(getBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBlogs = asynchandler(async (req, res) => {
  try {
    const getBlogs = await Blog.find();
    res.json(getBlogs);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBlog = asynchandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteBlog = await Blog.findByIdAndDelete(id);
    res.json(deleteBlog);
  } catch (error) {
    throw new Error(error);
  }
});

const likeBlog = asynchandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);

  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  // Find the login User
  const loginUserId = req?.user?._id;
  // Find if the user has liked the blog
  const isLiked = blog?.isLiked;
  // Find if the user has disliked the blog
  const alreadyDisliked = blog?.disLikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { disLikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
});

const dislikeBlog = asynchandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);

  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  // Find the login User
  const loginUserId = req?.user?._id;
  // Find if the user has liked the blog
  const isDisliked = blog?.isDisliked;
  // Find if the user has disliked the blog
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { disLikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { disLikes: loginUserId },
        isDisliked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
});

const uploadImages = asynchandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (let file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => file),
      },
      {
        new: true,
      }
    );
    res.json(findBlog);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
};
