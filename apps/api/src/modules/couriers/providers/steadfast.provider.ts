import { BaseCourierProvider } from "./base.provider.js";

export class SteadfastProvider extends BaseCourierProvider {
  readonly slug = "steadfast" as const;
  readonly name = "Steadfast";
  protected requiredCredentialKeys = ["apiKey", "secretKey"];
}
