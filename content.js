var profMap = new Map();
var profCache = new Map();


function scanNode(mutation) {
    for (node of mutation.addedNodes) {
        scanRecur(node)
    }
}

function generateToolTip(professorName) {

    let popup = document.createElement("iframe")
    popup.frameBorder = 0;

    popup.width = "200px";
    popup.height = "100px";

    popup.id = "randomid";
    popup.style.zIndex = "1000 !important";
    popup.style.position = "relative"


    var path = chrome.runtime.getURL("iframe.html")
    popup.src = path;

    let tooltip = document.createElement("span");
    tooltip.textContent = ""

    tooltip.style.width = "200px"
    tooltip.style.backgroundColor = "black";
    tooltip.style.color = "#fff";
    tooltip.style.textAlign = "center"
    tooltip.style.padding = "5px 0"
    tooltip.style.borderRadius = "6px"
    tooltip.style.position = "absolute"
    tooltip.style.zIndex = "1";
    tooltip.style.visibility = "hidden"

    popup.onload = () => {

        if(profCache.get(professorName) === undefined){
            chrome.runtime.sendMessage({ type: "profName", data: professorName })
        }else{
            chrome.runtime.sendMessage({ type: "cacheHit", data: profCache.get(professorName)})
        }

        
    }



    tooltip.appendChild(popup);

    return tooltip;
}

function isProfessor(textContent) {

    let split = textContent.split(" ")

    for (let i = 0; i < split.length; i++) {

        let lastnames = profMap.get(split[i].toLowerCase())

        if (lastnames !== undefined && i + 1 < split.length) {
            for (let z = 0; z < lastnames.length; z++) {
                let last = lastnames[z]
                for (let x = i + 1; x < split.length; x++) {
                    if (split[x].toLowerCase() == last.toLowerCase()) {
                        let ret = ""
                        for (let y = i; y <= x; y++) {
                            ret += split[y];
                            if (y < x) {
                                ret += " "
                            }
                        }
                        return ret
                    }
                }
            }

        }
    }

    return undefined;
}




function scanRecur(node) {

    if (node.textContent !== undefined && node.childNodes.length === 0) {

        let professor = isProfessor(node.textContent);

        if (professor !== undefined) {
            if (!node.parentNode.classList.contains("modified")) {

                let tooltip = generateToolTip(professor);
                node.parentNode.appendChild(tooltip);

                node.parentNode.style.color = "red";
                node.parentNode.classList.add("modified")


                node.parentNode.addEventListener("mouseover", function (event) {

                    event.target.style.color = "purple";
                    tooltip.style.visibility = "visible"

                }, false);

                node.parentNode.addEventListener("mouseout", function (event) {

                    event.target.style.color = "red";
                    tooltip.style.visibility = "hidden"


                }, false);
            }
        }
    } else
        for (node of node.childNodes) {
            scanRecur(node)
        }
}


const targetNode = document.body;
const config = { attributes: false, childList: true, subtree: true };

const callback = function (mutationsList, observer) {

    for (let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === "subtree") {
            scanNode(mutation)
        }
    }
};


chrome.storage.local.get("profs", (profs) => {


    profs.profs.forEach((prof) => {
        first = prof.firstname
        last = prof.lastname

        let lastnames = profMap.get(first.toLowerCase());

        if (lastnames !== undefined) {
            lastnames.push(last.toLowerCase())
            profMap.set(first.toLowerCase(), lastnames)
        } else {

            lastnames = []
            lastnames.push(last.toLowerCase())
            profMap.set(first.toLowerCase(), lastnames)
        }
    })


    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    scanRecur(document.body)
})


cacheProfessor = (profName,profData) => {

    profCache.set(profName,profData);
}


chrome.runtime.onMessage.addListener(
    (msg) => {
    switch(msg.type){
        case "profData" : cacheProfessor(msg.name,msg.data);
        break;  
    }
})
