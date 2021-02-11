//Directories Search Menu

include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\lodash.min.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\helpers.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\samples\\complete\\js\\panel.js');
include(fb.ProfilePath + 'themes\\footuner\\bin\\he.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\tunein.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\crb.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\live365.js');
include(fb.ProfilePath + 'themes\\footuner\\js\\icecast.js');

const ffprobe_exe = fb.ProfilePath + "themes\\footuner\\bin\\ffprobe.exe";
const jq_exe = fb.ProfilePath + "themes\\footuner\\bin\\jq.exe";
const download_vbs = fb.ProfilePath + "themes\\footuner\\bin\\download.vbs";
const mtags_folder = userdata_folder + "mtags\\";
const temp_folder = fb.ProfilePath + "themes\\footuner\\temp\\";
const f2k_img = fb.ProfilePath + "themes\\footuner\\js\\samples\\complete\\images\\misc\\foobar2000.png";

if (!fso.FolderExists(mtags_folder))
    fso.CreateFolder(mtags_folder);

if (!fso.FolderExists(temp_folder))
    fso.CreateFolder(temp_folder);

let panel = new _panel(true);
let buttons = new _buttons();
let bs;

function buttonss() {
    buttons.buttons.menu = new _button(0, 0, bs, bs, {
            normal: f2k_img
        }, (x, y, mask) => {
            _menu(0, bs);
        }, 'Fobar2000\'s Menu');
    buttons.buttons.tunein = new _button(bs * 1.5, 0, bs, bs, {
            normal: tunein_ico
        }, (x, y) => {
            tunein_main_menu();
        }, 'Tunein Radio Search');
    buttons.buttons.crb = new _button(bs * 3, 0, bs, bs, {
            normal: radio_ico
        }, (x, y) => {
            crb_main_menu();
        }, 'Community Radio Browser Search');
    buttons.buttons.live365 = new _button(bs * 4.5, 0, bs, bs, {
            normal: live365_ico
        }, (x, y) => {
            live365_main_menu();
        }, 'Live365 Search');
    buttons.buttons.icecast = new _button(bs * 6, 0, bs, bs, {
            normal: icecast_ico
        }, (x, y) => {
            icecast_main_menu();
        }, 'Icecast Search');
}

let xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
let statustext = "Idle";
let ml_arr = [];

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

function _batEscape(value) {
    return value.replace(/\^/g, "^^").replace(/\|/g, "^|").replace(/\\/g, "^\\").replace(/\&/g, "^&").replace(/\>/g, "^>").replace(/\</g, "^<").replace(/\"/g, "''");
}

function _menuEscape(value) {
    return value.replace(/\^/g, "^^").replace(/\|/g, "||").replace(/\\/g, "\\\\").replace(/\&/g, "&&").replace(/\>/g, ">>").replace(/\</g, "<<")
}

function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
        }

        const varA = (typeof a[key] === 'string')
         ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
         ? b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order === 'desc') ? (comparison * -1) : comparison);
    };
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
    bs = panel.w / 8;
    buttonss();
}

function on_library_items_added() {
    ml_get_ids();
}

function on_library_items_removed() {
    ml_get_ids();
}

function ml_get_ids() {
    let media = fb.GetLibraryItems();
    media.Sort();
    let media_items_array = media.Convert();
    ml_arr = [];
    for (let i = 0; i < media_items_array.length; ++i) {
        let f = media_items_array[i].GetFileInfo();
        if (f.MetaFind("STREAM_TUNEIN_ID") != -1) {
            let value = f.MetaValue(f.MetaFind("STREAM_TUNEIN_ID"), 0);
            ml_arr.push(value);
        }
        if (f.MetaFind("STREAM_CRB_ID") != -1) {
            let value = f.MetaValue(f.MetaFind("STREAM_CRB_ID"), 0);
            ml_arr.push(value);
        }
        if (f.MetaFind("STREAM_LIVE365_MOUNT_ID") != -1) {
            let value = f.MetaValue(f.MetaFind("STREAM_LIVE365_MOUNT_ID"), 0);
            ml_arr.push(value);
        }
        if (f.MetaFind("STREAM_ID_CRC32") != -1) {
            let value = f.MetaValue(f.MetaFind("STREAM_ID_CRC32"), 0);
            ml_arr.push(value);
        }
    }
}

//on_load
ml_get_ids();
