const express = require("express");
const path = require("path")
const app = express()
const { exec } = require('child_process');
const fs = require("fs")

app.use(express.static(path.join(__dirname, "client")))


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);


        next();
  });


app.listen(80, () => console.log('Running Mattcoin'))

app.get('/', (req, res) => {  
	res.redirect("/home")
});

app.get('/home', (req, res) => {
	res.redirect(path.join(__dirname, "client/home/index.html"))
});


