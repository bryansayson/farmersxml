var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer({
    dest: './uploads/'
});
var path = require('path');
var fs = require('fs');
var parseString = require('xml2js').parseString;
var unflatten = require('flat').unflatten
var flatten = require('flat')
var bodyParser = require('body-parser')
app.use('/', express.static(__dirname + '/'));
app.use(bodyParser());
//DB START

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/FarmersClaim');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    console.log("db connection open");
});

var claimSchema = mongoose.Schema({
    FarmersClaimType: {
        ClaimNumber: String,
        ClaimantFirstName: String,
        ClaimantLastName: String,
        Status: String,
        LossDate: String,
        LossInfo: String,
        AssignedAdjusterID: String,
        Vehicles: Object
    },
    CauseOfLossCode: String,
    StatusCode: String,
    LossInfoType: {
        CauseOfLoss: String,
        ReportedDate: String,
        LossDescription: String,
    },
    VehicleListType: {
        VehicleDetails: Object
    },
    VehicleInfoType: {
        ModelYear: String,
        MakeDescription: String,
        ModelDescription: String,
        EngineDescription: String,
        ExteriorColor: String,
        Vin: String,
        LicPlate: String,
        LicPlateState: String,
        LicPlateExpDate: String,
        DamageDescription: String,
        Mileage: String
    },
    OtherInfo: {
        ConvertedDate: String,
    }
});

var objSchema = {
    FarmersClaimType: {
        ClaimNumber: "",
        ClaimantFirstName: "",
        ClaimantLastName: "",
        Status: "",
        LossDate: "",
        LossInfo: "",
        AssignedAdjusterID: "",
        Vehicles: {}
    },
    CauseOfLossCode: "",
    StatusCode: "",
    LossInfoType: {
        CauseOfLoss: "",
        ReportedDate: "",
        LossDescription: "",
    },
    VehicleListType: {
        VehicleDetails: {}
    },
    VehicleInfoType: {
        ModelYear: "",
        MakeDescription: "",
        ModelDescription: "",
        EngineDescription: "",
        ExteriorColor: "",
        Vin: "",
        LicPlate: "",
        LicPlateState: "",
        LicPlateExpDate: "",
        DamageDescription: "",
        Mileage: ""
    },
    OtherInfo: {
        ConvertedDate: "",
    }
};

var flattenObject = function(ob) {
    var toReturn = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object') {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
};

var updatedDoc = "";

var checkThisClaim;

var copy = objSchema;

var copy2 = objSchema;

var Claim = mongoose.model('Claim', claimSchema);

//DB END

app.get('/', function(req, res) {
    res.sendfile("Public/Content/index.html");
});

app.get('/claims', function(req, res) {
    Claim.find(function(err, claims) {
        if (err)
            res.send(err)
        res.send(claims);
    });
});

// app.use(bodyParser.json());

app.post('/delete', function(req, res) {
  Claim.remove({ 'FarmersClaimType.ClaimNumber': req.body.id }, function(err, claim) {
    if (err) throw err;
    // delete him
      console.log('Claim successfully deleted!');
    });
  res.redirect('/');
});

app.post('/createClaim', upload.single('file'), function(req, res) {
    // console.log('files:', req.file);
    var addXml = req.file.filename;
    var fileLoc = path.join('./uploads', addXml);
    var contents = fs.readFileSync(fileLoc).toString();
    parseString(contents, function(err, result) {
        delete result['cla:FarmersClaim'].$;
        var checker = function(checkThisKey) {
            var value = "";
            var orig = checkThisKey;
            var transformed = "cla:" + checkThisKey;
            var traverse = function(obj, lookingForThisKey) {
                for (var key in obj) {
                    if (typeof obj[key] === "object") {
                        traverse(obj[key], lookingForThisKey);
                    }
                    if (key === lookingForThisKey) {
                        if (typeof obj[key][0] === "object") {
                            value = obj[key][0][0];
                        } else {
                            value = obj[key][0];
                        }
                    }
                }
            };
            traverse(result, transformed);
            return value;
        };
        var recurse = function(obj) {
            for (var key in obj) {
                if (typeof obj[key] === "object") {
                    recurse(obj[key]);
                } else {
                    if (checker(key) !== '') {
                        obj[key] = checker(key);
                    } else {
                        delete obj[key];
                    }
                }
            }
        };
        recurse(copy);
        // var dateArray = result['cla:FarmersClaim']['cla:LossInfo'][0]['cla:ReportedDate'][0].split('-');
        // var correctFormat = dateArray[2].charAt(0) + dateArray[2].charAt(1) + '/' + dateArray[1] + '/' + dateArray[0];
        // copy.OtherInfo.ConvertedDate = correctFormat;
        var tempclaim = new Claim(copy);
        tempclaim.save(function(err, tempclaim) {
            if (err) return console.error(err);
        });
    });
    res.redirect('/');
});

app.post('/updateClaim', upload.single('file'), function(req, res) {
    var addXml = req.file.filename;
    var fileLoc = path.join('./uploads', addXml);
    var contents = fs.readFileSync(fileLoc).toString();
    var updateThisClaim;
    parseString(contents, function(err, result) {
        delete result['cla:FarmersClaim'].$;
        var checker = function(checkThisKey) {
            var value = "";
            var orig = checkThisKey;
            var transformed = "cla:" + checkThisKey;
            var traverse = function(obj, lookingForThisKey) {
                for (var key in obj) {
                    if (typeof obj[key] === "object") {
                        traverse(obj[key], lookingForThisKey);
                    }
                    if (key === lookingForThisKey) {
                        if (typeof obj[key][0] === "object") {
                            value = obj[key][0][0];
                        } else {
                            value = obj[key][0];
                        }
                    }
                }
            };
            traverse(result, transformed);
            return value;
        };
        var recurse = function(obj) {
            for (var key in obj) {
                if (typeof obj[key] === "object") {
                    recurse(obj[key]);
                } else {
                    if (checker(key) !== '') {
                        obj[key] = checker(key);
                    } else {
                        delete obj[key];
                    }
                }
            }
        };
        recurse(copy2);
        var purify = function(obj) {
            for (var key in obj) {
                if (typeof obj[key] === "object") {
                    if (Object.keys(obj[key]).length === 0) {
                        delete obj[key];
                    } else {
                        purify(obj[key]);
                    }
                }
            }
        };
        purify(copy2);
        purify(copy2);
        updateThisClaim = copy2;
        checkThisClaim = updateThisClaim.FarmersClaimType.ClaimNumber;
    });
    Claim.findOne({
        'FarmersClaimType.ClaimNumber': checkThisClaim
    }, function(err, claim) {
        var newObj = {};
        var extract = function(obj) {
            for (var key in obj) {
                if (typeof obj[key] === "object") {
                    extract(obj[key]);
                } else {
                    newObj[key] = obj[key];
                }
            }
        }
        extract(updateThisClaim);
        for (var key in claim) {
            if (typeof claim[key] === 'object') {
                for (var x in claim[key]) {
                    if (newObj.hasOwnProperty(x)) {
                        claim[key][x] = newObj[x];
                    }
                }
            } else {
                if (newObj.hasOwnProperty(key)) {
                    claim[key] = newObj[key];
                }
            }
        }
        updatedDoc = claim;
        var query = {
            'FarmersClaimType.ClaimNumber': checkThisClaim
        };
        Claim.findOneAndUpdate(query, updatedDoc, function(err, claim) {
            if (err) throw err;
        });
    });
    res.redirect('/');
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
