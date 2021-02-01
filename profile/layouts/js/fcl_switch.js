//FCL Switch

include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\lodash.min.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\helpers.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\panel.js');

const filename = fb.ProfilePath + "layouts\\layout";

let panel = new _panel(true);
let buttons = new _buttons();
let bs;

function buttonss() {
    buttons.buttons.save = new _button(0, 0, bs, bs, {
            normal: fb.ProfilePath + 'layouts\\buttons\\save.png'
        }, (x, y, mask) => {
            save_fcl();
        }, 'Save Layout');
    buttons.buttons.switch = new _button(bs * 1.5, 0, bs, bs, {
            normal: fb.ProfilePath + 'layouts\\buttons\\switch.png'
        }, (x, y, mask) => {
            switch_fcl();
        }, 'Switch Layout');
}

function save_fcl() {
    let cmd = "\"" + fb.FoobarPath + "foobar2000.exe\" /columnsui:export-quiet " + "\"" + filename + current_layout + ".fcl" + "\"";
    WshShell.Run(cmd, 0, true);
}

function switch_fcl() {
    let _menu = window.CreatePopupMenu();
    _menu.AppendMenuItem(current_layout == 1 ? MF_STRING | MF_CHECKED : MF_STRING, 1, "Layout 1 (light mode)");
    _menu.AppendMenuItem(current_layout == 2 ? MF_STRING | MF_CHECKED : MF_STRING, 2, "Layout 2 (light mode)");
    _menu.AppendMenuItem(current_layout == 3 ? MF_STRING | MF_CHECKED : MF_STRING, 3, "Layout 3 (light mode)");
	_menu.AppendMenuItem(current_layout == 4 ? MF_STRING | MF_CHECKED : MF_STRING, 4, "Layout 4 (dark mode)");
	_menu.AppendMenuItem(current_layout == 5 ? MF_STRING | MF_CHECKED : MF_STRING, 5, "Layout 5 (dark mode)");
	_menu.AppendMenuItem(current_layout == 6 ? MF_STRING | MF_CHECKED : MF_STRING, 6, "Layout 6 (light mode)");
	_menu.AppendMenuItem(current_layout == 7 ? MF_STRING | MF_CHECKED : MF_STRING, 7, "Layout 7 (dark mode)");

    let idx = _menu.TrackPopupMenu(0, bs);

    switch (idx) {
    case 0:
        break;
    default:
        let cmd = "\"" + fb.FoobarPath + "foobar2000.exe\" /columnsui:export-quiet " + "\"" + filename + current_layout + ".fcl" + "\"";
        WshShell.Run(cmd, 0, true);
        let cmd2 = "\"" + fb.FoobarPath + "foobar2000.exe\" /columnsui:import-quiet " + "\"" + filename + idx + ".fcl" + "\"";
        WshShell.Run(cmd2, 0, true);
		if (idx < 3) fb.RunMainMenuCommand("View/Visualizations/Analog VU Meter skins/<Default>/YamahaW");
		if (idx == 4) fb.RunMainMenuCommand("View/Visualizations/Analog VU Meter skins/<Default>/UherCG321");
		if (idx == 5) fb.RunMainMenuCommand("View/Visualizations/Analog VU Meter skins/<Default>/Accuphase-A75");
        break;
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
}

function on_size() {
    panel.size();
    bs = panel.w / 3;
    buttonss();
}
