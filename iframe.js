function renderRatingData(values) {

    let list = document.createElement("ul")

    if (values !== null) {
        values.forEach((val) => {
            let ele = document.createElement("li")
            ele.textContent = val.name + " : " + val.content;
            list.appendChild(ele)
        })
    }else{
        let ele = document.createElement("li")
            ele.textContent = "data not found"
            list.appendChild(ele)
    }
    return list;
}

init = (message) => {

    console.log("recieved message modifying dom")


    chrome.runtime.onMessage.removeListener(init);

    console.log(message.data, "message data")

    let nameData = {}

    let names = message.data.toLowerCase().split(" ");
    console.log(names);
    if (names.length == 3) {
        nameData.FirstName = names[0]
        nameData.LastName = names[2]
    } else {
        nameData.FirstName = names[0]
        nameData.LastName = names[1]

    }

    console.log("sending", nameData)
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
                    document.body.appendChild(renderRatingData(data.values))
                })
        })

}

chrome.runtime.onMessage.addListener(init)

