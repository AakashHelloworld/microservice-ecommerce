const express = require('express');
const mongoose = require('mongoose');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const {Kafka}  = require('kafkajs');

const kafka = new Kafka({ 
  clientId: 'order-service', // Fixed: was 'notification-service'
  brokers: ['kafka:9092'] 
});

const producer = kafka.producer();

const app = express();
app.use(express.json());

console.log("Order service is starting...");

// Connect to MongoDB
console.log(process.env.MONGO_URL);
if (!process.env.MONGO_URL) {
    console.error('MONGO_URL environment variable is not set');
    process.exit(1);
}
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Fixed Order schema - added email field
const orderSchema = new mongoose.Schema({
  productList: [
    {
      name: String,
      price: Number,
      description: String,
    },
  ],
  username: String,
  email: String,     // Added this field
  phoneno: String,
  location: String,
});

const Order = mongoose.model('Order', orderSchema);

// gRPC client setup
const userProtoDef = protoLoader.loadSync('./proto/user.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
var userProto = grpc.loadPackageDefinition(userProtoDef).user;
const userClient = new userProto.UserService('user-service:50051', grpc.credentials.createInsecure());

const productProtoDef = protoLoader.loadSync('./proto/product.proto');
const productProto = grpc.loadPackageDefinition(productProtoDef).product;
const productClient = new productProto.ProductService('product-service:50052', grpc.credentials.createInsecure());

// Initialize Kafka producer
async function initKafka() {
  try {
    await producer.connect();
    console.log("Kafka producer connected successfully");
  } catch (error) {
    console.error('Failed to connect Kafka producer:', error);
    process.exit(1);
  }
}

// Create order
app.post('/', async (req, res) => {
  const { productList, userId } = req.body;
  console.log('Received order request:', req.body);
  console.log('...............................................................');
  console.log(productList, userId);
  // Fetch user info via gRPC
  userClient.GetUser({ id: userId }, async (err, userRes) => {
    if (err || !userRes.id) {
      console.error('Error fetching user:', err);
      return res.status(400).json({ error: 'Error from Order - User not found' });
    }

    // Fetch product info for each product
    let products = [];
    let errors = [];
    let completed = 0;

    if (productList.length === 0) {
      return res.status(400).json({ error: 'Product list cannot be empty' });
    }

    productList.forEach((p, idx) => {
      productClient.GetProduct({ id: p }, async (err, prodRes) => {
        console.log(`Fetching product with ID: ${p}`);
        completed++;
        
        if (err || !prodRes.id) {
          errors.push(`Product ${p} not found`);
        } else {
          products.push({
            name: prodRes.name,
            price: prodRes.price,
            description: prodRes.description,
          });
        }

        if (completed === productList.length) {
          if (errors.length) {
            return res.status(400).json({ error: errors });
          }
          
          try {
            // Save order - Fixed typo: paroducts -> products
            const order = new Order({
              productList: products,  // Fixed typo here
              username: userRes.name,
              email: userRes.email,
              phoneno: userRes.phone || '', // Added fallback
              location: userRes.location || '', // Added fallback
            });
            
            const saved = await order.save();
            
            // Send event to Kafka
            await producer.send({
              topic: 'order-events',
              messages: [
                { 
                  value: JSON.stringify({ 
                    orderId: saved._id.toString(), 
                    email: userRes.email, 
                    products: products 
                  })
                }
              ],
            });
            
            console.log(`Order event sent for order ID: ${saved._id}`);
            res.status(201).json(saved);
            
          } catch (error) {
            console.error('Error saving order or sending to Kafka:', error);
            res.status(500).json({ error: 'Failed to create order or send event' });
          }
        }
      });
    });
  });
});

// Read all orders
app.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize Kafka and start server
async function startServer() {
  await initKafka();
  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
  });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await producer.disconnect();
  process.exit(0);
});