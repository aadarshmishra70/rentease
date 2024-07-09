const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const User = require("../models/User");


/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

/* USER REGISTER */
router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    /* Take all information from the form */
    const { firstName, lastName, email, password } = req.body;

    /* The uploaded file is available as req.file */
    const profileImage = req.file;

    if (!profileImage) {
      return res.status(400).send("No file uploaded");
    }

    /* path to the uploaded profile photo */
    const profileImagePath = profileImage.path;

    /* Check if user exists */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    /* Hass the password */
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    /* Create a new User */
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImagePath,
    });

    /* Save the new User */
    await newUser.save();

    /* Send a successful message */
    res
      .status(200)
      .json({ message: "User registered successfully!", user: newUser });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Registration failed!", error: err.message });
  }
});

/* USER LOGIN*/
router.post("/login", async (req, res) => {
  try {
    /* Take the infomation from the form */
    const { email, password } = req.body

    /* Check if user exists */
    const user = await User.findOne({ email });
    console.log("User", user)
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }
    const isMatch = await bcrypt.compare(password, user.password)

    console.log("Password Match Status", isMatch)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" })
    }

    /* Generate JWT token */
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    delete user.password

    res.status(200).json({ token, user })

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
})

const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google-signup", async (req, res) => {
  try {
    const { token } = req.body;
    
    // Get user info from Google
    const ticket = await client.getTokenInfo(token);
    console.log("Ticket", ticket)
    
    const { email} = ticket;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // If user exists, log them in
      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.status(200).json({ message: "User logged in successfully", token: jwtToken, user });
    }
    
    // Create new user
    const newUser = new User({
      email,
      provider: 'google'
    });
    
    await newUser.save();
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET
    );
    
    res.status(201).json({
      message: "User created successfully",
      token: jwtToken,
      user: newUser
    });
  } catch (error) {
    console.error('Error in Google signup:', error);
    res.status(500).json({ message: "Google signup failed", error: error.message });
  }
});

module.exports = router