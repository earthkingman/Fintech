const express = require('express')
const app = express()

var request = require('request'); //request 모듈 불러오기
var jwt = require('jsonwebtoken'); //JWT

var auth = require('./lib/auth');
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

var tokenKey = "fintech202020!#abcd" //토큰키 생성
connection.connect();




app.get('/', function(req, res) {
    res.render('ejsPage');
})

app.get('/test', function(req, res) {
    res.render('ejsPage');
})

app.get('/signup', function(req, res) {

    res.render('signup');

})

app.get('/main', function(req, res) {

    res.render('main');

})


app.get('/balance', function(req, res) {

    res.render('balance');

})



app.get('/qrcode',function(req,res){ //큐알생성기

    res.render('qrcode');
})


app.get('/authTest',auth, function(req, res){
    res.json('welcome')
  })



app.get('/login', function(req, res) {
    res.render('login');
})


app.get('/qr', function(req, res) { //큐알리더기
    res.render('qrReader');
})







//출금하는거
app.post('/withdraw', auth, function(req, res){ //미들웨어로 auth를 쓰는이유는 우리가 jwt로 암호화해서 보냇으니깐 거기안에 사용자 정보가있다 그걸선생님이 만든 decoded함수로 읽는다
    var countnum = Math.floor(Math.random() * 1000000000) + 1;
    var transId = "T991608600U" + countnum;
  
    var user = req.decoded; //유저아이디를 가져올거라서 디코드함
  
    var finUseNum = req.body.fin_use_num;
    var money=req.body.amount; 
    var sql = "SELECT * FROM user WHERE id = ?"
    connection.query(sql,[user.userId], function(err, result){
      console.log(result);
      var option = {
        method : "POST",
        url : "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
        headers : {
          'Authorization' : 'Bearer ' + result[0].accesstoken
        },
        json :{
            "bank_tran_id": transId,
            "cntr_account_type": "N",
            "cntr_account_num": "7839877259",
            "dps_print_content": "쇼핑몰환불",
            "fintech_use_num": finUseNum,
            "wd_print_content": "오픈뱅킹출금",
            "tran_amt": money, //이거 내가 테스트데이터 1000원만 넣어났음  참가기관 에러 [API업무처리시스템 - 시뮬레이터 응답전문 존재하지 않음] 이오류는 제대로된건데 테스트데이터가없는거
            "tran_dtime": "20200424131111",
            "req_client_name": "홍길동", 
            "req_client_fintech_use_num": finUseNum,
            "req_client_num": "HONGGILDONG1234",
            "transfer_purpose": "TR",
            "recv_client_name": "박지율", 
            "recv_client_bank_code": "097", 
            "recv_client_account_num": "7839877259"
            }
      }
      request(option, function (error, response, body) {
        console.log(body)
        
        if(body.rsp_code=="A0000"){
            res.json(1);
        }
        else{
            res.json(2);
        }
      });
  
      })
    });





app.post('/transactionlist', auth, function(req, res){
    var countnum = Math.floor(Math.random() * 1000000000) + 1;
    var transId = "T991608600U" + countnum;
  
    var user = req.decoded;
  
    var finUseNum = req.body.fin_use_num;
    
    var sql = "SELECT * FROM user WHERE id = ?"
    connection.query(sql,[user.userId], function(err, result){
      console.log(result);
      var option = {
        method : "GET",
        url : "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
        headers : {
          'Authorization' : 'Bearer ' + result[0].accesstoken
        },
        qs : {
          bank_tran_id : transId,
          fintech_use_num : finUseNum,
          inquiry_type : "A",
          inquiry_base : 'D',
          from_date : '20190101',
          to_date : '20190101',
          sort_order : 'D',
          tran_dtime : '20200424165200'
        }
      }
      request(option, function (error, response, body) {
        console.log(body)
        var parseData = JSON.parse(body);
        res.json(parseData);
      });
  
      })
    });



app.post('/balance',auth,function(req,res){


    var user = req.decoded;  //이거도 조온나 중요하다 
    var finusenum = req.body.fin_use_num;  //핀유즈넘버 가져오기 post방식인거 까먹지말자
    console.log(finusenum);
    var countnum = Math.floor(Math.random() * 1000000000) + 1;
    var transId = "T991608600U" + countnum;
    var sql = "SELECT * FROM user WHERE id = ?"
    connection.query(sql, [user.userId], function(err, results, fields) {
        if (err) {
            console.error(err);
            throw err;
        } else {
            console.log(results);
            var option = {
                method: "GET",
                url: "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
                headers: {
                    'Authorization': "Bearer " + results[0].accesstoken
                },
                qs: {
                    bank_tran_id: transId,
                    fintech_use_num:finusenum,
                    tran_dtime:"20190910101921"
                }
            }
            request(option, function(error, response, body) {
                var parseData = JSON.parse(body);
                res.json(parseData);
            });
        }
    });

})


// app.post('/list', auth, function(req, res) {
// var user = req.decoded; 
// 질문1. 서버 코드중에 이부분을보면  jwt.sign을 통해 우리토큰으로 유저정보를 담았던 그정보를 다시 auth라는 미들웨어를 거쳐서 가져오는것이라고 이해해도될까요?? 
// 질문2. 클라이언트에서 사용자가 접속함으로써 세션에 우리토큰을 저장하고 그정보를 다시 ajax를 통해 서버로 보내주는거 같은데  왜 decoded라고 적는건가요? 

//질문1번은 맞고  질문2번은 썜이 auth에 decoded라고 정의해놧음


app.post('/list', auth, function(req, res) {
    
    var user = req.decoded; //auth 에 개인사용자 정보가 담겨있다. 콘솔 한번찎어바라 
    console.log(user);
    var sql = "SELECT * FROM user WHERE id = ?"
    connection.query(sql, [user.userId], function(err, results, fields) {
        if (err) {
            console.error(err);
            throw err;
        } else {
            console.log(results);
            var option = {
                method: "GET",
                url: "https://testapi.openbanking.or.kr/v2.0/user/me",
                headers: {
                    'Authorization': "Bearer " + results[0].accesstoken
                },
                qs: {
                    user_seq_no: results[0].userseqno
                }
            }
            request(option, function(error, response, body) {
                var parseData = JSON.parse(body);
                res.json(parseData);
            });
        }
    });
})



app.get('/authResult', function(req, res) {

    var authCode = req.query.code; //Oauth 리턴값 code를 받음
    // console.log(authCode);

    var option = {
        method: "POST",
        url: "https://testapi.openbanking.or.kr/oauth/2.0/token",
        headers: {
            'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8"
        },
        form: {
            code: authCode, //이거는 우리 사이트에 가입하는 사람마다 다르니깐 변수로 받아야함 
            client_id: 'rNn6muQSXg43kHMhnWH1OryxQsUzUJqeh3Ir8Ed3', //이거 우리사이트를 가입하는 모든사람들은 다똑같다.
            client_secret: 'IaD57BMZwcRzRgOdcc2NExDfo15JG3v0JlG4WL3O',
            redirect_uri: 'http://localhost:3000/authResult',
            grant_type: 'authorization_code'
        }
    }
    request(option, function(error, response, body) { //request 함수 인자로 넣어서 위에 조건으로 요청을 한다~ 이말씀이다~
        // console.log(body);
        var parseData = JSON.parse(body);

        //https://victorydntmd.tistory.com/193 참고
        res.render('resultChild', { data: parseData }) //이부분이 렌더링 하는 부분 자식창으로 값을 보내는거다 


    });

})



app.post('/signup', function(req, res) {
    var userName = req.body.userName
    var userEmail = req.body.userEmail
    var userPassword = req.body.userPassword
    var userAccessToken = req.body.userAccessToken
    var userRefreshToken = req.body.userRefreshToken
    var userSeqNo = req.body.userSeqNo
    console.log(userName, userPassword, userAccessToken)
    var sql = "INSERT INTO user (email, password, name, accesstoken, refreshtoken, userseqno) VALUES (?,?,?,?,?,?)"
    connection.query(sql, [userEmail, userPassword, userName, userAccessToken, userRefreshToken, userSeqNo], function(err, results, fields) {
        if (err) {
            console.error(err);
            throw err;
        } else {
            console.log("실행한 쿼리 : " + this.sql);

            res.json(1);
        }
    });
})

app.post('/login', function(req, res) {
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    var sql = "SELECT * FROM user WHERE email = ?"
    connection.query(sql, [userEmail], function(err, results) {
        if (err) {
            console.error(err);
            throw err;
        } else {
            if (results.length == 0) {
                res.json("미등록 회원")
            } else { //DB결과값들을 JWT토큰으로 암호화
                if (userPassword == results[0].password) {
                    jwt.sign({
                           
                            userId: results[0].id,
                            userEmail: results[0].email
                        },
                        tokenKey, {
                            expiresIn: '10d', //유통기간
                            issuer: 'fintech.admin', //누가 만들었느지
                            subject: 'user.login.info'
                        },
                        function(err, token) {
                            console.log('로그인 성공', token)
                            res.json(token)
                        }
                    )
                } else {
                    res.json("비밀번호 불일치")
                }
            }
        }
    })
})


console.log("서버가동");
app.listen(3000)