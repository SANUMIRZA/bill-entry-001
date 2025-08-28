const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/bills", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Schema
const entrySchema = new mongoose.Schema({
  name: String,
  village: String,
  trolley: String,
  colour: String,
  billNo: String,
  date: String,
  status: { type: String, default: "Pending" },
  year: Number,
});

const Entry = mongoose.model("Entry", entrySchema);

// ✅ API Routes
app.get("/entries", async (req, res) => {
  const entries = await Entry.find();
  res.json(entries);
});

app.post("/entries", async (req, res) => {
  const entry = new Entry(req.body);
  await entry.save();
  res.json(entry);
});

app.put("/entries/:id", async (req, res) => {
  const updated = await Entry.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete("/entries/:id", async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
