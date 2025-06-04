const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes/router");
const setupSwagger = require("./swagger");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// MongoDB Connection with automatic database creation
const connectDB = async () => {
  try {
    let dburl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hrms";
    // Default to local MongoDB if no environment variable is set
    // If using MongoDB Atlas, replace with your connection string

    const conn = await mongoose.connect(dburl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: "majority",
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Create collections if they don't exist
    await createCollections();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Function to create collections and ensure database exists
const createCollections = async () => {
  try {
    const db = mongoose.connection.db;

    // List existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    // Create collections if they don't exist
    if (!collectionNames.includes("employees")) {
      await db.createCollection("employees");
      console.log("Employees collection created");
    }

    if (!collectionNames.includes("leaves")) {
      await db.createCollection("leaves");
      console.log("Leaves collection created");
    }

    if (!collectionNames.includes("attendances")) {
      await db.createCollection("attendances");
      console.log("Attendances collection created");
    }

    console.log("All collections are ready");
  } catch (error) {
    console.error("Error creating collections:", error.message);
  }
};

// Connect to MongoDB
connectDB();
setupSwagger(app);
// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`HRMS Server running on port ${PORT}`);
});

module.exports = app;
