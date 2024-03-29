//Unload

const userdata_folder = fb.FoobarPath + "user-data\\";
const settings_file = userdata_folder + 'settings.ini';
const lastfm_cover_download_folder = userdata_folder + "lastfm_cover";

const exit_sw = "\"" + fb.ProfilePath + 'themes\\footuner\\bin\\streamwriter\\ExitSW.exe' + "\"";

let WshShell = new ActiveXObject('WScript.Shell');
let fso = new ActiveXObject('Scripting.FileSystemObject');

function on_script_unload() {
    if (!fb.IsPlaying) {
        utils.WriteINI(settings_file, 'streamwriter', 'recording', 0);
        utils.WriteINI(settings_file, 'streamwriter', 'url', '');
        WshShell.Run(exit_sw, 0, false);
        try {
            fso.DeleteFile(lastfm_cover_download_folder + "\\temp*.*");
        } catch (err) {}
    }
}
