//Recorder

include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\lodash.min.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\helpers.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\panel.js');

const userdata_folder = fb.FoobarPath + "user-data\\";
const settings_file = userdata_folder + 'settings.ini';

function _recorder_menu() {
    this.rbtn_up = (x, y) => {
        panel.m.AppendMenuItem(MF_STRING, 2000, 'StreamRipper (Enable/Disable)');
        panel.m.CheckMenuItem(2000, this.properties.sr.enabled);
        panel.m.AppendMenuSeparator();
        panel.m.AppendMenuItem(MF_STRING, 2001, 'StreamRipper Monitor (Enable/Disable)');
        panel.m.CheckMenuItem(2001, this.properties.srm.enabled);
        panel.m.AppendMenuSeparator();
        panel.m.AppendMenuItem(MF_STRING, 2002, 'Delete incomplete when idle (Yes/No)');
        panel.m.CheckMenuItem(2002, this.properties.srd.enabled);
        panel.m.AppendMenuSeparator();
    }

    this.rbtn_up_done = (idx) => {
        switch (idx) {
        case 2000:
            this.properties.sr.toggle();
            g_text = recorder.properties.sr.enabled ? 'StreamRipper (Enabled)' : 'StreamRipper (Disabled)';
            window.Repaint();
            if (!this.properties.sr.enabled) {
                kill_streamripper();
            } else {
                on_playback_new_track();
            }
            break;
        case 2001:
            this.properties.srm.toggle();
            if (this.properties.srm.enabled && this.properties.sr.enabled)
                monitor();
            else {
                clearInterval(timer);
                if (sr_running)
                    g_text = 'Recording...';
                else
                    g_text = recorder.properties.sr.enabled ? 'StreamRipper (Enabled)' : 'StreamRipper (Disabled)';
                window.Repaint();
            }
            break;
        case 2002:
            this.properties.srd.toggle();
            break;
        }
    }

    this.properties = {};
    this.properties.sr = new _p('2K3.SR', true);
    this.properties.srm = new _p('2K3.SRM', true);
    this.properties.srd = new _p('2K3.SRD', true);
}

let panel = new _panel(true);
let recorder = new _recorder_menu();
let g_text = recorder.properties.sr.enabled ? 'StreamRipper (Enabled)' : 'StreamRipper (Disabled)';
let timer = 0;
let timer_m = 0;

const streamripper_bat = fb.ProfilePath + 'themes\\footuner\\bin\\streamripper\\streamripper.bat';
const streamripper_exe = fb.ProfilePath + 'themes\\footuner\\bin\\streamripper\\streamripper.exe';
const recordings_folder = userdata_folder + 'recordings';
const taskkill_bat = "\"" + fb.ProfilePath + 'themes\\footuner\\bin\\streamripper\\taskkill.bat' + "\"";
const streamripper_txt = fb.ProfilePath + 'themes\\footuner\\bin\\streamripper\\streamripper.txt';

let sr_running = utils.ReadINI(settings_file, 'streamripper', 'running');

let srreg = new RegExp("INFO*", "i");
let urlreg = new RegExp("http://", "i");
let httpsreg = new RegExp("https://", "i");
let blacklistreg = new RegExp("live365", "i");

if (!fso.FolderExists(recordings_folder))
    fso.CreateFolder(recordings_folder);

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
    return panel.rbtn_up(x, y, recorder);
}

function on_mouse_lbtn_dblclk(x, y) {
    _run(streamripper_txt);
}

function on_paint(gr) {
    panel.paint(gr);
    gr.GdiDrawText(g_text, panel.fonts.normal, panel.colours.highlight, LM, 0, panel.w - (LM * 2), panel.h, LEFT);
}

function on_playback_new_track() {
    clearInterval(timer);
    panel.item_focus_change();
    kill_streamripper();

    let np_tf_stream_name = panel.tf("$if3([%stream_tunein_name%],[%stream_crb_name%],[%stream_ffprobe_name%],[$info(@)],[%path%])").trim();
    let url = panel.tf("$if3([$info(@)],[%stream_url%],[%path%])");

    if (url.match(blacklistreg)) {
        g_text = "StreamRipper can't rip live365 streams";
        window.Repaint();
        return;
    }

    if (url.match(httpsreg)) {
        //try with http
        url = url.replace(/^https:\/\//i, 'http://');
    }

    if (sr_running == 0 && recorder.properties.sr.enabled) {
        if (url.match(urlreg) && !url.match(blacklistreg)) {
            utils.WriteINI(settings_file, 'streamripper', 'running', 1);
            let cmd = "\"" + streamripper_bat + "\"" + " " + "\"" + streamripper_exe + "\"" + " " + "\"" + url.split('?')[0] + "\"" + " " + "\"" + recordings_folder + "\\" + _fbSanitise(np_tf_stream_name) + "\"" + " " + "\"" + streamripper_txt + "\"";
            console.log("Recorder: " + cmd);
            WshShell.Run(cmd, 0, false);
            sr_running = 1;
            if (recorder.properties.srm.enabled) {
                timer_m = setTimeout(() => {
                        monitor();
                    }, 2000);
            } else {
                g_text = 'Recording';
                window.Repaint();
            }
        }
    }
}

function on_playback_stop(reason) {
    if (reason != 2) {
        panel.item_focus_change();
    }
    clearInterval(timer);
    kill_streamripper();
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

function kill_streamripper() {
    sr_running = 0;
    utils.WriteINI(settings_file, 'streamripper', 'running', 0);
    clearInterval(timer);
    g_text = recorder.properties.sr.enabled ? 'StreamRipper (Enabled)' : 'StreamRipper (Disabled)';
    window.Repaint();
    let cmd = taskkill_bat;
    WshShell.Run(cmd, 0, true);
    if (recorder.properties.srd.enabled)
        clean_recordings(recordings_folder);
}

function monitor() {
    timer = setInterval(() => {
            if (utils.FileTest(streamripper_txt, "e")) {
                let lines;
                let ts = fso.OpenTextFile(streamripper_txt, 1, true);
                lines = ts.ReadAll();
                let k = lines.split('\r');
                g_text = "StreamRipper";
                g_text += k[1];
                g_text += k[2];
                g_text += k[3];
                g_text += k[4] + "\n\n";
                g_text += k[k.length - 2];
                ts.Close();
            }
            window.Repaint();
        }, 3000);
}

if (sr_running == 0 && fb.IsPlaying) {
    on_playback_new_track();
}

if (sr_running == 1) {
    monitor();
}

if (sr_running == 0 && recorder.properties.srd.enabled)
    clean_recordings(recordings_folder);

function clean_recordings(rfolder) {

    let f = fso.GetFolder(rfolder);

    let folcol = new Enumerator(f.SubFolders);

    let fstring = rfolder.toString();

    if (fstring.slice(fstring.length - 10) == "incomplete") {
        f.Delete(true);
        console.log("Recorder: Deleted - " + fstring);
    } else if (f.Files.Count == 0 && f.SubFolders.Count == 0 && fstring != recordings_folder) {
        f.Delete();
        console.log("Recorder: Deleted - " + fstring);
    }

    for (; !folcol.atEnd(); folcol.moveNext()) {
        clean_recordings(folcol.item());
    }
}
