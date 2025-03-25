const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt'); // Optional if you hash passwords
const jwt = require('jsonwebtoken');

// Secret key for signing JWT tokens (move to .env for production)
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with env variable in production
const JWT_EXPIRES_IN = '2h'; // Token valid for 2 hours

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await prisma.customers.findUnique({
      where: { email },
    });

    if (!customer) {
      return res.status(404).json({ message: 'User not found. Please check your email once.' });
    }

    // ⚠️ Optional: Compare hashed password if you store hashes
    // const isPasswordValid = await bcrypt.compare(password, customer.password);
    const isPasswordValid = password === customer.password; // Replace with bcrypt for security

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Loing Failed. Invalid password' });
    }

    // Update last login timestamp
    await prisma.customers.update({
      where: { customerId: customer.customerId },
      data: { lastLoggedIn: new Date() },
    });

    // Generate JWT Token
    const token = jwt.sign(
      { customerId: customer.customerId, email: customer.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      customer: {
        customerId: customer.customerId,
        customerName: customer.customerName,
        email: customer.email,
        profileImage: customer.profileImage,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { loginCustomer };
