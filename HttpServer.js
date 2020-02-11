const express = require('express')
const app = express()
var request = require('request')
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
//var auth = require('./lib/auth');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '20143231',
    database: 'fintech',
    port: "3306"
});

var tokenKey = "fintech202020!#abcd"
connection.connect(); //DB연동


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public')); //정적파일 사용 
app.use(express.json()); //post방식에서 json 파싱
app.use(express.urlencoded({ extended: false })); //post방식


app.get('/signup', function(req, res) { //회원가입 페이지
    res.render('signup');
})



app.listen(3000)