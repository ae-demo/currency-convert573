import currency_api.exchangerate;
import ballerina/time;

// The exchange-rate-service client. Construction only wires the base URL
// (the pinned openapi.yaml's default `https://api.exchangerate.host`); the
// access key is sent per request, so this client can be created even when
// EXCHANGERATE_HOST_ACCESS_KEY is empty in this environment.
final exchangerate:Client exchangerateClient = check new ();

# Fetches the current rate for the pair from exchange-rate-service and
# converts the amount. A live call may legitimately fail (for example an
# unset access key); that surfaces as an `error`, mapped by the resource
# function to a 500 rather than crashing the service.
#
# + sourceCurrency - ISO 4217 code to convert from
# + targetCurrency - ISO 4217 code to convert to
# + amount - amount in the source currency
# + return - the completed conversion, or an error from the upstream call
function convertAmount(string sourceCurrency, string targetCurrency, decimal amount) returns Conversion|error {
    exchangerate:inline_response_200 result = check exchangerateClient->/convert.get(
        access_key = exchangerateHostAccessKey,
        'from = sourceCurrency,
        to = targetCurrency,
        amount = amount
    );

    boolean? success = result?.success;
    if success is boolean && !success {
        return error("exchange-rate-service reported an unsuccessful conversion");
    }

    // The `info` object's rate field name depends on the upstream API
    // plan/tier: current exchangerate.host plans return `rate`, while
    // legacy plans backed by currencylayer.com (the `terms`/`privacy` URLs
    // in the response identify these) return `quote` instead. Accept
    // whichever is present rather than assuming a single shape.
    record {decimal rate?; decimal quote?;}? info = result?.info;
    decimal? rate = info is record {} ? (info?.rate ?: info?.quote) : ();
    decimal? convertedAmount = result?.result;
    if rate is () || convertedAmount is () {
        return error("exchange-rate-service returned an incomplete conversion result");
    }

    return {
        sourceCurrency: sourceCurrency,
        targetCurrency: targetCurrency,
        amount: amount,
        rate: rate,
        convertedAmount: convertedAmount,
        convertedAt: time:utcToString(time:utcNow())
    };
}
