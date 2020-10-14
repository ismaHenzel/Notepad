const {ipcRenderer} = require("electron");
const text = document.getElementById("text");
const title = document.getElementById("title");
const buttonOk = document.getElementById("buttonOk");
const buttonDel = document.getElementById("buttonDel")
let initial_title = undefined;

buttonOk.onclick = function(){
    let title_changed = false;
    if(title.value != initial_title && initial_title != undefined) title_changed = true;  
    ipcRenderer.send("write_files", {title : title.value.trim(), message: text.value, type: "w+", title_changed, initial_title});
}

buttonDel.onclick = function(){
    ipcRenderer.send("cancell")
}

ipcRenderer.on("note_data", (event , data)=>{
    initial_title = data.title.trim();
    title.value = data.title.trim();
    text.value = data.message;
})