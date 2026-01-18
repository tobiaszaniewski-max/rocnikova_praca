import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from './firebase-config.js';

const appState = {
  currentSection: "main",
  table: 0,
  cart: [],
  pizzaCart:[],
  kitchenCart:[],
  barCart:[],
  tempPizza: null,
  tempSoup: null,
  tempDish: null,
  tempDrink: null
};


async function odoslatObjednavku() {
    
    const cisloStola = appState.table || "0"; 

    const vsetkyPolozky = [];

    const pridajDoFinalu = (cartArray, destination) => {
    if (cartArray && Array.isArray(cartArray)) {
        cartArray.forEach(item => {

            let finalNoteParts = [];

            if (item.note) finalNoteParts.push(item.note);
            if (item.dishNote) finalNoteParts.push("Jedlo: " + item.dishNote);
            if (item.soupNote) finalNoteParts.push("Polievka: " + item.soupNote);

            let finalNote = finalNoteParts.join(" | ");


            if(item.addons){
                const noteAddon = item.addons.find(a => a.type === "note");
                if(noteAddon){
                    finalNote = finalNote 
                        ? finalNote + " " + noteAddon.text 
                        : noteAddon.text;
                }
            }

            vsetkyPolozky.push({
                nazov: item.name || "Neznámy produkt",
                mnozstvo: 1,
                dest: destination,
                note: finalNote
            });

        });
    }
};


    pridajDoFinalu(appState.barCart, 'bar');
    pridajDoFinalu(appState.kitchenCart, 'kitchen');
    pridajDoFinalu(appState.pizzaCart, 'pizza');

    if (vsetkyPolozky.length === 0) {
        alert("Košík je prázdny!");
        return;
    }

    console.log("Odosielam tieto dáta:", { stol: cisloStola, polozky: vsetkyPolozky });

    try {
        await addDoc(collection(db, "orders"), {
            stol: String(cisloStola),
            polozky: vsetkyPolozky,
            status: "v priprave",
            cas: serverTimestamp()
        });

        alert("Objednávka odoslaná!");
        location.reload(); 
        
    } catch (e) {
        console.error("Detailná chyba Firebase:", e);
        alert("Chyba: " + e.message);
    }
}

/* ---------- HELPERS ---------- */

const workername = localStorage.getItem('workername') || 'Neprihlásený';

const waiterNameEl = document.querySelector(".waiter-name");
if (waiterNameEl) {
    waiterNameEl.innerText = 'Časník: ' + workername;
}

function hideAll(sections) {
  sections.forEach(s => s.classList.add("hidden"));
};

function show(el) {
  el.classList.remove("hidden");
};

/* ---------- LOGOUT ---------- */

const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm("Naozaj sa chcete odhlásiť?")) {
            signOut(auth)
                .then(() => {
                    localStorage.removeItem('workername');
                    
                    window.location.href = "../index.html"; 
                })
                .catch((error) => {
                    console.error("Chyba pri odhlasovaní:", error);
                    alert("Nepodarilo sa odhlásiť.");
                });
        }
    });
}

/* ---------- SECTIONS ---------- */

const tables = document.querySelector(".tables")
const mainMenu = document.querySelector(".main-menu");
const foodSep = document.querySelector(".food-separation");
const pizza = document.querySelector(".pizza-hiddden");
const addons = document.querySelector(".addons");
const weeklyMain = document.querySelector(".weekly-menu-main");
const weeklySoups = document.querySelector(".weekly-menu-soups");
const sideshide = document.querySelector(".sides");
const drinks = document.querySelector(".drink-separation")

/* ---------- TABLE SELECT ---------- */

document.querySelectorAll(".table-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    
    const table = btn.dataset.table;

    appState.table = table;

   

    
    document.querySelector(".table-number").textContent = table;
    hideAll([foodSep, pizza, addons, tables, weeklyMain, weeklySoups, sideshide, drinks]);
    show(mainMenu);
    appState.currentSection = "main";
    
  })
})


/* ---------- MENU BUTTON ---------- */

document.querySelector(".menu-btn").addEventListener("click", () => {
  hideAll([foodSep, pizza, addons, tables, weeklyMain, weeklySoups, sideshide, drinks]);
  show(mainMenu);
  appState.currentSection = "main";
});

/* ---------- MAIN MENU ---------- */

document.getElementById("foodid").addEventListener("click", () => {
  hideAll([pizza, addons, mainMenu, tables, weeklyMain, weeklySoups, sideshide, drinks]);
  show(foodSep);
  appState.currentSection = "food";
});

document.getElementById("pizzaid").addEventListener("click", () => {
  hideAll([pizza, addons, mainMenu, tables, weeklyMain, weeklySoups, sideshide, drinks]);
  show(pizza);
  appState.currentSection = "pizza";
});

document.getElementById("menuid").addEventListener("click", () => {
  hideAll([pizza, addons, mainMenu, tables, weeklyMain, weeklySoups, sideshide, drinks]);
  show(weeklyMain);
  appState.currentSection = "weeklyMain";
});

document.getElementById("barid").addEventListener("click", () => {
  hideAll([pizza, addons, mainMenu, tables, weeklyMain, weeklySoups, sideshide, drinks]);
  show(drinks);
  appState.currentSection = "weeklyMain";
});

/* ---------- FOOD SEPARATION ---------- */

document.querySelectorAll(".food-grid-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".dishes-grid").forEach(g => g.classList.add("hidden"));
    hideAll([pizza, addons, mainMenu, tables, weeklyMain, weeklySoups, sideshide, ]);

    const id = btn.id.replace("id", "");
    const section = document.querySelector("." + id);
    if (section) section.classList.remove("hidden");
  });
});

/* ---------- SOUP SELECT ---------- */
let tempsoupdelete = null;

document.querySelectorAll(".soup .dish-grid-button").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".soup-edit").forEach(e => e.classList.add("hidden"));
    document.querySelectorAll(".soup .dish-grid-button").forEach(b => b.classList.remove("hidden"));

    btn.classList.add("hidden");

    const edit = btn.nextElementSibling;
    if (edit) edit.classList.remove("hidden");

    tempsoupdelete = btn;

    appState.tempSoup = {
      name: btn.dataset.name,
      basePrice: parseFloat(btn.dataset.price),
      editInput: edit.querySelector(".edit-soup-input"),
      sizes: edit.querySelectorAll(".size-soup-button"),
      inputId: btn.dataset.input
    };

  });
});
document.querySelectorAll(".size-soup-button").forEach(btn => {
  btn.addEventListener("click", () => {

    const sizeName = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const inputElement = document.getElementById(appState.tempSoup.inputId);
    const note = inputElement ? inputElement.value.trim() : "";

    const soup = { name: sizeName, price, note };

    appState.kitchenCart.push(soup);
    appState.cart.push(soup);

    if (tempsoupdelete) {
      tempsoupdelete.classList.remove("hidden");
    }

    document.querySelectorAll(".soup-edit").forEach(e => e.classList.add("hidden"));
    appState.tempSoup.editInput.value = "";

    updateCartButtons();
  });
});


/* ---------- MAIN DISH SELECT ---------- */

document.querySelectorAll(".dish .dish-grid-button").forEach(btn => {
  btn.addEventListener("click", () => {
    hideAll([pizza, addons, mainMenu, tables, weeklyMain, weeklySoups, sideshide, drinks]);
    const dishName = btn.dataset.name;
    const dishPrice = parseFloat(btn.dataset.price);
    const note = document.getElementById("main-dish-edit-input").value.trim();

    if (btn.id === "side-approved") {
      appState.tempDish = {
        name: dishName,
        price: dishPrice
      };

      document.querySelector(".dish.dishes-grid").classList.add("hidden");
      document.querySelector(".sides").classList.remove("hidden");

    }else{
      const finalDish = {
        name: dishName,
        price: dishPrice,
        note: note
      };
      updateCartButtons();
      appState.cart.push(finalDish);
      appState.kitchenCart.push(finalDish);
      console.log("Cart: ", appState.cart);
    }
  })
})

/* ---------- SIDES SELECT ---------- */

document.querySelectorAll(".sides-button").forEach(sideBtn => {
  sideBtn.addEventListener("click", () => {
    hideAll([pizza, addons, mainMenu, tables, weeklyMain, weeklySoups]);
    if (!appState.tempDish) return; 

    const sideName = sideBtn.dataset.name;
    const sidePrice = parseFloat(sideBtn.dataset.price);
    const note = document.getElementById("side-edit-input").value.trim();

    const completedDish = {
      name: `${appState.tempDish.name} + ${sideName}`,
      price: appState.tempDish.price + sidePrice,
      note: note
    };

    appState.cart.push(completedDish);
    appState.kitchenCart.push(completedDish);

    document.getElementById("main-dish-edit-input").value = "";
    document.getElementById("side-edit-input").value = "";

    appState.tempDish = null;
    
    document.querySelector(".sides").classList.add("hidden");
    document.querySelector(".dish.dishes-grid").classList.remove("hidden");
    updateCartButtons();

    console.log("Cart: ", appState.cart);
  });
});

/* ---------- ALL ELSE SELECT ---------- */

document.querySelectorAll(".dishes-grid:not(.soup, .dish) .dish-grid-button").forEach(btn => {
  btn.addEventListener("click", () => {
    hideAll([pizza, addons, mainMenu, tables, weeklyMain, weeklySoups, sideshide, drinks]);

    const name = btn.dataset.name;
    const rawPrice = btn.dataset.price;
    const price = isNaN(Number(rawPrice)) ? 0 : Number(rawPrice);

    const item = {
      name,
      price,
      addons: []
    };

    const parentGrid = btn.closest(".dishes-grid");
    const editInput = parentGrid.querySelector(
      "input[type=text], .edit-pizza-input, .lokse-input"
    );

    if (editInput && editInput.value.trim() !== "") {
      item.addons.push({
        text: editInput.value.trim()
      });
    }

    appState.cart.push(item);
    appState.kitchenCart.push(item);
    updateCartButtons();

    if (editInput) editInput.value = "";

    console.log("Cart: ", appState.cart);
  });
});


/* ---------- PIZZA SELECT ---------- */

document.querySelectorAll(".pizza-grid .dish-grid-button").forEach(btn => {
  btn.addEventListener("click", () => {
    appState.tempPizza = {
      name: btn.dataset.name,
      basePrice: parseFloat(btn.dataset.price),
      addons: [],
      size: null,
      price: parseFloat(btn.dataset.price)
    };
    
    show(addons);
    hideAll([pizza]);
  });
});

/* ---------- ADDONS ---------- */

addons.querySelectorAll("input[type=checkbox]").forEach(check => {
  check.addEventListener("change", () => {
    const name = check.dataset.name;
    const price = parseFloat(check.dataset.price);

    if (check.checked) {
      appState.tempPizza.addons.push({ name, price });
      appState.tempPizza.price += price;
    } else {
      appState.tempPizza.addons =
        appState.tempPizza.addons.filter(a => a.name !== name);
      appState.tempPizza.price -= price;
    }
  });
});

addons.querySelectorAll("#pizza-edit-input").forEach(input => {
  input.addEventListener("input", () => {
    const text = input.value.trim();

    
    appState.tempPizza.addons =
      appState.tempPizza.addons.filter(a => a.type !== "note");

    if (text !== "") {
      appState.tempPizza.addons.push({
        type: "note",
        text: text
      });
      document.querySelector("#pizza-edit-input").innerHTML="";
    }
  });
});


/* ---------- PIZZA SIZE ---------- */
document.querySelectorAll(".size-pizza-button").forEach(btn => {
  btn.addEventListener("click", () => {
    appState.tempPizza.size = btn.dataset.size;
    let temporaryprice = (appState.tempPizza.price * parseFloat(btn.dataset.price));
    
    
    appState.tempPizza.price = Math.round(temporaryprice * 100)/100;

    appState.tempPizza.priceWithoutAddons = appState.tempPizza.price;

    appState.cart.push(appState.tempPizza);
    appState.pizzaCart.push(appState.tempPizza);
    appState.tempPizza = null;

    
    addons.querySelectorAll("input[type=checkbox]").forEach(i => i.checked = false);
    addons.querySelectorAll("#pizza-edit-input").forEach(i => i.value = "");
    addons.classList.add("hidden");
    show(pizza);

    updateCartButtons();
    console.log("Cart:", appState.cart);
  });
});

/* ---------- MENU SELECT ---------- */


document.querySelectorAll(".weekly-menu-main .weekly-menu-button").forEach(btn => {
  btn.addEventListener("click", () => {
    const note = document.getElementById("edit-menu-input").value.trim();

    appState.tempDish = {
      name: btn.dataset.name,
      price: parseFloat(btn.dataset.price),
      note: note
    };

    const nosoup = document.getElementById("no-menu-soup");
    
    if(btn.dataset.name === "Bez hlavného jedla"){
      hideAll([nosoup]);
    }

    hideAll([weeklyMain]);
    show(weeklySoups);
    appState.currentSection = "weekly-soups";
    updateCartButtons();
  });
});

document.querySelectorAll(".weekly-menu-soups .weekly-menu-button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!appState.tempDish) return;

    const soupName = btn.dataset.name;
    const soupPrice = parseFloat(btn.dataset.price) || 0;
    const soupNote = document.getElementById("menu-soup-edit").value.trim();

    const completedWeeklyMenu = {
      name: `${appState.tempDish.name} + ${soupName}`,
      price: appState.tempDish.price + soupPrice,
      dishNote: appState.tempDish.note,
      soupNote: soupNote
    };

    appState.cart.push(completedWeeklyMenu);
    appState.kitchenCart.push(completedWeeklyMenu);

    
    document.getElementById("edit-menu-input").value = "";
    document.getElementById("menu-soup-edit").value = "";
    appState.tempDish = null;

    const nosoup = document.getElementById("no-menu-soup");
    nosoup.classList.remove("hidden")
    
    hideAll([weeklySoups]);
    show(mainMenu); 
    appState.currentSection = "main";
    updateCartButtons();

    console.log("Cart:", appState.cart);
  });
});

function updateCartButtons() {
    if (appState.cart.length >= 1) {
        const cartBtn = document.querySelector(".cart-button");
        const orderBtn = document.querySelector(".order-button");

        if (cartBtn) cartBtn.classList.remove("hidden");
        if (orderBtn) orderBtn.classList.remove("hidden");
    }
}


/* ---------- DRINKS SELECT ---------- */


document.querySelectorAll(".drink-separation .dish-grid-button, .vine-button, .alcohol-button, .nealko-button, .coffee-button, .tea-button, .limonada-button").forEach(btn => {
  btn.addEventListener("click", () => {
    
    const parentGrid = btn.closest(".dishes-grid, .vine-grid, .alcohol-grid, .nealko-grid, .coffee-grid");
    const editInput = parentGrid ? parentGrid.querySelector("input[type=text]") : null;
    const note = editInput ? editInput.value.trim() : "";
    
    tempnote = note; 
    

    const specialIds = ["curiosa", "targa", "rajec"];
    const isSoda = btn.dataset.name === "Soda"; 

    if (specialIds.includes(btn.id) || isSoda) {
        if (editInput) editInput.value = "";
        return; 
    }
    
    if (btn.closest('.curiosa-grid')) {
        return;
    }

    const rawPrice = btn.dataset.price;
    const price = isNaN(Number(rawPrice)) ? 0 : Number(rawPrice);
    
    const name = btn.dataset.name;

    const item = {
      name: name,
      price: price,
      note: note
    };
    
    appState.cart.push(item);
    appState.barCart.push(item);

    if (editInput) editInput.value = "";

    updateCartButtons();
    console.log("Cart:", item);
  });
});
let tempnote;

const nealkoGrid = document.querySelector(".nealko-grid");

function openDrinkSelection(details) {
    appState.tempDrink = {
        name: details.name,
        basePrice: details.price,
        note: tempnote
    };

    nealkoGrid.classList.add("hidden");

    const targetGrid = document.querySelector(details.targetSelector);
    if(targetGrid) {
        targetGrid.classList.remove("hidden");
    }
}

const curiosaBtn = document.getElementById("curiosa");
if (curiosaBtn) {
    curiosaBtn.addEventListener("click", () => {
        openDrinkSelection({
            name: "Curiosa",
            price: parseFloat(curiosaBtn.dataset.price),
            targetSelector: ".curiosa.curiosa-grid" 
        });
    });
}

const targaBtn = document.getElementById("targa");
if (targaBtn) {
    targaBtn.addEventListener("click", () => {
        openDrinkSelection({
            name: "Targa",
            price: parseFloat(targaBtn.dataset.price),
            targetSelector: ".targa.curiosa-grid"
        });
    });
}

const rajecBtn = document.getElementById("rajec");
if (rajecBtn) {
    rajecBtn.addEventListener("click", () => {
        openDrinkSelection({
            name: "Rajec",
            price: parseFloat(rajecBtn.dataset.price),
            targetSelector: ".rajec.curiosa-grid"
        });
    });
}

const sodaBtn = Array.from(document.querySelectorAll(".nealko-button")).find(b => b.dataset.name === "Soda");
if (sodaBtn) {
    sodaBtn.addEventListener("click", () => {
        openDrinkSelection({
            name: "Soda",
            price: 0,
            targetSelector: ".soda.curiosa-grid"
        });
    });
}


document.querySelectorAll(".curiosa-grid .nealko-button").forEach(subBtn => {
    subBtn.addEventListener("click", () => {
        if (!appState.tempDrink) return;

        const parentGrid = subBtn.closest(".curiosa-grid");
        const localInput = parentGrid ? parentGrid.querySelector("input[type=text]") : null;
        const localNote = localInput ? localInput.value.trim() : "";

        let finalName = appState.tempDrink.name;
        let finalPrice = appState.tempDrink.basePrice;

        let baseNote = appState.tempDrink.note || "";
        let finalNote = baseNote;

        if (localNote) {
            finalNote = finalNote ? `${finalNote} ${localNote}` : localNote;
        }

        if (subBtn.dataset.prichut) {
            finalName += ` ${subBtn.dataset.prichut}`;
        } 
        
        if (subBtn.dataset.objem) {
            finalName += ` ${subBtn.dataset.objem}ml`;
            finalPrice = parseFloat(subBtn.dataset.price);
        }

        const item = {
            name: finalName,
            price: finalPrice,
            note: finalNote
        };

        appState.cart.push(item);
        appState.barCart.push(item);
        updateCartButtons();

        if (parentGrid) {
            parentGrid.classList.add("hidden");
            if (localInput) localInput.value = ""; 
        }
        
        nealkoGrid.classList.remove("hidden");

        appState.tempDrink = null;
        
        console.log("Cart: ", item);
    });
});


document.querySelectorAll(".drink-grid .food-grid-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".drink-separation .dishes-grid, .drink-separation .vine-grid, .drink-separation .alcohol-grid, .drink-separation .nealko-grid, .drink-separation .pivo-grid, .drink-separation .curiosa-grid, .drink-separation .coffee-grid").forEach(g => g.classList.add("hidden"));
    
    const targetClass = btn.id.replace("id", "");
    
    let selector = ".drink-separation ." + targetClass;
    if (targetClass === "pivo") selector = ".pivo-grid";
    if (targetClass === "nealko") selector = ".nealko-grid";
    
    const targetSection = document.querySelector(selector);
    
    if (targetSection) {
        targetSection.classList.remove("hidden");
    }
  });
});

/* ---------- ORDER BUTTON ---------- */


const cartView = document.getElementById("cart-view");
const cartContainer = document.getElementById("cart-container");
let editingCartIndex = null;

document.querySelector("#cart").addEventListener("click", () => {
    renderCart();
    hideAll([mainMenu, foodSep, pizza, addons, tables, weeklyMain, weeklySoups, drinks]);
    show(cartView);
});

document.getElementById("close-cart-btn").addEventListener("click", () => {
    cartView.classList.add("hidden");
    show(mainMenu);
});

document.getElementById("send-order-btn").addEventListener("click", () => {
    if(confirm("Odoslať objednávku do kuchyne?")) {
        odoslatObjednavku();
        appState.cart = [];
        appState.pizzaCart = [];
        appState.kitchenCart = [];
        appState.table = null;
        
        document.querySelector(".table-number").textContent = "";
        document.querySelector(".order-button").classList.add("hidden");
        
        cartView.classList.add("hidden");
        show(tables);
    }
});

function renderCart() {
    cartContainer.innerHTML = "";
    let totalSum = 0;

    appState.cart.forEach((item, index) => {
        if(item.stôl) return;

        totalSum += item.price || 0;

        const card = document.createElement("div");
        card.classList.add("cart-item-card");

        let htmlContent = `
            <div class="cart-item-header">
                <span>${item.name}</span>
                <div class="cart-controls">
                    <span>${(item.price || 0).toFixed(2)} €</span>
                    <div class="cart-btns-group">
                        ${ item.size ? `<button class="edit-item-btn" data-index="${index}">Upraviť</button>` : '' }
                        <button class="delete-item-btn" data-index="${index}">✕</button>
                    </div>
                </div>
            </div>
        `;

        if (item.size && item.addons && item.addons.length > 0) {
            htmlContent += `<div class="addons-list">`;
            item.addons.forEach(ad => {
                if(ad.type !== 'note') {
                    htmlContent += `<span class="addon-chip">+ ${ad.name}</span>`;
                }
            });
            htmlContent += `</div>`;
        }

        htmlContent += `<input type="text" class="cart-input note-input" data-index="${index}" placeholder="Poznámka..." value="${item.note || ''}">`;

        if (item.soupNote !== undefined) {
             htmlContent += `<input type="text" class="cart-input soup-note-input" data-index="${index}" placeholder="Poznámka k polievke..." value="${item.soupNote || ''}">`;
        }

        card.innerHTML = htmlContent;
        cartContainer.appendChild(card);
    });

    document.getElementById("total-price-display").textContent = totalSum.toFixed(2);

    attachCartListeners();
}
function attachCartListeners() {
    document.querySelectorAll(".delete-item-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = e.target.dataset.index;
            appState.cart.splice(idx, 1);
            renderCart(); 
            
            if(appState.cart.length <= 1) {
                 document.querySelector(".order-button").classList.add("hidden");
            }
        });
    });

    document.querySelectorAll(".edit-item-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = e.target.dataset.index;
            openAddonEditor(idx);
        });
    });

    document.querySelectorAll(".note-input").forEach(input => {
        input.addEventListener("input", (e) => {
            appState.cart[e.target.dataset.index].note = e.target.value;
        });
    });
    
    document.querySelectorAll(".soup-note-input").forEach(input => {
        input.addEventListener("input", (e) => {
            appState.cart[e.target.dataset.index].soupNote = e.target.value;
        });
    });
}

function openAddonEditor(index) {
    editingCartIndex = index;
    const item = appState.cart[index];

    addons.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);

    if (item.addons) {
        item.addons.forEach(savedAddon => {
            const checkbox = Array.from(addons.querySelectorAll("input[type=checkbox]"))
                .find(cb => cb.dataset.name === savedAddon.name);
            if (checkbox) checkbox.checked = true;
        });
        
        const noteAddon = item.addons.find(a => a.type === 'note');
        const editInput = document.getElementById("pizza-edit-input");
        if(editInput) editInput.value = noteAddon ? noteAddon.text : "";
    }

    cartView.classList.add("hidden");
    show(addons);

    document.getElementById("edit-controls").classList.remove("hidden");
    document.querySelector(".pizza-size").classList.add("hidden");
}

document.getElementById("save-edited-addons-btn").addEventListener("click", () => {
    if (editingCartIndex === null) return;

    const item = appState.cart[editingCartIndex];
    item.addons = [];
    let addonsPriceSum = 0;

    addons.querySelectorAll("input[type=checkbox]:checked").forEach(cb => {
        const price = parseFloat(cb.dataset.price);
        item.addons.push({ name: cb.dataset.name, price: price });
        addonsPriceSum += price;
    });

    const noteText = document.getElementById("pizza-edit-input").value.trim();
    if (noteText) item.addons.push({ type: "note", text: noteText });

    const base = item.priceWithoutAddons || item.price; 
    item.price = base + addonsPriceSum;
    item.price = Math.round(item.price * 100) / 100;

    finishEditing();
});

document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    finishEditing();
});

function finishEditing() {
    editingCartIndex = null;
    document.getElementById("edit-controls").classList.add("hidden");
    document.querySelector(".pizza-size").classList.remove("hidden");
    
    hideAll([addons]);
    show(cartView);
    renderCart();
}