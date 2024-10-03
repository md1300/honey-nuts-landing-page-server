const express=require('express');
const cors=require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express()
const port=process.env.PORT||5000 ;

const corsOptions={
  origin:['http://localhost:5173','http://localhost:5174'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials:true,
  optionSuccessStatus:200,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())


app.get('/',(req,res)=>{
    res.send('this is server site homepage')
})

// create middleware to verify cookies -----------

const verifyToken=(req,res,next)=>{
  const token=req.cookies?.token;
  
  if(!token) return res.status(401).send({message:'unauthorized access'})
  if(token){
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
      if(error){
        console.log(error)
        return res.status(401).send({message:'unauthorized access'})
      }
      // console.log(decoded)
      req.user=decoded ;
      next()
    })
  }
}



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

// ------------- create jwt in  server  ---------------------------
app.post('/jwt',(req,res)=>{
    const email=req.body;
    const token=jwt.sign({email},process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '180d'})  
    res.cookie('token',token ,{
      httpOnly:true,
      secure: process.env.NODE_ENV==='production',
      sameSite: process.env.NODE_ENV==='production'?'none':'strict'
    })
    .send({success:true})
})

// ------------------clear cookies from server 

app.get('/logout',(req,res)=>{
  res.clearCookie('token',{
    httpOnly:true,
    secure:process.env.NODE_ENV==='production',
    sameSite:process.env.NODE_ENV==='production'?'none':'strict',
    maxAge:0
  })
  .send({success:true})
})



app.get('/jabir/:email',verifyToken,async(req,res)=>{
    const email=req.params.email 
    const tokenEmail=req.user.email;
    if(email!==tokenEmail.email){ 
      return  res.status(403).send({message:'forbidden access'})
    };
    const query={authorEmail:'email'};
    const cursor=orderCollection.find();
    const result=await cursor.toArray();
    res.send(result);
})

app.
    post('/hussain',async(req,res)=>{
    const collection=req.body;
    const result=await orderCollection.insertOne(collection);
    res.send(result);
})

app.delete('/hussain/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)};
    const result =await orderCollection.deleteOne(query);
    res.send(result);
})

// to see customer order -------------
app.get('/myOrder/:email', verifyToken, async(req,res)=>{
  const email=req.params.email;
  const tokenEmail=req.user.email; 
  if(email!==tokenEmail.email){ 
    return  res.status(403).send({message:'forbidden access'})
  };
  const query={email};
  const result=await orderCollection.find(query).toArray();
  res.send(result) ;
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

 

  