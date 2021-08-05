let products = []
let productsInBasket = []
// const productOnList = document.querySelector('.size-list')




fetch(`data/GetRelatedArticles_tarcze_metal_perfect.json`)
    .then(res => res.json())
    .then(data => {
        const products = data.result.items
        products.forEach(e => {
            const id = e.id
            const name = e.name;
            const index = e.code;
            const priceNetto = e.valueNetto;
            const priceBrutto = e.valueBrutto;
            const qty = e.qty;
            const characteristic = e.technicalInfo[0].value
            const newProduct = new Product(id, name, index, priceNetto, priceBrutto, qty, characteristic);
            newProduct.addProductToArr(newProduct)
        })
        View.showProducts()
    });

class Product {
    constructor(id, name, index, priceNetto, priceBrutto, qty, characteristic) {
        this.id = id;
        this.name = name;
        this.index = index;
        this.priceNetto = priceNetto;
        this.priceBrutto = priceBrutto;
        this.qty = qty;
        this.characteristic = characteristic
    }
    addProductToArr(product) {
        products.push(product)
        products.sort((a, b) => {
            return ('' + a.index).localeCompare(b.index)

        })
    };
}

class ProductsInOrder extends Product {
    constructor(id, name, index, priceNetto, priceBrutto, qty, characteristic, qtyInOrder) {
        super(id, name, index, priceNetto, priceBrutto, qty, characteristic)
        this.qtyInOrder = qtyInOrder;
    }
}

class View {
    static alertInfo(text, color = 'success') {
        const alertEl = document.querySelector('.alert-info');
        alertEl.innerHTML = `
            <div class="alert" role="alert">
             ${text}
            </div>`
        alertEl.children[0].classList.add(`alert-${color}`)
        alertEl.classList.add('active')
        setTimeout(() => alertEl.classList.remove('active'), 3000)
    }

    static showProducts() {
        products.forEach((e, i) => {
            const tableTypesListRow = document.querySelector('.table-types-list-row')
            let qty = ''
            let color = 'green'
            if (e.qty * 1 > 100) {
                qty = '>100szt.'
            } else if (e.qty * 1 > 50) {
                qty = '>50szt.'
            } else if (e.qty * 1 > 10) {
                qty = '>10szt.'
            } else if (e.qty * 1 > 0 && e.qty <= 10) {
                qty = '<10szt.'
                color = 'orange'
            } else if (e.qty * 1 === 0) {
                qty = 'brak'
                color = 'red'
            }
            tableTypesListRow.innerHTML +=
                `<tr >
                <th scope="row" >${i + 1}</th>
                <td scope="row">${e.index} </td>
                <td>${e.name} </td>
                <td>${(e.priceNetto.toFixed(2))}zł</td>
                <td class="price-brutto">${(e.priceBrutto.toFixed(2))}zł</td>
                <td scope="row" style="color: ${color} ">${qty}</td>
                <td> 
                    <div  class="quantity-inputs"> 
                    <button data-id=${e.id} class="minus" type="button" value="-" > 
                    <i class="fas fa-minus"></i>
                    </button>
                    <input class="quantity-of-order" data-id=${e.id}  id="quantity-${e.id}" style="min-width: 30px" type="number" min="1" max="${e.qty}"> 
              
                
                    <button data-id=${e.id}  class="plus"  type="button" value="+" > 
                    <i class="fas fa-plus"></i>
                    </button>
                    </div> 
                </td>
                <td>
                  <button type="button" data-id=${e.id} id="add-to-basket-${e.id}"  class="btn btn-secondary add-to-basket">
                     <i class="fas fa-cart-plus"></i>
                  </button>
                </td>
            </tr>`

        })

        View.enter()

    };


    static enter() {

        const allInputs = document.querySelectorAll('[data-id]')
        const addProduts = (input) => {
            input.addEventListener('keydown', function (e) {
                e.preventDefault();
                if (e.keyCode === 13) {
                    document.getElementById(`add-to-basket-${this.getAttribute('data-id')}`).click()

                }
            });
            input.addEventListener('click', this.chooseQuantity)
        }

        allInputs.forEach((input, i) => {
            input.onfocus = function (e) {
                if (this.type === 'number') {
                    console.log('ttttt')
                    this.addEventListener('keydown', function (e) {
                        // e.preventDefault();
                        if (e.target.value > 0 && e.keyCode === 13) {
                            const dataId = this.getAttribute('data-id')
                            const quantityInput = document.getElementById(`quantity-${dataId}`)
                            let quantity = Number(quantityInput.value);
                            if (quantity > Number(quantityInput.max)) {
                                quantity = Number(quantityInput.max)
                                quantityInput.value = quantity
                            }
                            View.addProductsToBasket(dataId, quantity, quantityInput);
                            return
                        }
                    });

                } else {
                    addProduts(input)
                }
            }
        })
    }

    static chooseQuantity(e) {
        const dataId = this.getAttribute('data-id')
        const quantityInput = document.getElementById(`quantity-${dataId}`)
        console.log(quantityInput)
        let quantity = Number(quantityInput.value);
        console.log(dataId, quantity)
        if (this.id === `add-to-basket-${dataId}` && quantity > 0) {
            if (quantity > Number(quantityInput.max)) {
                quantity = Number(quantityInput.max)
                quantityInput.value = quantity
            }
            View.addProductsToBasket(dataId, quantity, quantityInput);
            return

        }

        if (this.value === "+" && quantity < Number(quantityInput.max)) {
            quantity++
        } else if (this.value === "-" && quantityInput.value > 0) {
            quantity--
        } else if (quantity > Number(quantityInput.max)) {
            quantity = Number(quantityInput.max)
            View.alertInfo('Ilość zredukowana', 'danger')
        }
        else {
            View.alertInfo('Towar niedostępny lub nie podano ilości', 'danger')
            return
        }
        quantityInput.value = quantity
    };

    static addProductsToBasket(dataId, quantity, quantityInput) {
        const productInOrder = products.find(({ id }, i) => id === Number(dataId));
        const ProductOrder = new ProductsInOrder(productInOrder.id, productInOrder.name, productInOrder.index, productInOrder.priceNetto, productInOrder.priceBrutto, productInOrder.qty, productInOrder.characteristic, quantity)
        quantityInput.value = ''
        quantityInput.style.backgroundColor = '#b2d3c2'
        console.log(ProductOrder)
        productsInBasket.push(ProductOrder)
        new Basket().basketProducts(ProductOrder)

        View.alertInfo('Produkt dodany do koszyka')
    };

    static sumInTable(sumNetto, sumBrutto) {
        const valueNetto = (sumNetto.reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        }, 0)).toFixed(2)
        const valueBrutto = (sumBrutto.reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        }, 0)).toFixed(2);
        const sum = document.querySelector('.sum')
        sum.innerHTML = `
 <tr>
 <th></th>
 <th></th>
 <th></th>
 <th></th>
 <th></th>
 <th scope="col">Suma:</th>
 <th>${valueNetto}</th> 
 <th>${valueBrutto}</th> 
 </tr>
`
    }


}

class Basket {
    basketOfProductsEl = document.querySelector('.basket-of-products');
    shoppingCartIconEl = document.querySelector('.shopping-cart-icon');
    sumNetto = []
    sumBrutto = []


    basketProducts(ProductOrder) {
        const basketOfProducts = new Array(ProductOrder)
        // basketOfProducts.push(ProductOrder)
        this.showBasket(basketOfProducts)



    }


    showBasket() {
        let listOfProductsEl = document.querySelector('.list-of-products-row')
        listOfProductsEl.innerHTML = ''
        console.log(listOfProductsEl)

        productsInBasket.forEach(
            (product, i) => {

                this.sumNetto.push(product.priceNetto * product.qtyInOrder).toFixed(2)
                this.sumBrutto.push(product.priceBrutto * product.qtyInOrder).toFixed(2)
                console.log(this.sumBrutto, this.sumNetto)


                listOfProductsEl.innerHTML +=
                    `<tr >
                <th scope="row">${i + 1}</th>
                <td scope="row">${product.index} </td>
                <td>${product.name} </td>
                <td>${product.priceNetto}zł</td>
                <td>${product.priceBrutto}zł</td>
                <td scope="row" >${product.qtyInOrder}</td>
             <td>${(product.priceNetto * product.qtyInOrder).toFixed(2)}</td>
             <td>${(product.priceBrutto * product.qtyInOrder).toFixed(2)}</td>
             <td> <button type="button" data-id=${product.id} id="delete-from-basket-${product.id}"  class="btn btn-secondary delete-from-basket">
                     <i class="fas fa-trash-alt">
                  </button></td>
         
            </tr>`

            }
        )


        View.sumInTable(this.sumNetto, this.sumBrutto)
        document.querySelectorAll(`.delete-from-basket`).forEach(e => e.addEventListener('click', () => {
            console.log(this)
            this.deleteProductFromBasket(e)
        }));
        this.basketOfProductsEl.classList.add('display-block');
        this.shoppingCartIconEl.addEventListener('click', this.viewBasket);
    }



    viewBasket() {
        console.log(this)
        // const baksetOfProductsEl= ;
        const typesEl = document.querySelector('.types');
        document.querySelector('.basket-of-products').classList.toggle('active-basket')
        typesEl.classList.toggle('no-active')
        console.log('ok')
    }

    deleteProductFromBasket(e) {

        const productId = Number((e.id).slice(19))
        productsInBasket.forEach((product, i) => {
            if (productId == product.id) {
                productsInBasket.splice(i, 1)
                console.log(productsInBasket)
                document.getElementById(`delete-from-basket-${product.id}`).parentElement.parentElement.remove()
                document.getElementById(`quantity-${productId}`).style.backgroundColor = ''
                View.alertInfo(`Produkt ${product.name} został usunięty`, 'warning')
                this.sumNetto.splice(i, 1)
                this.sumBrutto.splice(i, 1)
            };
            if (productsInBasket.length === 0) {
                const typesEl = document.querySelector('.types');
                document.querySelector('.basket-of-products').classList.toggle('active-basket')
                typesEl.classList.toggle('no-active')
                setTimeout(() => { document.querySelector('.basket-of-products').classList.remove('display-block') }, 1000)
                View.alertInfo("Koszyk wyczyszczoy", 'warning')
            }

        })
        View.sumInTable(this.sumNetto, this.sumBrutto)
    }

}


