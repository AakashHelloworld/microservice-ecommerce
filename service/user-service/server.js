const express = require('express');
const prisma = require('./db.config');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const app = express();



// Middleware
app.use(express.json());

// Get all users
app.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Create user
app.post('/register', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Delete user
app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});


const packageDef = protoLoader.loadSync('./proto/user.proto');
const grpcObject = grpc.loadPackageDefinition(packageDef);
const userProto = grpcObject.user;

function GetUser(call, callback) {
  const { id } = call.request;
  console.log(`Fetching user with ID: ${id}`);
  if (!id) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: 'User ID is required'
    });
  }
  prisma.user.findUnique({ where: { id } })
    .then(user => {
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: 'User not found'
        });
      }
      callback(null, 
        {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      );
    })
    .catch(err => callback({
      code: grpc.status.INTERNAL,
      details: err.message
    }));
}

const server = new grpc.Server();
server.addService(userProto.UserService.service, { GetUser });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('User gRPC server running on port 50051');
});