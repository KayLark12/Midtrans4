const express = require('express');
const bodyParser = require('body-parser');
const midtransClient = require('midtrans-client');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/', async (req, res) => {
  const { order_id, gross_amount, customer_details, item_details } = req.body;

  console.log('Request received:', req.body);

  // Validasi customer_details
  if (!customer_details || !customer_details.first_name || !customer_details.email || !customer_details.phone) {
    console.error('Invalid customer details:', customer_details);
    return res.status(400).json({ error: 'Invalid customer details' });
  }

  // Validasi item_details
  if (!item_details || !Array.isArray(item_details) || item_details.length === 0) {
    console.error('Invalid item details:', item_details);
    return res.status(400).json({ error: 'Invalid item details' });
  }

  // Membuat instance Snap API
  let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: 'SB-Mid-server-aVSYun8nN8bkx0Dg3aacu-Sn'
  });

  // Mengatur parameter transaksi
  let parameter = {
    transaction_details: {
      order_id: order_id,
      gross_amount: gross_amount
    },
    customer_details: customer_details,
    item_details: item_details,
    enabled_payments: ["qris"]
  };

  try {
    // Membuat transaksi
    const transaction = await snap.createTransaction(parameter);
    const transactionToken = transaction.token;
    console.log('Transaction Token:', transactionToken);

    // Mengirim response dengan token transaksi
    res.status(200).json({ snapToken: transactionToken });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;
