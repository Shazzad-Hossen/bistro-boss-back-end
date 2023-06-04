require('dotenv').config()
const express= require('express');
const cors= require('cors');
const port= process.env.PORT || 5000;
const jwt= require('jsonwebtoken');
const app= express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.abirkqb.mongodb.net/?retryWrites=true&w=majority`;

//middleware
app.use(cors());
app.use(express.json());
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
    await client.connect();
    const database = client.db("bistroBoss");
    const menu = database.collection("menu");
    const cart = database.collection("cart");
    const users = database.collection("users");

    app.post('/jwt',(req,res)=>{
      const user= req.body;
      const token= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'});
        res.send(token);
    })

    //User related api
    app.get('/users', async(req,res)=>{
      const result= await users.find().toArray();
      res.send(result);
    })

    app.patch('/users/admin/:id',async(req,res)=>{

      const id= req.params.id;
      const uRole= req.body.role;
      const query= { _id: new ObjectId(id)};
      const updatedDoc= {
        $set: {
          role: uRole
        }

      }
      const result= await users.updateOne(query,updatedDoc);
      res.send(result);

    })




    app.post('/users',async(req,res)=>{

      const user=req.body;
      const query= {email: user.email};
      const isExist= await users.findOne(query);
      
      if(isExist) {
        return res.send({message: 'user already exist'});

      }
      const result= await users.insertOne(user);
      res.send(result);

    })

  //Menu related apies
    app.get('/menu/:cat',async(req,res)=>{
        const cat= req.params.cat;
        if(cat==='all') {
             res.send(await menu.find({}).toArray());

        }
        else {
            const query = { category: cat };
        const cursor = await menu.find(query).toArray();
        res.send(cursor)
        }  
    });





   //Cart collection

   app.post('/carts',async(req,res)=>{

    const item = req.body;
    const result= await cart.insertOne(item);
    res.send(result);
   })


   app.get('/carts',async(req,res)=>{
    const email= req.query.email;
    if(!email) res.send([]);
    const query= {email: email};
    const cursor= await cart.find(query).toArray();
    res.send(cursor)

   });


   app.delete('/carts/:id',async(req,res)=>{
    const id=req.params.id;
    const query= { _id: new ObjectId(id)};
    const result= await cart.deleteOne(query);
    res.send(result) ;
   });






 
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send("Backend is running");
});

app.listen(port,()=>{
    console.log(`server is running at http://localhost:${port}`);
});
