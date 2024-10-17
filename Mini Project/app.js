const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;
// const upload = multer({ dest: "uploads/"});

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Set up Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`); // Unique filename
    }
});

const upload = multer({ storage });

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
    catering: Boolean,
    food: String,
    occasionType: String,
    venueImage: String,
    price: String,
    password: String,
    id:{type:String, unique:true}
});

// Create Owner model
const Owner = mongoose.model('Owner', OwnerSchema);

// Owner Signup Route
app.post('/owner-signup', upload.single('venueImage'), async (req, res) => {

    const { name, email, contact, venueName, venueLocation, venueCapacity, venueType, catering, food, occasionType, price, password } = req.body;

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
            food,
            occasionType,
            venueImage: req.file ? req.file.path : null,
            price,
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
        
        // If the password matches, redirect to the owner's detail page
        return res.redirect(`/detail.html?name=${encodeURIComponent(owner.name)}&venueName=${encodeURIComponent(owner.venueName)}&venueId=${encodeURIComponent(owner._id)}`);

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


// Define Booking Schema
const bookingSchema = new mongoose.Schema({
    name: String,
    contact: String,
    email: String,
    occasionType: String, 
    eventDate: Date,
    eventTime: String,
    guestNo: Number, 
    bookingPeriod: Number,
    venueName: String, 
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' } 
});

// Create Booking model
const Booking = mongoose.model('Booking', bookingSchema);


// Route to handle booking form submission

app.post('/book', async (req, res) => {
    const { name, contact, email, occasionType, eventDate, eventTime, guestNo, bookingPeriod, venueName } = req.body;
  
    // Check if venueName is present
    if (!venueName) {
      return res.send(` 
        <script> 
          alert('Venue not selected!'); 
          window.history.back(); 
        </script> 
      `);
    }
  
    try {
      // Find the venue by name
      const venue = await Owner.findOne({ venueName });
  
      if (!venue) {
        return res.send(` 
          <script> 
            alert('Venue not found!'); 
            window.history.back(); 
          </script> 
        `);
      }
  
      // Create a new booking document
      const newBooking = new Booking({
        name,
        contact,
        email,
        occasionType,
        eventDate,
        eventTime,
        guestNo,
        bookingPeriod,
        venueName,
        venueId: venue._id,
      });
  
      await newBooking.save();
  
      res.redirect(`/welcome?name=${encodeURIComponent(name)}`);
    } catch (err) {
      console.error('Error saving booking:', err);
      res.send(` 
        <script> 
          alert('Error submitting booking. Please try again.'); 
          window.history.back(); 
        </script> 
      `);
    }
  });


// Route to fetch all venues
app.get('/venues', async (req, res) => {
    try {
      const venues = await Owner.find({}).select('venueName');
      res.json(venues);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching venue data');
    }
  });

  
// Route to fetch booking data for a specific user
app.get('/booking/:name', async (req, res) => {
    try {
      const name = req.params.name;
      const bookings = await Booking.find({ name: name });
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Error fetching booking data' });
    }
  });


  // Route to get booking information using venueId (ObjectId)
app.get('/booking/venue/:venueId', async (req, res) => {
    try {
      const venueId = req.params.venueId;
      const bookings = await Booking.find({ venueId: venueId });
      res.json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching booking data');
    }
  });


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
