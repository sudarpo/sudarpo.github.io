# sudarpo.net | sudarpo.github.io

## UUID with crypto.randomUUID()

<pre id="text"></pre>

<script>
    
```
let count = 1;
let uuidList = '';
do {
    let random = crypto.randomUUID();
    uuidList += random + '\r\n';
    count++;

} while (count <= 30)

document.getElementById("text").innerText = uuidList;
                    
```
</script>
