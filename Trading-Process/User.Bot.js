﻿exports.newUserBot = function newUserBot(BOT, DEBUG_MODULE) {

    const FULL_LOG = true;

    let bot = BOT;

    const MODULE_NAME = "User Bot";
    const LOG_INFO = true;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    let thisObject = {
        initialize: initialize,
        start: start
    };

    let assistant;                           // You will receive a reference to the platform at your initialize function. 


    return thisObject;

    function initialize(pAssistant, callBackFunction) {

        try {

            if (LOG_INFO === true) { logger.write("[INFO] initialize -> Entering function."); }

            logger.fileName = MODULE_NAME;

            /* Store local values. */
            assistant = pAssistant;

            logger.write("[INFO] initialize -> Entering function 'initialize' ");

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write("[ERROR] initialize -> onDone -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {

        try {

            if (LOG_INFO === true) { logger.write("[INFO] start -> Entering function."); }

            /*

            This is an example. This bot will trade with a pseudo strategy based on candle and volumes stairs patterns.
            Essentially it will look at the patterns it is in at different time periods and try to make a guess if it is a good time to buy,
            sell, or do nothing.

            */

            businessLogic(onDone);

            function onDone(err) {
                try {

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: { 
                            logger.write("[INFO] start -> onDone -> Execution finished well. :-)");
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] start -> onDone -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] start -> onDone -> Operation Failed. Aborting the process.");
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                            break;
                    }

                } catch (err) {
                    logger.write("[ERROR] start -> onDone -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function businessLogic(callBack) {

                try {

                    if (LOG_INFO === true) { logger.write("[INFO] start -> businessLogic -> Entering function."); }

                    let positions = assistant.getPositions();

                    if (positions.length > 0) {

                        decideWhatToDo(callBack);

                    } else {

                        let rate = assistant.getMarketRate();
                        rate = Number(rate.toFixed(8));

                        const INITIAL_BALANCE_A = 0.000;
                        const INITIAL_BALANCE_B = 0.001;

                        let amountA = INITIAL_BALANCE_A;
                        let amountB = INITIAL_BALANCE_B;

                        amountB = Number(amountB.toFixed(8));

                        amountA = amountB * rate;
                        amountA = Number(amountA.toFixed(8));

                        assistant.putPosition("sell", rate, amountA, amountB, callBack);

                    }
                } catch (err) {
                    logger.write("[ERROR] start -> businessLogic -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function decideWhatToDo(callBack) {

                try {

                    if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> Entering function."); }

                    let balance = assistant.getAvailableBalance();

                    let rate = assistant.getMarketRate();
                    rate = Number(rate.toFixed(8));

                    let amountA; 
                    let amountB;

                    let balanceA = Number(balance.assetA);
                    let balanceB = Number(balance.assetB);

                    if (balanceA === 0 && balanceB === 0) {

                        if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> Cannot place orders since Available Balance is zero on both Assets."); }
                        callBack(global.DEFAULT_OK_RESPONSE);
                        return;
                    }
                    
                    if (balanceA > 0) {

                        amountA = balanceA;
                        amountA = Number(amountA.toFixed(8));

                        amountB = amountA / rate;
                        amountB = Number(amountB.toFixed(8));

                        if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> Decided to BUY."); }
                        if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> amountA = " + amountA); }
                        if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> amountB = " + amountB); }
                        if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> rate = " + rate); }

                        assistant.putPosition("buy", rate, amountA, amountB, callBack);

                    } else {

                        amountB = balanceB; 
                        amountB = Number(amountB.toFixed(8));

                        amountA = amountB * rate;
                        amountA = Number(amountA.toFixed(8));

                        if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> Decided to SELL."); }
                        if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> amountA = " + amountA); }
                        if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> amountB = " + amountB); }
                        if (LOG_INFO === true) { logger.write("[INFO] start -> decideWhatToDo -> rate = " + rate); }

                        assistant.putPosition("sell", rate, amountA, amountB, callBack);

                    } 

                } catch (err) {
                    logger.write("[ERROR] start -> decideWhatToDo -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            logger.write("[ERROR] start -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
