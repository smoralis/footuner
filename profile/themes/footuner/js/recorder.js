//Recorder

include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\lodash.min.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\helpers.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\panel.js');

const userdata_folder = fb.FoobarPath + "user-data\\";
const settings_file = userdata_folder + 'settings.ini';

if (!fso.FolderExists(userdata_folder))
    fso.CreateFolder(userdata_folder);

const recordings_folder = userdata_folder + 'recordings';

if (!fso.FolderExists(recordings_folder))
    fso.CreateFolder(recordings_folder);

const streamwriter_exe = fb.ProfilePath + 'themes\\footuner\\bin\\streamwriter\\streamwriter.exe';
const streamwriter_dir = userdata_folder + 'streamwriter';
const streamwriter_temp_dir = fb.ProfilePath + 'themes\\footuner\\bin\\streamwriter\\temp';
const streamwriter_base_ini = fb.ProfilePath + 'themes\\footuner\\bin\\streamwriter\\streamwriter_settings.ini';
const streamwriter_base_dat = fb.ProfilePath + 'themes\\footuner\\bin\\streamwriter\\streamwriter_data.dat';
const streamwriter_ini = userdata_folder + 'streamwriter\\streamwriter_settings.ini';
const streamwriter_dat = userdata_folder + 'streamwriter\\streamwriter_data.dat';
const streamwriter_log = userdata_folder + 'streamwriter\\log.txt';

if (!fso.FolderExists(streamwriter_dir))
    fso.CreateFolder(streamwriter_dir);

if (!utils.FileExists(streamwriter_ini))
    fso.CopyFile(streamwriter_base_ini, streamwriter_ini);
if (!utils.FileExists(streamwriter_dat))
    fso.CopyFile(streamwriter_base_dat, streamwriter_dat);

utils.WriteINI(streamwriter_ini, 'Settings', 'Dir', recordings_folder);
utils.WriteINI(streamwriter_ini, 'Settings', 'DirAuto', recordings_folder);
utils.WriteINI(streamwriter_ini, 'Settings', 'LogFile', streamwriter_log);

let sw_recording = utils.ReadINI(settings_file, 'streamwriter', 'recording');
let sw_url = utils.ReadINI(settings_file, 'streamwriter', 'url');

let sw_enabled = utils.ReadINI(settings_file, 'streamwriter', 'enabled');

if (sw_enabled == "") {
    sw_enabled = 0;
    utils.WriteINI(settings_file, 'streamwriter', 'enabled', 0);
}

if (utils.FileExists(streamwriter_log) && sw_recording == 0)
    try {
        fso.DeleteFile(streamwriter_log);
    } catch (err) {}
	

let urlreg = new RegExp("http", "i");
let mp3reg = new RegExp("mp3", "i");
let aacreg = new RegExp("aac", "i");

function _menu_() {
    this.rbtn_up = (x, y) => {
        panel.m.AppendMenuItem(MF_STRING, 2000, 'Use StreamWriter');
        panel.m.CheckMenuItem(2000, (sw_enabled == '1'));
    }

    this.rbtn_up_done = (idx) => {

        switch (idx) {
        case 2000:
            sw_enabled = (sw_enabled == '1') ? 0 : 1;
            utils.WriteINI(settings_file, 'streamwriter', 'enabled', sw_enabled);
            if (sw_enabled == 0) {
                clearInterval(timer);
                const exit_sw = "\"" + fb.ProfilePath + 'themes\\footuner\\bin\\streamwriter\\ExitSW.exe' + "\"";
                utils.WriteINI(settings_file, 'streamwriter', 'recording', 0);
                sw_recording = 0;
                utils.WriteINI(settings_file, 'streamwriter', 'url', '');
                WshShell.Run(exit_sw, 0, false);
            }
            if (sw_enabled == 1 && sw_recording == 0) {
                let cmd = "\"" + streamwriter_exe + "\"" + " -minimize " + "\"" + " -datadir " + "\"" + streamwriter_dir + "\"" + " -tempdir " + "\"" + streamwriter_temp_dir + "\"";
                console.log("Recorder: " + cmd);
                WshShell.Run(cmd, 0, false);
            }
            g_text = (sw_enabled == '1') ? 'StreamWriter Enabled' : 'StreamWriter Disabled';
            window.Repaint();
            break;

        }
    }
}

let panel = new _panel(true);
let menu_sw = new _menu_();
let g_text = (sw_enabled == '1') ? 'StreamWriter Enabled' : 'StreamWriter Disabled';
let timer = 0;

panel.item_focus_change();

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

function on_mouse_rbtn_up(x, y) {
    return panel.rbtn_up(x, y, menu_sw);
}

function on_paint(gr) {
    panel.paint(gr);
    gr.GdiDrawText(g_text, panel.fonts.normal, panel.colours.highlight, LM, 0, panel.w - (LM * 2), panel.h, LEFT);
}

function on_playback_new_track() {

    panel.item_focus_change();
    if (sw_enabled == 1) {
        let np_tf_stream_name = panel.tf("$if3([%stream_tunein_name%],[%stream_crb_name%],[%stream_ffprobe_name%],[$info(@)],[%path%])").trim();
        let url = panel.tf("$if3([$info(@)],[%stream_url%],[%path%])");
        let format = panel.tf("$if2([%stream_ffprobe_format%],[%codec%])");

        if (urlreg.test(url) && (mp3reg.test(format) || aacreg.test(format))) {
            let cmd = "\"" + streamwriter_exe + "\"" + " -minimize -r " + "\"" + url.split('?')[0] + "\"" + " -datadir " + "\"" + streamwriter_dir + "\"" + " -tempdir " + "\"" + streamwriter_temp_dir + "\"";
            console.log("Recorder: " + cmd);
            WshShell.Run(cmd, 0, false);
            sw_recording = 1;
            utils.WriteINI(settings_file, 'streamwriter', 'recording', 1);
            utils.WriteINI(settings_file, 'streamwriter', 'url', url.split('?')[0]);
            monitor(url.split('?')[0]);
        } else {
            g_text = 'StreamWriter\nCan only record mp3 / aac streams';
            window.Repaint();
            return;
        }
    }
}

function on_playback_stop(reason) {
    clearInterval(timer);
    if (reason != 2) {
        panel.item_focus_change();
    }
    if (sw_enabled == 1 && sw_recording == 1) {
        let cmd = "\"" + streamwriter_exe + "\"" + " -minimize -sr " + utils.ReadINI(settings_file, 'streamwriter', 'url') + " -datadir " + "\"" + streamwriter_dir + "\"" + " -tempdir " + "\"" + streamwriter_temp_dir + "\"";
        console.log("Recorder: " + cmd);
        WshShell.Run(cmd, 0, false);
        sw_recording = 0;
        utils.WriteINI(settings_file, 'streamwriter', 'recording', 0);
        utils.WriteINI(settings_file, 'streamwriter', 'url', '');
        g_text = (sw_enabled == '1') ? 'StreamWriter Enabled' : 'StreamWriter Disabled';
        window.Repaint();

        try {
            fso.DeleteFile(streamwriter_log);
        } catch (err) {}
    }
}

function monitor(url) {
    timer = setInterval(() => {
            if (utils.FileTest(streamwriter_log, "e")) {
                g_text = 'StreamWriter (External application - minimized in tray)\nRecording: ' + url + '\n\n';
                let lines;
                let objADOStream = new ActiveXObject("ADODB.Stream");
                objADOStream.Open();
                objADOStream.LoadFromFile(streamwriter_log);

                let log_txt = objADOStream.ReadText();
                objADOStream.Close();
                let k = log_txt.split('\r');

                for (var i = (k.length - 8); i < k.length; i++) {
                    try {
                        const indexOfFirst = k[i].indexOf(" - ");
                        const indexOfSecond = k[i].indexOf(" - ", (indexOfFirst + 1));
                        g_text += k[i].slice(k[i].indexOf(" - ", (indexOfSecond + 1))) + '\n';
                    } catch (err) {}
                }
            }
            window.Repaint();
        }, 5000);
}

function on_playback_dynamic_info_track() {
    panel.item_focus_change();
}

function on_playlist_switch() {
    panel.item_focus_change();
}

function on_size() {
    panel.size();
}

if (sw_enabled == 1 && sw_recording == 0 && fb.IsPlaying) {
    on_playback_new_track();
}

if (sw_recording == 1 && sw_enabled == 1 && fb.IsPlaying) {
    monitor(panel.tf("$if3([$info(@)],[%stream_url%],[%path%])"));
}
