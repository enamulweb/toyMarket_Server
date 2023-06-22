require('dotenv').config()
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('mongodb');
const port = process.env.PORT || 5000 ;
const app = express()
const cors = require('cors')

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ltowhpf.mongodb.net/?retryWrites=true&w=majority`;
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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    const ToyCollection = client.db('ToyMarket').collection('ToyDb')

    app.get('/alltoys',async(req,res)=>{
        const limit = parseInt(req.query.limit)
        const search = req.query.search
        //console.log(limit,search)
        const toys =await ToyCollection.find({
          name: {$regex: search, $options: "i"} 
        }).limit(limit).toArray();
       // console.log(toys);
        res.send(toys)
    })
    app.get('/alltoy/:text',async(req,res)=>{
        const category = req.params.text;
        const toys = await ToyCollection.find(
            { subcategory : category}
        ).toArray()
        res.send(toys)
    })
    app.get('/mytoys',async(req,res)=>{
        const email = req.query.email;
        const sortvalue = parseInt(req.query.sort);
        console.log(email,sortvalue) 
        const options = {
          sort: {price : sortvalue}
        }
        const toys = await ToyCollection.find(
          {email: email},options
        ).toArray()
        res.send(toys)
    })
    app.get('/viewtoys/:id',async(req,res)=>{
        const id = req.params.id;
        const toy = await ToyCollection.find( {_id : new ObjectId(id)}).toArray()
        res.send(toy)
    })

    app.put("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      //console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description,
        },
      };
      const result = await ToyCollection.updateOne(filter, updateDoc);
      //console.log(result)
      res.send(result);
    });

    app.delete("/delete/:id",async (req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await ToyCollection.deleteOne(filter)
      res.send(result)
    })

    app.post('/addtoy',async(req,res)=>{
      const body = req.body;
      const result = await ToyCollection.insertOne(body)
      res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('Welcome To Toy Market Server')
})
app.listen(port);