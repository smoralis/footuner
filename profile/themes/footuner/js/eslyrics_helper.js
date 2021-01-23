//eslyrics_helper

"use strict";

// Use with GdiDrawText()
const DT_CENTER = 0x00000001;
const DT_VCENTER = 0x00000004;
const DT_WORDBREAK = 0x00000010;
const DT_CALCRECT = 0x00000400;
const DT_NOPREFIX = 0x00000800;

// Used in window.GetColorCUI()
const ColourTypeCUI = {
    text: 0,
    selection_text: 1,
    inactive_selection_text: 2,
    background: 3,
    selection_background: 4,
    inactive_selection_background: 5,
    active_item_frame: 6
};

// Used in window.GetFontCUI()
const FontTypeCUI = {
    items: 0,
    labels: 1
};

// Used in window.GetColourDUI()
const ColourTypeDUI = {
    text: 0,
    background: 1,
    highlight: 2,
    selection: 3
};

// Used in window.GetFontDUI()
const FontTypeDUI = {
    defaults: 0,
    tabs: 1,
    lists: 2,
    playlists: 3,
    statusbar: 4,
    console: 5
};

// Used in window.SetCursor()
const IDC_HAND = 32649;

let g_is_default_ui = window.InstanceType;
let g_font = null;
let g_text = "ESLyric Helper";
let g_textcolour = 0;
let g_textcolour_hl = 0;
let g_backcolour = 0;
let g_hot = false;

let ww = 0;
let wh = 0;

get_font();
get_colours();

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, g_backcolour);
    gr.GdiDrawText(g_text, g_font, g_hot ? g_textcolour_hl : g_textcolour, 0, 0, ww, wh, DT_VCENTER | DT_CENTER | DT_WORDBREAK | DT_CALCRECT | DT_NOPREFIX);
}

function on_size(width, height) {
    ww = width;
    wh = height;
}

function on_mouse_lbtn_up(x, y) {
    window.ShowConfigure();
}

function on_mouse_move() {
    if (!g_hot) {
        g_hot = true;
        window.SetCursor(IDC_HAND);
        window.Repaint();
    }
}

function on_mouse_leave() {
    if (g_hot) {
        g_hot = false;
        window.Repaint();
    }
}

function on_font_changed() {
    get_font();
    window.Repaint();
}

function on_colours_changed() {
    get_colours();
    window.Repaint();
}

function get_font() {
    if (g_is_default_ui) { // DUI
        g_font = window.GetFontDUI(FontTypeDUI.defaults);
    } else { // CUI
        g_font = window.GetFontCUI(FontTypeCUI.items);
    }
}

function get_colours() {
    if (g_is_default_ui) { // DUI
        g_textcolour = window.GetColourDUI(ColourTypeDUI.text);
        g_textcolour_hl = window.GetColourDUI(ColourTypeDUI.highlight);
        g_backcolour = window.GetColourDUI(ColourTypeDUI.background);
    } else { // CUI
        g_textcolour = window.GetColourCUI(ColourTypeCUI.text);
        g_textcolour_hl = window.GetColourCUI(ColourTypeCUI.text);
        g_backcolour = window.GetColourCUI(ColourTypeCUI.background);
    }
}

const userdata_folder = fb.FoobarPath + "user-data\\";
const access_token_file = userdata_folder + "GeniusClientAccessToken.txt";

if (!utils.FileTest(access_token_file, "e")){
	utils.WriteTextFile(access_token_file, "74kICtH7KOvyhQxuA_gzJjuR4EH4eTdvHPvrI5wzCgvUgcRIyf6yEzOBavRe8zgU");	
}

var esl = new ActiveXObject("ESLyric");
let title;
let artist;
let stream_reverse = fb.ProfilePath + "themes\\footuner\\reverse";

function on_playback_new_track(metadb) {
    set_reverse(metadb);
	title = null;
	artist = null;
	if (fb.TitleFormat("[%path%]").EvalWithMetadb(metadb).includes("recordings")) esl.RunPanelContextMenu("Reload lyric");
}

function on_playback_edited(metadb) {
    set_reverse(metadb);
	let reverse_status_eval = fb.TitleFormat("[%stream_reverse%]").EvalWithMetadb(metadb);
    let reverse_status = reverse_status_eval ? 1 : 0;
	let cur_title = reverse_status ? fb.TitleFormat("%artist%").Eval() : fb.TitleFormat("%title%").Eval();
	let cur_artist = reverse_status ? fb.TitleFormat("%title%").Eval() : fb.TitleFormat("%artist%").Eval();	
	
	if (title != cur_title && artist != cur_artist){
    esl.RunPanelContextMenu("Reload lyric");
	title = reverse_status ? fb.TitleFormat("%artist%").Eval() : fb.TitleFormat("%title%").Eval();
	artist = reverse_status ? fb.TitleFormat("%title%").Eval() : fb.TitleFormat("%artist%").Eval();	
	}
}

function on_playback_dynamic_info_track() {
	let reverse_status_eval = fb.TitleFormat("[%stream_reverse%]").EvalWithMetadb(fb.GetNowPlaying());
    let reverse_status = reverse_status_eval ? 1 : 0;
	let cur_title = reverse_status ? fb.TitleFormat("%artist%").Eval() : fb.TitleFormat("%title%").Eval();
	let cur_artist = reverse_status ? fb.TitleFormat("%title%").Eval() : fb.TitleFormat("%artist%").Eval();	
	
	if (title != cur_title && artist != cur_artist){
    esl.RunPanelContextMenu("Reload lyric");
	title = reverse_status ? fb.TitleFormat("%artist%").Eval() : fb.TitleFormat("%title%").Eval();
	artist = reverse_status ? fb.TitleFormat("%title%").Eval() : fb.TitleFormat("%artist%").Eval();	
	}
}

function set_reverse(metadb) {
    let reverse_status_eval = fb.TitleFormat("[%stream_reverse%]").EvalWithMetadb(metadb);
    let reverse_status = reverse_status_eval ? 1 : 0;
    utils.WriteTextFile(stream_reverse, reverse_status, false);
}

