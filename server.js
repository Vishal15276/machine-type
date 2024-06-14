import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';


const app = express();
const port = 5000;

// MongoDB URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Database and Collection
const dbName = 'machines';
const usersCollection = 'users';

// __dirname and __filename replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        console.log(`Connected to MongoDB database: ${dbName}`);

        // Middleware
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json()); // JSON body parser

        // Correct path to serve the React build files
        app.use(express.static(path.join(__dirname, '..', 'Machine-Treatment-app', 'frontend', 'build')));

        // API Route to fetch all treatments
        app.get('/api/machines', async (req, res) => {
            try {
                const machines = await db.collection('machines').find({}).toArray();
                res.json(machines);
            } catch (err) {
                console.error('Error fetching machines:', err);
                res.status(500).json({ error: 'Failed to fetch machines' });
            }
        });

        app.put('/api/machines/:id', async (req, res) => {
            const { id } = req.params;
            const { purpose } = req.body;
            try {
                const result = await db.collection('machines').updateOne({ _id: new ObjectId(id) }, { $set: { purpose } });
                if (result.modifiedCount === 0) {
                    console.log(`Machine with id ${id} not found`);
                    return res.status(404).json({ message: 'Machine not found' });
                }
                console.log(`Machine with id ${id} updated successfully`);
                res.status(200).json({ message: 'Machine updated successfully' });
            } catch (err) {
                console.error('Error updating machine purpose:', err);
                res.status(500).json({ error: 'Failed to update machine purpose' });
            }
        });


        // API Route to fetch treatments by machineType
        app.get('/api/treatments/:machineType', async (req, res) => {
            const { machineType } = req.params;

            try {
                const treatments = await db.collection('machines').find({ machineType }).toArray();
                res.json(treatments);
            } catch (err) {
                console.error(`Error fetching treatments for machineType ${machineType}:`, err);
                res.status(500).json({ error: `Failed to fetch treatments for machineType ${machineType}` });
            }
        });

        app.delete('/api/machines/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const result = await db.collection('machines').deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 0) {
                    console.log(`Machine with id ${id} not found`);
                    return res.status(404).json({ message: 'Machine not found' });
                }
                console.log(`Machine with id ${id} deleted successfully`);
                res.status(200).json({ message: 'Machine deleted successfully' });
            } catch (err) {
                console.error('Error deleting machine:', err);
                res.status(500).json({ error: 'Failed to delete machine' });
            }
        });

        
        
        app.post('/api/register', async (req, res) => {
            const { email, password } = req.body;
            try {
                const user = await db.collection(usersCollection).findOne({ email });
                if (user) {
                    return res.status(400).json({ message: 'User already exists' });
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.collection(usersCollection).insertOne({ email, password: hashedPassword });
                res.status(201).json({ message: 'User registered successfully' });
            } catch (err) {
                console.error('Error registering user:', err);
                res.status(500).json({ error: 'Failed to register user' });
            }
        });


        // API Route to fetch a single machine by ID
app.get('/api/machines/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const machine = await db.collection('machines').findOne({ _id: new ObjectId(id) });
        if (!machine) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        res.json(machine);
    } catch (err) {
        console.error(`Error fetching machine with id ${id}:`, err);
        res.status(500).json({ error: `Failed to fetch machine with id ${id}` });
    }
});


        app.post('/api/login', async (req, res) => {
            const { email, password } = req.body;
            try {
                const user = await db.collection(usersCollection).findOne({ email });
                if (!user) {
                    return res.status(401).json({ message: 'Invalid email or password' });
                }
                const isValidPassword = await bcrypt.compare(password, user.password);
                if (!isValidPassword) {
                    return res.status(401).json({ message: 'Invalid email or password' });
                }
                res.status(200).json({ message: 'Login successful', token: 'fake-jwt-token' });
            } catch (err) {
                console.error('Error logging in:', err);
                res.status(500).json({ error: 'Failed to login' });
            }
        });

        // API Route for handling machine treatment details
        app.post('/api/machines', async (req, res) => {
            const { machineName, machineType, purpose } = req.body;

            try {
                const result = await db.collection('machines').insertOne({ machineName, machineType, purpose });

                if (result.ops && result.ops.length > 0) {
                    console.log('Machine data saved to MongoDB:', result.ops[0]);
                    res.status(201).json(result.ops[0]); // Return the inserted document
                } else {
                    
                    throw new Error('Data saved successfully'); // Handle case where result.ops[0] is undefined
                }
            } catch (err) {
                console.error('Data saved successfully');
                res.status(500).json({ message: 'Data saved successfully' });

            }
        });

        // Serve React app for all other routes
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'Machine-Treatment-app', 'frontend', 'build', 'index.html'));
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

startServer();