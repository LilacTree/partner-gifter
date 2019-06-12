# partner-gifter
TERA-proxy module for TERA Online that automatically gives gift to your partner to keep them happy!

## Commands
List of in-game commands (use in /proxy or /8 channel):  
- `partnergifter` - Toggles module (default: true)
- `partnergifter notice` - Toggles notice (default: false)
- `partnergifter find` - Finds out the Item ID of the gift

## Installation
- Move files in `defs` into `node_modules\tera-data\protocol\` folder

## Notes
- If there are no opcodes for your region, get them yourself using https://github.com/SoliaRdi/PacketsLogger
- Modify the config file to customize settings
- Modify the gifts file to customize which gifts to use

## Opcodes for NA (protocol.350027.map)
C_USE_SERVANT_FEED_ITEM = 37999  
S_UPDATE_SERVANT_INFO = 54224