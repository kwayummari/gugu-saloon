const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateLogin, loginUser } = require('../models/authentication/login');
const { validateLoginHairDresser, loginHairDresser } = require('../models/authentication/loginHairDresser');
const { validateUser, registerUser } = require('../models/authentication/register_user');
const getUsers = require('../models/authentication/get_users');
const getPermissions = require('../models/permissions/get_permission')
const getUserById = require('../models/authentication/get_user_by_id')
const getAllRoles = require('../models/roles/get_roles')
const getRolesById = require('../models/roles/get_roles_by_id')
const getUserByCompanyId = require('../models/authentication/get_user_by_companyId')
const getCustomers = require('../models/authentication/get_customers')
const getCustomersCount = require('../models/authentication/get_customers_count')
const updatePermissions = require('../models/permissions/update_permissions')
const getBranches = require('../models/branch/get_branch')
const getRoles = require('../models/roles/get_all_roles')
const deleteUserById = require('../models/authentication/delete_user')
const deleteHairDresser = require('../models/hairdresser/delete_hairdresser')
const updatesHairDressing = require('../models/hairdresser/update_hairdressing')
const delete_hairdresser_hairstyling = require('../models/hairdresser/delete_hairdresser-hairstyling')
const disableHairDressing = require('../models/hairdresser/disable_hairdresser')
const { validateRole, registerRole } = require('../models/roles/add_roles');
const { validateExpenseType, registerExpenseType } = require('../models/orders/add_expenses_type');
const { validateEditRole, editRole } = require('../models/roles/edit_role');
const { validateEditingUser, editUser } = require('../models/authentication/edit_user');
const deleteRoles = require('../models/roles/delete_role');
const deleteExpenses = require('../models/orders/delete_expenses_type');
const { validateBranch, registerBranch } = require('../models/branch/add_branch');
const { validateEditBranch, editBranch } = require('../models/branch/edit_branch');
const deleteBranches = require('../models/branch/delete_branch');
const getSuppliers = require('../models/supplier/get_suppliers');
const { validateSupplier, registerSupplier } = require('../models/supplier/add_supplier');
const deleteSuppliers = require('../models/supplier/delete_supplier');
const { validateEditingSupplier, editSupplier } = require('../models/supplier/edit_supplier');
const { validateProduct, registerProduct } = require('../models/inventory/add_product');
const { validateEditProduct, edit_product } = require('../models/inventory/edit_product');
const getProduct = require('../models/inventory/get_product');
const tax = require('../models/tax/get_tax');
const deleteProducts = require('../models/inventory/delete_product');
const getPurchases = require('../models/purchase/get_purchase');
const getAllHairDresser = require('../models/hairdresser/get_hairdresser')
const getAllHairDresserByIds = require('../models/hairdresser/get_hairdresser_by_id')
const { validateHairdresser, registerHairDresser } = require('../models/hairdresser/add_hairdresser');
const { validateHairStyle, registerHairStyle } = require('../models/misuko/add_misuko');
const getAllHairStyle = require('../models/misuko/get_misuko_by_id');
const getAllHairStyles = require('../models/misuko/get_all_misuko');
const getPayrolls = require('../models/orders/payroll');
const performReconciliation = require('../models/orders/reconciliation');
const getAllOrders = require('../models/orders/get_all_order');
const getAllOrdersByRange = require('../models/orders/get_all_order_by_range');
const getExpensesByRange = require('../models/orders/get_expenses_by_range');
const getExpensesType = require('../models/orders/get_expense_type');
const deleteHairStyles = require('../models/misuko/delete_misuko');
const { validateEditMsuko, editMsuko } = require('../models/misuko/edit_msuko');
const { validateEditHairDresser, editHairDresser } = require('../models/hairdresser/edit_hairdresser');
const { validateHairdressers, postHairDresser } = require('../models/hairdresser/post_hairdresser');
const getHairDressings = require('../models/hairdresser/get_hairdressing');
const getHairDressings2 = require('../models/hairdresser/get_hairdressing2');
const { validateOrderFields, registerOrder } = require('../models/orders/add_order');
const shiftController = require('../models/shifts/shiftController');
const getExpenses = require('../models/expenses/get_expenses');
const { validateExpenses, addExpenses } = require('../models/expenses/add_expenses');

// ==========================================
// PUBLIC ROUTES (No Authentication Required)
// ==========================================
router.post('/login', validateLogin, loginUser);
// router.post('/loginHairDresser', validateLoginHairDresser, loginHairDresser); // DISABLED - Use /login instead
router.post('/register_user', validateUser, registerUser);

// ==========================================
// PROTECTED ROUTES (Authentication Required)
// ==========================================

// User Management
router.get('/users', authenticateToken, getUsers.getAllUsers);
router.post('/getUserById', authenticateToken, getUserById.getUserById);
router.post('/getUserByCompanyId', authenticateToken, getUserByCompanyId.getUserByCompanyId);
router.post('/getAllCustomers', authenticateToken, getCustomers.getCustomers);
router.post('/getAllCustomersCount', authenticateToken, getCustomersCount.getCustomersCount);
router.post('/edit_user', authenticateToken, validateEditingUser, editUser);
router.post('/deleteUserById', authenticateToken, deleteUserById.deleteUsersById);

// Roles & Permissions
router.post('/getPermission', authenticateToken, getPermissions.getPermissions);
router.get('/getRoles', authenticateToken, getAllRoles.getRoles);
router.post('/updateRoles', authenticateToken, updatePermissions.updatePermission);
router.post('/getRolesById', authenticateToken, getRolesById.getRolesById);
router.post('/getAllRoles', authenticateToken, getRoles.getRoles);
router.post('/register_role', authenticateToken, validateRole, registerRole);
router.post('/edit_role', authenticateToken, validateEditRole, editRole);
router.post('/deleteRole', authenticateToken, deleteRoles.deleteRole);

// Branch Management
router.post('/getBranch', authenticateToken, getBranches.getBranch);
router.post('/register_branch', authenticateToken, validateBranch, registerBranch);
router.post('/edit_branch', authenticateToken, validateEditBranch, editBranch);
router.post('/delete_branch', authenticateToken, deleteBranches.deleteBranch);

// Supplier Management
router.post('/suppliers', authenticateToken, getSuppliers.getSupplier);
router.post('/register_supplier', authenticateToken, validateSupplier, registerSupplier);
router.post('/edit_supplier', authenticateToken, validateEditingSupplier, editSupplier);
router.post('/deleteSupplier', authenticateToken, deleteSuppliers.deleteSupplier);

// Inventory & Products
router.post('/products', authenticateToken, getProduct.getProducts);
router.post('/register_product', authenticateToken, validateProduct, registerProduct);
router.post('/edit_product', authenticateToken, validateEditProduct, edit_product);
router.post('/delete_product', authenticateToken, deleteProducts.deleteProduct);
router.post('/get_purchases', authenticateToken, getPurchases.getPurchase);

// Tax
router.post('/tax', authenticateToken, tax.getTax);

// Hairdresser Management
router.post('/getHairDresser', authenticateToken, getAllHairDresser.getHairDressers);
router.post('/getHairDresserById', authenticateToken, getAllHairDresserByIds.getHairDressersById);
router.post('/register_hairdresser', authenticateToken, validateHairdresser, registerHairDresser);
router.post('/edit_hairDresser', authenticateToken, validateEditHairDresser, editHairDresser);
router.post('/deleteHairDresser', authenticateToken, deleteHairDresser.deleteHairDresser);
router.post('/post_hairDresser', authenticateToken, validateHairdressers, postHairDresser);
router.post('/disable_hairdressing', authenticateToken, disableHairDressing.disableHairdressing);

// Hairdressing (Services Assignment)
router.post('/getHairDressing', authenticateToken, getHairDressings.getHairDressing);
router.post('/getHairDressing2', authenticateToken, getHairDressings2.getHairDressing2);
router.post('/updateHairDressingStatus', authenticateToken, updatesHairDressing.updateHairDressing);
router.post('/delete_hairdresser_hairstyling', authenticateToken, delete_hairdresser_hairstyling.delete_hairdresser_hairstyling);

// Hairstyles (Services/Products)
router.post('/getHairStyle', authenticateToken, getAllHairStyle.getMisukoById);
router.post('/getAllHairStyle', authenticateToken, getAllHairStyles.getMisuko);
router.post('/register_hairStyle', authenticateToken, validateHairStyle, registerHairStyle);
router.post('/edit_hairStyle', authenticateToken, validateEditMsuko, editMsuko);
router.post('/deleteHairStyle', authenticateToken, deleteHairStyles.deleteMisuko);

// Orders & Transactions
router.post('/addOrder', authenticateToken, validateOrderFields, registerOrder);
router.post('/getOrders', authenticateToken, getAllOrders.getOrders);
router.post('/getOrdersByRange', authenticateToken, getAllOrdersByRange.getOrdersByRange);
router.post('/reconciliation', authenticateToken, performReconciliation.reconciliation);

// Expenses
router.post('/getExpenses', authenticateToken, getExpenses.getExpenses);
router.post('/getExpensesByRange', authenticateToken, getExpensesByRange.getExpensesByRange);
router.post('/getExpensesType', authenticateToken, getExpensesType.getExpensesType);
router.post('/registerExpenseType', authenticateToken, validateExpenseType, registerExpenseType);
router.post('/add_expenses', authenticateToken, validateExpenses, addExpenses);
router.post('/deleteExpenses', authenticateToken, deleteExpenses.deleteExpenses);

// Payroll & Reports
router.post('/getPayroll', authenticateToken, getPayrolls.payroll);

// Shift Management
router.post('/getActiveShift', authenticateToken, shiftController.getActive);
router.post('/endShift', authenticateToken, shiftController.endCurrentShift);
router.post('/getShiftSummary', authenticateToken, shiftController.getShiftSummary);
router.post('/startShift', authenticateToken, shiftController.startShift);

module.exports = router;