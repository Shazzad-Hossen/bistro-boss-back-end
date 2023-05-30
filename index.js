require('dotenv').config()
const express= require('express');
const cors= require('cors');
const port= process.env.PORT || 5000;
const app= express();
const { MongoClient, ServerApiVersion } = require('mongodb');
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
        
       
        
    })


 
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
