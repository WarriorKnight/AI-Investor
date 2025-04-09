const { PrismaClient } = require('./generated/client/index.js');
const { getCurrentPrice } = require('./stocks/yahooFinanceClient.js');
const prisma = new PrismaClient();

// Processes a BUY action
async function processBuyAction(action, cashChange) {
    const { symbol, quantity, reason } = action;
    const marketPrice = await getCurrentPrice(symbol);
    const totalCost = quantity * marketPrice;

    const latestPortfolioState = await prisma.portfolioState.findFirst({
        orderBy: { timestamp: 'desc' },
    });

    if (latestPortfolioState.cashBalance >= totalCost) {
        console.log(`Buying ${quantity} of ${symbol} at $${marketPrice} each. Reason: ${reason}`);

        await prisma.transaction.create({
            data: {
                action: 'BUY',
                symbol,
                quantity,
                price: marketPrice,
                reason,
            },
        });

        const existingPosition = await prisma.position.findUnique({
            where: { symbol },
        });

        if (existingPosition) {
            const newQuantity = existingPosition.quantity + quantity;
            const newAvgBuyPrice = calculateNewAvgBuyPrice(
                existingPosition.quantity,
                existingPosition.avgBuyPrice,
                quantity,
                marketPrice
            );

            await prisma.position.update({
                where: { symbol },
                data: {
                    quantity: newQuantity,
                    avgBuyPrice: newAvgBuyPrice,
                },
            });
        } else {
            await prisma.position.create({
                data: {
                    symbol,
                    quantity,
                    avgBuyPrice: marketPrice,
                },
            });
        }

        cashChange -= totalCost;
    } else {
        console.error(`Insufficient cash to buy ${quantity} of ${symbol}.`);
    }

    return cashChange;
}

// Processes a SELL action
async function processSellAction(action, cashChange) {
    const { symbol, quantity, reason } = action;
    const marketPrice = await getCurrentPrice(symbol);

    const existingPosition = await prisma.position.findUnique({
        where: { symbol },
    });

    if (existingPosition && existingPosition.quantity >= quantity) {
        const totalProceeds = quantity * marketPrice;

        console.log(`Selling ${quantity} of ${symbol} at $${marketPrice} each. Reason: ${reason}`);

        await prisma.transaction.create({
            data: {
                action: 'SELL',
                symbol,
                quantity,
                price: marketPrice,
                reason,
            },
        });

        if (existingPosition.quantity === quantity) {
            await prisma.position.delete({
                where: { symbol },
            });
        } else {
            await prisma.position.update({
                where: { symbol },
                data: {
                    quantity: existingPosition.quantity - quantity,
                },
            });
        }

        cashChange += totalProceeds;
    } else {
        console.error(`Cannot sell ${quantity} of ${symbol}. Not enough shares available.`);
    }

    return cashChange;
}

// Main function to load actions
async function loadActions(input) {
    const actions = JSON.parse(input);

    try {
        let cashChange = 0;

        for (const action of actions) {
            if (action.action === 'HOLD') {
                console.log(`No action suggested, holding.`);
                break;
            }

            if (action.action === 'BUY') {
                cashChange = await processBuyAction(action, cashChange);
            } else if (action.action === 'SELL') {
                cashChange = await processSellAction(action, cashChange);
            }
        }

        const updatedState = await calculatePortfolioState(cashChange);
    } catch (error) {
        console.error('Error processing actions:', error);
    }
}

// Calculates the portfolio state after cash changes
async function calculatePortfolioState(cashChange = 0) {
    try {
        const positions = await prisma.position.findMany();

        let portfolioValue = 0;
        for (const position of positions) {
            const marketPrice = await getCurrentPrice(position.symbol);

            await prisma.position.update({
                where: { symbol: position.symbol },
                data: { currentPrice: marketPrice },
            });

            portfolioValue += position.quantity * marketPrice;
        }

        const latestPortfolioState = await prisma.portfolioState.findFirst({
            orderBy: { timestamp: 'desc' },
        });

        if (!latestPortfolioState) {
            throw new Error('Portfolio state not found. Please initialize the portfolio.');
        }

        const updatedCashBalance = latestPortfolioState.cashBalance + cashChange;
        const totalValue = updatedCashBalance + portfolioValue;

        await prisma.portfolioState.create({
            data: {
                cashBalance: updatedCashBalance,
                portfolioValue: portfolioValue,
                totalValue: totalValue,
            },
        });

        return {
            cashBalance: updatedCashBalance,
            portfolioValue: portfolioValue,
            totalValue: totalValue,
        };
    } catch (error) {
        console.error('Error calculating portfolio state:', error);
    }
}

// Calculates the new average buy price for a stock
function calculateNewAvgBuyPrice(existingQuantity, existingAvgPrice, newQuantity, newPrice) {
    const totalCost = existingQuantity * existingAvgPrice + newQuantity * newPrice;
    const totalQuantity = existingQuantity + newQuantity;
    return totalCost / totalQuantity;
}

module.exports = { loadActions, calculatePortfolioState };