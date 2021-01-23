//js tabs


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
let g_textcolour = 0;
let g_textcolour_hl = 0;
let g_backcolour = 0;
let g_backcolour2 = 0;
let g_backcolour3 = 0;
let g_hot = false;

let ww = 0;
let wh = 0;
let bw = 0;

let tabs_visible = 5;
let active = window.GetProperty("active", 0);

function RGB(r, g, b) {
	return 0xFF000000 | r << 16 | g << 8 | b;
}

get_font();
get_colours();

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, g_backcolour);

    gr.FillSolidRect(0, 0, bpn - 10, 25, g_backcolour4);
    gr.GdiDrawText("<<<", g_font, g_hot ? g_textcolour_hl : g_textcolour, 0, 0, bpn, 25, DT_VCENTER | DT_CENTER | DT_WORDBREAK | DT_CALCRECT | DT_NOPREFIX);

    gr.FillSolidRect((bw * tabs_visible) - bpn, 0, bpn - 10, 25, g_backcolour4);
    gr.GdiDrawText(">>>", g_font, g_hot ? g_textcolour_hl : g_textcolour, (bw * tabs_visible) - bpn - 10, 0, bpn, 25, DT_VCENTER | DT_CENTER | DT_WORDBREAK | DT_CALCRECT | DT_NOPREFIX);

    tabs = 0;
    try {
        for (var i = active; i < active + tabs_visible - 1; i++) {
            if (p_array[i]) {
                gr.FillSolidRect(bw * tabs + bpn, 0, bw - 10, 25, (i == active) ? g_backcolour3 : g_backcolour4);
                gr.GdiDrawText(p_array[i].split("_").pop(), g_font, g_hot ? g_textcolour_hl : g_textcolour, bw * tabs + bpn, 0, bw - 10, 25, DT_VCENTER | DT_CENTER | DT_WORDBREAK | DT_CALCRECT | DT_NOPREFIX);
                tabs++;
            }
            if (i == active) {
                this[p_array[i]].Move(0, 30, ww, wh - 30);
                this[p_array[i]].Show(true);
            }
        }
    } catch (err) {}
}

function on_size() {
    ww = window.Width;
    wh = window.Height;
    bw = ww / tabs_visible;
    bpn = bw / 2;
}

function on_mouse_lbtn_up(x, y) {

    if (x < bpn && active != 0) {
        active = active - 1;
        window.SetProperty("active", active);
        hide_panels();
        window.Repaint();
    }
    if (x > ww - bpn && active != p_array.length - 1) {
        active = active + 1;
        window.SetProperty("active", active);
        hide_panels();
        window.Repaint();
    }
    if (x > bpn && x < (ww - bpn)) {
        let xval = x / (ww / (tabs_visible - 1));
        arr_test = Math.floor(xval) + active;
        if (arr_test < p_array.length) {
            active = Math.floor(xval) + active;
            window.SetProperty("active", active);
            hide_panels();
            window.Repaint();
        }
    }
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
        g_backcolour2 = window.GetColourCUI(ColourTypeCUI.active_item_frame);
        g_backcolour3 = window.GetColourCUI(ColourTypeCUI.selection_background);
		g_backcolour4 = RGB(90,90,90);
    }
}

function hide_panels() {
    for (var k = 0; k < p_array.length; k++) {
        this[p_array[k]].Show(false);
    }

}

let p_array = [];
try {
    for (var i = 0; i < 150; i++) {
        let p_name = window.GetPanelByIndex(i).Text;
        p_array.push(p_name);
        p_array.sort();
    }
} catch (err) {}

for (var j = 0; j < p_array.length; j++) {
    this[p_array[j]] = window.GetPanel(p_array[j]);
    this[p_array[j]].Locked = false;
    this[p_array[j]].ShowCaption = false;
    this[p_array[j]].Hidden = true;
}
