var express = require('express');
var app = express();
var router = express.Router();
var multer = require('multer');
var path = require('path');
var config = require('../config/config.js');
var connection = require('../config/connection.js');
var jwt = require('jsonwebtoken');
var Client = require('node-rest-client').Client;
var client = new Client();

/***********************************************************************************************************************/
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        console.log("working1");
        callback(null, './uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage: storage }).single('userPhoto');
/***********************************************************************************************************************/
router.get('/', function(req, res){
  // var callbackUrl = 'http://localhost:3000/dashboard'
  // var parameters = 'response_type=code&client_id='+config.client_id+'&connection='+config.auth0_connection+'&redirect_uri='+callbackUrl
  // return res.redirect(config.auth0_url + 'authorize?' + parameters)
  return res.render('pages/index', {layout: false})
});

router.get('/logout',function(req, res){
  var callbackUrl = 'http://localhost:3000'
  var parameters = 'client_id='+config.client_id+'&returnTo='+callbackUrl
  return res.redirect(config.auth0_url + 'v2/logout?' + parameters)
});

/***********************************************************************************************************************/
router.get('/addItem', function (req, res) {
    res.render('pages/addItem');
});

/***********************************************************************************************************************/
router.get('/category', function (req, res) {
    var sql = "SELECT * FROM category"
    connection.query(sql, function (err, result) {
        if (result) {
            res.render('pages/category', { data: result });
        }
    });
});
/***********************************************************************************************************************/
router.get('/getCategory/:id', function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM category WHERE CategoryID =" + id;
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                data: result,
                state: 200

            });
        }
    });
});
/***********************************************************************************************************************/
router.get('/dashboard', function (req, res) {
  console.log('---------------- loggedin jwt user ------------')
  console.log(req.cookies.jwtToken)
  res.render('pages/dashboard');
});
/***********************************************************************************************************************/
router.get('/account', function (req, res) {
    res.render('pages/account');
});

/***********************************************************************************************************************/
router.get('/cashReport', function (req, res) {
    res.render('pages/cashReport');
});
/***********************************************************************************************************************/
router.get('/items', function (req, res) {
    var sql = "SELECT * FROM items";
    connection.query(sql, function (err, data) {
        if (err) {
            console.log("Error ");
        }
        if (data == null) {
            console.log("No data found");
        }
        if (data) {
            res.render('pages/items', { data: data });
        }
    });

});

/***********************************************************************************************************************/
router.get('/users', function (req, res) {
  var token = require('../helper').token;
  if(!token) return res.send('No token exists in server')

  var args = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token.access_token
    }
  }
  var url = config.audience + 'users'
  client.get(url, args, function (data, response) {
    // parsed response body as js object
    console.log('------------------------- response body -------------------')
    console.log(data);
    var users = []
    if(data && data.length) {
       users = data.map(user => ({
         userid: user.user_id,
         First_Name: user.given_name,
         Last_Name: user.family_name,
         Pin: (user.user_metadata && user.user_metadata.user_pin) || ''
      }))
    } else if (data && data.error) {
      return res.render('pages/error', { layout: false, error: data.error_description });
    }
    return res.render('pages/users', { data: users });
  });
});
/***********************************************************************************************************************/
router.get('/itemDelete/:id', function (req, res) {
    var id = req.params.id;
    console.log("id", id);
    var sql = "DELETE FROM items WHERE itemid =" + id;
    connection.query(sql, function (err, result) {
        if (result) {
            res.redirect('/items');
        }
    });
});
/***********************************************************************************************************************/
router.get('/userEdit/:id', function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM users WHERE userid =" + id;
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                data: result,
                state: 200
            });
        }
    });
});
/***********************************************************************************************************************/
router.get('/userDelete/:id', function (req, res) {
    var id = req.params.id;
    var sql = "DELETE FROM users WHERE userid=" + id;
    connection.query(sql, function (err, result) {
        if (result) {
            res.redirect('/users');
        }
    });
});
/***********************************************************************************************************************/
// Transaction
router.post('/transaction', function (req, res) {
    var itemid = req.body.itemid;
    var userid = req.body.userid;
    var paymentby = req.body.paymentby;
    var revenue = req.body.revenue;
    var date = req.body.date;
    var status = req.body.status;
    var sql = "INSERT INTO transactions(itemid,userid,paymentby,revenue,date,status) VALUES("
        + "'" + itemid + "'" + "," + "'" + userid + "'" + "," + "'" + paymentby + "'" + "," + "'" + revenue + "'" + "," + "'" + date + "'" + ","
        + "'" + status + "'" + ")";
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                message: "Data saved",
                status: 200
            });
        } else {
            res.status(403).json({
                success: false,
                message: "Data not saved.",
                status: 403
            });
        }
    });

});


/***********************************************************************************************************************/
router.post('/updateCategory',  function(req,res){
    var id = req.body.user_id;
    console.log(id);
    var categoryname = req.body.categoryname;
    console.log(categoryname);
    var categorycolor = req.body.categorycolor;
    console.log(categorycolor);
    var categoryicon = req.body.categoryicon;
    console.log(categoryicon);
    var sql = "UPDATE category SET CategoryName =" + "'" + categoryname+ "'" + "," + "CategoryColor=" + "'" + categorycolor + "'" + "," + "CategoryIcon=" + "'" + categoryicon + "'" + "WHERE CategoryID="  +"'"+ id + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.redirect('/category');
        }
    });
});
/***********************************************************************************************************************/
router.post('/AddCategory',  function(req,res) {
    var category_name = req.body.category_name;
    var category_color = req.body.category_color;
    var category_icon = req.body.category_icon;
    var sql = "INSERT INTO category(CategoryName,CategoryColor,CategoryIcon) VALUES("+"'"+category_name+"'"+","+"'"+category_color
    +"'"+","+"'"+category_icon+"'"+")";
    connection.query(sql,function(err, result){
        if(result){
             res.redirect('/category');
        }
    });
});

/***********************************************************************************************************************/
router.post('/login',function(req,res){
    var email = req.body.email;
    var password = req.body.password;

    var args = {
      data: {
        "grant_type": "password",
        "username": email,
        "password": password,
        "audience": config.audience,
        "scope": "openid email",
        "client_id": config.client_id,
        "client_secret": config.client_secret
      },
      headers: {
        "Content-Type": "application/json"
      }
    }
    client.post(config.auth0_url + "oauth/token", args, function (data, response) {
      // parsed response body as js object
      console.log('------------------------- login response body -------------------')
      console.log(data)

      if(data && data.access_token) {
        args = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer '+ data.access_token
          }
        }
        client.post(config.auth0_url + "userinfo", args, function (profile, response) {
          // parsed response body as js object
          console.log('------------------------- profile response body -------------------')
          console.log(profile);
          if(profile && !profile.error) {
            profile.access_token = data.access_token
            profile.id_token = data.id_token
            var token = jwt.sign(profile, config.secret, {
                expiresIn: 5000
            });
            res.cookie('jwtToken', token, { maxAge: 900000, httpOnly: true });
            res.redirect('dashboard?token=' + token);
          } else {
            res.render('pages/error', { layout: false, error: profile.error });
          }
        });

      } else {
        res.render('pages/error', { layout: false, error: data.error_description });
      }
    });
});
/***********************************************************************************************************************/
router.post('/forgotPassword',function(req,res) {
    var email = req.body.useremail;
    console.log('inside forgot password',email);
    var sql = "SELECT * FROM users WHERE email="+"'"+email+"'";
    connection.query(sql,(err,result) =>{
      if(result){
          res.redirect('/');
      }else{
          res.redirect('/forgotpasword',{error:"Please enter correct email"});
      }
    });

});
/***********************************************************************************************************************/
router.post('/updatePassword', (req,res)=>{
    var newpassword = req.body.password;
    var email = req.body.email;
    var sql = "UPDATE users WHERE email="+"'"+email+"'"+"SET password="+"'"+newpassword+"'";
    connection.query(sql, (err,result) =>{
        if(result){
            alert("Password updated successfully");
            res.redirect('/login');
        }
    });
});

/***********************************************************************************************************************/
router.post('/UserDataInserted', function(req,res){
  var userId= req.body.userId;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var token = require('../helper').token;

    if(!token) {
      return res.send('No token exists in server')
    }

    var args = {
      data: {
        "user_id": userId,
        "connection": config.auth0_connection,
        "name": firstName+ " " + lastName,
        "given_name": firstName,
        "family_name": lastName,
        "email": req.body.email,
        "password": req.body.password,
        "user_metadata": {
          "pin": req.body.pin,
          "isAdmin": req.body.isAdmin
        },
        "email_verified": false,
        "verify_email": false,
        "app_metadata": {}
      },
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token.access_token
      }
    }
    var url = config.audience + 'users'
    client.post(url, args, function (data, response) {
      // parsed response body as js object
      console.log('------------------------- response body -------------------')
      console.log(data);
      if(data && !data.error) {
        return res.redirect('/users');
      } else {
        return res.render('pages/error', { layout: false, error: data.error_description })
      }
    });
});
/***********************************************************************************************************************/
router.post('/userUpdate', function(req,res) {
  var user_id= req.body.userid;
  var first_name = req.body.firstname;
  var last_name = req.body.lastname;
  var user_pin = req.body.userpin;

    var sql = "UPDATE users SET First_Name ="+"'"+first_name+"'"+","+"Last_Name="+"'"+last_name+"'"+","+"Pin="+"'"+user_pin+"'" +"WHERE userid="+"'"+user_id+"'";
    connection.query(sql, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.redirect('/users');
        }
    });
});

/***********************************************************************************************************************/
router.post('/addItem',upload,function(req,res, next){
    var item_name = req.body.item_name;
    var category = req.body.category;
    var description = req.body.description;
    var price = req.body.price;
    var stock = req.body.stock;
    var barcode = req.body.barcode;
    var modifier = req.body.modifier;
     var image = req.file.path;
    console.log("image name", image);
   var sql = "INSERT INTO items(item_name,category,description, price,stock,image, barcode,modifier) VALUES("+"'"+item_name
    +"'"+","+"'"+category+"'"+","+"'"+description+"'"+","+"'"+price+"'"+","+"'"+stock+"'"+","+"'"+image+"'"+","+"'"+barcode+"'"+","+"'"+modifier+"'"+")";
    connection.query(sql, function(err,result){
        if(result){
            res.redirect('/items');
        }
    });
});
router.post('/upload',upload, function(req,res){
    res.send("uploaded");

});

/***********************************************************************************************************************/
router.post('/accountInformation',function(req,res){
    var email = req.body.email;
    console.log("email=>",email);
    var company_name = req.body.company_name;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var phone_no = req.body.phone_no;
    var tax_rate =  req.body.tax_rate;
    var company_address = req.body.company_address;
    var company_address2 = req.body.company_address2;
    var state = req.body.state;
    var companyzip = req.body.companyzip;
    var image = req.filename;
    console.log("image", image);
    var sql = "INSERT INTO accountinformation(email,company_name,first_name,last_name,phone_no,tax_rate,company_address, company_address2,state, company_zip) VALUES("
    +"'"+email+"'"+","+"'"+company_name+"'"+","+"'"+first_name+"'"+","+"'"+last_name+"'"+","+"'"+phone_no+"'"+","+"'"+tax_rate+"'"+","+"'"+company_address
    +"'"+","+"'"+company_address2+"'"+","+"'"+state+"'"+","+"'"+companyzip + "'"+")";
    connection.query(sql, function(err,result){
        if(result){
            res.render('Account',{data:result});
        }
    });
});
/***********************************************************************************************************************/
module.exports = router;

/***********************************************************************************************************************/
