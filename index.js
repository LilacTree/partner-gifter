module.exports = function PartnerGifter(mod) {
	const command = mod.command;
	const config = require('./config.json');
	const gifts = require('./gifts');
	
    let	enabled = true,
		minEnergy = 80,
		notice = false;
		
	let	myGameId = null,
		giftList = gifts,
		partnerDbid = null,
		partnerId = null,
		findId = false,
		onCd = false,
		isGifting = false;
	
	for (let i = 0; i < giftList.length; i++) {
		giftList[i].amount = 0;
	}
		
	command.add('partnergifter', {
        $none() {
            enabled = !enabled;
			command.message(`Partner Gifter Mod is now: ${enabled ? "enabled" : "disabled"}.`);
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
		partnerDbid = null;
		partnerId = null;
		findId = false;
		onCd = false;
		isGifting = false;
    });
	
	mod.hook('S_INVEN', 18, (event) => {
        if (!enabled) return;

        let invenItems = event.items;
        for (let i = 0; i < invenItems.length; i++) {
            for (let j = 0; j < giftList.length; j++) {
                if (giftList[j].id == invenItems[i].id) {
                    giftList[j].amount = invenItems[i].amount;
                }
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
	
    function giftPartner() {
        for (let i = 0; i < giftList.length; i++) {
            if (giftList[i].amount > 0) {
                giftList[i].amount--;
                onCd = true;
                setTimeout(()=>{ onCd = false; }, giftList[i].cd * 1000);
				isGifting = true;
                setTimeout(()=>{ isGifting = false; }, 250);
				useServantFeedItem(giftList[i]);
                if (notice) {
					command.message('Gifted ' + giftList[i].name + '! <font color="#00FFFF">' + giftList[i].amount + '</font> remaining.');
				}
                return;
            }
        }
        command.message('<font color="#FDD017">Warning</font>: No gift found in your inventory!');
    }
    
    function useServantFeedItem(gift) {
        mod.toServer('C_USE_SERVANT_FEED_ITEM', 1, {
            dbid: partnerDbid,
            id: gift.id,
            unk1: 0
        });
    }
	
	function processGifting(energy) {
		let partnerEnergyPercent = Math.round((energy/300)*1000)/10;
			
		if (partnerEnergyPercent < minEnergy && !onCd) {
			giftPartner();
		}
	}

	function loadConfig() {
        if (config) {
			({enabled, minEnergy, notice} = config)
        } else {
            command.message("Error: Unable to load config.json - Using default values for now");
        }
    }
}