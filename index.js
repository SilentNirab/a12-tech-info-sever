const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ezxu64p.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productCollection = client.db("tech-info").collection("products");
        const userCollection = client.db("tech-info").collection("users");
        const reviewCollection = client.db("tech-info").collection("reviews");

        //reviews releted api
        app.get('/reviews', async(req, res) => {
            const result = await reviewCollection.find().toArray()
            res.send(result)
        })
        app.post('/reviews', async(req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        //Product related api 
        app.get('/products', async(req, res) => {
            const result = await productCollection.find().toArray()
            res.send(result)
        })

        app.get('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await productCollection.findOne(query)
            res.send(result)
        })

        app.post('/products', async(req, res) =>{
            const product = req.body;
            const result = await productCollection.insertOne(product)
            res.send(result)
        })

        app.patch('/products/:id', async(req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const products = req.body;
            const updatedDoc = {
              $set: {
                upvote_button: products.upvote_button
              }
            }
            const result = await productCollection.updateOne(filter, products, updatedDoc);
            res.send(result);
        })
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result);
          })
        //User related api 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
              return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
          });
        
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('tech-info is runing')
})

app.listen(port, () => {
    console.log(`tech=info is runing on port ${port}`);
})