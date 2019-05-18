module.exports = function PartnerGifter(mod) {
	const command = mod.command;
	const config = require('./config.json');
	const gifts = require('./gifts');
	
	let	enabled = true,
		notice = false,
		minEnergy = 80;
		
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
			command.message("Invalid command! See README for the list of valid commands")
		},
		notice() {
			notice = !notice;
			command.message(`Notice is now: ${notice ? "enabled" : "disabled"}.`);
		},
		find() {
			findId = true;
			command.message("Manually give gift to your partner to find out its item id");
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
			({enabled, minEnergy, notice} = config)
		}
		else {
			command.message("Error: Unable to load config.json - Using default values for now");
		}
	}
}