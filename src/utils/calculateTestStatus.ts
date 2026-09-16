export const calculateTestStatus = (
  tests: string[],
): "PENDING" | "TESTED" | "FAILED" => {
  if (tests.some((test) => test === "POSITIVE")) {
    return "FAILED";
  }

  if (tests.every((test) => test === "NEGATIVE")) {
    return "TESTED";
  }

  return "PENDING";
};
