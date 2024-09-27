const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eventura')
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });

// Define User Schema
const userSchema = new mongoose.Schema({
    name: String,
    contact: String,
    email: { type: String, unique: true },
    password: String,
    location: String
});

// Create User model
const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/user.html');
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { name, contact, email, password, location } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        contact,
        email,
        password: hashedPassword,
        location
    });

    try {
        await newUser.save();
        // res.redirect("/signin-page")
        res.send(`
            <script>
                alert('User registered successfully!');
                window.location.href = '/signin-page';
            </script>
        `);
    } catch (err) {
        res.send(`
            <script>
                alert('Error: ${err.message}');
                window.history.back();
            </script>
        `);;
    }
});

// Serve the sign-in page
app.get('/signin-page', (req, res) => {
    res.sendFile(__dirname + '/public/user_login.html');
});

// Login Route
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.send(`
                <script>
                    alert('No user found.');
                    window.history.back();
                </script>
            `);        
        }
        
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.send(`
                <script>
                    alert('Invalid password.');
                    window.history.back();
                </script>
            `);        
        }
        
        // If the password matches, redirect to welcome page
        res.send(`
            <script>
                alert('Sign in successful!');
                window.location.href = '/welcome';
            </script>
        `);

    } catch (err) {
        console.error(err);
        res.status(500).send(`
            <script>
                alert('Error on the server.');
                window.history.back();
            </script>
        `);
    }
});

// Serve the welcome page
app.get('/welcome', (req, res) => {
    res.sendFile(__dirname + '/public/welcome.html');
});


// Define owner schema
const OwnerSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    contact: String,
    venueName: String,
    venueLocation: String,
    venueCapacity: String,
    venueType: String,
    catering: String,
    occasionType: String,
    password: String,
    id:{type:String, unique:true}
});

// Create Owner model
const Owner = mongoose.model('Owner', OwnerSchema);

// Owner Signup Route
app.post('/owner-signup', async (req, res) => {
    // console.log('Request Body:', req.body); // Debug: Log request body to console

    const { name, email, contact, venueName, venueLocation, venueCapacity, venueType, catering, occasionType, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newOwner = new Owner({
            id: uuidv4(),
            email,
            name,
            contact,
            venueName,
            venueLocation,
            venueCapacity,
            venueType,
            catering,
            occasionType,
            password: hashedPassword
        });

        await newOwner.save();
        res.send(`
            <script>
                alert('Owner registered successfully!');
                window.location.href = '/owner-login';
            </script>
        `);
    } catch (err) {
        res.send(`
            <script>
                alert('Error: ${err.message}');
                window.history.back();
            </script>
        `);
    }
});


// Owner Login Route
app.post('/owner/login', async (req, res) => {
    const { email, password } = req.body;

    // Check for required fields
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Find the owner by email
        const owner = await Owner.findOne({ email });

        if (!owner) {
            return res.status(404).json({ message: "No owner found with this email." });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, owner.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }

        // If the password matches, redirect to the owner's dashboard
        res.json({
            message: "Login successful!",
            redirectUrl: '/detail.html' // Owner dashboard or detail page
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error on the server: " + err.message });
    }
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
