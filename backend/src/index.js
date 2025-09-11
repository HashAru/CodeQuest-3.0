// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import authRoutes from './routes/auth.js';

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);

// const PORT = process.env.PORT || 4000;

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(()=>{ console.log('Mongo connected'); app.listen(PORT, ()=>console.log(`Server running on ${PORT}`)); })
//   .catch(err=>{ console.error('DB error', err); process.exit(1); });

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import ideRoutes from './routes/ide.js';
import profilesRoutes from './routes/profiles.js';
import aiRoutes from './routes/ai.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// serve uploads
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);

app.use('/api/ide', ideRoutes);

app.use('/api/profiles', profilesRoutes);

app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>{ console.log('Mongo connected'); app.listen(PORT, ()=>console.log(`Server running on ${PORT}`)); })
  .catch(err=>{ console.error('DB error', err); process.exit(1); });
