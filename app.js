let count = 1;
let uuidList = "";
do {
    let random = crypto.randomUUID();
    uuidList += random + "\r\n";
    count++;
} while (count <= 30);

document.getElementById("text").innerText = uuidList;
