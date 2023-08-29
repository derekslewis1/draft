
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "https://draft-ten.vercel.app", // your client-side URL
    methods: ["GET", "POST"],
    credentials: true
  }
});
const bodyParser = require('body-parser');
const User = require('./models/User');
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("DB connected"))
  .catch(err => console.error(err));

console.log(process.env.MONGO_URI);

const cors = require('cors');
app.use(cors({
  origin: 'https://draft-ten.vercel.app', // your client-side URL
  methods: ['GET', 'POST'],
  credentials: true // This allows the session cookie to be sent back and forth
}));

// Middleware to parse request body
app.use(bodyParser.json());
app.get("/", (req, res) => {
  const response = {
    greeting: "Hello",
  };
  res.send(response);
});
app.post('/join', async (req, res) => {
  const { username } = req.body;

  try {
    const newUser = new User({ username });
    await newUser.save();

    const users = await User.find({});
    const updatedUsernames = users.map(user => user.username);

    io.emit('update-usernames', updatedUsernames);

    res.status(200).json({ message: 'User added successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding user.' });
  }
});

const shuffleArray = (array) => {
  for (let i = array.length -1; i> 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.post('/start-draft', async(req, res) =>{
  const users = await User.find({});
  const usernames = users.map(user => user.username);
  const shuffledUsernames = shuffleArray(usernames);
  io.emit('draft-order', shuffledUsernames);
  res.status(200).json({order: shuffledUsernames});

})

app.get('/join', async (req, res) => {
  try {
    const users = await User.find({});
    const usernames = users.map(user => user.username);
    res.status(200).json(usernames);
  } catch(error) {
    console.error("Error Fetching Users:", error);
    res.status(500).json({ message: "Internal Server Error"});
  }
})

app.use('*', (req, res) => {
  res.status(405).json({ message: 'Method not allowed.' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', ()=> {
  
  console.log("Server is listening")

})

io.on('connection', (socket) => {
  console.log("a user connected", socket.id);
  
  socket.on('disconnect', ()=>{
    console.log('user disconnected', socket.id);
  });

});


