var request = require("request")

var currencyTypes = {
    "XXX": ["krone, kroner"],
    "AUD": ["australian dollars", "australian dollar"],
    "BGN": ["bulgarian leva", "bulgarian lev", "lev", "leva"],
    "BRL": ["brazilian reals", "brazilian real", "brazilian reales", "real", "reals", "reales"],
    "CAD": ["canadian dollars", "canadian dollar", "cad dollar", "cad dollars"],
    "CHF": ["swiss francs", "swiss franc", "franc", "francs"],
    "CNY": ["chinese yuan", "yuan", "renminbi", "yuans"],
    "CZK": ["czech korunas", "czech koruna", "koruna", "korunas"],
    "DKK": ["danish kroner", "danish krone"],
    "GBP": ["british pounds", "british pound", "pound sterling", "pound sterlings", "pound", "pounds", "quid"],
    "HKD": ["hong kong dollars", "hong kong dollar"],
    "HRK": ["croatian kunas", "croatian kuna", "kuna", "kunas"],
    "HUF": ["hungarian forint", "forint"],
    "IDR": ["indonesian rupiah", "rupiah"],
    "ILS": ["israeli shekels", "israeli shekel", "israeli shekalim", "israeli shekelim", "shekels", "shekel", "shekalim", "shekelim"],
    "INR": ["indian rupees", "indian rupee", "rupee", "rupees"],
    "JPY": ["japanese yen", "yen"],
    "KRW": ["south korean won", "won"],
    "MXN": ["mexican pesos", "mexican peso", "pesos", "peso"],
    "MYR": ["malaysian ringgits", "malaysian ringgit", "ringgits", "ringgit"],
    "NOK": ["norwegian kroner", "norwegian krone"],
    "NZD": ["new zealand dollars", "new zealand dollar"],
    // "PHP": [],
    "PLN": ["polish zloty", "zloty"],
    "RON": ["romanian lei", "romanian leu", "lei", "leu"],
    "RUB": ["russian rubles", "russian ruble", "ruble", "rubles"],
    "SEK": ["swedish kronur", "swedish krona", "krona", "kronur"],
    "SGD": ["singapore dollars", "singapore dollar"],
    "THB": ["thai baht", "baht"],
    "TRY": ["turkish liras", "turkish lira", "turkish lire", "lira", "lire", "liras"],
    "ZAR": ["south african rands", "south african rand", "rand", "rands"],
    "USD": ["US dollars", "US dollar", "dollars", "dollar", "dollar bill", "dollar bills", "bill", "bills", "buck", "bucks"],
    "EUR": ["euros", "euro"]
}

var pluralForm = ["CNY", "HUF", "IDR", "JPY", "KRW", "PLN", "THB"]

var subCurrencies = {
    "AUD": "cents",
    "BGN": "stotinki",
    "BRL": "centavos",
    "CAD": "cents",
    "CHF": "centimes",
    "CNY": "fen",
    "CZK": "haler",
    "DKK": "ore",
    "GBP": "pence",
    "HKD": "cents",
    "HRK": "lipa",
    "HUF": "filler",
    "IDR": "sen",
    "ILS": "agorot",
    "INR": "paise",
    "JPY": "cen",
    "KRW": "chon",
    "MXN": "centavos",
    "MYR": "sen",
    "NOK": "ore",
    "NZD": "cents",
    // "PHP": "",
    "PLN": "groszy",
    "RON": "bani",
    "RUB": "kopek",
    "SEK": "ore",
    "SGD": "cents",
    "THB": "satang",
    "TRY": "kurus",
    "ZAR": "cents",
    "USD": "cents",
    "EUR": "cents"
}

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({
                requestId: event.request.requestId
            }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback)
}

function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == "CurrencyConvert") {
        handleConvertResponse(intent, session, callback)
    } else if (intentName == "AMAZON.HelpIntent") {
        handleGetHelpRequest(intent, session, callback)
    } else if (intentName == "AMAZON.StopIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else if (intentName == "AMAZON.CancelIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else {
        throw "Invalid intent"
    }
}

function onSessionEnded(sessionEndedRequest, session) {}

function getWelcomeResponse(callback) {
    var speechOutput = "Welcome! Ask about some currencies. You can say: \"Convert 5 dollars to euros\" or \"Compare the currencies of: USD, EUROS, and POUNDS\""

    var reprompt = "Ask about some currencies."

    var header = "Currency Converter"

    var shouldEndSession = false

    var sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, speechOutput, reprompt, shouldEndSession))

}

function handleGetHelpRequest(intent, session, callback) {
    if (!session.attributes) {
        session.attributes = {}
    }

    var speechOutput = "You can say: \"Convert 1,000 yen to dollars\", or, \"How many euro in a dollar?\". The currencies you can convert currently are: Australian dollars, Bulgarian leva, Brazilian reals, Canadian dollars, Swiss francs, Chinese yuan, Czech korunas, Danish kroner, British pounds, Hong Kong dollars, Croatian kunas, Hungarian forint, Indonesian rupiah, Israeli shekels, Indian rupees, Japanese yen, South Korean won, Mexican pesos, Malaysian ringgits, Norwegian kroner, New Zealand dollars, Polish zloty, Romanian lei, Russian rubles, Swedish kronur, Singapore dollars, Thai baht, Turkish liras, South African rands, US dollars, and euros. If you have suggestions for new currencies, please include them in your review of this skill and I will implement them in the next update. Currency Converter is using fixer.io for exchange rates and currency conversion. Currencies are updated daily around 4PM CET, and based off rates published by the European Central Bank."
    var speechCardOutput = "\"Convert 5 dollars and 20 cents to euros\"\n\"How much is 1,000 yen in dollars\"\n\"How many kronas in a pound\"\nCurrency Support:\nAustralian dollars\nBulgarian leva\nBrazilian reals\nCanadian dollars\nSwiss francs\nChinese yuan\nCzech korunas\nDanish kroner\nBritish pounds\nHong Kong dollars\nCroatian kunas\nHungarian forint\nIndonesian rupiah\nIsraeli shekels\nIndian rupees\nJapanese yen\nSouth Korean won\nMexican pesos\nMalaysian ringgits\nNorwegian kroner\nNew Zealand dollars\nPolish zloty\nRomanian lei\nRussian rubles\nSwedish kronur\nSingapore dollars\nThai baht\nTurkish liras\nSouth African rands\nUS dollars\neuros.\nUsing http://fixer.io/ API.\nCurrencies updated 4PM CET daily."

    callback(session.attributes, buildSpeechletResponse('General Help', speechCardOutput, speechOutput, speechOutput, false))
}

function handleConvertResponse(intent, session, callback) {

    var speechOutput = "There's an error, sorry."
    var unit = getCode(intent.slots.unit.value)
    var unit2 = getCode(intent.slots.unit_b.value)
    var num = parseInt(intent.slots.num.value)
    var num2 = parseInt(intent.slots.num_b.value)
    if (!num) num = 1
    if (!num2) num2 = 0
    var amt = num + (num2 * .01)
    var header = "Conversion Results"
    getJSON(unit, function (data) {
        if (!unit || !unit2) {
            speechOutput = 'There was an error when interpretting your currency.'
            cardSpeechOutput = 'There was an error when interpretting your currency.'
        } else if (unit2 == 'XXX') {
            speechOutput = 'Please rephrase and include whether you want to convert Norwegian kroner or Danish kroner.'
        } else if (data != "ERROR") {
            if (data[unit2]) {
                var amt2 = (amt * data[unit2]).toFixed(2)
                var amt2_a = (amt2 > 0) ? Math.floor(amt2) : Math.ceil(amt2)
                var amt2_b = (amt2 % 1).toFixed(2)
                num2 *= .01
                speechOutput = num
                cardSpeechOutput = (num + num2)
                if (num > 1 || num < 1) {
                    if (num2 == 0) {
                        speechOutput += ' ' + currencyTypes[unit][0] + ' is ' + amt2_a
                        cardSpeechOutput += ' ' + currencyTypes[unit][0] + ' is ' + (parseInt(amt2_a) + parseFloat(amt2_b))
                    } else {
                        speechOutput += ' ' + currencyTypes[unit][0] + ' and ' + (num2 * 100).toFixed() + ' ' + subCurrencies[unit] + ' is ' + amt2_a
                        cardSpeechOutput += ' ' + currencyTypes[unit][0] + ' is ' + (parseInt(amt2_a) + parseFloat(amt2_b))
                    }
                } else {
                    if (pluralForm.indexOf(unit) > -1) {
                        if (num2 == 0) {
                            speechOutput += ' ' + currencyTypes[unit][0] + ' is ' + amt2_a
                            cardSpeechOutput += ' ' + currencyTypes[unit][0] + ' is ' + (parseInt(amt2_a) + parseFloat(amt2_b))
                        } else {
                            speechOutput += ' ' + currencyTypes[unit][0] + ' and ' + (num2 * 100).toFixed() + ' ' + subCurrencies[unit] + ' is ' + amt2_a
                            cardSpeechOutput += ' ' + currencyTypes[unit][0] + ' is ' + (parseInt(amt2_a) + parseFloat(amt2_b))
                        }
                    } else {
                        if (num2 == 0) {
                            speechOutput += ' ' + currencyTypes[unit][1] + ' is ' + amt2_a
                            cardSpeechOutput += ' ' + currencyTypes[unit][1] + ' is ' + (parseInt(amt2_a) + parseFloat(amt2_b))
                        } else {
                            speechOutput += ' ' + currencyTypes[unit][1] + ' and ' + (num2 * 100).toFixed() + ' ' + subCurrencies[unit] + ' is ' + amt2_a
                            cardSpeechOutput += ' ' + currencyTypes[unit][1] + ' is ' + (parseInt(amt2_a) + parseFloat(amt2_b))
                        }
                    }
                }
                if (amt2_a > 1 || amt2_a < 1) {
                    if (amt2_b == 0) {
                        speechOutput += ' ' + currencyTypes[unit2][0]
                        cardSpeechOutput += ' ' + currencyTypes[unit2][0]
                    } else {
                        speechOutput += ' ' + currencyTypes[unit2][0] + ' and ' + (amt2_b * 100).toFixed() + ' ' + subCurrencies[unit2]
                        cardSpeechOutput += ' ' + currencyTypes[unit2][0]
                    }
                } else {
                    if (pluralForm.indexOf(unit2) > -1) {
                        if (amt2_b == 0) {
                            speechOutput += ' ' + currencyTypes[unit2][0]
                            cardSpeechOutput += ' ' + currencyTypes[unit2][0]
                        } else {
                            speechOutput += ' ' + currencyTypes[unit2][0] + ' and ' + (amt2_b * 100).toFixed() + ' ' + subCurrencies[unit2]
                            cardSpeechOutput += ' ' + currencyTypes[unit2][0]
                        }
                    } else {
                        if (amt2_b == 0) {
                            speechOutput += ' ' + currencyTypes[unit2][1]
                            cardSpeechOutput += ' ' + currencyTypes[unit2][1]
                        } else {
                            speechOutput += ' ' + currencyTypes[unit2][1] + ' and ' + (amt2_b * 100).toFixed() + ' ' + subCurrencies[unit2]
                            cardSpeechOutput += ' ' + currencyTypes[unit2][1]
                        }
                    }
                }
            } else {
                speechOutput = 'There was an error when interpretting your currency.'
                cardSpeechOutput = 'There was an error when interpretting your currency.'
            }
        }
        callback(session.attributes, buildSpeechletResponse(header, cardSpeechOutput, speechOutput, "", true))
    })
}

function getCode(speech) {
    var answer
    for (var code in currencyTypes) {
        if (speech.toUpperCase() == code) return code
        else
            currencyTypes[code].forEach((slang) => {
                if (speech.toLowerCase() == slang) {
                    answer = code
                }
            })
    }
    return answer
}

function getJSON(base, callback) {
    request.get({
        url: "http://api.fixer.io/latest?base=" + base,
    }, function (error, response, body) {
        var d = JSON.parse(body)
        if (d.error) {
            callback("ERROR")
        } else {
            var rates = d.rates
            callback(rates)
        }
    })
}

function buildSpeechletResponse(title, cardoutput, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: cardoutput
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
