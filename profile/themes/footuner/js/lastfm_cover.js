//Lastfm Cover

include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\lodash.min.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\helpers.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\panel.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\thumbs.js');

const userdata_folder = fb.FoobarPath + "user-data\\";

const lastfm_cover_file = fb.ProfilePath + "themes\\footuner\\images\\lastfm_cover\\cover.png";
const lastfm_cover_download_folder = userdata_folder + "lastfm_cover";
const settings_file = userdata_folder + 'settings.ini';

if (!fso.FolderExists(lastfm_cover_download_folder))
    fso.CreateFolder(lastfm_cover_download_folder);

let api_key = utils.ReadINI(settings_file, 'lastfm', 'apikey');
let album_cover_file = "";
let artist = "";
let album = "";
let download_vbs = fb.ProfilePath + "themes\\footuner\\bin\\download.vbs";
let xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
let xml2http = new ActiveXObject("MSXML2.XMLHTTP");
let panel = new _panel(true);
let thumbs = new _thumbs();

panel.item_focus_change();

let tfo = {
    artist: fb.TitleFormat('$ifequal(%stream_reverse%,1,[%title%],[%artist%])'),
    title: fb.TitleFormat('$ifequal(%stream_reverse%,1,[%artist%],[%title%])'),
    cover_url: fb.TitleFormat('[$info(cover_url)]')
};

let listeners;
let playcount;
let cover;
let toptags = [];
let loaded = 0;
let cover_url;

function delete_cover() {
    try {
        fso.DeleteFile(lastfm_cover_file);
        _tt("");
    } catch (err) {
        //  console.log(window.Name + " : (delete) : " + err);
    }
}

function lfm_download() {
    cover_url = tfo.cover_url.Eval();
    if (cover_url && cover_url.match("^https?:\\/\\/.+\\.(jpg|jpeg|png|webp|avif|gif|svg)$")) {
		cover_url = cover_url.split('?')[0];
        loaded = 0;
        album_cover_file = lastfm_cover_download_folder + "\\" + _fbSanitise(tfo.artist.Eval()) + " - " + _fbSanitise(tfo.title.Eval()) + "." + cover_url.split('.').pop();
		lfm_image_dl(cover_url, album_cover_file);
        return;
    }
    if (tfo.artist.Eval() && tfo.title.Eval() && api_key) {
        let url = "https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=" + api_key + "&artist=" + encodeURIComponent(tfo.artist.Eval()) + "&track=" + encodeURIComponent(tfo.title.Eval()) + "&format=json";
		xmlhttp.open('GET', url);
        xmlhttp.setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    try {
                        let json_data = _jsonParse(xmlhttp.responseText);
                        let txt;
                        toptags = [];
                        let txt2 = "";
                        if (json_data.track.listeners)
                            listeners = json_data.track.listeners;
                        if (json_data.track.playcount)
                            playcount = json_data.track.playcount;
                        if (json_data.track.toptags.tag) {
                            for (var i = 0; i < json_data.track.toptags.tag.length; i++) {
                                toptags.push(json_data.track.toptags.tag[i].name);
                            }
                            txt2 = toptags.join(" / ");
                            window.NotifyOthers("lastfm2", txt2);
                        }
                        let track_url;
                        if (json_data.track.url)
                            track_url = json_data.track.url;
                        let album_url;
                        if (json_data.track.album.image[3]['#text'])
                            album_url = json_data.track.album.image[3]['#text'];
                        if (album_url) {
                            album_cover_file = lastfm_cover_download_folder + "\\" + _fbSanitise(tfo.artist.Eval()) + " - " + _fbSanitise(json_data.track.album.title) + "." + json_data.track.album.image[3]['#text'].split('.').pop();
                            loaded = 0;
                            artist = _fbSanitise(tfo.artist.Eval());
                            album = _fbSanitise(json_data.track.album.title);
                            if (!fso.FileExists(album_cover_file)) {
                                txt = "Cover: Downloading..";
                                window.NotifyOthers("lastfm", txt);
                                lfm_image_dl(album_url, album_cover_file);
                            }
                        } else {
                            if (listeners && playcount) {
                                txt = "Listeners:  " + listeners.replace(/(.)(?=(\d{3})+$)/g, '$1,') + "  \u25E6  Playcount: " + playcount.replace(/(.)(?=(\d{3})+$)/g, '$1,') + " - No Cover";
                                window.NotifyOthers("lastfm", txt);
                            } else
                                window.NotifyOthers("lastfm", "No Cover");
                        }
                    } catch (err) {
                        // console.log(window.Name + " : (download-lfm_download) : " + err);
                        window.NotifyOthers("lastfm", "Not Found");
                    }
                }
            }
        }
        xmlhttp.send();
    }
}

function lfm_image_dl(url, file) {
    xml2http.open('GET', url);
    xml2http.setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
    xml2http.onreadystatechange = () => {
        if (xml2http.readyState == 4) {
            if (xml2http.status == 200) {
                try {
                    let objADOStream = new ActiveXObject("ADODB.Stream");
                    objADOStream.Open();
                    objADOStream.Type = 1;
                    objADOStream.Write(xml2http.responseBody);
                    objADOStream.Position = 0;
                    objADOStream.SaveToFile(file);
                    objADOStream.Close();
                } catch (err) {
                    // console.log(window.Name + " : (download-lfm_image_dl) : " + err);
                }
            }
        }
    }
    xml2http.send();
}

let timer = setInterval(() => {
        if (!api_key)
            window.NotifyOthers("lastfm", "No API Key - Add your Last.fm API Key");

        if ((utils.FileTest(album_cover_file, "e") && !loaded))
            try {
                cover = "OK";
                fso.CopyFile(album_cover_file, lastfm_cover_file);
                loaded = 1;
                _tt("Artist : " + artist + "\nAlbum : " + album);
                if (listeners && playcount) {
                    window.NotifyOthers("lastfm", "Listeners:  " + listeners.replace(/(.)(?=(\d{3})+$)/g, '$1,') + "  \u25E6  Playcount: " + playcount.replace(/(.)(?=(\d{3})+$)/g, '$1,'));
                }
                if (cover_url && cover_url.match("^https?:\\/\\/.+\\.(jpg|jpeg|png|webp|avif|gif|svg)$")) {
                    window.NotifyOthers("lastfm", "Album cover_url found in stream");
                }
                thumbs.update();
            } catch (err) {
                console.log(window.Name + " : (timer) : " + err);
            }
    }, 1000);

function on_colours_changed() {
    panel.colours_changed();
    window.Repaint();
}

function on_font_changed() {
    panel.font_changed();
    window.Repaint();
}

function on_item_focus_change() {
    panel.item_focus_change();
}

function on_key_down(k) {
    thumbs.key_down(k);
}

function on_metadb_changed() {
    thumbs.metadb_changed();
}

function on_mouse_lbtn_dblclk(x, y) {
    thumbs.lbtn_dblclk(x, y);
}

function on_mouse_lbtn_up(x, y) {
    thumbs.lbtn_up(x, y);
}

function on_mouse_move(x, y) {
    thumbs.move(x, y);
}

function on_mouse_rbtn_up(x, y) {
    return panel.rbtn_up(x, y, thumbs);
}

function on_mouse_wheel(s) {
    // thumbs.wheel(s);
}

function on_paint(gr) {
    panel.paint(gr);
    thumbs.paint(gr);
}

function on_playback_dynamic_info_track() {
    panel.item_focus_change();
    window.NotifyOthers("lastfm", "Last.fm");
    album_cover_file = "";
    delete_cover();
    thumbs.update();
    lfm_download();
}

function on_playback_new_track() {
    panel.item_focus_change();
    window.NotifyOthers("lastfm", "Last.fm");
    album_cover_file = "";
    delete_cover();
    thumbs.update();
    lfm_download();
}

function on_playback_stop(reason) {
    window.NotifyOthers("lastfm", "Last.fm");
    window.NotifyOthers("lastfm2", "");
    album_cover_file = "";
    delete_cover();
    thumbs.update();
    if (reason != 2) {
        panel.item_focus_change();
    }
}

function on_playlist_switch() {
    panel.item_focus_change();
}

function on_size() {
    panel.size();
    thumbs.size();
}

delete_cover();
thumbs.update();
lfm_download();
