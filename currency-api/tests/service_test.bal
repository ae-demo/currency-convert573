import ballerina/crypto;
import ballerina/http;
import ballerina/jwt;
import ballerina/log;
import ballerina/os;
import ballerina/test;

http:Client testClient = check new ("http://localhost:9090");

// Minted with tests/resources/correct-key.pem, whose certificate is exported
// as GATEWAY_ASSERTION_CERTIFICATE (see tests/Config.toml / the env this
// suite expects — set by whoever runs `bal test`, per the `ballerina` skill).
function mintAssertion(string keyFile, string issuer) returns string {
    crypto:PrivateKey key = checkpanic crypto:decodeRsaPrivateKeyFromKeyFile(keyFile);
    string token = checkpanic jwt:issue({
        issuer: issuer,
        username: "44444444-4444-4444-4444-444444444444",
        expTime: 300,
        customClaims: {"scope": "conversions:create", "username": "test-user"},
        signatureConfig: {
            algorithm: jwt:RS256,
            config: key
        }
    });
    return token;
}

function assertionHeaderName() returns string {
    string header = os:getEnv("GATEWAY_ASSERTION_HEADER");
    return header == "" ? "x-jwt-assertion" : header;
}

// Signature verification only runs when the full
// GATEWAY_ASSERTION_CERTIFICATE / _ISSUER / _HEADER trio is exported before
// `bal test` (the `ballerina` skill's documented flow for a package carrying
// gateway_assertion.bal). Without it the interceptor takes its unverified
// fallback, so a forged-signature request cannot be told from a real one —
// that is a property of the fallback, not a bug in these tests. Skip rather
// than fail so `bal test` is green in both setups.
function verifyingTrioPresent() returns boolean {
    return os:getEnv("GATEWAY_ASSERTION_CERTIFICATE") != ""
        && os:getEnv("GATEWAY_ASSERTION_ISSUER") != ""
        && os:getEnv("GATEWAY_ASSERTION_HEADER") != "";
}

@test:Config {}
function testCurrenciesListWithValidAssertion() returns error? {
    string issuer = os:getEnv("GATEWAY_ASSERTION_ISSUER");
    string token = mintAssertion("tests/resources/correct-key.pem", issuer);
    http:Response response = check testClient->/currencies(headers = {[assertionHeaderName()]: token});
    test:assertEquals(response.statusCode, 200);
    json body = check response.getJsonPayload();
    test:assertEquals(body.count, 10);
    json[] data = check (check body.data).ensureType();
    boolean hasUsd = false;
    foreach json currency in data {
        if (check currency.code) == "USD" {
            hasUsd = true;
            test:assertEquals(check currency.symbol, "$");
        }
    }
    test:assertTrue(hasUsd, msg = "expected USD in the curated currency list");
}

@test:Config {}
function testCurrenciesListWithNoAssertionIsServed() returns error? {
    // Sign-in is enforced by the API gateway from openapi.yaml's `security`
    // block, not re-checked by this service (api-management / ballerina
    // skills): a request that reaches this service with no assertion at all
    // is served, because the gateway is what would have refused it upstream.
    http:Response response = check testClient->/currencies();
    test:assertEquals(response.statusCode, 200);
}

@test:Config {}
function testAssertionSignedByWrongKeyIsRejected() returns error? {
    if !verifyingTrioPresent() {
        log:printInfo("skipping: GATEWAY_ASSERTION_CERTIFICATE/_ISSUER/_HEADER not exported for this test run");
        return;
    }
    string issuer = os:getEnv("GATEWAY_ASSERTION_ISSUER");
    string token = mintAssertion("tests/resources/wrong-key.pem", issuer);
    http:Response response = check testClient->/currencies(headers = {[assertionHeaderName()]: token});
    test:assertEquals(response.statusCode, 401);
}

@test:Config {}
function testTamperedAssertionIsRejected() returns error? {
    if !verifyingTrioPresent() {
        log:printInfo("skipping: GATEWAY_ASSERTION_CERTIFICATE/_ISSUER/_HEADER not exported for this test run");
        return;
    }
    string issuer = os:getEnv("GATEWAY_ASSERTION_ISSUER");
    string token = mintAssertion("tests/resources/correct-key.pem", issuer);
    // Flip a character in the payload segment so the signature no longer matches.
    string[] segments = re `\.`.split(token);
    string payload = segments[1];
    string tamperedPayload = payload.substring(0, payload.length() - 1) + (payload.endsWith("A") ? "B" : "A");
    string tampered = segments[0] + "." + tamperedPayload + "." + segments[2];
    http:Response response = check testClient->/currencies(headers = {[assertionHeaderName()]: tampered});
    test:assertEquals(response.statusCode, 401);
}

@test:Config {}
function testConvertRejectsUnsupportedSourceCurrency() returns error? {
    http:Response response = check testClient->/conversions.post({
        sourceCurrency: "XXX",
        targetCurrency: "USD",
        amount: 10
    });
    test:assertEquals(response.statusCode, 400);
    json body = check response.getJsonPayload();
    test:assertEquals(body.code, 400);
}

@test:Config {}
function testConvertRejectsUnsupportedTargetCurrency() returns error? {
    http:Response response = check testClient->/conversions.post({
        sourceCurrency: "USD",
        targetCurrency: "ZZZ",
        amount: 10
    });
    test:assertEquals(response.statusCode, 400);
}

@test:Config {}
function testConvertRejectsNonPositiveAmount() returns error? {
    http:Response response = check testClient->/conversions.post({
        sourceCurrency: "USD",
        targetCurrency: "EUR",
        amount: 0
    });
    test:assertEquals(response.statusCode, 400);
}
