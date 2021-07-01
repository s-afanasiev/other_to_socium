const fs = require('fs');
const SMART_DATA  = require("../project_data_smart_original.js").categories;
fs.writeFileSync("rejsoned_smart_structure.json", JSON.stringify(SMART_DATA, null, 2));