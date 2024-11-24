const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Konfigurasi MongoDB
const uri = "mongodb+srv://tokowgn:madewgn@cluster0.xily2.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let ipsCollection;

// Koneksi ke MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        const db = client.db('ips_database');
        ipsCollection = db.collection('ips_collection');
        console.log('Terhubung ke MongoDB');
    } catch (error) {
        console.error('Error koneksi MongoDB:', error);
    }
}
connectToMongo();

// Route utama
app.get('/', (req, res) => {
    res.send('/ip');
});

// Route untuk menangani IP
app.get('/ip', async (req, res) => {
    try {
        const allIps = await ipsCollection.find({}).toArray();
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
        const { ip, type } = req.body;
        await ipsCollection.insertOne({ ip, type });
        res.send('IP berhasil ditambahkan!');
    } catch (error) {
        res.status(500).send('Error menambahkan IP');
    }
});

// Menjalankan server
const PORT = 80;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server berjalan di port ${PORT}`);
});
