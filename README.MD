# partner-gifter
TERA-proxy module for TERA Online that automatically gives gift to your partner to keep them happy!

## Commands
List of in-game commands (use in /proxy or /8 channel):  
- `partnergifter` - Toggles module (default: true)
- `partnergifter notice` - Toggles notice (default: false)
- `partnergifter find` - Finds out the Item ID of the gift

## Installation
- Move files in `defs` into the `node_modules\tera-data\protocol\` folder
- Add opcodes for your region in the `node_modules\tera-data\map\` folder

## Notes
- If there are no opcodes for your region, get them yourself using https://github.com/SoliaRdi/PacketsLogger
- Modify the config file to customize settings
- Modify the gifts file to customize which gifts to use
- Module only works for gifting partners and not regular pets

## Opcodes for NA (protocol.353337.map)
S_UPDATE_SERVANT_INFO = 57591