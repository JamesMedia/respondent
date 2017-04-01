/**
 * Created by James Donnelly on 31/03/2017.
 */
var express = require('express'),
    stylus = require('stylus'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path) {
    return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(stylus.middleware(
    {
        src: __dirname + '/public',
        compile: compile
    }
));
app.use(express.static(__dirname + '/public'));

if(env === 'development'){
    mongoose.connect('mongodb://localhost/multivision');
    // mongoose.connect('mongodb://candidate:ilovemongodb@ds131900.mlab.com:31900/respondentio-test');
}else{
    mongoose.connect('mongodb://root:TrawlerM12%25@getactive-shard-00-00-toruy.mongodb.net:27017,getactive-shard-00-01-toruy.mongodb.net:27017,getactive-shard-00-02-toruy.mongodb.net:27017/multivision?ssl=true&replicaSet=GetActive-shard-0&authSource=admin');
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
    console.log('multivision db opened');
});
var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;
Message.findOne().exec(function(err, messageDoc) {
    mongoMessage = messageDoc.message;
});

app.get('/partials/:partialPath', function(req, res) {
    res.render('partials/' + req.params.partialPath);
});

// note that another method is to sync your client side and server side routes
app.get('*', function(req, res) {
    res.render('index', {
        mongoMessage: mongoMessage
    });
});

var port = process.env.PORT || 3030;
// var port = 3030;
app.listen(port);
console.log('Listening on port ' + port + '...');