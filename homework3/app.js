var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
const assert = require('assert');
var indexRouter = require('./routes/index');
var hash = require('pbkdf2-password')();
var compression = require('compression')
var app = express();
app.use(compression());

app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'secret'
}));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const NodeRSA = require('node-rsa')
const crypto = require('crypto');
const fs = require('fs')

// Generate new 512bit-length key
var key = new NodeRSA({b: 512})
key.setOptions({encryptionScheme: 'pkcs1'})

var privatePem = key.exportKey('pkcs1-private-pem')
var publicDer = key.exportKey('pkcs8-public-der')
var publicDerStr = publicDer.toString('base64')

// 保存返回到前端的公钥
// fs.writeFile('./public/public.pem', publicDerStr, (err) => {
//   console.log('公钥已保存！')
// })
// 保存私钥
// fs.writeFile('./pem/private.pem', privatePem, (err) => {
//   console.log('私钥已保存！')
// })

var descry = function(password){
    var privateKey = fs.readFileSync('./pem/private.pem', 'utf8')
    // console.log(privateKey);
    var password = password
    var buffer2 = Buffer.from(password, 'base64')
    var decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING // 注意这里的常量值要设置为RSA_PKCS1_PADDING
      },
      buffer2
    )
    // console.log(decrypted.toString('utf8'))
    return decrypted.toString('utf8')
};




var MongoClient = require('mongodb').MongoClient;
var db;

MongoClient.connect('mongodb://localhost:27017/express', { useUnifiedTopology: true }, function (err, client) {
    if (err) throw err

    db = client.db('express')

    db.collection('users').find().toArray(function (err, result) {
        if (err) throw err

        console.log(result)
    })
})

const insertDocument = function(db, user, callback) {
    console.log(user);
    // Get the documents collection
    const collection = db.collection('users');
    // Insert some documents
    collection.insertOne(user, function(err, result) {
      assert.equal(err, null);
      console.log("Inserted 1 document into the collection");
      callback(result);
    });
}

const findDocument = function(db, user, callback, res, req) {
    // Get the documents collection
    const collection = db.collection('users');
    // Find some documents
    collection.find(user).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      callback(docs, res, req);
    });
}



app.use(express.static(path.join(__dirname, 'public')));

// 返回登录页面
app.use('/login', express.static(path.join(__dirname, 'public/login.html')));
// 返回注册页面
app.use('/signup', express.static(path.join(__dirname, 'public/signup.html')));

// 返回主页
app.use('/', indexRouter);
var Users = []


app.post('/login', function(req, res, next){
    console.log(req.body.username);
    console.log(descry(req.body.password));
    var username = req.body.username;
    var password = descry(req.body.password);

    var callback = (docs, res, req) => {
        if(docs.length == 0){
            res.status(200).json({message:"用户名或密码错误", success: "false"});
        }
        else {
            var salt = docs[0].salt;
            var password = descry(req.body.password);
            hash({ password: password, salt: salt }, function (err, pass, salt, hash) {
                // console.log(pass);
                // console.log(hash);
                if (err) return fn(err);
                if (hash === docs[0].password) {
                    req.session.login = 1;
                    res.status(200).json({message:"登录成功", success: "true"});
                }
                else res.status(200).json({message:"用户名或密码错误", success: "false"});
            });
        }
    }

    findDocument(db, 
        {username: username},
        callback,
        res, req
    )
});



app.post('/signup', function(req, res, next){
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(descry(req.body.password));
    var password = descry(req.body.password);
    var username = req.body.username;

    var callback = (docs, res, req, callback) => {
        if(docs.length!=0)
            res.status(200).json({message:"用户名已存在", success: "false"});
        else{
            var password = descry(req.body.password);
            var username = req.body.username;
            hash({ password: password }, function (err, pass, salt, hash) {
                if (err) throw err;
                // store the salt & hash in the "db"
                insertDocument(db, 
                    {username: username,
                    password: hash,
                    salt: salt},
                    ()=>{});
            });
    
            res.status(200).json({message:"注册成功", success: "true"});
        }
    };

    findDocument(db, {username: username},
        callback,res,req);
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // redirect to the login page
    res.status(err.status || 500);
    res.redirect("/login");
});

module.exports = app;
