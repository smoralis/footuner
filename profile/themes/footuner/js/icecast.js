//Icecast

const icecast_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\icecast.png";
const url2mtag_bat = "\"" + fb.ProfilePath + 'themes\\footuner\\bin\\url2mtag.bat' + "\"";

let icecast_xml = fb.ProfilePath + 'themes\\footuner\\yp.xml';
let ic_stations = fb.ProfilePath + 'themes\\footuner\\ic_stations.json';
let xidel_exe = fb.ProfilePath + "themes\\footuner\\bin\\xidel.exe";
let ypxml2json_bat = fb.ProfilePath + "themes\\footuner\\bin\\ypxml2json.bat";

let ic_stations_results = [];

if (_isFile(icecast_xml) == false || _fileExpired(icecast_xml, ONE_DAY)) {
    icecast_yp_get();
}

function icecast_yp_get() {
    let request = new ActiveXObject("Microsoft.XMLHTTP");
    request.open("GET", "http://dir.xiph.org/yp.xml", true);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status == 200 || request.status == 0) {
                utils.WriteTextFile(icecast_xml, request.responseText);

                let cmd = "\"" + ypxml2json_bat + "\"" + " " + "\"" + xidel_exe + "\"" + " " + "\"" + icecast_xml + "\"" + " " + "\"" + ic_stations + "\"";
                WshShell.Run(cmd, 0, false);
            }
        }
    }
    request.send();
}

function icecast_main_menu() {
    if (_isFile(ic_stations) == false) {
        statustext = "Icecast Directory Not Downloaded, try again later...";
        window.NotifyOthers("tunein", statustext);
        return;
    }
    let json_data = _jsonParse(utils.ReadTextFile(ic_stations));
    let ic_stations_j = _jsonParse(JSON.stringify(json_data[0]));
    let items = ic_stations_j.length;

    let _menu = window.CreatePopupMenu();

    _menu.AppendMenuItem(MF_GRAYED, 0, "Icecast Main Menu");
    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_STRING, 1, "Search by Name");
    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_STRING, 2, "Search by Genre");
    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_STRING, 3, "Add a Random Station");
    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_GRAYED, 0, "Total Stations: " + items);
    _menu.AppendMenuSeparator();

    _menu.AppendMenuItem(MF_STRING, 0, "<< Close Menu >>");

    window.SetCursor(32649);

    let idx = _menu.TrackPopupMenu(0, bs);

    switch (true) {
    case idx == 0:
        statustext = "Idle.";
        window.NotifyOthers("tunein", statustext);
        break;
    case idx == 1:
        let s_input = "";
        try {
            statustext = "Search Station - Waiting for input.";
            window.NotifyOthers("tunein", statustext);
            s_input = utils.InputBox(window.ID, "ENTER Station name", "Search for Stations", "", true);
            ic_process_menu(s_input, s_input, "n");
        } catch (e) {
            statustext = "Search Canceled.";
            window.NotifyOthers("tunein", statustext);
        }
        break;
    case idx == 2:
        let g_input = "";
        try {
            statustext = "Search Station - Waiting for input.";
            window.NotifyOthers("tunein", statustext);
            g_input = utils.InputBox(window.ID, "ENTER Station genre", "Search for Stations", "", true);
            ic_process_menu(g_input, g_input, "g");
        } catch (e) {
            statustext = "Search Canceled.";
            window.NotifyOthers("tunein", statustext);
        }
        break;
    case idx == 3:
        let json_data = _jsonParse(utils.ReadTextFile(ic_stations));
        let ic_stations_j = _jsonParse(JSON.stringify(json_data[0]));
        let items = ic_stations_j.length;

        ic2mtag(ic_stations_j[Math.floor(Math.random() * (items - 0))].url);

        break;
    default:
        break;
    }
}

function ic_process_menu(selection, title, method) {
    statustext = "Building menu....  " + selection;
    window.NotifyOthers("tunein", statustext);

    ic_stations_results = [];

    let json_data = _jsonParse(utils.ReadTextFile(ic_stations));
    let ic_stations_j = _jsonParse(JSON.stringify(json_data[0]));
    let items = ic_stations_j.length;

    let counter = 0;

    let regex_match = new RegExp(selection, "i");

    for (let i = 0; i < items; i++) {
        if (method == "n" && ic_stations_j[i].name.match(regex_match)) {
            ic_stations_results.push({
                name: ic_stations_j[i].name.substring(0, 50),
                url: ic_stations_j[i].url,
                type: ic_stations_j[i].type,
                bitrate: ic_stations_j[i].bitrate,
                genre: ic_stations_j[i].genre
            });
        }
        if (method == "g" && ic_stations_j[i].genre.match(regex_match)) {
            ic_stations_results.push({
                name: ic_stations_j[i].name,
                url: ic_stations_j[i].url,
                type: ic_stations_j[i].type,
                bitrate: ic_stations_j[i].bitrate,
                genre: ic_stations_j[i].genre
            });
        }
    }

    let _menu = window.CreatePopupMenu();

    _menu.AppendMenuItem(MF_GRAYED, 0, (title ? title : "") + " (Total : " + ic_stations_results.length + ")" + " 0+");
    _menu.AppendMenuSeparator();

    for (let i = 0; i < 100; i++) {
        if (i < ic_stations_results.length) {
            let n = i / 35;
            if ((n != Math.floor(n) == false) && (n != 0)) {
                _menu.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, i + 9000, " (+)");
                _menu.AppendMenuSeparator();
            }
            _menu.AppendMenuItem(ml_arr.includes(('0000000000' + crc32(ic_stations_results[i].url)).slice(-10)) ? MF_STRING | MF_CHECKED : MF_STRING, i + 1, _menuEscape(ic_stations_results[i].name + " [" + ic_stations_results[i].bitrate + " " + ic_stations_results[i].type.split('/').pop() + "]"));
        }
    }

    if (ic_stations_results.length > 100) {
        _menu.AppendMenuSeparator();
        _menu.AppendMenuItem(MF_STRING, 10000, 'Next 100 stations');
    }

    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_STRING, 0, "<< Close Menu >>");

    window.SetCursor(32649);

    let idx = _menu.TrackPopupMenu(0, bs);

    switch (idx) {

    case 0:
        statustext = "Idle.";
        window.NotifyOthers("tunein", statustext);
        break;
    case 10000:
        statustext = "Next 100 stations";
        window.NotifyOthers("tunein", statustext);
        counter++;
        ic_process_menu_next_prev(counter, title);
        break;
    default:
        ic2mtag(ic_stations_results[idx - 1].url);
        break;
    }
}

function ic_process_menu_next_prev(counter, title) {
    let _pmenu = window.CreatePopupMenu();
    console.log("xx");
    _pmenu.AppendMenuItem(MF_GRAYED, 0, (title ? title : "") + " (Total : " + ic_stations_results.length + ") " + (counter * 100) + '+');
    _pmenu.AppendMenuSeparator();

    let x;

    for (let i = (counter * 100); i < (counter * 100) + 100; i++) {
        x = i;
        if (i < ic_stations_results.length) {
            let n = (i - (counter * 100)) / 35;
            if ((n != Math.floor(n) == false) && (n != 0)) {
                _pmenu.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, i + 9000, " (+)");
                _pmenu.AppendMenuSeparator();
            }
            _pmenu.AppendMenuItem(ml_arr.includes(('0000000000' + crc32(ic_stations_results[i].url)).slice(-10)) ? MF_STRING | MF_CHECKED : MF_STRING, i + 1, _menuEscape(ic_stations_results[i].name + " [" + ic_stations_results[i].bitrate + " " + ic_stations_results[i].type.split('/').pop() + "]"));
        }
    }

    if (ic_stations_results.length > x) {
        _pmenu.AppendMenuSeparator();
        _pmenu.AppendMenuItem(MF_STRING, 10000, 'Next 100 stations');

    }
    if (counter != 0) {
        _pmenu.AppendMenuSeparator();
        _pmenu.AppendMenuItem(MF_STRING, 10001, 'Previous 100 stations');
    }

    _pmenu.AppendMenuSeparator();
    _pmenu.AppendMenuItem(MF_STRING, 0, "<< Close Menu >>");

    window.SetCursor(32649);

    let idx = _pmenu.TrackPopupMenu(0, bs);

    switch (idx) {

    case 0:
        statustext = "Idle.";
        window.NotifyOthers("tunein", statustext);
        break;
    case 10000:
        statustext = "Next 100 stations";
        window.NotifyOthers("tunein", statustext);
        counter++;
        ic_process_menu_next_prev(counter, title);
        break;
    case 10001:
        statustext = "Previous 100 stations";
        window.NotifyOthers("tunein", statustext);
        ic_process_menu_next_prev(counter - 1, title);
        break;
    default:
        ic2mtag(ic_stations_results[idx - 1].url);
        break;
    }
}

function ic2mtag(url) {
    statustext = "Processing... " + url;
    window.NotifyOthers("tunein", statustext);

    let response;
    let stream_name_ffprobe;
    let clean_name;

    let streamid = ('0000000000' + crc32(url)).slice(-10);
    let tempfilename = temp_folder + "!temp.tags";

    utils.WriteTextFile(tempfilename, "");

    let cmd = url2mtag_bat + " " + "\"" + url + "\"" + " " + "\"" + tempfilename + "\"" + " " + streamid + " \"" + ffprobe_exe + "\" \"" + jq_exe + "\"";
    console.log(cmd);
    WshShell.Run(cmd, 0, true);

    try {
        let temptagarray = utils.ReadTextFile(tempfilename);
        let json_data = _jsonParse(temptagarray);
        json_data = json_data[0];
        response = json_data["@"];
        stream_name_ffprobe = json_data["STREAM_FFPROBE_NAME"];
    } catch (err) {
        console.log(window.Name + " : " + err);
    }

    if (response) {
        statustext = "Processing " + url;
        window.NotifyOthers("tunein", statustext);

        if (!stream_name_ffprobe) {
            clean_name = "Unknown"
        } else {
            clean_name = _fbSanitise(stream_name_ffprobe);
        }

        let folder = mtags_folder + clean_name + " - " + streamid + "\\";
        if (!fso.FolderExists(folder))
            fso.CreateFolder(folder);
        let filename = folder + clean_name + " - " + streamid + ".tags";
        let mtag = utils.ReadTextFile(tempfilename);
        utils.WriteTextFile(filename, he.decode(mtag));
        fso.DeleteFile(tempfilename);
        let cmd = "\"" + fb.FoobarPath + "foobar2000.exe" + "\"" + " /run_main:\"View/Switch to playlist/New Stations\" /add /immediate " + "\"" + filename + "\"";
        WshShell.Run(cmd, 0, true);
    } else {
        fso.DeleteFile(tempfilename);
    }
    statustext = "Idle.";
    window.NotifyOthers("mtagger", statustext);
}
