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

async function processAction(input){
    const {action,symbol,quantity,reason} = input;
    try {
        //TO:DO - check whether the SYMBOL actually exists
        const marketPrice = await getCurrentPrice(symbol);
        console.log(`Buying ${quantity} of ${symbol} at $${marketPrice} each. Reason: ${reason}`);
        if(action==='BUY'){

            //add the transaction to teh database
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
        }
        else if(action=='SELL'){
        //check if we actually have the stocks avaible
        const existingPosition = await prisma.position.findUnique({
            where: { symbol },
        });

        //check wether the stock is in our position and we have sufficient quantity
        if (existingPosition && existingPosition.quantity >= quantity){
            const remainingQuantity = existingPosition.quantity-quantity;

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
            console.log(`Sold ${quantity} of ${symbol} at $${marketPrice} each. Reason: ${reason}`);
        } else{
            console.error(`Cannot sell ${quantity} of ${symbol}. Not enough shares available.`);
        }
        }
    } catch (error) {
        console.error('Error processing action:', error);
    }
}

function calculateNewAvgBuyPrice(existingQuantity, existingAvgPrice, newQuantity, newPrice) {
    const totalCost = existingQuantity * existingAvgPrice + newQuantity * newPrice;
    const totalQuantity = existingQuantity + newQuantity;
    return totalCost / totalQuantity;
}

module.exports = {loadActions};