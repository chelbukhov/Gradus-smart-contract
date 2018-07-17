const assert = require ('assert');              // утверждения
const ganache = require ('ganache-cli');        // тестовая сеть
const Web3 = require ('web3');                  // библиотека для подключения к ефириуму
//const web3 = new Web3(ganache.provider());      // настройка провайдера


require('events').EventEmitter.defaultMaxListeners = 0;


const compiledContract = require('../build/Crowdsale.json');

const compiledToken = require('../build/GRADtoken.json');

const compiledContractDividend = require('../build/Dividend.json');


let accounts;
let contractAddress;
console.log(Date());


describe('Серия тестов для проверки функций контракта дивидендов...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт токена GRAD...', async () => {
        //получаем адрес токена
        const tokenAddress = await contract.methods.token().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        token = await new web3.eth.Contract(
        JSON.parse(compiledToken.interface),
        tokenAddress
        );
        //console.log(token);
    });
    
    it('Получаем развернутый контракт дивидендов...', async () => {
        //получаем адрес контракта
        const dividendAddress = await contract.methods.dividendContract().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        dividend = await new web3.eth.Contract(
        JSON.parse(compiledContractDividend.interface),
        dividendAddress
        );
        //console.log(dividend);
    });

    it('Включаем разрешение на продажу токенов...', async () => {
        try {
            await contract.methods.enableSale().send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });
      
    it('Ставим хардкап краудсейла 12 эфиров...', async () => {
        try {
            await contract.methods.setHardCapCrowdSale(12).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Ставим хардкап дивидендов 15 эфиров...', async () => {
        try {
            await contract.methods.setHardCapDividends(15).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Переводим от account[1] 5 эфиров...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[1],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка поступления токенов account[1] - должно быть 50 тыс....', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[1]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 50000);
        //console.log(tokenBalance);
    });

    it('Переводим от account[2] 4 эфиров...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[2],
                gas: "1000000",
                value: 4*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка поступления токенов на account[2] - должно быть 40 тыс....', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[2]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 40000);
        //console.log(tokenBalance);
    });

    it('Переводим от account[3] 0.007 эфиров - должен отбить, меньше мимниума...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[3],
                gas: "1000000",
                value: 0.007*10**18
            });
            assert(false);    
        } catch (error) {
            assert(error);
        }
    });

    it('Переводим от account[3] 0.01 эфиров - должен принять...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[3],
                gas: "1000000",
                value: 0.01*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Переводим от account[3] 2.99 эфиров - должен принять...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[3],
                gas: "1000000",
                value: 2.99*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Переводим от account[3] 0.1 эфиров - должен отбить - превышен хардкап...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[3],
                gas: "1000000",
                value: 0.1*10**18
            });
            assert(false);    
        } catch (error) {
            assert(error);
        }
    });

    it('Проверка поступления токенов на account[3] - должно быть 30 тыс....', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[3]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 30000);
        //console.log(tokenBalance);
    });

    it('Переводим на контракт дивидендов 5 эфиров...', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[2],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть ноль...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);

    });

    it('Переводим на контракт дивидендов 5 эфиров - должен принять...', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[2],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть ноль...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);
    });

    it('Переводим на контракт дивидендов 2 эфиров - должен принять...', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[2],
                gas: "1000000",
                value: 2*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть ноль...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);
    });

    it('Переводим на контракт дивидендов 4 эфиров - должен принять и рассчитать дивиденды (на балансе 16 эфиров..', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[2],
                gas: "1000000",
                value: 4*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть > 6,66...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 6.66);
        //console.log(tokenBalance);
    });

    it('Проверяем расчет дивидендов для account[2]- должен быть > 5,33...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[2]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 5.33);
        //console.log(tokenBalance);
    });

    it('Проверяем расчет дивидендов для account[3]- должен быть > 3,99...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[3]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 3.99 );
        //console.log(tokenBalance);
    });

    it('Раунд 2 Переводим на контракт дивидендов 1 эфир..', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[0],
                gas: "1000000",
                value: 1*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка баланса на account[1] - > 94,99 ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[1]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 94.99);
        //console.log("Balance of account[1]: ", accBalance);
    });

    it('Выводим дивиденды на account[1]..', async () => {
        try {
            await dividend.methods.Pay().send({
                from: accounts[1],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка баланса на account[1] - > 101,66 ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[1]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 101.66);
        //console.log("Balance of account[1]: ", accBalance);
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть ноль...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);
        //console.log(tokenBalance);
    });

    it('Проверяем сумму собранных дивидедов  - должен быть 1...', async () => {
        let tokenBalance = await dividend.methods.receivedDividends().call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 1);
        //console.log(tokenBalance);
    });

    it('Проверка баланса на контракте дивидендов...', async () => {
        accBalance = await web3.eth.getBalance(dividend.options.address);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 10.33);
        //console.log("Balance of dividends contract: ", accBalance);
    });

    it('Переводим на контракт дивидендов 10 эфиров..', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[0],
                gas: "1000000",
                value: 10*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть ноль...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);
        //console.log(tokenBalance);
    });

    it('Переводим на контракт дивидендов еще 10 эфиров - должен рассчитать дивиденды..', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[0],
                gas: "1000000",
                value: 10*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть остаток...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 0);
        console.log(tokenBalance);
    });

    it('Проверяем расчет дивидендов для account[2]- должен быть остаток...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[2]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 0);
        console.log(tokenBalance);
    });

    it('Проверяем расчет дивидендов для account[3]- должен быть остаток...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[3]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 0);
        console.log(tokenBalance);
    });

    it('Проверка баланса на account[2] - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[2]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 79);
        console.log("Balance of account[2]: ", accBalance);
    });

    it('Выводим дивиденды на account[2]..', async () => {
        try {
            await dividend.methods.Pay().send({
                from: accounts[2],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка баланса на account[2] - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[2]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 92);
        console.log("Balance of account[2]: ", accBalance);
    });

    it('Переводим на контракт дивидендов еще 10 эфиров..', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[0],
                gas: "1000000",
                value: 10*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[2]- должен быть ноль...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[2]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);
        console.log(tokenBalance);
    });

    it('Переводим на контракт дивидендов еще 4 эфира..', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[0],
                gas: "1000000",
                value: 4*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[2]- должен быть ноль...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[2]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);
        console.log(tokenBalance);
    });

    it('Переводим на контракт дивидендов еще 1 эфир - должен рассчитать дивиденды..', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[0],
                gas: "1000000",
                value: 1*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 0);
        console.log(tokenBalance);
    });
    it('Проверяем расчет дивидендов для account[2]- должен быть...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[2]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 0);
        console.log(tokenBalance);
    });    it('Проверяем расчет дивидендов для account[3]- должен быть...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[3]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 0);
        console.log(tokenBalance);
    });

    it('Проверка баланса на контракте дивидендов перед выводом всех средств - ...', async () => {
        accBalance = await web3.eth.getBalance(dividend.options.address);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 15);
        console.log("Balance of dividend contract before withdraw: ", accBalance);
    });

    it('Проверка баланса на account[1] - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[1]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 92);
        console.log("Balance of account[1] before withdraw: ", accBalance);
    });

    it('Выводим дивиденды на account[1]..', async () => {
        try {
            await dividend.methods.Pay().send({
                from: accounts[1],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });
    it('Проверка баланса на account[1] - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[1]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 92);
        console.log("Balance of account[1] after: ", accBalance);
    });

    it('Проверка баланса на account[2] - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[2]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 50);
        console.log("Balance of account[2] before: ", accBalance);
    });
    it('Выводим дивиденды на account[2]..', async () => {
        try {
            await dividend.methods.Pay().send({
                from: accounts[2],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });
    it('Проверка баланса на account[2] - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[2]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 50);
        console.log("Balance of account[2] after: ", accBalance);
    });

    it('Проверка баланса на account[3] - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[3]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 50);
        console.log("Balance of account[3] before: ", accBalance);
    });
    it('Выводим дивиденды на account[3]..', async () => {
        try {
            await dividend.methods.Pay().send({
                from: accounts[3],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });
    it('Проверка баланса на account[3] - ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[3]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 50);
        console.log("Balance of account[3] after: ", accBalance);
    });

    it('Проверка баланса на контракте дивидендов после вывода...', async () => {
        accBalance = await web3.eth.getBalance(dividend.options.address);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance < 0.1);
        console.log("Balance of dividend contract after: ", accBalance);
    });



});




describe('Серия тестов для проверки расчета дивидендов при внешней передаче токенов между пользователями...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт токена GRAD...', async () => {
        //получаем адрес токена
        const tokenAddress = await contract.methods.token().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        token = await new web3.eth.Contract(
        JSON.parse(compiledToken.interface),
        tokenAddress
        );
        //console.log(token);
    });
    
    it('Получаем развернутый контракт дивидендов...', async () => {
        //получаем адрес контракта
        const dividendAddress = await contract.methods.dividendContract().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        dividend = await new web3.eth.Contract(
        JSON.parse(compiledContractDividend.interface),
        dividendAddress
        );
        //console.log(dividend);
    });

    it('Включаем разрешение на продажу токенов...', async () => {
        try {
            await contract.methods.enableSale().send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });
      
    it('Ставим хардкап краудсейла 12 эфиров...', async () => {
        try {
            await contract.methods.setHardCapCrowdSale(12).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Ставим хардкап дивидендов 15 эфиров...', async () => {
        try {
            await contract.methods.setHardCapDividends(15).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Переводим от account[1] 5 эфиров...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[1],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка поступления токенов account[1] - должно быть 50 тыс....', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[1]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 50000);
        //console.log(tokenBalance);
    });

    it('Переводим на контракт дивидендов 20 эфиров - должен рассчитать дивиденды..', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[0],
                gas: "1000000",
                value: 20*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть остаток...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 0);
        console.log(tokenBalance);
    });

    it('Проверяем расчет дивидендов для account[2]- должен быть ноль...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[2]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);
        console.log(tokenBalance);
    });


    it('Запретим передача токенов...', async () => {
        try {
            await contract.methods.lockTransfer(true).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем, что передача запрещена...', async () => {
            let locktransfer = await token.methods.lockTransfers().call();
            assert(locktransfer);    
    });
    it('account[1] переводит 40000 токенов на account[2] - должен отбить, т.к. передача запрещена...', async () => {
        try {
            let Result = await token.methods.transfer(accounts[2], '40000000000000000000000').send({
                from: accounts[1],
                gas: "1000000"
            });
            assert(false);                
        } catch (error) {
            assert(true);    
        }
    });

    it('Проверка поступления токенов account[1] - все еще 50 тыс....', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[1]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 50000);
        //console.log(tokenBalance);
    });


    it('Разрешаем передача токенов...', async () => {
        try {
            await contract.methods.lockTransfer(false).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем, что передача разрешена...', async () => {
            let locktransfer = await token.methods.lockTransfers().call();
            assert(!locktransfer);    
    });

    it('account[1] переводит 40000 токенов на account[2] - должен принять, т.к. передача разрешена...', async () => {
            let Result = await token.methods.transfer(accounts[2], '40000000000000000000000').send({
                from: accounts[1],
                gas: "1000000"
            });
            assert(Result);    
    });

    it('Проверка поступления токенов account[1] - 10 тыс....', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[1]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 10000);
        //console.log(tokenBalance);
    });


    it('Переводим на контракт дивидендов еще 20 эфиров - должен рассчитать дивиденды..', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[0],
                gas: "1000000",
                value: 20*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверяем расчет дивидендов для account[1]- должен быть остаток...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[1]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 0);
        console.log(tokenBalance);
    });

    it('Проверяем расчет дивидендов для account[2]- должен быть остаток...', async () => {
        let tokenBalance = await dividend.methods.showDividends().call({
            from: accounts[2]
        });
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance > 0);
        console.log(tokenBalance);
    });

});

describe('Серия тестов для проверки штатных функций ERC20...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт токена GRAD...', async () => {
        //получаем адрес токена
        const tokenAddress = await contract.methods.token().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        token = await new web3.eth.Contract(
        JSON.parse(compiledToken.interface),
        tokenAddress
        );
        //console.log(token);
    });
    
    it('Получаем развернутый контракт дивидендов...', async () => {
        //получаем адрес контракта
        const dividendAddress = await contract.methods.dividendContract().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        dividend = await new web3.eth.Contract(
        JSON.parse(compiledContractDividend.interface),
        dividendAddress
        );
        //console.log(dividend);
    });

    it('Включаем разрешение на продажу токенов...', async () => {
        try {
            await contract.methods.enableSale().send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });
      
    it('Ставим хардкап краудсейла 12 эфиров...', async () => {
        try {
            await contract.methods.setHardCapCrowdSale(12).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Ставим хардкап дивидендов 15 эфиров...', async () => {
        try {
            await contract.methods.setHardCapDividends(15).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Переводим от account[1] 5 эфиров...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[1],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Даем разрешение accounts[2] снять с accounts[1] 40000 токенов...', async () => {
        try {
            await token.methods.approve(accounts[2], '40000000000000000000000').send({
                from: accounts[1],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('account[2] переводит 40000 токенов c account[1]...', async () => {
        try {
            let Result = await token.methods.transferFrom(accounts[1], accounts[2], '40000000000000000000000').send({
                from: accounts[2],
                gas: "1000000"
            });
            assert(true);                
        } catch (error) {
            assert(false);    
        }
    });

    it('Даем разрешение accounts[2] снять с accounts[1] дополнительно 10000 токенов...', async () => {
        try {
            await token.methods.increaseApproval(accounts[2], '10000000000000000000000').send({
                from: accounts[1],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('account[2] переводит 9000 токенов c account[1]...', async () => {
        try {
            let Result = await token.methods.transferFrom(accounts[1], accounts[2], '9000000000000000000000').send({
                from: accounts[2],
                gas: "1000000"
            });
            assert(true);                
        } catch (error) {
            assert(false);    
        }
    });

    it('account[2] переводит 2000 токенов c account[1] - должен отбить из-за превышения...', async () => {
        try {
            let Result = await token.methods.transferFrom(accounts[1], accounts[2], '2000000000000000000000').send({
                from: accounts[2],
                gas: "1000000"
            });
            assert(false);                
        } catch (error) {
            assert(error);    
        }
    });

    it('account[2] переводит 1000 токенов c account[1] - должен разрешить...', async () => {
        try {
            let Result = await token.methods.transferFrom(accounts[1], accounts[2], '1000000000000000000000').send({
                from: accounts[2],
                gas: "1000000"
            });
            assert(true);                
        } catch (error) {
            assert(false);    
        }
    });

    it('Проверка баланса токенов account[2] - 50 тыс....', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[2]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 50000);
        //console.log(tokenBalance);
    });

    it('Проверка баланса токенов account[1] - 0....', async () => {
        let tokenBalance = await token.methods.balanceOf(accounts[1]).call();
        tokenBalance = web3.utils.fromWei(tokenBalance, 'ether');
        assert(tokenBalance == 0);
        //console.log(tokenBalance);
    });
});


describe('Серия тестов для проверки обратного выкупа токенов...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт токена GRAD...', async () => {
        //получаем адрес токена
        const tokenAddress = await contract.methods.token().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        token = await new web3.eth.Contract(
        JSON.parse(compiledToken.interface),
        tokenAddress
        );
        //console.log(token);
    });
    
    it('Получаем развернутый контракт дивидендов...', async () => {
        //получаем адрес контракта
        const dividendAddress = await contract.methods.dividendContract().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        dividend = await new web3.eth.Contract(
        JSON.parse(compiledContractDividend.interface),
        dividendAddress
        );
        //console.log(dividend);
    });

    it('Включаем разрешение на продажу токенов...', async () => {
        try {
            await contract.methods.enableSale().send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });
      
    it('Переводим от account[1] 5 эфиров...', async () => {
        try {
            await contract.methods.AddBalanceContract().send({
                from: accounts[1],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка баланса на account[1] - > 94,99 ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[1]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 94.99);
        console.log("Balance of account[1]: ", accBalance);
    });


    it('Устанавливаем курс обратного выкупа токенов 12000 токенов за эфир..', async () => {
        try {
            await contract.methods.setTokenBuyRate(12000).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Пробуем продать токены контракту - должен отбить (баланс контракта пустой)...', async () => {
        try {
            await token.methods.ReturnToken('5000000000000000000000').send({
                from: accounts[1],
                gas: "1000000"
            });
            assert(false);    
        } catch (error) {
            assert(true);
        }
    });

    it('Переводим от account[5] 10 эфиров на баланс контракта токена (для оплаты выкупа токенов)...', async () => {
        try {
            await token.methods.AddBalanceContract().send({
                from: accounts[5],
                gas: "1000000",
                value: 10*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Пробуем еще раз продать токены контракту - должен отработать...', async () => {
        try {
            await token.methods.ReturnToken('50000000000000000000000').send({
                from: accounts[1],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка баланса на account[1] - > 94,99 ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[1]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance > 99);
        console.log("Balance of account[1]: ", accBalance);
    });

});

describe('Серия тестов для проверки аварийного вывода из контракта дивидендов...', () => {
    let web3 = new Web3(ganache.provider());      // настройка провайдера

    it('Разворачиваем контракт для тестирования...', async () => {

        accounts = await web3.eth.getAccounts();
        contract = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
            .deploy({ data: compiledContract.bytecode })
            .send({ from: accounts[0], gas: '6000000'});
    });

    it('Адрес контракта...', async () => {
        contractAddress = (await contract.options.address);
    });

    it('Получаем развернутый контракт дивидендов...', async () => {
        //получаем адрес контракта
        const dividendAddress = await contract.methods.dividendContract().call();

        //получаем развернутый ранее контракт токена по указанному адресу
        dividend = await new web3.eth.Contract(
        JSON.parse(compiledContractDividend.interface),
        dividendAddress
        );
        //console.log(dividend);
    });

      
    it('Переводим от account[1] 5 эфиров на контракт дивидендов...', async () => {
        try {
            await dividend.methods.AddBalanceContract().send({
                from: accounts[1],
                gas: "1000000",
                value: 5*10**18
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Установим получателя прибыли - accounts[5]...', async () => {
        try {
            await contract.methods.setProfitAddress(accounts[5]).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка баланса на account[5] - 100 эфиров ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[5]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 100);
        console.log("Balance of account[5] before kill: ", accBalance);
    });

    it('Убиваем контракт дивидендов...', async () => {
        try {
            await contract.methods.killDividentContract(666).send({
                from: accounts[0],
                gas: "1000000"
            });
            assert(true);    
        } catch (error) {
            assert(false);
        }
    });

    it('Проверка баланса на account[5] - должно быть 105 эфиров ...', async () => {
        accBalance = await web3.eth.getBalance(accounts[5]);
        accBalance = web3.utils.fromWei(accBalance, 'ether');
        assert(accBalance == 105);
        console.log("Balance of account[5] after: ", accBalance);
    });
});