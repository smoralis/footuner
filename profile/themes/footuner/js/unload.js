//Unload

const userdata_folder = fb.FoobarPath + "user-data\\";
const settings_file = userdata_folder + 'settings.ini';

const exit_sw = "\"" + fb.ProfilePath + 'themes\\footuner\\bin\\streamwriter\\ExitSW.exe' + "\"";

let WshShell = new ActiveXObject('WScript.Shell');

function on_script_unload() {
    if (!fb.IsPlaying) {
		utils.WriteINI(settings_file, 'streamwriter', 'recording', 0);
		utils.WriteINI(settings_file, 'streamwriter', 'url', '');
        WshShell.Run(exit_sw, 0, false);
    }
}