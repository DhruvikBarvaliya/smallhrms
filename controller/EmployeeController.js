const Employee = require('../models/employee');

// Create Employee
const createEmployee = async (req, res) => {
    try {
        const employeeData = req.body;
        
        // Generate employee ID if not provided
        if (!employeeData.employeeId) {
            const count = await Employee.countDocuments();
            employeeData.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
        }

        const employee = new Employee(employeeData);
        await employee.save();
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
};

// Get All Employees
const getAllEmployees = async (req, res) => {
    try {
        const { page = 1, limit = 10, department, isActive } = req.query;
        const filter = {};
        
        if (department) filter.department = department;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const employees = await Employee.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Employee.countDocuments(filter);

        res.json({
            success: true,
            data: employees,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};

// Get Employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
};

// Update Employee
const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee deactivated successfully',
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};