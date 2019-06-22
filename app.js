const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const app = express();
const jwt = require('jsonwebtoken')

// app.use((req,res,next) => {

//     // if (req.method === 'POST') {
//     //     res.status(503).send('site is down check back later')
//     // }
//     // next()

//     res.status(503).send('site temporarily down')
// })

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});
mongoose.connection.on('connected', () => {
    console.log('connected to database ' + process.env.DATABASE_URL);
});

mongoose.connection.on('error', (err) => {
    console.log('database error ' + err);
})

const users = require('./routes/users')
const tasks = require('./routes/tasks')
const admin_users = require('./routes/admin_users')

const port = process.env.PORT

// cors middleware 
app.use(cors());

// static folder
app.use(express.static(path.join(__dirname, 'public')));
// body parser
app.use(bodyParser.json());
app.use(express.json())

app.use('/users', users);
app.use('/tasks', tasks);
app.use('/admin_users', admin_users);

app.get('/', (req, res) => {
    res.status(202).send('I work');
})

app.listen(port, () => {
    console.log('Server started at port ' + port);
});

// const Task = require('./models/task')
// const User = require('./models/user')
// const main = async () => {
//     // const task = await Task.findById('5cfc0cce23167c25c87c5771')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     const user = await User.findById('5cfc044023167c25c87c576d')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()
