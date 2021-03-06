function walletPhaseShow(tabItem: string = "") {

    let tabsFrame: HTMLIFrameElement = <HTMLIFrameElement>document.getElementById("wallet-phase-tabs-frame");

    let content: HTMLElement = document.getElementById("content");
    let hideButton: HTMLElement = document.getElementById("hide-btn");
    let alice: HTMLElement = tabsFrame.contentWindow.document.getElementById("alice-active");
    let bob: HTMLElement = tabsFrame.contentWindow.document.getElementById("bob-active");
    let tabs: HTMLElement = document.getElementById("tabs");
    let before: HTMLElement = document.getElementById("before-menu-br");
    let after: HTMLElement = document.getElementById("after-menu-hr");

    hideButton.hidden = false;

    if (tabItem === "alice") {
        content.setAttribute("style", "max-height: 320px");
        tabs.innerHTML = alice.outerHTML;

        storage.set('lastAccount', { lastAccount: 'alice' }, function (error) {
            if (error) throw error;
        });

        writeHint("Move coins between Alice and Bob only by mixing!");
        before.style.display = "none";
        after.style.display = "block";
        walletShow('receive');
    }
    else if (tabItem === "bob") {
        content.setAttribute("style", "max-height: 320px");
        tabs.innerHTML = bob.outerHTML;

        storage.set('lastAccount', { lastAccount: 'bob' }, function (error) {
            if (error) throw error;
        });

        writeHint("Move coins between Alice and Bob only by mixing!");
        before.style.display = "none";
        after.style.display = "block";
        walletShow('receive');
    }
    else if (tabItem === "") {
        storage.get('lastAccount', function (error, data) {
            if (error) {
                throw error;
            }

            walletPhaseShow(data.lastAccount);
            return;
        });
    }
}

function walletShow(menuItem: string) {
    let walletMenuFrame: HTMLIFrameElement = <HTMLIFrameElement>document.getElementById("wallet-menu-frame");
    let walletContentFrame: HTMLIFrameElement = <HTMLIFrameElement>document.getElementById("wallet-content-frame");

    let menu: HTMLElement = document.getElementById("menu");
    let content: HTMLElement = document.getElementById("content");
    let sendActive: HTMLElement = walletMenuFrame.contentWindow.document.getElementById("send-active");
    let historyActive: HTMLElement = walletMenuFrame.contentWindow.document.getElementById("history-active");
    let receiveActive: HTMLElement = walletMenuFrame.contentWindow.document.getElementById("receive-active");
    let sendContent: HTMLElement = walletContentFrame.contentWindow.document.getElementById("send-content");

    if (menuItem === 'receive') {
        menu.innerHTML = receiveActive.outerHTML;
    }
    else if (menuItem === 'send') {
        writeHint('Would you consider feeding the developer with some pizza? 186n7me3QKajQZJnUsVsezVhVrSwyFCCZ');
        menu.innerHTML = sendActive.outerHTML;
        content.innerHTML = sendContent.outerHTML;
    }
    else if (menuItem === 'history') {
        menu.innerHTML = historyActive.outerHTML;
        writeHint('HiddenWallet? Easy Peasy Lemon Squeezey!');
    }

    updateWalletContent();
}

function updateWalletContent() {
    let walletContentFrame: HTMLIFrameElement = <HTMLIFrameElement>document.getElementById("wallet-content-frame");

    let tabs: HTMLElement = document.getElementById("tabs");
    let menu: HTMLElement = document.getElementById("menu");
    let content: HTMLElement = document.getElementById("content");
    let recContent: HTMLElement = walletContentFrame.contentWindow.document.getElementById("receive-content");
    let historyContent: HTMLElement = walletContentFrame.contentWindow.document.getElementById("history-content");
    let balances: HTMLElement = document.getElementById("balances");

    if (tabs.childElementCount > 0) {
        let bobOrAlice: string = tabs.firstElementChild.id;

        if (bobOrAlice == "alice-active") {
            let resp: any = httpGetWallet("balances/alice");

            let labelType: string = "default";

            if (resp.Incoming > 0) labelType = "danger";

            balances.innerHTML = `<h4><span class="label label-${labelType}" style="display:block;">Available: ${resp.Available} BTC, Incoming: ${resp.Incoming} BTC </span></h4>`;

            if (menu.childElementCount > 0) {
                let menuId: string = menu.firstElementChild.id;

                if (menuId === "receive-active") {
                    content.innerHTML = recContent.outerHTML;

                    let extPubKey: HTMLElement = document.getElementById("extpubkey");
                    let recAddresses: HTMLElement = document.getElementById("receive-addresses");
                    let tradAddress: HTMLElement = document.getElementById("traditional-address");


                    let resp: any = httpGetWallet("receive/alice");
                    let i: number = 0

                    for (i = 0; i < 6; i++) {
                        let node: HTMLElement = document.createElement("li");
                        node.setAttribute("class", "list-group-item");
                        let textNode: Text = document.createTextNode(resp.Addresses[i]);
                        node.appendChild(textNode);
                        recAddresses.appendChild(node);
                    }

                    tradAddress.innerText = resp.TraditionalAddress;

                    extPubKey.innerText = resp.ExtPubKey;
                }
                else if (menuId === "history-active") {
                    content.innerHTML = historyContent.outerHTML;

                    let historyRecords: HTMLElement = document.getElementById("history-records");

                    let resp: any = httpGetWallet("history/alice");
                    let i: number = 0

                    for (i = 0; i < resp.History.length; i++) {
                        let trNode: HTMLElement = document.createElement("tr");
                        let tdNodeHeight: HTMLElement = document.createElement("td");
                        tdNodeHeight.innerText = resp.History[i].Height;
                        let tdNodeAmount: HTMLElement = document.createElement("td");
                        tdNodeAmount.innerText = resp.History[i].Amount;
                        let tdNodeTxId: HTMLElement = document.createElement("td");
                        tdNodeTxId.innerText = resp.History[i].TxId;
                        trNode.appendChild(tdNodeHeight);
                        trNode.appendChild(tdNodeAmount);
                        trNode.appendChild(tdNodeTxId);
                        historyRecords.appendChild(trNode);
                    }
                }
            }
        }
        else if (bobOrAlice == "bob-active") {
            let resp: any = httpGetWallet("balances/bob");
            let labelType: string = "default";

            if (resp.Incoming > 0) {
                labelType = "danger";
            }

            let balances: HTMLElement = document.getElementById("balances");

            balances.innerHTML = `<h4><span class="label label-${labelType}" style="display:block;">Available: ${resp.Available} BTC, Incoming: ${resp.Incoming} BTC </span></h4>`;

            let menu: HTMLElement = document.getElementById("menu");

            if (menu.childElementCount > 0) {
                let menuId: string = menu.firstElementChild.id;

                if (menuId === "receive-active") {
                    content.innerHTML = recContent.outerHTML;
                    let extPubKey: HTMLElement = document.getElementById("extpubkey");
                    let recAddresses: HTMLElement = document.getElementById("receive-addresses");
                    let tradAddress: HTMLElement = document.getElementById("traditional-address");

                    let resp: any = httpGetWallet("receive/bob");
                    let i: number = 0

                    for (i = 0; i < 6; i++) {
                        let node: HTMLElement = document.createElement("li");
                        node.setAttribute("class", "list-group-item");
                        let textNode: Text = document.createTextNode(resp.Addresses[i]);
                        node.appendChild(textNode);

                        recAddresses.appendChild(node);
                    }

                    tradAddress.innerText = resp.TraditionalAddress;

                    extPubKey.innerText = resp.ExtPubKey;
                }
                else if (menuId === "history-active") {
                    content.innerHTML = historyContent.outerHTML;

                    let historyRecords: HTMLElement = document.getElementById("history-records");

                    let resp: any = httpGetWallet("history/bob");
                    let i: number = 0

                    for (i = 0; i < resp.History.length; i++) {
                        let trNode: HTMLElement = document.createElement("tr");
                        let tdNodeHeight: HTMLElement = document.createElement("td");
                        tdNodeHeight.innerText = resp.History[i].Height;
                        let tdNodeAmount: HTMLElement = document.createElement("td");
                        tdNodeAmount.innerText = resp.History[i].Amount;
                        let tdNodeTxId: HTMLElement = document.createElement("td");
                        tdNodeTxId.innerText = resp.History[i].TxId;
                        trNode.appendChild(tdNodeHeight);
                        trNode.appendChild(tdNodeAmount);
                        trNode.appendChild(tdNodeTxId);
                        historyRecords.appendChild(trNode);
                    }
                }
            }
        }
    }
}

function setAmountToAll() {
    let amount: HTMLInputElement = <HTMLInputElement>document.getElementById("amount-to-send");
    amount.value = "all";
}

interface Transaction {
    Password: string;
    Address: string;
    Amount: string;
    FeeType: string;
}

function buildTransaction() {
    var address: string = (<HTMLInputElement>document.getElementById("address-to-send")).value;
    var amount: string = (<HTMLInputElement>document.getElementById("amount-to-send")).value;
    var password: string = (<HTMLInputElement>document.getElementById("send-password")).value;
    var fastFeeChecked: boolean = (<HTMLInputElement>document.getElementById("fast-fee-radio")).checked;
    var slowFeeChecked: boolean = (<HTMLInputElement>document.getElementById("slow-fee-radio")).checked;

    if (!address) {
        alert("Couldn't build the transaciton: Wrong address!");
        return;
    }

    if (!amount || Number(amount) <= 0) {
        alert("Couldn't build the transaciton: Wrong amount!");
        return;
    }

    // if both are checked or none are checked (cannot happen)
    if ((fastFeeChecked && slowFeeChecked) || (!fastFeeChecked && !slowFeeChecked)) {
        alert("Couldn't build the transaciton: Wrong fee type!");
        return;
    }

    // (cannot happen)
    if (password == null) {
        alert("Couldn't build the transaciton: Wrong fee type!");
        return;
    }

    let feeType: string;

    if (fastFeeChecked) {
        feeType = "high";
    }

    if (slowFeeChecked) {
        feeType = "low";
    }

    var obj: Transaction = { Password: password, Address: address, Amount: amount, FeeType: feeType };

    let json: any;
    let tabs: HTMLElement = document.getElementById("tabs");
    let bobOrAlice: string;

    if (tabs.childElementCount > 0) {
        let bobOrAliceTab = tabs.firstElementChild.id;

        if (bobOrAliceTab == "alice-active") {
            bobOrAlice = "alice";
        }

        if (bobOrAliceTab == "bob-active") {
            bobOrAlice = "bob";
        }
    }
    else {
        alert("Alice or Bob is not chosen"); // this should never be happen
        return;
    }

    let containerElement: Element = document.getElementsByClassName("container").item(0);
    let buildTXButton: HTMLElement = document.getElementById("build-transaction-button");

    containerElement.setAttribute("style", "pointer-events:none;");

    buildTXButton.innerHTML = '<span class="glyphicon glyphicon-cog spinning"></span> Building...';

    httpPostWalletAsync(`build-transaction/${bobOrAlice}`, obj, function (json) {
        if (json.Success === false) {
            let alertMessage: string = `Couldn't build the transaciton: ${json.Message}`;

            if (!isBlank(json.Details)) {
                alertMessage = `${alertMessage}

                                Details:
                                ${json.Details}`;
            }

            alert(alertMessage);
        }
        else {
            const remote = require('electron').remote;
            const window = remote.getCurrentWindow();
            const BrowserWindow = remote.BrowserWindow;
            let broadcastWindow = new BrowserWindow({ width: 600, height: 400, frame: false, resizable: false, alwaysOnTop: true, parent: window, icon: __dirname + '/app/assets/TumbleBit.png' });
            broadcastWindow.show();
            broadcastWindow.focus();
            broadcastWindow.loadURL(`file://${__dirname}/app/html/broadcast-transaction-window.html`);

            broadcastWindow.webContents.on('did-finish-load', () => {
                broadcastWindow.webContents.send('broadcast-response', json);
            })
        }

        buildTXButton.innerHTML = '<span class="mdi mdi-tor"></span> Build Transaction';
        containerElement.setAttribute("style", "pointer-events:all;");
    });
}

function isBlank(str: string) {
    return (!str || /^\s*$/.test(str));
}