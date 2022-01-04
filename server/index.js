var express = require('express');
var app = express()
var path = require('path');
var async = require('async');

app.use(express.urlencoded({extended: false}))

const ObjectId = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken')
const cors = require('cors')

const config = require('./config');
const mongoClient = require('mongodb').MongoClient;
const url = `mongodb://${config.dbHost}:${config.port}`;
const secreteKey = 'secreteKey';

// app.use(express.static(path.join(__dirname, '../app')))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors())

function verifyToken(req, res, next) {

  if (!req.query.token && !req.headers.authorization) return res.sendStatus(401)
  if (req.query.token)
    token = req.query.token
  else
    token = req.headers['authorization'].split(' ')[1]

  if (token === null) return res.sendStatus(401)

  jwt.verify(token, secreteKey, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    // if (config.caa() > 0) {
      next()
    // }
  })
}

function getUser(req, res, next) {
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);
    collection.findOne({username: { $regex: `^${req.body.username}`, $options: 'ig' } })
    .then(results => {
      if (results != null) {
        return res.status(201).json({ message: "user exists" });
      }
      next();
    })
    .catch(err => {
      res.send(err)
      client.close()
    })
  });
}

function getClinic(req, res, next) {
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionClinics);
    collection.findOne({name: { $regex: `^${req.body.name}`, $options: 'ig' } })
    .then(results => {
      if (results != null) {
        return res.status(201).json({ message: "clinic exists" });
      }
      next();
    })
    .catch(err => {
      res.send(err)
      client.close()
    })
  });
}

function getInsurance(req, res, next) {
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionInsurances);
    collection.findOne({name: { $regex: `^${req.body.name}`, $options: 'ig' } })
    .then(results => {
      if (results != null) {
        return res.status(201).json({ message: "clinic exists" });
      }
      next();
    })
    .catch(err => {
      res.send(err)
      client.close()
    })
  });
}

function checkIfDayIsEndOfDay(month, day) {
  if (month == 9 || month == 4 || month == 6 ||month == 11) {
    if (day > 30) {
      return '30';
    }
  } else if(month == 2) {
    if (day > 28) {
      return '28';
    }
  } else {
    if (day > 31) {
      return '31';
    }
  }
  return day;
}

function normalizeMonthAndDay(value) {
  if (value.toString().length < 2) {
    return `0${value}`
  } else {
    return value;
  }
}

function normalizeTimestamp(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = normalizeMonthAndDay(date.getMonth() + 1);
  const day = normalizeMonthAndDay(date.getDate());
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

app.post('/api/editPassword', verifyToken, (req, res) => {
  const { oldPassword, newPassword, userId } = req.body;
  
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);

    collection.findOneAndUpdate({ 
      $and: [
        {'_id': ObjectId(userId) }, 
        { 'password': oldPassword }
      ]},
      { $set: {'password': newPassword } }
    ).then(updateRes => res.send(updateRes.value))
  })
})

app.get('/api/getallusers', verifyToken, (req, res) => {
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);
    
    collection.find().sort({'fullname': 1})
    .toArray()
    .then(results => {
      console.log('results => ', results);
      res.json(results);
      client.close();
    })
    .catch(error => {
      console.log(error);
      res.send(error);
      client.close();
    });

  })
})

app.get('/api/getclinics', (req, res) => {
  mongoClient.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionClinics);
    
    collection.find({}).sort({'name': 1})
    .toArray()
    .then(results => {
      res.json(results)
    })
    .catch(error => res.send(error));

    client.close();
  })
})

app.get('/api/getInsurances', (req, res) => {
  mongoClient.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionInsurances);
    
    collection.find({}).sort({'name': 1})
    .toArray()
    .then(results => res.json(results))
    .catch(error => res.send(error));

    client.close();
  })
})

app.post('/api/insertusers', verifyToken, getUser, (req, res,) => {
  let { username, password, fullname, role, dateAdded, reviews, referrals, clinic } = req.body;
  
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);

    if (!username || !password || !fullname || !role || !dateAdded) {
       return res.status(400).json({
           message: 'All fields are required'
       })
    }
    dateAdded = new Date(dateAdded);
    const payload = { username, password, fullname, role, dateAdded, reviews, referrals, clinic };
    collection.insertOne(payload)
    .then(result => res.json(result.ops[0]))
    .catch(error => res.send(error));
  });
});

app.post('/api/addclinic', verifyToken, getClinic, (req, res,) => {
  const { name } = req.body;
  
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionClinics);

    if (!name) {
       return res.status(400).json({
           message: 'All fields are required'
       })
    }
    payload = { name }
    collection.insertOne(payload)
    .then(result => res.json(result.ops[0]))
    .catch(error => res.send(error));
  });
});

app.post('/api/addinsurance', verifyToken, getInsurance, (req, res,) => {
  const { name } = req.body;
  
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionInsurances);

    if (!name) {
       return res.status(400).json({
           message: 'All fields are required'
       })
    }
    payload = { name }
    collection.insertOne(payload)
    .then(result => res.json(result.ops[0]))
    .catch(error => res.send(error));
  });
});

app.delete('/api/users/:id', verifyToken, (req, res,) => {
  const { id } = req.params;
  const _id = ObjectId(id);

  mongoClient.connect(url)
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);
    
    collection.deleteOne({ _id })
    .then(result => res.json(result))
    .catch(error => res.send(error));
  });
});

app.get('/api/users/:id', verifyToken, (req, res,) => {
  const { id } = req.params;
  const _id = ObjectId(id);
  
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);
    
    collection.findOne({_id: _id})
    .then(result => res.json(result))
    .catch(error => res.send(error));
  });
});

app.get('/api/login', (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(client => {
      const db = client.db(config.dbName);
      const collection = db.collection(config.dbCollectionUsers);
      
      collection.find({username: { $regex: `^${username}`, $options: 'ig' }, password: password})
      .toArray()
      .then(results => {
        if (!results.length) {
          res.json('INVALID CREDENTIALS')
        } else {
          let pload = { user: results._id }
          let token = jwt.sign(pload, secreteKey)
          let resData = {
            user: results,
            token: token
          }
          res.send(resData);
        }
        client.close();
      })
      .catch(err => {
        res.send(err);
        client.close();
      })
    })
});

app.post('/api/insert-appointment', verifyToken, (req, res) => {
  let { name, clinic, bookedDate, time, madeBy, insurance, contact, response, remarks, done, editor, reason, appointmentType } = req.body;

  mongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(client => {
    const db = client.db(config.dbName);
    let collection;
    if (appointmentType === 'review') {
      collection = db.collection(config.dbCollectionReviews);
    }
    else {
      collection = db.collection(config.dbCollectionReferrals);
    }

    if (!name || !clinic) {
       return res.status(400).json({
           message: 'All fields are required'
       })
    }
    
    if (bookedDate != null) {
      // bookedDate = new Date(bookedDate)
      bookedDate = normalizeTimestamp(bookedDate);
    }

    const payload = { name, clinic, bookedDate, time, madeBy, insurance, contact, response, remarks, done, editor, addedOn: new Date() };
    if (appointmentType != 'review') {
      payload.reason = reason
    }
    
    collection.insertOne(payload)
    .then(result => res.json(result.ops[0]))
    .catch(error => res.send(error));
  }); 
});

app.get('/api/allreviews', verifyToken, (req, res) => {  
  mongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(client => {
      const db = client.db(config.dbName);
      const collection = db.collection(config.dbCollectionReviews);
      
      collection.find({})
      .toArray()
      .then(results => res.json(results))
      .catch(error => res.send(error));
  
      client.close();
    })
});

app.get('/api/my-appointments', verifyToken, (req, res) => {
  const id = req.query.userId;
  const appointmentType = req.query.appointmentType;
  const myclinic = req.query.clinic;
  
  mongoClient.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);

    let fromCollection;

    if (appointmentType === 'review') {
      fromCollection = config.dbCollectionReviews
    } else if (appointmentType == 'referral') {
      fromCollection = config.dbCollectionReferrals
    } else { 
      return;
    }
    
    collection.aggregate([
      {
        $match: { "_id": ObjectId(id) },
      },
      {
        "$project": {"_id": { "$toString": "$_id"}, "fullname": 1}
      },
      {
        $lookup:
          {
            from: fromCollection,
            let: { id: { $toString: "$_id" }, clin: myclinic },
            pipeline: [{ $match: { $expr: {  $and: [ { $eq: [ "$clinic", "$$clin" ] }, { $eq: [ "$done", "0" ] } ] } } }],
            as: `myAppointments`
          }
      }
    ])
    .toArray()
    .then(results => res.json(results))
    .catch(error => res.send(error));

    client.close();
  })
})

app.get('/api/MyCreatedAppointments', verifyToken, (req, res) => {
  const id = req.query.userId;
  const appointmentType = req.query.appointmentType;
  const dateFrom = req.query.dateFrom;
  let dateTo = req.query.dateTo;

  if (dateTo == 'null') {
    // dateTo = dateFrom;
    dateTo = new Date(dateFrom);
    dateTo = new Date(dateTo.setDate(dateTo.getDate() - 1));
    dateCriteriaField = "$bookedDate";
  } else {
    dateCriteriaField = "$addedOn";
  }
  
  // let dfM = (new Date(dateFrom).getMonth() + 1).toString();
  // let dtM = (new Date(dateTo).getMonth() + 1).toString();
  // let dfD = (new Date(dateFrom).getDate());
  // let dtD = (new Date(dateTo).getDate() + 1);


  // if (dfM.toString().length == 1) {
  //   dfM = `0${dfM}`;
  // }
  // if (dtM.toString().length == 1) {
  //   dtM = `0${dtM}`;
  // };

  // if (dfD.toString().length == 1) {
  //   dfD = `0${dfD}`;
  // }
  // if (dtD.toString().length == 1) {
  //   dtD = `0${dtD}`;
  // };
  

  // let df = (`${new Date(dateFrom).getFullYear()}-${dfM}-${dfD}`);
  // let dt = (`${new Date(dateTo).getFullYear()}-${dtM}-${dtD}`);
  
 

  mongoClient.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
  })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);

    let fromCollection;

    if (appointmentType === 'review') {
      fromCollection = config.dbCollectionReviews
    } else if (appointmentType == 'referral') {
      fromCollection = config.dbCollectionReferrals
    } else { 
      return;
    }
    
    let df = new Date(dateFrom);
    
    let dt = new Date(dateTo);
    dt = new Date(dt.setDate(dt.getDate() + 1));

    console.log('DT: => ', dt);
  
    console.log('date from: ', new Date(df), 'date To: ', new Date(df));

    collection.aggregate([
      {
        $match: { "_id": ObjectId(id) },
      },
      {
        "$project": {"_id": { "$toString": "$_id"}, "fullname": 1}
      },
      {
        $lookup:
          {
            from: fromCollection,
            let: { id: { $toString: "$_id" }, dateFrom: df, dateTo: dt },
            pipeline: [
              { 
                // $match: { $expr: {  $and: [ { $eq: [ "$madeBy", "$$id" ] }, { $gte: [ dateCriteriaField, "$$dateFrom" ] }, { $lte: [ dateCriteriaField, "$$dateTo"] } ] } }
                $match: { $expr: { $and: [ { $eq: [ "$madeBy", "$$id" ] }, { $eq: [ "$done", "0" ] }, { $gte: [ dateCriteriaField, "$$dateFrom"] }, { $lte: [ dateCriteriaField, "$$dateTo"] }  ] } } 
                                           
                                          // { $eq: [ "$madeBy", "$$id" ] }, { $eq: [ "$done", "0" ] }, { $gte: [ dateCriteriaField, new Date(df) ] }, { $lt: [ dateCriteriaField, new Date(dt) ] }
              }
            ],
            as: `myAppointments`
          }
      }
    ])
    .toArray()
    .then(results => res.json(results))
    .catch(error => res.send(error));

    client.close();
  })
})

app.delete('/api/deleteReview', verifyToken, (req, res) => {
  const id = req.query.appointmentId;
  const appointmentType = req.query.appointmentType;
  const _id = ObjectId(id);
  
  mongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(client => {
    db = client.db(config.dbName);
    
    let collection;

    if (appointmentType === 'review') {
      collection = db.collection(config.dbCollectionReviews);
    } else if (appointmentType === 'referral') {
      collection = db.collection(config.dbCollectionReferrals);
    } else {
      return;
    }

    collection.deleteOne({ _id })
    .then( results => {
      res.json(results);
    })
    .catch(error => req.send(error));

    client.close();
  });
});

app.post('/api/updatemyappointment', verifyToken, (req, res) => {
  const data = JSON.parse(req.body.data);
  const appointmentType = req.body.appointmentType;
  const id = data._id;
  
  let bookedDate = null;
  if (data.bookedDate !== null) {
    // bookedDate = new Date(data.bookedDate)
    bookedDate = normalizeTimestamp(data.bookedDate);
    console.log(normalizeTimestamp(data.bookedDate));
  }
  
  let appointment = {
    name: data.name,
    clinic: data.clinic,
    bookedDate: bookedDate,
    insurance: data.insurance,
    time: data.time,
    contact: data.contact,
    remarks: data.remarks,
    response: data.response,
    editor: data.editor
  }

  if (data.reason != undefined) {
    appointment.reason = data.reason
  }
  console.log(appointment);
  
  mongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(client => {
    db = client.db(config.dbName);
    let collection;

    if (appointmentType === 'review') {
      collection = db.collection(config.dbCollectionReviews);
    } else if (appointmentType === 'referral') {
      collection = db.collection(config.dbCollectionReferrals);
    } else {
      res.sendStatus(401);
    }

    collection.updateOne({"_id": ObjectId(id)}, {$set: appointment})
    .then(results => {
      res.json(results);
    })
    .catch(error => {
      req.send(error);
    })

    client.close();
  });
})

app.get('/api/undone-appointments', verifyToken, (req, res) => {
  let { dateFrom, dateTo } = req.query;
  let dateCriteriaField = '';

  if (dateTo == 'null') {
    dateTo = new Date(dateFrom);
    dateTo = new Date(dateTo.setDate(dateTo.getDate() - 1));
    
    // dateTo = dateFrom;
    dateCriteriaField = "$bookedDate";
  } else {
    dateCriteriaField = "$addedOn";
  }
  // dateFrom = new Date('2021/11/04');
  // dateTo = new Date('2022/01/04')
  mongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }).then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);
    
    let df = new Date(dateFrom);
    
    let dt = new Date(dateTo);
    dt = new Date(dt.setDate(dt.getDate() + 1));
    
    console.log('date from: ', df, ' date To: ', dt);

    async.waterfall([
      function GET_REVIEWS(callback) {
        db.collection(config.dbCollectionReviews).aggregate([
          {
            $addFields: {
              convertedId: { $toObjectId: "$madeBy" },
              dateCriteriaField: dateCriteriaField
            },
          },
          { $match: { $and: [ { dateCriteriaField: { $gte: df } }, { dateCriteriaField: { $lte: dt } }, { done: "0" } ] } },
          {
            $lookup: {
              from: config.dbCollectionUsers,
              localField: "convertedId",
              foreignField: '_id',
              as: 'creator'
            }
          },
          { $unwind: { path: "$creator"} }
        ])
        .toArray()
        .then(results => {
          callback(null, results);
        })
        .catch(err => callback(err))
      },
      function GET_REFERRALS(ret, callback) {
        
        db.collection(config.dbCollectionReferrals).aggregate([
          {
            $addFields: {
              convertedId: { $toObjectId: "$madeBy" }
            },
          },
          { $match: { $and: [ { addedOn: { $gte: df } }, { addedOn: { $lte: dt } }, { done: "0" } ] } },
          {
            $lookup: {
              from: config.dbCollectionUsers,
              localField: "convertedId",
              foreignField: '_id',
              as: 'creator'
            }
          },
          { $unwind: { path: "$creator"} }
        ])
        .toArray()
        .then(results => {
          callback({ reviews: ret, referrals: results });
        })
        .catch(err => callback(err))
      }
    ], (docs) => {
      res.json({data: docs})
    })

    // collection.aggregate([
    //   {
    //     $project: {"_id": { $toString: "$_id"}, "fullname": 1}
    //   },
    //   {
    //     $lookup:
    //       {
    //         from: config.dbCollectionReviews,
    //         let: { id: { $toString: "$_id" }, dateFrom: df, dateTo: dt },
    //         pipeline: [
    //           { $match: 
    //             { $expr: 
    //               { 
    //                 $and: 
    //                 [ 
    //                   { $eq: [ "$madeBy", "$$id" ] }, { $eq: [ "$done", "0" ] }, { $gte: [ dateCriteriaField, "$$dateFrom"] }, { $lte: [ dateCriteriaField, "$$dateTo"] } 
    //                 ] 
    //               } 
    //             } 
    //           }
    //         ],
    //         as: "reviews"
    //       }
    //   },
    //   {
    //     $lookup:
    //       {
    //         from: config.dbCollectionReferrals,
    //         let: { id: { $toString: "$_id" }, dateFrom: df, dateTo: dt },
    //         pipeline: [
    //           { 
    //             $match: { 
    //               $expr: { 
    //                 $and: [
    //                   { $eq: [ "$madeBy", "$$id" ] }, { $eq: [ "$done", "0" ] }, { $gte: [ dateCriteriaField, "$$dateFrom"] }, { $lte: [ dateCriteriaField, "$$dateTo"] } 
    //                 ] 
    //               } 
    //             } 
    //           }
    //         ],
            
    //         as: "referrals"
    //       }
    //   }
    // ])
    // .toArray()
    // .then(results => res.json(results))
    // .catch(error => res.send(error));
  });
});

app.patch('/api/completereview', verifyToken, (req, res) => {

  mongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }).then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionReviews);
    for (const key in req.body) {

      collection.updateOne({ _id: ObjectId(req.body[key]) }, {$set: { done: "1" } } )
      .then(results => res.json(results))
      .catch(error => res.send(error));
    }
  });
})

app.patch('/api/completereferral', verifyToken, (req, res) => {

  mongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }).then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionReferrals);
    for (const key in req.body) {

      collection.updateOne({ _id: ObjectId(req.body[key]) }, {$set: { done: "1" } } )
      .then(results => res.json(results))
      .catch(error => res.send(error));
    }
  });
})

.patch('/api/edituser', verifyToken, (req, res) => {
  const { userId, fullname, username, password, role, clinic } = req.body

  mongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }).then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollectionUsers);
    
    collection.updateOne({ _id: ObjectId(userId) }, { $set: { username: username, password: password, fullname: fullname, role: role, clinic: clinic } } )
    .then(results => res.json(results))
    .catch(error => res.send(error));
  })
})

// app.get('*', (req, res) => {
//   return res.sendFile(path.join(__dirname, '../app/index.html'))
// })

app.listen(3000, () => {
  console.log('Server started on port 3000...');
})