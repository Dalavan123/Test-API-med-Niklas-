//
const {
  getAllCustomers,
  getCustomerById,
  getCustomerByIdwithInvoices,
  postCustomer,
} = require('./customer.controller.js');

//här importerar vi in express
const express = require('express');

//här skapar vi våran app. Nu finns serverfunktionaliteten finns i app-variabeln
const app = express();

//den behövs för att make sure is a body attribute on the req object.
//den kan vara tom men vi vill alltid ha ett bodyobjekt
app.use(express.json());

//forward slash står för startsidan.
app.get('/', (req, res) => {
  res.send('App is running!');
});

//måste skapa en endpoint
app.get('/customers', getAllCustomers);
app.get('/customers/:id', getCustomerById);
app.get('/customers/:id/with-invoices', getCustomerByIdwithInvoices);
app.post('/customers', postCustomer);

//för att starta själva servern, nu är servern igång vilket är bra
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
