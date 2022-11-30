var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var url = require('url');
var session = require('express-session');
//const bcrypt = require('bcrypt');

var app = express();

var { latest, topRated, search, watchList, details, signIn, signUp } = require('./routes/index');

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.get('/', latest);
app.get('/topRated', topRated);
app.get('/search', search);
app.get('/watchList', watchList);
app.get('/details', details);
app.get('/signin', signIn);
app.get('/signup', signUp);

//database connection

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sk123',
    database: 'shopsee'
});


global.db = db;

db.connect(function(err) {
    if (err)
        throw err;
    else
        console.log("Connected to database succefully");
});

handleDisconnect(db);

function handleDisconnect(connection) {
    connection.on('error', function(err) {
        if (!err.fatal) {
            return;
        }
        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
        }
        console.log('\nRe-connecting lost connection: ' + err.stack);
        connection = mysql.createConnection(connection.config);
        handleDisconnect(connection);
        connection.connect();
    });
}

handleDisconnect(db);

global.UN = "";
global.err = "";

app.post("/signup", function(req, res) {
    let userName = req.body.username;
    let password = req.body.password;
    global.UN = userName
    db.query("insert into users values (?,?);", [userName, password], function(error, results, fields) {
        if (error) {
            console.log(error);
            res.redirect('/signup');
        }
    });
    res.redirect("/signin");
});

handleDisconnect(db);

app.post("/signin", function(req, res) {
    let userName2 = req.body.username2;
    let passWord2 = req.body.password2;
    console.log("signin:" + UN);
    if (userName2 && passWord2) {
        db.query("select * from users where username=? and password=?", [userName2, passWord2], function(err, result) {
            if (err) {
                res.redirect('/signin');
            };
            if (result.length > 0) {
                req.session.username = userName2;
                req.session.loggedin = true;
                global.UN = userName2;
                console.log("Logged In!" + req.session.loggedin);
                res.redirect('/watchList');
                global.err = ""
            } else {
                console.log("Wrong password!");
                global.err = "Wrong Credentials!"
                res.redirect('/signin')
            }
        });
    }
});

handleDisconnect(db);

app.post("/", function(req, res) {
    console.log("/:" + UN)
    if (UN.length < 1) {
        console.log("s");
        res.redirect('/signin')
    }
});

handleDisconnect(db);

app.post("/search", function(req, res) {
    let movieId = req.body.q

    let addQuery = "INSERT INTO `" + UN + "` (`movie_id`) VALUES ('" + movieId + "')";
    db.query(addQuery, function(err, result) {
        if (err) {
            console.log("3 could not insert!")
            res.redirect('/');
        }

    });
});

handleDisconnect(db);

const PORT = process.env.PORT || 5050;
app.listen(PORT)