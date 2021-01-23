//Buttons

include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\lodash.min.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\helpers.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\panel.js');
include(fb.ProfilePath + 'themes\\footuner\\bin\\he.js');

const userdata_folder = fb.FoobarPath + "user-data\\";

const ffprobe_exe = fb.ProfilePath + 'themes\\footuner\\bin\\ffprobe.exe';
const jq_exe = fb.ProfilePath + 'themes\\footuner\\bin\\jq.exe';
const url2mtag_bat = "\"" + fb.ProfilePath + 'themes\\footuner\\bin\\url2mtag.bat' + "\"";
const mtags_folder = userdata_folder + 'mtags\\';
const m3u_folder = userdata_folder + 'm3u\\';
const temp_folder = fb.ProfilePath + 'themes\\footuner\\temp\\';
const add_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\add.png";
const play_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\play.png";
const pause_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\pause.png";
const stop_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\stop.png";
const previous_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\previous.png";
const next_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\next.png";
const addimage_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\addimage.png";
const webpage_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\webpage.png";
const delete_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\delete.png";
const convert_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\convert.png";

let urlreg = new RegExp("http*.://", "i");

if (!fso.FolderExists(mtags_folder))
    fso.CreateFolder(mtags_folder);
if (!fso.FolderExists(m3u_folder))
    fso.CreateFolder(m3u_folder);
if (!fso.FolderExists(temp_folder))
    fso.CreateFolder(temp_folder);

let makeCRCTable = function () {
    let c;
    let crcTable = [];
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

let crc32 = function (str) {
    let crcTable = makeCRCTable();
    let crc = 0 ^ (-1);
    for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
}

let statustext = "Idle";
let panel = new _panel(true);
let buttons = new _buttons();
let bs;

function buttonss() {
    buttons.buttons.add = new _button(bs * 0, 0, bs, bs, {
            normal: add_ico
        }, (x, y) => {
            fb.RunMainMenuCommand('File/Add Location...');
        }, 'Add Location...');
    buttons.buttons.add2mtag = new _button(bs * 1.5, 0, bs, bs, {
            normal: add_ico
        }, (x, y) => {
            add2mtag();
        }, 'Add Location and Convert to mtag');
    buttons.buttons.stop = new _button(bs * 3, 0, bs, bs, {
            normal: stop_ico
        }, (x, y) => {
            fb.Stop();
        }, 'Stop');
    buttons.buttons.play = new _button(bs * 4.5, 0, bs, bs, {
            normal: !fb.IsPlaying || fb.IsPaused ? play_ico : pause_ico
        }, (x, y) => {
            fb.PlayOrPause();
        }, !fb.IsPlaying || fb.IsPaused ? 'Play' : 'Pause');
    buttons.buttons.previous = new _button(bs * 6, 0, bs, bs, {
            normal: previous_ico
        }, (x, y) => {
            fb.Prev();
        }, 'Previous');
    buttons.buttons.next = new _button(bs * 7.5, 0, bs, bs, {
            normal: next_ico
        }, (x, y) => {
            fb.Next();
        }, 'Next');
    buttons.buttons.addimage = new _button(bs * 9, 0, bs, bs, {
            normal: addimage_ico
        }, (x, y) => {
            imagefront();
        }, 'Add Image to M-TAG(s)');
    buttons.buttons.webpage = new _button(bs * 10.5, 0, bs, bs, {
            normal: webpage_ico
        }, (x, y) => {
            let streamurl = fb.TitleFormat("[%stream_ffprobe_webpage%]").Eval();
            if (streamurl) {
				if  (streamurl.match(urlreg))
                WshShell.Run(streamurl);
			else WshShell.Run("https://" + streamurl);
			}
        }, 'Open Webpage');
    buttons.buttons.delete = new _button(bs * 12, 0, bs, bs, {
            normal: delete_ico
        }, (x, y) => {
            deletefolder();
        }, 'Delete M-TAG(s) & Folder');
    buttons.buttons.convert = new _button(bs * 13.5, 0, bs, bs, {
            normal: convert_ico
        }, (x, y) => {
            convert();
        }, 'Convert URL(s) to M-TAG(s)');
	buttons.buttons.convert2 = new _button(bs * 15, 0, bs, bs, {
            normal: convert_ico
        }, (x, y) => {
            convert2();
        }, 'Convert to M3U');
}

function add2mtag() {
    let url;
    let url_input = "";
    try {
        statustext = "Add URL & Convert to mtag - Waiting for input.";
        window.NotifyOthers("tunein", statustext);
        url_input = utils.InputBox(window.ID, "Enter URL", "Add URL & Convert to mtag", "", true);
        url = url_input;

        statustext = "Processing... " + url;
        window.NotifyOthers("tunein", statustext);
		
        let response;
        let stream_name_ffprobe;
        let clean_name;

        if (url.match(urlreg)) {
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
        } else {
            fb.ShowPopupMessage("This is not a URL", "mtagger Error");
        }
    } catch (e) {
        statustext = "Add Canceled.";
        window.NotifyOthers("tunein", statustext);
    }
    let n_timer = setTimeout(() => {
            statustext = "Idle.";
            window.NotifyOthers("tunein", statustext);
        }, 2000);
}

function convert() {
    let items = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
    let count = items.Count;
    if (count == 1) {
        for (let i = 0; i < count; i++) {
            let gmetadb = items[i];
            statustext = "Processing .... Wait for Idle !!!";
            window.NotifyOthers("mtagger", statustext);
            tag_single(gmetadb);
        }
    } else {
        let aplidx = plman.ActivePlaylist;
        plman.RemovePlaylistSelection(aplidx);
        for (let i = 0; i < count; i++) {
            let gmetadb = items[i];
            statustext = "Processing .... Wait for Idle !!! (" + (i + 1) + " of " + count + ")";
            window.NotifyOthers("mtagger", statustext);
            tag_multiple(gmetadb);
        }
    }
    statustext = "Idle.";
    window.NotifyOthers("mtagger", statustext);
}

function convert2() {
    let items = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
    let count = items.Count;
        for (let i = 0; i < count; i++) {
            let gmetadb = items[i];
            statustext = "Processing .... Wait for Idle !!!";
            window.NotifyOthers("mtagger", statustext);
            mtag2m3u(gmetadb);
        }
    statustext = "Idle.";
    window.NotifyOthers("mtagger", statustext);
}

function mtag2m3u(gmetadb) {
	let url = fb.TitleFormat("$if3([$info(@)],[%stream_url%],[%path%])").EvalWithMetadb(gmetadb);
	let streamid = fb.TitleFormat("[stream_id_crc32]").EvalWithMetadb(gmetadb);
	let filename = fb.TitleFormat("$if3([%stream_tunein_name%],[%stream_crb_name%],[%stream_ffprobe_name%],[$info(@)],[%path%])").EvalWithMetadb(gmetadb);
	if (!streamid) streamid = ('0000000000' + crc32(url)).slice(-10);
	let tempfilename = m3u_folder + _fbSanitise(filename) + " - " + streamid + ".m3u";
	utils.WriteTextFile(tempfilename, "#EXTM3U\n#EXTINF:-1," + _fbSanitise(filename) + "\n"+ url);
	console.log("Created " + tempfilename);
}

function tag_single(gmetadb) {
    let url = fb.TitleFormat("%path%").EvalWithMetadb(gmetadb);
    let response;
    let stream_name_ffprobe;
    let clean_name;

    if (url.match(urlreg)) {
        let streamid = fb.TitleFormat("$num($crc32(%path%),10)").EvalWithMetadb(gmetadb);
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
            let aplidx = plman.ActivePlaylist;
            let idxa = plman.GetPlaylistFocusItemIndex(aplidx);
            plman.RemovePlaylistSelection(aplidx);
            let cmd = "\"" + fb.FoobarPath + "foobar2000.exe" + "\"" + "/add /immediate " + "\"" + filename + "\"";
            WshShell.Run(cmd, 0, true);
            window.SetTimeout(function () {
                let idxa2 = plman.GetPlaylistFocusItemIndex(aplidx);
                let selection = plman.GetPlaylistSelectedItems(aplidx);
                plman.InsertPlaylistItems(aplidx, idxa, selection);
                plman.RemovePlaylistSelection(aplidx);
                plman.SetPlaylistSelectionSingle(aplidx, idxa, true);
                plman.EnsurePlaylistItemVisible(aplidx, idxa);
            }, 100);
        } else {
            fso.DeleteFile(tempfilename);
        }
    } else {
        fb.ShowPopupMessage("This is not a URL", "mtagger Error");
    }
}
function tag_multiple(gmetadb) {
    let url = fb.TitleFormat("%path%").EvalWithMetadb(gmetadb);
    let response;
    let stream_name_ffprobe;
    let clean_name;

    if (url.match(urlreg)) {
        let streamid = fb.TitleFormat("$num($crc32(%path%),10)").EvalWithMetadb(gmetadb);
        let tempfilename = temp_folder + "!temp.tags";
        utils.WriteTextFile(tempfilename, "");
        let cmd = url2mtag_bat + " " + "\"" + url + "\"" + " " + "\"" + tempfilename + "\"" + " " + streamid + " \"" + ffprobe_exe + "\" \"" + jq_exe + "\"";
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
            if (!stream_name_ffprobe) {
                clean_name = "Unknown"
            } else {
                clean_name = _fbSanitise(stream_name_ffprobe);
            }
            let folder = mtags_folder + clean_name + " - " + streamid + "\\";
            if (!fso.FolderExists(folder))
                fso.CreateFolder(folder);
            let filename = folder + clean_name + " - " + streamid + ".tags"; ;
            let mtag = utils.ReadTextFile(tempfilename);
            utils.WriteTextFile(filename, he.decode(mtag));
            fso.DeleteFile(tempfilename);
            let cmd = "\"" + fb.FoobarPath + "foobar2000.exe" + "\"" + "/add /immediate " + "\"" + filename + "\"";
            WshShell.Run(cmd, 0, true);
        } else {
            fso.DeleteFile(tempfilename);
        }
    } else {
        fb.ShowPopupMessage("This is not a URL", "mtagger Error");
    }
}

function imagefront() {
    let aplidx = plman.ActivePlaylist;
    let g_metadb = plman.GetPlaylistSelectedItems(aplidx);
    fb.RunContextCommandWithMetadb("Tagging/Attach pictures/Front cover", g_metadb);
}

function deletefolder() {
    let items = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
    let count = items.Count;
    let aplidx = plman.ActivePlaylist;
    plman.RemovePlaylistSelection(aplidx);
    for (let i = 0; i < count; i++) {
        let gmetadb = items[i];
        let folder2delete = fb.TitleFormat("$directory_path(%path%)").EvalWithMetadb(gmetadb);
        if (fso.FolderExists(folder2delete))
            fso.DeleteFolder(folder2delete, true);
    }
}
function on_colours_changed() {
    panel.colours_changed();
    window.Repaint();
}

function on_mouse_lbtn_up(x, y, mask) {
    buttons.lbtn_up(x, y, mask);
}

function on_mouse_leave() {
    buttons.leave();
}

function on_mouse_move(x, y) {
    buttons.move(x, y);
}

function on_mouse_rbtn_up(x, y) {
    return panel.rbtn_up(x, y);
}

function on_paint(gr) {
    panel.paint(gr);
    buttons.paint(gr);
}

function on_playback_pause() {
    buttonss();
    window.Repaint();
}

function on_playback_starting() {
    buttonss();
    window.Repaint();
}

function on_playback_stop() {
    buttonss();
    window.Repaint();
}

function on_size() {
    panel.size();
    bs = panel.w / 16;
    buttonss();
}
