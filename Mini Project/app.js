const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const session = require('express-session');
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
         // Pass the user's name to the welcome page
         return res.redirect(`/welcome?name=${encodeURIComponent(user.name)}`);

    } catch (err) {
        console.error(err);
        return res.status(500).send(`
            <script>
                alert('Error on the server.');
                window.history.back();
            </script>
        `);
    }
});

// Serve the welcome page
app.get('/welcome', (req, res) => {
    const userName = req.query.name || 'Guest'; // Default to 'Guest' if no name is passed
    res.sendFile(__dirname + '/public/welcome.html', { userName});
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
    console.log( req.body); 

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

// Serve Owner Login Page
app.get('/owner-login', (req, res) => {
    res.sendFile(__dirname + '/public/owner_login.html');
});

// Owner Login Route
app.post('/owner-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the owner by email
        const owner = await Owner.findOne({ email });
        
        if (!owner) {
            return res.send(`
                <script>
                    alert('No owner found.');
                    window.history.back();
                </script>
            `);
        }
        
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, owner.password);
        
        if (!isMatch) {
            return res.send(`
                <script>
                    alert('Invalid password.');
                    window.history.back();
                </script>
            `);
        }
        
        // If the password matches, redirect to the owner's dashboard or detail page
        // If the password matches, redirect to the owner's detail page
        return res.redirect(`/detail.html?name=${encodeURIComponent(owner.name)}&venueName=${encodeURIComponent(owner.venueName)}`);

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

// Serve the owner detail page
app.get('/detail.html', (req, res) => {
    const userName = req.query.name || 'Guest';
    const venueName = req.query.venueName || 'No Venue';
    res.sendFile(__dirname + '/public/detail.html');
});

// Route to get venue information
app.get('/venues', async (req, res) => {
    try {
        const venues = await Owner.find({}); // Fetch all owners (or filter based on requirements)
        res.json(venues); // Send the venues data as JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching venue data');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
