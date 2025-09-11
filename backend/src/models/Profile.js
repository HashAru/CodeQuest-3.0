// backend/src/models/Profile.js
import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['codeforces', 'leetcode'], required: true },
  handle: { type: String, required: true }, // username/handle
  url: { type: String, required: true },
  data: { type: Object, default: {} }, // aggregated stats and caches
  lastFetchedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
