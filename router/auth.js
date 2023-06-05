const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const User = require('../models/User')
const cors=require('cors');
router.use(cors());
const jwt = require('jsonwebtoken')
const fetchuser =require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');
router.use(express.json());
const JWT_Token = "Rajveer$idhu"

//User sign by using post req
router.post('/signup',
  body('name', "name should have minimum length of 5").isLength({ min: 5 }),
  body('password', 'password should have minimum length of 5').isLength({ min: 5 }),
  body('email').isEmail(),
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const validateUser = await User.findOne({ email: req.body.email });
    if (validateUser) {
      return res.status(400).json({ success, message: "User with this email already exists" });
    }

    const myPlaintextPassword = req.body.password;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(myPlaintextPassword, salt);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    });
    const data = {
      user: {
        id: user.id
      }
    }
    success = true;
    const authToken = jwt.sign(data, JWT_Token);
    return res.status(200).json({ success, authToken });
  }
);

router.post('/login', [
  body('email').isEmail()
], async (req, res) => {
  let success = true;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    success = false;
    return res.status(400).json({ success, errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    success = false;
    return res.status(400).json({ success, message: "Please try to login with the correct credentials" });
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (passwordCompare) {
    const data = {
      user: {
        id: user.id
      }
    }
    success = true;
    const authToken = jwt.sign(data, JWT_Token);
    return res.status(200).json({ success, authToken });
  }

  success = false;
  return res.status(400).json({ success, message: "Please try to login with the correct credentials" });
});

// Password reset route using POST request
// Password update route using PUT request
router.put('/updatepassword', [
  body('email').isEmail(),
  body('newPassword', 'password should have a minimum length of 5').isLength({ min: 5 }),
], async (req, res) => {
  let success = true;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    success = false;
    return res.status(400).json({ success, errors: errors.array() });
  }
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    success = false;
    return res.status(400).json({ success, message: "User with this email does not exist" });
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);
  user.password = hash;
  await user.save();
  const data = {
    user: {
      id: user.id
    }
  }
  success = true;
  const authToken = jwt.sign(data, JWT_Token)
  return res.status(200).json({ success, authToken });
});



router.post('/getuser',fetchuser, async (req, res) => {
    let success=true;
    try {
        const userId=req.user.id;
        const user=await User.findById(userId).select("-password")
        console.log(user)

        res.status(200).json({success,user});
        
    } catch (error) {
        success=false;
        res.status(400).json(success,"Internal server error occured");

    }

})


module.exports=router;