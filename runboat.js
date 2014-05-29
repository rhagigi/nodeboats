var five = require("johnny-five"),
  Spark = require("spark-io"),
  keypress = require("keypress"),
  sparkBoard = new Spark({
    token: 'a6c91116ecf2909b55e37cb8d49a13f4a2dc49d1',
        deviceId: 'royibot'
  }),
  board;

// Create Johnny-Five board connected via Spark
board = new five.Board({
  io: sparkBoard
});


// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", function() {
  console.log("CONNECTED");

  //set up pins for the motor
  board.pinMode("A0",board.io.MODES.PWM);
  board.pinMode("A1",board.io.MODES.OUTPUT);
  //start motor in forward direction with 0 thrust
  board.digitalWrite("A0", 0);
  board.analogWrite("A1", 0);

  //blink the led so we know we're on.
  this.pinMode("D7", sparkBoard.MODES.OUTPUT);
  var byte = 0;
  // This will "blink" the on board led
  setInterval(function() {
          this.digitalWrite("D7", (byte ^= 1));
            }.bind(this), 500);

  // Create a new `servo` hardware instance.
  var servo  = new five.Servo({
      pin  : "D0"
  }).stop();

  // centers the servo to 90°
  //
  servo.center();

  //initial thrust and rotation vectors
  var forward = 0;
  var rotation = 90;

  var forwardThrust = function(){
      if(forward < 250)
      {
        forward = forward + 25;
        setThrust(forward);
      }
  };
  var backThrust = function(){
    if(forward > -250)
    {
      forward = forward - 25;
      setThrust(forward);
    }
  };
  var right = function(){
    if(rotation > 0){
      rotation = rotation - 10;
      servo.to(rotation);
    }
  };
  var left = function(){
    if(rotation < 180) {
      rotation = rotation + 10;
      servo.to(rotation);
    }
  };

  //onKeyPress controller
  function controller(ch, key){
    if(key && key.name){
      switch(key.name){
        case "w":
          forwardThrust();
          break;
        case "s":
          backThrust();
          break;
        case "d":
          right();
          break;
        case "a":
          left();
          break;
      }
    }
  }

  
  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  function setThrust(val){
      if(val < 0) {
        board.digitalWrite('A1', 1);
        board.analogWrite("A0", 255 - Math.min((-1*val), 255) );//yes I know this is 255+val
      }
      else {
        board.digitalWrite('A1',0);
        board.analogWrite("A0", Math.min(val,255));
      }
  }
});