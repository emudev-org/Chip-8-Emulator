var Chip8 = function () {

    this.displayWidth = 64;
    this.displayHeight = 32;

    this.step = null;
    this.running = null;
    this.renderer = null;

    this.hexChars = [
              0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
              0x20, 0x60, 0x20, 0x20, 0x70, // 1
              0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
              0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
              0x90, 0x90, 0xF0, 0x10, 0x10, // 4
              0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
              0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
              0xF0, 0x10, 0x20, 0x40, 0x40, // 7
              0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
              0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
              0xF0, 0x90, 0xF0, 0x90, 0x90, // A
              0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
              0xF0, 0x80, 0x80, 0x80, 0xF0, // C
              0xE0, 0x90, 0x90, 0x90, 0xE0, // D
              0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
              0xF0, 0x80, 0xF0, 0x80, 0x80 // F
    ];

    // Chip-8 state
    this.display = new Array(this.displayWidth * this.displayHeight);
    var memory = new ArrayBuffer(0x1000);

    this.memory = new Uint8Array(memory);
    this.v = new Array(16);
    this.i = 0;
    this.stack = new Array(16);
    this.sp = 0;
    this.delayTimer = 0;
    this.soundTimer = 0;

    this.keys = {};

    this.reset();
};

Chip8.prototype = {
    loadProgram: function (program) {
        // Load program into memory
        for (i = 0; i < program.length; i++) {
            this.memory[i + 0x200] = program[i];
        }
    },

    setKey: function(key) {
        this.keys[key] = true;
    },

    unsetKey: function(key) {
       delete this.keys[key];
    },
     
    setKeyState: function(key, depressed) {
       this[["unset", "set"][+depressed] + "Key"](key);
    },

    setRenderer: function (renderer) {
        this.renderer = renderer;
    },

    getDisplayWidth: function () {
         return this.displayWidth;
    },

    getDisplayHeight: function () {
        return this.displayHeight;
    },

    setPixel: function(x, y) {
        var location,
            width = this.getDisplayWidth(),
            height = this.getDisplayHeight();

        if (x < 0 || x > width) {
            alert("setPixel: Invalid X coordinate");
        }

        if (y < 0 || y > width) {
            alert("setPixel: Invalid X coordinate");
        }

        location = x + (y * width);

        this.display[location] ^= 1;

        return !this.display[location];
    },

    start: function () {

        var i;

        if (!this.renderer) {
            throw new Error("You must specify a renderer.");
        }

        this.running = true;

        var self = this;
         
        var delayTimer = performance.now();

        requestAnimFrame(function me() {

            while ((performance.now() - delayTimer) > 32) {
                delayTimer = delayTimer + 32;

                for (var i = 0; i < 10; i++) {
                    if (self.running) {
                        self.emulateCycle();
                    }
                }

                if (self.drawFlag) {
                    self.renderer.render(self.display);
                    self.drawFlag = false;
                }

                if ( ! (self.step++ % 2)) {
                    self.handleTimers();
                }
            }
            requestAnimFrame(me);
        });
    },

    stop: function () {
        this.running = false;
    },


///////////////////////////////////////////////
//// 
////

    reset: function () {
        var i;

        // Reset memory.
        for (i = 0; i < this.memory.length; i++) {
            this.memory[i] = 0;
        }

        for (i = 0; i < this.hexChars.length; i++) {
            this.memory[i] = this.hexChars[i];
        }


        // Reset registers.
        for (i = 0; i < this.v.length; i++) {
            this.v[i] = 0;
        }

        // Reset display.
        for (i = 0; i < this.display.length; i++) {
           this.display[i] = 0;
        }

        // Reset stack pointer, I
        this.sp = 0;
        this.i = 0;

        // The program counter starts at 0x200, as
        // that is the start location of the program.
        this.pc = 0x200;

        this.delayTimer = 0;
        this.soundTimer = 0;

        this.step = 0;
        this.running = false;

    },

    handleTimers: function() {
        if (this.delayTimer > 0) {
            this.delayTimer--;
        }

        if (this.soundTimer > 0) {
            if (this.soundTimer == 1) {
                this.renderer.beep();
            }
            this.soundTimer--;
        }
    },

/*

CHEAT SHEET -- the DRW operation looks like this
---

 this.v[0xF] = 0;

 var height = opcode & 0x000F;
 var registerX = this.v[x];
 var registerY = this.v[y];
 var x, y, spr;

 for (y = 0; y < height; y++) {
     spr = this.memory[this.i + y];
     for (x = 0; x < 8; x++) {
         if ((spr & 0x80) > 0) {
             if (this.setPixel((registerX + x) & (this.displayWidth - 1), (registerY + y) & (this.displayHeight - 1))) {
                 this.v[0xF] = 1;
             }
         }
         spr <<= 1;
     }
 }
 this.drawFlag = true;
*/
    emulateInstruction: function(opcode) {

        // decode fields
        var x = (opcode >> 8) & 0xF;
        var y = (opcode >> 4) & 0xF;
        var kk =  (opcode >> 0) & 0xFF;
        var nnn = (opcode >> 0) & 0xFFF;
        
        // handle operation
        
        // TODO: Implement this
        throw new Error("Unknown opcode " + opcode.toString(16) + " passed. Terminating.");
    },

    emulateCycle: function () {
         // to stop on exception
         this.running = false;

         // get opcode from memory
         var opcode = this.memory[this.pc] * 256 | this.memory[this.pc + 1];

         this.pc += 2;

         this.emulateInstruction(opcode);

         // no exception, resume
         this.running = true;
     }
};
