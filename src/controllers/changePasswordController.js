const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt'); // Optional if passwords are hashed

const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const customer = await prisma.customers.findUnique({
      where: { email },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // ✅ Password check (use bcrypt if passwords are hashed)
    // const isOldPasswordValid = await bcrypt.compare(oldPassword, customer.password);
    const isOldPasswordValid = oldPassword === customer.password; // Replace with bcrypt in production

    if (!isOldPasswordValid) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // ✅ Hash new password if using bcrypt
    // const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update password
    await prisma.customers.update({
      where: { email },
      data: {
        password: newPassword, // Replace with 'hashedNewPassword' if hashing
      },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { changePassword };
