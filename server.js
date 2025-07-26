const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
});

// Middleware to parse JSON request bodies
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

// Define Product schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    benefits: { type: String, required: true },
});

// Create the Product model
const Product = mongoose.model('Product', productSchema);

// API endpoint to fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Define Enquiry schema
const enquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// API endpoint to handle enquiries
app.post('/api/enquiry', async (req, res) => {
    const newEnquiry = new Enquiry(req.body);
    try {
        await newEnquiry.save();
        res.status(201).send('Enquiry received');
    } catch (error) {
        console.error('Error saving enquiry:', error.message);
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'build')));
// Catchall handler for any requests that don't match above

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
