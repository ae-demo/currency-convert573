import { useEffect, useState, type JSX } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { ArrowRightLeft } from "@wso2/oxygen-ui-icons-react";
import { currencyApi } from "../api";
import { ForbiddenError } from "../authz/client";
import { Can } from "../authz/gates";
import type { components } from "../generated/currency-api";

type Currency = components["schemas"]["Currency"];
type Conversion = components["schemas"]["Conversion"];

/**
 * The Converter screen (wireframes.dsl): a card "Convert" with a row of two
 * currency selects, an amount input, a primary "Convert" button that computes
 * in place, then a divider and the converted amount + rate used (badge "Live
 * rate" info) rendered below on the SAME screen — no navigation.
 */
export function ConverterPage(): JSX.Element {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sourceCurrency, setSourceCurrency] = useState("");
  const [targetCurrency, setTargetCurrency] = useState("");
  const [amount, setAmount] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [result, setResult] = useState<Conversion | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const { data, error } = await currencyApi.GET("/currencies");
        if (!live) return;
        if (error) {
          setLoadError(error.message);
          return;
        }
        const list = data?.data ?? [];
        setCurrencies(list);
        if (list.length > 0) {
          setSourceCurrency(list[0].code);
          setTargetCurrency(list[1]?.code ?? list[0].code);
        }
      } catch (err) {
        if (!live) return;
        // A ForbiddenError here means the caller's session lacks the scope
        // this screen's route guard already required, which cannot happen —
        // but a network failure or a stale bundle still lands here.
        setLoadError(
          err instanceof ForbiddenError
            ? err.message
            : "Could not load the supported currency list. Try reloading the page.",
        );
      } finally {
        if (live) setLoadingCurrencies(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  function validateAmount(value: string): string | null {
    if (value.trim() === "") return "Enter an amount.";
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return "Enter a positive number.";
    }
    return null;
  }

  async function handleConvert(): Promise<void> {
    const validation = validateAmount(amount);
    setAmountError(validation);
    if (validation) return;

    setSubmitting(true);
    setSubmitError(null);
    setResult(null);
    try {
      const { data, error, response } = await currencyApi.POST("/conversions", {
        body: {
          sourceCurrency,
          targetCurrency,
          amount: Number(amount),
        },
      });
      if (error) {
        if (response.status === 400) {
          setSubmitError(error.message || "That amount or currency pair is invalid.");
        } else {
          setSubmitError(error.message || "The conversion could not be completed.");
        }
        return;
      }
      if (data) setResult(data);
    } catch (err) {
      setSubmitError(
        err instanceof ForbiddenError
          ? err.message
          : "The conversion could not be completed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Converter</PageTitle.Header>
        <PageTitle.SubHeader>Convert an amount between two currencies</PageTitle.SubHeader>
      </PageTitle>

      <Card sx={{ maxWidth: 560 }}>
        <CardHeader title="Convert" />
        <CardContent>
          {loadError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          ) : null}

          {loadingCurrencies ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  label="Source currency"
                  value={sourceCurrency}
                  onChange={(e) => setSourceCurrency(e.target.value)}
                  fullWidth
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.code} — {currency.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Target currency"
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  fullWidth
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.code} — {currency.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <TextField
                label="Amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError(null);
                }}
                error={amountError !== null}
                helperText={amountError ?? " "}
                inputMode="decimal"
              />

              {submitError ? <Alert severity="error">{submitError}</Alert> : null}

              <Can op="POST /conversions">
                <Button
                  variant="contained"
                  startIcon={<ArrowRightLeft size={18} />}
                  onClick={() => void handleConvert()}
                  disabled={submitting || currencies.length === 0}
                >
                  {submitting ? "Converting…" : "Convert"}
                </Button>
              </Can>

              {result ? (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Converted amount
                    </Typography>
                    <Typography variant="h4">
                      {result.convertedAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 4,
                      })}{" "}
                      {result.targetCurrency}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography color="text.secondary">
                      Rate used: 1 {result.sourceCurrency} = {result.rate} {result.targetCurrency}
                    </Typography>
                    <Chip label="Live rate" color="info" size="small" />
                  </Stack>
                </>
              ) : null}
            </Stack>
          )}
        </CardContent>
      </Card>
    </PageContent>
  );
}
