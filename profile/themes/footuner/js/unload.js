//Unload

const userdata_folder = fb.FoobarPath + "user-data\\";
const settings_file = userdata_folder + 'settings.ini';

const taskkill_bat = "\"" + fb.ProfilePath + 'themes\\footuner\\bin\\streamripper\\taskkill.bat' + "\"";

let WshShell = new ActiveXObject('WScript.Shell');
let fso = new ActiveXObject("Scripting.FileSystemObject")

function on_script_unload() {
    let sr_running = utils.ReadINI(settings_file, 'streamripper', 'running');
    if (sr_running == 1 && !fb.IsPlaying) {
        utils.WriteINI(settings_file, 'streamripper', 'running', 0);
		utils.WriteINI(settings_file, 'icecast', 'running', 0);
        let cmd = taskkill_bat;
        WshShell.Run(cmd, 0, false);
    }
}