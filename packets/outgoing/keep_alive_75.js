var utilities = require('../../utilities');
var crypt_packet = require('../../crypt_packet');
var gen_packet_tail = require('../../gen_packet_tail');
var gen_name_key = require('../../gen_name_key');
var gen_temp_key = require('../../gen_temp_key');
var build_packet = require('../../build_packet');

module.exports = function (client, data) {
	var id = 0x75;

	var payload = [];

	payload = payload.concat(data.bait_1);
	payload = payload.concat(data.bait_2);
	payload = payload.concat([0, 0, 0, 0]); /* padding */
	payload = payload.concat([0x01, 0xB4, 0x8D, 0xE0]); /* uptime/ticks */

	payload.push(0x00);

	payload.push(id);

	var short_arg = (utilities.rand() % 0xFEFD) + 0x100;
	var byte_arg = (utilities.rand() % 0x9B) + 0x64;

	var temp_key = gen_temp_key(client.name_key, short_arg, byte_arg);

	var crypted_packet = crypt_packet(temp_key, client.inc, payload);

	var tail = gen_packet_tail(id, client.inc, crypted_packet, short_arg, byte_arg);

	var packet = build_packet(id, client.inc, crypted_packet, tail);

	client.send(packet);
	
	client.inc += 1;

	client.change_state('main_loop');
};