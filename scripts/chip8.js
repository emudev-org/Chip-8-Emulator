var Chip8 = function () {

     this.displayWidth = 64;
     this.displayHeight = 32;
     this.display = new Array(this.displayWidth * this.displayHeight);
     this.step = null;
     this.running = null;
     this.renderer = null;

	 var memory = new ArrayBuffer(0x1000);

     this.memory = new Uint8Array(memory);
     this.v = new Array(16);
     this.i = null;
     this.stack = new Array(16);
     this.sp = null;
     this.delayTimer = null;
     this.soundTimer = null;

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

        // If the pixel exceeds the dimensions,
        // wrap it back around.
        if (x > width) {
            x -= width;
        } else if (x < 0) {
            x += width;
        }

        if (y > height) {
            y -= height;
        } else if (y < 0) {
            y += height;
        }

        location = x + (y * width);

        this.display[location] ^= 1;

        return !this.display[location];
 },

     reset: function () {

         var i;

         // Reset memory.
         for (i = 0; i < this.memory.length; i++) {
             this.memory[i] = 0;
         }

         var hexChars = [
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

          for (i = 0; i < hexChars.length; i++) {
              this.memory[i] = hexChars[i];
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

     start: function () {

         var i;

         if (!this.renderer) {
             throw new Error("You must specify a renderer.");
         }

         this.running = true;

         var self = this;
         requestAnimFrame(function me() {
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

             requestAnimFrame(me);

         });


     },

     stop: function () {
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

     emulateCycle: function () {
         // fetch instruction from memory
         var opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1];

         // move to next instruction
         this.pc += 2;
         
         // extract opcode fields for ease of use here
         var x   = ((opcode) >> 8) & 0xF;
         var y   = ((opcode) >> 4) & 0xF;
         var nn  = ((opcode) >> 0) & 0xFF;
         var nnn = ((opcode) >> 0) & 0xFFF;

         

         switch((opcode) >> 12) {
            case 0x1: this.pc = nnn; break;
            case 0x3: if (this.v[x] === nn ) { this.pc += 2; } break;
            case 0x6: this.v[x] = nn; break;
            case 0x7: this.v[x] = this.v[x] + nn; break;
            case 0xa: this.i = nnn; break;

            case 0xd:
                this.v[0xF] = 0;

                 var height = opcode & 0x000F;
                 var registerX = this.v[x];
                 var registerY = this.v[y];
                 var x, y, spr;

                 for (y = 0; y < height; y++) {
                     spr = this.memory[this.i + y];
                     for (x = 0; x < 8; x++) {
                         if ((spr & 0x80) > 0) {
                             if (this.setPixel(registerX + x, registerY + y)) {
                                 this.v[0xF] = 1;
                             }
                         }
                         spr <<= 1;
                     }
                 }
                 this.drawFlag = true;
            break;

            case 0xc: this.v[x] =  (Math.random() * 256) & nn; break;
            case 0xf: {
                switch (opcode & 0xFF) {
                    case 0x08: this.v[x] = this.delayTimer; break;
                    case 0x29: this.i = this.v[x] * 5; break;
                    case 0x1e: this.i += this.v[x]; break;
                    case 0x55:
                        for (var i = 0; i <= x; i++) {
                             this.memory[this.i + i] = this.v[i];
                         }
                        break;

                    default:
                        alert("Opcode prefix 0xF " + opcode.toString(16) + " not implemented")
                    break;
                }
            }
            break;
            
            default:
                alert("Opcode ??!!" + opcode.toString(16) + " not implemented")
            break;
         }
         
         // Check first nibble to determine opcode.
         
         // decode
         // implement opcode
     }
};
