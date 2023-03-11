const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asynchandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createBlog = asynchandler(async (req, res) => {});

module.exports = { createBlog };
