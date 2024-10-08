require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection string from .env file
const atlasDb = process.env.ATLASDB_URL;

// Connect to MongoDB Atlas
mongoose.connect(atlasDb, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Schema and Model
const PriceSchema = new mongoose.Schema({
    price: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});
const Price = mongoose.model('Price', PriceSchema);

// API Routes
app.post('/api/data', async (req, res) => {
    const { price } = req.body;
    const newPrice = new Price({ price });
    await newPrice.save();
    res.status(201).json(newPrice);
});

app.get('/api/data', async (req, res) => {
    const filter = req.query.filter;

    let query = {};
    if (filter === '10min') {
        query.timestamp = { $gte: new Date(Date.now() - 10 * 60 * 1000) }; // Last 10 minutes
    } else if (filter === '1hour') {
        query.timestamp = { $gte: new Date(Date.now() - 60 * 60 * 1000) }; // Last 1 hour
    }

    const data = await Price.find(query);
    res.json(data);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));