//Tunein

const userdata_folder = fb.FoobarPath + "user-data\\";

if (!fso.FolderExists(userdata_folder))
    fso.CreateFolder(userdata_folder);

const settings_file = userdata_folder + 'settings.ini';
const tunein2mtag_bat = fb.ProfilePath + "themes\\footuner\\bin\\tunein2mtag.bat";
const tunein_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\tunein.png";

let urlreg = new RegExp("http*.://", "i");
let plsreg = new RegExp("File*.*=", "i");
let urltune = new RegExp("Tune.?ashx.?id", "i");
let urlbrowse = new RegExp("Browse.?ashx", "i");
let urltunepbrowse = new RegExp("Tune.?ashx.?c=pbrowse", "i");
let urlsearch = new RegExp("Search.?ashx", "i");
let tunein_genres_file = fb.ProfilePath + 'themes\\footuner\\tunein_genres.json';
let tunein_username = utils.ReadINI(settings_file, 'tunein', 'username');
let tunein_partnerid = "1";
let tunein_render = "&render=json";
let tunein_root = "http://opml.radiotime.com/Browse.ashx?";
let tunein_category_Music = tunein_root + "c=music&partnerId=" + tunein_partnerid + tunein_render;
let tunein_category_Talk = tunein_root + "c=talk" + "&partnerId=" + tunein_partnerid + tunein_render;
let tunein_category_Sports = tunein_root + "c=sports" + "&partnerId=" + tunein_partnerid + tunein_render;
let tunein_category_World = tunein_root + "c=world" + "&partnerId=" + tunein_partnerid + tunein_render;
let tunein_category_Popular = tunein_root + "c=popular" + "&partnerId=" + tunein_partnerid + tunein_render;
let tunein_category_Best = tunein_root + "c=best" + "&partnerId=" + tunein_partnerid + tunein_render;
let tunein_local = tunein_root + "c=local" + "&partnerId=" + tunein_partnerid + tunein_render;
let tunein_language = tunein_root + "c=lang" + "&partnerId=" + tunein_partnerid + tunein_render;
let station_input;
let artist_input;
let song_input;
let recommend_input;
let ti_back;
let ti_title;
let ti_selection;
let ti_logo;
let ti_guideid;
let ti_name;
let tuneinresults = [];
let urls2add = [];

function tunein_main_menu() {
    statustext = "Tunein Main Menu....  ";
    window.NotifyOthers("tunein", statustext);
    let _menu = window.CreatePopupMenu();
    let menu_items = ["Local", "Music", "Sports", "Talk", "Location", "Language", "Best", "Popular", "My Presets : " + tunein_username, "Genres", "Search Station", "Search Artist", "Search Song", "Recommended Stations", "Station's Recommendations"];
    _menu.AppendMenuItem(MF_GRAYED, 0, "Tunein Main Menu");
    _menu.AppendMenuSeparator();

    for (let i = 0; i < menu_items.length; i++) {

        _menu.AppendMenuItem(MF_STRING, i + 1, menu_items[i]);
        if ((i == 8) || (i == 9) || (i == 13))
            _menu.AppendMenuSeparator();
    }

    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_STRING, 100, "Tunein Username");
    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_STRING, 0, "<< Close Menu >>");

    let idx = _menu.TrackPopupMenu(0, bs);

    switch (idx) {
    case 0:
        statustext = "Idle.";
        window.NotifyOthers("tunein", statustext);
        break;
    case 1:
        ti_selection = tunein_local;
        ti_back = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    case 2:
        ti_selection = tunein_category_Music;
        ti_back = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    case 3:
        ti_selection = tunein_category_Sports;
        ti_back = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    case 4:
        ti_selection = tunein_category_Talk;
        ti_back = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    case 5:
        ti_selection = tunein_category_World;
        ti_back = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    case 6:
        ti_selection = tunein_language;
        ti_back = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    case 7:
        ti_selection = tunein_category_Best;
        ti_back = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    case 8:
        ti_selection = tunein_category_Popular;
        ti_back = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    case 9:
        let tunein_presets = tunein_root + "c=presets" + "&partnerId=" + tunein_partnerid + "&username=" + tunein_username + tunein_render;
        ti_selection = tunein_presets;
        ti_back = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    case 10:
        ti_back = "genre";
        tunein_process_genres();
        break;
    case 11:
        let station_input = "";
        try {
            statustext = "Search Station - Waiting for input.";
            window.NotifyOthers("tunein", statustext);
            station_input = utils.InputBox(window.ID, "ENTER Station name", "Search for Stations", "", true);
            ti_selection = "http://opml.radiotime.com/Search.ashx?query=" + encodeURIComponent(station_input) + "&types=station&partnerId=1" + tunein_render;
            ti_back = ti_selection;
            tunein_process_menu(ti_selection);
        } catch (e) {
            statustext = "Search Canceled.";
            window.NotifyOthers("tunein", statustext);
        }
        break;
    case 12:
        let artist_input = "";
        try {
            statustext = "Search Artist - Waiting for input.";
            window.NotifyOthers("tunein", statustext);
            artist_input = utils.InputBox(window.ID, "ENTER Artist name", "Search for Stations by Artist Name", "", true);
            ti_selection = "http://opml.radiotime.com/Search.ashx?c=artist&query=" + encodeURIComponent(artist_input) + "&partnerId=1" + tunein_render;
            ti_back = ti_selection;
            tunein_process_menu(ti_selection);
        } catch (e) {
            statustext = "Search Canceled.";
            window.NotifyOthers("tunein", statustext);
        }
        break;
    case 13:
        let song_input = "";
        try {
            statustext = "Search Song - Waiting for input.";
            window.NotifyOthers("tunein", statustext);
            song_input = utils.InputBox(window.ID, "ENTER Songs Title", "Search for Stations by Song Title", "", true);
            ti_selection = "http://opml.radiotime.com/Search.ashx?c=song&query=" + encodeURIComponent(song_input) + "&partnerId=1" + tunein_render;
            ti_back = ti_selection;
            tunein_process_menu(ti_selection);
        } catch (e) {
            statustext = "Search Canceled.";
            window.NotifyOthers("tunein", statustext);
        }
        break;
    case 14:
        let recommend_input = "";
        try {
            statustext = "Search for Recommended Stations - Waiting for input.";
            window.NotifyOthers("tunein", statustext);
            recommend_input = utils.InputBox(window.ID, "ENTER up to 10 Artists seperated by comma", "Search for Recommended Stations by List of Artists", "", true);
            recommend_input = recommend_input.split(",");
            let items = recommend_input.length;
            let artists_array = [];
            if (items <= 10) {
                for (let i = 0; i < items; i++) {
                    artists_array.push("&a[" + i + "]=" + encodeURIComponent(recommend_input[i]));
                }
                ti_selection = "http://opml.radiotime.com/Recommend.ashx?partnerId=1" + artists_array.join("") + tunein_render;
                ti_back = ti_selection;
                tunein_process_menu(ti_selection);
            } else {
                console.log(window.Name + " : " + "You entered more than 10 artists");
                fb.ShowPopupMessage("You entered more than 10 artists", "Input Error");
            }
        } catch (e) {
            statustext = "Search Canceled.";
            window.NotifyOthers("tunein", statustext);
        }
        break;
    case 15:
        let stream_tunein_id = fb.TitleFormat("[%stream_tunein_id%]").Eval();
        if (stream_tunein_id) {
            try {
                statustext = "Playing Station's Recommendations";
                ti_selection = "http://opml.radiotime.com/Browse.ashx?id=" + encodeURIComponent(stream_tunein_id) + "&partnerId=1" + tunein_render;
                ti_back = ti_selection;
                tunein_process_menu(ti_selection);
            } catch (e) {
                statustext = "Search Canceled.";
                window.NotifyOthers("tunein", statustext);
            }
        } else {
            statustext = "No Guide ID found";
            window.NotifyOthers("tunein", statustext);
        }
        break;
    case 100:
        let username_input = "";
        try {
            statustext = "Enter Tunein Username - Waiting for input.";
            window.NotifyOthers("tunein", statustext);
            username_input = utils.InputBox(window.ID, "Enter Tunein Username", "Tunein Username", tunein_username, true);
            tunein_username = username_input;
            utils.WriteINI(settings_file, 'tunein', 'username', username_input);
            statustext = "Idle.";
            window.NotifyOthers("tunein", statustext);
            window.NotifyOthers("tuneinp", "updated");
        } catch (e) {
            statustext = "Canceled.";
            window.NotifyOthers("tunein", statustext);
        }
        break;
    default:
        break;
    }
}

function tunein_genres_get() {
    let xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    let selection = "http://opml.radiotime.com/Describe.ashx?c=genres&partnerId=1&render=json";
    xmlhttp.open('GET', selection);
    xmlhttp.setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                let json_data = _jsonParse(xmlhttp.responseText);
                utils.WriteTextFile(tunein_genres_file, JSON.stringify(json_data, null, 2));
            }
        }
    }
    xmlhttp.send("");
}

function tunein_process_genres() {
    statustext = "Menu of .... Genres";
    window.NotifyOthers("tunein", statustext);
    let json_data = _jsonParse(utils.ReadTextFile(tunein_genres_file));
    let items = json_data.body.length;
    tuneinname = [];
    tuneinguideid = [];

    for (let i = 0; i < items; i++) {
        let namevalue = json_data.body[i].text;
        let guidevalue = json_data.body[i].guide_id;
        tuneinname.push(namevalue);
        tuneinguideid.push(guidevalue);
    }
    let _menu = window.CreatePopupMenu();
    let index = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let results_idx = [];
    let idz = 0;

    for (let i = 0; i < index.length; i++) {
        let submenuname = "_subletter" + i;
        submenuname = window.CreatePopupMenu();
        submenuname.AppendTo(_menu, MF_STRING, index[i]);
        let letter = index[i].toString();
        submenuname.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, i + 10000, letter);
        submenuname.AppendMenuSeparator();
        let q = -1;
        let n;

        for (let j = 0; j < tuneinname.length; j++) {
            if (tuneinname[j].substr(0).indexOf(letter) == 0) {
                idz++;
                q++;
                n = q / 35;
                if ((n != Math.floor(n) == false) && (n != 0)) {
                    submenuname.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, n + 11000, "(+)");
                    submenuname.AppendMenuSeparator();
                }
                submenuname.AppendMenuItem(MF_STRING, idz, _menuEscape(tuneinname[j]));
                results_idx.push(tuneinguideid[j]);
            }
        }
    }

    _menu.AppendMenuSeparator();
    _menu.AppendMenuItem(MF_STRING, 0, "<< Close Menu >>");

    window.SetCursor(32649);

    let idx = _menu.TrackPopupMenu(0, bs);

    ti_selection = "http://opml.radiotime.com/Browse.ashx?id=" + results_idx[idx - 1] + tunein_render;

    switch (idx) {

    case 0:
        statustext = "Idle.";
        window.NotifyOthers("tunein", statustext);
        break;
    default:
        ti_selection = ti_selection;
        tunein_process_menu(ti_selection);
        break;
    }
}

function tunein_process_menu(selection) {
    statustext = "Building menu....  " + selection;
    window.NotifyOthers("tunein", statustext);

    xmlhttp.open('GET', selection);
    xmlhttp.setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                statustext = "Menu of .... " + selection;
                window.NotifyOthers("tunein", statustext);
                let json_data = _jsonParse(xmlhttp.responseText);
                if (json_data.body.length) {
                    let items = json_data.body.length;
                    ti_title = json_data.head.title;
                    tuneinresults = [];

                    if (json_data.body[0].children) {
                        for (let i = 0; i < items; i++) {
                            if (json_data.body[i].children) {
                                let subitems = json_data.body[i].children.length;
                                for (let j = 0; j < subitems; j++) {
                                    let urlvalue = json_data.body[i].children[j].URL;
                                    let namevalue = json_data.body[i].children[j].text;
                                    let imagevalue = json_data.body[i].children[j].image;
                                    let guidevalue = json_data.body[i].children[j].guide_id;
                                    let itemvalue = json_data.body[i].children[j].item;
                                    let reliabilityvalue = json_data.body[i].children[j].reliability;
                                    tuneinresults.push({
                                        namevalue,
                                        urlvalue,
                                        imagevalue,
                                        guidevalue,
                                        itemvalue,
                                        reliabilityvalue
                                    });
                                }
                                tuneinresults.sort(compareValues('namevalue'));
                            }
                        }
                    } else {
                        for (let i = 0; i < items; i++) {
                            let namevalue = json_data.body[i].text;
                            let urlvalue = json_data.body[i].URL;
                            let imagevalue = json_data.body[i].image;
                            let guidevalue = json_data.body[i].guide_id;
                            let itemvalue = json_data.body[i].item;
                            let reliabilityvalue = json_data.body[i].reliability;
                            tuneinresults.push({
                                namevalue,
                                urlvalue,
                                imagevalue,
                                guidevalue,
                                itemvalue,
                                reliabilityvalue
                            });
                        }
                        tuneinresults.sort(compareValues('namevalue'));
                    }
                } else {
                    ti_title = "";
                }

                if (tuneinresults.length == 0) {
                    statustext = "No entries found";
                    window.NotifyOthers("tunein", statustext);
                }

                let _menu = window.CreatePopupMenu();
                let m = 0;
                _menu.AppendMenuItem(MF_GRAYED, 0, (ti_title ? ti_title : "") + " (Total : " + tuneinresults.length + ")");
                _menu.AppendMenuSeparator();

                for (let i = 0; i < tuneinresults.length; i++) {
                    let n = i / 35;
                    if ((n != Math.floor(n) == false) && (n != 0)) {
                        _menu.AppendMenuItem(MF_GRAYED | MF_MENUBARBREAK, i + 9000, (ti_title ? ti_title : "") + " (+)");
                        _menu.AppendMenuSeparator();
                    }

                    if ((tuneinresults[i].namevalue == "More Stations" || tuneinresults[i].namevalue == "Most Popular" || tuneinresults[i].namevalue == "By Location" || tuneinresults[i].namevalue == "More Shows" || tuneinresults[i].namevalue == "Recent Episodes") && m != 1) {
                        _menu.AppendMenuSeparator();
                    } else {
                        m = 0;
                    }

                    _menu.AppendMenuItem(ml_arr.includes(tuneinresults[i].guidevalue) ? MF_STRING | MF_CHECKED : MF_STRING, i + 1, _menuEscape(tuneinresults[i].namevalue) + (tuneinresults[i].itemvalue ? (' [' + tuneinresults[i].itemvalue + ']') : "") + (tuneinresults[i].reliabilityvalue ? (' [reliability: ' + tuneinresults[i].reliabilityvalue + '%]') : ""));

                    if (tuneinresults[i].namevalue == "More Stations" || tuneinresults[i].namevalue == "Most Popular" || tuneinresults[i].namevalue == "By Location" || tuneinresults[i].namevalue == "More Shows" || tuneinresults[i].namevalue == "Recent Episodes") {
                        _menu.AppendMenuSeparator();
                        m++;
                    }

                }

                _menu.AppendMenuSeparator();

                _menu.AppendMenuItem(MF_STRING, 10000, "<< Go Back >>");
                _menu.AppendMenuItem(MF_STRING, 0, "<< Close Menu >>");

                window.SetCursor(32649);

                let idx = _menu.TrackPopupMenu(0, bs);

                switch (idx) {
                case 0:
                    statustext = "Idle.";
                    window.NotifyOthers("tunein", statustext);
                    break;
                case 10000:
                    if (ti_back == selection)
                        tunein_main_menu();
                    else if (ti_back == "genre")
                        tunein_process_genres();
                    else
                        tunein_process_menu(ti_back);
                    break;
                default:
                    ti_selection = tuneinresults[idx - 1].urlvalue;
                    ti_logo = tuneinresults[idx - 1].imagevalue;
                    ti_name = tuneinresults[idx - 1].namevalue;
                    ti_guideid = tuneinresults[idx - 1].guidevalue;
                    ti_item = tuneinresults[idx - 1].itemvalue;

                    if (ti_selection.match(urltunepbrowse)) {
                        ti_selection = ti_selection + tunein_render;
                        ti_back = selection;
                        tunein_process_menu(ti_selection);
                        break;
                    } else if (ti_selection.match(urlbrowse)) {
                        ti_selection = ti_selection + tunein_render;
                        ti_back = selection;
                        tunein_process_menu(ti_selection);
                        break;
                    } else if (ti_selection.match(urltune)) {
                        ti_selection = ti_selection + tunein_render;
                        ti_back = selection;
                        process_tune(ti_selection, ti_name, ti_logo, ti_guideid, ti_item);
                        break;
                    } else if (ti_selection.match(urlreg)) {
                        tunein2mtag(ti_selection, ti_name, ti_logo, ti_guideid, ti_item);
                        break;
                    }

                }
            }
        }
    }
    xmlhttp.send("");
    window.NotifyOthers("tunein", statustext);
}

function process_tune(selection, name, logo, guideid, item) {
    statustext = "Processing....  " + selection;
    window.NotifyOthers("tunein", statustext);

    xmlhttp.open('GET', selection);
    xmlhttp.setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                let json_data = _jsonParse(xmlhttp.responseText);
                let items = json_data.body.length;
                let urls = [];
                let plscount = 0;
                let m3ucount = 0;

                for (let i = 0; i < items; i++) {
                    if (json_data.body[i].is_direct == true) {
                        let stream = json_data.body[i].url;
                        urls.push(stream);
                    }

                    if (json_data.body[i].playlist_type == "pls") {
                        let cmd = "cscript //nologo \"" + download_vbs + "\" \"" + json_data.body[i].url + "\" \"" + temp_folder + plscount + ".pls" + "\"";
                        WshShell.Run(cmd, 0, true);
                        plscount++;
                    }

                    if (json_data.body[i].playlist_type == "m3u") {
                        let cmd = "cscript //nologo \"" + download_vbs + "\" \"" + json_data.body[i].url + "\" \"" + temp_folder + m3ucount + ".m3u" + "\"";
                        WshShell.Run(cmd, 0, true);
                        m3ucount++;
                    }
                }

                let plsitems = plscount;
                for (let i = 0; i < plsitems; i++) {
                    let lines = utils.ReadTextFile(temp_folder + i + ".pls").split('\n');

                    for (let line = 0; line < lines.length; line++) {
                        if (lines[line].match(plsreg)) {
                            let stream = lines[line].substring(lines[line].indexOf("=") + 1);
                            urls.push(stream);
                        }
                    }
                }

                for (let i = 0; i < plsitems; i++) {
                    fso.DeleteFile(temp_folder + i + ".pls");
                }

                let m3uitems = m3ucount;
                for (let i = 0; i < m3uitems; i++) {
                    let lines = utils.ReadTextFile(temp_folder + i + ".m3u").split('\n');

                    for (let line = 0; line < lines.length; line++) {
                        if (lines[line].match(urlreg)) {
                            let stream = lines[line];
                            urls.push(stream);
                        }
                    }
                }

                for (let i = 0; i < m3uitems; i++) {
                    fso.DeleteFile(temp_folder + i + ".m3u");
                }

                let total_urls = urls.length;

                async function includeurls(urls) {
                    for (let i = 0; i < total_urls; i++) {
                        statustext = "Processing " + (i + 1) + " of " + total_urls + " - " + urls[i] + "\n";
                        window.NotifyOthers("tunein", statustext);
                        await tunein2mtag(i, urls[i], name, logo, guideid, item);
                    }
                    statustext = "Idle.";
                    window.NotifyOthers("tunein", statustext);
                }

                includeurls(urls);

            }
        }
    }
    xmlhttp.send("");
}

function tunein2mtag(i, url, name, logo, guideid, item) {
    return new Promise(resolve => {
        let response;
        let streamid = ('0000000000' + crc32(url)).slice(-10);
        let tempfilename = temp_folder + "!temp" + streamid + ".tags";
        let folder = mtags_folder + _fbSanitise(name) + " - " + streamid + "\\";
        let filename = folder + _fbSanitise(name) + " - " + streamid + ".tags";
        let filename_info_json = folder + _fbSanitise(name) + " - " + streamid + ".info.json";
        let filename_tracks_json = folder + _fbSanitise(name) + " - " + streamid + ".tracks.json";
        let imagefile = folder + _fbSanitise(name) + " - " + streamid;
        let logoext = logo.split('?')[0];
        logoext = logoext.split('.').pop();

        let cmd = "\"" + tunein2mtag_bat + "\"" + " " + "\"" + url + "\"" + " " + "\"" + tempfilename + "\"" + " " + streamid + " \"" + ffprobe_exe + "\" \"" + jq_exe + "\" " + "\"" + _batEscape(name) + "\"" + " " + guideid + " " + item;
        //console.log(window.Name + " : " + cmd);
        WshShell.Run(cmd, 0, false);

        let counter = 0;

        let timer = setInterval(() => {
            counter++;
            statustext2 = "(ffprobe) " + (15 - counter);
            window.NotifyOthers("tunein", statustext + statustext2);
            try {
                let ffprobe_file = fso.OpenTextFile(tempfilename, 8);
                ffprobe_file.Close();
                clearInterval(timer);
                statustext2 = "(ffprobe) \u221A ";
                window.NotifyOthers("tunein", statustext + statustext2);
                mtag_it();
            } catch (err) {
                if (counter == 15) {
                    clearInterval(timer);
                    let cmd = 'taskkill.exe /F /IM ffprobe.exe';
                    WshShell.Run(cmd, 0, true);
                    if (utils.FileExists(tempfilename))
                        fso.DeleteFile(tempfilename);
                    statustext = "Process Failed... " + url + "\n";
                    statustext2 = "Failed to ffprobe " + url;
                    window.NotifyOthers("tunein", statustext + statustext2);
                    resolve();
                }
            }
        }, 1000);
        function mtag_it() {
            try {
                let temptagarray = utils.ReadTextFile(tempfilename);
                let json_data = _jsonParse(temptagarray);
                json_data = json_data[0];
                response = json_data["@"];
            } catch (err) {
                statustext = "Process Failed... " + url + "\n";
                statustext3 = "Failed to mtag " + url;
                window.NotifyOthers("tunein", statustext + statustext3);
                console.log(window.Name + " : " + err);
                resolve();
            }
            if (response) {
                statustext3 = "(mtag) ... ";
                window.NotifyOthers("tunein", statustext + statustext2 + statustext3);

                if (!fso.FolderExists(folder))
                    fso.CreateFolder(folder);

                let mtag = utils.ReadTextFile(tempfilename);
                utils.WriteTextFile(filename, he.decode(mtag));

                fso.DeleteFile(tempfilename);

                statustext3 = " (mtag) \u221A ";
                window.NotifyOthers("tunein", statustext + statustext2 + statustext3);

                let id = i + 1;

                xmlhttp_d = [],
                id;
                xmlhttp_d[id] = new ActiveXObject("Microsoft.XMLHTTP");
                url1 = "http://opml.radiotime.com/Describe.ashx?&id=" + guideid + "&partnerId=1&render=json";
                xmlhttp_d[id].open("GET", url1);
                xmlhttp_d[id].setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
                xmlhttp_d[id].onreadystatechange = function () {
                    if (xmlhttp_d[id].readyState === 4 && xmlhttp_d[id].status === 200) {
                        let json_data_d = _jsonParse(xmlhttp_d[id].responseText);
                        utils.WriteTextFile(filename_info_json, JSON.stringify(json_data_d, null, 2));
                    }
                };
                xmlhttp_d[id].send();

                xmlhttp_t = [],
                id;
                xmlhttp_t[id] = new ActiveXObject("Microsoft.XMLHTTP");
                url2 = "http://opml.radiotime.com/Browse.ashx?c=playlist&id=" + guideid + "&partnerId=1&render=json";
                xmlhttp_t[id].open("GET", url2);
                xmlhttp_t[id].setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
                xmlhttp_t[id].onreadystatechange = function () {
                    if (xmlhttp_t[id].readyState === 4 && xmlhttp_t[id].status === 200) {
                        let json_data_t = _jsonParse(xmlhttp_t[id].responseText);
                        utils.WriteTextFile(filename_tracks_json, JSON.stringify(json_data_t, null, 2));
                    }
                };
                xmlhttp_t[id].send();

                if (logo) {
                    cmd = "cscript //nologo \"" + download_vbs + "\" \"" + logo.replace(/\?.*/g, "") + "\" \"" + imagefile + "." + logoext + "\"";
                    WshShell.Run(cmd, 0, false);

                    counter = 0;

                    let timer2 = setInterval(() => {
                        counter++;
                        statustext4 = " (logo) " + (15 - counter);
                        window.NotifyOthers("tunein", statustext + statustext2 + statustext3 + statustext4);

                        if (utils.IsFile(imagefile + "." + logoext)) {
                            clearInterval(timer2);
                            statustext4 = " (logo) \u221A ";
                            window.NotifyOthers("tunein", statustext + statustext2 + statustext3 + statustext4);
                            add_mtag();

                        } else if (counter == 15) {
                            clearInterval(timer2);
                            statustext4 = " (logo) x";
                            console.log(window.Name + " : Logo download failed. URL: " + logo);
                            window.NotifyOthers("tunein", statustext + statustext2 + statustext3 + statustext4);
                            add_mtag();
                        }

                    }, 1000);
                } else {
                    statustext4 = " (logo) N/A ";
                    window.NotifyOthers("tunein", statustext + statustext2 + statustext3 + statustext4);
                    add_mtag();

                }

                function add_mtag() {
                    cmd = "\"" + fb.FoobarPath + "foobar2000.exe" + "\"" + " /run_main:\"View/Switch to playlist/New Stations\" /add /immediate " + "\"" + filename + "\"";
                    WshShell.Run(cmd, 0, false);
                    statustext = "Idle.";
                    window.NotifyOthers("tunein", statustext);
                    resolve();
                }

            } else {
                fso.DeleteFile(tempfilename);
                console.log(window.Name + " : " + "Unable to create mtag");
                statustext = "Process Failed... " + url + "\n";
                statustext4 = "Unable to create mtag ";
                window.NotifyOthers("tunein", statustext + statustext4);
                resolve();
            }

        }
    })
}

if (_isFile(tunein_genres_file) == false || _fileExpired(tunein_genres_file, ONE_DAY))
    tunein_genres_get();
