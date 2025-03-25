const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Update customer details (name, image, message, etc.)
 * Allows partial updates
 */
const updateCustomer = async (req, res) => {
  try {
    const { customerId, customerName, profileImage, profileMessage, email, password, lastLoggedIn } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }

    // Build the updateData object dynamically based on provided fields
    const updateData = {};
    if (customerName !== undefined) updateData.customerName = customerName;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (profileMessage !== undefined) updateData.profileMessage = profileMessage;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (lastLoggedIn !== undefined) updateData.lastLoggedIn = new Date(lastLoggedIn);

    const updatedCustomer = await prisma.customers.update({
      where: { customerId },
      data: updateData,
    });

    res.status(200).json({ message: 'Customer updated successfully', updatedCustomer });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { updateCustomer };