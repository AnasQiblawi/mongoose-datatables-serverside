# mongoose-datatables-serverside
**mongoose-datatables-serverside** simplifies server-side DataTables integration with MongoDB using Mongoose. Easily construct and execute queries, enabling advanced data searching, sorting, and pagination for your web applications.

![npm](https://img.shields.io/npm/v/mongoose-datatables-serverside) ![npm](https://img.shields.io/npm/dm/mongoose-datatables-serverside) ![NPM](https://img.shields.io/npm/l/mongoose-datatables-serverside)


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Getting Started](#getting-started)
- [Issues](#issues)
- [Acknowledgments](#acknowledgments)
- [Author](#author)

## Installation

You can install **mongoose-datatables-serverside** via npm:

```bash
npm install mongoose-datatables-serverside
```

## Usage

Here's how you can use this package to create server-side DataTables queries for your Node.js application:

```javascript

const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const mongooseDataTableQuery = require('mongoose-datatables-serverside');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Users DataTable
app.post('/api/users', async (req, res) => {
    try {
        // Define query options
        const queryOptions = req.body;
        const moreQueryOptions = {
            createdAt: {
                $gte: moment().subtract(30, 'days').startOf('day').toDate(), // Last 30 days
            }
        }

        // Execute the query for DataTables
        const data = await mongooseDataTableQuery(User, queryOptions, moreQueryOptions);

        // Respond with the query result as JSON
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
```

## Getting Started

1. Install the package via npm as described in the [Installation](#installation) section.

2. Create an Express.js application and connect to your MongoDB database.

3. Define a route for handling DataTables queries. In the example, this is done for the `/api/users` endpoint.

4. In the route handler, define query options based on the DataTables request parameters and execute the query using `mongooseDataTableQuery`.

5. Respond with the query result as JSON to be consumed by the DataTables frontend.

## Issues

If you encounter any issues or have questions about this package, please [open an issue](https://github.com/AnasQiblawi/mongoose-datatables-serverside/issues) on GitHub.

## Acknowledgments

- This package was inspired by the need for simplified server-side DataTables integration with MongoDB using Mongoose.

## Author

- [Anas Qiblawi](https://github.com/AnasQiblawi)
