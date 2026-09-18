import ballerina/os;

# The exchange-rate-service (exchangerate.host) access key. May be empty in an
# environment where the external dependency has not been provisioned yet — a
# conversion request then fails at the live call, which is expected, not a
# crash of this service.
configurable string exchangerateHostAccessKey = os:getEnv("EXCHANGERATE_HOST_ACCESS_KEY");
