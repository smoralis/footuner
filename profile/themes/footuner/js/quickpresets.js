//QuickPresets

include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\lodash.min.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\helpers.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\panel.js');

const userdata_folder = fb.FoobarPath + "user-data\\";
const settings_file = userdata_folder + 'settings.ini';

const logo_folder = userdata_folder + 'presets\\';
const offset = 5;
const helptext1 = "\n\nShift-Click to Save (Station must be playing)";
const helptext2 = "\n\nClick to play\nCtrl-Click to Clear";
const preset_ph_logo = fb.ProfilePath + 'themes\\footuner\\images\\presets\\Preset.png';

if (!fso.FolderExists(logo_folder))
    fso.CreateFolder(logo_folder);

if (plman.FindPlaylist("Presets") == -1)
    plman.CreatePlaylist(plman.PlaylistCount, "Presets");

let presets_arr = [];
let presetname_arr = [];
let presetlogo_arr = [];

function read_ini() {
    for (let i = 0; i < 20; i++) {
        presets_arr[i] = utils.ReadINI(settings_file, 'presets', (i + first));
        presetname_arr[i] = utils.ReadINI(settings_file, 'presetname', (i + first));
        presetlogo_arr[i] = logo_folder + (i + first) + '.png';
    }
}

read_ini();

function write_ini(preset, filename, text) {
    utils.WriteINI(settings_file, 'presets', preset, filename);
    utils.WriteINI(settings_file, 'presetname', preset, text);
}

let panel = new _panel(true);
let buttons = new _buttons();
let bs;

function buttonss() {
    for (let i = 0; i < 20; i++) {
        buttons.buttons[i] = new _button(offset + bs * i, offset, bs - offset * 2, bs - offset * 2, {
                normal: _isFile(presetlogo_arr[i]) ? presetlogo_arr[i] : preset_ph_logo
            }, (x, y, mask) => {
                preset(x, y, mask, i + first);
            }, _.isEmpty(presetname_arr[i]) ? 'Empty Preset' + helptext1 : presetname_arr[i] + helptext2);
    }
}

function play(filename) {
    if (filename) {
        let mfilename = userdata_folder + "mtags\\" + filename;
        let cmd;
        if (utils.FileTest(mfilename, "e")) {
            cmd = "\"" + fb.FoobarPath + "foobar2000.exe" + "\"" + "/run_main:\"View/Switch to playlist/Presets\" /run_main:Edit/Clear /add /immediate " + "\"" + userdata_folder + "mtags\\" + filename + "\"";
        } else {
            cmd = "\"" + fb.FoobarPath + "foobar2000.exe" + "\"" + "/run_main:\"View/Switch to playlist/Presets\" /run_main:Edit/Clear /add /immediate " + "\"" + filename + "\"";
        }

        WshShell.Run(cmd, 0, true);
        cmd = "\"" + fb.FoobarPath + "foobar2000.exe" + "\"" + " /play ";
        WshShell.Run(cmd, 0, true);
    }
}

function savepreset(preset) {
    if (fb.IsPlaying) {
        let text;
        let filename = userdata_folder + "mtags\\" + fb.TitleFormat("%directoryname%").Eval(true) + "\\" + fb.TitleFormat("%filename_ext%").Eval(true);
        if (utils.FileTest(filename, "e")) {
            filename = fb.TitleFormat("%directoryname%").Eval(true) + "\\" + fb.TitleFormat("%filename_ext%").Eval(true);
            text = fb.TitleFormat("$if3([%stream_tunein_name%],[%stream_crb_name%],[%stream_ffprobe_name%],[$info(@)],[%path%])").Eval(true);
        } else {
            filename = fb.TitleFormat("%path%").Eval(true);
            text = fb.TitleFormat("%title%").EvalWithMetadb(fb.GetNowPlaying());
        }
        if (utils.FileTest(logo_folder + preset + ".png", "e"))
            fso.DeleteFile(logo_folder + preset + ".png");
        let g_img = utils.GetAlbumArtV2(fb.GetNowPlaying(), 0);
        let g_img_save = g_img.Resize(300, 300);
        if (g_img_save) {
            g_img_save.SaveAs(logo_folder + preset + ".png", "image/png");
        }
        write_ini(preset, filename, text);
        read_ini();
        buttonss();
        window.Repaint();
    }
}

function clearpreset(preset) {
    let filename = "";
    let text = "";
    write_ini(preset, filename, text);
    read_ini();
    if (utils.FileTest(logo_folder + preset + ".png", "e"))
        fso.DeleteFile(logo_folder + preset + ".png");
    buttonss();
    window.Repaint();
}

function preset(x, y, mask, preset_no) {
    if (mask == 4) {
        savepreset(preset_no);
    } else if (mask == 8) {
        clearpreset(preset_no);
    } else {
        play(utils.ReadINI(settings_file, 'presets', preset_no));
    }
}

function on_focus(is_focused) {
    if (is_focused) {
        plman.SetActivePlaylistContext();
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
    for (let i = 0; i < 20; i++) {
        gr.DrawRect(offset + bs * i, offset, bs - offset * 2, bs - offset * 2, 3, _RGB(117, 117, 117));
    }
}

function on_size() {
    panel.size();
    bs = panel.w / 20;
    buttonss();
}
