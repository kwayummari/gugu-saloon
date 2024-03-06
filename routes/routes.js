const express = require('express');
const router = express.Router();
const {validateLogin,loginUser} = require('../models/authentication/login');
const {validateUser,registerUser} = require('../models/authentication/register_user');
const getUsers = require('../models/authentication/get_users');
const getPermissions = require('../models/permissions/get_permission')
const getAllRoles = require('../models/roles/get_roles')
const getRolesById = require('../models/roles/get_roles_by_id')
const getUserByCompanyId = require('../models/authentication/get_user_by_companyId')
const updatePermissions = require('../models/permissions/update_permissions')
const getBranches = require('../models/branch/get_branch')
const getRoles = require('../models/roles/get_all_roles')
const deleteUserById = require('../models/authentication/delete_user')
const { validateRole, registerRole } = require('../models/roles/add_roles');
const { validateEditRole, editRole } = require('../models/roles/edit_role');
const { validateEditingUser, editUser } = require('../models/authentication/edit_user');
const deleteRoles = require('../models/roles/delete_role');
// const { validateEditingPassword, editPassword } = require('../models/authentication/edit_password');
const { validateBranch, registerBranch } = require('../models/branch/add_branch');
const { validateEditBranch, editBranch } = require('../models/branch/edit_branch');
const deleteBranches = require('../models/branch/delete_branch');
const getSuppliers = require('../models/supplier/get_suppliers');
const { validateSupplier, registerSupplier } = require('../models/supplier/add_supplier');
const deleteSuppliers = require('../models/supplier/delete_supplier');
const { validateEditingSupplier, editSupplier } = require('../models/supplier/edit_supplier');
const { validateProduct, registerProduct } = require('../models/inventory/add_product');
const getProduct = require('../models/inventory/get_product');
const tax = require('../models/tax/get_tax');
const deleteProducts = require('../models/inventory/delete_product');
const getPurchases = require('../models/purchase/get_purchase');

router.post('/login',validateLogin, loginUser);
router.post('/register_user',validateUser, registerUser);
router.get('/users', getUsers.getAllUsers);
router.post('/getUserByCompanyId', getUserByCompanyId.getUserByCompanyId);
router.post('/getPermission', getPermissions.getPermissions);
router.get('/getRoles', getAllRoles.getRoles);
router.post('/updateRoles', updatePermissions.updatePermission);
router.post('/getRolesById', getRolesById.getRolesById);
router.post('/edit_role', validateEditRole, editRole);
router.post('/getBranch', getBranches.getBranch);
router.post('/getAllRoles', getRoles.getRoles);
router.post('/deleteUserById', deleteUserById.deleteUsersById)
router.post('/register_role', validateRole, registerRole);
router.post('/edit_user', validateEditingUser, editUser);
router.post('/deleteRole', deleteRoles.deleteRole)
// router.post('/edit_password', validateEditingPassword, editPassword);
router.post('/register_branch', validateBranch, registerBranch);
router.post('/edit_branch', validateEditBranch, editBranch);
router.post('/delete_branch', deleteBranches.deleteBranch);
router.post('/suppliers', getSuppliers.getSupplier);
router.post('/register_supplier', validateSupplier, registerSupplier);
router.post('/deleteSupplier', deleteSuppliers.deleteSupplier)
router.post('/edit_supplier', validateEditingSupplier, editSupplier);
router.post('/register_product', validateProduct, registerProduct);
router.post('/products', getProduct.getProducts);
router.post('/tax', tax.getTax);
router.post('/delete_product', deleteProducts.deleteProduct)
router.post('/get_purchases', getPurchases.getPurchase)

module.exports = router;