// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import auth from '../middleware/auth.js';
// import Post from '../models/Post.js';
// import Comment from '../models/Comment.js';
// import User from '../models/User.js';

// const router = express.Router();

// // ensure uploads directory exists
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: () => uploadsDir,
//   filename: (req, file, cb) => {
//     const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}-${file.originalname.replace(/\s+/g, '_')}`;
//     cb(null, unique);
//   }
// });
// const upload = multer({ storage });

// // Create a post (with optional image)
// router.post('/', auth, upload.single('image'), async (req, res) => {
//   try {
//     const { title, content } = req.body;
//     if (!title) return res.status(400).json({ message: 'Title required' });

//     const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

//     const post = new Post({
//       title,
//       content,
//       image: imagePath,
//       author: req.userId
//     });
//     await post.save();

//     await post.populate('author', 'email');

//     res.json(post);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get latest posts (newest first) — optionally ?limit=20
// router.get('/', async (req, res) => {
//   try {
//     const limit = Math.min(parseInt(req.query.limit || '50'), 200);
//     const posts = await Post.find()
//       .populate('author', 'email')
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .lean();
//     // add likeCount
//     const result = posts.map(p => ({ ...p, likeCount: (p.likes || []).length }));
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get single post + comments
// router.get('/:id', async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id).populate('author', 'email').lean();
//     if (!post) return res.status(404).json({ message: 'Post not found' });

//     const comments = await Comment.find({ post: post._id }).populate('author', 'email').sort({ createdAt: 1 }).lean();

//     post.likeCount = (post.likes || []).length;
//     res.json({ post, comments });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Add comment to post
// router.post('/:id/comment', auth, async (req, res) => {
//   try {
//     const { content } = req.body;
//     if (!content) return res.status(400).json({ message: 'Content required' });

//     const post = await Post.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: 'Post not found' });

//     const comment = new Comment({ post: post._id, content, author: req.userId });
//     await comment.save();
//     await comment.populate('author', 'email');

//     res.json(comment);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Toggle like/upvote
// router.post('/:id/like', auth, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const post = await Post.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: 'Post not found' });

//     const idx = post.likes.findIndex(id => id.toString() === userId.toString());
//     let liked = false;
//     if (idx >= 0) {
//       post.likes.splice(idx, 1);
//       liked = false;
//     } else {
//       post.likes.push(userId);
//       liked = true;
//     }
//     await post.save();
//     res.json({ liked, likeCount: post.likes.length });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// export default router;

// backend/src/routes/posts.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// ensure uploads dir exists
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}-${safe}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'), false);
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Create a post (with optional image)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    // build image url (full) so frontend can use it directly
    let imageUrl = null;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const post = new Post({
      title,
      content: content || '',
      image: imageUrl,
      author: req.userId
    });

    await post.save();
    await post.populate('author', 'email');

    res.status(201).json(post);
  } catch (err) {
    console.error('POST /api/posts error:', err);
    // multer fileFilter/error thrown will come here too
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Get latest posts
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50'), 200);
    const posts = await Post.find()
      .populate('author', 'email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const result = posts.map(p => ({ ...p, likeCount: (p.likes || []).length }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post + comments
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'email').lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: post._id }).populate('author', 'email').sort({ createdAt: 1 }).lean();

    post.likeCount = (post.likes || []).length;
    res.json({ post, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = new Comment({ post: post._id, content, author: req.userId });
    await comment.save();
    await comment.populate('author', 'email');

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const idx = post.likes.findIndex(id => id.toString() === userId.toString());
    let liked = false;
    if (idx >= 0) {
      post.likes.splice(idx, 1);
      liked = false;
    } else {
      post.likes.push(userId);
      liked = true;
    }
    await post.save();
    res.json({ liked, likeCount: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
