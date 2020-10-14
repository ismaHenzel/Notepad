const { ipcRenderer} = require("electron");
const buttonAdd = document.getElementById("add");
const buttonRefresh = document.getElementById("refresh");
const btnDel = document.getElementById("buttonDel");
const content = document.getElementById("content");
const fs = require("fs");
const path = require("path")
const os = require("os");
let directory = path.join(os.homedir(), "anotations");

buttonAdd.onclick = function () {
    ipcRenderer.send("open_edit_page");
}

buttonRefresh.onclick = function () {
    ipcRenderer.send("found_files");
}

btnDel.onclick = function(){
    let selectedItems = [];
    content.querySelectorAll(".active > span").forEach(file=>{
        selectedItems.push(file.innerText.trim());
    });
    ipcRenderer.send("delete_files", selectedItems)  
}

ipcRenderer.on("found_files", (event, arg) => {
    content.innerHTML = "";
    fs.readdir(directory,{encoding: "utf8"}, async (err, files) => {
        if (err) throw err;        
        files.forEach(value=>{
            let date = fs.statSync(`${directory}/${value}`).birthtime;
            let form_date = `${date.getDay()}/${date.getMonth()+1}/${date.getFullYear()}`;
            let li = document.createElement("li");
            li.className = "item"
            li.innerHTML =
                `
                <span>
                    ${value}
                </span>
                <br/>
                <p id="date">${form_date}</p>
            `;
            selectLi(li)
            content.appendChild(li)
        })
    })
});


function selectLi(li){
    /*
        A lógica da seleção de itens foi inspirada no código de um curso da HCODE Treinamentos onde 
        foi recriado o site DropBox, pretendo deixar o código mais original assim que tiver um maior 
        conhecimento
        no frontend.
    */
    li.addEventListener("click", (e) => {
        if(e.shiftKey){
            let firstIndex  = content.querySelector(".active");
            if(firstIndex){
                let indexStart;
                let indexFinal;
                li.parentElement.childNodes.forEach((element, index)=>{
                    if(firstIndex == element)indexStart=index
                    if(li==element)indexFinal=index
                })
                let index = [indexStart, indexFinal].sort(function (a, b){
                    return (a-b)
                });
                li.parentElement.childNodes.forEach((el, i)=>{
                    if(i >= index[0] && i <= index[1]){
                        el.classList.add("active")
                    }                    
                })
            }
            return true
        }
       if(!e.ctrlKey){
                content.querySelectorAll("li.active").forEach(e=>{
                    e.classList.remove("active")
                })    
        }
        li.classList.toggle("active")

        let itemsSelected = content.querySelectorAll(".active").length;
        itemsSelected >=1 ? btnDel.style.visibility = "visible" : btnDel.style.visibility = "hidden"; 
    })
    li.addEventListener("dblclick", () => {
        ipcRenderer.send("open_edit_page", li.querySelector("span").innerText.trim());
    })
}
