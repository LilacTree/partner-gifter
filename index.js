module.exports = function PartnerGifter(mod) {
	const command = mod.command;
	const config = require('./config.json');
	const gifts = require('./gifts');
	
	let	enabled = true,
		notice = false,
		minEnergy = 80;
	
	let configError1 = false,
		configError2 = false;
		
	let	myGameId = null,
		invenItems = [],
		partnerDbid = null,
		partnerId = null,
		findId = false,
		onCd = false,
		isGifting = false,
		giftList = JSON.parse(JSON.stringify(gifts));
		
	for (let i = 0; i < giftList.length; i++) {
		giftList[i].amount = 0;
	}
		
	command.add('partnergifter', {
		$none() {
			enabled = !enabled;
			command.message(`Partner Gifter Module is now: ${enabled ? "enabled" : "disabled"}.`);
		},
		$default() {
			command.message("Invalid command! See README for the list of valid commands.")
		},
		notice() {
			notice = !notice;
			command.message(`Notice is now: ${notice ? "enabled" : "disabled"}.`);
		},
		find() {
			findId = true;
			command.message("Manually give gift to your partner to find out its Item ID.");
		}
	});
	
	mod.hook('S_LOGIN', 13, (event) => {
		loadConfig();
		myGameId = event.gameId;
		invenItems = [];
		partnerDbid = null;
		partnerId = null;
		findId = false;
		onCd = false;
		isGifting = false;
	});
	
	mod.hook('S_LOAD_CLIENT_USER_SETTING', 'raw', () => {
		if (!enabled) return;
		
		process.nextTick(() => {
			if (configError1) {
				command.message('<font color="#FF0000">Error</font>: Detected corrupted/outdated config file - Please update');
			}
			else if (configError2) {
				command.message('<font color="#FF0000">Error</font>: Unable to load the config file - Using default values for now');
			}
		});
	});
	
	mod.hook('S_INVEN', 18, (event) => {
		if (!enabled) return;
		
		invenItems = event.first ? event.items : invenItems.concat(event.items);
		for (let i = 0; i < giftList.length; i++) {
			if (invenItems.filter(function(a) { return a.id === giftList[i].id; }).length > 0) {
				let invenIndex = invenItems.findIndex(a => a.id === giftList[i].id);
				giftList[i].amount = invenItems[invenIndex].amount;
			}
			else {
				giftList[i].amount = 0;
			}
		}
	});
	
	mod.hook('S_REQUEST_SPAWN_SERVANT', 1, (event) => {
		if (myGameId === event.owner && event.fellowship >= 1){
			partnerDbid = event.dbid;
			partnerId = event.id;
			
			if (!enabled) return;
			
			processGifting(event.energy);
		}
	});
	
	mod.hook('S_UPDATE_SERVANT_INFO', 1, (event) => {
		if (!enabled) return;
		
		if(partnerDbid === event.dbid && partnerId === event.id && event.fellowship >= 1){
			processGifting(event.energy);
		}
	});
	
	mod.hook('S_REQUEST_SERVANT_INFO_LIST', 'raw', () => {
		if (!enabled) return;
		
		if (isGifting) {
			return false;
		}
	});
	
	mod.hook('C_USE_SERVANT_FEED_ITEM', 1, (event) => {
		if (findId){
			command.message("Item ID: " + event.id);
			findId = false;
		}
	});
    
	function useServantFeedItem(gift) {
		mod.toServer('C_USE_SERVANT_FEED_ITEM', 1, {
			dbid: partnerDbid,
			id: gift.id,
			unk1: 0
		});
	}
	
	function giftPartner() {
		for (let i = 0; i < giftList.length; i++) {
			if (giftList[i].amount > 0) {
				giftList[i].amount--;
				onCd = true;
				setTimeout(()=>{ onCd = false; }, giftList[i].cd * 1000);
				isGifting = true;
				setTimeout(()=>{ isGifting = false; }, 250);
				if (notice) {
					command.message('Gifted ' + giftList[i].name + '! You have <font color="#00FFFF">' + giftList[i].amount + '</font> remaining.');
				}
				useServantFeedItem(giftList[i]);
				return;
			}
		}
		command.message('<font color="#FDD017">Warning</font>: No gift found in your inventory!');
	}
	
	function processGifting(energy) {
		let partnerEnergyPercent = Math.round((Number(energy) / 300) * 1000) / 10;
			
		if (partnerEnergyPercent < minEnergy && !onCd) {
			giftPartner();
		}
	}

	function loadConfig() {
		if (config) {
			({enabled, notice, minEnergy} = config);
			if (typeof enabled === 'undefined') {
				enabled = true;
				configError1 = true;
			}
			if (typeof notice === 'undefined') {
				notice = false;
				configError1 = true;
			}
			if (typeof minEnergy === 'undefined') {
				minEnergy = 80;
				configError1 = true;
			}
		}
		else {
			configError2 = true;
		}
	}
}