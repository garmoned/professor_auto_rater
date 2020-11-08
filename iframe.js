function renderRatingData(values) {

    let list = document.createElement("ul")

    if (values !== null) {
        values.forEach((val) => {
            let ele = document.createElement("li")
            ele.textContent = val.name + " : " + val.content;
            list.appendChild(ele)
        })
    } else {
        let ele = document.createElement("li")
        ele.textContent = "data not found"
        list.appendChild(ele)
    }
    return list;
}

var profData = [];

init = (message) => {

    if (message.target === window.name) {
        switch (message.type) {
            case "profName": fetchProfData(message);
                break;
            case "cacheHit": document.body.appendChild(renderRatingData(message.data));
                break;

        }
    }
}


function fetchProfData(message) {

    chrome.runtime.onMessage.removeListener(init);

    let nameData = {}

    let names = message.data.toLowerCase().split(" ");

    foundProfessorName = message.data;

    if (names.length == 3) {
        nameData.FirstName = names[0]
        nameData.LastName = names[2]
    } else {
        nameData.FirstName = names[0]
        nameData.LastName = names[1]

    }

    fetch("https://gentle-shelf-92983.herokuapp.com/rateProf", {
        method: "POST",
        body: JSON.stringify(nameData),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then((res) => {
            res.json()
                .then((data) => {

                    profData = data.values;
                    document.body.appendChild(renderRatingData(data.values))

                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id,
                            {
                                type: "profData",
                                name: message.data,
                                data: data.values
                            })
                    });

                })
        })
}


chrome.runtime.onMessage.addListener(init)

window.addEventListener("message", (msg) => {
    console.log("received message " + msg + data)
})  