//서버클라이언트 통신 예제 코드

const express = require('express')
const app = express()

var request = require('request'); //request 모듈 불러오기

//ejs를 사용하기위한 명시적 선언
app.set('views', __dirname + '/views'); // __dirname -> 디렉토리 루트 
app.set('view engine', 'ejs'); //뷰엔진을 ejs로 한다 

app.use(express.static(__dirname + '/public')); //퍼블릭 폴더에있는 정적파일들을 공개한다.명시적 선언해줘야아한다.
//웹에서 사거나 공짜로 다운받은 css,디자인파일 모든 것 -> 정적파일 이것들을 사용하기위해서 


//클라이언트에서 보낸 Post 형식 데이터를 받기 위한 방법  
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '20143231',
    database: 'fintech', //스키마
    port: 3306
});

connection.connect();




app.get('/', function(req, res) {
    res.render('ejsPage');
})


app.post('/getData', function(req, res) {
    var data = req.body.inputData;
    var resultData;
    console.log(data);
    console.log(req.body);
    connection.query('SELECT * FROM fintech.user WHERE name = ?', [data], function(error, results, fields) {
        if (error) throw error;
        else {
            resultData = results
            console.log(results)
            res.json(resultData);

        }
    });


    //res.json(results[0].name); // 만약 여기에 json응답을 한다면 nodejs는 비동기방식으로 됬기떄문에 디비에 거쳐가지 않고 바로 코드가 실행됨으로 값이 없다 조온나 중요

    // console.log(req.body);
    // res.json(1);
    // console.log(data);
    // res.json("안녕하세요"); //ajax에 응답하는것 
});






console.log("서버가동");
app.listen(3000)