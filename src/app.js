const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes setup
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Error handling
app.use((req, res, next) => {
    res.status(404).send('Sorry, page not found');
});

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});