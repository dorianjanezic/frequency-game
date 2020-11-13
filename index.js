//initializing the express 'sketch' object
let express = require('express');
let app = express();
app.use('/', express.static('public'));

//initialize the HTTP server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 5000;
server.listen(port, ()=> {
console.log('listening at ', port);
});


//initialize socket.io
let io = require('socket.io').listen(server);

//different nameSpaces
let mod = io.of('/mod');
let freq2 = io.of('/freq2');

let allBoard = [];
let frequencies = [];

//listening for users to connect
mod.on('connection', (socket) => {
    console.log('mod socket connected : ' + socket.id);

    socket.on('freqData', data => {
        console.log(data.freq);

        freq2.emit('freqData', data);
    });

    socket.on('modFreq', data => {
        // console.log(data.osc1.f);
        frequencies.push(data);
        // console.log(frequencies);
        mod.emit('modFreq', frequencies)
    })

    // socket.on('clientObject', data => {
    //     console.log(data);
    //     allBoard.push(data);

    //     mod.emit('modBoard', allBoard);
    // })
});

let scoreBoard = []; 

freq2.on('connection', (socket) => {

    // scoreBoard[socket.id]={};

    // socket.on('msg', (data) => {
    //     scoreBoard.push(data);
    //     // console.log(data);
    // });

    //getting username and score
    socket.on('clientObject', (data)=> {
        // I don't think we need to save this in an array
        // scoreBoard[socket.id]={};
        // scoreBoard[socket.id].name = data.name;
        // scoreBoard[socket.id].score = data.score;

        //sending name and score back to nameSpace '/freq2'
        scoreBoard.push(data);
        // console.log(scoreBoard);

        // scoreBoard.name = data.name;
        // scoreBoard.score = data.score;

        // let outputData = {
        //     name : scoreBoard.name,
        //     score: scoreBoard.score
        // }

        socket.emit('scoreBoard', scoreBoard);

        // mod.emit('scoreBoard', scoreBoard);
        // freq2.emit('scoreBoard', scoreBoard);
        
        mod.emit('scoreBoard', scoreBoard);

        // freq2.emit('scoreBoard', data);
    });
});


// freq2.on('connection', (socket) => {

//     socket.on('clientObject', (data)=> {

//         scoreBoard.push(data);

//         socket.emit('scoreBoard', scoreBoard);
//     });
// });