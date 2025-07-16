const express = require('express');
const prisma = require('./db.config');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const app = express();

// Middleware
app.use(express.json());


// Get all products
app.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/', async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id },
      data: req.body
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Product service is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Product service is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});


const packageDef = protoLoader.loadSync('./proto/product.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);
var productProto = grpc.loadPackageDefinition(packageDef).product;


function GetProduct(call, callback) {
  const { id } = call.request;
  prisma.product.findUnique({ where: { id } })
    .then(product => {
      if (!product) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: 'Product not found'
        });
      }
      callback(null, {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
      });
    })
    .catch(err => callback({
      code: grpc.status.INTERNAL,
      details: err.message
    }));
}


const server = new grpc.Server();
server.addService(productProto.ProductService.service, { GetProduct });
server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('Product gRPC server running on port 50052');
});