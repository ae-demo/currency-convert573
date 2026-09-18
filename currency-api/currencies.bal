// The curated shortlist of major currencies this service offers, per
// specs/design/domain-model.md ("curated shortlist of major currencies the
// app offers in its pickers"). Fixed, in-service, not persisted.
final readonly & Currency[] CURRENCIES = [
    {code: "USD", name: "US Dollar", symbol: "$"},
    {code: "EUR", name: "Euro", symbol: "€"},
    {code: "GBP", name: "British Pound", symbol: "£"},
    {code: "JPY", name: "Japanese Yen", symbol: "¥"},
    {code: "AUD", name: "Australian Dollar", symbol: "$"},
    {code: "CAD", name: "Canadian Dollar", symbol: "$"},
    {code: "CHF", name: "Swiss Franc", symbol: "Fr"},
    {code: "CNY", name: "Chinese Yuan", symbol: "¥"},
    {code: "INR", name: "Indian Rupee", symbol: "₹"},
    {code: "SGD", name: "Singapore Dollar", symbol: "$"}
];

# The curated currency whose code matches, case-insensitively.
#
# + code - an ISO 4217 code as supplied by a caller
# + return - the matching currency, or `()` when the code is not supported
function findCurrency(string code) returns Currency? {
    string normalized = code.toUpperAscii();
    foreach Currency currency in CURRENCIES {
        if currency.code == normalized {
            return currency;
        }
    }
    return ();
}
