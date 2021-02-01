//Buttons

include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\lodash.min.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\helpers.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\panel.js');
include(fb.ProfilePath + 'themes\\footuner\\bin\\he.js');

const userdata_folder = fb.FoobarPath + "user-data\\";
const mp3DirectCut_bat = fb.ProfilePath + "themes\\footuner\\bin\\mp3DirectCut\\mp3DirectCut.bat";
const mp3DirectCut_exe = fb.ProfilePath + "themes\\footuner\\bin\\mp3DirectCut\\mp3DirectCut.exe";
const play_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\play.png";
const pause_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\pause.png";
const stop_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\stop.png";
const previous_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\previous.png";
const next_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\next.png";
const delete_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\delete.png";
const convert_ico = fb.ProfilePath + "themes\\footuner\\images\\buttons\\convert.png";

let panel = new _panel(true);
let buttons = new _buttons();
let bs;

function buttonss() {
    buttons.buttons.stop = new _button(bs * 0, 0, bs, bs, {
            normal: stop_ico
        }, (x, y) => {
            fb.Stop();
        }, 'Stop');
    buttons.buttons.play = new _button(bs * 1.5, 0, bs, bs, {
            normal: !fb.IsPlaying || fb.IsPaused ? play_ico : pause_ico
        }, (x, y) => {
            fb.PlayOrPause();
        }, !fb.IsPlaying || fb.IsPaused ? 'Play' : 'Pause');
    buttons.buttons.previous = new _button(bs * 3, 0, bs, bs, {
            normal: previous_ico
        }, (x, y) => {
            fb.Prev();
        }, 'Previous');
    buttons.buttons.next = new _button(bs * 4.5, 0, bs, bs, {
            normal: next_ico
        }, (x, y) => {
            fb.Next();
        }, 'Next');
    buttons.buttons.delete = new _button(bs * 6, 0, bs, bs, {
            normal: delete_ico
        }, (x, y) => {
            let selections = fb.GetSelections();
            if (selections.Count == 1)
                fb.RunContextCommandWithMetadb("File Operations/Delete File", fb.GetSelections());
            if (selections.Count > 1)
                fb.RunContextCommandWithMetadb("File Operations/Delete Files", fb.GetSelections());
        }, 'Delete File(s)');
    buttons.buttons.edit = new _button(bs * 7.5, 0, bs, bs, {
            normal: convert_ico
        }, (x, y) => {
            let cmd = "\"" + mp3DirectCut_bat + "\"" + " " + "\"" + mp3DirectCut_exe + "\"" + " " + "\"" + fb.TitleFormat("%path%").EvalWithMetadb(fb.GetSelection()) + "\"";
           console.log(cmd);
		   WshShell.Run(cmd, 0, false);
		   fb.Stop();
        }, 'mp3DirectCut');
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
    bs = panel.w / 10;
    buttonss();
}
