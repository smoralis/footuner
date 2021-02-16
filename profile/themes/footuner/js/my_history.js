//MyHistory

include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\lodash.min.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\helpers.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\panel.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\text.js');

const userdata_folder = fb.FoobarPath + "user-data\\";

let panel = new _panel(true);
let text = new _text('text_reader', LM, TM, 0, 0);
let myhistory = userdata_folder + "myhistory.txt";
let myhistory_json = userdata_folder + "myhistory.json";
let star = "";
text.properties.filename_tf.value = userdata_folder + "myhistory.txt";

if (_isFile(myhistory) == false) {
    utils.WriteTextFile(myhistory, "");
}

if (_isFile(myhistory_json) == false) {
    utils.WriteTextFile(myhistory_json, "");
}

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

function on_key_down(k) {
    text.key_down(k);
}

function on_metadb_changed() {
    text.metadb_changed();
}

function on_mouse_lbtn_up(x, y) {
    text.lbtn_up(x, y);
}

function on_mouse_move(x, y) {
    text.move(x, y);
}

function on_mouse_rbtn_up(x, y) {
    return panel.rbtn_up(x, y, text);
}

function on_mouse_wheel(s) {
    text.wheel(s);
}

function save_history(star) {
    if (fb.IsPlaying) {
        let ts = new Date();
        let fav = false;
        let strContents = utils.ReadTextFile(myhistory);
        let np_tf_artist = fb.TitleFormat("$ifequal(%stream_reverse%,1,[%title%],[%artist%])").Eval().trim();
        let np_tf_title = fb.TitleFormat("$ifequal(%stream_reverse%,1,[%artist%],[%title%])").Eval().trim();
        let np_tf_stream_name = fb.TitleFormat("$if3([%stream_tunein_name%],[%stream_crb_name%],[%stream_live365_name%],[%stream_ffprobe_name%],[$info(@)],[%path%])").Eval().trim();
        let strNewContents = "[" + ts.toLocaleString() + "] - [" + np_tf_stream_name + "] " + star + np_tf_artist + " - " + np_tf_title + "\n" + strContents.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, "");
        if (np_tf_artist && np_tf_title) {
            utils.WriteTextFile(myhistory, strNewContents);
            text.filename = '';
            panel.item_focus_change();

            //json file
            let arr = [];
            let json = utils.ReadTextFile(myhistory_json);
            try {
                let obj = JSON.parse(json);
                for (let i = 0; i < obj.length; i++) {
                    arr.push(obj[i]);
                }
            } catch (e) {}
            if (star)
                fav = true;
            arr.push({
                'date': ts.toLocaleString(),
                'station': np_tf_stream_name,
                'artist': np_tf_artist,
                'title': np_tf_title,
                'star': fav
            });
            utils.WriteTextFile(myhistory_json, JSON.stringify(arr, null, 2));
        }
    }
}

function on_mouse_lbtn_dblclk(x, y) {
    star = "[*****] ";
    save_history(star);
    star = "";
}

function on_main_menu(index) {
    switch (index) {
    case 1:
        star = "[*****] ";
        save_history(star);
        star = "";
        break;
    }
}

function on_paint(gr) {
    panel.paint(gr);
    gr.GdiDrawText(text.header_text(), panel.fonts.title, panel.colours.highlight, LM, 0, panel.w - (LM * 2), TM, LEFT);
    gr.DrawLine(text.x, text.y + 1, text.x + text.w, text.y + 1, 1, panel.colours.highlight);
    text.paint(gr);
}

function on_playback_dynamic_info_track() {
    panel.item_focus_change();
    if (text.properties.logmode.enabled)
        save_history(star);
}

function on_playback_new_track() {
    panel.item_focus_change();
}

function on_playback_stop(reason) {
    if (reason != 2) {
        panel.item_focus_change();
    }
}

function on_playlist_switch() {
    panel.item_focus_change();
}

function on_size() {
    panel.size();
    text.w = panel.w - (LM * 2);
    text.h = panel.h - TM;
    text.size();
}
