var express = require('express');
var app = express();
var router = express.Router();
var multer = require('multer');
var path = require('path');
var config = require('../config/config.js');
var connection = require('../config/connection.js');
var jwt = require('jsonwebtoken');
/***********************************************************************************************************************/
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '../uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage: storage }).array('userPhoto', 2);
/***********************************************************************************************************************/
router.get('/', function (req, res) {
    res.render('index', { layout: false });
});
/***********************************************************************************************************************/
router.get('/addItem', function (req, res) {
    res.render('AddItem');
});

/***********************************************************************************************************************/
router.post('/signup', function(req,res){
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password;
    var pin = req.body.userpin;
    var sql = "INSERT INTO users(First_Name,Last_Name,email,password,Pin) VALUES("
        + "'" + first_name + "'" + "," + "'" + last_name + "'" + "," + "'" + email + "'" + "," + "'" + password + "'" + "," + "'" + pin+ "'" +
         ")";
    connection.query(sql,function(err,result){
        if(!err){
            res.status(200).json({
                success:true,
                message:"Succcessfully signup.",
                data:result
            });
        }else{
            res.status(500).json({
                success: false,
                message: " Internal error.",
                data: err
            });

        }
    });
});
/***********************************************************************************************************************/
router.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
        if (error) {
            res.json({
                status: false,
                message: 'there are some error with query'
            })
        } else {
            if (results.length > 0) {
                if (password == results[0].password) {
                    var payload = { result: results[0] };
                    var token = jwt.sign(payload, config.secret, {
                        expiresIn: 5000
                    });
                    res.status(200).json({
                        success: true,
                        message: 'Login successfully',
                        data: results,
                        status: 200
                    });
                } else {
                    res.status(403).json({
                        success: false,
                        message: 'Incorrect password.',
                        status: 403
                    });
                }

            }
            else {
                res.status(403).json({
                    success: false,
                    message: 'Incorrect email.',
                    status: 403
                });
            }
        }
    });
});


/***********************************************************************************************************************/
router.get('/category', function (req, res) {
    var sql = "SELECT * FROM category"
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                message: 'List of category.',
                status: 200,
                data:result
            });
        }else{
            res.status(403).json({
                success: false,
                message: 'No data found',
                status: 403
            });

        }
    });
});
/***********************************************************************************************************************/
router.get('/getItemByCategory/:id', function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM items WHERE category =" + id;
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Data.',
                data: result,
                state: 200

            });
        } else {
            res.status(403).json({
                success: false,
                message: 'No data found',
                status: 403
            });
        }
    });
});

/***********************************************************************************************************************/
router.get('/getItem/:id', function (req, res) {
    var id = req.params.id;
    var sql = "SELECT * FROM items WHERE itemid =" + id;
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Data.',
                data: result,
                state: 200

            });
        } else {
            res.status(403).json({
                success: false,
                message: 'No data found',
                status: 403
            });
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
                message:'Data.',
                data: result,
                state: 200

            });
        }else{
            res.status(403).json({
                success: false,
                message: 'No data found',
                status: 403
            });
        }
    });
});
/***********************************************************************************************************************/
router.get('/dashboard', function (req, res) {
    res.render('Dashboard');
});
/***********************************************************************************************************************/
router.get('/account', function (req, res) {
    res.render('Account');
});

/***********************************************************************************************************************/
router.get('/cashReport', function (req, res) {
    res.render('CashReport');
});
/***********************************************************************************************************************/
router.get('/items', function (req, res) {
    var sql = "SELECT * FROM items";
    connection.query(sql, function (err, data) {
        if (err) {
            res.status(403).json({
                 success:false,
                 message:err,
                 status:403
            });
        }
        if (data == null) {
            res.status(403).json({
                success: false,
                message: 'No data found',
                status: 403
            });
        }
        if (data) {
            res.status(200).json({
                success: true,
                message: 'List of items',
                data:data,
                status: 200
            });
        }
    });

});

/***********************************************************************************************************************/
router.get('/users', function (req, res) {
    var sql = "SELECT * FROM users";
    connection.query(sql, function (err, data) {
        if (err) {
            res.status(403).json({
                success: false,
                message: err,
                status: 403
            });
        }
        if (data == null) {
            res.status(403).json({
                success: false,
                message: 'No data found',
                status: 403
            });
        }
        if (data) {
            res.status(200).json({
                success: true,
                message: 'List of users',
                data:data,
                status: 200
            });
        }
    });
});
/***********************************************************************************************************************/
router.get('/itemDelete/:id', function (req, res) {
    var id = req.params.id;
    console.log("id", id);
    var sql = "DELETE FROM items WHERE itemid =" + id;
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Item deleted.',
                data:result,
                status: 200
            });
        }else{
            res.status(403).json({
                success: false,
                message: 'No data deleted.',
                status: 403
            });
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
                message:'User data .',
                data: result,
                state: 200

            });
        }else{
            res.status(403).json({
                success: false,
                message: 'No data found.',
                status: 403
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
            res.status(200).json({
                success: true,
                message: 'Data deleted',
                status: 200
            });
        }else{
            res.status(403).json({
                success: false,
                message: 'Data not deleted.',
                status: 403
            });
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
                status: 200,
                data:result
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
//cardlist

router.post('/userCardAdd', function(req,res){
    var userid = req.body.userid;
    var cardname = req.body.cardname;
    var cbcno = req.body.cbcno;
    var createdAt = req.body.createdAt;
    var updatedAt = req.body.updatedAt;
   var add = new Promise(function(resolve,reject){
       var sql = "INSERT INTO usercard(userid,cardname,cbcno,createdAt,updatedAt) VALUES("
           + "'" +userid + "'" + "," + "'" + cardname + "'" + "," + "'" + cbcno + "'" + "," + "'" + createdAt + "'" + ","
           + "'" + updatedAt + "'" + ")";
           connection.query(sql,function(err,data){
               if(err){
                   reject(err);
               }else{
                   resolve(data);
               }
           });
   });
  add.then(function(data){   //call of promieses.
      res.status(200).json({
          success:true,
          message:'Saved successfully',
          data:data,
      });
  }).catch(function(exception){
      res.status(500).json({
          success:false,
          message:'Internal error',
          data:exception
      });
  })

});
/***********************************************************************************************************************/
//get item by transaction
router.get('/getItemByTransaction/:id', function(req,res){
    var transactionid = req.params.id;
    var itemid = req.body.itemid;
    var getItem = new Promise(function(resolve,reject){
        var sql = "SELECT * FROM WHERE transactionid="+id;
        connection.query(sql,function(err,data){
           if(err){
               reject(err);
           } else{
               resolve(data);
           }
        });
    });
    getItem.then(function(data){
        res.status(200).json({
            success:true,
            message:"List of items",
            data:data
        });
    }).catch(function(exception){
        res.status(500).json({
            success:false,
            message:"Internal error occurred",
            data:exception
        });
    })
});

/***********************************************************************************************************************/
router.post('/updateCategory', function (req, res) {
    var id = req.body.user_id;
    var categoryname = req.body.categoryname;
    var categorycolor = req.body.categorycolor;
    var categoryicon = req.body.categoryicon;
    var sql = "UPDATE category SET CategoryName =" + "'" + categoryname + "'" + "," + "CategoryColor=" + "'" + categorycolor + "'" + "," + "CategoryIcon=" + "'" + categoryicon + "'" + "WHERE CategoryID=" + "'" + id + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            res.status(403).json({
                success: false,
                message: err,
                status: 403
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Data updated successfully.',
                data:result,
                status: 200
            });
        }
    });
});
/***********************************************************************************************************************/
router.post('/AddCategory', function (req, res) {
    var category_name = req.body.category_name;
    var category_color = req.body.category_color;
    var category_icon = req.body.category_icon;
    var sql = "INSERT INTO category(CategoryName,CategoryColor,CategoryIcon) VALUES(" + "'" + category_name + "'" + "," + "'" + category_color
        + "'" + "," + "'" + category_icon + "'" + ")";
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Data added successfully.',
                data:result,
                status: 200
            });
        }else{
            res.status(403).json({
                success: false,
                message: err,
                status: 403
            });
        }
    });
});


/***********************************************************************************************************************/
router.post('/forgotPassword', function (req, res) {
    var email = req.body.useremail;
    console.log('inside forgot password', email);
    var sql = "SELECT * FROM users WHERE email=" + "'" + email + "'";
    connection.query(sql, (err, result) => {
        if (result) {
            res.status(200).json({
                success: false,
                message: 'Email confirmed.',
                data:result,
                status: 200
            });
        } else {
            res.status(403).json({
                success: false,
                message: 'Please enter correct email.',
                status: 403
            });
        }
    });

});
/***********************************************************************************************************************/
router.post('/updatePassword', (req, res) => {
    var newpassword = req.body.password;
    var email = req.body.email;
    var sql = "UPDATE users WHERE email=" + "'" + email + "'" + "SET password=" + "'" + newpassword + "'";
    connection.query(sql, (err, result) => {
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Password updated successfully.',
                data:result,
                status: 200
            });
        }else{
            res.status(403).json({
                success: false,
                message: 'Password not updated.',
                status: 403
            });
        }
    });
});

/***********************************************************************************************************************/
router.post('/UserDataInserted', function (req, res) {
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var user_pin = req.body.user_pin;
    var sql = "INSERT INTO users(First_Name, Last_Name, Pin) VALUES(" + "'" + first_name + "'" +
        "," + "'" + last_name + "'" + "," + "'" + user_pin + "'" + " )";
    connection.query(sql, function (err, result) {
        if (err) {
            res.status(403).json({
                success: false,
                message: 'No data inserted',
                data:err,
                status: 403
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'Data inserted successfully.',
                data:result,
                status: 200
            });
        }
    });
});
/***********************************************************************************************************************/
router.post('/userUpdate', function (req, res) {
    var user_id = req.body.userid;
    var first_name = req.body.firstname;
    var last_name = req.body.lastname;
    var user_pin = req.body.userpin;
    var sql = "UPDATE users SET First_Name =" + "'" + first_name + "'" + "," + "Last_Name=" + "'" + last_name + "'" + "," + "Pin=" + "'" + user_pin + "'" + "WHERE userid=" + "'" + user_id + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            res.status(403).json({
                success: false,
                message: 'No data updated.',
                data:result,
                status: 403
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Data updated successfully.',
                data:result,
                status: 200
            });
        }
    });
});

/***********************************************************************************************************************/
router.post('/addItem', function (req, res, next) {
    var item_name = req.body.item_name;
    var category = req.body.category;
    var description = req.body.description;
    var price = req.body.price;
    var stock = req.body.stock;
    var barcode = req.body.barcode;
    var modifier = req.body.modifier;
    var image = '';
    console.log("image name".image);
    var sql = "INSERT INTO items(item_name,category,description, price,stock,image, barcode,modifier) VALUES(" + "'" + item_name
        + "'" + "," + "'" + category + "'" + "," + "'" + description + "'" + "," + "'" + price + "'" + "," + "'" + stock + "'" + "," + "'" + image + "'" + "," + "'" + barcode + "'" + "," + "'" + modifier + "'" + ")";
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Data inserted successfully.',
                data:result,
                status: 200
            });
        }else{
            res.status(403).json({
                success: false,
                message: 'No data inserted.',
                status: 403
            });
        }
    });
});

/***********************************************************************************************************************/
router.post('/accountInformation', function (req, res) {
    var email = req.body.email;
    var company_name = req.body.company_name;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var phone_no = req.body.phone_no;
    var tax_rate = req.body.tax_rate;
    var company_address = req.body.company_address;
    var company_address2 = req.body.company_address2;
    var state = req.body.state;
    var companyzip = req.body.companyzip;
    var image = req.filename;
    console.log("image", image);
    var sql = "INSERT INTO accountinformation(email,company_name,first_name,last_name,phone_no,tax_rate,company_address, company_address2,state, company_zip) VALUES("
        + "'" + email + "'" + "," + "'" + company_name + "'" + "," + "'" + first_name + "'" + "," + "'" + last_name + "'" + "," + "'" + phone_no + "'" + "," + "'" + tax_rate + "'" + "," + "'" + company_address
        + "'" + "," + "'" + company_address2 + "'" + "," + "'" + state + "'" + "," + "'" + companyzip + "'" + ")";
    connection.query(sql, function (err, result) {
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Data inserted.',
                data:result,
                status: 200
            });
        }else{
            res.status(403).json({
                success: false,
                message: 'No data inserted.',
                status: 403
            });
        }
    });
});
/***********************************************************************************************************************/
module.exports = router;

/***********************************************************************************************************************/
