screen Converter "Convert an amount between two currencies"
  navbar "Currency Converter"
  card "Convert"
    row
      select "Source currency"
      select "Target currency"
    input "Amount"
    button "Convert" primary // computes in place, result renders below on the same screen
    divider
    text "Converted amount"
    row
      text "Rate used"
      badge "Live rate" info

flow "Convert currency"
  role "User"
  description "A signed-in user converts an amount from one currency to another"
  Converter
