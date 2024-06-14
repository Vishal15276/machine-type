// routes/index.js

import express from 'express';
const router = express.Router();

// POST endpoint to save treatment
router.post('/treatments', async (req, res) => {
    const { machineType, treatment } = req.body;

    try {
        // Assuming 'treatments' is your collection in MongoDB
        const result = await db.collection('machines').insertOne({ machineType, treatment });
        res.status(201).json(result.ops[0]); // Return the inserted document
    } catch (err) {
        // console.error('Error saving treatment:', err);
        // res.status(500).json({ error: 'Failed to save treatment' });
    }
});

export default router;
