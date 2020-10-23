chrome.runtime.onInstalled.addListener(() => {

    fetch("https://immense-dusk-00750.herokuapp.com/getProfs")
        .then((res) => {
            res.json()
                .then((profs) => {
                    chrome.storage.local.set({ profs:profs});
                })
        })
})
