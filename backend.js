// backend.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const path = require("path");


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const FILE_PATH = "data.json";

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });
//upload endpoint
    app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});


// Save data
app.post("/save", (req, res) => {
  fs.writeFile(FILE_PATH, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).json({ message: "Failed to save data" });
    res.json({ message: "Data saved successfully!" });
  });
});

// Load data
app.get("/load", (req, res) => {
  if (!fs.existsSync(FILE_PATH)) return res.json({});
  fs.readFile(FILE_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Failed to load data" });
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
