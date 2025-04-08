const {PrismaClient} = require('./generated/client/index.js')
const {getCurrentPrice} = require('./stocks/client.js');
const {dbClient} = require('./db/client');
const prisma = new PrismaClient();

function loadActions(input){
    const actions = JSON.parse(input);
    for (const action of actions){
        processAction(action);
    }
}

async function calculatePortfolioState() {
    try {
        const positions = await prisma.position.findMany();

        let portfolioValue = 0;
        for (const position of positions) {
            const marketPrice = await getCurrentPrice(position.symbol);
            portfolioValue += position.quantity * marketPrice;
            console.log('You own: ', position.symbol);
        }

        const latestPortfolioState = await prisma.portfolioState.findFirst({
            orderBy: { timestamp: 'desc' },
        });

        if (!latestPortfolioState) {
            throw new Error('Portfolio state not found. Please initialize the portfolio.');
        }

        const updatedCashBalance = latestPortfolioState.cashBalance; 
        const totalValue = updatedCashBalance + portfolioValue;

        await prisma.portfolioState.create({
            data: {
                cashBalance: updatedCashBalance,
                portfolioValue: portfolioValue,
                totalValue: totalValue,
            },
        });
        console.log(`Portfolio state updated: Cash Balance = $${updatedCashBalance}, Portfolio Value = $${portfolioValue}, Total Value = $${totalValue}`);
    } catch (error) {
        console.error('Error calculating portfolio state:', error);
    }
}

async function processAction(input){
    const {action,symbol,quantity,reason} = input;
    try {
        //TO:DO - check whether the SYMBOL actually exists
        const marketPrice = await getCurrentPrice(symbol);
        const totalCost = quantity * marketPrice;
        const latestPortfolioState = await prisma.portfolioState.findFirst({
            orderBy: { timestamp: 'desc' },
        });

        if(action==='BUY'){
            
            if (!latestPortfolioState) {
                throw new Error('Portfolio state not found. Please initialize the portfolio.');
            }
            
            if (latestPortfolioState.cashBalance >= totalCost){
                console.log(`Buying ${quantity} of ${symbol} at $${marketPrice} each. Reason: ${reason}`);
            
                //add the transaction to the database
                await prisma.transaction.create({
                    data:{
                        action: 'BUY',
                        symbol,
                        quantity,
                        price: marketPrice,
                        reason
                },
            });

            //check whether the stock exists in positions
            const existingPosition = await prisma.position.findUnique({
                where: { symbol },
            });

            if(existingPosition){
                const newQuantity = existingPosition.quantity + quantity;
                const newAvgBuyPrice = calculateNewAvgBuyPrice(
                    existingPosition.quantity,
                    existingPosition.avgBuyPrice,
                    quantity,
                    marketPrice
                );
                await prisma.position.update({
                    where: {symbol},
                    data: {
                        quantity: newQuantity,
                        avgBuyPrice: newAvgBuyPrice,
                    },
                });
            } else{
                await prisma.position.create({
                    data:{
                        symbol,
                        quantity,
                        avgBuyPrice: marketPrice,
                    },
                });
            }
            
            const updatedCashBalance = latestPortfolioState.cashBalance - totalCost;
            const portfolioValue = await calculatePortfolioValue();
            const totalValue = updatedCashBalance + portfolioValue;
        
            await prisma.portfolioState.create({
                data: {
                    cashBalance: updatedCashBalance,
                    portfolioValue: portfolioValue,
                    totalValue: totalValue,
                },
            });

        } else{
            console.error(`Insufficient cash to buy ${quantity} of ${symbol}.`);
        }
        }
        else if(action=='SELL'){
            //check if we actually have the stocks avaible
        const existingPosition = await prisma.position.findUnique({
            where: { symbol },
        });

        //check wether the stock is in our position and we have sufficient quantity
        if (existingPosition && existingPosition.quantity >= quantity){
            const remainingQuantity = existingPosition.quantity-quantity;
            const totalProceeds = quantity * marketPrice;
            //add the transaction to database
            await prisma.transaction.create({
                data: {
                    action: 'SELL',
                    symbol,
                    quantity,
                    price: marketPrice,
                    reason,
                },
            });

            //check if remaining quantity is 0, if so, remove it from positions (we no longer have that stock)
            if(remainingQuantity===0){
                await prisma.position.delete({
                    where: {symbol},
                });
            } else {
                await prisma.position.update({
                    where: {symbol},
                    data: {
                        quantity: remainingQuantity,
                    },
                });
            }

            const updatedCashBalance = latestPortfolioState.cashBalance + totalProceeds;
            const portfolioValue = await calculatePortfolioValue();
            const totalValue = updatedCashBalance + portfolioValue;
    
            await prisma.portfolioState.create({
                data: {
                    cashBalance: updatedCashBalance,
                    portfolioValue: portfolioValue,
                    totalValue: totalValue,
                },
            });

            console.log(`Sold ${quantity} of ${symbol} at $${marketPrice} each. Reason: ${reason}`);
        } else{
            console.error(`Cannot sell ${quantity} of ${symbol}. Not enough shares available.`);
        }
    }
    } catch (error) {
        console.error('Error processing action:', error);
    }
}

async function calculatePortfolioValue() {
    const positions = await prisma.position.findMany();
    let portfolioValue = 0;

    for (const position of positions) {
        const marketPrice = await getCurrentPrice(position.symbol);
        portfolioValue += position.quantity * marketPrice;
    }

    return portfolioValue;
}

function calculateNewAvgBuyPrice(existingQuantity, existingAvgPrice, newQuantity, newPrice) {
    const totalCost = existingQuantity * existingAvgPrice + newQuantity * newPrice;
    const totalQuantity = existingQuantity + newQuantity;
    return totalCost / totalQuantity;
}

module.exports = {loadActions, calculatePortfolioState};