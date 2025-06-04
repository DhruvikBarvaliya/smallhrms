const Leave = require('../models/Leave');
const Employee = require('../models/employee');

// Apply for Leave
const applyLeave = async (req, res) => {
    try {
        const { employeeId, leaveType, startDate, endDate, reason } = req.body;
        
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Calculate total days
        let totalDays;
        if (leaveType === 'half_day') {
            totalDays = 0.5;
        } else {
            const timeDiff = end.getTime() - start.getTime();
            totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        }

        const leave = new Leave({
            employeeId,
            leaveType,
            startDate: start,
            endDate: end,
            reason,
            totalDays,
            month: start.getMonth() + 1,
            year: start.getFullYear()
        });

        await leave.save();
        await leave.populate('employeeId', 'name employeeId');

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error applying for leave',
            error: error.message
        });
    }
};

// Get All Leaves
const getAllLeaves = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, month, year } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (month) filter.month = parseInt(month);
        if (year) filter.year = parseInt(year);

        const leaves = await Leave.find(filter)
            .populate('employeeId', 'name employeeId department')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ appliedDate: -1 });

        const total = await Leave.countDocuments(filter);

        res.json({
            success: true,
            data: leaves,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leaves',
            error: error.message
        });
    }
};

// Get Leaves by Employee
const getLeavesByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const { year = new Date().getFullYear() } = req.query;

        const leaves = await Leave.find({ 
            employeeId, 
            year: parseInt(year) 
        })
        .populate('employeeId', 'name employeeId')
        .sort({ startDate: -1 });

        res.json({
            success: true,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee leaves',
            error: error.message
        });
    }
};

// Approve Leave
const approveLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedBy } = req.body;

        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave not found'
            });
        }

        const employee = await Employee.findById(leave.employeeId);
        
        // Check leave balance and apply leave policies
        const { isPaid, deductFromSalary } = await calculateLeavePolicy(employee, leave);
        
        leave.status = 'approved';
        leave.approvedBy = approvedBy;
        leave.approvalDate = new Date();
        leave.isPaid = isPaid;

        // Deduct from employee leave balance
        employee.leaveBalance -= leave.totalDays;
        
        await leave.save();
        await employee.save();

        res.json({
            success: true,
            message: 'Leave approved successfully',
            data: leave,
            deductFromSalary
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error approving leave',
            error: error.message
        });
    }
};

// Reject Leave
const rejectLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectedBy, rejectionReason } = req.body;

        const leave = await Leave.findByIdAndUpdate(
            id,
            {
                status: 'rejected',
                approvedBy: rejectedBy,
                approvalDate: new Date(),
                rejectionReason
            },
            { new: true }
        ).populate('employeeId', 'name employeeId');

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave not found'
            });
        }

        res.json({
            success: true,
            message: 'Leave rejected successfully',
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error rejecting leave',
            error: error.message
        });
    }
};

// Delete Leave
const deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);
        
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave not found'
            });
        }

        res.json({
            success: true,
            message: 'Leave deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting leave',
            error: error.message
        });
    }
};

// Get Leave Balance
const getLeaveBalance = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const currentYear = new Date().getFullYear();
        const usedLeaves = await Leave.aggregate([
            {
                $match: {
                    employeeId: employee._id,
                    year: currentYear,
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    totalUsed: { $sum: '$totalDays' }
                }
            }
        ]);

        const totalUsed = usedLeaves.length > 0 ? usedLeaves[0].totalUsed : 0;

        res.json({
            success: true,
            data: {
                totalLeaves: 18,
                usedLeaves: totalUsed,
                remainingLeaves: employee.leaveBalance,
                extraHoursBalance: employee.extraHoursBalance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave balance',
            error: error.message
        });
    }
};

// Update Leave Balance (Monthly accrual)
const updateLeaveBalance = async (req, res) => {
    try {
        const { id } = req.params;
        const { leaveBalance, extraHoursBalance } = req.body;

        const employee = await Employee.findByIdAndUpdate(
            id,
            { leaveBalance, extraHoursBalance },
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
            message: 'Leave balance updated successfully',
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating leave balance',
            error: error.message
        });
    }
};

// Process Monthly Leaves (Cron job function)
const processMonthlyLeaves = async (req, res) => {
    try {
        const employees = await Employee.find({ isActive: true });
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        for (let employee of employees) {
            // Add monthly leave accrual (1.5 days per month)
            employee.leaveBalance = Math.min(18, employee.leaveBalance + 1.5);
            await employee.save();
        }

        res.json({
            success: true,
            message: 'Monthly leave processing completed',
            processedEmployees: employees.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing monthly leaves',
            error: error.message
        });
    }
};

// Get Employee Leave Report
const getEmployeeLeaveReport = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { year = new Date().getFullYear() } = req.query;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const leaves = await Leave.find({
            employeeId,
            year: parseInt(year)
        }).sort({ startDate: 1 });

        const summary = await Leave.aggregate([
            {
                $match: {
                    employeeId: employee._id,
                    year: parseInt(year),
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$month',
                    totalDays: { $sum: '$totalDays' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                employee: {
                    name: employee.name,
                    employeeId: employee.employeeId,
                    department: employee.department
                },
                leaves,
                monthlySummary: summary,
                currentBalance: employee.leaveBalance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating leave report',
            error: error.message
        });
    }
};

// Get Monthly Leave Report
const getMonthlyLeaveReport = async (req, res) => {
    try {
        const { year, month } = req.params;

        const leaves = await Leave.find({
            year: parseInt(year),
            month: parseInt(month),
            status: 'approved'
        }).populate('employeeId', 'name employeeId department');

        const summary = await Leave.aggregate([
            {
                $match: {
                    year: parseInt(year),
                    month: parseInt(month),
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    totalLeaves: { $sum: '$totalDays' },
                    totalApplications: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                leaves,
                summary: summary[0] || { totalLeaves: 0, totalApplications: 0 }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating monthly report',
            error: error.message
        });
    }
};

// Helper function to calculate leave policy
const calculateLeavePolicy = async (employee, leave) => {
    const currentMonth = leave.month;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const year = currentMonth === 1 ? leave.year - 1 : leave.year;

    // Check if employee took leave in previous month
    const previousMonthLeaves = await Leave.find({
        employeeId: employee._id,
        month: previousMonth,
        year: year,
        status: 'approved'
    });

    const previousMonthTotalDays = previousMonthLeaves.reduce((sum, l) => sum + l.totalDays, 0);

    let isPaid = true;
    let deductFromSalary = false;

    // Apply leave policy: if no leave in previous month, can take 3 days paid leave
    // If taking 4+ days, 1 day deduction from salary
    if (previousMonthTotalDays === 0) {
        if (leave.totalDays > 3) {
            deductFromSalary = true;
            // Calculate salary deduction for extra days
        }
    } else {
        // Normal leave policy applies
        if (employee.leaveBalance < leave.totalDays) {
            isPaid = false;
            deductFromSalary = true;
        }
    }

    return { isPaid, deductFromSalary };
};

module.exports = {
    applyLeave,
    getAllLeaves,
    getLeavesByEmployee,
    approveLeave,
    rejectLeave,
    deleteLeave,
    getLeaveBalance,
    updateLeaveBalance,
    processMonthlyLeaves,
    getEmployeeLeaveReport,
    getMonthlyLeaveReport
};