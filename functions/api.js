const { MongoClient } = require('mongodb');
const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi MongoDB
const uri = "mongodb+srv://tokowgn:madewgn@cluster0.xily2.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let ipsCollection;

// Koneksi ke MongoDB
async function connectToMongo() {
    if (!ipsCollection) {
        await client.connect();
        const db = client.db('ips_database');
        ipsCollection = db.collection('ips_collection');
    }
    return ipsCollection;
}

app.get('/', (req, res) => {
    res.send('/ip');
});

app.get('/ip', async (req, res) => {
    try {
        const collection = await connectToMongo();
        const allIps = await collection.find({}).toArray();
        let formattedIps = '';
        allIps.forEach(item => {
            formattedIps += `### ${item.name || 'N/A'} ${item.exp || 'N/A'} ${item.ip}\n`;
        });
        res.setHeader('Content-Type', 'text/plain');
        res.send(formattedIps);
    } catch (error) {
        res.status(500).send('Error mengambil data IP');
    }
});

app.post('/ip', async (req, res) => {
    try {
        const collection = await connectToMongo();
        const { ip, type } = req.body;
        await collection.insertOne({ ip, type });
        res.send('IP berhasil ditambahkan!');
    } catch (error) {
        res.status(500).send('Error menambahkan IP');
    }
});

module.exports.handler = serverless(app);
