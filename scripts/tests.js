function assert(x, msg) {
	if (x === false) {
		alert(msg);
		throw new Error(msg);
	}
}

function randomInteger(max) {
	return Math.floor(Math.random() * (max + 1));
}

function testReset(core) {
	// Make sure reset works as expected
    for (i = 0; i < core.v.length; i++) {
        assert(core.v[i] == 0, "Registers not zero after reset");
    }

    // Reset display.
    for (i = 0; i < core.display.length; i++) {
       assert(core.display[i] == 0, "Display not zero after reset");
    }

    // Reset stack pointer, I
    assert(core.sp == 0, "SP not reset to 0");
    assert(core.i == 0, "I not reset to 0");

    // The program counter starts at 0x200, as
    // that is the start location of the program.
    assert(core.pc == 0x200, "PC not reset to 0");

    assert(core.delayTimer = 0, "delayTimer not reset to 0");
    assert(core.soundTimer = 0, "soundTimer not reset to 0");
}

function testRet(core) {

	core.stack[0] = 0xABC;

	core.sp = 1;

	core.emulateInstruction(0x00EE);

	assert(core.pc == 0xABC, "PC not set correctly");
	assert(core.sp == 0, 	   "SP not decremeneted correctly");
}

function testCall(core) {

	for (var i = 0; i < 10; i++)
	{
		core.reset();

		var callDest = randomInteger(0xFFF);
		var callFrom = randomInteger(0xFFF);

		core.pc = callFrom;

		core.emulateInstruction(0x2000 | callDest);

		assert(core.stack[0] == callFrom, "PC not saved correctly to stack");
		assert(core.sp == 1, "SP not incremented correctly");
		assert(core.pc == callDest, "PC not set correctly");
	}
}

function testJP(core) {

	for (var i = 0; i < 10; i++)
	{
		core.reset();

		var dest = randomInteger(0xFFF);


		core.emulateInstruction(0x1000 | dest);

		assert(core.pc == dest, "PC not set correctly");
	}
}

function testSE(core) {

	for (var i = 0; i < 100; i++)
	{
		core.reset();

		var x = randomInteger(15);
		var kk = randomInteger(255);

		var equal = randomInteger(1);

		if (equal) {
			core.v[x] = kk;
		} else {
			core.v[x] = kk + 1;
		} 

		core.pc = 0x200;

		core.emulateInstruction(0x3000 | (x << 8) | kk);

		if (equal) {
			assert(core.pc == 0x202, "PC set to wrong value when equal");
		} else {
			assert(core.pc == 0x200, "PC set to wrong value when not equal");
		}
	}
}

function testSNE(core) {

	for (var i = 0; i < 100; i++)
	{
		core.reset();

		var x = randomInteger(15);
		var kk = randomInteger(255);

		var equal = randomInteger(1);

		if (equal) {
			core.v[x] = kk;
		} else {
			core.v[x] = kk + 1;
		} 

		core.pc = 0x200;

		core.emulateInstruction(0x4000 | (x << 8) | kk);

		if (equal) {
			assert(core.pc == 0x200, "PC set to wrong value when equal");
		} else {
			assert(core.pc == 0x202, "PC set to wrong value when not equal");
		}
	}
}

function testSE_Reg(core) {

	for (var i = 0; i < 100; i++)
	{
		core.reset();

		var x = randomInteger(15);
		var y = randomInteger(15);

		while (x == y) {
			y = randomInteger(15);
		}

		var kk = randomInteger(255);

		var equal = randomInteger(1);

		if (equal) {
			core.v[x] = kk;
			core.v[y] = kk;
		} else {
			core.v[x] = kk;
			core.v[y] = kk + 1;
		} 

		core.pc = 0x200;

		core.emulateInstruction(0x5000 | (x << 8) | (y << 4));

		if (equal) {
			assert(core.pc == 0x202, "PC set to wrong value when equal");
		} else {
			assert(core.pc == 0x200, "PC set to wrong value when not equal");
		}
	}
}

function testLD(core) {
	for (var i = 0; i < 100; i++)
	{
		core.reset();

		var x = randomInteger(15);

		var kk = randomInteger(255);

		core.emulateInstruction(0x6000 | (x << 8) | kk);

		for (var j = 0; j<16; j++)
		{
			if (x == j) {
				assert(core.v[j] == kk, "Register not set to value kk");
			} else {
				assert(core.v[j] == 0, "Register set when it should not be set");
			}
		}
	}
}

function testADD(core) {
	for (var i = 0; i < 100; i++)
	{
		core.reset();

		var x = randomInteger(15);

		var kk = randomInteger(255);
		var regValue = randomInteger(255);

		var result = (kk + regValue) & 255;

		core.v[x] = regValue;

		core.emulateInstruction(0x7000 | (x << 8) | kk);

		for (var j = 0; j<16; j++)
		{
			if (x == j) {
				assert(core.v[j] == result, "Add not calculated correctly");
			} else {
				assert(core.v[j] == 0, "Register set when it should not be set");
			}
		}
	}
}

function testLD_Reg(core) {

	for (var i = 0; i < 100; i++)
	{
		core.reset();

		var x = randomInteger(15);
		var y = randomInteger(15);

		var kk = randomInteger(255);

		core.v[x] = kk;

		core.emulateInstruction(0x8000 | (x << 8) | (y << 4));


		assert(core.v[x] == core.v[y], "Register not set correctly");
	}
}

function testBinaryOp(core, opcode, opFunction) {

	for (var i = 0; i < 100; i++)
	{
		core.reset();

		var x = randomInteger(15);
		var y = randomInteger(15);

		while (x == y) {
			y = randomInteger(15);
		}

		var a = randomInteger(255);
		var b = randomInteger(255);

		var res = opFunction(a, b);

		core.v[x] = a;
		core.v[y] = b;

		core.emulateInstruction(opcode | (x << 8) | (y << 4));

		assert(core.v[x] == res, "Register not set to correct result");

		if (x != y) {
			assert(core.v[y] == b, "Register changed when it should stay the same");
		}
	}
}

function testOR(core) {
	testBinaryOp(core, 0x8001, function (a, b) { return a | b; });
}

function testAND(core) {
	testBinaryOp(core, 0x8002, function (a, b) { return a & b; });
}

function testXOR(core) {
	testBinaryOp(core, 0x8003, function (a, b) { return a ^ b; });
}

function testLD_I(core) {
	for (var i = 0; i < 100; i++)
	{
		core.reset();

		var nnn = randomInteger(4095);

		core.emulateInstruction(0xA000 | nnn);

		assert(core.i == nnn, "Register not set to value nnn");
	}
}

function testChip8Core(core) {

	var tests = [
		testReset,

		testJP,
		testSE,
		
		testLD_I,
		
		// testRet,
		// testCall,

		// testSNE,
		// testSE_Reg,
		// testLD,
		// testADD,
		// testLD_Reg,
		// testOR,
		// testAND,
		// testXOR,
	];

	for (var i = 0; i < tests.length; i++) {
		// reset before test
		core.reset();

		// run the test
		tests[i](core);
	}

	alert("Tests passed");
}