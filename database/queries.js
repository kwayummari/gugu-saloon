const queries = {
  getAllUsers: `
  SELECT user.*, branch.name AS branch_name, roles.name AS role_name
  FROM user
  INNER JOIN branch ON user.branch = branch.id
  INNER JOIN roles ON user.role = roles.id
  WHERE user.role != 1;
`,
  getAllUsersByCompany: `SELECT user.*, branch.name AS branch_name, roles.name AS role_name,
       (SELECT COUNT(*) 
        FROM user 
        WHERE user.role != 1 AND user.companyId = '1') AS totalUsers
FROM user
INNER JOIN branch ON user.branch = branch.id
INNER JOIN roles ON user.role = roles.id
WHERE user.role != 1 AND user.companyId = '1';
`,
getAllCustomersCount: `
SELECT COUNT(*) AS customerCount
FROM orders
WHERE DATE(date) BETWEEN ? AND ?
  AND companyId = ?
  AND branchId = ?
  AND \`status\` = ?
`,

  getAllCustomers: `WITH RankedOrders AS (
    SELECT
        o.name AS orderName,
        o.date,
        o.hairStyleId,
        o.phone,
        ROW_NUMBER() OVER (
            PARTITION BY o.name
            ORDER BY COUNT(o.hairStyleId) DESC
        ) AS rank
    FROM
        orders o
    WHERE
        o.companyId = ? AND o.branchId = ?
    GROUP BY
        o.name,
        o.hairStyleId,
        o.phone
),
MostFrequentHairStyle AS (
    SELECT
        ro.orderName,
        ro.date,
        ro.hairStyleId,
        ro.phone
    FROM
        RankedOrders ro
    WHERE
        ro.rank = 1
)
SELECT
    mf.orderName,
    mf.date,
    hs.name AS hairStyleName,
    hs.amount AS hairStyleAmount,
    mf.phone
FROM
    MostFrequentHairStyle mf
JOIN
    hairStyle hs ON mf.hairStyleId = hs.id;
`,
  getUserById: "SELECT * FROM hairdresser WHERE id = ?",
  login: "SELECT * FROM user WHERE email = ?",
  loginHairDresser: "SELECT * FROM hairdresser WHERE name = ?",
  register_user:
    "INSERT INTO user (fullname, phone, email, branch, role, password, companyId) VALUES (?, ?, ?, ?, ?, ?, ?)",
  check_user_existence:
    "SELECT * FROM user WHERE fullname = ? OR phone = ? OR email = ? LIMIT 1",
  check_user_existence_by_id: "SELECT * FROM user WHERE id = ? LIMIT 1",
  getAllCategories: "SELECT * FROM categories",
  getContentsById: "SELECT * FROM content WHERE category_id = ?",
  getContentById: "SELECT * FROM videos WHERE content_id = ?",
  getContentsDetailsById: "SELECT * FROM content WHERE id = ?",
  getPayment: "SELECT * FROM payment",
  getPaymentById: "SELECT * FROM payment WHERE user_id = ?",
  check_payment:
    "SELECT * FROM payment WHERE content_id = ? OR user_id = ? LIMIT 1",
  getPermissions: "SELECT * FROM permission WHERE roleId = ?",
  getSubmenu: "SELECT * FROM submenu WHERE menuId = ?",
  getRoles: "SELECT * FROM roles WHERE companyId = ?",
  getRolesById: "SELECT * FROM roles WHERE id = ?",
  getBranch: "SELECT * FROM branch WHERE companyId = ?",
  check_role_existence:
    "SELECT * FROM roles WHERE name = ? AND companyId = ? LIMIT 1",
  edit_role: "UPDATE roles SET name = ? WHERE id = ?",
  edit_product:
    "UPDATE inventory SET name = ?, description = ?, quantity = ?, buyingPrice = ?, sellingPrice = ?, branchId = ?, companyId = ?, userId = ? WHERE id = ?",
  deleteUser: "DELETE FROM user WHERE id = ?",
  check_branch_existence:
    "SELECT * FROM branch WHERE name = ? AND companyId = ? LIMIT 1",
  check_branch_user_existence: "SELECT * FROM user WHERE branch = ? LIMIT 1",
  check_role_user_existence: "SELECT * FROM user WHERE role = ? LIMIT 1",
  register_role: "INSERT INTO roles (name, companyId) VALUES (?, ?)",
  register_expense_type:
    "INSERT INTO expenses_type (name, companyId) VALUES (?, ?)",
  register_branch: "INSERT INTO branch (name, companyId) VALUES (?, ?)",
  edit_branch: "UPDATE branch SET name = ? WHERE id = ?",
  deleteBranch: "DELETE FROM branch WHERE id = ?",
  deleteRole: "DELETE FROM roles WHERE id = ?",
  delete_expenses_type: "DELETE FROM expenses_type WHERE id = ?",
  register_permission:
    "INSERT INTO permission (name, roleId, menuId) VALUES (?, ?, ?)",
  edit_user:
    "UPDATE user SET fullname = ?, phone = ?, email = ?, branch = ?, role = ?, password = ? WHERE id = ?",
  edit_user_password: "UPDATE user SET password = ? WHERE id = ?",
  check_supplier_existence:
    "SELECT * FROM supplier WHERE name = ? AND companyId = ? LIMIT 1",
  register_supplier:
    "INSERT INTO supplier (name, phone, tin, location, branch, companyId) VALUES (?, ?, ?, ?, ?, ?)",
  getSupplier: "SELECT * FROM supplier WHERE companyId = ?",
  check_supplier_user_existence:
    "SELECT * FROM inventory WHERE supplierId = ? LIMIT 1",
  deleteSupplier: "DELETE FROM supplier WHERE id = ?",
  edit_supplier:
    "UPDATE supplier SET name = ?, phone = ?, tin = ?, location = ?, branch = ?, companyId = ?  WHERE id = ?",
  check_inventory_existence:
    "SELECT * FROM inventory WHERE name = ? AND branchId = ? AND companyId = ? LIMIT 1",
  check_inventory_existence_for_deleting:
    "SELECT * FROM inventory WHERE id = ? LIMIT 1",
  register_product:
    "INSERT INTO inventory (name, description, quantity, buyingPrice, sellingPrice, branchId, companyId, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  get_products: "SELECT * FROM inventory WHERE companyId = ?",
  getBranchById: "SELECT * FROM branch WHERE id = ?",
  getTax: "SELECT * FROM tax",
  deleteProduct: "DELETE FROM inventory WHERE id = ?",
  check_product_existence:
    "SELECT * FROM purchase WHERE inventoryId = ? LIMIT 1",
  get_order:
    "SELECT * FROM purchase WHERE companyId = ? AND supplierId = ? AND status = ?",
  get_branch: "SELECT * FROM branch WHERE companyId = ? AND id = ?",
  get_inventory: "SELECT * FROM inventory WHERE id = ?",
  getHairDresser:
    "SELECT * FROM hairdresser WHERE companyId = ? AND branchId = ?",
  getHairDresserById: `SELECT hairDressing.*, hairdresser.name AS hairDresserName
  FROM hairDressing
  INNER JOIN hairdresser ON hairDressing.hairDresserId = hairdresser.id
  WHERE hairDressing.hairStyleId = ?
  `,
  check_hairdresser_existence:
    "SELECT * FROM hairdresser WHERE name = ? AND branchId = ? AND companyId = ? LIMIT 1",
  check_edit_hairdresser_existence:
    "SELECT * FROM hairdresser WHERE name = ? AND id = ? LIMIT 1",
  check_delete_hairdresser_existence:
    "SELECT * FROM hairdresser WHERE id = ? LIMIT 1",
  update_hairdressing: "UPDATE hairDressing SET status = ? WHERE id = ?",
  check_hairdressing_existence:
    "SELECT * FROM hairDressing WHERE id = ? LIMIT 1",
  disable_Hairdressing: "UPDATE hairDressing SET status = ? WHERE id = ?",
  delete_hairdresser_hairstyling_Hairdressing:
    "DELETE FROM hairDressing WHERE id = ?",
  delete_Hairdresser: "DELETE FROM hairdresser WHERE id = ?",
  delete_hairdressing: "DELETE FROM hairDressing WHERE hairdresserId = ?",
  edit_hairdresser: "UPDATE hairdresser SET name = ? WHERE id = ?",
  register_hairdresser:
    "INSERT INTO hairdresser (name, branchId, companyId) VALUES (?, ?, ?)",
  get_all_hairstyle_ids: "SELECT id FROM hairStyle WHERE branchId = ?",
  bulk_register_hairdressing:
    "INSERT INTO hairDressing (hairStyleId, hairdresserId) VALUES ?",
  check_hairStyle_existence:
    "SELECT * FROM hairStyle WHERE name = ? AND branchId = ? AND companyId = ? LIMIT 1",
  register_hairStyle:
    "INSERT INTO hairStyle (name, amount, description, officeAmount, hairDresserAmount, costOfHair, vishanga, remainderAmount, branchId, companyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  check_hairStyle_existence_byId:
    "SELECT * FROM hairDressing WHERE hairStyleId = ? LIMIT 1",
  deleteMsuko: "DELETE FROM hairStyle WHERE id = ?",
  checkForHairStyle:
    "SELECT * FROM hairStyle WHERE name = ? AND id = ? LIMIT 1",
  edit_Hairstyle: `UPDATE hairStyle SET name = ?, amount = ?, description = ?, officeAmount = ?, hairDresserAmount = ?, costOfHair = ?, vishanga = ?, remainderAmount = ?, branchId = ? WHERE id = ?`,
  getHairStyles: "SELECT * FROM hairStyle WHERE companyId = ? AND branchId = ?",
  getPayroll: `SELECT 
    o.hairDresserId,
    o.date,
    h.name AS hairDresserName, 
    SUM(hs.hairDresserAmount) AS totalHairDresserAmount
    FROM 
        orders o
    JOIN 
        hairdresser h ON o.hairDresserId = h.id
    JOIN 
        hairStyle hs ON o.hairStyleId = hs.id
    WHERE 
        o.companyId = ? AND o.branchId = ? AND DATE(o.date) = CURDATE()
    GROUP BY 
        o.hairDresserId, h.name;
    `,
  //     performReconciliation: `DELETE FROM orders
  // WHERE id NOT IN (
  //     SELECT id FROM (
  //         SELECT MIN(id) AS id
  //         FROM orders
  //         WHERE date = CURDATE()
  //           AND branchId = ?
  //           AND companyId = ?
  //         GROUP BY hairStyleId, hairDresserId, name, phone, date, branchId, companyId
  //     ) AS Temp
  // );
  // `,
  performReconciliation: `SELECT * FROM orders`,
    
  getOrders: `WITH OrderDetails AS (
    SELECT
        o.hairDresserId,
        o.name AS orderName,
        o.date AS orderDate,
        o.receiptNumber AS receiptNumber,
        hs.HairDresserAmount,
        hs.officeAmount,
        hs.description,
        hs.costOfHair,
        hs.vishanga,
        hs.name AS hairstyleName
    FROM
        orders o
    JOIN
        hairStyle hs ON o.hairstyleId = hs.id
    WHERE
        o.companyId = ?
        AND o.branchId = ?
        AND o.status = ?  -- Condition for orderStatus
        AND DATE(o.date) BETWEEN ? AND ?  -- Use startDate and endDate
    GROUP BY
        o.receiptNumber, o.hairDresserId, o.name, o.date, hs.HairDresserAmount,
        hs.officeAmount, hs.description, hs.costOfHair, hs.vishanga, hs.name
),
HairDresserAggregates AS (
    SELECT
        hd.id AS hairDresserId,
        hd.name AS hairDresserName,
        SUM(hs.HairDresserAmount) AS totalHairDresserAmount,
        SUM(hs.officeAmount) AS totalOfficeAmount
    FROM
        orders o
    JOIN
        hairStyle hs ON o.hairstyleId = hs.id
    JOIN
        hairdresser hd ON o.hairDresserId = hd.id
    WHERE
        o.companyId = ?
        AND o.branchId = ?
        AND o.status = ?  -- Condition for orderStatus
        AND DATE(o.date) BETWEEN ? AND ?  -- Use startDate and endDate
    GROUP BY
        hd.id, hd.name
),
TotalOfficeAmount AS (
    SELECT
        SUM(hs.officeAmount) AS overallTotalOfficeAmount,
        SUM(hs.hairDresserAmount) AS overallTotalHairDresserAmount,
        SUM(hs.costOfHair) AS overallTotalCostOfHair,
        SUM(hs.vishanga) AS overallTotalVishanga,
        SUM(hs.amount) AS overallTotalAmountPaid
    FROM
        orders o
    JOIN
        hairStyle hs ON o.hairstyleId = hs.id
    WHERE
        o.companyId = ?
        AND o.branchId = ?
        AND o.status = ?  -- Condition for orderStatus
        AND DATE(o.date) BETWEEN ? AND ?  -- Use startDate and endDate
),
TotalExpenses AS (
    SELECT
        SUM(e.amount) AS overallTotalExpenses
    FROM
        expenses e
    WHERE
        e.companyId = ?
        AND e.branchId = ?
        AND DATE(e.date) BETWEEN ? AND ?  -- Use startDate and endDate
)
SELECT DISTINCT
    ha.hairDresserName,
    ha.totalHairDresserAmount,
    ha.totalOfficeAmount,
    toa.overallTotalOfficeAmount,
    toa.overallTotalHairDresserAmount,
    toa.overallTotalCostOfHair,
    toa.overallTotalVishanga,
    toa.overallTotalAmountPaid,
    te.overallTotalExpenses,
    (toa.overallTotalOfficeAmount - te.overallTotalExpenses) AS actualTotalProfit,
    od.orderName,
    od.orderDate,
    od.hairstyleName,
    od.description,
    od.costOfHair,
    od.vishanga,
    od.HairDresserAmount,
    od.officeAmount,
    od.receiptNumber
FROM
    HairDresserAggregates ha
JOIN
    OrderDetails od ON ha.hairDresserId = od.hairDresserId
JOIN
    TotalOfficeAmount toa
JOIN
    TotalExpenses te
ORDER BY
    ha.hairDresserName, od.orderDate;
`,
getOrdersByRange: `WITH OrderDetails AS (
    SELECT 
        o.hairDresserId,
        o.name AS orderName,
        o.date AS orderDate,
        o.receiptNumber AS receiptNumber,
        hs.hairDresserAmount,
        hs.officeAmount,
        hs.description,
        hs.costOfHair,
        hs.vishanga
    FROM 
        orders o
    JOIN 
        hairStyle hs ON o.hairstyleId = hs.id
    WHERE 
        o.companyId = ? 
        AND o.branchId = ?
        AND o.status = ?
        AND o.date BETWEEN ? AND ?
    GROUP BY 
        o.receiptNumber, o.hairDresserId, o.name, o.date, hs.hairDresserAmount, 
        hs.officeAmount, hs.description, hs.costOfHair, hs.vishanga
),
HairDresserAggregates AS (
    SELECT 
        hd.id AS hairDresserId,
        hd.name AS hairDresserName,
        SUM(hs.hairDresserAmount) AS totalHairDresserAmount,
        SUM(hs.officeAmount) AS totalOfficeAmount
    FROM 
        orders o
    JOIN 
        hairStyle hs ON o.hairstyleId = hs.id
    JOIN 
        hairdresser hd ON o.hairDresserId = hd.id
    WHERE 
        o.companyId = ? 
        AND o.branchId = ?
        AND o.status = ? 
        AND o.date BETWEEN ? AND ?
    GROUP BY 
        hd.id, hd.name
),
TotalOfficeAmount AS (
    SELECT 
        SUM(hs.officeAmount) AS overallTotalOfficeAmount,
        SUM(hs.hairDresserAmount) AS overallTotalHairDresserAmount,
        SUM(hs.costOfHair) AS overallTotalCostOfHair,
        SUM(hs.vishanga) AS overallTotalVishanga,
        SUM(hs.amount) AS overallTotalAmountPaid
    FROM 
        orders o
    JOIN 
        hairStyle hs ON o.hairstyleId = hs.id
    WHERE 
        o.companyId = ? 
        AND o.branchId = ?
        AND o.status = ? 
        AND o.date BETWEEN ? AND ?
),
ExpensesTotal AS (
    SELECT 
        SUM(e.amount) AS actualExpenses
    FROM 
        expenses e
    WHERE 
        e.companyId = ? 
        AND e.branchId = ? 
        AND e.expense_status = ?
        AND e.date BETWEEN ? AND ?
)
SELECT DISTINCT
    ha.hairDresserName,
    ha.totalHairDresserAmount,
    ha.totalOfficeAmount,
    toa.overallTotalOfficeAmount,
    toa.overallTotalHairDresserAmount,
    toa.overallTotalCostOfHair,
    toa.overallTotalVishanga,
    toa.overallTotalAmountPaid,
    od.orderName,
    od.orderDate,
    od.description,
    od.costOfHair,
    od.vishanga,
    od.hairDresserAmount,
    od.officeAmount,
    od.receiptNumber,
    et.actualExpenses
FROM 
    HairDresserAggregates ha
JOIN 
    OrderDetails od ON ha.hairDresserId = od.hairDresserId
JOIN 
    TotalOfficeAmount toa
CROSS JOIN
    ExpensesTotal et
ORDER BY 
    ha.hairDresserName, od.orderDate;
`,

  getExpensesByRange: `SELECT 
    e.*, 
    expenses_type.name AS expenseTypeName, 
    branch.name AS branchName
FROM 
    expenses e
JOIN 
    expenses_type ON e.expense_type_id = expenses_type.id
JOIN 
    branch ON e.branchId = branch.id
WHERE 
    e.companyId = ? 
    AND e.branchId = ? 
    AND e.expense_status = ?
    AND e.date BETWEEN ? AND ?;
`,
  getHairstyleById: "SELECT * FROM hairStyle WHERE id = ?",
  check_for_hairdresser:
    "SELECT * FROM hairDressing WHERE hairStyleId = ? AND hairdresserId = ?  LIMIT 1",
  register_hairdressing:
    "INSERT INTO hairDressing (hairStyleId, hairdresserId) VALUES (?, ?)",
  get_hairdressing: `SELECT hairDressing.*, hairdresser.name AS hairDresserName
  FROM hairDressing
  JOIN hairdresser ON hairDressing.hairDresserId = hairdresser.id
  WHERE hairDressing.hairStyleId = ?;
  `,
  get_hairdressing2: `SELECT 
    hd.*,
    hs.name AS hairStyleName
FROM 
    hairDressing hd
JOIN 
    hairStyle hs ON hd.hairStyleId = hs.id
WHERE 
    hd.hairdresserId = ?;
`,
  add_order:
    "INSERT INTO orders (name, phone, hairStyleId, hairDresserId, receiptNumber, status, companyId, branchId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  add_order_with_date: `INSERT INTO orders (name, phone, hairStyleId, hairDresserId, receiptNumber, status,  companyId, branchId,date) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

  getStatus: "SELECT status FROM hairdresser WHERE id = ?",
  getExpenses: "SELECT * FROM expenses_type WHERE companyId = ?",
  getAllExpenses: `SELECT expenses.*, expenses_type.name AS expense_type_name
FROM expenses
JOIN expenses_type ON expenses.expense_type_id = expenses_type.id
WHERE companyId = ? 
AND branchId = ?
AND DATE(expenses.date) = CURDATE();
`,
addExpenses:
"INSERT INTO expenses (expense_type_id, amount, description, branchId, companyId, expense_status, date) VALUES (?, ?, ?, ?, ?, ?, ?)"

};

module.exports = queries;
