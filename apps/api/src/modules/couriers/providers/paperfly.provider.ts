import { BaseCourierProvider } from "./base.provider.js";

export class PaperflyProvider extends BaseCourierProvider {
  readonly slug = "paperfly" as const;
  readonly name = "Paperfly";
  protected requiredCredentialKeys = ["username", "password", "merchantId"];
}
