import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
  text:     { type: String, required: true },
  included: { type: Boolean, default: true },
}, { _id: false });

const premiumPlanSchema = new mongoose.Schema({
  planId:      { type: String, required: true, unique: true }, // 'free' | 'pro' | 'proplus'
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  priceLabel:  { type: String },
  period:      { type: String },
  periodSub:   { type: String, default: null },
  highlighted: { type: Boolean, default: false },
  badge:       { type: String, default: null },
  features:    { type: [featureSchema], default: [] },
});

export default mongoose.model('PremiumPlan', premiumPlanSchema);
