const queries = {
  getAllUsers: `
  SELECT user.*, branch.name AS branch_name, roles.name AS role_name
  FROM user
  INNER JOIN branch ON user.branch = branch.id
  INNER JOIN roles ON user.role = roles.id
  WHERE user.role != 1;
`,
  getUserById: 'SELECT * FROM user WHERE id = ?',
  login: 'SELECT * FROM user WHERE email = ?',
  register_user: 'INSERT INTO user (fullname, phone, email, branch, role, password) VALUES (?, ?, ?, ?, ?, ?)',
  check_user_existence: 'SELECT * FROM user WHERE fullname = ? OR phone = ? OR email = ? LIMIT 1',
  getAllCategories: 'SELECT * FROM categories',
  getContentsById: 'SELECT * FROM content WHERE category_id = ?',
  getContentById: 'SELECT * FROM videos WHERE content_id = ?',
  getContentsDetailsById: 'SELECT * FROM content WHERE id = ?',
  getPayment: 'SELECT * FROM payment',
  getPaymentById: 'SELECT * FROM payment WHERE user_id = ?',
  check_payment: 'SELECT * FROM payment WHERE content_id = ? OR user_id = ? LIMIT 1',
  getPermissions: 'SELECT * FROM permission WHERE roleId = ?',
  getSubmenu: 'SELECT * FROM submenu WHERE menuId = ?',
  getRoles: 'SELECT * FROM roles',
  getRolesById: 'SELECT * FROM roles WHERE id = ?',
  getBranch: 'SELECT * FROM branch',
  getRole: 'SELECT * FROM role',
  delete: 'DELETE FROM user WHERE id = ?',
  check_role_existence: 'SELECT * FROM roles WHERE name = ? LIMIT 1',
  register_role: 'INSERT INTO roles (name) VALUES (?)',
  register_permission: 'INSERT INTO permission (name, roleId, menuId) VALUES (?, ?, ?)',
  edit_user: 'UPDATE user SET fullname = ?, phone = ?, email = ?, branch = ?, role = ?, password = ? WHERE id = ?',
};

module.exports = queries;
