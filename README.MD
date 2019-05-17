# partner-gifter
TERA-proxy module for TERA Online. Automatically give gift to your partner and keep them happy!  
#partner #companion #pet #pet-feeder

## Command
List of in-game commands (use in /proxy or /8 channel):  
- `partnergifter` - toggles module (default: true)
- `partnergifter notice` - toggles notice (default: false)
- `partnergifter find` - finds out the item id of the gift

## Installation
- Move files in `defs` into `node_modules\tera-data\protocol\` folder
- Move files in `opcodes` into `node_modules\tera-data\map\` folder

## Notes
- If there are no opcodes for your region, get them yourself using https://github.com/SoliaRdi/PacketsLogger
- Modify the config file to customize settings
- Modify the gifts file to customize which gifts to use
