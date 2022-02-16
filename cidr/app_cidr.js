(function () {
    console.log("App CIDR");

    const CIDR_INPUT_KEY = "cidr_input";
    
    const default_input = `10.1.0.0/16\n10.0.0.0/24\n10.0.0.0/26\n` +
        `172.18.0.0/18\n172.18.128.0/18\n172.18.100.0/24\n172.18.100.35/28\n10.2.1.80/27`;

    if (localStorage.getItem(CIDR_INPUT_KEY) !== null) {
        const cidr_input = localStorage.getItem(CIDR_INPUT_KEY);
        $("#cidr_input").val(cidr_input);
    }
    else {
        $("#cidr_input").val(default_input);
    }

    function generateCidrData(cidr_input) {

        const cidr_data1 = cidr_input.split("/");
        const cidr_data2 = cidr_data1[0].split(".");
        const cidr_no = cidr_data1[1];
    
        let netmask_bins = ['', '', '', ''];
        let netmask = [];
        let wildcard_bits = [];
    
        let ip_start = cidr_data2;
        let ip_end = [];
    
        // console.log(cidr_data1, cidr_data2);
        const total_host = Math.pow(2, (32 - parseInt(cidr_no)));
    
        // Calculate netmask
        for (let i = 0; i < cidr_no; i++) {
            let index = parseInt(i / 8);
            netmask_bins[index] += "1";
        }
    
        for (let i = cidr_no; i < 32; i++) {
            let index = parseInt(i / 8);
            netmask_bins[index] += "0";
        }
    
        for (let index = 0; index < 4; index++) {
            // Convert netmask (binary) to decimal
            const tempNetmask = parseInt(netmask_bins[index], 2);
            netmask.push(tempNetmask);
    
            // Calculate wildcard
            const wildcardNumber = 255 - tempNetmask;
            wildcard_bits.push(wildcardNumber);

            if (tempNetmask !== 255) {
                const ipGroup = (256-tempNetmask);
                const ipGroupTotal = parseInt(ip_start[index] / ipGroup);
                const actualIpStart = ipGroupTotal * ipGroup;
                ip_start[index] = actualIpStart;
            }

            if (wildcardNumber === 0) {
                ip_end.push(ip_start[index])
            }
            else {
                const temp_ip = parseInt(ip_start[index]) + wildcardNumber;
                ip_end.push(temp_ip.toString())
            }

        }

        let reserved_ips = [];
        reserved_ips.push({
            label: "Network Address [AWS/Azure]",
            ip: [...ip_start].join(".")
        });

        const reserved_ip2 = [...ip_start];
        reserved_ip2[3] = reserved_ip2[3] + 1;
        reserved_ips.push({
            label: "Reserved IP #2 (Router / Default Gateway) [AWS/Azure]",
            ip: reserved_ip2.join(".")
        });

        const reserved_ip3 = [...ip_start];
        reserved_ip3[3] = reserved_ip3[3] + 2;
        reserved_ips.push({
            label: "Reserved IP #3 (DNS) [AWS/Azure]",
            ip: reserved_ip3.join(".")
        });

        const reserved_ip4 = [...ip_start];
        reserved_ip4[3] = reserved_ip4[3] + 3;
        reserved_ips.push({
            label: "Reserved IP #4 (Future use) [AWS/Azure]",
            ip: reserved_ip4.join(".")
        });
        
        const reserved_ip5 = [...ip_end];
        reserved_ips.push({
            label: "Broadcast Address [AWS/Azure]",
            ip: reserved_ip5.join(".")
        });

        // 10.0.0.0: Network address.
        // 10.0.0.1: Reserved by AWS for the VPC router / default gateway.
        // 10.0.0.2: Reserved by AWS. The IP address of the DNS server is the base of the VPC network range plus two. For VPCs with multiple CIDR blocks, the IP address of the DNS server is located in the primary CIDR. We also reserve the base of each subnet range plus two for all CIDR blocks in the VPC. For more information, see Amazon DNS server.
        // 10.0.0.3: Reserved by AWS for future use.
        // 10.0.0.255: Network broadcast address. We do not support broadcast in a VPC, therefore we reserve this address.

        // Are there any restrictions on using IP addresses within these subnets?
        // Yes. Azure reserves 5 IP addresses within each subnet. These are x.x.x.0-x.x.x.3 and the last address of the subnet. x.x.x.1-x.x.x.3 is reserved in each subnet for Azure services.
        // x.x.x.0: Network address
        // x.x.x.1: Reserved by Azure for the default gateway
        // x.x.x.2, x.x.x.3: Reserved by Azure to map the Azure DNS IPs to the VNet space
        // x.x.x.255: Network broadcast address for subnets of size /25 and larger. This will be a different address in smaller subnets.

        const cidr_range = `${ip_start.join(".")}/${cidr_no}`;
        const total_usable_ips = (total_host - 5) > 0 ? (total_host - 5) : 0; 
        
        return {
            cidr_input: cidr_input,
            cidr_range: cidr_range,
            netmask: netmask.join("."),
            wildcard_bits: wildcard_bits.join("."),
            total_host: total_host,
            ip_start: ip_start.join("."),
            ip_end: ip_end.join("."),
            total_usable_ips: total_usable_ips,
            reserved_ips: reserved_ips
        }

    }

    function generateResultTable (result) {
        // 
        const cidr_range_text = (result.cidr_input !== result.cidr_range) ? 
            `<td class="text-primary" title="Corrected CIDR range">${result.cidr_range}</td> \n` : 
            `<td class="text-muted">${result.cidr_range}</td> \n`;

        const tableBody = `<tr> \n` +
            `<td>${result.cidr_input}</td> \n` +
            cidr_range_text +
            `<td>${result.ip_start}</td> \n` +
            `<td>${result.ip_end}</td> \n` +
            `<td>${result.netmask}</td> \n` +
            `<td>${result.wildcard_bits}</td> \n` +
            `<td class="text-end">${result.total_host}</td> \n` +
            `<td class="text-end">${result.total_usable_ips}</td> \n` +
            `</tr>`;

        return tableBody;
    }

    function generateResultCard (result) {
        
        let reservedIpsHtml = ``;
        for (let rsvd of result.reserved_ips) {
            reservedIpsHtml += `${rsvd.label}: ${rsvd.ip} <br/> \n`;
        }

        const cardHtml = `<div class="col"> \n` +
                `<div class="card"> \n` +
                    `<div class="card-body"> \n` +
                        `<h5 class="card-title">${result.cidr_range}</h5> \n` +
                        `<div class="card-text"> \n` +
                            `CIDR Input: ${result.cidr_input} <br/>\n` +
                            `CIDR Range: ${result.cidr_range} <br/>\n` +
                            `IP Range: ${result.ip_start} - ${result.ip_end}<br/>\n` +
                            `Subnet mask: ${result.netmask} <br/>\n` +
                            `Wildcard bits: ${result.wildcard_bits} <br/>\n` +
                            `Total hosts: ${result.total_host} <br/>\n` +
                            `Total usable IPs: ${result.total_usable_ips} <br/><br/>\n` +
                            `Reserved IPs: <br/>${reservedIpsHtml} <br/>\n` +
                        `</div> \n` +
                    `</div> \n` +
                `</div> \n` +
            `</div> \n`;

        return cardHtml;
    }

    $("body").on("click", "#btn-calculate", function(e) {
        console.log("Calculate");

        let cidr_results = [];
        let result_table = '';
        let result_card = '';

        const cidr_input = $("#cidr_input").val().trim();
        localStorage.setItem(CIDR_INPUT_KEY, cidr_input);
        const cidr_entries = cidr_input.split("\n");

        for (let entry of cidr_entries) {
            if (entry.trim() === '') continue;

            console.log(`CIDR: "${entry.trim()}"`);
            const result = generateCidrData(entry.trim());
            cidr_results.push(result);

            result_table += generateResultTable(result);
            result_card += generateResultCard(result);
        }

        console.log(cidr_results);
        $("#table-result-body").html(result_table);
        $("#cards-result").html(result_card);

    });


})();
