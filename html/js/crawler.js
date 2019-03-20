const { ipcMain, dialog } = require('electron');
const Twitter = require('twitter');
const fs = require('fs');

let twConfig;

const stats = {
    crawl_count: 0,
    known_nodes: 0,
    out_degree: 0
};

ipcMain.on('config', function (e, conf) {
    twConfig = conf;
    return "cfgSet";
});

ipcMain.on('start-crawl', function (e, start_id) {
    console.log('recv start crawl!');
    crawl(start_id, (idl) => {
        console.debug("Crawl scheduler initiated: ");
        console.debug(idl);
        crawl_scheduler(idl);
    });
    return "ack";
});

function buildTwitterClient() {
    if(twConfig) {
        console.log("built the big twitter boi!");
        return new Twitter(twConfig);
    } else {
        console.error("Tried to build Twitter client, but had no config");
    }
}

let dataHold = {};

let alreadyCrawled = [];

function insertToData(dataHold, node1, node2) {
    if(dataHold.hasOwnProperty(node1)) {
        dataHold[node1].push(node2);
    } else {
        dataHold[node1] = [ node2 ];
    }
}

function crawl_scheduler(user_ids, new_crawls) {
    if(!new_crawls) new_crawls = [];
    crawl(user_ids.pop(), (idl) => {
        new_crawls.concat(idl);
        if(user_ids.length === 0) {
            setTimeout(crawl_scheduler, 60000, new_crawls.filter(t => !alreadyCrawled.contains(t)))
        }
    });
    if(user_ids.length > 0)
        setTimeout(crawl_scheduler, 60000, user_ids, new_crawls);
}

function crawl(user_id, cb) {
    console.debug("Crawly boi started on: ");
    console.debug(user_id);
    buildTwitterClient().get('friends/ids', {stringify_ids: true, user_id: user_id}, function(e, r) {
        if(e) {
            console.error(e);
            dialog.showErrorBox("Error", "Twitter said we made a bad API call. See console for error code");
        } else {
            alreadyCrawled.push(user_id);
            // collect ids and store them
            for(let outId of r.ids) {
                insertToData(dataHold, user_id, outId);
            }
            stats.crawl_count += 1;
            stats.known_nodes += r.ids.length;
            stats.out_degree = stats.known_nodes / stats.crawl_count;
            if(cb) {
                console.debug("Callback initiated.");
                global.mainWin.send('statusUpdate', stats);
                cb(r.ids);
            }
        }
    });
}

ipcMain.on('write-file', function() {
    let strRep = "firstEdge,secondEdge\n";
    for(let objKey in Object.keys(dataHold)) {
        if(dataHold.hasOwnProperty(objKey)) {
            for (let set2 in dataHold[objKey]) {
                if(dataHold[objKey].hasOwnProperty(set2)) {
                    strRep += `${objKey},${set2}\n`;
                }
            }
        }
    }
    dialog.showSaveDialog(global.mainWin, {
        title: "Choose CSV Save Location"
    }, function (filename) {
        console.log(fs);
        fs.writeFile(filename, strRep, function (e2) {
            console.log(e2);
            if(e2) {
                dialog.showErrorBox("CSV Save Failed", e2.code);
            } else {
                dialog.showMessageBox(global.mainWin, {
                    type: "info",
                    title: "CSV Saved",
                    message: "The CSV was successfully saved!"
                });
            }
        });
    });
});