const fs=require("fs");let h=fs.readFileSync("index.html","utf8");h=h.replace("modal-overlay open","modal-overlay");fs.writeFileSync("index.html",h,"utf8");console.log("Done");
