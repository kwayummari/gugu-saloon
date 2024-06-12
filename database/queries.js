const queries = {
  getAllUsers: `
  SELECT user.*, branch.name AS branch_name, roles.name AS role_name
  FROM user
  INNER JOIN branch ON user.branch = branch.id
  INNER JOIN roles ON user.role = roles.id
  WHERE user.role != 1;
`,
  getAllUsersByCompany: `
SELECT user.*, branch.name AS branch_name, roles.name AS role_name
FROM user
INNER JOIN branch ON user.branch = branch.id
INNER JOIN roles ON user.role = roles.id
WHERE user.role != 1 AND user.companyId = ?;
`,
  getUserById: 'SELECT * FROM user WHERE id = ?',
  login: 'SELECT * FROM user WHERE email = ?',
  loginHairDresser: 'SELECT * FROM hairdresser WHERE name = ?',
  register_user: 'INSERT INTO user (fullname, phone, email, branch, role, password, companyId) VALUES (?, ?, ?, ?, ?, ?, ?)',
  check_user_existence: 'SELECT * FROM user WHERE fullname = ? OR phone = ? OR email = ? LIMIT 1',
  check_user_existence_by_id: 'SELECT * FROM user WHERE id = ? LIMIT 1',
  getAllCategories: 'SELECT * FROM categories',
  getContentsById: 'SELECT * FROM content WHERE category_id = ?',
  getContentById: 'SELECT * FROM videos WHERE content_id = ?',
  getContentsDetailsById: 'SELECT * FROM content WHERE id = ?',
  getPayment: 'SELECT * FROM payment',
  getPaymentById: 'SELECT * FROM payment WHERE user_id = ?',
  check_payment: 'SELECT * FROM payment WHERE content_id = ? OR user_id = ? LIMIT 1',
  getPermissions: 'SELECT * FROM permission WHERE roleId = ?',
  getSubmenu: 'SELECT * FROM submenu WHERE menuId = ?',
  getRoles: 'SELECT * FROM roles WHERE companyId = ?',
  getRolesById: 'SELECT * FROM roles WHERE id = ?',
  getBranch: 'SELECT * FROM branch WHERE companyId = ?',
  check_role_existence: 'SELECT * FROM roles WHERE name = ? AND companyId = ? LIMIT 1',
  edit_role: 'UPDATE roles SET name = ? WHERE id = ?',
  edit_product: 'UPDATE inventory SET name = ?, description = ?, quantity = ?, buyingPrice = ?, sellingPrice = ?, branchId = ?, companyId = ?, userId = ? WHERE id = ?',
  deleteUser: 'DELETE FROM user WHERE id = ?',
  check_branch_existence: 'SELECT * FROM branch WHERE name = ? AND companyId = ? LIMIT 1',
  check_branch_user_existence: 'SELECT * FROM user WHERE branch = ? LIMIT 1',
  check_role_user_existence: 'SELECT * FROM user WHERE role = ? LIMIT 1',
  register_role: 'INSERT INTO roles (name, companyId) VALUES (?, ?)',
  register_branch: 'INSERT INTO branch (name, companyId) VALUES (?, ?)',
  edit_branch: 'UPDATE branch SET name = ? WHERE id = ?',
  deleteBranch: 'DELETE FROM branch WHERE id = ?',
  deleteRole: 'DELETE FROM roles WHERE id = ?',
  register_permission: 'INSERT INTO permission (name, roleId, menuId) VALUES (?, ?, ?)',
  edit_user: 'UPDATE user SET fullname = ?, phone = ?, email = ?, branch = ?, role = ?, password = ? WHERE id = ?',
  edit_user_password: 'UPDATE user SET password = ? WHERE id = ?',
  check_supplier_existence: 'SELECT * FROM supplier WHERE name = ? AND companyId = ? LIMIT 1',
  register_supplier: 'INSERT INTO supplier (name, phone, tin, location, branch, companyId) VALUES (?, ?, ?, ?, ?, ?)',
  getSupplier: 'SELECT * FROM supplier WHERE companyId = ?',
  check_supplier_user_existence: 'SELECT * FROM inventory WHERE supplierId = ? LIMIT 1',
  deleteSupplier: 'DELETE FROM supplier WHERE id = ?',
  edit_supplier: 'UPDATE supplier SET name = ?, phone = ?, tin = ?, location = ?, branch = ?, companyId = ?  WHERE id = ?',
  check_inventory_existence: 'SELECT * FROM inventory WHERE name = ? AND branchId = ? AND companyId = ? LIMIT 1',
  register_product: 'INSERT INTO inventory (name, description, quantity, buyingPrice, sellingPrice, branchId, companyId, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  get_products: 'SELECT * FROM inventory WHERE companyId = ?',
  getBranchById: 'SELECT * FROM branch WHERE id = ?',
  getTax: 'SELECT * FROM tax',
  deleteProduct: 'DELETE FROM inventory WHERE id = ?',
  check_product_existence: 'SELECT * FROM purchase WHERE inventoryId = ? LIMIT 1',
  get_order: 'SELECT * FROM purchase WHERE companyId = ? AND supplierId = ? AND status = ?',
  get_branch: 'SELECT * FROM branch WHERE companyId = ? AND id = ?',
  get_inventory: 'SELECT * FROM inventory WHERE id = ?',
  getHairDresser: 'SELECT * FROM hairdresser WHERE companyId = ?',
  getHairDresserById: `SELECT hairDressing.*, hairDresser.name AS hairDresserName
  FROM hairDressing
  INNER JOIN hairDresser ON hairDressing.hairDresserId = hairDresser.id
  WHERE hairDressing.hairStyleId = ?
  `,
  check_hairdresser_existence: 'SELECT * FROM hairdresser WHERE name = ? AND companyId = ? LIMIT 1',
  register_hairdresser: 'INSERT INTO hairdresser (name, companyId) VALUES (?, ?)',
  check_hairStyle_existence: 'SELECT * FROM hairStyle WHERE name = ? AND companyId = ? LIMIT 1',
  register_hairStyle: 'INSERT INTO hairStyle (name, amount, companyId) VALUES (?, ?, ?)',
  check_hairStyle_existence_byId: 'SELECT * FROM hairDressing WHERE misukoId = ? LIMIT 1',
  deleteMsuko: 'DELETE FROM hairStyle WHERE id = ?',
  checkForHairStyle: 'SELECT * FROM hairStyle WHERE name = ? AND id = ? LIMIT 1',
  edit_Hairstyle: `UPDATE hairStyle SET name = ?, amount = ? WHERE id = ?`,
  getHairStyles: 'SELECT * FROM hairStyle WHERE companyId = ?',
  getHairstyleById: 'SELECT * FROM hairStyle WHERE id = ?',
  check_for_hairdresser: 'SELECT * FROM hairDressing WHERE hairStyleId = ? AND hairdresserId = ?  LIMIT 1',
  register_hairdressing: 'INSERT INTO hairDressing (hairStyleId, hairdresserId) VALUES (?, ?)',
  get_hairdressing: `SELECT hairDressing.*, hairDresser.name AS hairDresserName
  FROM hairDressing
  JOIN hairDresser ON hairDressing.hairDresserId = hairDresser.id
  WHERE hairDressing.hairStyleId = ?;
  `,
  add_order: 'INSERT INTO orders (name, phone, hairStyleId, inventoryId, number, hairDresserId) VALUES (?, ?, ?, ?, ?, ?)',
};

module.exports = queries;
