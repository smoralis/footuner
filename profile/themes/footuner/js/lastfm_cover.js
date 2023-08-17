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
    cover_url: fb.TitleFormat('[$info(cover_url)]'),
    ref_url: fb.TitleFormat('[$info(@)]'),
    path: fb.TitleFormat('%path%')
}

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
        //console.log(window.Name + " : (delete) : " + err);
    }
}

function lfm_download() {
    cover_url = tfo.cover_url.Eval();
    cover_url = cover_url.split('?')[0];

    /*
    http://stream.radioparadise.com/aac-32
    http://stream.radioparadise.com/aac-64
    http://stream.radioparadise.com/aac-128
    http://stream.radioparadise.com/aac-320
    http://stream.radioparadise.com/mp3-192
    http://stream.radioparadise.com/mellow-32
    http://stream.radioparadise.com/mellow-64
    http://stream.radioparadise.com/mellow-128
    http://stream.radioparadise.com/mellow-320
    http://stream.radioparadise.com/mellow-192
    http://stream.radioparadise.com/rock-32
    http://stream.radioparadise.com/rock-64
    http://stream.radioparadise.com/rock-128
    http://stream.radioparadise.com/rock-320
    http://stream.radioparadise.com/rock-192
    http://stream.radioparadise.com/global-32
    http://stream.radioparadise.com/global-64
    http://stream.radioparadise.com/global-128
    http://stream.radioparadise.com/global-320
    http://stream.radioparadise.com/global-192
    http://broadcast.infomaniak.ch/energybern-high.mp3
    http://broadcast.infomaniak.ch/energyzuerich-high.mp3
    http://streams.olympia-streams.nl:80/classics
    http://streams.olympia-streams.nl:80/classics64
    http://streams.olympia-streams.nl:80/classics192
    http://streams.olympia-streams.nl:80/olympia
    http://streams.olympia-streams.nl:80/olympia64
    http://streams.olympia-streams.nl:80/olympia192
    http://stream.dandelionradio.com:9414/
     */

    if (cover_url && cover_url.match("^https?:\\/\\/.+\\.(jpg|jpeg|png|webp|avif|gif|svg)$")) {
        cover_url = cover_url.split('?')[0];
        window.NotifyOthers("lastfm", "cover_url (image) found in stream");
        artist = tfo.artist.Eval();
        album = "n/a";
        loaded = 0;
        album_cover_file = lastfm_cover_download_folder + "\\" + _fbSanitise(tfo.artist.Eval()) + " - " + _fbSanitise(tfo.title.Eval()) + "." + cover_url.split('.').pop();
        lfm_image_dl(cover_url, album_cover_file);
        return;
    }

    /*
    http://edge-bauerall-01-gos2.sharp-stream.com/forth1.mp3
    http://edge-bauerall-01-gos2.sharp-stream.com/gem106.mp3
    http://edge-bauerall-01-gos2.sharp-stream.com/net2gloucester.mp3
    http://edge-bauerall-01-gos2.sharp-stream.com/net2sussex.mp3
    http://edge-bauerall-01-gos2.sharp-stream.com/net2westnorfolk.mp3
    http://edge-bauerall-01-gos2.sharp-stream.com/planetrock.mp3
    http://edge-bauerall-01-gos2.sharp-stream.com/scalahigh.aac
    http://icy-e-bz-07-boh.sharp-stream.com/northsound2.mp3
    http://live-bauer-al.sharp-stream.com/kisstory.mp3
    http://live-bauerdk.sharp-stream.com/voice128.mp3
    http://stream-mz.planetradio.co.uk/net1cornwalleast.aac
    http://tx-bauerdk.sharp-stream.com/http_live.php?i=radiosoft_dk_mp3
    https://edge-bauerall-01-gos2.sharp-stream.com/absolute00shigh.aac
    https://edge-bauerall-01-gos2.sharp-stream.com/absolute10shigh.aac
    https://edge-bauerall-01-gos2.sharp-stream.com/absolute60shigh.aac
    https://edge-bauerall-01-gos2.sharp-stream.com/absolute70shigh.aac
    https://edge-bauerall-01-gos2.sharp-stream.com/absolute80shigh.aac
    https://edge-bauerall-01-gos2.sharp-stream.com/absolute90shigh.aac
    https://edge-bauerall-01-gos2.sharp-stream.com/absoluteclassicrockhigh.aac
    https://edge-bauerall-01-gos2.sharp-stream.com/hits.mp3
    https://edge-bauerall-01-gos2.sharp-stream.com/kerrang.mp3
    https://edge-bauerall-01-gos2.sharp-stream.com/metro.mp3
    https://edge-bauerall-01-gos2.sharp-stream.com/net1cornwall.mp3
    https://edge-bauerall-01-gos2.sharp-stream.com/net2aylesbury.mp3
    https://edge-bauerall-01-gos2.sharp-stream.com/net2york.mp3
    https://edge-bauerall-01-gos2.sharp-stream.com/webcast3high.aac
    https://edge-bauerdk-02-thn.sharp-stream.com/radio100_dk_tunein_mp3
    https://live-bauerdk.sharp-stream.com/DK_HQ_RP11.aac
    https://live-bauerdk.sharp-stream.com/myrock_dk_mp3
    https://live-bauerdk.sharp-stream.com/radiosoft_dk_tunein_mp3
    https://live-bauerdk.sharp-stream.com/thevoice_dk_mp3
    https://live-bauerno.sharp-stream.com/kiss_no_mp3
    https://live-bauerno.sharp-stream.com/station17_no_mp3
    https://live-bauerse-fm.sharp-stream.com/retrofm_aacp
    https://live-bauerse-fm.sharp-stream.com/vinylfm_instream_se_aacp
    https://stream-al.planetradio.co.uk/kissfresh.aac
    https://stream-mz.planetradio.co.uk/magicnational.mp3
    https://stream-mz.planetradio.co.uk/magicsoul.mp3
    https://stream-mz.planetradio.co.uk/net2essex.aac
    https://stream-mz.planetradio.co.uk/net2suffolk.aac
    https://stream.on.revma.com/6wa52xb1pg0uv
    https://stream.on.revma.com/edb2t3pp2p8uv
     */

    if (cover_url && cover_url.match("https://listenapi.planetradio.co.uk")) {
        xml2http.open('GET', cover_url);
        xml2http.setRequestHeader('User-Agent', "spider_monkey_panel_footuner");
        xml2http.onreadystatechange = () => {
            if (xml2http.readyState == 4) {
                if (xml2http.status == 200) {
                    let json_data = _jsonParse(xml2http.responseText);
                    let album_url;
                    if (json_data.eventImageUrl) {
                        album_url = json_data.eventImageUrl;
                        album_url = album_url.split('?')[0];
                    }
                    if (album_url) {
                        if (json_data.eventSongArtist) {
                            artist = json_data.eventSongArtist;
                        }
                        album = "n/a";
                        window.NotifyOthers("lastfm", "cover_url (planetradio) found in stream");
                        loaded = 0;
                        album_cover_file = lastfm_cover_download_folder + "\\" + _fbSanitise(tfo.artist.Eval()) + " - " + _fbSanitise(tfo.title.Eval()) + "." + album_url.split('.').pop();
                        lfm_image_dl(album_url, album_cover_file);
                        return;
                    }
                }
            }
        }
        xml2http.send();
        return;
    }

    /*
    https://ais-sa1.streamon.fm/7267_64k.aac
    https://ais-sa1.streamon.fm/7281_64k.aac
    https://ais-sa1.streamon.fm/7285_64k.aac
    https://ais-sa1.streamon.fm/7821_128k.aac
    http://ais-sa1.streamon.fm/7833_128k.aac
    https://ais-sa1.streamon.fm/7835_128k.aac
    http://ais-sa1.streamon.fm/7836_128k.aac
    http://cfgw.streamon.fm/stream/CFGW-64k.aac
    http://cfwd.streamon.fm/stream/CFWD-64k.aac
    http://cfwf.streamon.fm/stream/CFWF-64k.aac
    http://cjgx.streamon.fm/stream/CJGX-64k.aac
    http://cjnw.streamon.fm/stream/CJNW-64k.aac
    http://ckea.streamon.fm/stream/CKEA-64k.aac
    http://ckik.streamon.fm/stream/CKIK-64k.aac
    http://ckrm.streamon.fm/stream/CKRM-64k.aac
     */

    cover_url = tfo.cover_url.Eval();
    if (cover_url && cover_url.match("http://metadata.cdnstream1.com")) {
        let album_url = decodeURIComponent(extractUrlValue("WWW_ALBUM_ART", cover_url));
        artist = decodeURIComponent(extractUrlValue("ARTIST", cover_url));
        album = decodeURIComponent(extractUrlValue("Album", cover_url));
        if (album_url != 'null') {
            window.NotifyOthers("lastfm", "cover_url (streamon) found in stream");
            loaded = 0;
            album_cover_file = lastfm_cover_download_folder + "\\" + _fbSanitise(tfo.artist.Eval()) + " - " + _fbSanitise(tfo.title.Eval()) + "." + album_url.split('.').pop();
            lfm_image_dl(album_url, album_cover_file);
            return;
        }
    }

    /*Match by url*/

    let match_url = "";
    let ref_url = tfo.ref_url.Eval();
    let path = tfo.path.Eval();
    if (ref_url) {
        match_url = ref_url;
    } else {
        match_url = path;
    }

    switch (match_url) {

    case 'http://canada1.reliastream.com:8000/':

        if (cover_url) {
            let album_url = decodeURIComponent(extractUrlValue("picture", cover_url));
            artist = decodeURIComponent(extractUrlValue("artist", cover_url));
            album = decodeURIComponent(extractUrlValue("album", cover_url));
            if (album_url != 'null') {
                window.NotifyOthers("lastfm", "cover_url (rockXradio) found in stream");
                album_url = "https://rockxradio.ca/RXR-Requests/web/pictures/" + album_url;
                loaded = 0;
                album_cover_file = lastfm_cover_download_folder + "\\" + _fbSanitise(tfo.artist.Eval()) + " - " + _fbSanitise(tfo.title.Eval()) + "." + album_url.split('.').pop();
                lfm_image_dl(album_url, album_cover_file);
                return;
            }
        }
        break;

    case 'https://443-1.autopo.st/107/stream/':

        if (cover_url) {
            let album_url = decodeURIComponent(extractUrlValue("picture", cover_url));
            artist = decodeURIComponent(extractUrlValue("artist", cover_url));
            album = decodeURIComponent(extractUrlValue("album", cover_url));
            if (album_url != 'null') {
                window.NotifyOthers("lastfm", "cover_url (epicrockradio) found in stream");
                album_url = "https://www.kaidata.com/pictures/" + album_url;
                loaded = 0;
                album_cover_file = lastfm_cover_download_folder + "\\" + _fbSanitise(tfo.artist.Eval()) + " - " + _fbSanitise(tfo.title.Eval()) + "." + album_url.split('.').pop();
                lfm_image_dl(album_url, album_cover_file);
                return;
            }
        }
        break;
		
    case 'http://str4uice.streamakaci.com/4uclassicrock.mp3':

        if (cover_url) {
            let album_url = decodeURIComponent(extractUrlValue("picture", cover_url));
            artist = decodeURIComponent(extractUrlValue("artist", cover_url));
            album = decodeURIComponent(extractUrlValue("album", cover_url));
            if (album_url != 'null') {
                window.NotifyOthers("lastfm", "cover_url (processed) found in stream");
                album_url = "https://www.4uradios.com/imgcdr/" + album_url;
                loaded = 0;
                album_cover_file = lastfm_cover_download_folder + "\\" + _fbSanitise(tfo.artist.Eval()) + " - " + _fbSanitise(tfo.title.Eval()) + "." + album_url.split('.').pop();
                lfm_image_dl(album_url, album_cover_file);
                return;
            }
        }
        break;

    case 'https://p4.p4groupaudio.com/P04_MM':
    case 'https://p4.p4groupaudio.com/P05_MM':
    case 'https://p4.p4groupaudio.com/P06_MM':
    case 'https://p4.p4groupaudio.com/P07_MM':
    case 'https://p4.p4groupaudio.com/P08_MM':
    case 'https://p4.p4groupaudio.com/P09_MM':
    case 'https://p4.p4groupaudio.com/P10_MM':
    case 'https://p4.p4groupaudio.com/P11_MM':
    case 'https://p4.p4groupaudio.com/NRJ_MM':

        if (cover_url) {
            let json_data = _jsonParse(cover_url);
            let album_url;
            if (json_data.imageUrl) {
                album_url = json_data.imageUrl;
            }
            if (album_url) {
                window.NotifyOthers("lastfm", "cover_url (p4groupaudio) found in stream");
                if (json_data.artist) {
                    artist = json_data.artist;
                }
                album = "n/a";
                loaded = 0;
                album_cover_file = lastfm_cover_download_folder + "\\" + _fbSanitise(tfo.artist.Eval()) + " - " + _fbSanitise(tfo.title.Eval()) + "." + album_url.split('.').pop();
                lfm_image_dl(album_url, album_cover_file);
                return;
            }
        }
        break;

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
                thumbs.update();
            } catch (err) {
                //console.log(window.Name + " : (timer) : " + err);
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
    window.NotifyOthers("lastfm2", "");
    album_cover_file = "";
    listeners = "";
    playcount = "";
    delete_cover();
    thumbs.update();
    lfm_download();
    if (tfo.cover_url.Eval())
        console.log("cover_url: " + tfo.cover_url.Eval());
}

function on_playback_new_track() {
    panel.item_focus_change();
    window.NotifyOthers("lastfm", "Last.fm");
    window.NotifyOthers("lastfm2", "");
    album_cover_file = "";
    listeners = "";
    playcount = "";
    delete_cover();
    thumbs.update();
    lfm_download();
}

function on_playback_stop(reason) {
    window.NotifyOthers("lastfm", "Last.fm");
    window.NotifyOthers("lastfm2", "");
    album_cover_file = "";
    listeners = "";
    playcount = "";
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

function extractUrlValue(key, url) {
    let match = url.match('[?&]' + key + '=([^&#]+)');
    return match ? match[1] : null;
}

delete_cover();
thumbs.update();
lfm_download();
