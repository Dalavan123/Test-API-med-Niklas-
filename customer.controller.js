//här vill vi skapa en kontakt till databasen
const Database = require('better-sqlite3');
//här skapar vi kontakt vår databas
const db = new Database('chinook.db');

//controllerfunktion
const getAllCustomers = (req, res) => {
  //nu vill vi skapa en query till databasen.
  //mellanlagring i en variabel
  const query = `SELECT * FROM customers`;
  //här förbereder vi ett statement
  //förbereder query, ett förberedande variabel som är redo att skickas.
  //har lite med säkerhet att göra, mer behöver man inte veta
  const stmt = db.prepare(query);
  //all betyder att vi hämtar alla rader i den tabellen.
  //customers kommer att ge tillbaka en array
  //här kör vi queryn, om vi har frågor kan vi skicka in här. Detta för att förhindra sql injection.
  const customers = stmt.all();

  //om customers.length är lika med 0 är det falsy, men utropstecknet ger det motsatta if (!customers.length)
  //checken, om längden är tom har den inget resultat
  if (customers.length === 0) {
    return res.status(404).json({ message: 'No customers found' });
  }
  //annars skickar vi bara tillbaka det vill få ut
  return res.json(customers);
};

//om det står id med i funktionen måste id:et följa med
const getCustomerById = (req, res) => {
  //params kommer alltid finnas, när vi skapar vår endpoint kommer det med paramsobjekt, pathvariabel.
  //nedan är en typ av destructuring, hade kunna skriva det längre
  const { id } = req.params;

  //kontrollera om id:et är ett nummer då vi vet att id:et är ett nummer i databasen,
  //parseINT will return Nan if the parsing doesnt work. NaN is always falsy.
  //400 är bad request
  if (!parseInt(id)) {
    return res.status(400).json({ message: 'Id must be a number' });
  }

  //frågetecknet har också lite med säkerhet, behöver ej gå djupare, men kallas för att vi parametiserar.
  const query = `SELECT * FROM customers WHERE CustomerId = ?`;
  //här skickar vi in vår query som första argument
  const stmt = db.prepare(query);
  //sen vill vi anropa vår query
  //get hämtar alltid första
  //vi är ute efter ett värde pga. ett frågetecken, så vi lägger in värdet vi vill få ut.
  //värdet läggs in som en array
  //att vi skapar en variabel gör att vi kan ta tag i det som returneas
  //get kommer alltid returnera ett objekt
  const customer = stmt.get([id]);

  //check om customer är undefined/falsy eller null ska den visa felmeddelandet
  if (!customer) {
    return (
      res
        //404 är not found
        .status(404)
        .json({ message: `Customer with id ${id} does not exist` })
    );
  }

  return res.json(customer);
};

const getCustomerByIdwithInvoices = (req, res) => {
  //1. Get customer first
  //params kommer alltid finnas, när vi skapar vår endpoint kommer det med paramsobjekt, pathvariabel.
  //nedan är en typ av destructuring, hade kunna skriva det längre
  const { id } = req.params;

  //kontrollera om id:et är ett nummer då vi vet att id:et är ett nummer i databasen,
  //parseINT will return Nan if the parsing doesnt work. NaN is always falsy.
  //400 är bad request
  if (!parseInt(id)) {
    return res.status(400).json({ message: 'Id must be a number' });
  }

  //frågetecknet har också lite med säkerhet, behöver ej gå djupare, men kallas för att vi parametiserar.
  const query = `SELECT CustomerId, FirstName, LastName FROM customers WHERE CustomerId = ?`;
  //här skickar vi in vår query som första argument
  const stmt = db.prepare(query);
  //sen vill vi anropa vår query
  //get hämtar alltid första
  //vi är ute efter ett värde pga. ett frågetecken, så vi lägger in värdet vi vill få ut.
  //värdet läggs in som en array
  //att vi skapar en variabel gör att vi kan ta tag i det som returneas
  //get kommer alltid returnera ett objekt
  const customer = stmt.get([id]);

  //check om customer är undefined/falsy eller null ska den visa felmeddelandet
  if (!customer) {
    return (
      res
        //404 är not found
        .status(404)
        .json({ message: `Customer with id ${id} does not exist` })
    );
  }

  //2. Get invoices on the customer

  //skapar vår query
  const invoiceQuery = `SELECT InvoiceId, Total FROM invoices WHERE CustomerId = ?`;
  //skapar statement, ger det bara ett nytt namn då vi redan använt stmt däruppe
  const invoiceStmt = db.prepare(invoiceQuery);
  //vi ska hämta alla invoices
  const invoices = invoiceStmt.all([id]);

  //vi vet att invoices är en array och det vill vi skicka tillbaka, annars ge felmeddelandet
  if (invoices.length === 0) {
    return res
      .status(404)
      .json({ message: `Customer with id ${id} doesnt have any invoices` });

    //3. Put them togheter and send a response
  }

  const customerWithInvoices = {
    //spread operator, sprider ut customervariabeln ovan och sprider ut det här. Vill ha invoices som attribut i en array.
    ...customer, //Will copy all the key-value pairs from the customer object
    invoices, //invoices: invoices
  };

  return res.json(customerWithInvoices);
};

const postCustomer = (req, res) => {
  //när vi gör en post dyker det alltid upp en body, så den kan vi hämta ut direkt från req.objektet
  const { body } = req;
  //sen tar vi ut bodyn och de nödvändiga properties
  const { FirstName, LastName, Email } = body;

  //måste kolla så alla finns tillgängliga åt oss, annars förstörs queryn
  //skapar därmed nedanstående villkor
  //vi kan se att det blir en boolean av detta
  //kallas för turnery operator, om det är sant returnerar det direkt efter kolonet (true, annars det direkt efter kolo dvs. false)
  //en one-liner, snyggt och kompakt
  const bodyIsComplete = FirstName && LastName && Email ? true : false;

  if (bodyIsComplete === false) {
    return res
      .status(400)
      .json({ message: 'Body is malformed or not complete' });
  }

  //med backticks kan man skapa ny rad
  const query = `
    INSERT INTO customers (FirstName, LastName, Email)
    VALUES (?, ?, ?)
    `;

  //skapar vår statment
  const stmt = db.prepare(query);
  //nu ska vi köra själva queren.
  //run kör vi när vi ska skapa, uppdatera eller delete. Måste vara i samma ordning som de är i queryn.
  const { lastInsertRowid } = stmt.run(FirstName, LastName, Email);

  //skapar vår query
  const customerQuery = `SELECT * FROM customers WHERE CustomerId = ?`;
  //skapar statement, ger det bara ett nytt namn då vi redan använt stmt däruppe
  const customerStmt = db.prepare(customerQuery);
  //vi ska hämta alla invoices
  const customer = customerStmt.get([lastInsertRowid]);

  return res.status(201).json({
    message: 'Customer was successfully created',
    newCustomer: customer,
  });
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerByIdwithInvoices,
  postCustomer,
};
