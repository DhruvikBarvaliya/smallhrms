const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      match: [/^[a-zA-Z\s]+$/, "Name should contain only letters and spaces"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    department: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    salary: {
      type: Number,
      min: [0, "Salary must be positive"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Leave tracking
    leaveBalance: {
      type: Number,
      default: 18, // Annual leave balance
    },
    monthlyLeaveAccrued: {
      type: Number,
      default: 1.5, // Monthly leave accrual
    },
    extraHoursBalance: {
      type: Number,
      default: 6, // Extra hours for late coming/early going
    },
    // Additional fields
    dateOfBirth: {
      type: Date,
    },
    qualification: {
      type: String,
    },
    passOutYear: {
      type: Number,
      min: [2000, "Year must be after 2000"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    reference: {
      type: String,
    },
    releaseDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
