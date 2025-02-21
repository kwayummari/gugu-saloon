const express = require('express');
const router = express.Router();
const { validateLogin, loginUser } = require('../models/authentication/login');
const {validateLoginHairDresser,loginHairDresser} = require('../models/authentication/loginHairDresser');
const {validateUser,registerUser} = require('../models/authentication/register_user');
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
const {validateEditProduct,edit_product} = require('../models/inventory/edit_product');
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
const { validateOrder, registerOrder } = require('../models/orders/add_order');
const getExpenses = require('../models/expenses/get_expenses');
const { validateExpenses, addExpenses } = require('../models/expenses/add_expenses');

router.post('/login', validateLogin, loginUser);
router.post('/loginHairDresser',validateLoginHairDresser,loginHairDresser);
router.post('/register_user',validateUser, registerUser);
router.get('/users', getUsers.getAllUsers);
router.post('/getUserById', getUserById.getUserById);
router.post('/getUserByCompanyId', getUserByCompanyId.getUserByCompanyId);
router.post('/getAllCustomers', getCustomers.getCustomers);
router.post('/getAllCustomersCount', getCustomersCount.getCustomersCount);
router.post('/getPermission', getPermissions.getPermissions);
router.get('/getRoles', getAllRoles.getRoles);
router.post('/updateRoles', updatePermissions.updatePermission);
router.post('/getRolesById', getRolesById.getRolesById);
router.post('/edit_role', validateEditRole, editRole);
router.post('/getBranch', getBranches.getBranch);
router.post('/getAllRoles', getRoles.getRoles);
router.post('/deleteUserById', deleteUserById.deleteUsersById)
router.post('/deleteHairDresser', deleteHairDresser.deleteHairDresser)
router.post('/updateHairDressingStatus', updatesHairDressing.updateHairDressing)
router.post('/delete_hairdresser_hairstyling', delete_hairdresser_hairstyling.delete_hairdresser_hairstyling)
router.post('/disable_hairdressing', disableHairDressing.disableHairdressing)
router.post('/register_role', validateRole, registerRole);
router.post('/registerExpenseType', validateExpenseType, registerExpenseType);
router.post('/edit_user', validateEditingUser, editUser);
router.post('/deleteRole', deleteRoles.deleteRole)
router.post('/deleteExpenses', deleteExpenses.deleteExpenses)
// router.post('/edit_password', validateEditingPassword, editPassword);
router.post('/register_branch', validateBranch, registerBranch);
router.post('/edit_branch', validateEditBranch, editBranch);
router.post('/delete_branch', deleteBranches.deleteBranch);
router.post('/suppliers', getSuppliers.getSupplier);
router.post('/register_supplier', validateSupplier, registerSupplier);
router.post('/deleteSupplier', deleteSuppliers.deleteSupplier)
router.post('/edit_supplier', validateEditingSupplier, editSupplier);
router.post('/register_product', validateProduct, registerProduct);
router.post('/edit_product', validateEditProduct,edit_product);
router.post('/products', getProduct.getProducts);
router.post('/tax', tax.getTax);
router.post('/delete_product', deleteProducts.deleteProduct)
router.post('/get_purchases', getPurchases.getPurchase)
router.post('/getHairDresser', getAllHairDresser.getHairDressers);
router.post('/getHairDresserById', getAllHairDresserByIds.getHairDressersById);
router.post('/register_hairdresser', validateHairdresser, registerHairDresser);
router.post('/register_hairStyle', validateHairStyle, registerHairStyle);
router.post('/getHairStyle', getAllHairStyle.getMisukoById);
router.post('/getAllHairStyle', getAllHairStyles.getMisuko);
router.post('/getPayroll', getPayrolls.payroll);
router.post('/reconciliation', performReconciliation.reconciliation);
router.post('/getOrders', getAllOrders.getOrders);
router.post('/getOrdersByRange', getAllOrdersByRange.getOrdersByRange);
router.post('/getExpensesByRange', getExpensesByRange.getExpensesByRange);
router.post('/getExpensesType', getExpensesType.getExpensesType);
router.post('/deleteHairStyle', deleteHairStyles.deleteMisuko);
router.post('/edit_hairStyle', validateEditMsuko, editMsuko);
router.post('/edit_hairDresser', validateEditHairDresser, editHairDresser);
router.post('/post_hairDresser', validateHairdressers, postHairDresser);
router.post('/getHairDressing', getHairDressings.getHairDressing);
router.post('/getHairDressing2', getHairDressings2.getHairDressing2);
router.post('/addOrder',  registerOrder);
router.post('/getExpenses', getExpenses.getExpenses);
router.post('/add_expenses', validateExpenses, addExpenses);

module.exports = router;