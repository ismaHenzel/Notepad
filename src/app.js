const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const fs = require('fs');
const path = require("path")
const os = require("os");
const anotation_dir = path.join(os.homedir(), "anotations")
const main_dir = path.join(__dirname, "Pages", "Main", "main.html");
const edit_dir = path.join(__dirname, "Pages", "Edit", "edit.html");

async function open_dialog_box(message){
    let response = await dialog.showMessageBox({
        title: "Dialog Box.",
        buttons: ["Yes","Cancel"],
        message:message,
        defaultId: 0,
        cancelId: 1,

    })
    return response;
}
async function creatingMain(){
    let win =  new BrowserWindow({
        minHeight:300,
        minWidth:260,
        maxWidth: 670,
        maxHeight:900,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
        }
    })
    if(!fs.existsSync(anotation_dir)){
        fs.mkdirSync(anotation_dir);
    }

    function found_files(){
        win.webContents.send("found_files")
    }

    async function load_main_page(){
        await win.loadFile(main_dir);
        found_files();
    }

    load_main_page()
    ipcMain.on("open_edit_page", async (event,data)=>{
        if(!data){
            await win.loadFile(edit_dir)
        }else{
            await win.loadFile(edit_dir);
            fs.readFile(path.join(anotation_dir, data), {encoding:"utf8"},(err, value)=>{
                if(err) return console.log(err);
                event.reply("note_data", {title:data ,message:value});
            })
        }
    })

    ipcMain.on("found_files", async (event, data )=>{
        event.reply("found_files");
    })

    ipcMain.on("write_files", async (event, data)=>{
        if(data.title_changed){
            fs.rename(`${anotation_dir}/${data.initial_title}` ,`${anotation_dir}/${data.title}` , (err =>{
                if(err) return console.log(err);
            }))
        };
        if(fs.existsSync(`${anotation_dir}/${data.title}`)){
            let dialog_box = await open_dialog_box("This file already exist, do you want overwrite the file?")
            if(dialog_box.response===1){
                return;
            }
        }
        let dialog = await open_dialog_box("Do you want to save this message ? ");
        if(dialog.response ===0){
            await fs.writeFile(`${anotation_dir}/${data.title}`,  data.message, {flag: data.type, encoding:"utf8"}, error=>{
                if(error){
                    alert('ops something went wrong: '+e)
                }
            })
            load_main_page()
        }
    })
    
    ipcMain.on("delete_files",async (event,data)=>{
        await data.forEach((file) =>{
            fs.unlink(`${anotation_dir}/${file}`, (error)=>{
                if(error){
                    console.log("Error deleting the files", error);
                    return;
                } 
            })
        })
        found_files()
    })

    ipcMain.on("cancell", async(event,data)=>{
        let dialog = await open_dialog_box("Do you want to cancell all and go to the main page ?");
        if(dialog.response==0){
            load_main_page()
        }
    })
}
app.on('ready', creatingMain);











