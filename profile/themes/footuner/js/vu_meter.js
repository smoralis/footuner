// VU meter

function RGB(r,g,b) { return (0xff000000|(r<<16)|(g<<8)|(b)); }
function RGBA(r, g, b, a) { return ((a << 24) | (r << 16) | (g << 8) | (b)); } 

let font = gdi.Font("Segoe UI",9,1);
    

let g_hot = false;

function StringFormat() {
	let h_align = 0, v_align = 0, trimming = 0, flags = 0;
	switch (arguments.length)
	{
	// fall-thru
	case 4:
		flags = arguments[3];
	case 3:
		trimming = arguments[2];
	case 2:
		v_align = arguments[1];
	case 1:
		h_align = arguments[0];
		break;
	default:
		return 0;
	}
	return ((h_align << 28) | (v_align << 24) | (trimming << 20) | flags);
}

let ww, wh;

//=================================================// Titleformat field
let tf_title = fb.TitleFormat("%title%");
let tf_artist = fb.TitleFormat("$if2(%artist%,'N/A')");
let tf_album = fb.TitleFormat("$if(%length%,$if2(%album%,'Single'),'~Stream')");
let tf_date = fb.TitleFormat("$meta(date,0)"); // $meta(date,0)
let tf_genre = fb.TitleFormat("$if2(%genre%,'N/A')");

let g_metadb;
let g_title, g_artist, g_album, g_date, g_genre;

let color = {
    0:RGB(50,50,50),
    1:RGB(60,60,60),
    2:RGB(70,70,70),
    3:RGB(90,90,90),
    4:RGB(110,110,110),
    5:RGB(120,120,120),
    6:RGB(130,130,130),
    7:RGB(140,140,140),
    8:RGB(160,160,160),
    9:RGB(255,160,160),
    10:RGB(255,140,140),
    11:RGB(255,120,120),
    12:RGB(255,100,100)
};

let db = {
    0:-25,
    1:-20,
    2:-15,
    3:-10,
    4:-7,
    5:-5,
    6:-3,
    7:-1,
    8:0,
    9:1,
    10:3,
    11:5,
    12:7
};

VUMeter = new ActiveXObject("VUMeter");
VUMeter.RegisterWindow(window.ID);
//VUMeter.RegisterRect(window.ID,0,0,300,20);

function ToDB(Level){
    return Math.round(2000*Math.log(Level)/Math.LN10)/100;
}

function on_mouse_wheel(step) {
    VUMeter.Offset=VUMeter.Offset+step;
}

function on_size() {
    ww = window.Width;
    wh = window.Height;
}
let wL, wR;  
function on_paint(gr) {

    L=VUMeter.LeftLevel;
    R=VUMeter.RightLevel;
    LM=VUMeter.LeftPeak;
    RM=VUMeter.RightPeak;

    let col = 12;        
    let yL = 5;    
    let yR = yL +28;     
    let yLM = 8;   
    let yRM = yLM + 26;   
    let hM = 7;   
    //let h = 3;   
    //let offset = (ww - col) / 12;   
    //let w = offset - 2;   

    gr.FillSolidRect(0, 0, ww, wh, RGB(240,240,240));
        
    let yl = 10;
    let y2 = yl + 18;
    let h = 3;
    let offset = (ww - 20) / 13;
    let w = (ww - 20) / 16;

    for (let i = 0; i <= 12; i = i + 1) {   
//            gr.FillSolidRect(20 + i * offset, 3, w, 1, color[i]);
        if (fb.IsPlaying) {   
            gr.FillSolidRect(20 + i * offset, yl, w, h, ToDB(LM) >= db[i] ? color[i] : RGBA(0,0,0,0)); 
            gr.FillSolidRect(20 + i * offset, y2, w, h, ToDB(RM) >= db[i] ? color[i] : RGBA(0,0,0,0));  
            
            if((ToDB(L) > db[i] && ToDB(L) < db[i+1])) {wL = i * offset + offset/Math.abs(db[i+1]-db[i]) * Math.abs(ToDB(L)-db[i]) }   
            if (ToDB(L) > db[0]) gr.FillSolidRect(20, yL, wL, h, color[8]);   
   
            if((ToDB(R) > db[i] && ToDB(R) < db[i+1])) {wR = i * offset + offset/Math.abs(db[i+1]-db[i]) * Math.abs(ToDB(R)-db[i]) }   
            if (ToDB(R) > db[0])gr.FillSolidRect(20, yR, wR, h, color[8]);    
        }
        if (i >1 ) gr.GdiDrawText(db[i] > 0 ? "+" + db[i] : db[i] , font, color[i], 20 + offset * [i], yl + 5, ww, wh);
    }

    gr.GdiDrawText( "L" , font, color[7], 5, yl - 6, ww, wh);
    gr.GdiDrawText( "R" , font, color[7], 5, y2 - 1, ww, wh);
    gr.GdiDrawText( "DB" , font, color[4], 20, yl + 5, ww, wh);
    
    gr.FillGradRect(ww/2-1,56,ww/2-10,1,0,RGB(90,90,90),RGB(240,240,240));
    gr.FillGradRect(10,56,ww/2-10,1,180,RGB(90,90,90),RGB(240,240,240));
    gr.FillGradRect(ww/2-1,55,ww/2-10,1,0,RGB(255,255,255),RGB(240,240,240));
    gr.FillGradRect(10,55,ww/2-10,1,180,RGB(255,255,255),RGB(240,240,240));
    
    if (fb.IsPlaying) {
        if(g_metadb) {
            try {
                gr.gdiDrawText(g_title, font_t, RGB(10,10,10), 12, 40, ww-24, 16, DT_CENTER | DT_TOP | DT_NOPREFIX | DT_END_ELLIPSIS);
                gr.gdiDrawText(g_artist, font_t, RGB(150,150,150), 12, 56, ww-24, 16, DT_CENTER | DT_TOP | DT_NOPREFIX | DT_END_ELLIPSIS);
                /*if(g_date=="?") {
                    let line3 = g_genre;
                } else {
                    let line3 = g_genre + " (" + g_date + ")";
                }*/
                //gr.gdiDrawText(line3, gdi.Font("arial", 11, 0), RGB(70,70,70), 0, 57, ww, 16, DT_CENTER | DT_TOP | DT_NOPREFIX | DT_END_ELLIPSIS);
                //gr.gdiDrawText(g_album, gdi.Font("arial", 11, 0), RGB(70,70,70), 0, 42, ww, 16, DT_CENTER | DT_TOP | DT_NOPREFIX | DT_END_ELLIPSIS);
            } catch(e) {}
        }

    } else {
        //gr.GdiDrawText("Playback stopped!" , g_font, g_textcolor, 0, 0, ww, wh, DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX);
        //gr.DrawImage(fblogo, ww / 2 - 35, 9, 70, 70, 0, 40, 128, 128);
    };
}

/*
let seek_timer;
function on_playback_new_track(info) {
    seek_timer && window.ClearInterval(seek_timer);
    seek_timer = window.SetInterval(function() {
            window.Repaint(); 
    },10);
}  

function on_playback_stop(reason) {
    if(reason == 0) {
        window.ClearInterval(seek_timer);
        window.Repaint(); 
    }
}
*/
on_playback_new_track(fb.GetNowPlaying());

function on_playback_new_track(metadb) {
	g_artist = null; 
    on_item_focus_change();
}

function on_item_focus_change(playlist, from, to) {
    
    g_metadb = (fb.IsPlaying||fb.IsPaused)?fb.GetNowPlaying():plman.PlaylistItemCount(fb.ActivePlaylist)>0?fb.GetFocusItem():false;

    if(g_metadb) {
        on_metadb_changed();
    } else {
        g_title = "";
        g_artist = "";
        g_album = "";
        g_date = "";
        g_genre = "";
    }
}

// tag content changed
function on_metadb_changed(metadb, fromhook) {

    if(g_metadb) {
        g_title = tf_title.EvalWithMetadb(g_metadb);
        g_artist = tf_artist.EvalWithMetadb(g_metadb);
        g_album = tf_album.EvalWithMetadb(g_metadb);
        g_date = tf_date.EvalWithMetadb(g_metadb);
        g_genre = tf_genre.EvalWithMetadb(g_metadb);
        
        window.Repaint();
    }
}

function on_playback_stop(reason) {
    on_item_focus_change();
}

function on_mouse_lbtn_up(x, y) {
    //window.ShowConfigure();
    //fb.RunContextCommand("Properties");
    /*
    try { fb.RunMainMenuCommand('View/Columns playlist/Activate now playing' ); }
    catch(e) { }*/
    let nowplaying = plman.GetPlayingItemLocation();
    let pid = nowplaying.PlaylistItemIndex;
    if(fb.IsPlaying && pid>=0 && pid<plman.PlaylistItemCount(plman.PlayingPlaylist)) {
        plman.ActivePlaylist = plman.PlayingPlaylist
        plman.SetPlaylistFocusItem(plman.PlayingPlaylist, pid);
        plman.SetPlaylistSelectionSingle(plman.PlayingPlaylist, pid, true)
    };
}

function on_mouse_move() {
    if (!g_hot) {
 //       window.SetCursor(IDC_HAND);
        g_hot = true;
        window.Repaint();
    }
}

function on_mouse_leave() {
 //   window.SetCursor(IDC_ARROW);
    if (g_hot) {
        g_hot = false;
        window.Repaint();
    }
}