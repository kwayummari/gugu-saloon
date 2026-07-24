const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const xss = require('xss');

const validateUser = [
  body('fullname').trim().notEmpty().withMessage('Tafadhali weka jina kamili').isLength({ max: 50 })
    .withMessage('Jina lisizidi herufi 50').isLength({ min: 4 })
    .withMessage('Jina liwe na angalau herufi 4'),
  body('phone').trim().notEmpty().withMessage('Tafadhali weka namba ya simu')
    .isLength({ max: 10 }).withMessage('Namba ya simu isizidi herufi 10')
    .isLength({ min: 4 }).withMessage('Namba ya simu iwe na angalau herufi 4')
    .if(body('phone_number').exists()).isString().withMessage('Namba ya simu lazima iwe maandishi')
    .if(body('phone_number').isString()).isLength({ max: 10 }).withMessage('Namba ya simu isizidi herufi 10'),
  body('email')
    .trim()
    .notEmpty().withMessage('Tafadhali weka barua pepe')
    .isEmail().withMessage('Barua pepe si sahihi')
    .normalizeEmail(),
  body('branch').trim().notEmpty().withMessage('Tafadhali chagua tawi'),
  body('role').trim().notEmpty().withMessage('Tafadhali chagua wadhifa'),
  body('password')
    .notEmpty().withMessage('Tafadhali weka nenosiri')
    .isLength({ min: 8 }).withMessage('Nenosiri liwe na herufi 8 au zaidi')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Nenosiri lazima liwe na herufi kubwa moja, herufi ndogo moja, namba moja, na alama maalum moja (mfano @ $ ! % * ? &)'),
];

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(300).json({ message: firstError.msg });
    }
    const { fullname, phone, email, branch, role, password, companyId, } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const connectionPool = await connectionPoolWithRetry();

    connectionPool.query(
      queries.check_user_existence,
      [fullname, phone, email],
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
        }
        if (result.length > 0) {
          return res.status(400).json({ message: 'Mtumiaji tayari yupo' });
        }
        connectionPool.query(
          queries.register_user,
          [fullname, phone, email, branch, role,  hashedPassword, companyId,],
          (error, result) => {
            if (error) {
              return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
            }
            return res.status(200).json({ message: 'Mtumiaji ameongezwa kikamilifu', userId: result.insertId });
          }
        );
      }
    );
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
  }
};


module.exports = {
  validateUser,
  registerUser,
};
