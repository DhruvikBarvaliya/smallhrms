const express = require('express');
const router = express.Router();
const employeeController = require('../controller/EmployeeController');
const leaveController = require('../controller/LeaveController');

/**
 * @swagger
 * tags:
 *   - name: Employees
 *     description: Employee management APIs
 *   - name: Leaves
 *     description: Leave management APIs
 */

// ===========================
// Employee Routes
// ===========================

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Employee created successfully
 */
router.post('/employees', employeeController.createEmployee);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: List of all employees
 */
router.get('/employees', employeeController.getAllEmployees);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get an employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee data returned
 */
router.get('/employees/:id', employeeController.getEmployeeById);

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update an employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: Employee updated
 */
router.put('/employees/:id', employeeController.updateEmployee);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deleted
 */
router.delete('/employees/:id', employeeController.deleteEmployee);


// ===========================
// Leave Routes
// ===========================

/**
 * @swagger
 * /leaves:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leaves]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Leave'
 *     responses:
 *       201:
 *         description: Leave applied
 */
router.post('/leaves', leaveController.applyLeave);

/**
 * @swagger
 * /leaves:
 *   get:
 *     summary: Get all leave applications
 *     tags: [Leaves]
 *     responses:
 *       200:
 *         description: List of all leave applications
 */
router.get('/leaves', leaveController.getAllLeaves);

/**
 * @swagger
 * /leaves/employee/{employeeId}:
 *   get:
 *     summary: Get leave applications by employee ID
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leaves of specific employee
 */
router.get('/leaves/employee/:employeeId', leaveController.getLeavesByEmployee);

/**
 * @swagger
 * /leaves/{id}/approve:
 *   put:
 *     summary: Approve a leave application
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave approved
 */
router.put('/leaves/:id/approve', leaveController.approveLeave);

/**
 * @swagger
 * /leaves/{id}/reject:
 *   put:
 *     summary: Reject a leave application
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave rejected
 */
router.put('/leaves/:id/reject', leaveController.rejectLeave);

/**
 * @swagger
 * /leaves/{id}:
 *   delete:
 *     summary: Delete a leave application
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave deleted
 */
router.delete('/leaves/:id', leaveController.deleteLeave);

/**
 * @swagger
 * /employees/{id}/leave-balance:
 *   get:
 *     summary: Get leave balance of an employee
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave balance
 */
router.get('/employees/:id/leave-balance', leaveController.getLeaveBalance);

/**
 * @swagger
 * /employees/{id}/update-leave-balance:
 *   post:
 *     summary: Update leave balance of an employee
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave balance updated
 */
router.post('/employees/:id/update-leave-balance', leaveController.updateLeaveBalance);

/**
 * @swagger
 * /process-monthly-leaves:
 *   post:
 *     summary: Process monthly leave calculations
 *     tags: [Leaves]
 *     responses:
 *       200:
 *         description: Monthly leaves processed
 */
router.post('/process-monthly-leaves', leaveController.processMonthlyLeaves);

/**
 * @swagger
 * /reports/employee/{employeeId}/leaves:
 *   get:
 *     summary: Get leave report of an employee
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave report for employee
 */
router.get('/reports/employee/:employeeId/leaves', leaveController.getEmployeeLeaveReport);

/**
 * @swagger
 * /reports/monthly-leaves/{year}/{month}:
 *   get:
 *     summary: Get monthly leave report
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Monthly leave report
 */
router.get('/reports/monthly-leaves/:year/:month', leaveController.getMonthlyLeaveReport);

module.exports = router;
