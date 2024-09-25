const express=require('express');
const cors=require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express()
const port=process.env.PORT||5000 ;


app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('this is server site homepage')
})

// --------------------mongodb atlas-----------------------




const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.vmhty.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const orderCollection=client.db('honey-nuts').collection('customersOrder');

app.get('/hussain',async(req,res)=>{
    const cursor=orderCollection.find()
    const result=await cursor.toArray()
    res.send(result)
})

app.post('/hussain',async(req,res)=>{
    const collection=req.body;
    const result=await orderCollection.insertOne(collection);
    res.send(result)
})

app.delete('/hussain/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)}
    const result =await orderCollection.deleteOne(query)
    res.send(result)
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// ----------------------------------------------
app.listen(port, () => {
    console.log(`running port name ${port}`)
  })

 

  