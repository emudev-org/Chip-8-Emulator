Chip8
=====

What is?
--------

Chip8 is an old, old, old "VM" spec for games

"CHIP-8 is an interpreted programming language, developed by Joseph Weisbecker. It was initially used on the COSMAC VIP and Telmac 1800 8-bit microcomputers in the mid-1970s. CHIP-8 programs are run on a CHIP-8 virtual machine. It was made to allow video games to be more easily programmed for these computers." (https://en.wikipedia.org/wiki/CHIP-8)

There are many state-of-the-70s games for it
- BRIX
- PONG
- SNAKE
- ....

Main features
-------------

- 4096 bytes of ram (!!)

- 16 8-bit general purpose registers (V0 to VF). VF also serves as "FLAG"

- 2 16-bit special purpose registers, PC (Program Coutnter) and I (index)

- one 4-bit special purpose register, SP (Stack Pointer)

- Two 60hz timers (Delay, Sound)

- Beeper

- 16 inputs, 0-F

- 64x32 display, 1 bit per pixel

- 35 opcodes, 16-bit fixed opcode length, stored in big endian byte order

- Amazing 1bpp font, 0 - F

Technial documentation
----------------------

[Cowgod's Chip-8 Technical Reference v1.0](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM)

Boot sequence
-------------

Game image is loaded to address 0x200

Execution starts at 0x200

... That's it

Basic systems concepts
----

What is binary?
 Binary is a number systems that only has '0' and '1'

 binary 1000 is 8 (1 * 8 + 0 * 4 + 0 * 2 + 0) decimal
 binary 1001 is 9 (1 * 8 + 0 * 4 + 0 * 2 + 1) decimal
 binary 1100 is 12 (1 * 8 + 1 * 4 + 0 * 2 + 0) decimal
And so on.


What is hex (aka hexadecimal)?
 Hex is a number system that has 16 symbols '0' - '9', 'A' - 'F'
 Similar, but instead of '0' and '1' digits there are 16, '0' to 'F'


What is an opcode?
 It the numeric representation for an instruction for a cpu. Usually it is fixed in length, but there are architectures that have variable length encodings (x86 & co)

For any questions, poke skmp@emudev.org