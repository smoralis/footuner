//Crb

const crb2mtag_bat = fb.ProfilePath + "themes\\footuner\\bin\\crb2mtag.bat";
const radio_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\radio.png";

let crb_servers = ['https://de1.api.radio-browser.info/', 'https://fr1.api.radio-browser.info/', 'https://nl1.api.radio-browser.info/'];
let crb_server = window.GetProperty('crb_server', 0);
let crb_countries_file = fb.ProfilePath + 'themes\\footuner\\crb_countries.json';
let crb_tags_file = fb.ProfilePath + 'themes\\footuner\\crb_tags.json';
let crb_stats_file = fb.ProfilePath + 'themes\\footuner\\crb_stats.json';
let crb_back;
let crb_selection;
let crb_name = [];
let crb_url_resolved = [];
let crb_stationuuid = [];
let crb_clickcount = [];
let crb_image = [];
let crb_country = [];
let crb_language = [];
let crb_tags = [];


function crb_main_menu() {

    statustext = "CRB Main Menu....  ";
    window.NotifyOthers("tunein", statustext);
    let _menu = window.CreatePopupMenu();
    let _csubmenu = window.CreatePopupMenu();
    let _tsubmenu = window.CreatePopupMenu();
    let _submenu = window.CreatePopupMenu();

    _menu.AppendMenuItem(MF_GRAYED, 0, "CRB Main Menu");
    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_STRING, 1, "Search by Name");
    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_STRING, 2, "Stations by recently changed/added");
    _menu.AppendMenuItem(MF_STRING, 3, "Stations by clicks");
    _menu.AppendMenuItem(MF_STRING, 4, "Stations by votes");
    _menu.AppendMenuItem(MF_STRING, 5, "Stations by recent click");
    _menu.AppendMenuSeparator();
    _csubmenu.AppendTo(_menu, MF_STRING, "Search by Country");
    _tsubmenu.AppendTo(_menu, MF_STRING, "Search by Tag");

    let json_data = _jsonParse(utils.ReadTextFile(crb_countries_file));
    let items = json_data.length;

    let index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let results_countries_idx = [];
    idz = -1;

    _csubmenu.AppendMenuItem(MF_STRING, 999, "Input Country...");
    _csubmenu.AppendMenuSeparator();

    for (let i = 0; i < index.length; i++) {
        let submenuname = "_subletter" + i;
        submenuname = window.CreatePopupMenu();
        submenuname.AppendTo(_csubmenu, MF_STRING, index[i]);
        let letter = index[i].toString();
        submenuname.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, i + 10000, letter);
        submenuname.AppendMenuSeparator();
        let q = -1;
        let n;

        for (let j = 0; j < json_data.length; j++) {
            if (json_data[j].name.substr(0).indexOf(letter) == 0) {
                idz++;
                submenuname.AppendMenuItem(MF_STRING, idz + 1000, json_data[j].name);
                results_countries_idx.push(json_data[j].name);
            }
        }
    }

    json_data = _jsonParse(utils.ReadTextFile(crb_tags_file));
    items = json_data.length;

    index = '#1234567890abcdefghijklmnopqrstuvwxyz'.split('');
    let results_tags_idx = [];
    idz = -1;

    _tsubmenu.AppendMenuItem(MF_STRING, 1999, "Input Tag...");
    _tsubmenu.AppendMenuSeparator();
    for (let i = 0; i < index.length; i++) {
        let submenuname = "_subletter" + i;
        submenuname = window.CreatePopupMenu();
        submenuname.AppendTo(_tsubmenu, MF_STRING, index[i]);
        let letter = index[i].toString();
        submenuname.AppendMenuItem(MF_GRAYED, i + 10000, letter);
        submenuname.AppendMenuSeparator();

        for (let j = 0; j < json_data.length; j++) {
            if (json_data[j].name.substr(0).indexOf(letter) == 0) {
                idz++;
                submenuname.AppendMenuItem(MF_STRING, idz + 2000, json_data[j].name + ' (' + json_data[j].stationcount + ')');
                results_tags_idx.push(json_data[j].name);
            }
        }
    }
    _menu.AppendMenuSeparator();
    _submenu.AppendTo(_menu, MF_STRING, "CRB Server");
    _.forEach(crb_servers, (item, i) => {
        _submenu.AppendMenuItem(MF_STRING, i + 100, item);
    });
    _submenu.CheckMenuRadioItem(100, 102, crb_server + 100);

    _menu.AppendMenuSeparator();

    json_data = _jsonParse(utils.ReadTextFile(crb_stats_file));
    _menu.AppendMenuItem(MF_GRAYED, 0, "Total Stations: " + json_data.stations);
    _menu.AppendMenuSeparator();

    _menu.AppendMenuItem(MF_STRING, 0, "<< Close Menu >>");

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
            crb_selection = crb_servers[crb_server] + 'json/stations/search?name=' + encodeURIComponent(s_input) + "&order=name";
            crb_back = crb_selection;
            crb_process_menu(crb_selection, s_input);
        } catch (e) {
            statustext = "Search Canceled.";
            window.NotifyOthers("tunein", statustext);
            let n_timer = setTimeout(() => {
                    statustext = "Idle.";
                    window.NotifyOthers("tunein", statustext);
                }, 2000);
        }
        break;
    case idx == 2:
        statustext = "Stations by recently changed/added";
        window.NotifyOthers("tunein", statustext);
        crb_selection = crb_servers[crb_server] + 'json/stations/lastchange/500';
        crb_back = crb_selection;
        crb_process_menu(crb_selection, statustext);
        break;
    case idx == 3:
        statustext = "Stations by clicks";
        window.NotifyOthers("tunein", statustext);
        crb_selection = crb_servers[crb_server] + 'json/stations/topclick/500';
        crb_back = crb_selection;
        crb_process_menu(crb_selection, statustext);
        break;
    case idx == 4:
        statustext = "Stations by votes";
        window.NotifyOthers("tunein", statustext);
        crb_selection = crb_servers[crb_server] + 'json/stations/topvote/500';
        crb_back = crb_selection;
        crb_process_menu(crb_selection, statustext);
        break;
    case idx == 5:
        statustext = "Stations by recent click";
        window.NotifyOthers("tunein", statustext);
        crb_selection = crb_servers[crb_server] + 'json/stations/lastclick/500';
        crb_back = crb_selection;
        crb_process_menu(crb_selection, statustext);
        break;
    case idx >= 100 && idx <= 102:
        crb_server = idx - 100;
        window.SetProperty("crb_server", idx - 100);
        statustext = "Server set to " + crb_servers[crb_server];
        window.NotifyOthers("tunein", statustext);
        let n_timer = setTimeout(() => {
                statustext = "Idle.";
                window.NotifyOthers("tunein", statustext);
            }, 2000);
        break;
    case idx == 999:
        let c_input = "";
        try {
            statustext = "Search Country - Waiting for input.";
            window.NotifyOthers("tunein", statustext);
            c_input = utils.InputBox(window.ID, "ENTER Country", "Search for Country", "", true);
            crb_selection = crb_servers[crb_server] + 'json/stations/search?country=' + encodeURIComponent(c_input) + "&order=name";
            crb_back = crb_selection;
            crb_process_menu(crb_selection, c_input);
        } catch (e) {
            statustext = "Search Canceled.";
            window.NotifyOthers("tunein", statustext);
            let n_timer = setTimeout(() => {
                    statustext = "Idle.";
                    window.NotifyOthers("tunein", statustext);
                }, 2000);
        }
        break;
    case idx >= 1000 && idx < 1999:
        crb_selection = crb_servers[crb_server] + 'json/stations/search?country=' + results_countries_idx[idx - 1000] + "&order=name";
        crb_back = crb_selection;
        crb_process_menu(crb_selection, results_countries_idx[idx - 1000]);
        break;
    case idx == 1999:
        let t_input = "";
        try {
            statustext = "Search Tag - Waiting for input.";
            window.NotifyOthers("tunein", statustext);
            t_input = utils.InputBox(window.ID, "ENTER Tag", "Search for Tag", "", true);
            crb_selection = crb_servers[crb_server] + 'json/stations/search?tag=' + encodeURIComponent(t_input) + "&order=name";
            crb_back = crb_selection;
            crb_process_menu(crb_selection, t_input);
        } catch (e) {
            statustext = "Search Canceled.";
            window.NotifyOthers("tunein", statustext);
            let n_timer = setTimeout(() => {
                    statustext = "Idle.";
                    window.NotifyOthers("tunein", statustext);
                }, 2000);
        }
        break;
    case idx >= 2000:
        crb_selection = crb_servers[crb_server] + 'json/stations/search?tag=' + results_tags_idx[idx - 2000] + "&order=name";
        crb_back = crb_selection;
        crb_process_menu(crb_selection, results_tags_idx[idx - 2000]);
        break;
    default:
        break;
    }
}

function crb_process_menu(selection, title) {
    statustext = "Building menu....  " + selection;
    window.NotifyOthers("tunein", statustext);
    xmlhttp.open('GET', selection);
    xmlhttp.setRequestHeader('User-Agent', "foobar2000/spider_monkey_panel_footuner");

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                statustext = "Menu of .... " + selection;
                window.NotifyOthers("tunein", statustext);
                let json_data = _jsonParse(xmlhttp.responseText);
                //console.log(json_data);
                let counter = 0;

                crb_name = [];
                crb_url_resolved = [];
                crb_stationuuid = [];
                crb_clickcount = [];
                crb_image = [];
                crb_country = [];
                crb_language = [];
                crb_tags = [];

                for (let i = 0; i < json_data.length; i++) {
                    crb_name.push(json_data[i].name.substring(0, 50));
                    crb_url_resolved.push(json_data[i].url_resolved);
                    crb_stationuuid.push(json_data[i].stationuuid);
                    crb_clickcount.push(json_data[i].clickcount);
                    crb_image.push(json_data[i].favicon);
                    crb_country.push(json_data[i].country);
                    crb_language.push(json_data[i].language);
                    crb_tags.push(json_data[i].tags);
                }

                let _menu = window.CreatePopupMenu();

                _menu.AppendMenuItem(MF_GRAYED, 0, (title ? title : "") + " (Total : " + crb_name.length + ")" + " 0+");
                _menu.AppendMenuSeparator();

                for (let i = 0; i < 100; i++) {
                    if (i < crb_name.length) {
                        let n = i / 35;
                        if ((n != Math.floor(n) == false) && (n != 0)) {
                            _menu.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, i + 9000, " (+)");
                            _menu.AppendMenuSeparator();
                        }
                        _menu.AppendMenuItem(ml_arr.includes(crb_stationuuid[i]) ? MF_STRING | MF_CHECKED : MF_STRING, i + 1, _menuEscape(crb_name[i]) + ' (' + crb_clickcount[i] + ')');
                    }
                }

                if (crb_name.length > 100) {
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
                    crb_process_menu_next_prev(counter, title);
                    break;
                default:
                    crb_count(crb_stationuuid[idx - 1]);
                    crb2mtag(crb_url_resolved[idx - 1], crb_name[idx - 1], crb_stationuuid[idx - 1], crb_image[idx - 1], crb_country[idx - 1], crb_language[idx - 1], crb_tags[idx - 1]);
                    break;
                }
            }
        }
    }
    xmlhttp.send("");
}

function crb_process_menu_next_prev(counter, title) {
    let _pmenu = window.CreatePopupMenu();

    _pmenu.AppendMenuItem(MF_GRAYED, 0, (title ? title : "") + " (Total : " + crb_name.length + ") " + (counter * 100) + '+');
    _pmenu.AppendMenuSeparator();

    let x;

    for (let i = (counter * 100); i < (counter * 100) + 100; i++) {
        x = i;
        if (i < crb_name.length) {
            let n = (i - (counter * 100)) / 35;
            if ((n != Math.floor(n) == false) && (n != 0)) {
                _pmenu.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, i + 9000, " (+)");
                _pmenu.AppendMenuSeparator();
            }
            _pmenu.AppendMenuItem(ml_arr.includes(crb_stationuuid[i]) ? MF_STRING | MF_CHECKED : MF_STRING, i + 1, _menuEscape(crb_name[i]) + ' (' + crb_clickcount[i] + ')');
        }
    }

    if (crb_name.length > x) {
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
        crb_process_menu_next_prev(counter, title);
        break;
    case 10001:
        statustext = "Previous 100 stations";
        window.NotifyOthers("tunein", statustext);
        crb_process_menu_next_prev(counter - 1, title);
        break;
    default:
        crb_count(crb_stationuuid[idx - 1]);
        crb2mtag(crb_url_resolved[idx - 1], crb_name[idx - 1], crb_stationuuid[idx - 1], crb_image[idx - 1], crb_country[idx - 1], crb_language[idx - 1], crb_tags[idx - 1]);
        break;
    }
}

function crb_count(stationuuid) {
    let xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    let selection = crb_servers[crb_server] + 'json/url/' + stationuuid;
    xmlhttp.open('GET', selection);
    xmlhttp.setRequestHeader('User-Agent', "foobar2000/spider_monkey_panel_footuner");
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                console.log(xmlhttp.responseText);
            }
        }
    }
    xmlhttp.send("");
}

function crb_countries_get() {
    let xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    let selection = crb_servers[crb_server] + '/json/countries';
    xmlhttp.open('GET', selection);
    xmlhttp.setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                let json_data = _jsonParse(xmlhttp.responseText);
                utils.WriteTextFile(crb_countries_file, JSON.stringify(json_data, null, 2));
            }
        }
    }
    xmlhttp.send("");
}

function crb_tags_get() {
    let xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    let selection = crb_servers[crb_server] + '/json/tags';
    xmlhttp.open('GET', selection);
    xmlhttp.setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                let json_data = _jsonParse(xmlhttp.responseText);
                utils.WriteTextFile(crb_tags_file, JSON.stringify(json_data, null, 2));
            }
        }
    }
    xmlhttp.send("");
}

function crb_stats_get() {
    let xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    let selection = crb_servers[crb_server] + '/json/stats';
    xmlhttp.open('GET', selection);
    xmlhttp.setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                let json_data = _jsonParse(xmlhttp.responseText);
                utils.WriteTextFile(crb_stats_file, JSON.stringify(json_data, null, 2));
            }
        }
    }
    xmlhttp.send("");
}


function crb2mtag(url, name, stationid, logo, country, language, tags) {
    statustext = "Trying... " + url;
    window.NotifyOthers("tunein", statustext);
    let response;
    let stream_name_ffprobe;
    let streamid = ('0000000000' + crc32(url)).slice(-10);
    let tempfilename = temp_folder + "!temp.tags";
    let clean_name;

    utils.WriteTextFile(tempfilename, "");

    let cmd = "\"" + crb2mtag_bat + "\"" + " " + "\"" + url + "\"" + " " + "\"" + tempfilename + "\"" + " " + streamid + " \"" + ffprobe_exe + "\" \"" + jq_exe + "\"" + " " + "\"" + _batEscape(name) + "\"" + " " + stationid;
    console.log(window.Name + " : " + cmd);
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
        statustext = "Processing... " + url;
        window.NotifyOthers("tunein", statustext);
        if (name) {
            clean_name = _fbSanitise(name);
        } else if (stream_name_ffprobe) {
            clean_name = _fbSanitise(stream_name_ffprobe);
        } else
            clean_name = "Unknown";

        let folder = mtags_folder + clean_name + " - " + streamid + "\\";
        if (!fso.FolderExists(folder))
            fso.CreateFolder(folder);

        let filename_info_json = folder + _fbSanitise(name) + " - " + streamid + ".info.json";

        let info = "{\"body\": [{\"name\": \"" + clean_name + "\"";
        if (country)
            info += ",\"location\": \"" + country + "\"";
        if (language)
            info += ",\"language\":\"" + language + "\"";
        if (tags)
            info += ",\"genre_name\":\"" + tags + "\"";
        info += "}]}";
        utils.WriteTextFile(filename_info_json, info);

        let imagefile = folder + _fbSanitise(clean_name) + " - " + streamid;
        let logoext = logo.split('?')[0];
        logoext = logoext.split('.').pop();

        cmd = "cscript //nologo \"" + download_vbs + "\" \"" + logo + "\" \"" + imagefile + "." + logoext + "\"";
        WshShell.Run(cmd, 0, true);

        let filename = folder + clean_name + " - " + streamid + ".tags";
        let mtag = utils.ReadTextFile(tempfilename);

        utils.WriteTextFile(filename, he.decode(mtag));

        fso.DeleteFile(tempfilename);

        cmd = "\"" + fb.FoobarPath + "foobar2000.exe" + "\"" + " /run_main:\"View/Switch to playlist/New Stations\" /add /immediate " + "\"" + filename + "\"";
        WshShell.Run(cmd, 0, true);

    } else {
        fso.DeleteFile(tempfilename);
        console.log(window.Name + " : " + "Unable to create mtag");
        statustext = "Unable to create mtag ";
        window.NotifyOthers("tunein", statustext);
    }
    statustext = "Idle.";
    window.NotifyOthers("mtagger", statustext);
}

if (_isFile(crb_countries_file) == false || _fileExpired(crb_countries_file, ONE_DAY))
    crb_countries_get();

if (_isFile(crb_tags_file) == false || _fileExpired(crb_tags_file, ONE_DAY))
    crb_tags_get();

if (_isFile(crb_stats_file) == false || _fileExpired(crb_stats_file, ONE_DAY))
    crb_stats_get();