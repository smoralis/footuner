//Live365

const live3652mtag_bat = fb.ProfilePath + "themes\\footuner\\bin\\live3652mtag.bat";
const live365_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\live365.png";

let live365_stations_results = [];

function live365_main_menu() {
    statustext = "Live365 Main Menu....  ";
    window.NotifyOthers("tunein", statustext);

    let selection = 'https://api.live365.com/v2/genres';
    xmlhttp.open('GET', selection);
    xmlhttp.setRequestHeader('User-Agent', "foobar2000");
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                let json_data = _jsonParse(xmlhttp.responseText);
                let items = json_data.length;

                let subgenres_id_arr = [];
                let subgenres_names_arr = [];

                let _menu = window.CreatePopupMenu();

                _menu.AppendMenuItem(MF_GRAYED, 0, "Live365 Main Menu");
                _menu.AppendMenuSeparator();
                _menu.AppendMenuItem(MF_STRING, 10000, "Search by Name");
                _menu.AppendMenuSeparator();

                let count = 0;
                for (let i = 0; i < json_data.length; i++) {
                    count += json_data[i]['playing-stations-count'];
                    let subgenrename = "_genre" + i;
                    subgenrename = window.CreatePopupMenu();
                    subgenrename.AppendTo(_menu, MF_STRING, json_data[i].name + " (" + json_data[i]['playing-stations-count'] + ")");
                    for (let j = 0; j < json_data[i]['sub-genres'].length; j++) {
                        subgenrename.AppendMenuItem(MF_STRING, json_data[i]['sub-genres'][j].id, json_data[i]['sub-genres'][j].name + " (" + json_data[i]['sub-genres'][j]['playing-stations-count'] + ")");
                        subgenres_id_arr.push(json_data[i]['sub-genres'][j].id);
                        subgenres_names_arr.push(json_data[i]['sub-genres'][j].name);
                    }
                }

                _menu.AppendMenuSeparator();
                _menu.AppendMenuItem(MF_GRAYED, 0, "Stations Count: " + count);
                _menu.AppendMenuSeparator();
                _menu.AppendMenuItem(MF_STRING, 0, "<< Close Menu >>");

                let idx = _menu.TrackPopupMenu(0, bs);

                switch (true) {
                case idx == 0:
                    statustext = "Idle.";
                    window.NotifyOthers("tunein", statustext);
                    break;
                case idx == 10000:
                    let n_input = "";
                    try {
                        statustext = "Search Name - Waiting for input.";
                        window.NotifyOthers("tunein", statustext);
                        n_input = utils.InputBox(window.ID, "ENTER Name", "Search for Name", "", true);
                        let selection = 'https://api.live365.com/v2/search';
                        data = {
                            "title": n_input
                        };
                        xmlhttp.open('POST', selection);
                        xmlhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
                        xmlhttp.setRequestHeader('User-Agent', 'foobar2000');
                        xmlhttp.onreadystatechange = () => {
                            if (xmlhttp.readyState == 4) {
                                if (xmlhttp.status == 200) {
                                    live365_process_menu(xmlhttp.responseText, n_input);
                                }
                            }
                        }
                        xmlhttp.send(JSON.stringify(data));
                    } catch (e) {
                        statustext = "Search Canceled.";
                        window.NotifyOthers("tunein", statustext);
                    }

                    break;
                default:
                    statustext = "Building menu....  ";
                    window.NotifyOthers("tunein", statustext);
                    let selection = 'https://api.live365.com/v2/search';
                    data = {
                        "genres": [idx]
                    };
                    xmlhttp.open('POST', selection);
                    xmlhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
                    xmlhttp.setRequestHeader('User-Agent', 'foobar2000');
                    xmlhttp.onreadystatechange = () => {
                        if (xmlhttp.readyState == 4) {
                            if (xmlhttp.status == 200) {
                                live365_process_menu(xmlhttp.responseText, subgenres_names_arr[subgenres_id_arr.indexOf(idx)]);
                            }
                        }
                    }
                    xmlhttp.send(JSON.stringify(data));
                    break;
                }
            }
        }
    }
    xmlhttp.send("");
}

function live365_process_menu(selection, title) {
    let json_data = _jsonParse(selection);

    let counter = 0;

    live365_stations_results = [];

    for (let i = 0; i < json_data.length; i++) {

        station_genres = [];
        for (let j = 0; j < json_data[i]['genres'].length; j++) {
            station_genres.push(json_data[i]['genres'][j]['name']);
        }

        live365_stations_results.push({
            name: json_data[i]['station-name'].substring(0, 50),
            url: json_data[i]['stream_urls'][0]['url'],
            mount_id: json_data[i]['mount-id'],
            logo: json_data[i]['logo'],
            description: json_data[i]['description'],
            genres: station_genres.join(),
        });
    }

    let _menu = window.CreatePopupMenu();

    _menu.AppendMenuItem(MF_GRAYED, 0, (title ? title : "") + " (Total : " + live365_stations_results.length + ")" + " 0+");
    _menu.AppendMenuSeparator();

    for (let i = 0; i < 100; i++) {
        if (i < live365_stations_results.length) {
            let n = i / 35;
            if ((n != Math.floor(n) == false) && (n != 0)) {
                _menu.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, i + 9000, " (+)");
                _menu.AppendMenuSeparator();
            }
            _menu.AppendMenuItem(ml_arr.includes(live365_stations_results[i].mount_id) ? MF_STRING | MF_CHECKED : MF_STRING, i + 1, _menuEscape(live365_stations_results[i].name));
        }
    }

    if (live365_stations_results.length > 100) {
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
        live365_process_menu_next_prev(counter, title);
        break;
    default:
        live3652mtag(live365_stations_results[idx - 1]);
        break;
    }
}

function live365_process_menu_next_prev(counter, title) {
    let _pmenu = window.CreatePopupMenu();

    _pmenu.AppendMenuItem(MF_GRAYED, 0, (title ? title : "") + " (Total : " + live365_stations_results.length + ") " + (counter * 100) + '+');
    _pmenu.AppendMenuSeparator();

    let x;

    for (let i = (counter * 100); i < (counter * 100) + 100; i++) {
        x = i;

        if (i < live365_stations_results.length) {
            let n = (i - (counter * 100)) / 35;
            if ((n != Math.floor(n) == false) && (n != 0)) {
                _pmenu.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, i + 9000, " (+)");
                _pmenu.AppendMenuSeparator();
            }
            _pmenu.AppendMenuItem(ml_arr.includes(live365_stations_results[i].mount_id) ? MF_STRING | MF_CHECKED : MF_STRING, i + 1, _menuEscape(live365_stations_results[i].name));
        }
    }

    if (live365_name.length > x) {
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
        live365_process_menu_next_prev(counter, title);
        break;
    case 10001:
        statustext = "Previous 100 stations";
        window.NotifyOthers("tunein", statustext);
        live365_process_menu_next_prev(counter - 1, title);
        break;
    default:
        live3652mtag(live365_stations_results[idx - 1]);
        break;
    }
}

function live3652mtag(station) {
    statustext = "Trying... " + station.url;
    window.NotifyOthers("tunein", statustext);
    let response;
    let stream_name_ffprobe;
    let streamid = ('0000000000' + crc32(station.url)).slice(-10);
    let tempfilename = temp_folder + "!temp.tags";
    let clean_name;

    utils.WriteTextFile(tempfilename, "");

    let cmd = "\"" + live3652mtag_bat + "\"" + " " + "\"" + station.url + "\"" + " " + "\"" + tempfilename + "\"" + " " + streamid + " \"" + ffprobe_exe + "\" \"" + jq_exe + "\"" + " " + "\"" + _batEscape(station.name) + "\"" + " " + station.mount_id;
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
        statustext = "Processing... " + station.url;
        window.NotifyOthers("tunein", statustext);
        if (station.name) {
            clean_name = _fbSanitise(station.name);
        } else if (stream_name_ffprobe) {
            clean_name = _fbSanitise(stream_name_ffprobe);
        } else
            clean_name = "Unknown";

        let folder = mtags_folder + clean_name + " - " + streamid + "\\";
        if (!fso.FolderExists(folder))
            fso.CreateFolder(folder);

        let filename_info_json = folder + _fbSanitise(station.name) + " - " + streamid + ".info.json";

        let info = "{\"body\": [{\"name\": \"" + clean_name + "\"";
        if (station.description)
            info += ",\"description\": \"" + station.description.replace(/[\r\n]+/gm, "").replace(/\"/g, "''") + "\"";
        if (station.genres)
            info += ",\"genre_name\":\"" + station.genres + "\"";
        info += "}]}";
        utils.WriteTextFile(filename_info_json, info);

        let imagefile = folder + _fbSanitise(clean_name) + " - " + streamid;
        let logoext = station.logo.split('?')[0];
        logoext = logoext.split('.').pop();

        cmd = "cscript //nologo \"" + download_vbs + "\" \"" + station.logo + "\" \"" + imagefile + "." + logoext + "\"";
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
        return;
    }
    statustext = "Idle.";
    window.NotifyOthers("mtagger", statustext);
}
