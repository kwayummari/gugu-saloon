const express = require('express');
const router = express.Router();
const {validateLogin,loginUser} = require('../models/authentication/login');
const {validateUser,registerUser} = require('../models/authentication/register_user');
const getUsers = require('../models/authentication/get_users');
const getPermissions = require('../models/permissions/get_permission')
const getAllRoles = require('../models/roles/get_roles')
const getRolesById = require('../models/roles/get_roles_by_id')
const updatePermissions = require('../models/permissions/update_permissions')
const getBranches = require('../models/branch/getBranch')
const getRoles = require('../models/roles/get_all_roles')
const deleteUserById = require('../models/authentication/delete_user')
const { validateRole, registerRole } = require('../models/roles/add_roles');
const {validateEditingUser,editUser} = require('../models/authentication/edit_user');

router.post('/login',validateLogin, loginUser);
router.post('/register_user',validateUser, registerUser);
router.get('/users', getUsers.getAllUsers);
router.post('/getPermission', getPermissions.getPermissions);
router.get('/getRoles', getAllRoles.getRoles);
router.post('/updateRoles', updatePermissions.updatePermission);
router.post('/getRolesById', getRolesById.getRolesById);
router.get('/getBranch', getBranches.getBranch);
router.get('/getAllRoles', getRoles.getRoles);
router.post('/deleteUserById', deleteUserById.deleteUsersById)
router.post('/register_role', validateRole, registerRole);
router.post('/edit_user',validateEditingUser, editUser);

module.exports = router;