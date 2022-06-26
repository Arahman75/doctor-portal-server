express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors = require('cors');
// const  admin = require("firebase-admin");

require('dotenv').config();
const port = process.env.PORT || 5000;
//doctors-portal-firebase-adminsdk.json

// const serviceAccount = require('./doctors-portal-firebase-adminsdk.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f3jci.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//if don't work this is on

async function verifyToken(req, res, next){
  if(req.headers?.authorization?.startsWith('Bearer ')){
    const token = req.headers.authorization.split(' ')[1]
  }
  next();
}

// async function verifyToken(req, res, next){
//   if(req.headers?.authorization?.startsWith('Bearer ')){
//     const token = req.headers.authorization.split(' ')[1]
//     try{
// const decodedUser = await admin.auth().verifyIdToken(token);
// req.decodedEmail = decodedUser.email;
//     }
//     catch{

//     }
//   }
//   next();
// }

async function run() {
  try {
    await client.connect();
    const database = client.db('doctors_portal');
    const appointmentsCollection = database.collection('appointments');
    const usersCollection = database.collection('users');
    //the code don't work this is on admin verify token

app.get('/appointments', async(req, res) =>{
  const email = req.query.email;
  const date =new Date (req.query.date).toLocaleDateString();
  // console.log(date);
  const query = {email: email ,date: date};
  // console.log(query);
  const cursor = appointmentsCollection.find(query);
  const appointments = await cursor.toArray();
  res.json(appointments);
});

// app.get('/appointments',verifyToken, async(req, res) =>{
//   const email = req.query.email;
//   const date =new Date (req.query.date).toLocaleDateString();
//   // console.log(date);
//   const query = {email: email ,date: date};
//   // console.log(query);
//   const cursor = appointmentsCollection.find(query);
//   const appointments = await cursor.toArray();
//   res.json(appointments);
// });

    app.post('/appointments', async(req, res) =>{
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      // console.log(result);
      res.json(result)
    });

    app.get('/users/:email', async(req, res)=>{
      const email = req.params.email;
      const query = { email: email};
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    })

    app.post('/users', async(req, res) =>{
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      // console.log(result);
      res.json(result)
    });

    app.put('/users', async(req, res)=>{
      const user = req.body;
      // console.log(user);
      const filter = {email: user.email};
      const options = { upsert: true };
      const updateDoc = {$set: user};
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      // console.log(result);
      res.json(result)
    });

//the code don't work this is on admin verify token

    app.put('/users/admin',verifyToken, async(req, res) =>{
      const user = req.body;
      console.log('put', req.headers.authorization);
      const filter = {email: user.email};
      const updateDoc = {$set: {role: 'admin'}};
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result)
    })

//     app.put('/users/admin', verifyToken, async(req, res) =>{
//       const user = req.body;
//       const requester = req.decodedEmail;
// if(requester){
//   const requesterAccount = await usersCollection.findOne({email: requester});
//   if(requesterAccount.role === 'admin'){
//     const filter = {email: user.email};
//     const updateDoc = {$set: {role: 'admin'}};
//     const result = await usersCollection.updateOne(filter, updateDoc);
//     res.json(result)
//   }
// }
// else{
//   res.status(403).json({message: 'You do not have access make an admin'})
// }
    
//     })

  }

  finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World Doctor Portal!')
})

app.listen(port, () => {
  console.log('doctor portal running')
})


// users: get
// users: post
// app.get('/users');
// app.get('/users/:id');
// app.put('/users/:id');
// app.post('/users');
// app.delete('/users/:id');