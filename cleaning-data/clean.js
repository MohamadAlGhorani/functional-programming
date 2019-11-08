(function request() {
    fetch("enquete.json")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            getUglyData(data);
        });
})();

function getUglyData(jsonObj) {
    let data = jsonObj
        .map(item => item["Kleur haar (HEX code)"]);
    return niceData(data);
}

function niceData(data) {
    let newData = data
        .map(item => item
            .toString()
            .toUpperCase()
        )
        .filter(item => item !== "" && (/^((0x){0,1}|#{0,1})([0-9A-F]{8}|[0-9A-F]{6})$/).test(item))
        .map((char) => char.charAt(0) !== "#" ? item = "#" + char : char);
    console.log(newData)
    return newData
}